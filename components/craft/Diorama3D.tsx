"use client";

import { useEffect, useRef } from "react";
import type * as T from "three";

/* A little floating world, built the way isometric pixel dioramas are: a real
   3D scene (three.js) seen through an orthographic isometric camera, lit by a
   low sun that casts crisp shadows, then rendered at a fraction of the
   on-screen size and scaled up with hard pixels. The pixel-art look comes
   from that, not from drawing pixels by hand: real light and shadow on real
   shapes, crunched down.

   The scene: a meadow patch of tens of thousands of individual grass blades
   that sway in the wind and thin out at the edges, a few low-poly mountains
   at the back with snow on top, pines, a small wooden cabin with a lit
   window and a chimney, a dirt path to its door, and a campfire with
   flickering flames, smoke and a warm light. */

const PX = 2; // on-screen pixels per rendered pixel
const FPS = 30;

export default function Diorama3D({ height = 260 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ---------- helpers ----------
      let seed = 17;
      const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const col = (h: string) => new THREE.Color(h);
      const lambert = (c: string, extra: Record<string, unknown> = {}) => new THREE.MeshLambertMaterial({ color: col(c), ...extra });
      const flat = (c: string) => new THREE.MeshLambertMaterial({ color: col(c), flatShading: true });
      const shadowed = <T extends { castShadow: boolean; receiveShadow: boolean }>(m: T, cast = true, receive = true) => {
        m.castShadow = cast;
        m.receiveShadow = receive;
        return m;
      };

      // A tiny canvas texture with hard pixels, for planks and shingles.
      const stripes = (a: string, b: string, n: number, vertical: boolean) => {
        const c = document.createElement("canvas");
        c.width = vertical ? n * 2 : 2;
        c.height = vertical ? 2 : n * 2;
        const x = c.getContext("2d")!;
        for (let i = 0; i < n * 2; i++) {
          x.fillStyle = i % 2 ? b : a;
          if (vertical) x.fillRect(i, 0, 1, 2);
          else x.fillRect(0, i, 2, 1);
        }
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };

      // ---------- renderer, scene, camera ----------
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.BasicShadowMap; // hard-edged, pixel-friendly shadows
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "display:block;width:100%;height:100%;image-rendering:pixelated;";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
      // True isometric: 45 degrees around, about 35 degrees down.
      camera.position.set(30, 25, 30);
      camera.lookAt(0, 1.3, 0);

      scene.add(new THREE.HemisphereLight(col("#dff0ff"), col("#7a6a44"), 1.6));
      const sun = new THREE.DirectionalLight(col("#fff0cf"), 2.9);
      sun.position.set(-14, 24, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 80 });
      sun.shadow.bias = -0.0015;
      scene.add(sun);

      // Everything lives in a group whose long axis faces the camera's
      // horizontal, so the patch reads as a wide strip across the banner.
      const world = new THREE.Group();
      world.rotation.y = Math.PI / 4;
      scene.add(world);

      // ---------- the patch ----------
      const RX = 17, RZ = 5.2;
      const outline = (a: number) => {
        const wobble = 1 + Math.sin(a * 5) * 0.04 + Math.sin(a * 11 + 1) * 0.03;
        return [Math.cos(a) * RX * wobble, Math.sin(a) * RZ * wobble] as const;
      };
      const inside = (x: number, z: number) => {
        const r = Math.pow(Math.abs(x / RX), 4) + Math.pow(Math.abs(z / RZ), 2);
        return r;
      };
      const shape = new THREE.Shape();
      for (let i = 0; i <= 96; i++) {
        const [x, z] = outline((i / 96) * Math.PI * 2);
        // Superellipse-ish outline: square it off along the long axis.
        const sx = Math.sign(x) * Math.pow(Math.abs(x / RX), 0.6) * RX;
        if (i === 0) shape.moveTo(sx, z);
        else shape.lineTo(sx, z);
      }
      const slab = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false });
      slab.rotateX(Math.PI / 2);
      const ground = shadowed(new THREE.Mesh(slab, [lambert("#4f8a2c"), lambert("#6a4628")]), false, true);
      world.add(ground);

      // Path: a flat dirt ribbon from the front edge to the cabin door.
      const cabinAt = new THREE.Vector3(5.5, 0, -1.2);
      const pathPts: T.Vector3[] = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        pathPts.push(new THREE.Vector3(cabinAt.x - 0.3 - t * 4.2 + Math.sin(t * 5) * 0.6, 0.01, cabinAt.z + 1.3 + t * (RZ - 0.4)));
      }
      const pathSegments: T.Vector3[] = pathPts;
      const nearPath = (x: number, z: number) => {
        let d = Infinity;
        for (const p of pathSegments) d = Math.min(d, Math.hypot(p.x - x, p.z - z));
        return d;
      };
      for (let i = 0; i < pathPts.length - 1; i++) {
        const a = pathPts[i], b = pathPts[i + 1];
        const len = a.distanceTo(b) + 0.2;
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(0.75, len), lambert(i % 2 ? "#b08a58" : "#bf9a65"));
        seg.rotation.x = -Math.PI / 2;
        seg.rotation.z = -Math.atan2(b.x - a.x, b.z - a.z);
        seg.position.set((a.x + b.x) / 2, 0.012, (a.z + b.z) / 2);
        seg.receiveShadow = true;
        world.add(seg);
      }

      // ---------- mountains ----------
      const mountain = (x: number, z: number, r: number, h: number) => {
        const g = new THREE.ConeGeometry(r, h, 9, 5);
        const pos = g.attributes.position;
        const colors: number[] = [];
        const rock = col("#6f7f92"), rock2 = col("#8a99aa"), snow = col("#f3f2ec"), moss = col("#4d6e3b");
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const t = (y + h / 2) / h;
          if (t > 0.02 && t < 0.98) {
            pos.setX(i, pos.getX(i) * (0.85 + rnd() * 0.3));
            pos.setZ(i, pos.getZ(i) * (0.85 + rnd() * 0.3));
            pos.setY(i, y + (rnd() - 0.5) * h * 0.06);
          }
          const c = t > 0.7 ? snow : t > 0.25 ? (rnd() > 0.5 ? rock : rock2) : moss;
          colors.push(c.r, c.g, c.b);
        }
        g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        g.computeVertexNormals();
        const m = shadowed(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
        m.position.set(x, h / 2 - 0.05, z);
        m.rotation.y = rnd() * Math.PI;
        world.add(m);
      };
      mountain(-11.8, -3.3, 2.6, 4.2);
      mountain(-8.4, -3.8, 2.0, 3.0);
      mountain(-4.6, -4.0, 1.6, 2.3);
      mountain(11.2, -3.4, 2.8, 4.6);
      mountain(14.4, -2.6, 1.8, 2.8);

      // ---------- pines ----------
      const pine = (x: number, z: number, s: number) => {
        const g = new THREE.Group();
        const trunk = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.4 * s, 5), flat("#4a2f1d")));
        trunk.position.y = 0.2 * s;
        g.add(trunk);
        const greens = ["#1f4d2c", "#2a6036", "#22552f"];
        for (let i = 0; i < 3; i++) {
          const cone = shadowed(new THREE.Mesh(new THREE.ConeGeometry((0.55 - i * 0.14) * s, 0.7 * s, 7), flat(greens[i])));
          cone.position.y = (0.55 + i * 0.38) * s;
          g.add(cone);
        }
        g.position.set(x, 0, z);
        g.rotation.y = rnd() * Math.PI;
        world.add(g);
      };
      for (let i = 0; i < 40; i++) {
        const x = (rnd() * 2 - 1) * (RX - 3);
        const z = -RZ * 0.25 - rnd() * RZ * 0.5;
        if (Math.abs(x - cabinAt.x) < 2.6 || inside(x, z) > 0.75) continue;
        pine(x, z, 0.8 + rnd() * 0.7);
      }

      // ---------- cabin ----------
      const cabin = new THREE.Group();
      const planks = stripes("#9a6a3c", "#8a5c32", 8, false);
      const shingles = stripes("#6b4a2e", "#5a3c24", 6, false);
      const walls = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 1.7), new THREE.MeshLambertMaterial({ map: planks })));
      walls.position.y = 0.65;
      cabin.add(walls);
      for (const s of [-1, 1]) {
        const roof = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.25), new THREE.MeshLambertMaterial({ map: shingles })));
        roof.position.set(0, 1.62, s * 0.5);
        roof.rotation.x = s * 0.62;
        cabin.add(roof);
      }
      const gable = new THREE.Shape([new THREE.Vector2(-0.85, 0), new THREE.Vector2(0.85, 0), new THREE.Vector2(0, 0.66)]);
      for (const s of [-1, 1]) {
        const g = shadowed(new THREE.Mesh(new THREE.ShapeGeometry(gable), new THREE.MeshLambertMaterial({ map: planks, side: THREE.DoubleSide })));
        g.rotation.y = Math.PI / 2;
        g.position.set(s * 1.1, 1.3, 0);
        cabin.add(g);
      }
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.04), flat("#3a2416"));
      door.position.set(0.45, 0.4, 0.86);
      cabin.add(door);
      const windowMat = new THREE.MeshBasicMaterial({ color: col("#ffc65a") });
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.04), windowMat);
      win.position.set(-0.5, 0.75, 0.86);
      cabin.add(win);
      const chimney = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), flat("#7d7b76")));
      chimney.position.set(-0.7, 1.75, -0.35);
      cabin.add(chimney);
      const step = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.3), flat("#6b4a2e")));
      step.position.set(0.45, 0.04, 1.0);
      cabin.add(step);
      // A woodpile against the side wall.
      for (let i = 0; i < 6; i++) {
        const log = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 6), flat(i % 2 ? "#6b4428" : "#7d5232")));
        log.rotation.x = Math.PI / 2;
        log.position.set(1.3, 0.08 + Math.floor(i / 3) * 0.13, -0.3 + (i % 3) * 0.15);
        cabin.add(log);
      }
      cabin.position.copy(cabinAt);
      cabin.rotation.y = -Math.PI / 4; // turned so both walls catch the eye
      world.add(cabin);

      // ---------- campfire ----------
      const fireAt = new THREE.Vector3(-0.8, 0, 1.6);
      const fire = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const stone = shadowed(new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 + rnd() * 0.04), flat(rnd() > 0.5 ? "#8c8b86" : "#a3a29b")));
        stone.position.set(Math.cos(a) * 0.42, 0.07, Math.sin(a) * 0.42);
        fire.add(stone);
      }
      for (let i = 0; i < 3; i++) {
        const log = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 6), flat("#4a2e1c")));
        log.rotation.z = Math.PI / 2;
        log.rotation.y = (i / 3) * Math.PI;
        log.position.y = 0.08;
        fire.add(log);
      }
      const flameMats = ["#ffd75e", "#ff9a2a", "#e8521f"].map((c) => new THREE.MeshBasicMaterial({ color: col(c) }));
      const flames: T.Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.12 - i * 0.012, 0.5, 5), flameMats[i % 3]);
        f.position.set((rnd() - 0.5) * 0.18, 0.3, (rnd() - 0.5) * 0.18);
        fire.add(f);
        flames.push(f);
      }
      const fireLight = new THREE.PointLight(col("#ff9a3c"), 3, 6, 1.6);
      fireLight.position.y = 0.6;
      fire.add(fireLight);
      // Two logs to sit on.
      for (const s of [-1, 1]) {
        const seat = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 7), flat("#6b4428")));
        seat.rotation.z = Math.PI / 2;
        seat.rotation.y = s * 0.5;
        seat.position.set(s * 0.95, 0.11, -0.35 * s);
        fire.add(seat);
      }
      fire.position.copy(fireAt);
      world.add(fire);

      // Smoke: a few soft puffs rising and drifting, recycled forever.
      const smokeMat = new THREE.MeshLambertMaterial({ color: col("#d9d8d2"), transparent: true, opacity: 0.8 });
      const puffs = Array.from({ length: 9 }, (_, i) => {
        const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), smokeMat.clone());
        world.add(p);
        return { mesh: p, offset: i / 9 };
      });

      // ---------- grass ----------
      // Each blade is a thin tapered triangle, darker at the root. Wind bends
      // the top in the vertex shader, so thousands sway for free.
      const blade = new THREE.BufferGeometry();
      blade.setAttribute("position", new THREE.Float32BufferAttribute([-0.035, 0, 0, 0.035, 0, 0, 0, 1, 0], 3));
      blade.setAttribute("color", new THREE.Float32BufferAttribute([0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 1.12, 1.12, 1.12], 3));
      blade.computeVertexNormals();
      const grassMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
      const uTime = { value: 0 };
      grassMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uTime;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform float uTime;")
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float sway = sin(uTime * 1.7 + wp.x * 0.45 + wp.z * 0.3) * 0.5 + sin(uTime * 3.1 + wp.x * 1.3) * 0.18;
            transformed.x += sway * position.y * 0.28;
            transformed.z += sway * position.y * 0.12;`
          );
      };
      const COUNT = 26000;
      const grass = new THREE.InstancedMesh(blade, grassMat, COUNT);
      grass.receiveShadow = true;
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const greens = ["#4f9a2a", "#5eab30", "#6fba36", "#86c83f", "#9fd24c", "#b7dc5c"].map(col);
      let placed = 0;
      for (let tries = 0; placed < COUNT && tries < COUNT * 4; tries++) {
        const x = (rnd() * 2 - 1) * RX;
        const z = (rnd() * 2 - 1) * RZ;
        const r = inside(x * 0.92, z);
        if (r > 1) continue;
        // Thin out toward the rim so the edge frays into the page.
        if (r > 0.6 && rnd() < (r - 0.6) / 0.4) continue;
        if (nearPath(x, z) < 0.45) continue;
        if (Math.hypot(x - fireAt.x, z - fireAt.z) < 0.6) continue;
        if (Math.abs(x - cabinAt.x) < 1.6 && Math.abs(z - cabinAt.z) < 1.6) continue;
        const h = 0.22 + rnd() * 0.32;
        e.set((rnd() - 0.5) * 0.4, rnd() * Math.PI, (rnd() - 0.5) * 0.4);
        q.setFromEuler(e);
        m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, h, 1));
        grass.setMatrixAt(placed, m4);
        grass.setColorAt(placed, greens[Math.floor(rnd() * greens.length)]);
        placed++;
      }
      grass.count = placed;
      world.add(grass);

      // ---------- sizing ----------
      const fit = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(Math.max(1, Math.round(w / PX)), Math.max(1, Math.round(h / PX)), false);
        // Frame the patch: its long axis spans the width with a little air.
        const halfW = 19.5;
        const halfH = halfW * (h / w);
        Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
        camera.updateProjectionMatrix();
      };
      fit();

      // ---------- animation ----------
      let raf = 0, last = 0, visible = true;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible || now - last < 1000 / FPS) return;
        last = now;
        const t = now / 1000;
        uTime.value = t;
        const flick = 0.8 + Math.sin(t * 13) * 0.12 + Math.sin(t * 29) * 0.08;
        flames.forEach((f, i) => {
          f.scale.set(1, 0.7 + Math.sin(t * (10 + i * 3) + i) * 0.35 + 0.2, 1);
          f.position.y = 0.22 + f.scale.y * 0.25;
        });
        fireLight.intensity = 2.6 * flick;
        windowMat.color.setRGB(1, 0.72 + Math.sin(t * 2.2) * 0.05, 0.33);
        puffs.forEach(({ mesh, offset }) => {
          const life = (t * 0.22 + offset) % 1;
          mesh.position.set(fireAt.x + Math.sin(life * 5 + offset * 9) * 0.25 + life * 1.2, 0.6 + life * 4.2, fireAt.z - life * 0.6);
          const s = 0.6 + life * 1.6;
          mesh.scale.set(s, s, s);
          (mesh.material as T.MeshLambertMaterial).opacity = (1 - life) * 0.75;
        });
        renderer.render(scene, camera);
      };
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(frame);

      const ro = new ResizeObserver(() => {
        fit();
        renderer.render(scene, camera);
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
          const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
          mats.forEach((m) => m.dispose());
        });
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
      aria-label="A small animated pixel diorama: a meadow with mountains, pines, a wooden cabin, a path, and a campfire"
      style={{ width: "100%", height }}
    />
  );
}
