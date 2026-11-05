"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";

/* A floating island of a landscape, in 3D pixel art: a real three.js scene,
   modelled piece by piece, seen through an isometric camera, rendered at a
   third of its on-screen size and scaled up with hard pixels.

   What makes it read as pixel art rather than low-res 3D:
   - every pixel is snapped to one hand-picked 46-color palette (Apollo),
     with a light ordered dither, so the image is made of chosen colors,
   - shadows shift toward blue and violet and highlights warm up before the
     snap, the way a pixel artist shades instead of just darkening,
   - stepped "toon" lighting and flat-shaded terrain, so mountains break into
     crisp lit and shadowed facets,
   - baked contact shadows (ambient occlusion) under trees, rocks and the
     cabin, plus darker creases in the terrain, so nothing looks pasted on,
   - distance haze, so the far range sits back,
   - a post pass that darkens a pixel wherever one thing sits in front of
     another and brightens top edges, like line work.

   The light follows the time in Reno, continuously. Dragging across the
   banner scrubs through the day; letting go eases back to Reno time.
   Clicking things gets a reaction: sparks from the fire, ripples and a fish
   in the pond, a bark from the dog, leaves from a tree, lights in the cabin,
   a leap from the deer, a dash from the rabbit. */

// Screen pixels per scene pixel: chunky on desktop; on phones the whole
// island has to fit a narrow banner, so it uses a finer grid there.
const pxFor = (width: number) => (width < 640 ? 2 : 3);

const PALETTE = "172038 253a5e 3c5e8b 4f8fba 73bed3 a4dddb 19332d 25562e 468232 75a743 a8ca58 d0da91 4d2b32 7a4841 ad7757 c09473 d7b594 e7d5b3 341c27 602c2c 884b2b be772b de9e41 e8c170 241527 411d31 752438 a53030 cf573c da863e 1e1d39 402751 7a367b a23e8c c65197 df84a5 090a14 10141f 151d28 202e37 394a50 577277 819796 a8b5b2 c7cfcc ebede9".split(" ");

type TimeOfDay = "day" | "golden" | "night";

const forcedHour = (): number | null => {
  const q = new URLSearchParams(window.location.search);
  const f = q.get("tod");
  if (f === "day") return 12;
  if (f === "golden") return 18.6;
  if (f === "night") return 22;
  const h = Number(q.get("hour"));
  return q.has("hour") && Number.isFinite(h) ? ((h % 24) + 24) % 24 : null;
};

function renoHour(): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  return (Number(parts.find((p) => p.type === "hour")?.value ?? 12) % 24) + Number(parts.find((p) => p.type === "minute")?.value ?? 0) / 60;
}

const partOfDay = (h: number): TimeOfDay => (h >= 20 || h < 6 ? "night" : h >= 17.5 || h < 8 ? "golden" : "day");

