"use client";

import { motion } from "framer-motion";
import Archive from "@/components/Archive";
import ExperienceFolder from "@/components/ExperienceFolder";
import ForFunTile from "@/components/ForFunTile";
import { BentoOverlayProvider } from "@/components/BentoOverlay";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function Bento() {
  return (
    <section
      id="archive"
      style={{ background: "#f4f4f5" }}
      className="px-6 md:px-10 lg:px-8 pt-[150px] md:pt-[190px] pb-[90px] md:pb-[130px]"
    >
      <BentoOverlayProvider>
        <div className="bento-outer">
          <div className="bento-grid">
            {/* Left: existing Archive component — determines the total bento height */}
            <div className="bento-cell bento-archive">
              <Archive />
            </div>

            {/* Right column: Experience (natural height) on top, dome fills the rest */}
            <div className="bento-right">
              <div className="bento-cell bento-exp">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "58px" }}>
                    Experience
                  </p>
                  <ExperienceFolder />
                </motion.div>
              </div>

              {/* Quiet, transparent DomeGallery — fills the remaining lower-right cell */}
              <div className="bento-cell bento-forfun">
                <ForFunTile />
              </div>
            </div>
          </div>
        </div>
      </BentoOverlayProvider>

      <style>{`
        .bento-outer { max-width: 1500px; margin: 0 auto; } /* matches .hero-bg-frame's width cap */

        .bento-grid {
          display: grid;
          grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
          gap: clamp(28px, 3.4vw, 52px);
          align-items: stretch;   /* right column stretches to the Archive height */
        }
        /* Each bento panel gets its own subtle, rounded card — gives every
           square a distinct identity instead of floating loosely on the page. */
        .bento-cell {
          background: #fff;
          border-radius: 28px;
        }
        .bento-archive { min-width: 0; padding: clamp(28px, 3vw, 40px) clamp(16px, 2vw, 28px) 16px; }

        .bento-right {
          min-width: 0;
          min-height: 0;
          display: grid;
          /* Experience keeps its natural height; the dome fills the remainder so
             its bottom lines up with the Archive's bottom. */
          grid-template-rows: auto minmax(0, 1fr);
          gap: clamp(28px, 3.4vw, 52px);
          align-self: stretch;
        }
        .bento-exp { min-height: 0; min-width: 0; padding: clamp(28px, 3vw, 40px) 24px; background: #FAFAF8; }
        .bento-forfun {
          min-height: 0; min-width: 0; overflow: hidden;
          background: #FAFAF8;
          /* promote to its own compositor layer so page scroll just translates
             the dome instead of repainting the 3D scene each frame */
          will-change: transform;
        }

        /* Mobile: single column, order Experience → Archive → For Fun.
           display:contents flattens the right column so Archive can sit between
           Experience and For Fun; the dome gets an explicit height. */
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr;
            gap: 64px;
          }
          .bento-right { display: contents; }
          .bento-exp { order: 1; }
          .bento-archive { order: 2; }
          .bento-forfun { order: 3; height: 380px; }
        }
      `}</style>
    </section>
  );
}
