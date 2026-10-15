"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
}

interface CaseStudyNavProps {
  sections: Section[];
  accentColor?: string;
  card?: boolean;
  /** Rendered inside CaseStudySidePanel, a standalone floating panel next
   *  to (not inside) the overlay's content shell — so it never scrolls
   *  itself, but still needs to track the *content* shell's own scroll
   *  position to know which section is active. Styled to match the home
   *  page's SideNav hover/active states exactly (no hover background, no
   *  bolding on active, just a color step and the sliding pill). */
  inline?: boolean;
}

export default function CaseStudyNav({ sections, accentColor, card = false, inline = false }: CaseStudyNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const accent = accentColor ?? "#FD8973";

  // In `inline` mode this panel sits beside the overlay's content shell,
  // not inside it, so there's no ancestor relationship to search via
  // `closest` — the actual scrollable element (.bento-overlay-scroll) has
  // to be found by querying the document instead. The plain page still
  // scrolls the window itself, so `card`/the default variant keep using that.
  const getScroller = (): Window | Element =>
    (inline && document.querySelector(".bento-overlay-scroll")) || window;

  useEffect(() => {
    const scroller = getScroller();
    const onScroll = () => {
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 130) current = id;
      }
      // Same bottom-of-scroll-range fix as SideNav/Nav — the last section's
      // top edge may never cross the threshold if there's no scroll room
      // left below it, which would otherwise make it permanently unreachable.
      const atBottom = scroller instanceof Element
        ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = sections[sections.length - 1]?.id ?? current;
      setActiveId(current);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, inline]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Set directly rather than waiting for the scroll-spy to catch up —
    // browsers coalesce/throttle 'scroll' events heavily during a smooth
    // animated scroll, and the last one to actually fire can land short of
    // the real target on a long jump, which is what read as "clicking the
    // 4th link down highlights the 3rd one instead." The user just told us
    // exactly which section they meant; no need to infer it from scroll
    // position at all.
    setActiveId(id);
    const scroller = getScroller();
    if (scroller instanceof Element) {
      // Target getBoundingClientRect().top directly (viewport-relative),
      // not offset from the scroll container's own top edge — the
      // scroll-spy's threshold check above also reads getBoundingClientRect
      // in viewport coordinates, and the container itself doesn't sit at
      // viewport y:0 (it's vertically centered in the overlay backdrop).
      // Subtracting the container's own top here under-scrolled by however
      // far down the page the container happened to start, which is what
      // read as "the auto-scroll doesn't go far enough" — the target's top
      // was landing well past the threshold until the visitor nudged it
      // those remaining pixels by hand.
      scroller.scrollTo({ top: scroller.scrollTop + (el.getBoundingClientRect().top - 100), behavior: "smooth" });
    } else {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  if (inline) {
    return (
      <nav
        className="flex flex-col"
        style={{ gap: "3px", width: "fit-content" }}
        aria-label="Page sections"
      >
        {sections.map(({ id, label }) => {
          const isActive = activeId === id;
          const isHovered = hoverId === id;
          return (
            <div key={id} style={{ position: "relative", width: "fit-content" }}>
              {/* Same shared sliding pill as the home page SideNav — same
                  inset too, so it hugs just the label instead of the row. */}
              {isActive && (
                <motion.span
                  layoutId="cs-nav-pill-inline"
                  style={{ position: "absolute", inset: "-3px -8px", background: "rgba(19,24,27,0.07)", borderRadius: "4px" }}
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.9 }}
                />
              )}
              <button
                onClick={() => scrollTo(id)}
                onMouseEnter={() => setHoverId(id)}
                onMouseLeave={() => setHoverId(null)}
                aria-label={`Go to ${label}`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 0",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "13.5px",
                  fontWeight: 400,
                  color: isActive ? "#13181B" : isHovered ? "#4B5563" : "#A8ABB2",
                  transition: "color 0.22s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", flexShrink: 0, background: accent }} />
                {label}
              </button>
            </div>
          );
        })}
      </nav>
    );
  }

  if (card) {
    return (
      <nav
        className="hidden min-[1440px]:flex fixed left-6 z-40 flex-col"
        style={{
          top: "120px",
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "4px",
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
            <div key={id} style={{ position: "relative" }}>
              {/* Same shared sliding pill as the mobile menu — one element
                  Framer physically animates between items via layoutId,
                  instead of each item toggling its own tinted background. */}
              {isActive && (
                <motion.span
                  layoutId="cs-nav-pill"
                  style={{ position: "absolute", inset: 0, background: "rgba(19,24,27,0.07)", borderRadius: "4px" }}
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.9 }}
                />
              )}
              <button
                onClick={() => scrollTo(id)}
                onMouseEnter={() => setHoverId(id)}
                onMouseLeave={() => setHoverId(null)}
                aria-label={`Go to ${label}`}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#13181B" : isHovered ? "#4B5563" : "#9CA3AF",
                  background: isHovered && !isActive ? "rgba(0,0,0,0.03)" : "transparent",
                  transition: "color 0.12s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: accent,
                  }}
                />
                {label}
              </button>
            </div>
          );
        })}
      </nav>
    );
  }

  // Original floating style
  return (
    <nav
      className="hidden min-[1440px]:flex fixed left-6 z-40 flex-col gap-0.5"
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
