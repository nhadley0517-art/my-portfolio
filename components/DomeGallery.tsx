"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { play } from "cuelume";

type ImageInput = string | { src: string; alt?: string };

export interface DomeGalleryProps {
  images?: ImageInput[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  /** A small, fixed vertical tilt (degrees) — no drag, so this never changes at runtime. */
  maxVerticalRotationDeg?: number;
  /** Constant auto-rotation speed, in degrees/second. */
  spinDegPerSec?: number;
  enlargeTransitionMs?: number;
  /** Column count — the tunable performance lever (fewer columns = fewer tiles). */
  segments?: number;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
}

const DEFAULTS = { maxVerticalRotationDeg: 5, spinDegPerSec: 3, enlargeTransitionMs: 300, segments: 18 };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
// Comfortable margin around an enlarged poster so it never touches the
// viewport edges — a fraction of the shorter viewport side, floor'd.
const getViewportPad = () => Math.max(32, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.08));
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

// Deterministic PRNG so the poster arrangement is stable across renders.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Coord { x: number; y: number; sizeX: number; sizeY: number; }
interface Item extends Coord { src: string; alt: string; }
// Trimmed to 3 rows (was 5) — the outermost rows sat at the steepest rotateX
// angles, where tiles foreshorten hard near the sphere's "poles" and visibly
// overlap/bunch. Dropping them leaves a rounder, cleaner equatorial band.
const YS_PER_COL = 3;

