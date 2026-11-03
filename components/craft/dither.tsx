"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// The same 8x8 ordered-dither matrix the hadley.dev components and Still use.
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const PAGE: [number, number, number] = [244, 244, 245];
const REVEAL_MS = 750;

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** An image as a living ordered dither, the way Still's backdrop works: a few
 *  levels per channel with the color pushed, the dither pattern stepping each
 *  frame so it shimmers, and a slow drift across the picture. Around the
 *  pointer the levels open up and the real image comes through. */
export function DitherImage({ src, height = 180, rotate = false, cell = 3 }: { src: string; height?: number; rotate?: boolean; cell?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const pointer = { x: -999, y: 0 };
    let base: ImageData | null = null;
    let visible = true;
    let raf = 0;
    let last = 0;
    let frame = 0;
    let cancelled = false;
    const still = reducedMotion();

    const prepare = async () => {
      const img = await loadImage(src);
      if (cancelled) return;
      cv.width = Math.ceil(cv.clientWidth / cell);
      cv.height = Math.ceil(cv.clientHeight / cell);
      // Sample wider than the view so there's picture to drift across.
      const w = Math.ceil(cv.width * 1.35);
      const h = cv.height;
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const iw = rotate ? img.height : img.width;
      const ih = rotate ? img.width : img.height;
      const scale = Math.max(w / iw, h / ih);
      o.save();
      o.translate(w / 2, h / 2);
      if (rotate) o.rotate(-Math.PI / 2);
      o.drawImage(img, (-img.width * scale) / 2, (-img.height * scale) / 2, img.width * scale, img.height * scale);
      o.restore();
      base = o.getImageData(0, 0, w, h);
      draw();
    };

    const draw = () => {
      if (!base) return;
      const { width: w, height: h } = cv;
      const out = ctx.createImageData(w, h);
      const d = out.data;
      const b = base.data;
      const bw = base.width;
      const span = bw - w;
      const pan = still ? span / 2 : Math.round(((Math.sin(frame / 260) + 1) / 2) * span);
      const shift = still ? 0 : frame;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const si = (y * bw + x + pan) * 4;
          const near = Math.hypot(x - pointer.x, (y - pointer.y) * 1.2) < 22;
          const L = near ? 12 : 5;
          const t = BAYER8[((y + shift) & 7) * 8 + ((x + shift * 3) & 7)] - 0.5;
          const lum = (b[si] + b[si + 1] + b[si + 2]) / 3;
          const oi = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const v = b[si + c];
            // Push saturation and contrast before quantizing, for the vivid look.
            const sat = lum + (v - lum) * 1.3;
            const n = ((sat / 255 - 0.5) * 1.12 + 0.5) * (L - 1) + t;
            d[oi + c] = (Math.max(0, Math.min(L - 1, Math.round(n))) * 255) / (L - 1);
          }
          d[oi + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / 10) return;
      last = now;
      frame++;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / cell;
      pointer.y = (e.clientY - r.top) / cell;
      if (still) draw();
    };
    const onLeave = () => {
      pointer.x = -999;
      if (still) draw();
    };

    prepare();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => prepare());
    ro.observe(cv);
    if (!still) raf = requestAnimationFrame(loop);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [src, rotate, cell]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ display: "block", width: "100%", height, borderRadius: 6, imageRendering: "pixelated", background: "#E9E9EC" }}
    />
  );
}

/** Work arrives the way the components' labels do: the page color breaks up
 *  through an ordered dither, sweeping left to right, instead of a fade. */
