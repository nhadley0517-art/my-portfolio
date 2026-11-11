"use client";

import { useEffect, useState } from "react";
import { SideNav } from "@/components/hadley/side-nav";

interface Section {
  id: string;
  label: string;
}

interface CaseStudyNavProps {
  sections: Section[];
  /** Kept for callers; the nav is monochrome like the home page's. */
  accentColor?: string;
  /** Kept for callers; every variant is now the same side nav. */
  card?: boolean;
  /** Inside the home page's case study overlay: tracks the overlay's own
   *  scroll and sits beside it, instead of tracking the window. */
  inline?: boolean;
  /** The overlay is fullscreen, so its top edge is the viewport's. */
  fullscreen?: boolean;
}

const KEY = "cs-nav-collapsed";
/** Room the overlay gives up on each side for the nav: margin, nav, gap. */
const SPACE = { open: 24 + 216 + 16, shut: 24 + 60 + 16 };

/** A bullet stands in for each section's icon. */
const Dot = () => <span className="block size-[5px] rounded-full bg-current" aria-hidden />;

/** The home page's side nav, listing a case study's sections. Open, it shows
 *  each section as a bulleted link; collapsed, just the bullets, with each
 *  name on hover. The collapse control keeps its own icon. Pinned by CSS
 *  alone: nothing is measured, so nothing can drift. */
export default function CaseStudyNav({ sections, inline = false, fullscreen = false }: CaseStudyNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [shut, setShut] = useState(false);

  // Remembered between case studies; on a first visit, open only where
  // there's room beside the overlay for the full width.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    setShut(saved ? saved === "1" : window.innerWidth < 1600);
  }, []);

  const toggle = (next: boolean) => {
    setShut(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  };

  // The overlay reads this to leave the nav its room.
  useEffect(() => {
    if (!inline) return;
    const root = document.documentElement;
    root.style.setProperty("--cs-side", `${shut ? SPACE.shut : SPACE.open}px`);
    return () => {
      root.style.removeProperty("--cs-side");
    };
  }, [shut, inline]);

  const getScroller = (): Window | Element => (inline && document.querySelector(".bento-overlay-scroll")) || window;

  useEffect(() => {
    const scroller = getScroller();
    const onScroll = () => {
      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
      }
      const atBottom =
        scroller instanceof Element
          ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
          : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = sections[sections.length - 1]?.id ?? current;
      setActiveId(current);
    };
    // The overlay's content mounts a beat after this nav does.
    const t = setTimeout(onScroll, 300);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      clearTimeout(t);
      scroller.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, inline]);

  const go = (label: string) => {
    const id = sections.find((s) => s.label === label)?.id;
    const el = id && document.getElementById(id);
    if (!id || !el) return;
    // Set straight away: smooth scrolling throttles scroll events, and the
    // last one can land short of a long jump.
    setActiveId(id);
    const scroller = getScroller();
    if (scroller instanceof Element) scroller.scrollTo({ top: scroller.scrollTop + el.getBoundingClientRect().top - scroller.getBoundingClientRect().top, behavior: "smooth" });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" });
  };

  const items = sections.map((s) => ({ label: s.label, icon: <Dot /> }));
  const active = sections.find((s) => s.id === activeId)?.label;

  return (
    <div className={`cs-sidenav${inline ? " is-overlay" : ""}${fullscreen ? " is-fullscreen" : ""}`}>
      <SideNav title="Sections" items={items} active={active} onNavigate={go} collapsed={shut} onCollapsedChange={toggle} radius={12} />
      <style>{`
        .cs-sidenav { display: none; position: fixed; left: 24px; top: 96px; z-index: 40; }
        /* Docked 16px off the centered shell's left edge, level with its
           top: the shell is min(100vw - 2 * side, 1320px) wide, centered,
           and as tall as its scroll area allows. Anchored by its right edge,
           so collapsing folds it toward the shell. */
        .cs-sidenav.is-overlay {
          left: auto;
          right: calc(50vw + min(50vw - var(--cs-side, 100px), 660px) + 16px);
          top: calc((100vh - min(90vh, 900px)) / 2);
          z-index: 301;
          transition: right 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cs-sidenav.is-overlay.is-fullscreen { left: 24px; right: auto; top: 24px; }
        @media (min-width: 1440px) { .cs-sidenav { display: block; } }
        @media (min-width: 1024px) { .cs-sidenav.is-overlay { display: block; } }
      `}</style>
    </div>
  );
}
