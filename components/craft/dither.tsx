"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// The same 8x8 ordered-dither matrix the hadley.dev components and Still use.
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const INK = "#13181B";
const SIGNAL = "#E4572E";
const PAGE: [number, number, number] = [244, 244, 245];
const CELL = 3;
const FPS = 14;
const REVEAL_MS = 750;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A thin strip of slow weather: two drifting waves through an ordered dither,
 *  with a little signal orange where they crest. Chunky frame rate on purpose,
 *  so it reads as a printed texture rather than an animation. Leans toward the
 *  pointer, and stops drawing whenever it's off screen. */
export function DitherBand({ height = 44 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const pointer = { x: -1, y: -1 };
    let visible = true;
    let raf = 0;
    let last = 0;

    const fit = () => {
      cv.width = Math.ceil(cv.clientWidth / CELL);
      cv.height = Math.ceil(cv.clientHeight / CELL);
    };

    const draw = (t: number) => {
      const { width: w, height: h } = cv;
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w;
          const v = y / h;
          let d =
            0.5 +
            0.3 * Math.sin(u * 9 + t * 0.35 + Math.sin(v * 3 + t * 0.2) * 1.4) +
            0.2 * Math.sin(u * 23 - t * 0.5 + v * 4);
          d *= Math.sin(v * Math.PI) ** 0.6;
          if (pointer.x >= 0) d += 0.5 * Math.exp(-((x - pointer.x) ** 2 + (y - pointer.y) ** 2) / 500);
          const bayer = BAYER8[(y & 7) * 8 + (x & 7)];
          if (d * 0.72 <= bayer) continue;
          // Dithered into the ink too, so the orange has no hard edge.
          ctx.fillStyle = (Math.sin(u * 5 - t * 0.25) - 0.55) * 2.6 > bayer ? SIGNAL : INK;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now / 1000);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / CELL;
      pointer.y = (e.clientY - r.top) / CELL;
    };
    const onLeave = () => {
      pointer.x = -1;
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
    if (!reducedMotion()) {
      raf = requestAnimationFrame(loop);
      cv.addEventListener("pointermove", onMove);
      cv.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ display: "block", width: "100%", height, imageRendering: "pixelated" }}
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
