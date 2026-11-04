"use client";

import { useEffect, useRef } from "react";

/* A small living landscape seen from above at an angle, drawn the way 1992's
   Comanche drew its terrain ("voxel space"): a height map and a color map,
   and for every column of the screen a ray walks from near to far, drawing
   a vertical sliver wherever the ground rises above what's already drawn.
   It renders at a deliberately low resolution, then every pixel goes through
   the same ordered dither as the rest of the site, so it reads as pixel art
   rather than a 3D scene. Everything is generated on load: hills, a stream,
   a stone path, autumn trees, pale frosted clearings, and a red gate. */

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64 - 0.5);

const M = 512; // map size; the map tiles, so the camera can wander forever
const SCALE = 2; // screen pixels per rendered pixel
const LEVELS = 7; // color levels per channel after dithering
const FPS = 15;

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PAL = {
  moss: hex("#3E5A2E"),
  grass: hex("#5F7A3A"),
  frost: hex("#E6E4DA"),
  stone: hex("#8E8C86"),
  path: hex("#B8B2A4"),
  water: hex("#2F5E73"),
  gold: hex("#D9A12B"),
  amber: hex("#C46E1E"),
  leaf: hex("#7C8F2E"),
  gate: hex("#D8382B"),
  rust: hex("#9E4A22"),
  bank: hex("#4E5B3A"),
  mist: hex("#ECEAE3"),
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

/** Tileable value noise: lattice values wrap at `period`. */
function makeNoise(seed: number) {
  const rnd = mulberry(seed);
  const SIZE = 256;
  const lattice = Float32Array.from({ length: SIZE * SIZE }, rnd);
  const at = (x: number, y: number, p: number) => lattice[(((y % p) + p) % p) * SIZE + (((x % p) + p) % p)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number, period: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const a = at(x0, y0, period), b = at(x0 + 1, y0, period);
    const c = at(x0, y0 + 1, period), d = at(x0 + 1, y0 + 1, period);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

function buildWorld() {
  const n1 = makeNoise(11), n2 = makeNoise(29), n3 = makeNoise(47), n4 = makeNoise(83);
  const fbm = (n: ReturnType<typeof makeNoise>, x: number, y: number, base: number, oct: number) => {
    let v = 0, amp = 0.5, total = 0, f = base;
    for (let o = 0; o < oct; o++) {
      v += amp * n((x / M) * f, (y / M) * f, f);
      total += amp;
      amp *= 0.5;
      f *= 2;
    }
    return v / total;
  };

  const height = new Float32Array(M * M);
  const color = new Float32Array(M * M * 3);
  const kind = new Uint8Array(M * M); // 0 ground, 1 water, 2 tree, 3 path, 4 gate
  const phase = Float32Array.from({ length: M * M }, mulberry(5));
  const pathX = (y: number) => M / 2 + Math.sin((y / M) * Math.PI * 2) * 60 + Math.sin((y / M) * Math.PI * 6) * 14;
  // A stream that keeps the path company, wandering a little on its own.
  const streamX = (y: number) => pathX(y) + 30 + Math.sin((y / M) * Math.PI * 8) * 9;
  const wrapDist = (a: number, b: number) => {
    const d = Math.abs(a - b) % M;
    return Math.min(d, M - d);
  };
  const rnd = mulberry(91);

  for (let y = 0; y < M; y++) {
    for (let x = 0; x < M; x++) {
      const i = y * M + x;
      let h = fbm(n1, x, y, 4, 5) * 0.9;
      const frost = fbm(n4, x, y, 6, 4);
      const dPath = wrapDist(x, pathX(y));
      const dStream = wrapDist(x, streamX(y));
      let c: RGB;
      let k = 0;
      // Water and path sit just under the local ground, not in a trench.
      if (dStream < 3.6) {
        h -= 0.035;
        c = PAL.water;
        k = 1;
      } else if (dStream < 5) {
        h -= 0.02;
        c = PAL.bank;
      } else if (dPath < 3.2) {
        h -= 0.01;
        c = dPath < 2 ? PAL.path : PAL.stone;
        k = 3;
      } else {
        // Grass with some life in it: moss to meadow by height, and a fine
        // speckle so it reads as blades rather than a flat fill.
        const g = Math.min(1, Math.max(0, (h - 0.3) * 2 + (fbm(n2, x, y, 32, 2) - 0.5)));
        const blade = 0.86 + phase[i] * 0.26;
        c = [
          (PAL.moss[0] + (PAL.grass[0] - PAL.moss[0]) * g) * blade,
          (PAL.moss[1] + (PAL.grass[1] - PAL.moss[1]) * g) * blade,
          (PAL.moss[2] + (PAL.grass[2] - PAL.moss[2]) * g) * blade,
        ];
        if (frost > 0.6) {
          const f = 0.94 + phase[i] * 0.08;
          c = [PAL.frost[0] * f, PAL.frost[1] * f, PAL.frost[2] * f];
        }
      }
      height[i] = h;
      color.set(c, i * 3);
      kind[i] = k;
    }
  }

  // Trees: individual round crowns, scattered on a jittered grid, thick where
  // the forest noise says so and the odd lone one out in the open.
  const CROWNS = [PAL.gold, PAL.amber, PAL.leaf, PAL.rust, PAL.gold];
  for (let gy = 0; gy < M; gy += 6) {
    for (let gx = 0; gx < M; gx += 6) {
      const cx = gx + rnd() * 6, cy = gy + rnd() * 6;
      const forest = fbm(n3, cx, cy, 8, 4);
      if (forest < 0.5 && rnd() > 0.04) continue;
      if (wrapDist(cx, pathX(cy)) < 7 || wrapDist(cx, streamX(cy)) < 7) continue;
      const r = 2.4 + rnd() * 2.8;
      const crownH = 0.1 + rnd() * 0.1;
      const base = CROWNS[Math.floor(fbm(n2, cx * 2, cy * 2, 8, 2) * 9 + rnd() * 2) % CROWNS.length];
      for (let oy = -Math.ceil(r); oy <= Math.ceil(r); oy++) {
        for (let ox = -Math.ceil(r); ox <= Math.ceil(r); ox++) {
          const d = Math.hypot(ox, oy);
          if (d > r) continue;
          const x = ((Math.round(cx + ox) % M) + M) % M;
          const y = ((Math.round(cy + oy) % M) + M) % M;
          const i = y * M + x;
          const dome = Math.sqrt(1 - (d / r) ** 2);
          const hh = height[i] + 0.03 + crownH * dome;
          if (kind[i] === 2 && hh <= height[i]) continue;
          // Lit from the upper left across the crown, with leafy noise.
          const light = 0.78 + ((-ox - oy) / r) * 0.16 + dome * 0.12 + (phase[i] - 0.5) * 0.18;
          height[i] = Math.max(height[i], hh);
          color.set([base[0] * light, base[1] * light, base[2] * light], i * 3);
          kind[i] = 2;
        }
      }
    }
  }

  // Red gates straddling the path at intervals: two posts and a lintel.
  for (let n = 0; n < 6; n++) {
    const gy = Math.round((n + 0.3) * (M / 6));
    const cx = Math.round(pathX(gy));
    for (let x = cx - 6; x <= cx + 6; x++) {
      for (let y = gy - 1; y <= gy; y++) {
        const i = (((y % M) + M) % M) * M + (((x % M) + M) % M);
        const post = Math.abs(x - cx) >= 5;
        height[i] += post ? 0.17 : 0.14;
        color.set(PAL.gate, i * 3);
        kind[i] = 4;
      }
    }
  }

  // Bake in sunlight from the upper left, from the slope of the ground.
  const lit = new Float32Array(M * M);
  for (let y = 0; y < M; y++) {
    for (let x = 0; x < M; x++) {
      const l = height[y * M + ((x - 1 + M) % M)] - height[y * M + ((x + 1) % M)];
      const u = height[((y - 1 + M) % M) * M + x] - height[((y + 1) % M) * M + x];
      lit[y * M + x] = Math.max(0.55, Math.min(1.35, 1 + l * 9 + u * 5));
    }
  }
  return { height, color, kind, phase, lit, pathX };
}

export default function Terrain({ height = 180 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const world = buildWorld();
    let W = 0, H = 0;
    let img: ImageData;
    let rgb = new Float32Array(0);
    let ybuf = new Float32Array(0);
    let visible = true;
    let raf = 0;
    let last = 0;

    const fit = () => {
      W = Math.max(1, Math.round(cv.clientWidth / SCALE));
      H = Math.max(1, Math.round(cv.clientHeight / SCALE));
      cv.width = W;
      cv.height = H;
      img = ctx.createImageData(W, H);
      rgb = new Float32Array(W * H * 3);
      ybuf = new Float32Array(W);
    };

    const draw = (t: number) => {
      const { height: hm, color, kind, phase, lit } = world;
      // The camera drifts down the path, swaying gently around it.
      const camY = t * 3.2;
      const camX = world.pathX(camY + 400) + Math.sin(t * 0.11) * 8;
      const yaw = Math.sin(t * 0.05) * 0.08;
      const fx = Math.sin(yaw), fy = Math.cos(yaw);
      const rx = Math.cos(yaw), ry = -Math.sin(yaw);
      // High up and narrow in depth: close to a 45 degree look down, so the
      // ground reads as a landscape from above, not walls rising at you.
      const NEAR = 380, FAR = 436;
      const camH = 400, hs = 20;
      // Framed so the ground fills the strip from near (bottom) to far (top).
      const P = H / (camH / NEAR - camH / FAR);
      const hor = -(camH / FAR) * P;
      const spread = 0.28;

      // Distance mist color under everything.
      for (let i = 0; i < W * H; i++) {
        rgb[i * 3] = PAL.mist[0];
        rgb[i * 3 + 1] = PAL.mist[1];
        rgb[i * 3 + 2] = PAL.mist[2];
      }
      ybuf.fill(H);
      // Start marching a little behind the bottom edge, so whatever stands
      // nearest is drawn from its real base rather than stretched down to it.
      for (let z = NEAR - 30; z < FAR; z += 0.35) {
        const cx = camX + fx * z, cy = camY + fy * z;
        const half = z * spread;
        const lx = cx - rx * half, ly = cy - ry * half;
        const sx = (rx * half * 2) / W, sy = (ry * half * 2) / W;
        const fog = Math.min(1, Math.max(0, (z - (FAR - 8)) / 8)) * 0.6;
        for (let col = 0; col < W; col++) {
          const mx = ((Math.floor(lx + sx * col) % M) + M) % M;
          const my = ((Math.floor(ly + sy * col) % M) + M) % M;
          const i = my * M + mx;
          const top = ((camH - hm[i] * hs) / z) * P + hor;
          if (top >= ybuf[col]) continue;
          let r = color[i * 3], g = color[i * 3 + 1], b = color[i * 3 + 2];
          let shade = lit[i];
          const k = kind[i];
          if (k === 1) {
            // Water: slow moving ripples and the odd glint.
            const w = Math.sin(mx * 0.35 + my * 0.22 + t * 1.6 + phase[i] * 2);
            shade = 0.9 + w * 0.14;
            if (w > 0.96) shade = 1.6;
          } else if (k === 2) {
            // Leaves catching the light as they move.
            shade *= 0.95 + Math.sin(t * 1.3 + phase[i] * 6.28) * 0.07;
          }
          r *= shade; g *= shade; b *= shade;
          r += (PAL.mist[0] - r) * fog;
          g += (PAL.mist[1] - g) * fog;
          b += (PAL.mist[2] - b) * fog;
          const from = Math.max(0, Math.floor(top));
          for (let y = from; y < ybuf[col]; y++) {
            const o = (y * W + col) * 3;
            rgb[o] = r;
            rgb[o + 1] = g;
            rgb[o + 2] = b;
          }
          ybuf[col] = top;
        }
      }

      // Ordered dither down to a few levels per channel.
      const d = img.data;
      const step = 255 / (LEVELS - 1);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const o = y * W + x;
          const th = BAYER8[(y & 7) * 8 + (x & 7)];
          for (let c = 0; c < 3; c++) {
            const v = rgb[o * 3 + c] / step + th;
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
      aria-label="A small animated pixel landscape: autumn trees, a stream, and a stone path with red gates"
      style={{ display: "block", width: "100%", height, borderRadius: 6, imageRendering: "pixelated", background: "#ECEAE3" }}
    />
  );
}
