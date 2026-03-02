"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex gap-10 md:gap-14 items-start">
      {/* ── Left: tab list (35%) ── */}
      <div className="w-[35%] shrink-0 flex flex-col">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`text-left py-3.5 px-4 text-sm transition-all duration-200 border-l-2 ${
              i === active
                ? "border-[#FD8973] text-[#13181B] font-semibold"
                : "border-[#DDD8D1] text-[#7D8A93] font-medium hover:text-[#13181B] hover:border-[#BFBAB4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Right: image display (65%) ── */}
      <div className="flex-1 relative">
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
              borderRadius: "12px",
            }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