export function DitherReveal({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  const paint = (p: number) => {
    const cv = cover.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const { width: w, height: h } = cv;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gone = BAYER8[(y & 7) * 8 + (x & 7)] * 0.6 + (x / w) * 0.4 < p;
        const i = (y * w + x) * 4;
        img.data[i] = PAGE[0];
        img.data[i + 1] = PAGE[1];
        img.data[i + 2] = PAGE[2];
        img.data[i + 3] = gone ? 0 : 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  // Covered before first paint, so a tile never flashes in and then dissolves.
  useLayoutEffect(() => {
    const cv = cover.current!;
    const r = wrap.current!.getBoundingClientRect();
    cv.width = Math.max(1, Math.ceil(r.width / 6));
    cv.height = Math.max(1, Math.ceil(r.height / 6));
    paint(0);
  }, []);

  useEffect(() => {
    if (reducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      return;
    }
    let raf = 0;
    let fallback = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = (now - start) / REVEAL_MS;
          paint(p);
          if (p < 1) raf = requestAnimationFrame(step);
          else setDone(true);
        };
        raf = requestAnimationFrame(step);
        // rAF never fires in a background tab; don't leave the work covered.
        fallback = window.setTimeout(() => setDone(true), REVEAL_MS + 400);
      },
      { threshold: 0.15 }
    );
    io.observe(wrap.current!);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={wrap} style={{ position: "relative", height: "100%" }}>
      {children}
      {!done && (
        <canvas
          ref={cover}
          aria-hidden
          style={{
            position: "absolute",
            inset: -1,
            width: "calc(100% + 2px)",
            height: "calc(100% + 2px)",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}

const POSTERS = [
  { src: "/jesse-poster.jpg", title: "Jesse" },
  { src: "/bryan-poster.jpg", title: "Bryan" },
  { src: "/payton-poster.jpg", title: "Payton" },
  { src: "/bauhaus-poster.jpg", title: "Bauhaus" },
  { src: "/cgi-poster.jpg", title: "CGI" },
];
const POSTER_MS = 3400;
const SWAP_MS = 650;

/** The posters, one at a time, trading places through the same ordered
 *  dither as everything else: the next one comes through the current one
 *  cell by cell. Hover holds it; the numbers pick one. */
export function PosterDeck() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const shown = useRef(-1);
  const images = useRef<HTMLImageElement[]>([]);

  // Cycles on its own unless someone's looking closely.
  useEffect(() => {
    if (held || reducedMotion()) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % POSTERS.length), POSTER_MS);
    return () => clearInterval(id);
  }, [held]);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let cancelled = false;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
    };

    const contain = (c: CanvasRenderingContext2D, img: HTMLImageElement) => {
      const s = Math.min(c.canvas.width / img.width, c.canvas.height / img.height) * 0.9;
      const w = img.width * s;
      const h = img.height * s;
      c.drawImage(img, (c.canvas.width - w) / 2, (c.canvas.height - h) / 2, w, h);
    };

    (async () => {
      if (!images.current.length) images.current = await Promise.all(POSTERS.map((p) => loadImage(p.src)));
      if (cancelled) return;
      fit();
      const next = images.current[index];
      const prev = shown.current >= 0 ? images.current[shown.current] : null;
      shown.current = index;
      if (!prev || reducedMotion()) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        contain(ctx, next);
        return;
      }
      // Draw the new poster into a scratch canvas, then let it through a
      // growing dither mask on top of the old one.
      const layer = document.createElement("canvas");
      layer.width = cv.width;
      layer.height = cv.height;
      const l = layer.getContext("2d")!;
      const cellPx = Math.max(4, Math.round(cv.width / 90));
      const mw = Math.ceil(cv.width / cellPx);
      const mh = Math.ceil(cv.height / cellPx);
      const mask = document.createElement("canvas");
      mask.width = mw;
      mask.height = mh;
      const m = mask.getContext("2d")!;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / SWAP_MS);
        const md = m.createImageData(mw, mh);
        for (let y = 0; y < mh; y++) {
          for (let x = 0; x < mw; x++) {
            const on = BAYER8[(y & 7) * 8 + (x & 7)] * 0.55 + (1 - y / mh) * 0.45 < p;
            md.data[(y * mw + x) * 4 + 3] = on ? 255 : 0;
          }
        }
        m.putImageData(md, 0, 0);
        l.globalCompositeOperation = "source-over";
        l.clearRect(0, 0, layer.width, layer.height);
        contain(l, next);
        l.globalCompositeOperation = "destination-in";
        l.imageSmoothingEnabled = false;
        l.drawImage(mask, 0, 0, layer.width, layer.height);
        ctx.clearRect(0, 0, cv.width, cv.height);
        contain(ctx, prev);
        ctx.drawImage(layer, 0, 0);
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          ctx.clearRect(0, 0, cv.width, cv.height);
          contain(ctx, next);
        }
      };
      raf = requestAnimationFrame(step);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [index]);

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
