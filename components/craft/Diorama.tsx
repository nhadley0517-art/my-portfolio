"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";

/* A floating island of a landscape, in 3D pixel art: a real three.js scene,
   modelled piece by piece, seen through an isometric camera, rendered at a
   third of its on-screen size and scaled up with hard pixels.

   What makes it read as pixel art rather than low-res 3D:
   - stepped "toon" lighting: two or three flat tones per surface,
   - flat-shaded terrain, so mountains break into crisp lit and shadowed facets,
   - a post pass that darkens a pixel wherever one thing sits in front of
     another and brightens top edges, like a pixel artist's line work.

   The land is one height field: snowy peaks along the back, a stream running
   down into a pond, rolling meadow in front. On it: a log cabin, a campfire
   with someone and their dog, a dock, mixed trees, mossy rocks and logs, and
   grass that sways in slow waves. Lighting follows the time in Reno (day,
   golden hour, night), and hovering the banner gets a wave. */

const PX = 3;

type TimeOfDay = "day" | "golden" | "night";

const forcedTime = (): TimeOfDay | null => {
  const f = new URLSearchParams(window.location.search).get("tod");
  return f === "day" || f === "golden" || f === "night" ? f : null;
};

function renoTimeOfDay(): TimeOfDay {
  const forced = forcedTime();
  if (forced) return forced;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  const h = (Number(parts.find((p) => p.type === "hour")?.value ?? 12) % 24) + Number(parts.find((p) => p.type === "minute")?.value ?? 0) / 60;
  if (h >= 20 || h < 6) return "night";
  if (h >= 17.5 || h < 8) return "golden";
  return "day";
}

const renoClock = () => new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" }).format(new Date());

const TOD_LABEL: Record<TimeOfDay, { name: string; dot: string }> = {
  day: { name: "Daytime", dot: "#F5B82E" },
  golden: { name: "Golden hour", dot: "#F0743A" },
  night: { name: "Nighttime", dot: "#5B6CF0" },
};

