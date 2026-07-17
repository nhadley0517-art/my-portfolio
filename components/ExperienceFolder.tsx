"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useBentoOverlay } from "@/components/BentoOverlay";

interface Internship {
  id: string;
  company: string;
  logo: string;
  role: string;
  dates: string;
  color: string;
  points: string[];
}

// NOTE: draft copy pulled from earlier placeholder blurbs — Noah, please correct/expand these.
const INTERNSHIPS: Internship[] = [
  {
    id: "gce",
    company: "Grand Canyon Education",
    logo: "/gce-logo.svg",
    role: "Product Design Intern",
    dates: "Oct 2024 – Apr 2026",
    color: "#6B3FA0",
    points: [
      "Designed for a student platform used by tens of thousands of learners.",
      "Led the redesign of GCU's writing resource — from a single dense page to an 8-stage guided experience.",
      "Collaborated daily with developers and PMs to ship features end-to-end, from wireframe to release.",
      "Worked within GCU's UI and accessibility standards across every deliverable.",
    ],
  },
  {
    id: "canyon-creative",
    company: "Canyon Creative",
    logo: "/canyon-creative-logo.svg",
    role: "Product Design Intern",
    dates: "Dec 2025 – Apr 2026",
    color: "#003A6C",
    points: [
      "Designed web and product experiences at a student-run agency serving national clients, operating with high ownership across a small, fast-moving team from brief through shipped deliverable.",
      "Collaborated closely with project managers, social media, graphic design, and motion graphics teams to bring work from concept to delivery.",
      "Built and maintained design systems used across a growing set of projects.",
      "Worked directly with clients to turn loose briefs into shipped interfaces.",
    ],
  },
];

const FOLDER_COLOR = "#4C9AF5"; // classic Mac / iOS folder blue
const spring = { type: "spring" as const, stiffness: 260, damping: 22 };

