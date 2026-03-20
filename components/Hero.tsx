"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

function fadeUp(delay: number, opts?: { y?: number }) {
  return {
    initial: { opacity: 0, y: opts?.y ?? 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease },
  };
}

const projects = [
  {
    num: "01",
    title: "Writing Process",
    desc: "Redesigning how students learn to write at GCU.",
    tags: ["UX Design", "Internship"],
    color: "#6B3FA0",
    thumbType: "img" as const,
    thumb: "/wp_thumb.png",
    href: "/writing-process",
  },
  {
    num: "02",
    title: "No. 2",
    desc: "A gut health tracking app, designed and built solo.",
    tags: ["iOS", "Solo Build"],
    color: "#7EB77F",
    thumbType: "iframe" as const,
    thumb: "/no2-thumb.html",
    href: "/no2",
  },
  {
    num: "03",
    title: "Univo",
    desc: "Making medical records understandable for patients.",
    tags: ["Healthcare", "Mobile"],
    color: "#4B7BE5",
    thumbType: "img" as const,
    thumb: "/univo_thumb.png",
    href: "/univo",
  },
  {
    num: "04",
    title: "Relay",
    desc: "Mission coordination for field teams in the field.",
    tags: ["Dashboard", "Emergency"],
    color: "#E53935",
    thumbType: "img" as const,
    thumb: "/relay_thumb.png",
    href: "/relay",
  },
];


function ProjectCard({ project }: { project: typeof projects[0] }) {
  return (
    <Link href={project.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        style={{
          position: "relative",
          height: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          background: project.thumb ? undefined : "#1C1C1E",
          cursor: "pointer",
        }}
      >
        {/* Thumbnail background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#F8F9FA",
            overflow: "hidden",
          }}
        >
          {project.thumbType === "iframe" ? (
            <iframe
              src={project.thumb}
              scrolling="no"
              style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumb}
              alt={project.title}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* Colored top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            borderRadius: 0,
            background: project.color,
            transition: "background-color 0.4s ease",
          }}
        />

        {/* Card content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Project number */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "8px",
            }}
          >
            {project.num}
          </span>

          {/* Title */}
          <h3
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.75)",
              margin: 0,
              marginBottom: "16px",
              lineHeight: 1.5,
            }}
          >
            {project.desc}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "#fff",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "100px",
                  padding: "4px 10px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % projects.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      ref={sectionRef}
      className="hero-section flex items-center"
      style={{ background: "#F7F5F0" }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col-reverse xl:flex-row items-center gap-12 xl:gap-20">

          {/* ── Left column (55%) ── */}
          <div className="hero-left-col flex flex-col xl:basis-[55%] xl:shrink-0 gap-0">

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
                fontSize: "84px",
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
              Designing things. Learning by doing.
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
              I&apos;m a product and UX designer who cares about how things feel
              to use, not just how they look. I&apos;m finishing my degree at GCU,
              interning at Canyon Creative and Grand Canyon Education, and
              spending the rest of my time building things I believe in.
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

          {/* ── Right column (45%) — cycling project card ── */}
          <motion.div
            className="hero-card-wrap xl:basis-[45%] xl:shrink-0 flex justify-center xl:justify-end w-full"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          >
            <div
              className="hero-card-container"
              style={{ width: "100%", height: "420px" }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease }}
                  style={{ height: "100%" }}
                >
                  <ProjectCard project={projects[index]} />
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    style={{
                      width: i === index ? "20px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background: i === index ? "#FD8973" : "rgba(19,24,27,0.2)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "width 0.3s ease, background 0.3s ease",
                    }}
                    aria-label={`Go to project ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <style>{`
        .hero-section { padding: 180px 80px; }
        @media (max-width: 1279px) {
          .hero-section { padding: 120px 80px; }
          .hero-card-container { height: 280px !important; }
          .hero-card-wrap { max-width: 600px; width: 100%; }
          .hero-left-col { max-width: 600px; width: 100%; }
        }
        @media (max-width: 767px) {
          .hero-section { padding: 100px 24px; }
          .hero-card-wrap { max-width: 100%; }
        }
      `}</style>
    </section>
  );
}
