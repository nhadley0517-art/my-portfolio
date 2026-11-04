"use client";

import { useEffect, useRef } from "react";

/* A painterly pixel-art forest, side on, built like a stage set: a misty sky,
   two rows of faint far-off pines, a row of richer pines with a few autumn
   ones, and up front big mossy trunks, bushes, rocks and a strip of grass.
   Every layer is painted once, in code, as real pixel art (a handful of
   hand-picked shades per object, lit from the upper left, with dithered
   transitions), then the layers drift past at different speeds so the
   forest has depth. Fog banks roll through, light falls in shafts, birds
   cross the sky, and motes float in the light. Rendered at a third of the
   on-screen size and scaled up with hard pixels. */

const PX = 3;
const FPS = 15;

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER4[(y & 3) * 4 + (x & 3)];

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const SKY = ["#e9ecdf", "#dfe7de", "#cfdcd6", "#bccfcb"].map(hex);
const FAR = ["#b7cbc6", "#a9c0bc", "#98b3b0"].map(hex);
const FAR2 = ["#8eaca6", "#7b9d97", "#6a8e88"].map(hex);
const PINE = ["#5f8f6e", "#43725c", "#2f5a4b", "#22463c"].map(hex);
const PINE2 = ["#6f9a64", "#4f7d55", "#365f44", "#264535"].map(hex);
const AUTUMN = ["#cf8048", "#ad5d33", "#834227", "#5c2e1c"].map(hex);
const LEAF = ["#bfdc6c", "#8cc04c", "#5d9a3e", "#3d7334", "#24502b"].map(hex);
const BARK = ["#b0703f", "#8a4e2c", "#6b3a22", "#4a2816", "#2e1a10"].map(hex);
const MOSS = ["#a8d256", "#78ad3c", "#4f8530"].map(hex);
const ROCK = ["#b5bfbf", "#8e9a9c", "#68767a", "#46525a"].map(hex);
const GRASS = ["#9ccf52", "#6ea93a", "#4b862f", "#2f5c25"].map(hex);
const SOIL = ["#4a3524", "#33251a", "#22180f"].map(hex);
const MIST: RGB = hex("#eef1e8");
const SUN: RGB = hex("#fff3cf");

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise, for organic patches (moss, foliage). */
const noiseRnd = mulberry(77);
const LAT = Float32Array.from({ length: 64 * 64 }, noiseRnd);
function noise(x: number, y: number) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const at = (a: number, b: number) => LAT[(((b % 64) + 64) % 64) * 64 + (((a % 64) + 64) % 64)];
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), d = at(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** A transparent pixel buffer that one layer is painted into. */
class Layer {
  w: number;
  h: number;
  px: Uint8ClampedArray;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Uint8ClampedArray(w * h * 4);
  }
  set(x: number, y: number, c: RGB) {
    x = Math.round(x);
    y = Math.round(y);
    if (y < 0 || y >= this.h) return;
    x = ((x % this.w) + this.w) % this.w; // layers wrap, so they loop seamlessly
    const i = (y * this.w + x) * 4;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
    this.px[i + 3] = 255;
  }
}

/** A pine: tiers of drooping branches, lit on the left, shaded on the right. */
function pine(L: Layer, rnd: () => number, x: number, base: number, h: number, w: number, pal: RGB[]) {
  const top = base - h;
  const tiers = 4 + Math.floor(rnd() * 3);
  for (let y = Math.floor(top); y <= base; y++) {
    const t = (y - top) / h;
    const tier = ((t * tiers) % 1);
    const half = w * (0.12 + 0.88 * t) * (0.45 + 0.55 * tier) + (rnd() - 0.5) * 1.2;
    for (let dx = -Math.ceil(half); dx <= Math.ceil(half); dx++) {
      const side = dx / Math.max(1, half);
      let s = side < -0.35 ? 0 : side > 0.4 ? 2 : 1;
      if (tier > 0.82) s = Math.min(pal.length - 1, s + 1); // the shadow under each tier
      if (rnd() < 0.12) s = Math.max(0, Math.min(pal.length - 1, s + (rnd() < 0.5 ? -1 : 1)));
      L.set(x + dx, y, pal[Math.min(pal.length - 1, s)]);
    }
  }
}