export default function ExperienceFolder() {
  const [open, setOpen] = useState(false);       // folder clicked open (papers fanned)
  const folderRef = useRef<HTMLDivElement>(null);
  const { open: openOverlay } = useBentoOverlay();

  // Click / Esc anywhere outside the fanned folder closes it back up. Reading
  // a file no longer lives here at all — it opens in the shared bento overlay,
  // which handles its own outside-click/Esc dismissal.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const readInternship = (internship: Internship) => {
    openOverlay(
      <div className="exp-card">
        <p className="exp-role" style={{ color: internship.color }}>{internship.role}</p>
        <h3 className="exp-company">{internship.company}</h3>
        <p className="exp-dates">{internship.dates}</p>
        <ul className="exp-points">
          {internship.points.map((p) => (
            <li key={p}>
              <span className="exp-dot" style={{ background: internship.color }} />
              {p}
            </li>
          ))}
        </ul>
        <p className="exp-back-hint">Click anywhere outside to go back ↩</p>
        <style>{`
          .exp-card { text-align: left; padding: 32px 32px 24px; max-width: 560px; width: 100%; }
          .exp-role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px; }
          .exp-company { font-size: 23px; font-weight: 500; color: #13181B; letter-spacing: -0.02em; margin: 0 0 4px; }
          .exp-dates { font-size: 13px; color: #9CA3AF; margin: 0 0 22px; }
          .exp-points { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 13px; }
          .exp-points li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #4B5563; line-height: 1.6; }
          .exp-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
          .exp-back-hint { font-size: 12px; color: #C4C4C4; margin: 0; text-align: left; padding-top: 12px; border-top: 1px solid #F1F0ED; }
        `}</style>
      </div>,
      "card",
      `experience-${internship.id}`
    );
  };

  return (
    <div className="exp-wrap">
      <motion.div
        ref={folderRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        className="folder-stage"
      >
        <div
          className={"folder" + (open ? " open" : "")}
          style={{ ["--folder-color" as string]: FOLDER_COLOR }}
          onClick={() => { if (!open) setOpen(true); }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !open) { e.preventDefault(); setOpen(true); }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label="Open experience folder"
        >
          {/* iOS-style notification badge — nudges people to open it */}
          {!open && (
            <span className="folder-badge" aria-hidden>
              <span className="folder-badge-pulse" />
              2
            </span>
          )}
          <div className="folder__back">
            {INTERNSHIPS.map((i, idx) => (
              <button
                key={i.id}
                className={`paper paper-${idx + 1}`}
                onClick={(e) => { e.stopPropagation(); if (open) readInternship(i); }}
                tabIndex={open ? 0 : -1}
                aria-hidden={!open}
                aria-label={`Read ${i.company}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="paper-logo" src={i.logo} alt={i.company} />
              </button>
            ))}
            <div className="folder__front" />
            <div className="folder__front right" />
          </div>
        </div>
      </motion.div>

      <style>{`
        .exp-wrap {
          display: flex; align-items: flex-start; justify-content: center;
          min-height: 0; padding: 0;
        }
        .folder-stage { display: flex; flex-direction: column; align-items: center; }

        /* ── Folder (React Bits structure, enlarged) ── */
        .folder {
          position: relative;
          --paper-1: #ffffff;
          --paper-2: #ffffff;
          transition: transform 0.25s ease-in;
          cursor: pointer; outline: none;
        }
        .folder:focus-visible { outline: 2px solid ${FOLDER_COLOR}; outline-offset: 10px; border-radius: 16px; }

        /* Notification badge */
        .folder-badge {
          position: absolute; top: -10px; right: -10px; z-index: 10;
          width: 22px; height: 22px; border-radius: 50%;
          background: #FF3B30; color: #fff;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(255,59,48,0.4), 0 0 0 3px #f4f4f5;
        }
        .folder-badge-pulse {
          position: absolute; inset: 0; border-radius: 50%;
          background: #FF3B30; z-index: -1;
          animation: badge-pulse 1.8s ease-out infinite;
        }
        @keyframes badge-pulse {
          0%   { transform: scale(1); opacity: 0.7; }
          70%  { transform: scale(2.1); opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }

        .folder__back {
          position: relative; width: 334px; height: 259px;
          background: color-mix(in srgb, var(--folder-color) 80%, #000 20%);
          border-radius: 0 22px 22px 22px;
        }
        .folder__back::after {
          position: absolute; z-index: 0; bottom: 98%; left: 0; content: "";
          width: 116px; height: 26px;
          background: color-mix(in srgb, var(--folder-color) 80%, #000 20%);
          border-radius: 13px 13px 0 0;
        }
        .paper {
          position: absolute; z-index: 2; bottom: 10%; left: 50%;
          transform: translate(-50%, 10%);
          width: 70%; height: 80%;
          background: var(--paper-1);
          border: none; border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          transition: transform 0.36s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease;
          cursor: default; pointer-events: none;
          display: flex; align-items: center; justify-content: center; padding: 18px;
        }
        .paper-2 { background: var(--paper-2); width: 80%; height: 70%; }
        .paper-logo {
          /* Absolute px (not % of paper) so each logo renders at a fixed size
             regardless of which differently-sized paper it sits on. */
          width: auto; object-fit: contain;
          opacity: 0; transition: opacity 0.2s ease 0.12s;
        }
        .paper-1 .paper-logo { height: 41px; max-width: 161px; }
        .paper-2 .paper-logo { height: 69px; max-width: 186px; }

        /* Hover (closed): papers peek up, flap skews */
        .folder:not(.open):hover { transform: translateY(-12px); }
        .folder:not(.open):hover .paper { transform: translate(-50%, -8%); }
        .folder:not(.open):hover .folder__front { transform: skew(15deg) scaleY(0.6); }
        .folder:not(.open):hover .right { transform: skew(-15deg) scaleY(0.6); }

        /* Open (clicked): papers fan out and become readable/clickable */
        .folder.open { transform: translateY(-12px); }
        .folder.open .paper { pointer-events: auto; cursor: pointer; z-index: 4; }
        .folder.open .paper-logo { opacity: 1; }
        .folder.open .paper-1 { transform: translate(-120%, -78%) rotateZ(-16deg); }
        .folder.open .paper-2 { transform: translate(20%, -78%) rotateZ(16deg); height: 80%; }
        .folder.open .paper-1:hover { transform: translate(-120%, -90%) rotateZ(-16deg) scale(1.05); box-shadow: 0 18px 34px rgba(0,0,0,0.20); }
        .folder.open .paper-2:hover { transform: translate(20%, -90%) rotateZ(16deg) scale(1.05); box-shadow: 0 18px 34px rgba(0,0,0,0.20); }
        .folder.open .folder__front { transform: skew(15deg) scaleY(0.6); }
        .folder.open .right { transform: skew(-15deg) scaleY(0.6); }

        .folder__front {
          position: absolute; z-index: 3; width: 100%; height: 100%;
          background: var(--folder-color);
          border-radius: 8px 18px 18px 18px;
          transform-origin: bottom;
          transition: transform 0.3s ease-in-out;
        }

        /* Mobile: the fanned papers ran off-screen. Bring them closer together,
           tilt less, and scale them down so they stay within the viewport.
           (Desktop open state is untouched.) */
        @media (max-width: 640px) {
          .folder.open .paper-1 { transform: translate(-82%, -66%) rotateZ(-8deg) scale(0.8); }
          .folder.open .paper-2 { transform: translate(-18%, -66%) rotateZ(8deg) scale(0.8); }
          .folder.open .paper-1:hover { transform: translate(-82%, -73%) rotateZ(-8deg) scale(0.84); }
          .folder.open .paper-2:hover { transform: translate(-18%, -73%) rotateZ(8deg) scale(0.84); }
        }

        @media (prefers-reduced-motion: reduce) {
          .folder, .paper, .folder__front { transition: none; }
          .folder-badge-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