export default function Diorama({ height = 320 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<{ time: string; tod: TimeOfDay; forced: boolean } | null>(null);

  // The light follows the clock in Reno; say so, and keep the time current.
  useEffect(() => {
    const tick = () => setClock({ time: renoClock(), tod: renoTimeOfDay(), forced: !!forcedTime() });
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);

  // The scene is rebuilt when Reno crosses into a new part of the day.
  const sceneTod = clock?.tod;
  useEffect(() => {
    if (!sceneTod) return;
    const host = ref.current!;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tod: TimeOfDay = sceneTod;
      const night = tod === "night";

      // ---------- helpers ----------
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const col = (h: string) => new THREE.Color(h);
      const ramp = new THREE.DataTexture(new Uint8Array([80, 160, 255]), 3, 1, THREE.RedFormat);
      ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
      ramp.needsUpdate = true;
      const mats = new Map<string, T.MeshToonMaterial>();
      const toon = (c: string) => {
        if (!mats.has(c)) mats.set(c, new THREE.MeshToonMaterial({ color: col(c), gradientMap: ramp }));
        return mats.get(c)!;
      };
      const glow = (c: string) => new THREE.MeshBasicMaterial({ color: col(c) });
      const place = <M extends T.Object3D>(parent: T.Object3D, m: M, x = 0, y = 0, z = 0, cast = true) => {
        m.position.set(x, y, z);
        m.traverse((o) => {
          const mesh = o as T.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = cast;
            mesh.receiveShadow = true;
          }
        });
        parent.add(m);
        return m;
      };
      const box = (w: number, h: number, d: number, c: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c));
      const cyl = (rt: number, rb: number, h: number, c: string, seg = 7) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(c));
      const blob = (r: number, c: string) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), toon(c));

      // Value noise for terrain detail.
      const LAT = Float32Array.from({ length: 64 * 64 }, rnd);
      const vnoise = (x: number, y: number) => {
        const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        const at = (a: number, b: number) => LAT[(((b % 64) + 64) % 64) * 64 + (((a % 64) + 64) % 64)];
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
        return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
      };

      // ---------- renderer and pixel post pass ----------
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.BasicShadowMap;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "display:block;width:100%;height:100%;image-rendering:pixelated;";
      host.appendChild(canvas);
      const target = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        type: THREE.HalfFloatType,
        depthTexture: new THREE.DepthTexture(1, 1),
      });
      const post = new THREE.ShaderMaterial({
        uniforms: { tColor: { value: target.texture }, tDepth: { value: target.depthTexture }, uRes: { value: new THREE.Vector2(1, 1) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: `
          uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 uRes; varying vec2 vUv;
          float dep(vec2 o){ return texture2D(tDepth, vUv + o / uRes).x; }
          float alp(vec2 o){ return texture2D(tColor, vUv + o / uRes).a; }
          void main(){
            vec4 c = texture2D(tColor, vUv);
            if (c.a > 0.0) {
              float d = dep(vec2(0.0));
              float diff = max(max(dep(vec2(1.0,0.0)) - d, dep(vec2(-1.0,0.0)) - d), max(dep(vec2(0.0,1.0)) - d, dep(vec2(0.0,-1.0)) - d));
              if (diff > 0.004) c.rgb *= 0.6;
              else if (alp(vec2(0.0, 1.0)) == 0.0) c.rgb *= 1.2;
            }
            gl_FragColor = c;
            #include <colorspace_fragment>
          }`,
        transparent: true,
      });
      const postScene = new THREE.Scene();
      postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // ---------- scene, camera, lighting by time of day ----------
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
      camera.position.set(24, 20, 24);
      camera.lookAt(0, 2.9, 0);

      const LIGHT = {
        day: { sky: "#cfe8ff", ground: "#5e4a33", hemi: 1.15, sun: "#fff3da", sunI: 2.5, sunPos: [-8, 16, 6] },
        golden: { sky: "#ffd2a6", ground: "#4a3040", hemi: 0.95, sun: "#ffb46a", sunI: 2.6, sunPos: [-16, 7, 4] },
        night: { sky: "#3d4f86", ground: "#1c1a2c", hemi: 0.55, sun: "#9fb4ff", sunI: 0.7, sunPos: [10, 14, -6] },
      }[tod];
      scene.add(new THREE.HemisphereLight(col(LIGHT.sky), col(LIGHT.ground), LIGHT.hemi));
      const sun = new THREE.DirectionalLight(col(LIGHT.sun), LIGHT.sunI);
      sun.position.set(LIGHT.sunPos[0], LIGHT.sunPos[1], LIGHT.sunPos[2]);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 70 });
      sun.shadow.bias = -0.0015;
      scene.add(sun);

      // The island's long side runs across the banner.
      const world = new THREE.Group();
      world.rotation.y = Math.PI / 4;
      scene.add(world);

      // ---------- terrain ----------
      const RX = 19.5, RZ = 6.6;
      const rim = (a: number) => 1 + Math.sin(a * 3 + 1) * 0.035 + Math.sin(a * 9) * 0.025 + Math.sin(a * 17 + 2) * 0.015;
      const shapeR = (x: number, z: number) => {
        const a = Math.atan2(z / RZ, x / RX);
        const sx = Math.abs(x / RX), sz = Math.abs(z / RZ);
        return Math.pow(Math.pow(sx, 3.2) + Math.pow(sz, 2.4), 1 / 2.6) / rim(a);
      };
      const pond = { x: -7.4, z: 2.4, rx: 2.7, rz: 1.5 };
      const streamX = (z: number) => -8.6 + Math.sin(z * 1.1) * 0.7 + (z + 4.5) * 0.12;
      const peaks = [
        { x: -16.4, z: -4.8, h: 6.2, w: 3.4 },
        { x: -11.6, z: -5.4, h: 8.4, w: 4.2 },
        { x: -6.2, z: -5.3, h: 6.0, w: 3.4 },
        { x: -1.4, z: -5.6, h: 4.6, w: 3.0 },
        { x: 4.2, z: -5.3, h: 7.0, w: 3.8 },
        { x: 10.0, z: -5.5, h: 8.8, w: 4.4 },
        { x: 15.6, z: -4.8, h: 6.0, w: 3.4 },
      ];
      const terrainH = (x: number, z: number) => {
        const r = shapeR(x, z);
        // Gentle meadow swells, always above water level.
        let h = 0.3 + 0.12 * Math.sin(x * 0.42 + 1) + 0.1 * Math.cos(z * 0.7 + x * 0.21) + 0.2 * vnoise(x * 0.35 + 9, z * 0.35);
        let m = 0;
        for (const p of peaks) {
          const d = Math.hypot((x - p.x) / p.w, (z - p.z) / (p.w * 0.75));
          const v = p.h * Math.pow(Math.max(0, 1 - d), 1.35);
          if (v > m) m = v;
        }
        // Ridged detail so the slopes break into crags.
        if (m > 0.2) m += (Math.abs(vnoise(x * 1.1, z * 1.1) - 0.5) * 2 - 0.5) * Math.min(1, m) * 0.55;
        h += Math.max(0, m);
        const pd = Math.hypot((x - pond.x) / pond.rx, (z - pond.z) / pond.rz);
        if (pd < 1.25) h = Math.min(h, -0.35 + Math.max(0, pd - 0.85) * 1.2);
        if (z > -3.8 && z < pond.z) {
          const sd = Math.abs(x - streamX(z));
          if (sd < 0.75) h = Math.min(h, -0.3 + sd * 0.45);
        }
        // Settle down to the slab at the rim.
        return h * (1 - Math.pow(Math.min(1, r), 10));
      };

      // The grid reaches past the rim on every side, so the wobbly edge is
      // never sliced off by the grid's own straight border.
      const GX = RX * 1.12, GZ = RZ * 1.12;
      const NX = 180, NZ = 64;
      const pos: number[] = [], cols: number[] = [];
      // Meadow tones come in broad patches, not per-triangle speckle.
      const cGrass = [col("#538f33"), col("#5c9a36"), col("#66a53c")];
      const patch = (x: number, z: number) => vnoise(x * 0.32 + 3.1, z * 0.32 + 7.7) * 0.75 + vnoise(x * 0.9, z * 0.9) * 0.25;
      const cRock = col("#7c8796"), cRockDark = col("#5f6878"), cSnow = col("#f3f2ec"), cMoss = col("#5d8a3c");
      const cSand = col("#cdb37c"), cBed = col("#3c6a74"), cBank = col("#7a6a46");
      const cell = (ix: number, iz: number) => {
        const x = -GX + (ix / NX) * GX * 2, z = -GZ + (iz / NZ) * GZ * 2;
        return new THREE.Vector3(x, terrainH(x, z), z);
      };
      const n3 = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
      const tri = (a: T.Vector3, b: T.Vector3, c: T.Vector3) => {
        const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
        if (shapeR(cx, cz) > 1) return;
        const ch = (a.y + b.y + c.y) / 3;
        n3.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a)).normalize();
        if (n3.y < 0) n3.negate();
        const nz = vnoise(cx * 2.3, cz * 2.3);
        let k: T.Color;
        if (ch < -0.12) k = cBed;
        else if (ch < 0.04 && (Math.hypot((cx - pond.x) / pond.rx, (cz - pond.z) / pond.rz) < 1.5 || Math.abs(cx - streamX(cz)) < 1.1)) k = nz > 0.5 ? cSand : cBank;
        else if (ch > 4.6 + nz * 1.0 && n3.y > 0.3) k = cSnow;
        else if (ch > 1.1) k = n3.y < 0.6 ? cRockDark : ch < 2.2 && nz > 0.5 ? cMoss : cRock;
        else {
          const p = patch(cx, cz);
          k = cGrass[p < 0.4 ? 0 : p > 0.62 ? 2 : 1];
        }
        for (const v of [a, b, c]) {
          pos.push(v.x, v.y, v.z);
          cols.push(k.r, k.g, k.b);
        }
      };
      for (let iz = 0; iz < NZ; iz++) {
        for (let ix = 0; ix < NX; ix++) {
          const a = cell(ix, iz), b = cell(ix + 1, iz), c = cell(ix, iz + 1), d = cell(ix + 1, iz + 1);
          tri(a, c, b);
          tri(b, c, d);
        }
      }
      const terrain = new THREE.BufferGeometry();
      terrain.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      terrain.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      terrain.computeVertexNormals();
      place(world, new THREE.Mesh(terrain, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp })));

      // The island's earthy underside.
      // Layered like a cut-out of earth: a grass lip, soil, then darker stone.
      // The lip's top face sits just under the terrain and fills any gaps
      // along the rim, so no background shows through between grass and dirt.
      const rimPts: [number, number][] = [];
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        let lo = 0, hi = 2;
        for (let k = 0; k < 18; k++) {
          const mid = (lo + hi) / 2;
          if (shapeR(Math.cos(a) * RX * mid, Math.sin(a) * RZ * mid) > 1) hi = mid;
          else lo = mid;
        }
        rimPts.push([Math.cos(a) * RX * lo, Math.sin(a) * RZ * lo]);
      }
      const ring = (scale: number, wob: number) => rimPts.map(([x, z], i) => {
        const k = scale * (1 + Math.sin(i * 0.9) * wob + Math.sin(i * 2.3) * wob * 0.6);
        return new THREE.Vector2(x * k, z * k);
      });
      const layer = (scale: number, top: number, depth: number, capC: string, sideC: string, wob = 0, hole = 0) => {
        const sh = new THREE.Shape(ring(scale, wob));
        // The lip is only a band around the rim, so water in the middle shows.
        if (hole) sh.holes.push(new THREE.Path(ring(hole, 0).reverse()));
        const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
        g.rotateX(Math.PI / 2);
        place(world, new THREE.Mesh(g, [toon(capC), toon(sideC)]), 0, top, 0, false);
      };
      layer(1.0, -0.03, 0.16, "#538f33", "#4a8530", 0, 0.9);
      layer(0.995, -0.16, 0.5, "#6b4a2c", "#6b4a2c", 0.004);
      layer(0.95, -0.66, 0.34, "#4f3a2a", "#4f3a2a", 0.012);
      layer(0.84, -1.0, 0.22, "#3d3029", "#3d3029", 0.02);

      // ---------- water ----------
      const uTime = { value: 0 };
      const waterMat = new THREE.ShaderMaterial({
        uniforms: { uTime, cDeep: { value: col(night ? "#24406a" : "#3d86ad") }, cLight: { value: col(night ? "#6f8fd0" : "#a8dcef") } },
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `uniform float uTime; uniform vec3 cDeep; uniform vec3 cLight; varying vec3 vW;
          void main(){
            float r = sin(vW.x * 5.0 + uTime * 1.2 + sin(vW.z * 3.0 + uTime * 0.7) * 1.5) * sin(vW.z * 7.0 - uTime * 0.9);
            vec3 c = r > 0.72 ? cLight : cDeep;
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      const pondMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 40), waterMat);
      pondMesh.scale.set(pond.rx * 1.12, pond.rz * 1.12, 1);
      pondMesh.rotation.x = -Math.PI / 2;
      place(world, pondMesh, pond.x, -0.06, pond.z, false);
      for (let z = -3.7; z < pond.z; z += 0.32) {
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.42), waterMat);
        seg.rotation.x = -Math.PI / 2;
        seg.rotation.z = -Math.atan2(streamX(z + 0.3) - streamX(z), 0.3);
        place(world, seg, streamX(z), -0.06, z + 0.16, false);
      }
      // Dock, reeds and lily pads.
      const dock = new THREE.Group();
      for (let i = 0; i < 6; i++) place(dock, box(0.26, 0.06, 1.0, i % 2 ? "#a77a4a" : "#946a3f"), i * 0.28, 0.12, 0);
      for (const [x, z] of [[0, -0.45], [0, 0.45], [1.4, -0.45], [1.4, 0.45]]) place(dock, cyl(0.05, 0.05, 0.5, "#6b4a2c"), x, -0.08, z);
      dock.rotation.y = -0.3;
      place(world, dock, pond.x + 0.6, 0, pond.z + 0.2);
      for (let i = 0; i < 26; i++) {
        const a = rnd() * Math.PI * 2;
        const x = pond.x + Math.cos(a) * pond.rx * (1.02 + rnd() * 0.15), z = pond.z + Math.sin(a) * pond.rz * (1.02 + rnd() * 0.15);
        if (Math.cos(a) > 0.2 && Math.sin(a) > -0.3) continue;
        const reed = cyl(0.025, 0.03, 0.5 + rnd() * 0.4, rnd() > 0.5 ? "#3f6e2c" : "#55823a", 4);
        place(world, reed, x, 0.2, z);
        if (rnd() > 0.6) place(world, cyl(0.045, 0.045, 0.14, "#6b4426", 5), x, 0.5, z);
      }
      for (let i = 0; i < 5; i++) place(world, cyl(0.16, 0.16, 0.02, "#4e8a3a", 7), pond.x - 1.4 + rnd() * 1.6, -0.04, pond.z - 0.5 + rnd() * 1.0, false);
      const fish = place(world, box(0.18, 0.08, 0.06, "#e8823a"), pond.x - 0.6, -1, pond.z, false);

      // ---------- trees, rocks, moss ----------
      const groundAt = (x: number, z: number) => terrainH(x, z);
      const pine = (x: number, z: number, s: number, tall = false) => {
        const g = new THREE.Group();
        place(g, cyl(0.07 * s, 0.11 * s, 0.6 * s, "#5a3a22"), 0, 0.3 * s);
        const greens = ["#2a5f36", "#346f3e", "#3f8047", "#4a8f4c"];
        const n = tall ? 4 : 3;
        for (let i = 0; i < n; i++) place(g, new THREE.Mesh(new THREE.ConeGeometry((0.66 - i * 0.13) * s, 0.8 * s, 8), toon(greens[i])), 0, (0.7 + i * 0.42) * s);
        g.rotation.y = rnd() * Math.PI;
        place(world, g, x, groundAt(x, z) - 0.02, z);
      };
      const leafy = (x: number, z: number, s: number, palette: string[], bark = "#6b4428", birch = false) => {
        const g = new THREE.Group();
        const trunkH = 0.95 * s;
        place(g, cyl(0.07 * s, 0.11 * s, trunkH, bark), 0, trunkH / 2);
        if (birch) for (let i = 0; i < 4; i++) place(g, box(0.15 * s, 0.03 * s, 0.15 * s, "#2b2b2b"), 0, trunkH * (0.2 + i * 0.2), 0);
        for (let i = 0; i < 5; i++) place(g, blob((0.36 + rnd() * 0.18) * s, palette[i % palette.length]), (rnd() - 0.5) * 0.6 * s, trunkH + (rnd() * 0.45) * s, (rnd() - 0.5) * 0.5 * s);
        g.rotation.y = rnd() * Math.PI;
        place(world, g, x, groundAt(x, z) - 0.02, z);
      };
      const oak = ["#3f7d33", "#4b8f39", "#5ba142"];
      const birch = ["#9cc451", "#b4d65d", "#86b346"];
      const maple = ["#d9772f", "#e8963a", "#c45a26"];
      // Forest fringe at the foot of the mountains.
      for (let i = 0; i < 70; i++) {
        const x = (rnd() * 2 - 1) * (RX - 2.2);
        const z = -3.2 - rnd() * 1.6 + Math.abs(x / RX) * 1.2;
        if (shapeR(x, z) > 0.9 || terrainH(x, z) > 1.4 || terrainH(x, z) < 0.15) continue;
        if (Math.abs(x - streamX(z)) < 1.0) continue;
        const k = rnd();
        if (k < 0.55) pine(x, z, 0.8 + rnd() * 0.6, rnd() > 0.6);
        else if (k < 0.75) leafy(x, z, 0.8 + rnd() * 0.4, oak);
        else if (k < 0.88) leafy(x, z, 0.75 + rnd() * 0.3, birch, "#e8e4da", true);
        else leafy(x, z, 0.8 + rnd() * 0.3, maple);
      }
      // A few feature trees out in the meadow.
      leafy(-12.8, 1.2, 1.25, oak);
      leafy(12.6, 1.6, 1.15, maple);
      leafy(15.4, -0.4, 1.0, birch, "#e8e4da", true);
      pine(-15.6, 1.4, 1.2, true);
      pine(16.6, 2.2, 1.0);
      leafy(-3.6, 4.6, 0.9, oak);
      // Mossy boulders.
      const boulder = (x: number, z: number, s: number) => {
        const g = new THREE.Group();
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s), toon("#878f96"));
        r.scale.y = 0.7;
        place(g, r, 0, s * 0.35);
        const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(s * 0.82), toon("#5f9a3c"));
        moss.scale.y = 0.35;
        place(g, moss, -s * 0.12, s * 0.62);
        g.rotation.y = rnd() * Math.PI;
        place(world, g, x, groundAt(x, z), z);
      };
      for (const [x, z, s] of [[-10.6, 3.6, 0.42], [-4.6, 1.0, 0.3], [7.8, 3.8, 0.38], [13.8, 4.4, 0.32], [-14.2, 3.4, 0.36], [2.4, -1.8, 0.34], [-17.2, -0.4, 0.3]] as const) boulder(x, z, s);
      // A mossy fallen log.
      const fallen = new THREE.Group();
      const logM = cyl(0.17, 0.19, 1.8, "#6e4628", 8);
      logM.rotation.z = Math.PI / 2;
      place(fallen, logM, 0, 0.17);
      const logMoss = cyl(0.12, 0.14, 1.2, "#5f9a3c", 8);
      logMoss.rotation.z = Math.PI / 2;
      place(fallen, logMoss, -0.15, 0.28);
      fallen.rotation.y = 0.5;
      place(world, fallen, 9.4, groundAt(9.4, 2.6), 2.6);

      // ---------- cabin ----------
      const cabin = new THREE.Group();
      const CW = 2.8, CD = 2.2, rows = 7, logR = 0.11;
      place(cabin, box(CW + 0.5, 0.18, CD + 0.5, "#6e4b2e"), 0, 0.09);
      for (let r = 0; r < rows; r++) {
        const y = 0.28 + r * logR * 1.9;
        const shade = r % 2 ? "#9b6a3f" : "#8a5c35";
        for (const s of [-1, 1]) {
          const fb = cyl(logR, logR, CW + 0.3, shade);
          fb.rotation.z = Math.PI / 2;
          place(cabin, fb, 0, y, s * (CD / 2));
          const lr = cyl(logR, logR, CD + 0.3, shade);
          lr.rotation.x = Math.PI / 2;
          place(cabin, lr, s * (CW / 2), y + 0.1, 0);
        }
      }
      const wallTop = 0.28 + rows * logR * 1.9;
      place(cabin, box(CW - 0.1, wallTop, CD - 0.1, "#7d5331"), 0, wallTop / 2);
      const gable = new THREE.Shape([new THREE.Vector2(-CD / 2 - 0.1, 0), new THREE.Vector2(CD / 2 + 0.1, 0), new THREE.Vector2(0, 1.05)]);
      const gableMat = new THREE.MeshToonMaterial({ color: col("#8a5c35"), gradientMap: ramp, side: THREE.DoubleSide });
      for (const s of [-1, 1]) {
        const g = new THREE.Mesh(new THREE.ShapeGeometry(gable), gableMat);
        g.rotation.y = Math.PI / 2;
        place(cabin, g, s * (CW / 2 + 0.02), wallTop);
      }
      const pitch = Math.atan2(1.05, CD / 2 + 0.1);
      const slope = Math.hypot(1.05, CD / 2 + 0.1) + 0.45;
      for (const s of [-1, 1]) {
        const roof = new THREE.Group();
        for (let k = 0; k < 6; k++) place(roof, box(CW + 0.9, 0.12, slope / 6 + 0.06, k % 2 ? "#d9b46a" : "#c9a05a"), 0, k * 0.012, (k - 2.5) * (slope / 6));
        roof.rotation.x = s * pitch;
        place(cabin, roof, 0, wallTop + 0.5, s * ((CD / 2 + 0.1) / 2 + 0.05));
      }
      const ridge = cyl(0.09, 0.09, CW + 1, "#a9844a");
      ridge.rotation.z = Math.PI / 2;
      place(cabin, ridge, 0, wallTop + 1.06);
      place(cabin, box(0.62, 1.05, 0.08, "#4a2e1a"), 0.55, 0.72, CD / 2 + 0.12);
      place(cabin, box(0.5, 0.93, 0.06, "#6b4126"), 0.55, 0.68, CD / 2 + 0.15);
      const windowMat = glow(night ? "#ffcf6a" : "#ffd88a");
      place(cabin, box(0.6, 0.48, 0.08, "#3d2616"), -0.65, 0.95, CD / 2 + 0.12);
      place(cabin, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.06), windowMat), -0.65, 0.95, CD / 2 + 0.16, false);
      for (let k = 0; k < 6; k++) place(cabin, box(0.42 - (k % 2) * 0.06, 0.2, 0.42, k % 2 ? "#8d8a84" : "#7a7771"), -0.95, wallTop + 0.4 + k * 0.2, -0.45);
      const lantern = new THREE.Group();
      place(lantern, box(0.14, 0.18, 0.14, "#2d2a26"));
      place(lantern, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), glow("#ffcf6a")), 0, 0, 0, false);
      place(cabin, lantern, 1.15, 1.3, CD / 2 + 0.3);
      const lanternLight = new THREE.PointLight(col("#ffb453"), night ? 3 : 1.4, night ? 5 : 3, 1.6);
      lanternLight.position.set(1.15, 1.2, CD / 2 + 0.55);
      cabin.add(lanternLight);
      for (let r = 0; r < 3; r++) {
        for (let k = 0; k < 4 - r; k++) {
          const lg = cyl(0.1, 0.1, 0.7, k % 2 ? "#7a4e2c" : "#8e5f35", 8);
          lg.rotation.x = Math.PI / 2;
          place(cabin, lg, CW / 2 + 0.35, 0.28 + r * 0.18, -0.45 + k * 0.21 + r * 0.1);
        }
      }
      cabin.rotation.y = -0.55;
      const cabinAt = { x: 3.2, z: 0.6 };
      place(world, cabin, cabinAt.x, groundAt(cabinAt.x, cabinAt.z), cabinAt.z);
      const chimneyTop = new THREE.Vector3(-0.95, wallTop + 1.6, -0.45).applyEuler(cabin.rotation).add(cabin.position);

      // Stepping stones from the front toward the door.
      for (let i = 0; i < 6; i++) {
        const x = cabinAt.x + 0.9 + Math.sin(i * 0.9) * 0.25 + i * 0.12, z = cabinAt.z + 1.6 + i * 0.5;
        place(world, cyl(0.22 + rnd() * 0.06, 0.24, 0.07, i % 2 ? "#b7b2a6" : "#a6a195", 7), x, groundAt(x, z) + 0.03, z);
      }
      // Stump with an axe, and a short fence.
      const stump = new THREE.Group();
      place(stump, cyl(0.26, 0.3, 0.32, "#7a4e2c", 9), 0, 0.16);
      place(stump, cyl(0.22, 0.22, 0.02, "#c9a46e", 9), 0, 0.33);
      const axe = new THREE.Group();
      place(axe, cyl(0.025, 0.025, 0.5, "#a77a45", 5), 0, 0.25);
      place(axe, box(0.18, 0.12, 0.04, "#8e9496"), 0.07, 0.48);
      axe.rotation.z = -0.5;
      place(stump, axe, 0, 0.3);
      place(world, stump, 6.2, groundAt(6.2, 1.8), 1.8);
      for (let i = 0; i < 6; i++) {
        const x = 7.2 + i * 0.6, z = -0.8 + i * 0.08;
        place(world, box(0.1, 0.55, 0.1, "#8e6a44"), x, groundAt(x, z) + 0.27, z);
      }
      for (const y of [0.22, 0.42]) {
        const rail = box(3.1, 0.06, 0.06, "#9b7650");
        rail.rotation.y = -0.13;
        place(world, rail, 8.7, groundAt(8.7, -0.6) + y, -0.6);
      }

      // ---------- campfire, a person and their dog ----------
      const fireAt = { x: -0.8, z: 2.6 };
      const fire = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15), toon(i % 2 ? "#9a9890" : "#7f7d76"));
        st.scale.y = 0.7;
        place(fire, st, Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5);
      }
      for (let i = 0; i < 4; i++) {
        const g = new THREE.Group();
        const lg = cyl(0.05, 0.06, 0.62, "#4c2f1c");
        lg.rotation.z = 0.55;
        lg.position.set(0.12, 0.22, 0);
        g.add(lg);
        g.rotation.y = (i / 4) * Math.PI * 2;
        place(fire, g);
      }
      const flames = ["#ffe36e", "#ffaa2c", "#ff6a1e"].map((c, i) => place(fire, new THREE.Mesh(new THREE.ConeGeometry(0.2 - i * 0.04, 0.7 - i * 0.12, 6), glow(c)), (i - 1) * 0.06, 0.4, (i % 2) * 0.05, false));
      const fireLight = new THREE.PointLight(col("#ff9b3d"), 4, night ? 8 : 5.5, 1.5);
      fireLight.position.y = 0.7;
      fire.add(fireLight);
      for (const [x, z, rot] of [[-0.95, 0.15, 0.4], [0.75, 0.8, -0.9]] as const) {
        const g = new THREE.Group();
        const seat = cyl(0.14, 0.14, 0.95, "#7a4e2c", 8);
        seat.rotation.z = Math.PI / 2;
        g.add(seat);
        g.rotation.y = rot;
        place(fire, g, x, 0.14, z);
      }
      const person = new THREE.Group();
      place(person, box(0.3, 0.42, 0.24, "#2f4a6b"), 0, 0.5);
      place(person, box(0.28, 0.12, 0.38, "#3a3632"), 0, 0.31, 0.12);
      place(person, box(0.22, 0.24, 0.12, "#3a3632"), 0, 0.17, 0.3);
      place(person, new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), toon("#e3b48c")), 0, 0.86);
      place(person, cyl(0.17, 0.17, 0.08, "#b8462e", 8), 0, 0.98);
      place(person, cyl(0.11, 0.15, 0.12, "#b8462e", 8), 0, 1.06);
      const arm = new THREE.Group(); // pivots at the shoulder, for waving
      place(arm, box(0.09, 0.36, 0.09, "#2f4a6b"), 0, -0.16);
      place(arm, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), toon("#e3b48c")), 0, -0.36);
      place(person, arm, -0.19, 0.68, 0);
      person.rotation.y = Math.PI - 0.8;
      place(fire, person, -0.95, 0.12, 0.2);
      // The dog, lying by the fire.
      const dog = new THREE.Group();
      place(dog, box(0.46, 0.18, 0.2, "#c78b4a"), 0, 0.1);
      place(dog, box(0.2, 0.17, 0.17, "#c78b4a"), 0.28, 0.2);
      place(dog, box(0.1, 0.08, 0.1, "#a8703a"), 0.42, 0.17);
      place(dog, box(0.04, 0.03, 0.04, "#2b2420"), 0.48, 0.2);
      for (const s of [-1, 1]) place(dog, box(0.05, 0.1, 0.06, "#7b4f2a"), 0.25, 0.3, s * 0.08);
      const tail = new THREE.Group();
      place(tail, box(0.05, 0.05, 0.2, "#c78b4a"), 0, 0, -0.08);
      place(dog, tail, -0.24, 0.16, 0);
      dog.rotation.y = 2.4;
      place(fire, dog, 0.1, 0, 0.95);
      place(world, fire, fireAt.x, groundAt(fireAt.x, fireAt.z), fireAt.z);

      // Smoke from the fire and the chimney.
      // The chimney's plume climbs past the peaks and trails off into the sky.
      const smokeMat = () => new THREE.MeshToonMaterial({ color: col(night ? "#8f93a8" : tod === "golden" ? "#d8c6b8" : "#c9c7bf"), gradientMap: ramp, transparent: true });
      const puffs = [
        ...Array.from({ length: 8 }, (_, i) => ({ m: place(world, new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), smokeMat()), 0, -9, 0, false), o: i / 8, from: new THREE.Vector3(fireAt.x, groundAt(fireAt.x, fireAt.z) + 0.9, fireAt.z), rate: 0.18, rise: 3.4, drift: 1.1, grow: 1.5 })),
        ...Array.from({ length: 16 }, (_, i) => ({ m: place(world, new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), smokeMat()), 0, -9, 0, false), o: i / 16, from: chimneyTop, rate: 0.07, rise: 6.4, drift: 4.2, grow: 3.0 })),
      ];

      // Birds, and fireflies at night.
      // Birds are drawn like sprites: chunky enough to always cover whole
      // pixels, flat-colored, and flapping between two fixed poses.
      const birdMat = glow(night ? "#2b3046" : "#2e3238");
      const birds = Array.from({ length: 4 }, (_, i) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.18), birdMat));
        const wings = [-1, 1].map((s) => {
          const w = new THREE.Group();
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.16), birdMat);
          m.position.x = s * 0.2;
          w.add(m);
          w.position.x = s * 0.06;
          g.add(w);
          return w;
        });
        world.add(g);
        return { g, wings, o: i * 0.23, y: 6.9 + (i % 2) * 0.6 + (i === 3 ? 0.4 : 0), z: -1.5 + i * 0.5, speed: 1.3 + (i % 2) * 0.25 };
      });
      const flies = night
        ? Array.from({ length: 30 }, () => {
            const f = place(world, new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), glow("#f4ff9a")), 0, 0, 0, false);
            return { f, x: (rnd() * 2 - 1) * (RX - 3), z: (rnd() * 2 - 1) * (RZ - 2) * 0.6 + 1, p: rnd() * 10 };
          })
        : [];

      // ---------- grass ----------
      // Calm, close greens, and wind in slow broad waves rather than jitter.
      // Why it used to look like static: blades were thinner than a pixel and
      // faced random ways, so each frame a different scatter of them landed on
      // pixels, in random tints. Now each tuft is three blades turned to face
      // the camera, wide enough to fill whole pixels, colored by the same
      // broad patches as the ground, darker at the root, lighter at the tip.
      // Gusts roll across as a band that bends the tufts and lifts their tips.
      const tuft = new THREE.BufferGeometry();
      const tp: number[] = [], tc: number[] = [];
      for (const [ox, hh, lean] of [[-0.11, 0.8, -0.05], [0, 1, 0.02], [0.11, 0.7, 0.06]]) {
        tp.push(ox - 0.07, 0, 0, ox + 0.07, 0, 0, ox + lean, hh, 0);
        tc.push(0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.12, 1.12, 1.12);
      }
      tuft.setAttribute("position", new THREE.Float32BufferAttribute(tp, 3));
      tuft.setAttribute("color", new THREE.Float32BufferAttribute(tc, 3));
      tuft.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: 9 }, () => [0, 1, 0]).flat(), 3));
      const grassMat = new THREE.MeshToonMaterial({ gradientMap: ramp, side: THREE.DoubleSide, vertexColors: true });
      grassMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uTime;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;\nvarying float vGust;")
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float band = sin(uTime * 0.45 - root.x * 0.22 + root.z * 0.1);
            float gust = smoothstep(0.2, 1.0, band);
            transformed.x += (0.08 + gust * 0.32) * position.y;
            vGust = gust * position.y;`
          );
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying float vGust;")
          .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb *= 1.0 + vGust * 0.22;");
      };
      const tints = ["#4d8a30", "#579636", "#62a23b"].map(col);
      const COUNT = 11000;
      const grass = new THREE.InstancedMesh(tuft, grassMat, COUNT);
      grass.receiveShadow = true;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eul = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
      const keepClear = (x: number, z: number) =>
        Math.hypot(x - cabinAt.x, z - cabinAt.z) < 2.3 ||
        Math.hypot(x - fireAt.x, z - fireAt.z) < 1.25 ||
        Math.hypot((x - pond.x) / pond.rx, (z - pond.z) / pond.rz) < 1.3;
      let n = 0;
      for (let tries = 0; n < COUNT && tries < COUNT * 6; tries++) {
        const x = (rnd() * 2 - 1) * RX, z = (rnd() * 2 - 1) * RZ;
        const r = shapeR(x, z);
        if (r > 0.97) continue;
        const h = terrainH(x, z);
        if (h > 1.0 || h < 0.12 || keepClear(x, z) || Math.abs(x - streamX(z)) < 0.9) continue;
        if (r > 0.75 && rnd() < (r - 0.75) / 0.22) continue;
        // Facing the camera (which looks down this group's +z), give or take.
        eul.set(0, (rnd() - 0.5) * 0.5, 0);
        q.setFromEuler(eul);
        const p = patch(x, z);
        m4.compose(v3.set(x, h - 0.03, z), q, s3.set(1, 0.24 + p * 0.16 + rnd() * 0.06, 1));
        grass.setMatrixAt(n, m4);
        grass.setColorAt(n, tints[p < 0.4 ? 0 : p > 0.62 ? 2 : 1]);
        n++;
      }
      grass.count = n;
      world.add(grass);

      // ---------- sizing ----------
      const fit = () => {
        const w = Math.max(1, Math.round(host.clientWidth / PX));
        const h = Math.max(1, Math.round(host.clientHeight / PX));
        renderer.setSize(w, h, false);
        target.setSize(w, h);
        post.uniforms.uRes.value.set(w, h);
        // The full island across wide screens; on narrow ones, the heart of it.
        let halfH = 9.0;
        let halfW = halfH * (w / h);
        if (halfW > 22) {
          halfW = 22;
          halfH = halfW / (w / h);
        }
        Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
        camera.updateProjectionMatrix();
      };
      fit();
      const render = () => {
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCam);
      };

      // ---------- life ----------
      let hovering = false;
      const onEnter = () => (hovering = true);
      const onLeave = () => (hovering = false);
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
      let wave = 0;
      let raf = 0, visible = true, last = performance.now();
      const animate = (now: number) => {
        const t = now / 1000;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        uTime.value = t;
        const flick = 0.82 + Math.sin(t * 11) * 0.1 + Math.sin(t * 27) * 0.08;
        flames.forEach((f, i) => {
          const sy = 0.75 + Math.sin(t * (9 + i * 4) + i * 2) * 0.22 + Math.sin(t * 23 + i) * 0.08;
          f.scale.set(1, sy, 1);
          f.position.y = 0.2 + sy * 0.3;
        });
        fireLight.intensity = (night ? 6 : 4) * flick;
        lanternLight.intensity = (night ? 3 : 1.4) + Math.sin(t * 3.1) * 0.15;
        puffs.forEach(({ m, o, from, rate, rise, drift, grow }) => {
          const life = (t * rate + o) % 1;
          // Rises fast, then leans with the wind as it slows.
          const up = 1 - Math.pow(1 - life, 1.6);
          m.position.set(from.x + Math.sin(life * 5 + o * 9) * 0.3 + life * life * drift, from.y + up * rise, from.z - life * 0.6);
          m.scale.setScalar(0.55 + life * grow);
          (m.material as T.MeshToonMaterial).opacity = Math.min(1, life * 8) * Math.pow(1 - life, 0.8) * 0.9;
        });
        // A wave when the banner is hovered; the dog's tail never stops.
        wave += ((hovering ? 1 : 0) - wave) * Math.min(1, dt * 6);
        arm.rotation.z = -wave * (2.5 + Math.sin(t * 10) * 0.35);
        tail.rotation.y = Math.sin(t * (hovering ? 18 : 6)) * 0.6;
        birds.forEach((b) => {
          const span = RX * 2.4;
          const x = ((t * b.speed + b.o * span) % span) - span / 2;
          b.g.position.set(x, b.y + Math.sin(t * 0.8 + b.o * 9) * 0.3, b.z);
          // Two-frame flap, with a glide every few beats.
          const beat = Math.floor(t * 4 + b.o * 10);
          const flap = beat % 6 > 3 ? 0.3 : beat % 2 ? 0.55 : -0.45;
          b.wings[0].rotation.z = -flap;
          b.wings[1].rotation.z = flap;
        });
        // A fish leaps now and then.
        const leap = (t % 7) / 1.1;
        if (leap < 1) {
          fish.position.set(pond.x - 0.8 + leap * 0.9, -0.05 + Math.sin(leap * Math.PI) * 0.55, pond.z - 0.2);
          fish.rotation.z = (0.5 - leap) * 2;
        } else fish.position.y = -1;
        flies.forEach(({ f, x, z, p }) => {
          f.position.set(x + Math.sin(t * 0.5 + p) * 0.6, groundAt(x, z) + 0.5 + Math.sin(t * 0.9 + p * 2) * 0.3, z + Math.cos(t * 0.4 + p) * 0.5);
          f.visible = Math.sin(t * 2.2 + p * 3) > -0.1;
        });
        render();
      };
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (visible) animate(now);
      };
      animate(performance.now());
      if (!reduce) raf = requestAnimationFrame(frame);

      const ro = new ResizeObserver(() => {
        fit();
        render();
      });
      ro.observe(host);
      const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
      });
      io.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        scene.traverse((o) => (o as T.Mesh).geometry?.dispose());
        mats.forEach((m) => m.dispose());
        target.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [sceneTod]);

  const label = clock ? TOD_LABEL[clock.tod] : null;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={ref}
        role="img"
        aria-label="An animated pixel-art landscape: snowy mountains, a stream and pond with a dock, a log cabin, and someone by a campfire with their dog. Its light follows the time of day in Reno."
        style={{ width: "100%", height }}
      />
      {clock && label && (
        <p className="d-clock" title="The light in the scene follows the time where I live.">
          <span className="d-dot" style={{ background: label.dot }} />
          {label.name} in Reno, NV
          <span className="d-sep">·</span>
          <time>{clock.forced ? "preview" : clock.time}</time>
        </p>
      )}
      <style>{`
        .d-clock {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin: 10px 0 0; font-family: var(--font-geist-mono), monospace;
          font-size: 11.5px; letter-spacing: 0.01em; color: #8A8F98;
        }
        .d-dot { width: 7px; height: 7px; border-radius: 2px; flex: none; }
        .d-sep { color: #C4C7CC; }
        .d-clock time { color: #13181B; }
      `}</style>
    </div>
  );
}
