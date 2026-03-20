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
        style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}
      >
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#FD8973",
        }}>
          About
        </span>

        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            color: "#13181B",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
          className="about-heading"
        >
          Designing things.<br />Building things.<br />New grad.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.75 }}>
            I&apos;m Noah, a product and UX designer finishing my B.A. in Digital
            Design at Grand Canyon University in April 2026. I intern at Canyon
            Creative and Grand Canyon Education, where I get to work on real
            design problems with real constraints.
          </p>
          <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.75 }}>
            I care about the details. The spacing, the copy, the interaction.
            Good design is the kind you don&apos;t notice because it just works.
            That&apos;s what I&apos;m always working toward.
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
