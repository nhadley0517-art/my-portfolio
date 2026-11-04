"use client";

import { useEffect, useRef } from "react";

/* A little floating world in the spirit of isometric pixel dioramas: a wide
   meadow seen from a 2:1 isometric angle, with mountains behind, a dirt path
   up to a wooden shack, and a campfire. Nothing sits in a frame; the meadow
   floats on the page and its edges fray into it.

   It's a height map drawn back to front (painter's order): every cell is a
   4x2 pixel top with a two-tone column under it, so slopes, the shack and
   the mountains all come out as tiny voxel stacks. On top of that ride the
   things that move: swaying grass blades, the fire, its smoke and glow, and
   the window light. It renders at half resolution and goes through the same
   ordered dither as the rest of the site. */

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64 - 0.5);

const SCALE = 2;
const LEVELS = 8;
const FPS = 12;

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C = {
  grassDark: hex("#2C5A1E"),
  grass: hex("#3E7A26"),
  grassLight: hex("#5E9C30"),
  tip: hex("#9CCB4A"),
  dirt: hex("#5B3F27"),
  path: hex("#C9AA78"),
  pathDark: hex("#A98A5C"),
  rock: hex("#6C7C8E"),
  rockLight: hex("#93A2B3"),
  snow: hex("#F1F0EA"),
  hill: hex("#4D7A3A"),
  pine: hex("#1F4A2C"),
  pineLight: hex("#2E6A3A"),
  wood: hex("#8A5A34"),
  woodDark: hex("#5E3B22"),
  roof: hex("#B9874A"),
  roofDark: hex("#8C6234"),
  roofShade: hex("#7A5530"),
  door: hex("#3A2516"),
  stone: hex("#8E8E8A"),
  log: hex("#4A2E1C"),
  glow: hex("#FFC85A"),
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function valueNoise(seed: number) {
  const rnd = mulberry(seed);
  const S = 64;
  const lat = Float32Array.from({ length: S * S }, rnd);
  const at = (x: number, y: number) => lat[(((y % S) + S) % S) * S + (((x % S) + S) % S)];
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = sm(x - x0), fy = sm(y - y0);
    const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

type Cell = {
  sx: number; // screen x of the cell's center
  sy: number; // screen y of the cell's top face (before height)
  h: number; // height in pixels
  top: RGB;
  side: RGB;
  kind: "grass" | "path" | "rock" | "roof" | "stone" | "pine" | "fire" | "window";
  edge: number; // 0 inside .. 1 at the fraying edge
  seed: number;
};

/** Lays the scene out for a strip `w` by `h` render pixels. */
function buildScene(w: number, h: number) {
  const n = valueNoise(3), n2 = valueNoise(17), n3 = valueNoise(41);
  const rnd = mulberry(23);
  const U = Math.floor(w / 4) - 4; // half-width in cells
  const V = Math.round(h * 0.6); // depth in cells
  const top0 = h - V - 6; // screen y of the back row
  const cells: Cell[] = [];

  // Landmarks, in cell coordinates (u across, v front-to-back from the back).
  const shack = { u: Math.round(U * 0.3), v: Math.round(V * 0.46), hw: 9, hd: 6 };
  const fire = { u: Math.round(U * 0.02), v: Math.round(V * 0.7) };
  const pathU = (v: number) => shack.u - 2 + Math.sin(v * 0.16) * 5 - (v - shack.v - shack.hd) * 0.85;

  // A few big peaks along the back instead of a ridge of spikes.
  const peaks = [
    { u: -0.78, h: 46, w: 0.2 },
    { u: -0.5, h: 34, w: 0.17 },
    { u: -0.2, h: 24, w: 0.14 },
    { u: 0.12, h: 30, w: 0.16 },
    { u: 0.66, h: 50, w: 0.22 },
    { u: 0.92, h: 32, w: 0.12 },
  ];

  // Pines: individual cones near the foot of the mountains.
  const pines: { u: number; v: number; r: number; h: number }[] = [];
  for (let i = 0; i < 60 && pines.length < 22; i++) {
    const pu = (rnd() * 2 - 1) * U * 0.92;
    const pv = V * (0.3 + rnd() * 0.18);
    if (Math.abs(pu - shack.u) < shack.hw + 5) continue;
    if (pines.some((p) => Math.hypot(p.u - pu, p.v - pv) < 5)) continue;
    pines.push({ u: pu, v: pv, r: 2.2 + rnd() * 1.4, h: 12 + rnd() * 10 });
  }

  for (let v = 0; v <= V; v++) {
    for (let u = -U; u <= U; u++) {
      if ((u + v) & 1) continue;
      // A wide blob with a ragged outline.
      const nu = u / U, nv = (v - V / 2) / (V / 2);
      const shape = Math.pow(Math.abs(nu), 5) + Math.pow(Math.abs(nv), 2.2);
      const fray = (n(u * 0.25, v * 0.25) - 0.5) * 0.5;
      const r = shape + fray;
      if (r > 1) continue;
      const edge = Math.max(0, Math.min(1, (r - 0.72) / 0.28));

      let ht = 3 + n2(u * 0.08, v * 0.12) * 4;
      let top: RGB = C.grass;
      let side: RGB = C.dirt;
      let kind: Cell["kind"] = "grass";

      // Mountains: smooth cones with a little rocky texture and snow caps.
      let m = 0, cap = 0;
      for (const p of peaks) {
        const d = Math.hypot((nu - p.u) / p.w, v / (V * 0.36));
        const hgt = p.h * Math.max(0, 1 - d) ** 1.1;
        if (hgt > m) {
          m = hgt;
          cap = p.h * 0.58;
        }
      }
      // Gentle rocky texture, smoothed so the silhouettes stay clean.
      m += m > 4 ? (n3(u * 0.18, v * 0.18) - 0.5) * 2.5 : 0;
      if (m > 5) {
        ht += m;
        kind = "rock";
        top = m > cap ? C.snow : m > 12 ? (n(u * 0.6, v * 0.6) > 0.5 ? C.rockLight : C.rock) : C.hill;
        side = m > cap + 4 ? C.rockLight : C.rock;
      } else {
        const g = n2(u * 0.3, v * 0.3);
        top = g > 0.62 ? C.grassLight : g < 0.35 ? C.grassDark : C.grass;
      }

      // The path, from the front edge up to the shack door.
      if (v > shack.v + shack.hd && Math.abs(u - pathU(v)) < 2.6) {
        kind = "path";
        top = Math.abs(u - pathU(v)) < 1.4 ? C.path : C.pathDark;
        ht = 3 + n2(u * 0.08, v * 0.12) * 2;
      }

      // The shack: plank walls, a pitched roof (sunny side and shady side),
      // a door and a window on the front, and a stone chimney.
      const du = u - shack.u, dv = v - shack.v;
      if (Math.abs(du) <= shack.hw && Math.abs(dv) <= shack.hd) {
        const ridgeH = shack.hw - Math.abs(du);
        ht = 16 + ridgeH * 1.15;
        kind = "roof";
        top = du === 0 ? C.roofDark : du < 0 ? C.roof : C.roofShade;
        side = C.wood;
        if (dv >= shack.hd - 1 && (du === 2 || du === 3)) side = C.door;
        if (dv >= shack.hd - 1 && (du === -4 || du === -5)) kind = "window";
        if (du === -5 && dv === -2) {
          ht += 7;
          top = C.stone;
          side = C.stone;
          kind = "stone";
        }
      }

      for (const p of pines) {
        const d = Math.hypot(u - p.u, (v - p.v) * 1.3);
        if (d > p.r || kind !== "grass") continue;
        const ph = p.h * (1 - d / p.r) + 4;
        if (ht + ph > ht) {
          ht += ph;
          kind = "pine";
          // Layered branches: alternating bands down the cone.
          top = Math.floor(ph / 3) % 2 ? C.pine : C.pineLight;
          side = C.pine;
        }
      }

      // The campfire: a ring of stones around a bed of logs.
      const fd = Math.hypot(u - fire.u, (v - fire.v) * 1.6);
      if (fd < 3.4) {
        if (fd > 2) {
          kind = "stone";
          top = C.stone;
          side = C.stone;
          ht = 5;
        } else {
          kind = "fire";
          top = C.log;
          side = C.log;
          ht = 4;
        }
      }

      cells.push({ sx: Math.round(w / 2 + u * 2), sy: Math.round(top0 + v), h: Math.round(ht), top, side, kind, edge, seed: rnd() });
    }
  }
  // Back to front, so nearer cells paint over farther ones.
  cells.sort((a, b) => a.sy - b.sy || a.sx - b.sx);
  const fireCell = { x: Math.round(w / 2 + fire.u * 2), y: Math.round(top0 + fire.v) - 4 };
  return { cells, fireCell };
}

export default function Diorama({ height = 200 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0;
    let scene = buildScene(1, 1);
    let rgb = new Float32Array(0);
    let alpha = new Float32Array(0);
    let img: ImageData;
    let visible = true;
    let raf = 0;
    let last = 0;

    const fit = () => {
      W = Math.max(1, Math.round(cv.clientWidth / SCALE));
      H = Math.max(1, Math.round(cv.clientHeight / SCALE));
      cv.width = W;
      cv.height = H;
      rgb = new Float32Array(W * H * 3);
      alpha = new Float32Array(W * H);
      img = ctx.createImageData(W, H);
      scene = buildScene(W, H);
    };

    const put = (x: number, y: number, c: RGB, k = 1, a = 1) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      const i = y * W + x;
      rgb[i * 3] = c[0] * k;
      rgb[i * 3 + 1] = c[1] * k;
      rgb[i * 3 + 2] = c[2] * k;
      alpha[i] = a;
    };

    const draw = (t: number) => {
      rgb.fill(0);
      alpha.fill(0);
      const { cells, fireCell } = scene;
      const flicker = 0.85 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.07;

      for (const c of cells) {
        // Fraying edge: thin cells out toward the outline so it dissolves
        // into the page instead of ending on a hard line.
        if (c.edge > 0 && c.seed < c.edge * 0.9) continue;
        const y0 = c.sy - c.h;
        // Warm light from the fire on the ground around it.
        const fd = Math.hypot(c.sx - fireCell.x, (c.sy - fireCell.y) * 2);
        const warm = fd < 56 ? (1 - fd / 56) * 0.45 * flicker : 0;
        const tint = (col: RGB, k: number): RGB => [col[0] * k + 120 * warm, col[1] * k + 60 * warm, col[2] * k];

        // Column: lit left half, shaded right half, plank stripes on walls.
        for (let y = y0 + 2; y < c.sy + 2; y++) {
          const plank = c.kind === "roof" && y > y0 + 4 && (y & 1) ? 0.88 : 1;
          const lowDirt = c.kind === "grass" || c.kind === "path" ? (y - y0 < 3 ? c.top : c.side) : c.side;
          put(c.sx - 2, y, tint(lowDirt, 0.8 * plank), 1);
          put(c.sx - 1, y, tint(lowDirt, 0.8 * plank), 1);
          put(c.sx, y, tint(lowDirt, 0.6 * plank), 1);
          put(c.sx + 1, y, tint(lowDirt, 0.6 * plank), 1);
        }
        // Top face.
        const topK = 1 + (c.seed - 0.5) * 0.12;
        for (let x = c.sx - 2; x < c.sx + 2; x++) {
          put(x, y0, tint(c.top, topK), 1);
          put(x, y0 + 1, tint(c.top, topK * 0.94), 1);
        }

        if (c.kind === "window") {
          // A small warm window on the shack's front wall.
          const g = 0.8 + Math.sin(t * 2.3) * 0.1 + Math.sin(t * 7.1) * 0.05;
          for (let y = c.sy - 8; y < c.sy - 4; y++) for (let x = c.sx - 2; x < c.sx + 2; x++) put(x, y, C.glow, g, 1);
        }

        if (c.kind === "grass" && c.seed > 0.18) {
          // Blades: a couple of thin strokes swaying with the wind.
          const bh = 2 + Math.floor(c.seed * 4);
          const sway = Math.round(Math.sin(t * 1.8 + c.sx * 0.08 + c.sy * 0.2) * 0.8 + (c.seed - 0.5) * 0.6);
          const bx = c.sx - 2 + Math.floor(c.seed * 37) % 4;
          for (let k = 0; k < bh; k++) {
            const lean = k > bh / 2 ? sway : 0;
            const col = k === bh - 1 ? C.tip : c.seed > 0.6 ? C.grassLight : C.grass;
            put(bx + lean, y0 - k, tint(col, 1), 1);
          }
        }
      }

      // The fire: a few flickering pixels of flame.
      {
        const { x, y } = fireCell;
        const flames = [C.glow, hex("#FF9A2A"), hex("#E8521F")];
        for (let i = 0; i < 9; i++) {
          const fx = x - 4 + i;
          const fh = Math.max(1, Math.round(8 + Math.sin(t * 12 + i * 1.7) * 2.5 + Math.sin(t * 5 + i) * 1.5 - Math.abs(fx - x) * 1.7));
          for (let k = 0; k < fh; k++) put(fx, y - k, flames[Math.min(2, Math.floor((k / fh) * 3))], 1.05, 1);
        }
        // Smoke: soft puffs rising and drifting, thinning as they go.
        for (let p = 0; p < 12; p++) {
          const life = ((t * 0.3 + p / 12) % 1);
          const sx = Math.round(x + Math.sin(life * 6 + p) * 3 + life * 18);
          const sy = Math.round(y - 6 - life * 46);
          const fade = 1 - life;
          const size = 2 + Math.round(life * 2);
          for (let k = 0; k < size * size; k++) {
            const px = sx + (k % size), py = sy + Math.floor(k / size);
            if (BAYER8[(py & 7) * 8 + (px & 7)] + 0.5 < fade * 0.8) put(px, py, [205, 205, 200], 1, 1);
          }
        }
      }

      // Ordered dither to a few levels per channel; empty pixels stay clear.
      const d = img.data;
      const step = 255 / (LEVELS - 1);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const o = y * W + x;
          if (alpha[o] === 0) {
            d[o * 4 + 3] = 0;
            continue;
          }
          const th = BAYER8[(y & 7) * 8 + (x & 7)];
          for (let c = 0; c < 3; c++) {
            const v = Math.min(255, rgb[o * 3 + c]) / step + th;
            d[o * 4 + c] = Math.max(0, Math.min(LEVELS - 1, Math.round(v))) * step;
          }
          d[o * 4 + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now / 1000);
    };

    fit();
    draw(0);
    const ro = new ResizeObserver(() => {
      fit();
      draw(last / 1000);
    });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(cv);
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="A small animated pixel diorama: a meadow with mountains, a wooden shack, a path, and a campfire"
      style={{ display: "block", width: "100%", height, imageRendering: "pixelated" }}
    />
  );
}
