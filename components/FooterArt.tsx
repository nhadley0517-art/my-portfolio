"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Slightly taller than NEWFOOTER.png's own 2.3 ratio — object-position's Y
// value controls how that extra sliver splits between the two edges (0% =
// all off the bottom, 100% = all off the top).
const FRAME_ASPECT = 2.4;

/** The footer's pixel-art scene, kept plain — just the art itself, no
 *  dither/blur/mask treatment on top of it.
 *  - Breaks out of the sidenav's inset on desktop (negative margin) so it
 *    spans the true full viewport width instead of leaving a blank gap
 *    where the sidenav would've been.
 *  - `image-rendering: pixelated` — the source is a small native-resolution
 *    (230x100) pixel-art canvas meant to be scaled up with hard pixel edges,
 *    not smoothed/blurred by the browser's default bilinear scaling.
 *  - Reveals with a simple fade+scale on scroll into view, since the footer
 *    is far enough down the page that it's never seen on load anyway.
 *  - `children`, if given, renders as a centered overlay near the bottom of
 *    the art (used for the footer's info pill). */
export default function FooterArt({ children }: { children?: ReactNode }) {
  return (
    <div className="footer-art-wrap">
      <motion.div
        className="footer-art-frame"
        initial={{ opacity: 0, scale: 1.03 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/NEWFOOTER.png" alt="" className="footer-art-img" />
      </motion.div>

      {children && <div className="footer-art-overlay">{children}</div>}

      <style>{`
        .footer-art-wrap {
          position: relative;
          width: 100%;
        }
        .footer-art-frame {
          position: relative;
          width: 100%;
          aspect-ratio: ${FRAME_ASPECT} / 1;
          overflow: hidden;
        }
        .footer-art-img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 30%;
          image-rendering: pixelated;
        }
        .footer-art-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 40px;
          display: flex;
          justify-content: center;
          padding: 0 20px;
        }
        @media (min-width: 901px) {
          .footer-art-wrap {
            width: calc(100% + var(--side-nav-width));
            margin-left: calc(var(--side-nav-width) * -1);
          }
        }
      `}</style>
    </div>
  );
}
