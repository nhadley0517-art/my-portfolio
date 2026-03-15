"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function Contact() {
  return (
    <section
      id="contact"
      style={{ background: "#13181B" }}
      className="md:px-20 px-6 py-[60px] md:py-[120px]"
    >
      <div className="max-w-6xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            marginBottom: "20px",
          }}
          className="contact-heading"
        >
          Want to work together?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "48px",
          }}
        >
          Looking for full-time product design roles starting May 2026.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}
        >
          <motion.a
            href="mailto:nhadley0517@gmail.com"
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#FD8973",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              padding: "16px 32px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Say hello
          </motion.a>

          <a
            href="https://www.linkedin.com/in/noah-hadley/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
          >
            LinkedIn ↗
          </a>
        </motion.div>

      </div>
    </section>
  );
}
