"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";

const TABS = [
  { label: "Prewriting", src: "/Prewriting.png" },
  { label: "Research",   src: "/Research.png" },
  { label: "Thesis",     src: "/Thesis.png" },
  { label: "Outlining",  src: "/Outlining.png" },
  { label: "Drafting",   src: "/Drafting.png" },
  { label: "Revising",   src: "/Revising.png" },
  { label: "Editing",    src: "/Editing.png" },
  { label: "Submission", src: "/Submission.png" },
];

export default function WritingProcessTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="wpt">
      {/* ── Tab list: a left rail on desktop, a horizontal scroll strip on
          mobile — the fixed 35/65 side-by-side split left 8 labels
          (including "Submission") cramped into a sliver of a phone screen
          with no way to widen it. */}
      <div className="wpt-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => {
              if (i !== active) sfx.select();
              setActive(i);
            }}
            className={"wpt-tab" + (i === active ? " is-active" : "")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Image display ── */}
      <div className="wpt-image">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={TABS[active].src}
            alt={`${TABS[active].label} stage mockup`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            // eslint-disable-next-line @next/next/no-img-element
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "4px",
            }}
          />
        </AnimatePresence>
      </div>

      <style>{`
        .wpt { display: flex; gap: 56px; align-items: flex-start; }
        .wpt-tabs { width: 35%; flex-shrink: 0; display: flex; flex-direction: column; }
        .wpt-image { flex: 1; position: relative; min-width: 0; }
        .wpt-tab {
          text-align: left;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 500;
          border-left: 2px solid #DDD8D1;
          color: #7D8A93;
          background: none;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }
        .wpt-tab:hover { color: #13181B; border-color: #BFBAB4; }
        .wpt-tab.is-active { color: #13181B; font-weight: 600; border-color: #FD8973; }

        @media (max-width: 700px) {
          .wpt { flex-direction: column; gap: 20px; }
          .wpt-tabs {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            gap: 4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .wpt-tabs::-webkit-scrollbar { display: none; }
          .wpt-tab {
            flex-shrink: 0;
            padding: 8px 14px;
            border-left: none;
            border-bottom: 2px solid #DDD8D1;
          }
          .wpt-tab.is-active { border-color: #FD8973; }
        }
      `}</style>
    </div>
  );
}