/** A leafy crown: a cluster of lumpy blobs shaded by which way they face. */
function canopy(L: Layer, rnd: () => number, cx: number, cy: number, r: number, pal: RGB[]) {
  const blobs = Array.from({ length: 9 + Math.floor(rnd() * 6) }, () => ({
    x: cx + (rnd() - 0.5) * r * 1.9,
    y: cy + (rnd() - 0.5) * r * 1.0,
    r: r * (0.3 + rnd() * 0.45),
  }));
  for (let y = Math.floor(cy - r * 1.4); y <= cy + r * 1.2; y++) {
    for (let x = Math.floor(cx - r * 1.8); x <= cx + r * 1.8; x++) {
      let best = -1, lit = 0;
      for (const b of blobs) {
        const dx = (x - b.x) / b.r, dy = (y - b.y) / b.r;
        const d = dx * dx + dy * dy;
        const edge = 1 + (rnd() - 0.5) * 0.25;
        if (d < edge && (best < 0 || b.y > blobs[best].y)) {
          best = blobs.indexOf(b);
          lit = -dx * 0.55 - dy * 0.85;
        }
      }
      if (best < 0) continue;
      const v = lit + (rnd() - 0.5) * 0.5;
      const s = v > 0.65 ? 0 : v > 0.15 ? 1 : v > -0.35 ? 2 : v > -0.75 ? 3 : 4;
      L.set(x, y, pal[s]);
    }
  }
}

/** A big trunk: barked, mossy on the lit side, flaring into roots. */
function trunk(L: Layer, rnd: () => number, x: number, base: number, top: number, w: number) {
  for (let y = top; y <= base; y++) {
    const t = (y - top) / (base - top);
    const flare = t > 0.82 ? Math.pow((t - 0.82) / 0.18, 2) * w * 0.9 : 0;
    const half = w / 2 + flare;
    for (let dx = -Math.ceil(half); dx <= Math.ceil(half); dx++) {
      const side = dx / half;
      let s = side < -0.45 ? 1 : side < 0.2 ? 2 : side < 0.65 ? 3 : 4;
      if ((x + dx) % 3 === 0 && rnd() < 0.7) s = Math.min(4, s + 1); // bark grooves
      if (side < -0.6 && rnd() < 0.25) s = 0;
      let c = BARK[s];
      // Moss grows in patches up the lit side, thicker near the roots.
      const moss = noise((x + dx) * 0.35, y * 0.12) + t * 0.25;
      if (side < 0.1 && moss > 0.7) c = MOSS[side < -0.5 ? 0 : side < -0.1 ? 1 : 2];
      L.set(x + dx, y, c);
    }
  }
}

function bush(L: Layer, rnd: () => number, cx: number, base: number, r: number) {
  canopy(L, rnd, cx, base - r * 0.6, r, LEAF);
}

function rock(L: Layer, rnd: () => number, cx: number, base: number, rx: number, ry: number) {
  for (let y = Math.floor(base - ry * 2); y <= base; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx, dy = (y - (base - ry)) / ry;
      if (dx * dx + dy * dy > 1) continue;
      const v = -dx * 0.6 - dy * 0.8 + (rnd() - 0.5) * 0.3;
      const s = v > 0.55 ? 0 : v > 0 ? 1 : v > -0.5 ? 2 : 3;
      L.set(x, y, dy < -0.6 && rnd() < 0.5 ? MOSS[1] : ROCK[s]);
    }
  }
}

