"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useBentoOverlay } from "@/components/BentoOverlay";

export interface ProjectRow {
  /** Overlay registry slug this row opens. */
  slug: string;
  /** Omitted where the real date isn't known — the column drops for the
   *  whole list rather than showing a guessed or blank year. */
  year?: string;
  title: string;
  category: string;
  thumb?: { type: "image" | "video" | "iframe"; src: string };
  /** Shows a small "Live" indicator right after the title — for the
   *  shorter pieces that are actually deployed/in production, same signal
   *  as the case studies' status badges, just sized for a dense list row. */
  live?: boolean;
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;

/** A quiet index of work: year, title, category, hairline. The row you're
 *  pointing at stays dark while the rest recede, and its thumbnail trails
 *  the cursor — so the list stays calm at rest but still shows the work. */
export default function ProjectList({ label, rows }: { label: string; rows: ProjectRow[] }) {
  const { openSlug } = useBentoOverlay();
  const [hovered, setHovered] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lastMoveAt = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 420, damping: 34, mass: 0.5 });
  const y = useSpring(mouseY, { stiffness: 420, damping: 34, mass: 0.5 });

  const active = rows.find((r) => r.slug === hovered);
  const showYear = rows.some((r) => r.year);

  // Chrome re-hit-tests under a stationary pointer when the page scrolls,
  // which fires pointerenter/pointerleave on rows that scroll past the
  // cursor even though it never moved — that's what made the thumbnail pop
  // up top-left (no real pointermove ever set mouseX/mouseY) or stay stuck
  // after scrolling past a row. Once a row is hovered, re-check on every
  // scroll frame whether the last *real* pointer position is still actually
  // inside it, and clear if not.
  useEffect(() => {
    if (!hovered) return;
    let ticking = false;
    const check = () => {
      const el = rowRefs.current.get(hovered);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = mouseX.get();
      const py = mouseY.get();
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) {
        setHovered(null);
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hovered, mouseX, mouseY]);

  return (
    <div
      className="plist"
      onPointerMove={(e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        lastMoveAt.current = performance.now();
      }}
      onPointerLeave={() => setHovered(null)}
    >
      {/* Ease-in on scroll, not on mount — this list sits further down the
          page than the hero/selected-work, so it reveals as you reach it. */}
      <motion.p
        className="plist-label"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {label}
      </motion.p>

      <div className={"plist-rows" + (hovered ? " is-hovering" : "") + (showYear ? "" : " no-year")}>
        {rows.map((row, i) => (
          <button
            key={row.slug}
            type="button"
            ref={(el) => {
              if (el) rowRefs.current.set(row.slug, el);
              else rowRefs.current.delete(row.slug);
            }}
            className="plist-row"
            onClick={() => openSlug(row.slug)}
            onPointerEnter={() => {
              // A real cursor entering the row is always preceded by actual
              // pointermove events tracking it there; the scroll-triggered
              // synthetic re-hit-test fires with no pointermove at all, just
              // a stale mouse position. Requiring recent real movement is
              // what tells them apart (movementX/Y on the enter event itself
              // isn't reliable — browsers don't consistently populate it).
              if (performance.now() - lastMoveAt.current > 100) return;
              setHovered(row.slug);
            }}
            onFocus={() => setHovered(row.slug)}
            onBlur={() => setHovered(null)}
          >
            {showYear && <span className="plist-year">{row.year}</span>}
            <span className="plist-title-wrap">
              <motion.span
                className="plist-title"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.04 }}
              >
                {row.title}
              </motion.span>
              {row.live && (
                <span className="plist-live-badge">
                  <span className="plist-live-dot" />
                  Live
                </span>
              )}
            </span>
            <span className="plist-category">{row.category}</span>
          </button>
        ))}
      </div>

      {/* Cursor-tracked preview. Fixed-position and pointer-events:none so it
          never interrupts the hover it's reacting to. */}
      <AnimatePresence>
        {active?.thumb && (
          <motion.div
            key={active.slug}
            className="plist-thumb"
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease }}
          >
            {active.thumb.type === "video" ? (
              <video src={active.thumb.src} autoPlay muted loop playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.thumb.src} alt="" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .plist { position: relative; }
        .plist-label {
          font-size: 16px;
          font-weight: 300;
          color: #13181B;
          margin: 0 0 22px;
        }
        .plist-rows { display: flex; flex-direction: column; }
        .plist-row {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          align-items: baseline;
          gap: 28px;
          width: 100%;
          padding: 22px 0;
          border: none;
          background: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .plist-rows.no-year .plist-row { grid-template-columns: 1fr auto; }

        .plist-year {
          font-size: 12px;
          color: #A8ABB2;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.04em;
          transition: color 0.3s ease;
        }
        .plist-title-wrap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .plist-title {
          font-size: 16px;
          font-weight: 400;
          /* Light gray at rest — black is reserved for section titles, not
             individual row titles — darkening only on hover/focus. */
          color: #A8ABB2;
          letter-spacing: -0.015em;
          transition: color 0.3s ease;
        }
        .plist-row:hover .plist-title,
        .plist-row:focus-visible .plist-title {
          color: #13181B;
        }
        .plist-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding: 3px 8px;
          border-radius: 4px;
          background: #fff;
          font-size: 12px;
          font-weight: 400;
          color: #6B7280;
        }
        .plist-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #16A34A;
          flex-shrink: 0;
        }
        .plist-category {
          font-size: 12px;
          color: #A8ABB2;
          transition: color 0.3s ease;
        }

        /* Pointing at one row quiets the others rather than highlighting the
           target — less visual shouting for the same emphasis. */
        .plist-rows.is-hovering .plist-row { opacity: 0.4; }
        .plist-rows.is-hovering .plist-row:hover,
        .plist-rows.is-hovering .plist-row:focus-visible { opacity: 1; }

        .plist-thumb {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 120;
          width: 180px;
          margin: -54px 0 0 26px;
          pointer-events: none;
          box-shadow: 0 18px 40px -16px rgba(0,0,0,0.32);
          background: #fff;
        }
        /* height:auto (no object-fit:cover) — the container follows the
           image's own aspect ratio instead of forcing a fixed box and
           cropping whatever doesn't fit. */
        .plist-thumb img,
        .plist-thumb video {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 4px;
        }

        @media (max-width: 700px) {
          .plist-row { grid-template-columns: 44px 1fr; gap: 16px; padding: 18px 0; }
          .plist-category { display: none; }
          .plist-thumb { display: none; }
          .plist-rows.is-hovering .plist-row { opacity: 1; }
          .plist-live-badge { font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .plist-thumb { display: none; }
        }
      `}</style>
    </div>
  );
}
