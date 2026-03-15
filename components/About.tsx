"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const SMALL_PHOTOS = ["/aboutme-2.jpeg", "/aboutme-3.jpeg", "/aboutme-4.jpeg"];

export default function About() {
  return (
    <section
      id="about"
      style={{ background: "#F7F5F0" }}
      className="md:px-20 px-6 py-[60px] md:py-[120px]"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="flex flex-col md:flex-row gap-12 md:gap-16" style={{ alignItems: "stretch" }}>

          {/* ── Left: tall portrait ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="md:basis-[45%] md:shrink-0 w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/aboutme-1.JPG"
              alt="Noah"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "560px",
                objectFit: "cover",
                objectPosition: "top",
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
                display: "block",
              }}
              className="about-main-photo"
            />
          </motion.div>

          {/* ── Right: text + photos + email ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="md:basis-[55%] flex flex-col gap-8 justify-center"
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
                Creative and Grand Canyon Education, and I build things on the side.
              </p>
              <p style={{ fontSize: "16px", color: "#4B5563", lineHeight: 1.75 }}>
                I designed and built No. 2, a gut health app, completely solo in two
                weeks. Design, code, backend, and brand. I care about the details
                and I ship real things.
              </p>
            </div>

            {/* 3 small photos */}
            <div style={{ display: "flex", gap: "12px" }}>
              {SMALL_PHOTOS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  style={{
                    flex: 1,
                    height: "120px",
                    objectFit: "cover",
                    objectPosition: "center",
                    borderRadius: "10px",
                    display: "block",
                  }}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .about-main-photo {
            height: 300px !important;
          }
        }
      `}</style>
    </section>
  );
}
