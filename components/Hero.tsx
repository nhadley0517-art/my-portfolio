"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

function fadeUp(delay: number, opts?: { y?: number }) {
  return {
    initial: { opacity: 0, y: opts?.y ?? 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease },
  };
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center px-6 pt-[72px]"
      style={{ background: "#F7F5F0" }}
    >
      <div className="max-w-6xl mx-auto w-full py-16 md:py-0">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">

          {/* ── Left column (55%) ── */}
          <div className="flex flex-col md:basis-[55%] md:shrink-0 gap-0">

            <motion.span
              {...fadeUp(0.1, { y: 10 })}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#FD8973",
                display: "block",
                marginBottom: "16px",
              }}
            >
              Product Designer &amp; Builder
            </motion.span>

            <motion.h1
              {...fadeUp(0.2)}
              className="hero-name"
              style={{
                fontSize: "clamp(56px, 8vw, 96px)",
                fontWeight: 800,
                color: "#13181B",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                marginBottom: "16px",
              }}
            >
              Noah Hadley
            </motion.h1>

            <motion.p
              {...fadeUp(0.35)}
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 400,
                color: "#6B7280",
              }}
            >
              New grad. Designer who builds.
            </motion.p>

            <motion.p
              {...fadeUp(0.5)}
              style={{
                fontSize: "16px",
                color: "#4B5563",
                maxWidth: "480px",
                lineHeight: 1.7,
                marginTop: "24px",
              }}
            >
              I design products that feel good to use, then I build them.
              Finishing my degree at GCU, interning at Canyon Creative, and
              shipping apps solo.
            </motion.p>

            {/* Contact links instead of buttons */}
            <motion.div
              {...fadeUp(0.65)}
              style={{ display: "flex", gap: "12px", marginTop: "40px", flexWrap: "wrap" }}
            >
              {/* Outlined — matches Contact's derived outlined style */}
              <motion.a
                href="mailto:nhadley0517@gmail.com"
                whileHover={{ boxShadow: "0 0 0 3px rgba(253,137,115,0.3), 0 8px 24px rgba(253,137,115,0.2)", y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "transparent", color: "#13181B", fontWeight: 600, fontSize: "15px",
                  padding: "16px 32px", borderRadius: "8px", textDecoration: "none",
                  border: "1.5px solid rgba(19,24,27,0.2)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FD8973" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                nhadley0517@gmail.com
              </motion.a>

              {/* Filled — exact Contact filled button style */}
              <motion.a
                href="https://www.linkedin.com/in/noah-hadley/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ boxShadow: "0 0 0 3px rgba(253,137,115,0.3), 0 8px 24px rgba(253,137,115,0.2)", y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "#FD8973", color: "#fff", fontWeight: 600, fontSize: "15px",
                  padding: "16px 32px", borderRadius: "8px", textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </motion.a>
            </motion.div>
          </div>

          {/* ── Right column (45%) — headshot ── */}
          <div className="md:basis-[45%] md:shrink-0 flex justify-center md:justify-end w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              style={{ y: imgY }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noahheadshot.jpg"
                alt="Noah Hadley"
                style={{
                  width: "100%",
                  maxWidth: "440px",
                  height: "560px",
                  objectFit: "cover",
                  objectPosition: "top",
                  borderRadius: "16px",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
                  display: "block",
                  transform: "rotate(1.5deg)",
                }}
                className="hero-headshot"
              />
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .hero-headshot {
            transform: none !important;
            height: 300px !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
