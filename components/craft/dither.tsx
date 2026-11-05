"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// The same 8x8 ordered-dither matrix the hadley.dev components and Still use.
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);


export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** An image as an ordered dither that never sits completely still: the
 *  picture stays put, and each cell's threshold breathes on its own slow,
 *  random rhythm, so a few pixels at a time quietly flip. Soft sparkle,
 *  not shimmer. */
export function DitherImage({ src, height = 180, cell = 3 }: { src: string; height?: number; cell?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let base: ImageData | null = null;
    let phase = new Float32Array(0);
    let speed = new Float32Array(0);
    let out: ImageData | null = null;
    let visible = true;
    let raf = 0;
    let last = 0;
    let cancelled = false;
    const still = reducedMotion();

    const prepare = async () => {
      const img = await loadImage(src);
      if (cancelled) return;
      const w = (cv.width = Math.ceil(cv.clientWidth / cell));
      const h = (cv.height = Math.ceil(cv.clientHeight / cell));
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.imageSmoothingQuality = "high";
      const s = Math.max(w / img.width, h / img.height);
      o.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
      base = o.getImageData(0, 0, w, h);
      out = ctx.createImageData(w, h);
      phase = Float32Array.from({ length: w * h }, () => Math.random() * Math.PI * 2);
      speed = Float32Array.from({ length: w * h }, () => 0.35 + Math.random() * 0.9);
      draw(0);
    };

    const L = 5;
    const draw = (time: number) => {
      if (!base || !out) return;
      const { width: w, height: h } = cv;
      const b = base.data;
      const d = out.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const p = i * 4;
          // A small, slow wobble around the cell's ordered threshold.
          const t = BAYER8[(y & 7) * 8 + (x & 7)] - 0.5 + (still ? 0 : 0.16 * Math.sin(phase[i] + time * speed[i]));
          const lum = (b[p] + b[p + 1] + b[p + 2]) / 3;
          for (let c = 0; c < 3; c++) {
            const sat = lum + (b[p + c] - lum) * 1.25;
            const n = ((sat / 255 - 0.5) * 1.08 + 0.5) * (L - 1) + t;
            d[p + c] = (Math.max(0, Math.min(L - 1, Math.round(n))) * 255) / (L - 1);
          }
          d[p + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / 12) return;
      last = now;
      draw(now / 1000);
    };

    prepare().catch(() => {});
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => { prepare().catch(() => {}); });
    ro.observe(cv);
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [src, cell]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ display: "block", width: "100%", height, borderRadius: 6, imageRendering: "pixelated", background: "#E9E9EC" }}
    />
  );
}

/** Work comes into focus as it scrolls in: a soft fade up from a light blur
 *  and a hair of scale, staggered by its place in the row. Quiet enough to
 *  repeat on every tile without the page feeling busy. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [lag, setLag] = useState(delay);

  useEffect(() => {
    if (reducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // Tiles further right in their row arrive a beat later.
        const grid = wrap.current!.closest(".c-grid")?.getBoundingClientRect();
        if (grid) setLag(delay + Math.max(0, (e.boundingClientRect.left - grid.left) / grid.width) * 0.18);
        setShown(true);
      },
      { threshold: 0.15 }
    );
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div
      ref={wrap}
      style={{
        height: "100%",
        opacity: shown ? 1 : 0,
        filter: shown ? "none" : "blur(10px)",
        transform: shown ? "none" : "translateY(10px) scale(1.025)",
        transition: `opacity 0.6s ease ${lag}s, filter 0.7s cubic-bezier(0.16,1,0.3,1) ${lag}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${lag}s`,
      }}
    >
      {children}
    </div>
  );
}

const POSTERS = [
  { src: "/craft/posters/jesse.jpg", title: "Jesse" },
  { src: "/craft/posters/bryan.jpg", title: "Bryan" },
  { src: "/craft/posters/payton.jpg", title: "Payton" },
  { src: "/craft/posters/bauhaus.jpg", title: "Bauhaus" },
  { src: "/craft/posters/cgi.jpg", title: "CGI" },
];
const POSTER_MS = 3600;
const SWAP_MS = 700;
const PLINTH = "#EBEBED";

/** The posters, one at a time, trading places through the same ordered
 *  dither as everything else: the next one comes through the current one
 *  cell by cell. Each poster is painted once, on its own plinth-colored
 *  frame, so a narrower poster fully covers a wider one and a swap only ever
 *  composites two ready-made frames. Hover holds it; the numbers pick one. */
