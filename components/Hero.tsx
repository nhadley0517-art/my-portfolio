"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

function fadeUp(delay: number, duration = 0.7) {
  return {
    initial: { opacity: 0, y: 44 },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease },
  };
}

export default function Hero() {
  return (
    <section className="flex flex-col justify-center px-6 pt-[72px]">
      <div className="max-w-6xl mx-auto w-full pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-center">

          {/* ── Left column: avatar + name ── */}
          <div className="min-w-0">
            <div className="flex items-start gap-5">
              {/* Headshot */}
              <motion.div {...fadeUp(0.1)} className="shrink-0 mt-3 md:mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/noahheadshot.jpg"
                  alt="Noah Hadley"
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                  }}
                />
              </motion.div>

              {/* Name */}
              <div className="min-w-0">
                <motion.span
                  {...fadeUp(0.22)}
                  className="block font-extrabold text-[clamp(48px,7.5vw,104px)] leading-[0.88] tracking-[-0.03em] text-[#13181B] hero-name"
                >
                  Noah
                </motion.span>
                <motion.span
                  {...fadeUp(0.36)}
                  className="block font-extrabold italic text-[clamp(48px,7.5vw,104px)] leading-[0.88] tracking-[-0.03em] text-[#13181B] hero-name"
                >
                  Hadley
                </motion.span>
              </div>
            </div>
          </div>

          {/* ── Right column: role, tagline, badge, CTA ── */}
          <div className="flex flex-col gap-6 md:pt-4">
            <motion.p {...fadeUp(0.58, 0.6)} className="text-lg md:text-xl font-semibold text-[#2D3436] tracking-tight">
              UX/UI &amp; Product Designer
            </motion.p>

            <motion.p {...fadeUp(0.7, 0.6)} className="text-xl md:text-2xl font-medium text-[#13181B] leading-snug">
              Turning complex problems into experiences that feel effortless.
            </motion.p>

            {/* Available badge */}
            <motion.div {...fadeUp(0.82, 0.6)}>
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 20px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: "#FD8973", color: "#F0EEEB" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "white", display: "inline-block", flexShrink: 0 }} />
                  Available for full-time roles
                </span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div {...fadeUp(0.94, 0.6)}>
              <a
                href="#work"
                className="group inline-flex items-center gap-3 bg-[#13181B] text-[#F0EEEB] text-sm font-semibold px-7 py-4 rounded-full hover:bg-[#FD8973] transition-colors"
              >
                View my work
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