const fmtHour = (h: number) => {
  const m = Math.round(h * 60) % 1440;
  const hh = Math.floor(m / 60), mm = m % 60;
  return `${hh % 12 || 12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
};

const TOD_LABEL: Record<TimeOfDay, { name: string; dot: string }> = {
  day: { name: "Daytime", dot: "#F5B82E" },
  golden: { name: "Golden hour", dot: "#F0743A" },
  night: { name: "Nighttime", dot: "#5B6CF0" },
};

// Light through the day. Positions are where the sun (or moon) shines from.
type Key = { h: number; sky: string; ground: string; hemi: number; sun: string; sunI: number; pos: [number, number, number]; night: number; haze: string };
const NIGHT: Omit<Key, "h"> = { sky: "#4a5c96", ground: "#22203a", hemi: 0.78, sun: "#a9bcff", sunI: 1.0, pos: [10, 14, -6], night: 1, haze: "#2c3a66" };
const KEYS: Key[] = [
  { h: 0, ...NIGHT },
  { h: 4.8, ...NIGHT },
  { h: 6.3, sky: "#e3aec4", ground: "#3a2c44", hemi: 0.8, sun: "#ffb08a", sunI: 1.9, pos: [16, 6, 5], night: 0.3, haze: "#d9a9bd" },
  { h: 8, sky: "#cfe8ff", ground: "#4f4a5e", hemi: 1.1, sun: "#fff0d0", sunI: 2.4, pos: [10, 14, 7], night: 0, haze: "#a9c7dc" },
  { h: 12.5, sky: "#cfe8ff", ground: "#4f4a5e", hemi: 1.15, sun: "#fff3da", sunI: 2.5, pos: [-4, 17, 6], night: 0, haze: "#a9c7dc" },
  { h: 16.8, sky: "#d8e6f8", ground: "#4f4a5e", hemi: 1.1, sun: "#ffe8c4", sunI: 2.5, pos: [-12, 12, 5], night: 0, haze: "#b8cbd8" },
  { h: 18.6, sky: "#ffd2a6", ground: "#4a3040", hemi: 0.95, sun: "#ffb46a", sunI: 2.6, pos: [-16, 7, 4], night: 0.05, haze: "#e8b89a" },
  { h: 20, sky: "#a77cb0", ground: "#2a2038", hemi: 0.7, sun: "#ff8a6a", sunI: 1.2, pos: [-16, 4, 1], night: 0.6, haze: "#8a6c9a" },
  { h: 21.3, ...NIGHT },
  { h: 24, ...NIGHT },
];

const srgb = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
};

type View = { hour: number; live: boolean; forced: boolean };

export default function Diorama({ height = 320 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View | null>(null);
  const timeRef = useRef<HTMLTimeElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const bubbleEl = bubbleRef.current!;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { mergeGeometries } = await import("three/examples/jsm/utils/BufferGeometryUtils.js");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

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
      // A second pass draws each object as a flat ID color, so the post
      // shader knows what every pixel belongs to. Outlines are drawn the way
      // pixel artists do them: only where one solid object sits clearly in
      // front of something else, in a darkened tone of the color underneath
      // ("sel-out") rather than flat black. Where things touch, like feet on
      // the ground, there is no line, so they stay grounded.
      const idTarget = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
      const idMats = Array.from({ length: 16 }, (_, i) => new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(i / 16, 0, 0, THREE.LinearSRGBColorSpace) }));
      const post = new THREE.ShaderMaterial({
        uniforms: {
          tId: { value: idTarget.texture },
          tColor: { value: target.texture },
          tDepth: { value: target.depthTexture },
          uRes: { value: new THREE.Vector2(1, 1) },
          uPal: { value: PALETTE.map((h) => new THREE.Vector3(...srgb(h))) },
          uHaze: { value: new THREE.Vector3(0.7, 0.8, 0.85) },
          uInvVP: { value: new THREE.Matrix4() },
          uWorldInv: { value: new THREE.Matrix4() },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: `
          uniform sampler2D tColor; uniform sampler2D tDepth; uniform sampler2D tId; uniform vec2 uRes;
          uniform vec3 uPal[${PALETTE.length}]; uniform vec3 uHaze; uniform mat4 uInvVP; uniform mat4 uWorldInv;
          varying vec2 vUv;
          float dep(vec2 o){ return texture2D(tDepth, vUv + o / uRes).x; }
          float alp(vec2 o){ return texture2D(tColor, vUv + o / uRes).a; }
          float oid(vec2 o){ return floor(texture2D(tId, vUv + o / uRes).r * 16.0 + 0.5); }
          float b2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
          float b4(vec2 a){ return b2(0.5 * a) * 0.25 + b2(a); }
          void main(){
            vec4 c = texture2D(tColor, vUv);
            float own = c.a > 0.0 ? oid(vec2(0.0)) : 0.0;
            float d = c.a > 0.0 ? dep(vec2(0.0)) : 1.0;
            bool edge = false; vec3 front = vec3(0.0);
            for (int k = 0; k < 4; k++) {
              vec2 o = k == 0 ? vec2(1.0, 0.0) : k == 1 ? vec2(-1.0, 0.0) : k == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
              float n = oid(o);
              if (!edge && n > 0.5 && n != own && dep(o) < d - 0.0025) { edge = true; front = texture2D(tColor, vUv + o / uRes).rgb; }
            }
            if (c.a <= 0.0 && !edge) discard;
            bool isChar = own > 7.5;
            float diff = max(max(dep(vec2(1.0,0.0)) - d, dep(vec2(-1.0,0.0)) - d), max(dep(vec2(0.0,1.0)) - d, dep(vec2(0.0,-1.0)) - d));
            vec3 lin = c.rgb;
            if (diff > 0.004) lin *= 0.6;
            else if (alp(vec2(0.0, 1.0)) == 0.0) lin *= 1.2;
            vec3 s = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));
            if (edge) {
              // Sel-out: a deep, warm version of what's under the line (or of
              // the object itself, against the sky), never pure black.
              vec3 under = c.a > 0.0 ? s : pow(max(front, vec3(0.0)), vec3(1.0 / 2.2));
              s = mix(under * 0.42, vec3(0.17, 0.155, 0.15), 0.45);
              c.a = 1.0;
            }
            // Distance haze, measured on the island itself: the further back
            // and the higher up, the more it fades toward the sky.
            vec4 wp = uInvVP * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
            vec3 lp = (uWorldInv * vec4(wp.xyz / wp.w, 1.0)).xyz;
            float hz = smoothstep(-3.4, -7.4, lp.z) * (0.5 + 0.5 * smoothstep(1.0, 7.0, lp.y)) * 0.42;
            if (isChar && !edge) {
              // Characters skip the haze and never sink into the dark.
              float l0 = dot(s, vec3(0.299, 0.587, 0.114));
              s *= clamp(0.34 / max(l0, 0.01), 1.0, 2.6);
              hz = 0.0;
            }
            s = mix(s, uHaze, hz);
            // Hue-shifted shading: cool shadows, warm lights.
            float l = dot(s, vec3(0.299, 0.587, 0.114));
            s = mix(s, s * vec3(0.8, 0.9, 1.22) + vec3(0.0, 0.0, 0.015), smoothstep(0.5, 0.06, l) * 0.6);
            s = mix(s, s * vec3(1.07, 1.02, 0.9), smoothstep(0.6, 0.95, l) * 0.45);
            // Snap to the palette.
            vec3 best = uPal[0]; float bd = 1e9;
            for (int i = 0; i < ${PALETTE.length}; i++) {
              vec3 p = uPal[i]; vec3 e = s - p; float rm = (s.r + p.r) * 0.5;
              float dd = (2.0 + rm) * e.r * e.r + 4.0 * e.g * e.g + (3.0 - rm) * e.b * e.b;
              if (dd < bd) { bd = dd; best = p; }
            }
            gl_FragColor = vec4(best, c.a);
          }`,
        transparent: true,
      });
      const postScene = new THREE.Scene();
      postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // ---------- scene, camera, lights ----------
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
      camera.position.set(24, 20, 24);
      camera.lookAt(0, 3.3, 0);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffffff, 2);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 70 });
      sun.shadow.bias = -0.0015;
      scene.add(sun);

      // The island's long side runs across the banner. The camera looks
      // down this group's -z axis, so +z is toward the viewer.
      const world = new THREE.Group();
      world.rotation.y = Math.PI / 4;
      scene.add(world);
      world.updateMatrixWorld();
      const worldInv = world.matrixWorld.clone().invert();
      post.uniforms.uWorldInv.value.copy(worldInv);
      // Static props are merged into a handful of meshes once built.
      const statics = new THREE.Group();
      const treesGroup = new THREE.Group();
      const rocks = new THREE.Group();
      world.add(statics, treesGroup, rocks);
      const uPix = { value: 0.1 };

      // Contact shadows get baked into the ground from these.
      const occ: { x: number; z: number; r: number; k: number }[] = [];
      const aoAt = (x: number, z: number) => {
        let f = 1;
        for (const o of occ) {
          const dx = x - o.x, dz = z - o.z, d2 = dx * dx + dz * dz;
          if (d2 > o.r * o.r) continue;
          const t = 1 - Math.sqrt(d2) / o.r;
          f *= 1 - o.k * t * t * (3 - 2 * t);
        }
        return f;
      };

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
      // The main range, and a second, further-back range peeking between.
      const peaks = [
        { x: -16.4, z: -4.8, h: 6.2, w: 3.4 },
        { x: -11.6, z: -5.4, h: 8.4, w: 4.2 },
        { x: -6.2, z: -5.3, h: 6.0, w: 3.4 },
        { x: -1.4, z: -5.6, h: 4.6, w: 3.0 },
        { x: 4.2, z: -5.3, h: 7.0, w: 3.8 },
        { x: 10.0, z: -5.5, h: 8.8, w: 4.4 },
        { x: 15.6, z: -4.8, h: 6.0, w: 3.4 },
        { x: -14.0, z: -6.1, h: 8.6, w: 2.8 },
        { x: -3.8, z: -6.2, h: 9.4, w: 3.0 },
        { x: 7.2, z: -6.2, h: 9.8, w: 2.9 },
        { x: 13.2, z: -6.0, h: 8.2, w: 2.7 },
      ];
      const terrainH = (x: number, z: number) => {
        const r = shapeR(x, z);
        let h = 0.3 + 0.12 * Math.sin(x * 0.42 + 1) + 0.1 * Math.cos(z * 0.7 + x * 0.21) + 0.2 * vnoise(x * 0.35 + 9, z * 0.35);
        let m = 0;
        for (const p of peaks) {
          const d = Math.hypot((x - p.x) / p.w, (z - p.z) / (p.w * 0.75));
          const v = p.h * Math.pow(Math.max(0, 1 - d), 1.35);
          if (v > m) m = v;
        }
        // Ridged detail so the slopes break into crags and gullies.
        if (m > 0.2) m += (Math.abs(vnoise(x * 1.1, z * 1.1) - 0.5) * 2 - 0.5) * Math.min(1, m) * 0.6 + (vnoise(x * 2.6, z * 2.6) - 0.5) * Math.min(1, m * 0.3) * 0.35;
        h += Math.max(0, m);
        const pd = Math.hypot((x - pond.x) / pond.rx, (z - pond.z) / pond.rz);
        if (pd < 1.25) h = Math.min(h, -0.35 + Math.max(0, pd - 0.85) * 1.2);
        if (z > -3.8 && z < pond.z) {
          const sd = Math.abs(x - streamX(z));
          if (sd < 0.75) h = Math.min(h, -0.3 + sd * 0.45);
        }
        return h * (1 - Math.pow(Math.min(1, r), 10));
      };
      const groundAt = terrainH;

      // The grid reaches past the rim on every side, so the wobbly edge is
      // never sliced off by the grid's own straight border.
      const GX = RX * 1.12, GZ = RZ * 1.12;
      const NX = 180, NZ = 64;
      const pos: number[] = [], cols: number[] = [], cent: number[] = [];
      const cGrass = [col("#538f33"), col("#5c9a36"), col("#66a53c")];
      const patch = (x: number, z: number) => vnoise(x * 0.32 + 3.1, z * 0.32 + 7.7) * 0.75 + vnoise(x * 0.9, z * 0.9) * 0.25;
      const cRockA = col("#7c8796"), cRockB = col("#6d7686"), cRockDark = col("#566072"), cSnow = col("#eef0ec"), cMoss = col("#5d8a3c");
      const cSand = col("#cdb37c"), cBed = col("#3c6a74"), cBank = col("#7a6a46");
      const cell = (ix: number, iz: number) => {
        const x = -GX + (ix / NX) * GX * 2, z = -GZ + (iz / NZ) * GZ * 2;
        return new THREE.Vector3(x, terrainH(x, z), z);
      };
      const n3 = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), kc = new THREE.Color();
      const tri = (a: T.Vector3, b: T.Vector3, c: T.Vector3) => {
        const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
        if (shapeR(cx, cz) > 1) return;
        const ch = (a.y + b.y + c.y) / 3;
        n3.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a)).normalize();
        if (n3.y < 0) n3.negate();
        const nz = vnoise(cx * 2.3, cz * 2.3);
        // Concave spots (gullies, banks, the foot of slopes) sit darker;
        // ridges are convex and catch the snow lower down.
        const cav = ch - (terrainH(cx + 0.7, cz) + terrainH(cx - 0.7, cz) + terrainH(cx, cz + 0.7) + terrainH(cx, cz - 0.7)) / 4;
        let k: T.Color;
        if (ch < -0.12) k = cBed;
        else if (ch < 0.04 && (Math.hypot((cx - pond.x) / pond.rx, (cz - pond.z) / pond.rz) < 1.5 || Math.abs(cx - streamX(cz)) < 1.1)) k = nz > 0.5 ? cSand : cBank;
        else if (ch > 4.4 + nz * 1.1 - cav * 3.2 && n3.y > 0.35) k = cSnow;
        else if (ch > 1.1) {
          // Strata: rock alternates in tilted bands.
          const band = Math.floor((ch + cx * 0.08 + nz * 0.5) * 1.3) % 2;
          k = n3.y < 0.55 ? cRockDark : ch < 2.3 && nz > 0.45 ? cMoss : band ? cRockA : cRockB;
        } else {
          const p = patch(cx, cz);
          k = cGrass[p < 0.4 ? 0 : p > 0.62 ? 2 : 1];
        }
        // Only real creases darken, so open ground stays one flat tone.
        kc.copy(k).multiplyScalar(cav < -0.06 ? Math.max(0.66, 1 + (cav + 0.06) * 0.6) : 1);
        for (const v of [a, b, c]) {
          pos.push(v.x, v.y, v.z);
          cols.push(kc.r, kc.g, kc.b);
        }
        cent.push(cx, cz);
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
      const terrainCol = new THREE.Float32BufferAttribute(cols, 3);
      terrain.setAttribute("color", terrainCol);
      terrain.computeVertexNormals();
      place(world, new THREE.Mesh(terrain, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp })));

      // Layered like a cut-out of earth: a grass lip, soil, then darker stone.
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
      const ring = (scale: number, wob: number) =>
        rimPts.map(([x, z], i) => {
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
      // Rippled, flowing downstream, with foam along the banks; the far
      // side of the pond mirrors the dark treeline, the near side the sky.
      const uTime = { value: 0 };
      const WATER = {
        day: { deep: col("#4f8fba"), light: col("#a4dddb"), foam: col("#ebede9"), refl: col("#25562e") },
        night: { deep: col("#253a5e"), light: col("#4f8fba"), foam: col("#73bed3"), refl: col("#172038") },
      };
      const wU = {
        uTime,
        uWorldInv: { value: worldInv },
        cDeep: { value: new THREE.Color() },
        cLight: { value: new THREE.Color() },
        cFoam: { value: new THREE.Color() },
        cRefl: { value: new THREE.Color() },
        cSky: { value: new THREE.Color() },
      };
      const waterVert = `uniform mat4 uWorldInv; varying vec3 vL; varying vec2 vUv;
        void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vL = (uWorldInv * w).xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
      const waterFrag = (stream: boolean) => `uniform float uTime; uniform vec3 cDeep; uniform vec3 cLight; uniform vec3 cFoam; uniform vec3 cRefl; uniform vec3 cSky;
        varying vec3 vL; varying vec2 vUv;
        void main(){
          vec3 c;
          ${stream
            ? `float r = sin(vL.z * 8.0 - uTime * 3.2 + sin(vL.x * 4.0) * 1.2) * sin(vL.x * 6.0 + vL.z * 2.0);
               c = mix(cDeep, cSky, 0.18);
               if (r > 0.5) c = cLight;
               if (abs(vUv.x - 0.5) * 2.0 > 0.76 + sin(vL.z * 7.0 - uTime * 2.4) * 0.07) c = cFoam;`
            : `float r = sin(vL.x * 5.0 + uTime * 1.2 + sin(vL.z * 3.0 + uTime * 0.7) * 1.5) * sin(vL.z * 7.0 - uTime * 0.9);
               vec2 q = vUv - 0.5;
               c = mix(cDeep, cSky, smoothstep(0.1, -0.45, q.y) * 0.4);
               c = mix(c, cRefl, smoothstep(0.12, 0.4, q.y) * 0.7);
               if (r > 0.74) c = cLight;
               float e = length(q) * 2.0;
               if (e > 0.88 + sin(atan(q.y, q.x) * 9.0 + uTime * 1.3) * 0.025) c = cFoam;`}
          gl_FragColor = vec4(c, 1.0);
        }`;
      const pondMat = new THREE.ShaderMaterial({ uniforms: wU, vertexShader: waterVert, fragmentShader: waterFrag(false) });
      const streamMat = new THREE.ShaderMaterial({ uniforms: wU, vertexShader: waterVert, fragmentShader: waterFrag(true) });
      const pondMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 40), pondMat);
      pondMesh.scale.set(pond.rx * 1.12, pond.rz * 1.12, 1);
      pondMesh.rotation.x = -Math.PI / 2;
      pondMesh.userData.tap = "pond";
      place(world, pondMesh, pond.x, -0.06, pond.z, false);
      const waterMeshes: T.Object3D[] = [pondMesh];
      for (let z = -3.7; z < pond.z; z += 0.32) {
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.42), streamMat);
        seg.rotation.x = -Math.PI / 2;
        seg.rotation.z = -Math.atan2(streamX(z + 0.3) - streamX(z), 0.3);
        seg.userData.tap = "pond";
        place(world, seg, streamX(z), -0.06, z + 0.16, false);
        waterMeshes.push(seg);
      }
      // Dock, reeds and lily pads.
      const dock = new THREE.Group();
      for (let i = 0; i < 6; i++) place(dock, box(0.26, 0.06, 1.0, i % 2 ? "#a77a4a" : "#946a3f"), i * 0.28, 0.12, 0);
      for (const [x, z] of [[0, -0.45], [0, 0.45], [1.4, -0.45], [1.4, 0.45]]) place(dock, cyl(0.05, 0.05, 0.5, "#6b4a2c"), x, -0.08, z);
      dock.rotation.y = -0.3;
      place(statics, dock, pond.x + 0.6, 0, pond.z + 0.2);
      for (let i = 0; i < 30; i++) {
        const a = rnd() * Math.PI * 2;
        const x = pond.x + Math.cos(a) * pond.rx * (1.02 + rnd() * 0.15), z = pond.z + Math.sin(a) * pond.rz * (1.02 + rnd() * 0.15);
        if (Math.cos(a) > 0.2 && Math.sin(a) > -0.3) continue;
        place(statics, cyl(0.03, 0.035, 0.5 + rnd() * 0.4, rnd() > 0.5 ? "#3f6e2c" : "#55823a", 4), x, 0.2, z);
        if (rnd() > 0.6) place(statics, cyl(0.05, 0.05, 0.14, "#6b4426", 5), x, 0.5, z);
      }
      for (let i = 0; i < 6; i++) place(statics, cyl(0.16, 0.16, 0.02, i % 2 ? "#4e8a3a" : "#5c9a44", 7), pond.x - 1.5 + rnd() * 1.6, -0.04, pond.z - 0.5 + rnd() * 1.0, false);
      const fish = place(world, box(0.2, 0.09, 0.07, "#e8823a"), pond.x - 0.6, -1, pond.z, false);

      // Ducks paddling slow loops on the open side of the pond.
      const ducks = [0, 1].map((i) => {
        const g = new THREE.Group();
        const bodyC = i ? "#7a4841" : "#ebede9";
        place(g, box(0.28, 0.13, 0.17, bodyC), 0, 0.06);
        place(g, box(0.1, 0.1, 0.12, bodyC), -0.15, 0.1);
        place(g, box(0.12, 0.12, 0.11, i ? "#ad7757" : "#25562e"), 0.13, 0.2);
        place(g, box(0.08, 0.04, 0.06, "#de9e41"), 0.22, 0.18);
        g.userData.tap = "duck";
        g.scale.setScalar(1.8);
        place(world, g, pond.x, -0.06, pond.z, false);
        return { g, a: i * 2.6, speed: i ? 0.22 : 0.17 };
      });

      // ---------- trees, rocks, moss ----------
      const trees: { x: number; z: number; top: number; leaf: string }[] = [];
      const pine = (x: number, z: number, s: number, tall = false) => {
        const g = new THREE.Group();
        place(g, cyl(0.07 * s, 0.11 * s, 0.6 * s, "#5a3a22"), 0, 0.3 * s);
        const greens = ["#25562e", "#2f6a36", "#3a7a3c", "#468232"];
        const n = tall ? 4 : 3;
        for (let i = 0; i < n; i++) {
          const c = new THREE.Mesh(new THREE.ConeGeometry((0.68 - i * 0.13) * s, 0.82 * s, 8), toon(greens[i]));
          c.rotation.z = (rnd() - 0.5) * 0.08;
          place(g, c, (rnd() - 0.5) * 0.04 * s, (0.7 + i * 0.42) * s);
        }
        g.rotation.y = rnd() * Math.PI;
        const y = groundAt(x, z) - 0.02;
        place(treesGroup, g, x, y, z);
        trees.push({ x, z, top: y + (0.9 + n * 0.42) * s, leaf: greens[2] });
        occ.push({ x, z, r: 0.95 * s, k: 0.45 });
      };
      // Canopies are built from clumps: a darker ring underneath, a middle
      // layer, a lighter crown, so the top catches light and the underside
      // stays in shade even before lighting.
      const leafy = (x: number, z: number, s: number, pal: [string, string, string], bark = "#6b4428", birch = false) => {
        const g = new THREE.Group();
        const trunkH = 0.95 * s;
        place(g, cyl(0.07 * s, 0.11 * s, trunkH, bark), 0, trunkH / 2);
        if (birch) for (let i = 0; i < 4; i++) place(g, box(0.15 * s, 0.03 * s, 0.15 * s, "#2b2b2b"), 0, trunkH * (0.2 + i * 0.2), 0);
        const R = 0.52 * s;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + rnd() * 0.5;
          place(g, blob((0.26 + rnd() * 0.07) * s, pal[0]), Math.cos(a) * R * 0.78, trunkH + 0.06 * s, Math.sin(a) * R * 0.7);
        }
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + rnd();
          place(g, blob((0.3 + rnd() * 0.06) * s, pal[1]), Math.cos(a) * R * 0.45, trunkH + 0.36 * s, Math.sin(a) * R * 0.42);
        }
        place(g, blob(0.33 * s, pal[2]), (rnd() - 0.5) * 0.1 * s, trunkH + 0.64 * s, 0);
        place(g, blob(0.2 * s, pal[2]), 0.18 * s, trunkH + 0.5 * s, 0.16 * s);
        g.rotation.y = rnd() * Math.PI;
        const y = groundAt(x, z) - 0.02;
        place(treesGroup, g, x, y, z);
        trees.push({ x, z, top: y + trunkH + 0.7 * s, leaf: pal[1] });
        occ.push({ x, z, r: 1.0 * s, k: 0.45 });
      };
      const oak: [string, string, string] = ["#356b2e", "#468232", "#5e9c3c"];
      const birch: [string, string, string] = ["#75a743", "#8db84c", "#a8ca58"];
      const maple: [string, string, string] = ["#be5a26", "#da863e", "#e8a24a"];
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
      leafy(-12.8, 1.2, 1.25, oak);
      leafy(12.6, 1.6, 1.15, maple);
      leafy(15.4, -0.4, 1.0, birch, "#e8e4da", true);
      pine(-15.6, 1.4, 1.2, true);
      pine(16.6, 2.2, 1.0);
      leafy(-3.6, 4.6, 0.9, oak);
      // Mossy boulders.
      const boulder = (x: number, z: number, s: number) => {
        const g = new THREE.Group();
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s), toon("#819796"));
        r.scale.y = 0.7;
        place(g, r, 0, s * 0.35);
        const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(s * 0.82), toon("#5f9a3c"));
        moss.scale.y = 0.35;
        place(g, moss, -s * 0.12, s * 0.62);
        g.rotation.y = rnd() * Math.PI;
        place(rocks, g, x, groundAt(x, z), z);
        occ.push({ x, z, r: s * 1.9, k: 0.42 });
      };
      for (const [x, z, s] of [[-10.6, 3.6, 0.42], [-4.6, 1.0, 0.3], [7.8, 3.8, 0.38], [13.8, 4.4, 0.32], [-14.2, 3.4, 0.36], [2.4, -1.8, 0.34], [-17.2, -0.4, 0.3], [-9.8, -1.6, 0.28]] as const) boulder(x, z, s);
      // A mossy fallen log.
      const fallen = new THREE.Group();
      const logM = cyl(0.17, 0.19, 1.8, "#6e4628", 8);
      logM.rotation.z = Math.PI / 2;
      place(fallen, logM, 0, 0.17);
      const logMoss = cyl(0.12, 0.14, 1.2, "#5f9a3c", 8);
      logMoss.rotation.z = Math.PI / 2;
      place(fallen, logMoss, -0.15, 0.28);
      fallen.rotation.y = 0.5;
      place(rocks, fallen, 9.4, groundAt(9.4, 2.6), 2.6);
      occ.push({ x: 9.4, z: 2.6, r: 1.3, k: 0.35 });

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
      const windowMat = glow("#ffd88a");
      place(cabin, box(0.6, 0.48, 0.08, "#3d2616"), -0.65, 0.95, CD / 2 + 0.12);
      place(cabin, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.06), windowMat), -0.65, 0.95, CD / 2 + 0.16, false);
      for (let k = 0; k < 6; k++) place(cabin, box(0.42 - (k % 2) * 0.06, 0.2, 0.42, k % 2 ? "#8d8a84" : "#7a7771"), -0.95, wallTop + 0.4 + k * 0.2, -0.45);
      const lantern = new THREE.Group();
      place(lantern, box(0.14, 0.18, 0.14, "#2d2a26"));
      const lanternMat = glow("#ffcf6a");
      place(lantern, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), lanternMat), 0, 0, 0, false);
      place(cabin, lantern, 1.15, 1.3, CD / 2 + 0.3);
      const lanternLight = new THREE.PointLight(col("#ffb453"), 1.4, 4, 1.6);
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
      cabin.userData.tap = "cabin";
      const cabinAt = { x: 3.2, z: 0.6 };
      place(world, cabin, cabinAt.x, groundAt(cabinAt.x, cabinAt.z), cabinAt.z);
      const chimneyTop = new THREE.Vector3(-0.95, wallTop + 1.6, -0.45).applyEuler(cabin.rotation).add(cabin.position);
      occ.push({ x: cabinAt.x, z: cabinAt.z, r: 2.5, k: 0.4 });

      for (let i = 0; i < 6; i++) {
        const x = cabinAt.x + 0.9 + Math.sin(i * 0.9) * 0.25 + i * 0.12, z = cabinAt.z + 1.6 + i * 0.5;
        place(statics, cyl(0.22 + rnd() * 0.06, 0.24, 0.07, i % 2 ? "#b7b2a6" : "#a6a195", 7), x, groundAt(x, z) + 0.03, z);
      }
      const stump = new THREE.Group();
      place(stump, cyl(0.26, 0.3, 0.32, "#7a4e2c", 9), 0, 0.16);
      place(stump, cyl(0.22, 0.22, 0.02, "#c9a46e", 9), 0, 0.33);
      const axe = new THREE.Group();
      place(axe, cyl(0.025, 0.025, 0.5, "#a77a45", 5), 0, 0.25);
      place(axe, box(0.18, 0.12, 0.04, "#8e9496"), 0.07, 0.48);
      axe.rotation.z = -0.5;
      place(stump, axe, 0, 0.3);
      place(rocks, stump, 6.2, groundAt(6.2, 1.8), 1.8);
      occ.push({ x: 6.2, z: 1.8, r: 0.6, k: 0.35 });
      for (let i = 0; i < 6; i++) {
        const x = 7.2 + i * 0.6, z = -0.8 + i * 0.08;
        place(statics, box(0.1, 0.55, 0.1, "#8e6a44"), x, groundAt(x, z) + 0.27, z);
        occ.push({ x, z, r: 0.35, k: 0.3 });
      }
      for (const y of [0.22, 0.42]) {
        const rail = box(3.1, 0.06, 0.06, "#9b7650");
        rail.rotation.y = -0.13;
        place(statics, rail, 8.7, groundAt(8.7, -0.6) + y, -0.6);
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
      const fireLight = new THREE.PointLight(col("#ff9b3d"), 4, 6, 1.5);
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
      place(person, box(0.3, 0.42, 0.24, "#cf573c"), 0, 0.5);
      place(person, box(0.28, 0.12, 0.38, "#253a5e"), 0, 0.31, 0.12);
      place(person, box(0.22, 0.24, 0.12, "#253a5e"), 0, 0.17, 0.3);
      place(person, new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), toon("#e3b48c")), 0, 0.86);
      place(person, cyl(0.17, 0.17, 0.08, "#e8c170", 8), 0, 0.98);
      place(person, cyl(0.11, 0.15, 0.12, "#e8c170", 8), 0, 1.06);
      const arm = new THREE.Group();
      place(arm, box(0.09, 0.36, 0.09, "#cf573c"), 0, -0.16);
      place(arm, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), toon("#e3b48c")), 0, -0.36);
      place(person, arm, -0.19, 0.68, 0);
      person.rotation.y = Math.PI - 0.8;
      person.scale.setScalar(1.7);
      person.userData.tap = "person";
      place(fire, person, -0.95, 0.12, 0.2);
      const dog = new THREE.Group();
      place(dog, box(0.46, 0.18, 0.2, "#7a4841"), 0, 0.1);
      place(dog, box(0.12, 0.12, 0.18, "#ebede9"), 0.2, 0.1);
      place(dog, box(0.2, 0.17, 0.17, "#7a4841"), 0.28, 0.2);
      place(dog, box(0.1, 0.08, 0.1, "#4d2b32"), 0.42, 0.17);
      place(dog, box(0.04, 0.03, 0.04, "#2b2420"), 0.48, 0.2);
      for (const s of [-1, 1]) place(dog, box(0.05, 0.1, 0.06, "#7b4f2a"), 0.25, 0.3, s * 0.08);
      const tail = new THREE.Group();
      place(tail, box(0.05, 0.05, 0.2, "#7a4841"), 0, 0, -0.08);
      place(dog, tail, -0.24, 0.16, 0);
      dog.rotation.y = 2.9;
      dog.scale.setScalar(1.8);
      dog.userData.tap = "dog";
      place(fire, dog, 1.05, 0, -0.05);
      fire.userData.tap = "fire";
      place(world, fire, fireAt.x, groundAt(fireAt.x, fireAt.z), fireAt.z);
      occ.push({ x: fireAt.x, z: fireAt.z, r: 0.9, k: 0.3 });

      // Smoke from the fire, and a chimney plume that climbs past the peaks.
      const smokeMats: T.MeshToonMaterial[] = [];
      const smokeMat = () => {
        const m = new THREE.MeshToonMaterial({ color: col("#c9c7bf"), gradientMap: ramp, transparent: true });
        smokeMats.push(m);
        return m;
      };
      const puffs = [
        ...Array.from({ length: 8 }, (_, i) => ({ m: place(world, new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), smokeMat()), 0, -9, 0, false), o: i / 8, from: new THREE.Vector3(fireAt.x, groundAt(fireAt.x, fireAt.z) + 0.9, fireAt.z), rate: 0.18, rise: 3.4, drift: 1.1, grow: 1.5, chimney: false })),
        ...Array.from({ length: 24 }, (_, i) => ({ m: place(world, new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), smokeMat()), 0, -9, 0, false), o: i / 24, from: chimneyTop, rate: 0.06, rise: 5.6, drift: -2.4, grow: 2.2, chimney: true })),
      ];

      // ---------- wildlife ----------
      // Birds are drawn like sprites: chunky, flat-colored, two-frame flaps.
      const birdMat = glow("#2e3238");
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
      const flies = Array.from({ length: 30 }, () => {
        const f = place(world, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), glow("#e8c170")), 0, 0, 0, false);
        return { f, x: (rnd() * 2 - 1) * (RX - 3), z: (rnd() * 2 - 1) * (RZ - 2) * 0.6 + 1, p: rnd() * 10 };
      });

      const meadowOK = (x: number, z: number, lo = 0.15, hi = 0.95) => {
        const h = terrainH(x, z);
        return h > lo && h < hi && shapeR(x, z) < 0.85 && Math.abs(x - streamX(z)) > 1.4 && Math.hypot((x - pond.x) / pond.rx, (z - pond.z) / pond.rz) > 1.5;
      };

      // A deer grazing at the treeline; it looks up while you're here.
      const deer = new THREE.Group();
      const deerAt = [[-4.4, -2.3], [-2.8, -2.0], [6.8, -2.2], [1.2, -2.4], [-1.0, -1.2]].find(([x, z]) => meadowOK(x, z) && Math.hypot(x - cabinAt.x, z - cabinAt.z) > 3) ?? [-1.0, -1.0];
      place(deer, box(0.62, 0.28, 0.24, "#ad7757"), 0, 0.56);
      place(deer, box(0.5, 0.08, 0.2, "#d7b594"), 0, 0.42);
      for (const [lx, lz] of [[0.22, 0.08], [0.22, -0.08], [-0.22, 0.08], [-0.22, -0.08]]) place(deer, box(0.07, 0.44, 0.07, "#7a4841"), lx, 0.22, lz);
      place(deer, box(0.08, 0.12, 0.1, "#ebede9"), -0.33, 0.66);
      const neck = new THREE.Group();
      place(neck, box(0.12, 0.36, 0.12, "#ad7757"), 0, 0.17);
      place(neck, box(0.26, 0.13, 0.13, "#ad7757"), 0.08, 0.38);
      place(neck, box(0.06, 0.05, 0.06, "#341c27"), 0.22, 0.37);
      for (const s of [-1, 1]) place(neck, box(0.05, 0.14, 0.05, "#7a4841"), -0.02, 0.5, s * 0.07);
      place(deer, neck, 0.27, 0.62, 0);
      deer.rotation.y = 0.5;
      deer.scale.setScalar(1.6);
      deer.userData.tap = "deer";
      const deerBase = groundAt(deerAt[0], deerAt[1]);
      place(world, deer, deerAt[0], deerBase, deerAt[1]);
      occ.push({ x: deerAt[0], z: deerAt[1], r: 0.6, k: 0.3 });

      // A rabbit hopping about the meadow east of the cabin.
      const rabbit = new THREE.Group();
      place(rabbit, box(0.3, 0.2, 0.2, "#c09473"), 0, 0.12);
      place(rabbit, box(0.15, 0.15, 0.15, "#c09473"), 0.17, 0.22);
      for (const s of [-1, 1]) place(rabbit, box(0.05, 0.18, 0.05, "#ad7757"), 0.14, 0.38, s * 0.04);
      place(rabbit, box(0.08, 0.08, 0.08, "#ebede9"), -0.17, 0.16);
      rabbit.userData.tap = "rabbit";
      rabbit.scale.setScalar(2.0);
      // Object IDs for the outline pass; 8 and up are characters.
      person.userData.oid = 8;
      dog.userData.oid = 9;
      deer.userData.oid = 10;
      rabbit.userData.oid = 11;
      ducks.forEach((d) => (d.g.userData.oid = 12));
      place(world, rabbit, 10, groundAt(10, 3), 3);
      const bun = { x: 10, z: 3, fx: 10, fz: 3, tx: 10, tz: 3, hop: 1, wait: 1, hops: 0, fast: 0 };

      // ---------- grass, flowers, butterflies ----------
      const keepClear = (x: number, z: number) =>
        Math.hypot(x - cabinAt.x, z - cabinAt.z) < 2.3 ||
        Math.hypot(x - fireAt.x, z - fireAt.z) < 1.25 ||
        Math.hypot((x - pond.x) / pond.rx, (z - pond.z) / pond.rz) < 1.3;

      // Each tuft is three blades turned to face the camera, wide enough to
      // fill whole pixels, colored by the same broad patches as the ground,
      // darker at the root, lighter at the tip. Gusts roll across as a band
      // that bends the tufts and lifts their tips.
      const tuft = new THREE.BufferGeometry();
      const tp: number[] = [], tc: number[] = [];
      for (const [ox, hh, lean] of [[-0.11, 0.8, -0.05], [0, 1, 0.02], [0.11, 0.7, 0.06]]) {
        tp.push(ox - 0.07, 0, 0, ox + 0.07, 0, 0, ox + lean, hh, 0);
        tc.push(0.84, 0.84, 0.84, 0.84, 0.84, 0.84, 1.16, 1.16, 1.16);
      }
      tuft.setAttribute("position", new THREE.Float32BufferAttribute(tp, 3));
      tuft.setAttribute("color", new THREE.Float32BufferAttribute(tc, 3));
      tuft.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: 9 }, () => [0, 1, 0]).flat(), 3));
      const grassMat = new THREE.MeshToonMaterial({ gradientMap: ramp, side: THREE.DoubleSide, vertexColors: true });
      grassMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uTime;
        shader.uniforms.uPix = uPix;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform float uPix;\nvarying float vGust;")
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float band = sin(uTime * 0.6 - root.x * 0.18 + root.z * 0.08);
            float gust = smoothstep(0.3, 1.0, band);
            // Like hand-pixelled grass: tips lean by whole pixels only, so
            // wind reads as a slow wave instead of shimmering speckle.
            float px = uPix / 1.5; // tufts are 1.5x wide, so one world pixel in their own units
            transformed.x += floor((0.02 + gust * 0.09) * position.y / px + 0.5) * px;
            vGust = gust * position.y;`
          );
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying float vGust;")
          .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb *= 1.0 + vGust * 0.08;");
      };
      const tints = ["#4d8a30", "#579636", "#62a23b"].map(col);
      const COUNT = 4200;
      const grass = new THREE.InstancedMesh(tuft, grassMat, COUNT);
      grass.receiveShadow = true;
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eul = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), tint = new THREE.Color();
      let n = 0;
      for (let tries = 0; n < COUNT && tries < COUNT * 6; tries++) {
        const x = (rnd() * 2 - 1) * RX, z = (rnd() * 2 - 1) * RZ;
        const r = shapeR(x, z);
        if (r > 0.97) continue;
        const h = terrainH(x, z);
        if (h > 1.0 || h < 0.12 || keepClear(x, z) || Math.abs(x - streamX(z)) < 0.9) continue;
        if (r > 0.75 && rnd() < (r - 0.75) / 0.22) continue;
        eul.set(0, (rnd() - 0.5) * 0.5, 0);
        q.setFromEuler(eul);
        const p = patch(x, z);
        // Fewer, bigger tufts that read as little sprites on flat ground.
        m4.compose(v3.set(x, h - 0.03, z), q, s3.set(1.5, 0.36 + p * 0.16 + rnd() * 0.08, 1));
        grass.setMatrixAt(n, m4);
        grass.setColorAt(n, tint.copy(tints[p < 0.4 ? 0 : p > 0.62 ? 2 : 1]).multiplyScalar(aoAt(x, z)));
        n++;
      }
      grass.count = n;
      world.add(grass);

      // Wildflowers in small clusters.
      const FLOWER = ["#df84a5", "#e8c170", "#ebede9", "#c65197", "#a4dddb"].map(col);
      const flowers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshToonMaterial({ gradientMap: ramp }), 260);
      const clusters: [number, number][] = [];
      let fn = 0;
      for (let tries = 0; clusters.length < 38 && tries < 600; tries++) {
        const cx = (rnd() * 2 - 1) * (RX - 3), cz = (rnd() * 2 - 1) * (RZ - 1.5);
        if (!meadowOK(cx, cz) || keepClear(cx, cz)) continue;
        clusters.push([cx, cz]);
        const fc = FLOWER[clusters.length % FLOWER.length];
        for (let k = 0; k < 6 && fn < 260; k++) {
          const x = cx + (rnd() - 0.5) * 0.8, z = cz + (rnd() - 0.5) * 0.6;
          m4.compose(v3.set(x, terrainH(x, z) + 0.2 + rnd() * 0.06, z), q.identity(), s3.set(1, 1, 1));
          flowers.setMatrixAt(fn, m4);
          flowers.setColorAt(fn, fc);
          fn++;
        }
      }
      flowers.count = fn;
      place(world, flowers, 0, 0, 0, false);

      const butterflies = [0, 1, 2, 3].map((i) => {
        const g = new THREE.Group();
        const m = glow(["#df84a5", "#ebede9", "#e8c170", "#a4dddb"][i]);
        const wings = [-1, 1].map((s) => {
          const w = new THREE.Group();
          const wm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.17), m);
          wm.position.x = s * 0.09;
          w.add(wm);
          g.add(w);
          return w;
        });
        world.add(g);
        const [cx, cz] = clusters[(i * 7) % Math.max(1, clusters.length)] ?? [0, 3];
        return { g, wings, cx, cz, p: i * 1.7 };
      });

      // ---------- bake contact shadows into the ground ----------
      for (let i = 0; i < cent.length / 2; i++) {
        const f = aoAt(cent[i * 2], cent[i * 2 + 1]);
        if (f > 0.999) continue;
        for (let v = 0; v < 3; v++) {
          const o = (i * 3 + v) * 3;
          cols[o] *= f;
          cols[o + 1] *= f;
          cols[o + 2] *= f;
        }
      }
      terrainCol.copyArray(cols);
      terrainCol.needsUpdate = true;

      // ---------- merge static props into a few meshes ----------
      const mergeInto = (grp: T.Group) => {
        grp.updateMatrixWorld(true);
        const byMat = new Map<T.Material, T.BufferGeometry[]>();
        const rel = new THREE.Matrix4();
        grp.traverse((o) => {
          const m = o as T.Mesh;
          if (!m.isMesh) return;
          const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
          for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
          g.applyMatrix4(rel.multiplyMatrices(worldInv, m.matrixWorld));
          const mat = m.material as T.Material;
          if (!byMat.has(mat)) byMat.set(mat, []);
          byMat.get(mat)!.push(g);
          m.geometry.dispose();
        });
        world.remove(grp);
        const out: T.Mesh[] = [];
        byMat.forEach((gs, mat) => {
          const merged = mergeGeometries(gs);
          gs.forEach((g) => g.dispose());
          if (!merged) return;
          const mm = new THREE.Mesh(merged, mat);
          mm.castShadow = mm.receiveShadow = true;
          world.add(mm);
          out.push(mm);
        });
        return out;
      };
      mergeInto(statics);
      const treeMeshes = mergeInto(treesGroup);
      treeMeshes.forEach((m) => (m.userData.oid = 2));
      mergeInto(rocks).forEach((m) => (m.userData.oid = 3));
      cabin.userData.oid = 4;
      fire.userData.oid = 5;
      flames.forEach((f) => (f.userData.oid = 0));

      // ---------- one-shot effects ----------
      const sparkMats = [glow("#e8c170"), glow("#de9e41"), glow("#cf573c")];
      const sparks = Array.from({ length: 30 }, (_, i) => ({ m: place(world, new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), sparkMats[i % 3]), 0, -9, 0, false), v: new THREE.Vector3(), life: 0 }));
      const leaves = Array.from({ length: 36 }, () => ({ m: place(world, new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.11), toon("#468232")), 0, -9, 0, false), x: 0, z: 0, y: 0, ground: 0, life: 0, p: 0 }));
      const ripples = Array.from({ length: 4 }, () => {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 24), new THREE.MeshBasicMaterial({ color: col("#ebede9"), transparent: true }));
        m.rotation.x = -Math.PI / 2;
        place(world, m, 0, -9, 0, false);
        return { m, life: 0, delay: 0 };
      });
      let flare = 0, dogHop = 0, deerLeap = 0, lightsOn = true;
      let jump: { x: number; z: number; t: number } | null = null;

      // Which object each mesh belongs to, for the ID pass. Translucent
      // things (smoke, ripples) stay out of it.
      const idMeshes: T.Mesh[] = [], idOf: number[] = [], savedMats: (T.Material | T.Material[])[] = [], savedVis: boolean[] = [];
      world.traverse((o) => {
        const m = o as T.Mesh;
        if (!m.isMesh) return;
        let p: T.Object3D | null = o, id = 0;
        while (p) {
          if (p.userData.oid !== undefined) {
            id = p.userData.oid as number;
            break;
          }
          p = p.parent;
        }
        idMeshes.push(m);
        idOf.push((m.material as T.Material).transparent ? -1 : id);
      });

      // ---------- sizing ----------
      const fit = () => {
        const PX = pxFor(host.clientWidth);
        const w = Math.max(1, Math.round(host.clientWidth / PX));
        const h = Math.max(1, Math.round(host.clientHeight / PX));
        renderer.setSize(w, h, false);
        target.setSize(w, h);
        idTarget.setSize(w, h);
        post.uniforms.uRes.value.set(w, h);
        let halfH = 9.4;
        let halfW = halfH * (w / h);
        if (halfW > 22) {
          halfW = 22;
          halfH = halfW / (w / h);
        }
        Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        uPix.value = (halfW * 2) / w;
        post.uniforms.uInvVP.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert();
      };
      fit();
      renderer.shadowMap.autoUpdate = false;
      const render = () => {
        renderer.shadowMap.needsUpdate = true;
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        // The ID pass: same scene, every mesh in its object's flat ID color.
        for (let i = 0; i < idMeshes.length; i++) {
          savedMats[i] = idMeshes[i].material;
          savedVis[i] = idMeshes[i].visible;
          if (idOf[i] < 0) idMeshes[i].visible = false;
          else idMeshes[i].material = idMats[idOf[i]];
        }
        renderer.setRenderTarget(idTarget);
        renderer.render(scene, camera);
        for (let i = 0; i < idMeshes.length; i++) {
          idMeshes[i].material = savedMats[i];
          idMeshes[i].visible = savedVis[i];
        }
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCam);
      };

      // ---------- time of day ----------
      const KC = KEYS.map((k) => ({ ...k, skyC: col(k.sky), groundC: col(k.ground), sunC: col(k.sun), hazeS: srgb(k.haze) }));
      let nightF = 0, lastH = -1;
      const daySmoke = col("#bdbab2"), nightSmoke = col("#b4bccb"), dayBird = col("#2e3238"), nightBird = col("#2b3046");
      const applyLight = (h: number) => {
        if (Math.abs(h - lastH) < 1e-4) return;
        lastH = h;
        let i = 0;
        while (i < KC.length - 2 && KC[i + 1].h <= h) i++;
        const a = KC[i], b = KC[i + 1];
        const k0 = Math.min(1, Math.max(0, (h - a.h) / (b.h - a.h || 1)));
        const k = k0 * k0 * (3 - 2 * k0);
        hemi.color.lerpColors(a.skyC, b.skyC, k);
        hemi.groundColor.lerpColors(a.groundC, b.groundC, k);
        hemi.intensity = lerp(a.hemi, b.hemi, k);
        sun.color.lerpColors(a.sunC, b.sunC, k);
        sun.intensity = lerp(a.sunI, b.sunI, k);
        sun.position.set(lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k));
        nightF = lerp(a.night, b.night, k);
        post.uniforms.uHaze.value.set(lerp(a.hazeS[0], b.hazeS[0], k), lerp(a.hazeS[1], b.hazeS[1], k), lerp(a.hazeS[2], b.hazeS[2], k));
        wU.cDeep.value.lerpColors(WATER.day.deep, WATER.night.deep, nightF);
        wU.cLight.value.lerpColors(WATER.day.light, WATER.night.light, nightF);
        wU.cFoam.value.lerpColors(WATER.day.foam, WATER.night.foam, nightF);
        wU.cRefl.value.lerpColors(WATER.day.refl, WATER.night.refl, nightF);
        wU.cSky.value.copy(hemi.color);
        smokeMats.forEach((m) => m.color.lerpColors(daySmoke, nightSmoke, nightF));
        birdMat.color.lerpColors(dayBird, nightBird, nightF);
      };

      const forced = forcedHour();
      const baseHourNow = () => forced ?? renoHour();
      let base = baseHourNow(), baseAt = performance.now();
      let hour = base;
      let scrubbing = false, releasedAt = -1, returnFrom = 0;
      const wrap = (d: number) => ((((d + 12) % 24) + 24) % 24) - 12;
      const mod24 = (h: number) => ((h % 24) + 24) % 24;
      // The clock text is written straight to the DOM every frame, so it
      // rolls smoothly while scrubbing; React only re-renders the label when
      // the part of day or the live/preview state changes.
      let viewKey = "", timeText = "";
      const report = () => {
        const live = !scrubbing && releasedAt < 0;
        const text = fmtHour(hour);
        if (text !== timeText && timeRef.current) {
          timeText = text;
          timeRef.current.textContent = text;
        }
        const key = `${partOfDay(hour)}|${live}`;
        if (key === viewKey) return;
        viewKey = key;
        setView({ hour, live, forced: forced !== null });
      };

      // ---------- interaction ----------
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const targets: T.Object3D[] = [fire, cabin, deer, rabbit, ...ducks.map((d) => d.g), ...waterMeshes];
      const pick = (cx: number, cy: number) => {
        const r = host.getBoundingClientRect();
        ndc.set(((cx - r.left) / r.width) * 2 - 1, -(((cy - r.top) / r.height) * 2 - 1));
        ray.setFromCamera(ndc, camera);
        for (const h of ray.intersectObjects([...targets, ...treeMeshes], true)) {
          let o: T.Object3D | null = h.object;
          while (o && !o.userData.tap) o = o.parent;
          if (o) return { tag: o.userData.tap as string, point: world.worldToLocal(h.point.clone()) };
          if (treeMeshes.includes(h.object as T.Mesh)) return { tag: "tree", point: world.worldToLocal(h.point.clone()) };
        }
        return null;
      };
      let bubbleTimer = 0;
      const bubble = (text: string, local: T.Vector3) => {
        const p = world.localToWorld(local.clone()).project(camera);
        bubbleEl.textContent = text;
        bubbleEl.style.left = `${((p.x + 1) / 2) * host.clientWidth}px`;
        bubbleEl.style.top = `${((1 - p.y) / 2) * host.clientHeight}px`;
        bubbleEl.classList.remove("is-on");
        void bubbleEl.offsetWidth;
        bubbleEl.classList.add("is-on");
        window.clearTimeout(bubbleTimer);
        bubbleTimer = window.setTimeout(() => bubbleEl.classList.remove("is-on"), 1300);
      };
      const tap = (cx: number, cy: number) => {
        const hit = pick(cx, cy);
        if (!hit) return;
        if (hit.tag === "fire") {
          flare = 1;
          sparks.forEach((s) => {
            s.life = 1;
            s.m.position.set(fireAt.x + (Math.random() - 0.5) * 0.3, groundAt(fireAt.x, fireAt.z) + 0.6, fireAt.z + (Math.random() - 0.5) * 0.3);
            s.v.set((Math.random() - 0.5) * 2.2, 2.5 + Math.random() * 3, (Math.random() - 0.5) * 2.2);
          });
        } else if (hit.tag === "pond" || hit.tag === "duck") {
          ripples.forEach((r, i) => {
            r.life = 1;
            r.delay = i * 0.28;
            r.m.position.set(hit.point.x, -0.04, hit.point.z);
          });
          if (hit.tag === "duck") bubble("quack!", new THREE.Vector3(hit.point.x, 0.7, hit.point.z));
          else jump = { x: hit.point.x, z: hit.point.z, t: 0 };
        } else if (hit.tag === "dog" || hit.tag === "person") {
          dogHop = 1;
          const off = hit.tag === "dog" ? new THREE.Vector3(0.1, 1.2, 0.95) : new THREE.Vector3(-0.95, 1.7, 0.2);
          bubble(hit.tag === "dog" ? "woof!" : "hey!", off.add(fire.position));
        } else if (hit.tag === "cabin") {
          lightsOn = !lightsOn;
        } else if (hit.tag === "deer") {
          deerLeap = 1;
        } else if (hit.tag === "rabbit") {
          bun.fast = 3;
          bun.wait = 0;
          bun.hops = 0;
        } else if (hit.tag === "tree") {
          let best = trees[0], bd = 1e9;
          for (const t of trees) {
            const d = Math.hypot(t.x - hit.point.x, t.z - hit.point.z);
            if (d < bd) {
              bd = d;
              best = t;
            }
          }
          const mat = toon(best.leaf);
          for (let i = 0; i < 12; i++) {
            const L = leaves.find((x) => x.life <= 0);
            if (!L) break;
            L.life = 1;
            L.x = best.x + (Math.random() - 0.5) * 1.1;
            L.z = best.z + (Math.random() - 0.5) * 0.9;
            L.y = best.top - Math.random() * 0.6;
            L.ground = groundAt(L.x, L.z) + 0.05;
            L.p = Math.random() * 10 + i;
            L.m.material = mat;
          }
        }
      };

      let hovering = false, lastHover = 0;
      let down: { x: number; y: number; hour: number; id: number } | null = null;
      host.style.touchAction = "pan-y";
      host.style.cursor = "grab";
      const onEnter = () => (hovering = true);
      const onLeave = () => (hovering = false);
      const onDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        down = { x: e.clientX, y: e.clientY, hour, id: e.pointerId };
      };
      const onMove = (e: PointerEvent) => {
        if (down && e.pointerId === down.id) {
          const dx = e.clientX - down.x;
          if (!scrubbing && Math.abs(dx) > 6) {
            scrubbing = true;
            releasedAt = -1;
            host.setPointerCapture(e.pointerId);
            host.style.cursor = "grabbing";
            document.documentElement.classList.add("is-stretching");
          }
          if (scrubbing) {
            hour = mod24(down.hour + (dx / host.clientWidth) * 24);
            kick();
          }
          return;
        }
        if (e.pointerType !== "mouse" || performance.now() - lastHover < 90) return;
        lastHover = performance.now();
        host.style.cursor = pick(e.clientX, e.clientY) ? "pointer" : "grab";
      };
      const end = (e: PointerEvent, cancelled: boolean) => {
        if (!down || e.pointerId !== down.id) return;
        if (scrubbing) {
          scrubbing = false;
          releasedAt = performance.now();
          returnFrom = hour;
          host.style.cursor = "grab";
          document.documentElement.classList.remove("is-stretching");
          kick();
        } else if (!cancelled) {
          tap(e.clientX, e.clientY);
          kick();
        }
        down = null;
      };
      const onUp = (e: PointerEvent) => end(e, false);
      const onCancel = (e: PointerEvent) => end(e, true);
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onCancel);

      // ---------- the loop ----------
      let wave = 0, deerUp = 0, lastT = performance.now();
      const animate = (now: number) => {
        const t = now / 1000;
        const dt = Math.min(0.1, (now - lastT) / 1000);
        lastT = now;
        // Water and wind run on a slower clock than the wall clock.
        uTime.value = t * 0.45;

        if (now - baseAt > 10000) {
          base = baseHourNow();
          baseAt = now;
        }
        if (!scrubbing) {
          if (releasedAt >= 0) {
            // Hold the chosen time a moment, then ease back to Reno time.
            const since = (now - releasedAt) / 1000;
            if (since > 1.8 || reduce) {
              const k = reduce ? 1 : Math.min(1, (since - 1.8) / 2.2);
              // Ease in and out, so the clock rolls back instead of jumping.
              const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
              hour = mod24(returnFrom + wrap(base - returnFrom) * e);
              if (k >= 1) releasedAt = -1;
            }
          } else hour = base;
        }
        applyLight(hour);
        report();

        const lit = nightF > 0.35;
        windowMat.color.set(lightsOn ? (lit ? "#ffcf6a" : "#e8c170") : lit ? "#151d28" : "#577277");
        lanternMat.color.set(lightsOn ? "#ffcf6a" : "#394a50");
        lanternLight.intensity = lightsOn ? lerp(1.4, 3, nightF) + Math.sin(t * 3.1) * 0.15 : 0;
        lanternLight.distance = lerp(3, 5, nightF);
        flare = Math.max(0, flare - dt * 1.2);
        const flick = 0.85 + Math.sin(t * 3.5) * 0.09 + Math.sin(t * 7.3) * 0.06;
        flames.forEach((f, i) => {
          const sy = (0.78 + Math.sin(t * (3.2 + i * 1.4) + i * 2) * 0.18 + Math.sin(t * 6 + i) * 0.06) * (1 + flare * 0.9);
          f.scale.set(1 + flare * 0.3, sy, 1 + flare * 0.3);
          f.position.y = 0.2 + sy * 0.3;
        });
        fireLight.intensity = lerp(4, 6.5, nightF) * flick * (1 + flare * 1.2);
        fireLight.distance = lerp(5.5, 8.5, nightF);

        puffs.forEach(({ m, o, from, rate, rise, drift, grow, chimney }) => {
          const life = (t * rate + o) % 1;
          const up = 1 - Math.pow(1 - life, 1.6);
          if (chimney) {
            // Leans left early into the gap between the peaks, then climbs
            // in a lazy S-curve, clear of the mountains, into open sky.
            const lean = drift * (1 - Math.pow(1 - Math.min(1, life * 1.6), 2));
            m.position.set(from.x + lean + Math.sin(life * 7.5 + t * 0.25) * 0.32 * life, from.y + up * rise, from.z - life * 0.3);
          } else m.position.set(from.x + Math.sin(life * 5 + o * 9) * 0.3 + life * life * drift, from.y + up * rise, from.z - life * 0.6);
          m.scale.setScalar(0.55 + life * grow);
          (m.material as T.MeshToonMaterial).opacity = Math.min(1, life * 8) * Math.pow(1 - life, 0.8) * 0.9;
        });

        // The person waves while you're here; the dog's tail never stops.
        wave += ((hovering ? 1 : 0) - wave) * Math.min(1, dt * 6);
        arm.rotation.z = -wave * (2.5 + Math.sin(t * 5) * 0.35);
        dogHop = Math.max(0, dogHop - dt * 2.2);
        tail.rotation.y = Math.sin(t * (hovering || dogHop > 0 ? 9 : 3)) * 0.6;
        dog.position.y = Math.abs(Math.sin(dogHop * Math.PI * 2)) * 0.22 * dogHop;

        birds.forEach((b) => {
          const span = RX * 2.4;
          const x = ((t * b.speed + b.o * span) % span) - span / 2;
          b.g.position.set(x, b.y + Math.sin(t * 0.8 + b.o * 9) * 0.3, b.z);
          b.g.visible = nightF < 0.6;
          const beat = Math.floor(t * 2.6 + b.o * 10);
          const flap = beat % 6 > 3 ? 0.3 : beat % 2 ? 0.55 : -0.45;
          b.wings[0].rotation.z = -flap;
          b.wings[1].rotation.z = flap;
        });

        // The fish leaps now and then, or where the pond was clicked.
        if (jump) {
          jump.t += dt / 1.1;
          if (jump.t >= 1) jump = null;
        }
        const leap = jump ? jump.t : (t % 7) / 1.1;
        if (leap < 1) {
          const fx = jump ? jump.x - 0.45 : pond.x - 0.8, fz = jump ? jump.z : pond.z - 0.2;
          fish.position.set(fx + leap * 0.9, -0.05 + Math.sin(leap * Math.PI) * 0.6, fz);
          fish.rotation.z = (0.5 - leap) * 2;
        } else fish.position.y = -1;

        ducks.forEach((d, i) => {
          d.a += dt * d.speed;
          const cx = pond.x - 0.9, rx = pond.rx * 0.36, rz = pond.rz * 0.42;
          const x = cx + Math.cos(d.a) * rx, z = pond.z + Math.sin(d.a) * rz;
          d.g.position.set(x, -0.06 + Math.sin(t * 2 + i) * 0.015, z);
          d.g.rotation.y = Math.atan2(-Math.cos(d.a) * rz, -Math.sin(d.a) * rx);
        });

        flies.forEach(({ f, x, z, p }) => {
          f.position.set(x + Math.sin(t * 0.5 + p) * 0.6, groundAt(x, z) + 0.5 + Math.sin(t * 0.9 + p * 2) * 0.3, z + Math.cos(t * 0.4 + p) * 0.5);
          f.visible = nightF > 0.5 && Math.sin(t * 1.1 + p * 3) > -0.1;
        });
        butterflies.forEach((b) => {
          const x = b.cx + Math.sin(t * 0.6 + b.p) * 1.1 + Math.sin(t * 1.7 + b.p * 2) * 0.3;
          const z = b.cz + Math.cos(t * 0.5 + b.p) * 0.7;
          b.g.position.set(x, groundAt(x, z) + 0.55 + Math.sin(t * 2.3 + b.p) * 0.18, z);
          b.g.visible = nightF < 0.4;
          const open = Math.floor(t * 3.5 + b.p * 3) % 2 === 0;
          b.wings[0].rotation.z = open ? 0 : 1.1;
          b.wings[1].rotation.z = open ? 0 : -1.1;
        });

        // The deer grazes, lifts its head now and then, and holds it up
        // while you're here. Click it and it bounds.
        const curious = hovering || t % 9 > 6.5 || deerLeap > 0;
        deerUp += ((curious ? 1 : 0) - deerUp) * Math.min(1, dt * 4);
        neck.rotation.z = lerp(-2.05, -0.2, deerUp);
        deerLeap = Math.max(0, deerLeap - dt * 0.9);
        deer.position.y = deerBase + Math.abs(Math.sin(deerLeap * Math.PI * 2)) * 0.55 * Math.min(1, deerLeap * 3);
        deer.rotation.z = deerLeap > 0 ? Math.sin(deerLeap * Math.PI * 4) * 0.15 : 0;

        // The rabbit: a few hops, a pause, a few more.
        if (bun.wait > 0) bun.wait -= dt;
        else {
          if (bun.hop >= 1) {
            if (bun.hops <= 0) {
              let tx = bun.x, tz = bun.z;
              for (let k = 0; k < 12; k++) {
                const a = Math.random() * Math.PI * 2, d = (bun.fast > 0 ? 2.2 : 1) + Math.random() * 1.4;
                tx = Math.min(14, Math.max(6.5, bun.x + Math.cos(a) * d));
                tz = Math.min(4.6, Math.max(1.6, bun.z + Math.sin(a) * d));
                if (meadowOK(tx, tz, 0.12, 1.0) && Math.hypot(tx - cabinAt.x, tz - cabinAt.z) > 2.6) break;
              }
              bun.tx = tx;
              bun.tz = tz;
              bun.hops = Math.max(1, Math.round(Math.hypot(tx - bun.x, tz - bun.z) / 0.45));
            }
            bun.fx = bun.x;
            bun.fz = bun.z;
            bun.hop = 0;
          }
          bun.hop = Math.min(1, bun.hop + dt / (bun.fast > 0 ? 0.2 : 0.32));
          const dx = bun.tx - bun.fx, dz = bun.tz - bun.fz, len = Math.hypot(dx, dz) || 1;
          const sl = Math.min(len, 0.45);
          bun.x = bun.fx + (dx / len) * sl * bun.hop;
          bun.z = bun.fz + (dz / len) * sl * bun.hop;
          rabbit.rotation.y = Math.atan2(-dz, dx);
          rabbit.position.set(bun.x, groundAt(bun.x, bun.z) + Math.sin(bun.hop * Math.PI) * 0.22, bun.z);
          if (bun.hop >= 1) {
            bun.hops -= 1;
            if (bun.hops <= 0) {
              bun.fast = Math.max(0, bun.fast - 1);
              bun.wait = bun.fast > 0 ? 0.05 : 1 + Math.random() * 2.5;
            }
          }
        }

        sparks.forEach((s) => {
          if (s.life <= 0) return;
          s.life -= dt * 0.85;
          s.v.y -= dt * 5;
          s.m.position.addScaledVector(s.v, dt);
          s.m.scale.setScalar(Math.max(0.01, s.life));
          if (s.life <= 0) s.m.position.y = -9;
        });
        leaves.forEach((l) => {
          if (l.life <= 0) return;
          l.y = Math.max(l.ground, l.y - dt * 0.7);
          if (l.y <= l.ground) l.life -= dt * 0.6;
          l.m.position.set(l.x + Math.sin(t * 2 + l.p) * 0.3, l.y, l.z + Math.cos(t * 1.6 + l.p) * 0.15);
          l.m.rotation.set(Math.sin(t * 3 + l.p), t + l.p, 0);
          l.m.scale.setScalar(Math.min(1, l.life * 3));
          if (l.life <= 0) l.m.position.y = -9;
        });
        ripples.forEach((r) => {
          if (r.life <= 0) return;
          if (r.delay > 0) {
            r.delay -= dt;
            r.m.visible = false;
            return;
          }
          r.m.visible = true;
          r.life -= dt * 0.8;
          const s = 0.15 + (1 - r.life) * 0.75;
          r.m.scale.set(s, s * 0.8, 1);
          (r.m.material as T.MeshBasicMaterial).opacity = Math.max(0, r.life);
          if (r.life <= 0) r.m.position.y = -9;
        });

        render();
      };

      // Like hand-drawn pixel animation, the scene steps at 12 frames a
      // second; dragging the time runs at full rate so it stays responsive.
      let raf = 0, visible = true, lastStep = 0;
      const STEP = 1000 / 12;
      const frame = (now: number) => {
        // With reduced motion the scene stays still, and only runs while
        // the time is being scrubbed or is easing back.
        if (reduce && !scrubbing && releasedAt < 0) {
          raf = 0;
          animate(now);
          return;
        }
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        // Full rate while the time is moving, so the clock rolls smoothly.
        if (scrubbing || releasedAt >= 0 || now - lastStep >= STEP) {
          lastStep = now;
          animate(now);
        }
      };
      function kick() {
        if (!raf) raf = requestAnimationFrame(frame);
      }
      animate(performance.now());
      if (!reduce) raf = requestAnimationFrame(frame);
      const clockTimer = reduce ? window.setInterval(() => kick(), 30000) : 0;

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
        window.clearInterval(clockTimer);
        window.clearTimeout(bubbleTimer);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointercancel", onCancel);
        document.documentElement.classList.remove("is-stretching");
        scene.traverse((o) => (o as T.Mesh).geometry?.dispose());
        mats.forEach((m) => m.dispose());
        target.dispose();
        idTarget.dispose();
        idMats.forEach((m) => m.dispose());
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const label = view ? TOD_LABEL[partOfDay(view.hour)] : null;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={ref}
        role="img"
        aria-label="An animated pixel-art landscape: snowy mountains, a stream and pond with ducks and a dock, a log cabin, a deer, a rabbit, and someone by a campfire with their dog. Its light follows the time of day in Reno."
        className="d-host"
        style={{ width: "100%", height }}
      />
      <div ref={bubbleRef} className="d-bubble" aria-hidden />
      {view && label && (
        <p className="d-clock" title="The light in the scene follows the time where I live.">
          <span className="d-dot" style={{ background: label.dot }} />
          {view.live ? `${label.name} in Reno, NV` : label.name}
          <span className="d-sep">·</span>
          <time ref={timeRef}>{fmtHour(view.hour)}</time>
          <span className="d-sep">·</span>
          <span className="d-hint">{view.live ? (view.forced ? "preview time" : "drag the scene to change the time") : "let go to return to Reno time"}</span>
        </p>
      )}
      <style>{`
        /* Phones: the banner takes the island's own shape, so all of it fits. */
        @media (max-width: 640px) { .d-host { height: auto !important; aspect-ratio: 2.9 / 1; } .d-clock { padding: 0 24px; } }
        .d-clock {
          display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 8px;
          margin: 10px 0 0; font-family: var(--font-geist-mono), monospace;
          font-size: 11.5px; letter-spacing: 0.01em; color: #8A8F98;
          font-variant-numeric: tabular-nums;
        }
        .d-dot { width: 7px; height: 7px; border-radius: 2px; flex: none; transition: background .4s; }
        .d-sep { color: #C4C7CC; }
        .d-clock time { color: #13181B; }
        .d-hint { color: #A8ABB2; }
        .d-bubble {
          position: absolute; left: 0; top: 0; pointer-events: none;
          transform: translate(-50%, -100%) translateY(4px); opacity: 0;
          padding: 3px 7px 4px; background: #fff; color: #13181B;
          font-family: var(--font-geist-mono), monospace; font-size: 11px; line-height: 1;
          border: 2px solid #13181B; border-radius: 0;
          box-shadow: 2px 2px 0 #13181B;
          transition: opacity .15s, transform .15s;
          white-space: nowrap;
        }
        .d-bubble.is-on { opacity: 1; transform: translate(-50%, -100%) translateY(-2px); }
      `}</style>
    </div>
  );
}