export function PosterDeck() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const frames = useRef<HTMLCanvasElement[]>([]);
  const shown = useRef(-1);
  const [ready, setReady] = useState(false);

  // Paint every poster into a frame the canvas's size, once.
  useEffect(() => {
    const cv = ref.current!;
    let cancelled = false;
    const build = async () => {
      const imgs = await Promise.all(POSTERS.map((p) => loadImage(p.src)));
      if (cancelled) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(cv.clientWidth * dpr);
      const h = Math.round(cv.clientHeight * dpr);
      cv.width = w;
      cv.height = h;
      frames.current = imgs.map((img) => {
        const f = document.createElement("canvas");
        f.width = w;
        f.height = h;
        const c = f.getContext("2d")!;
        c.fillStyle = PLINTH;
        c.fillRect(0, 0, w, h);
        c.imageSmoothingQuality = "high";
        const s = Math.min(w / img.width, h / img.height) * 0.88;
        c.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
        return f;
      });
      // A resize repaints whatever is showing at the new size.
      if (shown.current >= 0) cv.getContext("2d")!.drawImage(frames.current[shown.current], 0, 0);
      setReady(true);
    };
    build().catch(() => {});
    const ro = new ResizeObserver(() => { build().catch(() => {}); });
    ro.observe(cv);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  // Cycles on its own unless someone's looking closely.
  useEffect(() => {
    if (held || !ready || reducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % POSTERS.length), POSTER_MS);
    return () => clearInterval(id);
  }, [held, ready]);

  useEffect(() => {
    if (!ready) return;
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const next = frames.current[index];
    const prev = shown.current >= 0 ? frames.current[shown.current] : null;
    shown.current = index;
    if (!prev || reducedMotion()) {
      ctx.drawImage(next, 0, 0);
      return;
    }
    // A small mask, one pixel per dither cell, scaled up crisply over the
    // incoming frame. Thresholds are worked out once per swap.
    const cellPx = Math.max(4, Math.round(cv.width / 80));
    const mw = Math.ceil(cv.width / cellPx);
    const mh = Math.ceil(cv.height / cellPx);
    const thresholds = new Float32Array(mw * mh);
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) thresholds[y * mw + x] = BAYER8[(y & 7) * 8 + (x & 7)] * 0.55 + (1 - y / mh) * 0.45;
    }
    const mask = document.createElement("canvas");
    mask.width = mw;
    mask.height = mh;
    const m = mask.getContext("2d")!;
    const md = m.createImageData(mw, mh);
    const layer = document.createElement("canvas");
    layer.width = cv.width;
    layer.height = cv.height;
    const l = layer.getContext("2d")!;
    l.imageSmoothingEnabled = false;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / SWAP_MS);
      for (let i = 0; i < thresholds.length; i++) md.data[i * 4 + 3] = thresholds[i] < p ? 255 : 0;
      m.putImageData(md, 0, 0);
      l.globalCompositeOperation = "copy";
      l.drawImage(mask, 0, 0, layer.width, layer.height);
      l.globalCompositeOperation = "source-in";
      l.drawImage(next, 0, 0);
      ctx.drawImage(prev, 0, 0);
      ctx.drawImage(layer, 0, 0);
      if (p < 1) raf = requestAnimationFrame(step);
      else ctx.drawImage(next, 0, 0);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ctx.drawImage(next, 0, 0);
    };
  }, [index, ready]);

  return (
    <div className="c-deck" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <canvas ref={ref} role="img" aria-label={`${POSTERS[index].title} poster`} />
      <div className="c-deck-picks">
        {POSTERS.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className={i === index ? "is-on" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Show the ${p.title} poster`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
