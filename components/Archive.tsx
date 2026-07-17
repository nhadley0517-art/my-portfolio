"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useBentoOverlay } from "@/components/BentoOverlay";
import ArchiveProjectPage from "@/components/ArchiveProjectPage";
import { getArchiveProject } from "@/lib/archiveProjectsData";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface ArchiveItem {
  title: string;
  tag: string;
  blurb: string;
  href: string;
  /** Opens via ArchiveProjectPage in the shared bento overlay ("card" variant). */
  slug?: string;
}

const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    title: "Driveway Auto Spa",
    tag: "Sales dashboard",
    blurb: "A CRM-connected sales dashboard giving a detailing business a live view of bookings, ad performance, and team revenue.",
    slug: "sales-dashboard",
    href: "/archive/sales-dashboard",
  },
  {
    title: "Miah Families",
    tag: "Client build",
    blurb: "Turned a bare-bones Google Site into a branded, donation-ready home for an Oregon nonprofit.",
    slug: "miah-families",
    href: "/archive/miah-families",
  },
  {
    title: "Actively AI",
    tag: "Launch sprint",
    blurb: "Designed key solution-page experiences for an AI platform helping revenue teams work every account more intelligently.",
    slug: "actively-ai",
    href: "/archive/actively-ai",
  },
  {
    title: "Real",
    tag: "Cold outreach",
    blurb: "Redesigned the UI of an app I use often, then cold-messaged the founder and landed a meeting he loved before he eventually went quiet.",
    slug: "real",
    href: "/archive/real",
  },
  {
    title: "Univo",
    tag: "Concept",
    blurb: "A concept app that translates complex medical records into plain-language summaries patients can actually understand.",
    slug: "univo",
    href: "/archive/univo",
  },
  {
    title: "Cluely: Onboarding Redesign",
    tag: "Cold outreach",
    blurb: "Redesigned Cluely's onboarding for fun, then DM'd their founder. No response yet, but I'm proud of the work, with a demo on YouTube.",
    slug: "cluely",
    href: "/archive/cluely",
  },
];

export default function Archive() {
  const { open, close } = useBentoOverlay();

  const openProject = (slug: string) => {
    const project = getArchiveProject(slug);
    if (!project) return;
    open(
      <ArchiveProjectPage project={project} variant="overlay" onClose={close} />,
      "card",
      `archive-${slug}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <p className="archive-label">Other projects</p>
      <div className="archive-list">
        {ARCHIVE_ITEMS.map((item, i) => {
          const inner = (
            <>
              <span className="archive-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="archive-body">
                <div className="archive-title-row">
                  <span className="archive-title">{item.title}</span>
                  <span className="archive-tag">{item.tag}</span>
                </div>
                <p className="archive-blurb">{item.blurb}</p>
              </div>
              <span className="archive-arrow">→</span>
            </>
          );
          if (item.slug) {
            return (
              <button key={item.title} type="button" onClick={() => openProject(item.slug!)} className="archive-card">
                {inner}
              </button>
            );
          }
          return (
            <Link key={item.title} href={item.href} className="archive-card">
              {inner}
            </Link>
          );
        })}
      </div>

      <style>{`
        /* Subtle hairlines between rows, sitting in the margin gap rather
           than touching edge-to-edge — spacing does most of the separating,
           the line is just a quiet accent. */
        .archive-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: #9CA3AF; margin: 4px 0 30px;
        }
        .archive-list { display: flex; flex-direction: column; gap: 14px; }
        .archive-card {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 28px;
          padding: 24px 20px;
          border-radius: 16px;
          background: transparent;
          text-decoration: none;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, background 0.28s ease;
          /* Button reset — a <button> renders identically to the <Link> variant */
          width: 100%;
          border: none;
          font: inherit;
          text-align: left;
          color: inherit;
          cursor: pointer;
        }
        /* A separate straight-edge divider (not the row's own border) — sits
           in the gap above each non-first row, so the rounded card corners
           never notch/curve its ends. */
        .archive-card:not(:first-child)::before {
          content: "";
          position: absolute;
          top: -7px;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(17, 24, 39, 0.07);
          transition: opacity 0.2s ease;
        }
        .archive-card:hover {
          background: #F7F7F5;
          transform: translateY(-4px);
          box-shadow: 0 18px 40px -12px rgba(0,0,0,0.14);
        }
        /* Hovering a row hides both the line above it (its own ::before) and
           the line below it (the next row's ::before), so the lifted card
           floats free of both. */
        .archive-card:hover::before,
        .archive-card:hover + .archive-card::before {
          opacity: 0;
        }
        .archive-index {
          font-size: 12px; font-weight: 600; color: #C4C4C4;
          font-variant-numeric: tabular-nums; letter-spacing: 0.04em;
        }
        .archive-body { min-width: 0; }
        .archive-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 5px; flex-wrap: wrap; }
        .archive-title { font-size: 16px; font-weight: 600; color: #111827; letter-spacing: -0.01em; }
        .archive-tag {
          font-size: 11px; font-weight: 500; color: #4B5563;
          letter-spacing: 0.01em;
          background: #F1F0ED;
          border-radius: 999px; padding: 3px 10px;
        }
        .archive-blurb { font-size: 13px; color: #6B7280; line-height: 1.6; margin: 0; max-width: 560px; }
        .archive-arrow {
          font-size: 16px; color: #C4C4C4; flex-shrink: 0;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), color 0.28s ease;
        }
        .archive-card:hover .archive-arrow { color: #FD8973; transform: translateX(4px); }
      `}</style>
    </motion.div>
  );
}
