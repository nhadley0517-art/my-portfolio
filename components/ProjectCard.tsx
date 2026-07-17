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
  placeholderLabel?: string;
  comingSoon?: boolean;
  mediaBg?: string;
  mediaFit?: "cover" | "contain";
  mediaHeight?: number;
  /** Short status shown as a pill over the media, e.g. "Shipped", "Live". */
  status?: string;
  /** One-line proof of real-world collaboration, e.g. "Founding designer · working with founders". */
  collab?: string;
}

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  delay?: number;
  initialRotate?: number;
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
}: ProjectCardProps) {
  const { slug, title, year, description, color, video, image, thumbnailHtml, mobileThumbHtml, placeholderLabel, comingSoon, mediaBg, mediaFit = "cover", mediaHeight, status, collab } = project;
  const rgb = hexToRgb(color);
  const [hovered, setHovered] = useState(false);

  const handleHoverStart = () => {
    if (comingSoon) return;
    setHovered(true);
  };

  const handleHoverEnd = () => {
    setHovered(false);
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#FFFFFF",
        transition: "background 0.3s ease",
      }}
    >
      {/* Media */}
      <div
        style={{ position: "relative", overflow: "hidden", background: mediaBg ?? `rgba(${rgb}, 0.07)`, ...(mediaHeight && !featured ? { height: `${mediaHeight}px` } : {}) }}
        className={`${featured ? "card-media--featured" : "card-media--regular"}${mediaHeight && !featured ? " card-media--custom-height" : ""}`}
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
        ) : placeholderLabel ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: mediaBg ?? `rgba(${rgb}, 0.07)`,
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color,
                textAlign: "center",
              }}
            >
              {placeholderLabel}
            </span>
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", background: mediaBg ?? `rgba(${rgb}, 0.1)` }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: featured ? "0 0 auto" : 1, display: "flex", flexDirection: "column", padding: featured ? "28px 32px 32px" : "22px 24px 26px" }}>
        {/* Status chip — proof this is real, shipped work */}
        {status && !comingSoon && (
          <span
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 11px 4px 8px",
              borderRadius: "999px",
              background: "rgba(16,185,129,0.10)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "#047857",
              marginBottom: "12px",
            }}
          >
            <span
              className="status-dot"
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }}
            />
            {status}
          </span>
        )}

        {/* Title */}
        <h3
          style={{
            fontWeight: 500,
            color: "#111827",
            letterSpacing: "-0.02em",
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

        {/* Collaboration line — who I worked with, proof of real teams */}
        {collab && (
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#4B5563",
              lineHeight: 1.5,
              margin: "auto 0 16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{collab}</span>
          </p>
        )}

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...(collab ? {} : { marginTop: "auto" }) }}>
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
        @keyframes status-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.55); }
          50%      { box-shadow: 0 0 0 4px rgba(52,211,153,0); }
        }
        .status-dot { animation: status-pulse 2s ease-in-out infinite; }
        .card-media--featured { height: 460px; }
        .card-media--regular  { height: 220px; }
        .card-title--featured { font-size: 24px; }
        .card-title--regular  { font-size: 19px; }
        .thumb-desktop { width: 100%; height: 100%; }
        .thumb-mobile  { display: none; }
        @media (max-width: 767px) {
          .card-media--featured { height: 240px; }
          .card-media--regular  { height: 180px; }
          .card-media--custom-height { height: auto !important; aspect-ratio: 16 / 9; }
          .card-title--featured { font-size: 20px; }
          .thumb-desktop { display: none; }
          .thumb-mobile  { display: block; width: 100%; height: 100%; }
        }
      `}</style>
    </motion.div>
  );

  if (comingSoon || !slug) return inner;

  return (
    <Link href={slug} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      {inner}
    </Link>
  );
}
