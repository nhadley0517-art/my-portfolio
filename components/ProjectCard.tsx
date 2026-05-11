"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface Project {
  slug?: string;
  title: string;
  year: string;
  tags: string[];
  description: string;
  color: string;
  video?: string;
  image?: string;
  thumbnailHtml?: string;
  mobileThumbHtml?: string;
  comingSoon?: boolean;
  mediaBg?: string;
  mediaFit?: "cover" | "contain";
}

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  delay?: number;
  initialRotate?: number;
  cursorLabel?: string;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function ProjectCard({
  project,
  featured = false,
  delay = 0,
  initialRotate = 0,
  cursorLabel,
}: ProjectCardProps) {
  const { slug, title, year, tags, description, color, video, image, thumbnailHtml, mobileThumbHtml, comingSoon, mediaBg, mediaFit = "cover" } = project;
  const rgb = hexToRgb(color);
  const [hovered, setHovered] = useState(false);

  const handleHoverStart = () => {
    if (comingSoon) return;
    setHovered(true);
    document.dispatchEvent(
      new CustomEvent("cursor-enter", {
        detail: { label: cursorLabel ?? title, color },
      })
    );
  };

  const handleHoverEnd = () => {
    setHovered(false);
    document.dispatchEvent(new CustomEvent("cursor-leave"));
  };

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 36, rotate: initialRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...(!comingSoon && {
        whileHover: {
          y: -6,
          boxShadow: "0 20px 48px rgba(0,0,0,0.10)",
          transition: { duration: 0.25, ease: "easeOut" },
        },
      })}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        cursor: comingSoon ? "default" : "none",
        transition: "background 0.3s ease",
      }}
    >
      {/* Media */}
      <div
        style={{ overflow: "hidden", background: mediaBg ?? `rgba(${rgb}, 0.07)` }}
        className={featured ? "card-media--featured" : "card-media--regular"}
      >
        {thumbnailHtml ? (
          <>
            {/* Desktop: interactive iframe. Hidden on mobile via CSS. */}
            <div className="thumb-desktop">
              <iframe
                src={thumbnailHtml}
                scrolling="no"
                style={{ width: "100%", height: "100%", border: "none", display: "block", pointerEvents: "none" }}
              />
            </div>
            {/* Mobile: fluid thumbnail HTML — no fixed pixel dimensions, no zoom issue. */}
            {mobileThumbHtml && (
              <div className="thumb-mobile" style={{ background: "#111111" }}>
                <iframe
                  src={mobileThumbHtml}
                  scrolling="no"
                  style={{ width: "100%", height: "100%", border: "none", display: "block", pointerEvents: "none" }}
                />
              </div>
            )}
          </>
        ) : video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: mediaFit, display: "block" }}
          >
            <source src={video} />
          </video>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: mediaFit, display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: mediaBg ?? `rgba(${rgb}, 0.1)` }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: featured ? "28px 32px 32px" : "22px 24px 26px" }}>
        {/* Tags */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#9CA3AF",
            letterSpacing: "0.02em",
            margin: "0 0 10px",
          }}
        >
          {tags.join(" · ")}
        </p>

        {/* Title */}
        <h3
          style={{
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            margin: "0 0 8px",
          }}
          className={featured ? "card-title--featured" : "card-title--regular"}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            lineHeight: 1.65,
            margin: "0 0 20px",
          }}
        >
          {description}
        </p>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{year}</span>

          {comingSoon ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color,
              }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <rect x="1" y="5" width="8" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
                <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              In Progress
            </span>
          ) : (
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: "13px", fontWeight: 600, color }}
            >
              View case study →
            </motion.span>
          )}
        </div>
      </div>

      <style>{`
        .card-media--featured { height: 460px; }
        .card-media--regular  { height: 220px; }
        .card-title--featured { font-size: 24px; }
        .card-title--regular  { font-size: 19px; }
        .thumb-desktop { width: 100%; height: 100%; }
        .thumb-mobile  { display: none; }
        @media (max-width: 767px) {
          .card-media--featured { height: 240px; }
          .card-media--regular  { height: 180px; }
          .card-title--featured { font-size: 20px; }
          .thumb-desktop { display: none; }
          .thumb-mobile  { display: block; width: 100%; height: 100%; }
        }
      `}</style>
    </motion.div>
  );

  if (comingSoon || !slug) return inner;

  return (
    <Link href={slug} style={{ textDecoration: "none", display: "block" }}>
      {inner}
    </Link>
  );
}
