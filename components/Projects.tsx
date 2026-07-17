"use client";

import { motion } from "framer-motion";
import ProjectCard, { type Project } from "@/components/ProjectCard";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const projects: Array<Project & { initialRotate: number }> = [
  {
    slug: "/no2",
    title: "No. 2",
    year: "2026",
    tags: ["iOS Development", "Branding", "Solo Build"],
    description:
      "A gut health tracking app built solo in two weeks — design, code, backend, and brand from scratch.",
    color: "#7EB77F",
    thumbnailHtml: "/no2-hero.html",
    mobileThumbHtml: "/no2-mobile-thumb.html",
    mediaBg: "#1C1C1E",
    mediaHeight: 240,
    status: "Live",
    collab: "Solo build — design, code, brand & backend",
    initialRotate: -1.5,
  },
  {
    slug: "/cove",
    title: "Cove",
    year: "2026",
    tags: ["Field Service CRM", "Founding Designer", "AI-native"],
    description:
      "A field service CRM built from zero. Scheduling, payments, client management, and embedded AI.",
    color: "#4F46E5",
    video: "/client-profile-demo.mp4",
    mediaBg: "#1E1B4B",
    mediaHeight: 290,
    status: "Shipped",
    collab: "Founding designer · working with founders",
    initialRotate: 1.2,
  },
  {
    slug: "/writingprocess",
    title: "Writing Process Redesign",
    year: "2025",
    tags: ["Product Design", "Internship"],
    description:
      "Redesigned GCU's student writing resource into a guided, step-by-step experience students actually want to use.",
    color: "#6B3FA0",
    image: "/wp_thumb.png",
    mediaHeight: 290,
    status: "Shipped",
    collab: "Internship · collaborated with devs & PMs as the designer",
    initialRotate: -1,
  },
];

export default function Projects() {
  const [feature, ...rest] = projects;

  return (
    <section
      id="work"
      style={{ background: "#f4f4f5" }}
      className="px-6 md:px-10 lg:px-16 pt-[72px] md:pt-[100px] pb-[40px]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#9CA3AF",
            marginBottom: "12px",
          }}
        >
          Case Studies
        </motion.span>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease }}
          style={{
            fontSize: "clamp(30px, 4.2vw, 50px)",
            fontWeight: 500,
            color: "#111827",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            marginBottom: "40px",
          }}
        >
          Selected Work
        </motion.h2>

        {/* Featured card */}
        <div style={{ marginBottom: "16px" }}>
          <ProjectCard
            project={feature}
            featured
            delay={0}
            initialRotate={feature.initialRotate}
          />
        </div>

        {/* Supporting cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              delay={0.15 + i * 0.15}
              initialRotate={project.initialRotate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
