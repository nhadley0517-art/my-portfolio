"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

interface CaseStudyNavProps {
  sections: Section[];
}

export default function CaseStudyNav({ sections }: CaseStudyNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

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

  return (
    <nav
      className="hidden lg:flex fixed left-6 z-40 flex-col gap-0.5"
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
                ? "border-[#FD8973] text-[#13181B] font-bold"
                : "border-transparent text-[#9CA3AF] font-normal hover:text-[#6B7280]"
            }`}
            aria-label={`Go to ${label}`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
