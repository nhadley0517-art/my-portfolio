"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const SMALL_PHOTOS = ["/aboutme-3.jpeg", "/aboutme-4.jpeg"];

export default function About() {
  return (
    <section
      id="about"
      style={{ background: "#F7F5F0" }}
      className="md:px-20 px-6 py-[60px] md:py-[120px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0" }}
      >
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#FD8973",
          marginBottom: "12px",
        }}>
          About
        </span>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            color: "#13181B",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            marginBottom: "32px",
          }}
          className="about-heading"
        >
          Designing products that feel good to use.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.75 }}>
            I start with the problem. Before I open Figma, I want to understand what is actually broken and why. Good design to me is when something works so well that nobody notices it. That is the bar I hold myself to. I go wide too, design, research, a bit of code, whatever it takes to get there.
          </p>
          <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.75 }}>
            Outside of design I am usually at the gym, spending time outdoors, or bothering my dogs. I am finishing my degree at GCU in April and looking for a product design role where the work is real and the problems are worth solving.
          </p>
        </div>

        {/* 2 photos */}
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
                height: "200px",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "10px",
                display: "block",
              }}
            />
          ))}
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 767px) {
          .about-photo { height: 140px !important; }
        }
      `}</style>
    </section>
  );
}
