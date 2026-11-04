"use client";

import { useEffect, useRef } from "react";
import type * as T from "three";

/* A small campsite diorama in the style of 3D pixel art: a real three.js
   scene, modelled piece by piece, seen through an isometric camera and
   rendered at a third of its on-screen size, then scaled up with hard
   pixels. Two things make it read as pixel art rather than low-res 3D:
   stepped "toon" lighting (each surface gets two or three flat tones, not a
   smooth gradient), and a post pass that darkens a pixel wherever an object
   sits in front of another, which draws the crisp inner lines a pixel artist
   would. Everything moves smoothly at full frame rate: grass sways, the fire
   flickers and lights its surroundings, smoke drifts, the lantern glows. */

const PX = 3;

export default function Diorama({ height = 300 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ---------- shared helpers ----------
      let seed = 42;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const col = (h: string) => new THREE.Color(h);

      // Three flat tones per surface: shadow, mid, lit.
      const ramp = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
      ramp.minFilter = THREE.NearestFilter;
      ramp.magFilter = THREE.NearestFilter;
      ramp.needsUpdate = true;
      const mats = new Map<string, T.MeshToonMaterial>();
      const toon = (c: string) => {
        if (!mats.has(c)) mats.set(c, new THREE.MeshToonMaterial({ color: col(c), gradientMap: ramp }));
        return mats.get(c)!;
      };
      const add = <M extends T.Object3D>(parent: T.Object3D, m: M, x = 0, y = 0, z = 0) => {
        m.position.set(x, y, z);
        m.traverse((o) => {
          const mesh = o as T.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        parent.add(m);
        return m;
      };
      const box = (w: number, h: number, d: number, c: string) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c));
      const cyl = (rt: number, rb: number, h: number, c: string, seg = 7) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(c));

      // ---------- renderer and the pixel post pass ----------
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
            float d = dep(vec2(0.0));
            // An object in front of another gets a darker pixel on its edge.
            float diff = max(max(dep(vec2(1.0,0.0)) - d, dep(vec2(-1.0,0.0)) - d), max(dep(vec2(0.0,1.0)) - d, dep(vec2(0.0,-1.0)) - d));
            if (c.a > 0.0 && diff > 0.0012) c.rgb *= 0.62;
            // A soft highlight on top edges facing the sky.
            if (c.a > 0.0 && alp(vec2(0.0, 1.0)) == 0.0) c.rgb *= 1.18;
            gl_FragColor = c;
            #include <colorspace_fragment>
          }`,
        transparent: true,
      });
      const postScene = new THREE.Scene();
      postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // ---------- scene, camera, light ----------
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
      camera.position.set(14, 11.5, 14);
      camera.lookAt(0, 0.75, 0);

      scene.add(new THREE.HemisphereLight(col("#bfe1ff"), col("#5a4630"), 1.1));
      const sun = new THREE.DirectionalLight(col("#fff0d0"), 2.6);
      sun.position.set(-6, 12, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
      sun.shadow.bias = -0.002;
      scene.add(sun);

      const world = new THREE.Group();
      // Turned so the island's long side runs across the banner.
      world.rotation.y = 0.42;
      scene.add(world);

      // ---------- ground ----------
      const RX = 6.2, RZ = 4.2;
      const rim = (a: number) => 1 + Math.sin(a * 3 + 1) * 0.05 + Math.sin(a * 7) * 0.04 + Math.sin(a * 13 + 2) * 0.025;
      const shape = new THREE.Shape();
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        const r = rim(a);
        // Squared-off ellipse, so it reads as a cut-out patch of land.
        const x = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.7) * RX * r;
        const z = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.7) * RZ * r;
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      }
      const slab = new THREE.ExtrudeGeometry(shape, { depth: 0.45, bevelEnabled: false });
      slab.rotateX(Math.PI / 2);
      add(world, new THREE.Mesh(slab, [toon("#5f9a32"), toon("#6b4a2c")]));
      const insideR = (x: number, z: number) => {
        const a = Math.atan2(z / RZ, x / RX);
        return Math.hypot(x / RX, z / RZ) / rim(a);
      };

      // ---------- cabin ----------
      const cabin = new THREE.Group();
      const W = 2.8, D = 2.2, rows = 7, logR = 0.11;
      add(cabin, box(W + 0.5, 0.18, D + 0.5, "#6e4b2e"), 0, 0.09, 0); // floor deck
      for (let r = 0; r < rows; r++) {
        const y = 0.28 + r * logR * 1.9;
        const shade = r % 2 ? "#9b6a3f" : "#8a5c35";
        for (const s of [-1, 1]) {
          const fb = cyl(logR, logR, W + 0.3, shade);
          fb.rotation.z = Math.PI / 2;
          add(cabin, fb, 0, y + (r % 2) * 0.02, s * (D / 2));
          const lr = cyl(logR, logR, D + 0.3, shade);
          lr.rotation.x = Math.PI / 2;
          add(cabin, lr, s * (W / 2), y + 0.1, 0);
        }
      }
      const wallTop = 0.28 + rows * logR * 1.9;
      add(cabin, box(W - 0.1, wallTop, D - 0.1, "#7d5331"), 0, wallTop / 2, 0); // fill behind the logs
      // Gables and a thatched roof with an overhang.
      const gable = new THREE.Shape([new THREE.Vector2(-D / 2 - 0.1, 0), new THREE.Vector2(D / 2 + 0.1, 0), new THREE.Vector2(0, 1.05)]);
      for (const s of [-1, 1]) {
        const g = new THREE.Mesh(new THREE.ShapeGeometry(gable), toon("#8a5c35"));
        (g.material as T.MeshToonMaterial).side = THREE.DoubleSide;
        g.rotation.y = Math.PI / 2;
        add(cabin, g, s * (W / 2 + 0.02), wallTop, 0);
      }
      const pitch = Math.atan2(1.05, D / 2 + 0.1);
      const slope = Math.hypot(1.05, D / 2 + 0.1) + 0.45;
      for (const s of [-1, 1]) {
        const roof = new THREE.Group();
        for (let k = 0; k < 6; k++) {
          const thatch = box(W + 0.9, 0.12, slope / 6 + 0.06, k % 2 ? "#d9b46a" : "#c9a05a");
          add(roof, thatch, 0, k * 0.012, (k - 2.5) * (slope / 6));
        }
        roof.rotation.x = s * pitch;
        add(cabin, roof, 0, wallTop + 0.5, s * ((D / 2 + 0.1) / 2 + 0.05));
      }
      const ridge = cyl(0.09, 0.09, W + 1, "#a9844a");
      ridge.rotation.z = Math.PI / 2;
      add(cabin, ridge, 0, wallTop + 1.06, 0);
      // Door, window, chimney, porch lantern.
      add(cabin, box(0.62, 1.05, 0.08, "#4a2e1a"), 0.55, 0.72, D / 2 + 0.12);
      add(cabin, box(0.5, 0.93, 0.06, "#6b4126"), 0.55, 0.68, D / 2 + 0.15);
      const glass = new THREE.MeshBasicMaterial({ color: col("#ffd27a") });
      add(cabin, box(0.6, 0.48, 0.08, "#3d2616"), -0.65, 0.95, D / 2 + 0.12);
      add(cabin, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.06), glass), -0.65, 0.95, D / 2 + 0.16);
      for (let k = 0; k < 6; k++) add(cabin, box(0.42 - (k % 2) * 0.06, 0.2, 0.42, k % 2 ? "#8d8a84" : "#7a7771"), -0.95, wallTop + 0.4 + k * 0.2, -0.45);
      const lantern = new THREE.Group();
      add(lantern, box(0.14, 0.18, 0.14, "#2d2a26"));
      add(lantern, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), new THREE.MeshBasicMaterial({ color: col("#ffcf6a") })));
      add(cabin, lantern, 1.15, 1.3, D / 2 + 0.3);
      const lanternLight = new THREE.PointLight(col("#ffb453"), 1.6, 3.2, 1.8);
      lanternLight.position.set(1.15, 1.2, D / 2 + 0.5);
      cabin.add(lanternLight);
      // Woodpile against the side.
      for (let r = 0; r < 3; r++) {
        for (let k = 0; k < 4 - r; k++) {
          const lg = cyl(0.1, 0.1, 0.7, k % 2 ? "#7a4e2c" : "#8e5f35", 8);
          lg.rotation.x = Math.PI / 2;
          add(cabin, lg, W / 2 + 0.35, 0.28 + r * 0.18, -0.45 + k * 0.21 + r * 0.1);
        }
      }
      cabin.rotation.y = -0.42;
      add(world, cabin, 1.3, 0.0, -0.9);

      // ---------- campfire ----------
      const fireAt = new THREE.Vector3(-1.9, 0, 1.4);
      const fire = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15), toon(i % 2 ? "#9a9890" : "#7f7d76"));
        st.scale.y = 0.7;
        add(fire, st, Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5);
      }
      for (let i = 0; i < 4; i++) {
        const lg = cyl(0.05, 0.06, 0.62, "#4c2f1c");
        lg.rotation.z = 0.55;
        const g = new THREE.Group();
        g.add(lg);
        lg.position.set(0.12, 0.22, 0);
        g.rotation.y = (i / 4) * Math.PI * 2;
        add(fire, g);
      }
      const flameCols = ["#ffe36e", "#ffaa2c", "#ff6a1e"];
      const flames = flameCols.map((c, i) => {
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.2 - i * 0.04, 0.7 - i * 0.12, 6), new THREE.MeshBasicMaterial({ color: col(c) }));
        add(fire, f, (i - 1) * 0.06, 0.4, (i % 2) * 0.05);
        f.castShadow = false;
        return f;
      });
      const fireLight = new THREE.PointLight(col("#ff9b3d"), 4, 5.5, 1.5);
      fireLight.position.y = 0.7;
      fire.add(fireLight);
      // Log seats and someone sitting by the fire.
      for (const [x, z, rot] of [[-0.95, 0.15, 0.4], [0.75, 0.8, -0.9]] as const) {
        const seat = cyl(0.14, 0.14, 0.95, "#7a4e2c", 8);
        seat.rotation.z = Math.PI / 2;
        const g = new THREE.Group();
        g.add(seat);
        g.rotation.y = rot;
        add(fire, g, x, 0.14, z);
      }
      const person = new THREE.Group();
      add(person, box(0.3, 0.42, 0.24, "#2f4a6b"), 0, 0.5, 0); // jacket
      add(person, box(0.28, 0.12, 0.38, "#3a3632"), 0, 0.31, 0.12); // legs on the log
      add(person, box(0.22, 0.24, 0.12, "#3a3632"), 0, 0.17, 0.3);
      add(person, new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), toon("#e3b48c")), 0, 0.86, 0); // head
      add(person, cyl(0.17, 0.17, 0.08, "#b8462e", 8), 0, 0.98, 0); // beanie
      add(person, cyl(0.11, 0.15, 0.12, "#b8462e", 8), 0, 1.06, 0);
      person.rotation.y = 0.4 + Math.PI;
      add(fire, person, -0.95, 0.12, 0.2);
      add(world, fire, fireAt.x, 0, fireAt.z);

      // Smoke: puffs rising and drifting, recycled forever.
      const puffs = Array.from({ length: 8 }, (_, i) => {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), new THREE.MeshToonMaterial({ color: col("#dcdbd4"), gradientMap: ramp, transparent: true }));
        world.add(m);
        return { m, o: i / 8 };
      });

      // ---------- props ----------
      // Stepping stones from the front edge to the door.
      for (let i = 0; i < 6; i++) {
        const st = cyl(0.22 + rnd() * 0.06, 0.24, 0.07, i % 2 ? "#b7b2a6" : "#a6a195", 7);
        add(world, st, 1.85 + Math.sin(i * 0.9) * 0.25 - i * 0.05, 0.035, 0.75 + i * 0.52);
      }
      // A stump with an axe in it.
      const stump = new THREE.Group();
      add(stump, cyl(0.26, 0.3, 0.32, "#7a4e2c", 9), 0, 0.16, 0);
      add(stump, cyl(0.22, 0.22, 0.02, "#c9a46e", 9), 0, 0.33, 0);
      const axe = new THREE.Group();
      add(axe, cyl(0.025, 0.025, 0.5, "#a77a45", 5), 0, 0.25, 0);
      add(axe, box(0.18, 0.12, 0.04, "#8e9496"), 0.07, 0.48, 0);
      axe.rotation.z = -0.5;
      add(stump, axe, 0, 0.3, 0);
      add(world, stump, 3.6, 0, 1.0);
      // A short fence along the right edge.
      for (let i = 0; i < 5; i++) add(world, box(0.1, 0.55, 0.1, "#8e6a44"), 4.6, 0.27, -1.6 + i * 0.6);
      for (const y of [0.22, 0.42]) add(world, box(0.06, 0.06, 2.5, "#9b7650"), 4.6, y, -0.4);
      // Pines.
      const pine = (x: number, z: number, s: number) => {
        const g = new THREE.Group();
        add(g, cyl(0.07 * s, 0.1 * s, 0.5 * s, "#5a3a22"), 0, 0.25 * s, 0);
        const greens = ["#2f6b3a", "#3c7d42", "#4b8f48"];
        for (let i = 0; i < 3; i++) add(g, new THREE.Mesh(new THREE.ConeGeometry((0.62 - i * 0.15) * s, 0.75 * s, 8), toon(greens[i])), 0, (0.62 + i * 0.4) * s, 0);
        g.rotation.y = rnd() * Math.PI;
        add(world, g, x, 0, z);
      };
      pine(-4.6, -1.6, 1.25);
      pine(-3.7, -2.6, 1.0);
      pine(-5.1, 0.2, 0.85);
      pine(4.1, -2.7, 1.15);
      pine(-1.4, -3.0, 0.9);
      // Little rocky peaks behind.
      const peak = (x: number, z: number, r: number, h: number) => {
        const g = new THREE.ConeGeometry(r, h, 6, 2);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) if (pos.getY(i) > -h / 2 + 0.01 && pos.getY(i) < h / 2 - 0.01) pos.setX(i, pos.getX(i) * (0.8 + rnd() * 0.4));
        g.computeVertexNormals();
        const m = new THREE.Mesh(g, toon("#7d8794"));
        add(world, m, x, h / 2, z);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.38, h * 0.36, 6), toon("#f2f1ea"));
        add(world, cap, x, h - h * 0.18 + 0.01, z);
      };
      peak(-2.6, -3.3, 1.2, 2.6);
      peak(-0.3, -3.5, 0.9, 1.9);
      peak(3.0, -3.4, 1.0, 2.2);
      // Bushes and rocks.
      const bush = (x: number, z: number, s: number) => {
        const g = new THREE.Group();
        for (let i = 0; i < 4; i++) add(g, new THREE.Mesh(new THREE.IcosahedronGeometry((0.22 + rnd() * 0.12) * s, 0), toon(i % 2 ? "#4f8d36" : "#5f9e3c")), (rnd() - 0.5) * 0.4 * s, 0.2 * s, (rnd() - 0.5) * 0.3 * s);
        add(world, g, x, 0, z);
      };
      bush(-3.2, -1.0, 1.1);
      bush(0.1, 2.4, 0.9);
      bush(3.9, 2.0, 1.0);
      bush(-4.3, 2.0, 0.9);
      for (const [x, z, s] of [[-0.6, -1.9, 0.3], [2.8, 2.6, 0.24], [-4.9, -1.2, 0.34], [0.9, -2.6, 0.22]] as const) {
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s), toon("#8a8f92"));
        r.scale.y = 0.65;
        add(world, r, x, s * 0.4, z);
      }

      // ---------- grass ----------
      const blade = new THREE.BufferGeometry();
      blade.setAttribute("position", new THREE.Float32BufferAttribute([-0.04, 0, 0, 0.04, 0, 0, 0, 1, 0], 3));
      blade.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
      const grassMat = new THREE.MeshToonMaterial({ gradientMap: ramp, side: THREE.DoubleSide });
      const uTime = { value: 0 };
      grassMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uTime;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;")
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float sway = sin(uTime * 1.6 + root.x * 0.9 + root.z * 0.6) * 0.6 + sin(uTime * 2.9 + root.x * 2.1) * 0.2;
            transformed.x += sway * position.y * 0.22;`
          );
      };
      const COUNT = 7000;
      const grass = new THREE.InstancedMesh(blade, grassMat, COUNT);
      grass.receiveShadow = true;
      const tints = ["#4f8f2a", "#5fa232", "#72b23a", "#8cc446", "#a6d257"].map(col);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
      const clear = (x: number, z: number) =>
        (Math.abs(x - 1.3) < 1.95 && Math.abs(z + 0.9) < 1.6) || // cabin
        Math.hypot(x - fireAt.x, z - fireAt.z) < 1.1 || // fire
        Math.hypot(x - 3.6, z - 1.0) < 0.35; // stump
      let n = 0;
      for (let tries = 0; n < COUNT && tries < COUNT * 5; tries++) {
        const x = (rnd() * 2 - 1) * RX, z = (rnd() * 2 - 1) * RZ;
        const r = insideR(x, z);
        if (r > 0.98 || clear(x, z)) continue;
        if (r > 0.7 && rnd() < (r - 0.7) / 0.3) continue; // fray toward the rim
        e.set((rnd() - 0.5) * 0.5, rnd() * Math.PI, (rnd() - 0.5) * 0.5);
        q.setFromEuler(e);
        m4.compose(v3.set(x, 0, z), q, s3.set(1, 0.18 + rnd() * 0.24, 1));
        grass.setMatrixAt(n, m4);
        grass.setColorAt(n, tints[Math.floor(rnd() * tints.length)]);
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
        // Keep the whole diorama in frame at any width, centered with air around it.
        let halfH = 3.75;
        let halfW = halfH * (w / h);
        if (halfW < 6.6) {
          halfW = 6.6;
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

      // ---------- animation ----------
      let raf = 0, visible = true;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const t = now / 1000;
        uTime.value = t;
        const flick = 0.82 + Math.sin(t * 11) * 0.1 + Math.sin(t * 27) * 0.08;
        flames.forEach((f, i) => {
          const sy = 0.75 + Math.sin(t * (9 + i * 4) + i * 2) * 0.22 + Math.sin(t * 23 + i) * 0.08;
          f.scale.set(1, sy, 1);
          f.position.y = 0.2 + sy * 0.3;
        });
        fireLight.intensity = 4 * flick;
        lanternLight.intensity = 1.5 + Math.sin(t * 3.1) * 0.12;
        puffs.forEach(({ m, o }) => {
          const life = (t * 0.18 + o) % 1;
          m.position.set(fireAt.x + Math.sin(life * 4 + o * 9) * 0.25 + life * 0.9, 0.9 + life * 3.2, fireAt.z - life * 0.5);
          const s = 0.55 + life * 1.5;
          m.scale.set(s, s, s);
          (m.material as T.MeshToonMaterial).opacity = (1 - life) * 0.85;
        });
        render();
      };
      render();
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
        scene.traverse((o) => {
          const mesh = o as T.Mesh;
          mesh.geometry?.dispose();
        });
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
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="A small animated pixel-art diorama of a campsite: a log cabin with a lit window, a campfire with someone sitting by it, pines, and little snowy peaks"
      style={{ width: "100%", height }}
    />
  );
}
