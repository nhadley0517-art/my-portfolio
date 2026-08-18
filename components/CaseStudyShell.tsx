"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import CaseStudyNav from "@/components/CaseStudyNav";

/** Shared plumbing for the long-form case studies (No. 2, Cove, Writing
 *  Process). Each one renders either as its own page or as the body of a
 *  bento overlay on the home page, so the same content serves both a
 *  shareable URL and the single-page browsing experience. */
export interface CaseStudyContentProps {
  variant?: "page" | "overlay";
  /** Required when variant="overlay" — closes the overlay instead of navigating. */
  onClose?: () => void;
}

/** One neutral section label for every case study, styled to match the home
 *  page's type system — sentence case, dark, no hairline or letter-spacing
 *  tricks, so it reads as a heading rather than a tag. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: "16px",
        fontWeight: 300,
        color: "#13181B",
        margin: "0 0 24px",
      }}
    >
      {children}
    </p>
  );
}

const linkClass =
  "group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors";

export function CaseStudyBottomNav({
  isOverlay,
  onClose,
  nextHref,
  nextLabel,
}: {
  isOverlay: boolean;
  onClose?: () => void;
  /** The next case study, shown only on the standalone page. */
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <section className="px-6 py-12 border-t border-[#E9E9EC]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {isOverlay ? (
          <button
            type="button"
            onClick={onClose}
            className={linkClass}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to all work
          </button>
        ) : (
          <>
            <Link href="/#work" className={linkClass}>
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to all work
            </Link>
            {nextHref && nextLabel && (
              <Link
                href={nextHref}
                className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#7D8A93] transition-colors"
              >
                {nextLabel}
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** On desktop, a direct visit to a case study's standalone route (a typed
 *  URL, a refresh, a shared link) redirects into the same overlay
 *  experience opening it from the home page gives — the plain page reads
 *  as cramped next to that, and it's the only place the side legend below
 *  has room to sit. Mobile is left alone: it keeps the real page exactly as
 *  before, matching the `< 700` cutoff BentoOverlayProvider already uses
 *  everywhere else to decide "this is a phone." */
export function DesktopOverlayRedirect({ slug }: { slug: string }) {
  const router = useRouter();
  useEffect(() => {
    if (window.innerWidth >= 700) router.replace(`/?p=${slug}`);
  }, [router, slug]);
  return null;
}

/** The section legend for a case study overlay — a standalone panel fixed
 *  to the viewport, not part of the overlay's own layout at all (see
 *  OverlayEntry.sidePanel). It used to be a flex sibling of the content
 *  shell, which meant the shell's own centered width had to shrink to make
 *  room for it — throwing off the content's centering (max-w-5xl mx-auto
 *  centers within whatever's left after the legend and its gap, not the
 *  shell as a whole), which is what read as the hero image looking pushed
 *  off to one side. Fixed positioning keeps the shell's own centering
 *  completely untouched — the content overlay stays exactly what it was
 *  before the legend existed, and the legend just floats beside it when
 *  there's room.
 *
 *  The shell is centered and capped at 1320px (see .bento-overlay-shell.wide
 *  in BentoOverlay.tsx); this only shows once the viewport is wide enough
 *  that the dead space on either side of that centered shell can fit the
 *  panel without touching it — roughly 1320 + 2*(24 edge + ~220 panel +
 *  24 gap) ≈ 1900px. That's deliberately a high bar: keeping the content
 *  shell centered and undiminished matters more than the legend showing up
 *  on every desktop width. */
export function CaseStudySidePanel({
  sections,
  accentColor,
}: {
  sections: { id: string; label: string }[];
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Lines up with the shell's own top edge, not the viewport's vertical
  // center — read directly off the shell element itself (a separate portal,
  // but the same document) since this panel has no other way to know where
  // the shell landed. The shell's top isn't a fixed value: it's vertically
  // centered by the backdrop's own flex centering, so it moves with the
  // shell's height (which varies by content) and the viewport size.
  const [top, setTop] = useState(120);
  useEffect(() => {
    const shell = document.querySelector(".bento-overlay-shell");
    const update = () => {
      if (shell) setTop(shell.getBoundingClientRect().top);
    };
    update();
    // The shell plays its own entrance animation (scale + translateY spring)
    // when the overlay opens, so its rect keeps moving for a few hundred ms
    // after this panel mounts — a single measurement on mount was catching
    // it mid-animation and freezing the panel at that stale, too-low
    // position. Keep re-measuring every frame until it's clearly done.
    let raf: number;
    const start = performance.now();
    const tick = () => {
      update();
      if (performance.now() - start < 800) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // The 800ms window above only covers the entrance animation — it doesn't
    // cover the shell's height changing afterward (e.g. late web-font
    // reflow, or content inside it loading in), which shifts the shell's
    // top too, since the backdrop centers it vertically by its height. A
    // ResizeObserver catches that whenever it happens instead of guessing a
    // longer timeout, which is what let this drift stale again ("too low")
    // once whatever caused it landed after the old fixed window closed.
    const ro = shell ? new ResizeObserver(update) : null;
    if (shell && ro) ro.observe(shell);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <motion.div
      ref={ref}
      className="cs-side-panel"
      style={{ top }}
      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <CaseStudyNav sections={sections} accentColor={accentColor} inline />

      <style>{`
        .cs-side-panel {
          display: none;
          position: fixed;
          /* Anchored from the shell's own edge (viewport center minus half
             its max width), not the viewport edge — so it stays docked
             against the shell instead of drifting away from it as the
             viewport keeps growing past 1900px. Expressed as a right-edge
             offset rather than left + a translateX transform — Framer
             Motion's own x/opacity animation above sets the transform
             property inline too, and inline styles don't merge: whichever
             set it last wins, which silently broke the positioning
             transform entirely. Anchoring from the right edge doesn't need
             a transform at all, so it can't collide with Framer's. */
          right: calc(50vw + 684px);
          /* Matches .bento-overlay-shell.wide's own background exactly
             (BentoOverlay.tsx) — previously plain white, which read as a
             visibly different surface floating next to the case study
             instead of a companion piece of it. */
          background: #f4f4f5;
          border-radius: 4px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
          padding: 20px 24px;
          /* No min-width — the inline nav below is already width:fit-content,
             so the panel now shrinks to whatever the longest label actually
             needs plus this padding, instead of every case study getting the
             same fixed box regardless of how short its labels are. */
          width: fit-content;
          z-index: 301;
        }
        @media (min-width: 1900px) {
          .cs-side-panel { display: block; }
        }
      `}</style>
    </motion.div>
  );
}
