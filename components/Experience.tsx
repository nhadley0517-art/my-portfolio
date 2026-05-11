"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const roles = [
  {
    company: "Grand Canyon Education",
    role: "Product Design Intern",
    period: "Oct 2024 – Apr 2026",
    description:
      "Led redesign of a student-facing writing platform for tens of thousands of GCU students. Conducted user research, made a structural pivot mid-project, and shipped production-ready designs.",
  },
  {
    company: "Canyon Creative",
    role: "Product Design Intern",
    period: "Dec 2025 – Apr 2026",
    description:
      "Designed web and digital products for clients across industries in an agency environment. Built design systems, worked closely with engineers, and used AI tools daily.",
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      style={{ background: "#f4f4f5" }}
      className="px-6 md:px-10 lg:px-16 py-[72px] md:py-[100px]"
    >
      <div className="max-w-5xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#9CA3AF",
            marginBottom: "40px",
          }}
        >
          Experience
        </motion.span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {roles.map((role, i) => (
            <motion.div
              key={role.company}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease }}
            >
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#9CA3AF",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}>
                {role.period}
              </p>

              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.015em",
                lineHeight: 1.2,
                marginBottom: "4px",
              }}>
                {role.company}
              </h3>

              <p style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#6B7280",
                marginBottom: "16px",
              }}>
                {role.role}
              </p>

              <p style={{
                fontSize: "15px",
                color: "#4B5563",
                lineHeight: 1.75,
              }}>
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