function buildItems(pool: ImageInput[], seg: number): Item[] {
  // Columns derived from segments so the dome stays round (and tiles stay
  // square) at any segment count — segments drives BOTH axes equally.
  const xCols = Array.from({ length: seg }, (_, i) => -(seg - 1) + i * 2);
  const evenYs = [-2, 0, 2];
  const oddYs = [-1, 1, 3];

  const coords: Coord[] = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const total = coords.length;
  const normalized = pool.map((image) =>
    typeof image === "string" ? { src: image, alt: "" } : { src: image.src || "", alt: image.alt || "" }
  );
  if (normalized.length === 0) return coords.map((c) => ({ ...c, src: "", alt: "" }));

  const rng = mulberry32((0x9e3779b9 ^ (normalized.length * 2654435761)) ^ (seg * 40503));

  // For each tile (column-major, YS_PER_COL per column) pick the least-used
  // image that isn't already a neighbour — the tile above (same column) or the
  // three tiles in the previous column at the same/adjacent y (horizontal +
  // both diagonals). Least-used keeps the distribution even; the seeded random
  // tie-break scatters the arrangement so no image marches along a diagonal.
  const counts = new Map<string, number>();
  normalized.forEach((im) => counts.set(im.src, 0));
  const used: { src: string; alt: string }[] = new Array(total);

  for (let k = 0; k < total; k++) {
    const col = Math.floor(k / YS_PER_COL);
    const yi = k % YS_PER_COL;
    const forbidden = new Set<string>();
    if (yi > 0 && used[k - 1]) forbidden.add(used[k - 1].src); // above (same column)
    if (col > 0) {
      for (const dy of [-1, 0, 1]) {
        const nk = k - YS_PER_COL + dy;
        if (nk >= (col - 1) * YS_PER_COL && nk < col * YS_PER_COL && used[nk]) forbidden.add(used[nk].src);
      }
    }
    let cands = normalized.filter((im) => !forbidden.has(im.src));
    if (cands.length === 0) cands = normalized.slice();
    const minCount = Math.min(...cands.map((im) => counts.get(im.src) ?? 0));
    const leastUsed = cands.filter((im) => (counts.get(im.src) ?? 0) === minCount);
    const pick = leastUsed[Math.floor(rng() * leastUsed.length)] ?? leastUsed[0];
    used[k] = pick;
    counts.set(pick.src, (counts.get(pick.src) ?? 0) + 1);
  }

  return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = [],
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  spinDegPerSec = DEFAULTS.spinDegPerSec,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  imageBorderRadius = "20px",
  openedImageBorderRadius = "20px",
  grayscale = false,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const scrimElRef = useRef<HTMLDivElement | null>(null);
  const overlayElRef = useRef<HTMLDivElement | null>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  // The overlay's box (left/top/width/height) is set ONCE at open time and
  // never re-written — a later container resize (e.g. the browser window
  // resizing) is expressed purely as a `transform` delta off this base, so
  // it stays GPU-only (no layout thrash).
  const enlargeBaseRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const enlargeAspectRef = useRef<number | null>(null); // natW/natH of the currently open image

  const rotationRef = useRef({ x: 0, y: 0 });
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const hoveredRef = useRef(false);
  const spinRAF = useRef<number | null>(null);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  };

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Fixed tilt, set once — there's no drag to change it at runtime.
    rotationRef.current = { x: maxVerticalRotationDeg, y: 0 };
    applyTransform(maxVerticalRotationDeg, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slow constant auto-spin — pauses on hover (so clicking a poster is
  // precise) and while a poster is open, and is fully disabled for
  // prefers-reduced-motion. A single style write per frame, no gesture
  // handling at all, which is what made dragging comparatively expensive.
  useEffect(() => {
    if (reducedMotionRef.current || spinDegPerSec <= 0) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!hoveredRef.current && !focusedElRef.current && !openingRef.current) {
        const nextY = wrapAngleSigned(rotationRef.current.y + spinDegPerSec * dt);
        rotationRef.current = { x: rotationRef.current.x, y: nextY };
        applyTransform(rotationRef.current.x, nextY);
      }
      spinRAF.current = requestAnimationFrame(loop);
    };
    spinRAF.current = requestAnimationFrame(loop);
    return () => { if (spinRAF.current) cancelAnimationFrame(spinRAF.current); };
  }, [spinDegPerSec]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const applySize = (rawW: number, rawH: number) => {
      const w = Math.max(1, rawW);
      const h = Math.max(1, rawH);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case "min": basis = minDim; break;
        case "max": basis = maxDim; break;
        case "width": basis = w; break;
        case "height": basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);
      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      // If a poster is currently open, keep it correctly sized/positioned —
      // expressed as a transform delta off the fixed base box (GPU-only).
      // The poster now floats above the whole viewport, so this is measured
      // against the window, not this dome's own (much smaller) container.
      const enlarged = overlayElRef.current;
      const base = enlargeBaseRef.current;
      const aspect2 = enlargeAspectRef.current;
      if (enlarged && base && aspect2) {
        const pad = getViewportPad();
        const availW = Math.max(1, window.innerWidth - 2 * pad);
        const availH = Math.max(1, window.innerHeight - 2 * pad);
        let boxW: number, boxH: number;
        if (availW / availH > aspect2) { boxH = availH; boxW = availH * aspect2; }
        else { boxW = availW; boxH = availW / aspect2; }
        const targetLeft = (window.innerWidth - boxW) / 2;
        const targetTop = (window.innerHeight - boxH) / 2;
        const dx = targetLeft - base.left;
        const dy = targetTop - base.top;
        const sx = base.width > 0 ? boxW / base.width : 1;
        const sy = base.height > 0 ? boxH / base.height : 1;
        enlarged.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      }
    };

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      applySize(cr.width, cr.height);
    });
    ro.observe(root);

    // Also size synchronously on mount so we don't depend solely on the RO
    // firing (some contexts throttle/defer RO delivery).
    const r = root.getBoundingClientRect();
    applySize(r.width, r.height);
    const raf = requestAnimationFrame(() => {
      const r2 = root.getBoundingClientRect();
      applySize(r2.width, r2.height);
    });

    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [fit, fitBasis, minRadius, maxRadius, padFactor, grayscale, imageBorderRadius, openedImageBorderRadius]);

  // ── Enlarge / close ──────────────────────────────────────────
  const openMs = () => (reducedMotionRef.current ? 0 : enlargeTransitionMs);

  // Closing animates the poster back down into its dome tile, then tears
  // down the (viewport-level, body-appended) scrim + overlay it created.
  const close = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 250) return;
    const el = focusedElRef.current;
    if (!el) return;
    const parent = el.parentElement as HTMLElement;
    const overlay = overlayElRef.current;
    const scrimEl = scrimElRef.current;
    if (!overlay) return;
    const refDiv = parent.querySelector(".item__image--reference") as HTMLElement | null;
    const originalPos = originalTilePositionRef.current;

    if (scrimEl) {
      scrimEl.classList.remove("is-open");
      scrimEl.addEventListener("transitionend", () => scrimEl.remove(), { once: true });
    }

    const finish = () => {
      originalTilePositionRef.current = null;
      enlargeBaseRef.current = null;
      enlargeAspectRef.current = null;
      overlayElRef.current = null;
      scrimElRef.current = null;
      if (refDiv) refDiv.remove();
      parent.style.setProperty("--rot-y-delta", "0deg");
      parent.style.setProperty("--rot-x-delta", "0deg");
      el.style.visibility = "";
      el.style.zIndex = "0";
      focusedElRef.current = null;
      openingRef.current = false;
    };
    if (!originalPos) { overlay.remove(); finish(); return; }
    const currentRect = overlay.getBoundingClientRect();
    const from = { left: currentRect.left, top: currentRect.top, width: currentRect.width, height: currentRect.height };
    const to = { left: originalPos.left, top: originalPos.top, width: originalPos.width, height: originalPos.height };
    const anim = document.createElement("div");
    anim.className = "dome-enlarge-closing";
    anim.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:310;border-radius:var(--enlarge-radius,20px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${openMs()}ms ease-out;pointer-events:none;`;
    const oImg = overlay.querySelector("img");
    if (oImg) { const c = oImg.cloneNode() as HTMLImageElement; c.style.cssText = "width:100%;height:100%;object-fit:contain;"; anim.appendChild(c); }
    overlay.remove();
    document.body.appendChild(anim);
    void anim.getBoundingClientRect();
    requestAnimationFrame(() => {
      anim.style.left = to.left + "px";
      anim.style.top = to.top + "px";
      anim.style.width = to.width + "px";
      anim.style.height = to.height + "px";
      anim.style.opacity = "0";
    });
    const done = () => { anim.remove(); finish(); };
    if (openMs() === 0) done();
    else anim.addEventListener("transitionend", done, { once: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enlargeTransitionMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return;
      play("press");
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      const parent = el.parentElement as HTMLElement;
      focusedElRef.current = el;
      const offsetX = getDataNumber(parent, "offsetX", 0);
      const offsetY = getDataNumber(parent, "offsetY", 0);
      const sizeX = getDataNumber(parent, "sizeX", 2);
      const sizeY = getDataNumber(parent, "sizeY", 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotX}deg`);
      const refDiv = document.createElement("div");
      refDiv.className = "item__image item__image--reference";
      refDiv.style.opacity = "0";
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);
      void refDiv.offsetHeight;
      const tileR = refDiv.getBoundingClientRect();
      if (tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        return;
      }

      // Size the expanded view to the clicked image's OWN aspect ratio, fit
      // within the whole viewport (not just this dome's own cell) — the
      // poster floats above the entire page, same as every other bento overlay.
      const srcImgEl = el.querySelector("img") as HTMLImageElement | null;
      const natW = srcImgEl?.naturalWidth || 1;
      const natH = srcImgEl?.naturalHeight || 1;
      const aspect = natW / natH;
      enlargeAspectRef.current = aspect;
      const pad = getViewportPad();
      const availW = Math.max(1, window.innerWidth - 2 * pad);
      const availH = Math.max(1, window.innerHeight - 2 * pad);
      let boxW: number, boxH: number;
      if (availW / availH > aspect) { boxH = availH; boxW = availH * aspect; }
      else { boxW = availW; boxH = availW / aspect; }
      const boxLeft = (window.innerWidth - boxW) / 2;
      const boxTop = (window.innerHeight - boxH) / 2;

      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      // Fixed box, set once — any later resize is expressed as a `transform`
      // delta off this base, never by re-writing left/top/width/height.
      enlargeBaseRef.current = { left: boxLeft, top: boxTop, width: boxW, height: boxH };
      el.style.visibility = "hidden";
      el.style.zIndex = "0";

      // A soft, light scrim spanning the whole viewport (not a dark backdrop,
      // and not confined to this dome's own box) — clicking anywhere on it
      // (i.e. anywhere outside the poster itself) closes the poster.
      const scrimEl = document.createElement("div");
      scrimEl.className = "dome-scrim";
      document.body.appendChild(scrimEl);
      scrimElRef.current = scrimEl;
      scrimEl.addEventListener("click", close);

      const overlay = document.createElement("div");
      overlay.className = "dome-enlarge";
      overlay.style.cssText = `position:fixed;left:${boxLeft}px;top:${boxTop}px;width:${boxW}px;height:${boxH}px;opacity:0;will-change:transform,opacity;transform-origin:top left;transition:transform ${openMs()}ms cubic-bezier(0.16,1,0.3,1),opacity ${openMs()}ms ease;`;
      const img = document.createElement("img");
      img.src = parent.dataset.src || srcImgEl?.src || "";
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      overlayElRef.current = overlay;
      const tx0 = tileR.left - boxLeft;
      const ty0 = tileR.top - boxTop;
      const sx0 = tileR.width / boxW;
      const sy0 = tileR.height / boxH;
      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${isFinite(sx0) && sx0 > 0 ? sx0 : 1}, ${isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px,0px) scale(1,1)";
        scrimEl.classList.add("is-open");
      });
    },
    [enlargeTransitionMs, segments, close]
  );

  const onTileClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => { if (!openingRef.current) openItemFromElement(e.currentTarget); }, [openItemFromElement]);
  const onTilePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => { if (e.pointerType === "touch" && !openingRef.current) openItemFromElement(e.currentTarget); }, [openItemFromElement]);

  const cssVars = {
    ["--segments-x"]: segments,
    ["--segments-y"]: segments,
    ["--tile-radius"]: imageBorderRadius,
    ["--enlarge-radius"]: openedImageBorderRadius,
    ["--image-filter"]: grayscale ? "grayscale(1)" : "none",
  } as React.CSSProperties;

  return (
    <div ref={rootRef} className="sphere-root" style={cssVars}>
      <main
        className="sphere-main"
        onPointerEnter={() => { hoveredRef.current = true; }}
        onPointerLeave={() => { hoveredRef.current = false; }}
      >
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={{
                  ["--offset-x"]: it.x,
                  ["--offset-y"]: it.y,
                  ["--item-size-x"]: it.sizeX,
                  ["--item-size-y"]: it.sizeY,
                } as React.CSSProperties}
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={0}
                  aria-label={it.alt || "Open image"}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                >
                  {it.src ? <img src={it.src} draggable={false} alt={it.alt} /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        .sphere-root {
          position: relative;
          width: 100%;
          height: 100%;
          --radius: 520px;
          --viewer-pad: 72px;
          --circ: calc(var(--radius) * 3.14);
          --rot-y: calc((360deg / var(--segments-x)) / 2);
          --rot-x: calc((360deg / var(--segments-y)) / 2);
          --item-width: calc(var(--circ) / var(--segments-x));
          --item-height: calc(var(--circ) / var(--segments-y));
        }
        .sphere-root * { box-sizing: border-box; }
        .sphere, .item, .item__image { transform-style: preserve-3d; }
        main.sphere-main {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          background: transparent;
        }
        .stage {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          perspective: calc(var(--radius) * 2);
          perspective-origin: 50% 50%;
          contain: layout paint size;
        }
        .sphere { transform: translateZ(calc(var(--radius) * -1)); will-change: transform; }
        .item {
          width: calc(var(--item-width) * var(--item-size-x));
          height: calc(var(--item-height) * var(--item-size-y));
          position: absolute;
          top: -999px; bottom: -999px; left: -999px; right: -999px;
          margin: auto;
          transform-origin: 50% 50%;
          backface-visibility: hidden;
          transition: transform 300ms;
          transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
            rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
            translateZ(var(--radius));
        }
        .item__image {
          position: absolute;
          display: block;
          inset: 8px;
          border-radius: var(--tile-radius, 16px);
          background: transparent;
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;   /* tiles are clickable */
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          /* NOTE: no per-tile layer promotion — many composited layers was the
             scroll-lag culprit. Tiles paint into the single .sphere layer. */
        }
        .item__image:focus { outline: none; }
        .item__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          filter: var(--image-filter, none);
        }
        /* The enlarged poster and its scrim are appended straight to
           document.body (not this component's own DOM subtree) so they float
           above the ENTIRE viewport — a click anywhere outside the poster
           closes it, not just within this dome's own cell. Same soft, light
           "levitating overlay" look shared by every other bento-grid modal
           (see --overlay-backdrop-bg/--overlay-backdrop-blur), rather than a
           dark scrim. */
        .dome-scrim {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: var(--overlay-backdrop-bg);
          -webkit-backdrop-filter: var(--overlay-backdrop-blur);
          backdrop-filter: var(--overlay-backdrop-blur);
          opacity: 0;
          transition: opacity 300ms ease;
        }
        .dome-scrim.is-open { opacity: 1; }
        .dome-enlarge {
          z-index: 310;
          border-radius: var(--enlarge-radius, 20px);
          overflow: hidden;
          box-shadow: 0 30px 70px -15px rgba(0,0,0,0.4);
        }
        /* box already matches the image's own aspect ratio — no matte, no bars */
        .dome-enlarge img, .dome-enlarge-closing img { width: 100%; height: 100%; object-fit: contain; filter: var(--image-filter, none); }
        @media (prefers-reduced-motion: reduce) {
          .item, .item__image, .sphere { transition: none !important; }
          .dome-scrim { transition: none; }
        }
      `}</style>
    </div>
  );
}