function buildLayers(W: number, H: number) {
  const rnd = mulberry(1234);
  const LW = W * 2; // each drifting layer is twice the view, and loops
  const ground = Math.round(H * 0.86);

  const far = new Layer(LW, H);
  for (let x = 0; x < LW; x += 3 + rnd() * 5) pine(far, rnd, x, H * 0.66, H * (0.22 + rnd() * 0.22), 3 + rnd() * 3, FAR);
  for (let y = Math.round(H * 0.66); y < H; y++) for (let x = 0; x < LW; x++) far.set(x, y, FAR[0]);

  const far2 = new Layer(LW, H);
  for (let x = 0; x < LW; x += 5 + rnd() * 7) pine(far2, rnd, x, H * 0.78, H * (0.3 + rnd() * 0.25), 4 + rnd() * 3, FAR2);
  for (let y = Math.round(H * 0.78); y < H; y++) for (let x = 0; x < LW; x++) far2.set(x, y, FAR2[1]);

  const mid = new Layer(LW, H);
  for (let x = 0; x < LW; x += 9 + rnd() * 12) {
    const autumn = rnd() < 0.08;
    const pal = autumn ? AUTUMN : rnd() < 0.4 ? PINE2 : PINE;
    pine(mid, rnd, x + (rnd() - 0.5) * 6, ground + 1, H * (0.38 + rnd() * 0.42), 5 + rnd() * 6, pal);
  }
  for (let x = 0; x < LW; x += 50 + rnd() * 60) {
    trunk(mid, rnd, Math.round(x), ground, Math.round(H * 0.35), 3);
    canopy(mid, rnd, x, H * 0.3, 9 + rnd() * 5, LEAF);
  }

  const near = new Layer(LW, H);
  for (let x = 30; x < LW; x += 70 + rnd() * 70) {
    trunk(near, rnd, Math.round(x), ground + 2, -4, 7 + Math.round(rnd() * 5));
    if (rnd() < 0.6) canopy(near, rnd, x + (rnd() - 0.5) * 10, H * 0.06, 14 + rnd() * 6, LEAF);
  }
  for (let x = 0; x < LW; x += 12 + rnd() * 26) bush(near, rnd, x, ground + 1, 3 + rnd() * 4);
  for (let x = 0; x < LW; x += 40 + rnd() * 70) rock(near, rnd, x, ground + 1, 3 + rnd() * 4, 2 + rnd() * 1.5);
  // Ground: a lit grass edge with blades, then darkening soil.
  for (let x = 0; x < LW; x++) {
    const blades = 1 + Math.floor(rnd() * 3);
    for (let k = 0; k < blades; k++) near.set(x, ground - k, GRASS[k === blades - 1 ? 0 : 1]);
    for (let y = ground + 1; y < H; y++) {
      const d = y - ground;
      near.set(x, y, d < 2 ? GRASS[2] : d < 3 ? GRASS[3] : SOIL[Math.min(2, Math.floor((d - 3) / 2 + bayer(x, y)))]);
    }
  }

  // Foreground: dark ferns and grass clumps along the bottom, and leaves
  // hanging in from the top now and then, to frame the scene.
  const front = new Layer(LW, H);
  const DARK = ["#3f6b2e", "#2a4f25", "#1b3520", "#122617"].map(hex);
  for (let x = 0; x < LW; x += 6 + rnd() * 18) {
    const fh = H * (0.12 + rnd() * 0.16);
    const fronds = 4 + Math.floor(rnd() * 4);
    for (let f = 0; f < fronds; f++) {
      const ang = -Math.PI / 2 + (f / (fronds - 1) - 0.5) * 2.2;
      for (let k = 0; k < fh; k++) {
        const bend = (k / fh) ** 2 * 0.9 * Math.sign(Math.cos(ang));
        const fx = x + Math.cos(ang) * k + bend * k * 0.3;
        const fy = H - 1 + Math.sin(ang) * k + (k / fh) ** 2 * fh * 0.35;
        const c = DARK[k > fh * 0.7 ? 1 : 2];
        front.set(fx, fy, c);
        front.set(fx + 1, fy, c);
        // Leaflets off both sides of the frond, shorter toward the tip.
        if (k % 2 === 0) {
          const leaf = Math.max(1, Math.round((1 - k / fh) * 3));
          for (let l = 1; l <= leaf; l++) {
            front.set(fx - l, fy - l * 0.5, DARK[l === leaf ? 0 : 1]);
            front.set(fx + 1 + l, fy - l * 0.5, DARK[l === leaf ? 1 : 2]);
          }
        }
      }
    }
  }
  for (let x = 0; x < LW; x += 140 + rnd() * 160) {
    const hang = H * (0.18 + rnd() * 0.2);
    for (let v = 0; v < 5 + rnd() * 4; v++) {
      const vx = x + (rnd() - 0.5) * 30;
      const len = hang * (0.4 + rnd() * 0.6);
      for (let k = 0; k < len; k++) {
        const wx = vx + Math.sin(k * 0.3 + v) * 1.5;
        front.set(wx, k, DARK[k % 4 === 0 ? 0 : 2]);
        if (k % 3 === 1) front.set(wx + (k % 2 ? 1 : -1), k, DARK[1]);
      }
    }
  }

  // Birds: a loose flock, each with its own path and wingbeat.
  const birds = Array.from({ length: 6 }, () => ({ y: H * (0.08 + rnd() * 0.18), speed: 4 + rnd() * 3, phase: rnd() * 10, x0: rnd() * W }));
  // Motes drifting in the light.
  const motes = Array.from({ length: 22 }, () => ({ x: rnd() * W, y: rnd() * H * 0.85, s: 0.5 + rnd(), p: rnd() * 6 }));
  return { layers: [far, far2, mid, near, front], speeds: [0.5, 1.1, 2.4, 4.6, 7.5], ground, birds, motes };
}

