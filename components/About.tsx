"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const SMALL_PHOTOS = ["/aboutme-3.jpeg", "/aboutme-4.jpeg"];

export default function About() {
  return (
    <section
      id="about"
      style={{ background: "#f4f4f5" }}
      className="px-6 md:px-10 lg:px-16 py-[72px] md:py-[100px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="max-w-5xl mx-auto"
      >
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          display: "block",
          marginBottom: "20px",
        }}>
          About
        </span>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "28px",
          }}
        >
          Designing products that feel good to use.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
          <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.75 }}>
            I start with the problem. Before I open Figma, I want to understand what is actually broken and why. Good design to me is when something works so well that nobody notices it. That is the bar I hold myself to. I go wide too — design, research, a bit of code, whatever it takes to get there.
          </p>
          <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.75 }}>
            Outside of design I am usually at the gym, spending time outdoors, or bothering my dogs. Finishing my degree at GCU in April and looking for a product design role where the work is real and the problems are worth solving.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {SMALL_PHOTOS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="about-photo"
              style={{
                width: "100%",
                height: "240px",
                objectFit: "cover",
                objectPosition: "center 30%",
                borderRadius: "10px",
                display: "block",
              }}
            />
          ))}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 767px) {
          .about-photo { height: 180px !important; }
        }
      `}</style>
    </section>
  );
}
