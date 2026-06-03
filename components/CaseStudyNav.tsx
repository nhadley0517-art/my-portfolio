"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface CaseStudyNavProps {
  sections: Section[];
  accentColor?: string;
  card?: boolean;
}

export default function CaseStudyNav({ sections, accentColor, card = false }: CaseStudyNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const accent = accentColor ?? "#FD8973";

  useEffect(() => {
    const onScroll = () => {
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 130) current = id;
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offsetTop = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: offsetTop, behavior: "smooth" });
  };

  if (card) {
    return (
      <nav
        className="hidden min-[1330px]:flex fixed left-6 z-40 flex-col"
        style={{
          top: "120px",
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "14px",
          padding: "6px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          minWidth: "152px",
        }}
        aria-label="Page sections"
      >
        {sections.map(({ id, label }) => {
          const isActive = activeId === id;
          const isHovered = hoverId === id;
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              onMouseEnter={() => setHoverId(id)}
              onMouseLeave={() => setHoverId(null)}
              aria-label={`Go to ${label}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#13181B" : isHovered ? "#4B5563" : "#9CA3AF",
                background: isActive
                  ? `rgba(${hexToRgb(accent)}, 0.08)`
                  : isHovered
                  ? "rgba(0,0,0,0.03)"
                  : "transparent",
                transition: "background 0.12s ease, color 0.12s ease",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isActive ? accent : "transparent",
                  transition: "background 0.12s ease",
                }}
              />
              {label}
            </button>
          );
        })}
      </nav>
    );
  }

  // Original floating style
  return (
    <nav
      className="hidden min-[1330px]:flex fixed left-6 z-40 flex-col gap-0.5"
      style={{ top: "120px" }}
      aria-label="Page sections"
    >
      {sections.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`flex items-center pl-3 py-1.5 text-left text-[13px] whitespace-nowrap transition-colors duration-150 border-l-2 ${
              isActive
                ? "text-[#13181B] font-bold"
                : "border-transparent text-[#9CA3AF] font-normal hover:text-[#6B7280]"
            }`}
            style={isActive ? { borderColor: accent } : undefined}
            aria-label={`Go to ${label}`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