export default function ForestBanner({ height = 240 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0;
    let img: ImageData;
    let world = buildLayers(1, 1);
    let raf = 0, last = 0, visible = true;

    const fit = () => {
      W = Math.max(1, Math.round(cv.clientWidth / PX));
      H = Math.max(1, Math.round(cv.clientHeight / PX));
      cv.width = W;
      cv.height = H;
      img = ctx.createImageData(W, H);
      world = buildLayers(W, H);
    };

    const draw = (t: number) => {
      const d = img.data;
      const put = (x: number, y: number, c: RGB) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const i = (y * W + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      };
      // Fog and light blend softly (painterly), stepped to a few levels so
      // they still sit on the pixel grid.
      const mix = (x: number, y: number, c: RGB, a: number) => {
        if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
        const k = Math.round(Math.min(1, a) * 6) / 6;
        const i = (y * W + x) * 4;
        d[i] += (c[0] - d[i]) * k;
        d[i + 1] += (c[1] - d[i + 1]) * k;
        d[i + 2] += (c[2] - d[i + 2]) * k;
      };

      // Sky: soft bands, dithered into each other.
      for (let y = 0; y < H; y++) {
        const f = (y / (H * 0.7)) * (SKY.length - 1);
        for (let x = 0; x < W; x++) {
          const i = Math.min(SKY.length - 1, Math.floor(f + bayer(x, y)));
          put(x, y, SKY[i]);
        }
      }

      const fogBand = (yc: number, thick: number, speed: number, strength: number) => {
        for (let y = Math.max(0, Math.floor(yc - thick)); y < Math.min(H, yc + thick); y++) {
          const fy = 1 - Math.abs(y - yc) / thick;
          for (let x = 0; x < W; x++) {
            const wave = Math.sin((x + t * speed) * 0.035 + y * 0.2) * 0.5 + 0.5;
            mix(x, y, MIST, fy * strength * (0.55 + wave * 0.45));
          }
        }
      };

      world.layers.forEach((L, li) => {
        const off = Math.floor(t * world.speeds[li]) % L.w;
        const src = L.px;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const sx = (x + off) % L.w;
            const i = (y * L.w + sx) * 4;
            if (src[i + 3] === 0) continue;
            const o = (y * W + x) * 4;
            d[o] = src[i];
            d[o + 1] = src[i + 1];
            d[o + 2] = src[i + 2];
            d[o + 3] = 255;
          }
        }
        // Mist settles between the depth layers.
        if (li === 0) fogBand(H * 0.64, H * 0.12, 3, 0.7);
        if (li === 1) fogBand(H * 0.76, H * 0.1, 5, 0.55);
        if (li === 2) {
          // Light falling through the canopy in slanted shafts.
          for (let s = 0; s < 4; s++) {
            const x0 = ((s * W) / 4 + W * 0.12 + Math.sin(t * 0.2 + s) * 6) % W;
            const pulse = 0.22 + Math.sin(t * 0.6 + s * 1.7) * 0.06;
            for (let y = 0; y < world.ground; y++) {
              const cx = x0 + y * 0.45;
              for (let dx = -7; dx <= 7; dx++) mix(Math.round(cx + dx), y, SUN, pulse * (1 - Math.abs(dx) / 8) * (1 - (y / world.ground) * 0.7));
            }
          }
        }
      });

      // Birds crossing the sky, two-frame wingbeats.
      for (const b of world.birds) {
        const x = Math.round(((b.x0 + t * b.speed) % (W + 20)) - 10);
        const y = Math.round(b.y + Math.sin(t * 0.8 + b.phase) * 2);
        const up = Math.floor(t * 6 + b.phase) % 2 === 0;
        const c: RGB = [58, 66, 64];
        put(x, y, c);
        put(x - 1, y + (up ? -1 : 0), c);
        put(x + 1, y + (up ? -1 : 0), c);
        put(x - 2, y + (up ? -1 : 1), c);
        put(x + 2, y + (up ? -1 : 1), c);
      }
      // Motes drifting slowly in the light.
      for (const m of world.motes) {
        const x = Math.round((m.x + t * m.s * 2) % W);
        const y = Math.round(m.y + Math.sin(t * 0.7 + m.p) * 3);
        if (Math.sin(t * 2 + m.p * 3) > -0.2) put(x, y, SUN);
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
      aria-label="An animated pixel-art forest: misty pines, mossy trunks, light through the trees, and birds"
      style={{ display: "block", width: "100%", height, borderRadius: 6, imageRendering: "pixelated", background: "#dfe7de" }}
    />
  );
}
