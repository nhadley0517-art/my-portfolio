"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Thumbnail nodes ──────────────────────────────────────────────────────────

const WpThumbnail = (
  <div className="project-thumb-wrap project-thumb-wrap--wp" style={{ height: "280px", overflow: "hidden", position: "relative" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/wp_thumb.png"
      alt="Writing Process Redesign"
      className="project-thumb-img"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
    />
  </div>
);

const No2Thumbnail = (
  <div className="project-thumb-wrap" style={{ height: "280px", overflow: "hidden", pointerEvents: "none" }}>
    <iframe
      src="/no2-thumb.html"
      scrolling="no"
      style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
    />
  </div>
);

const RelayThumbnail = (
  <div className="project-thumb-wrap project-thumb-wrap--relay" style={{ height: "280px", overflow: "hidden", position: "relative" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/relay_thumb.png"
      alt="Relay"
      className="project-thumb-img"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
    />
  </div>
);

const UnivoThumbnail = (
  <div className="project-thumb-wrap" style={{ height: "280px", overflow: "hidden", position: "relative" }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/univo_thumb.png"
      alt="Univo"
      className="project-thumb-img"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
    />
  </div>
);

// ── Project data ─────────────────────────────────────────────────────────────

const projects = [
  {
    slug: "/writingprocess",
    thumbnailNode: WpThumbnail,
    title: "Writing Process Redesign",
    year: "2026",
    tags: ["UX Design", "Internship"],
    description: "Redesigned GCU's student writing resource into a guided, step-by-step experience.",
  },
  {
    slug: "/no2",
    thumbnailNode: No2Thumbnail,
    title: "No. 2",
    year: "2026",
    tags: ["iOS Development", "Branding", "Solo Build"],
    description: "A gut health tracking app built solo in two weeks: design, code, backend, and brand.",
  },
  {
    slug: "/univo",
    thumbnailNode: UnivoThumbnail,
    title: "Univo",
    year: "2025",
    tags: ["UX Design", "Mobile", "Student Project"],
    description: "Medical records translated into plain-language summaries patients can actually understand.",
  },
  {
    slug: "/relay",
    thumbnailNode: RelayThumbnail,
    title: "Relay",
    year: "2025",
    tags: ["UX Design", "Dashboard", "Student Project"],
    description: "Mission coordination dashboard for field teams in disaster zones with no connectivity.",
  },
];

// ── Card ─────────────────────────────────────────────────────────────────────

function ProjectCard({
  slug,
  thumbnailNode,
  title,
  year,
  tags,
  description,
  index,
}: typeof projects[0] & { index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      onClick={() => router.push(slug)}
      style={{
        background: "#1E2428",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
      }}
      className="group project-card"
    >
      {/* Thumbnail */}
      <div className="project-card-thumb">
        {thumbnailNode}
      </div>

      {/* Content */}
      <div className="project-card-content" style={{ padding: "24px" }}>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "11px",
                fontWeight: 500,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title + year */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{title}</h3>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{year}</span>
        </div>

        {/* Description */}
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

export default function Projects() {
  return (
    <section
      id="work"
      // inline style keeps only background — padding handled by Tailwind so mobile overrides work
      style={{ background: "#13181B" }}
      className="md:px-20 px-6 py-[60px] md:py-[120px]"
    >
      <div className="max-w-6xl mx-auto">
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
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "16px",
          }}
        >
          Case Studies
        </motion.span>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease }}
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-0.025em",
            marginBottom: "56px",
          }}
        >
          Selected Work
        </motion.h2>

        {/* md:2-col grid — 1 col on mobile */}
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} {...project} index={index} />
          ))}
        </div>
      </div>

      <style>{`
        /* Desktop hover scale on thumbnail images */
        .group:hover .project-thumb-img {
          transform: scale(1.05);
        }

        /* ── Mobile-only overrides (below 768px) ── */
        @media (max-width: 767px) {
          /* Thumbnail: drop fixed height, use aspect-ratio instead */
          .project-thumb-wrap {
            height: auto !important;
            aspect-ratio: 4 / 3;
          }
          /* Writing Process and Relay cards get a wider crop on mobile */
          .project-thumb-wrap--wp,
          .project-thumb-wrap--relay {
            aspect-ratio: 16 / 9;
          }
          /* Thumbnail images and iframes fill the aspect-ratio container */
          .project-thumb-wrap img,
          .project-thumb-wrap iframe {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          /* Card content padding */
          .project-card-content {
            padding: 20px !important;
          }
          /* Breathing room between stacked cards */
          .project-card {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </section>
  );
}
