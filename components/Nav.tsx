"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavSection {
  id: string;
  label: string;
}

export default function Nav({
  sections,
  accentColor = "#FD8973",
}: {
  /** In-page sections (case studies only) — surfaced in the mobile menu so
   *  there's a way to jump around a long page without the desktop-only
   *  floating CaseStudyNav, which is hidden below 1440px. */
  sections?: NavSection[];
  accentColor?: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(sections?.[0]?.id ?? "");

  // Tracks which case-study section is currently in view, the same way
  // SideNav does for the home page — so the mobile menu can show the same
  // sliding pill behind whichever section you're actually reading, not just
  // a static list.
  useEffect(() => {
    if (!sections || sections.length === 0) return;
    const measure = () => {
      let current = sections[0].id;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 130) current = id;
      }
      setActiveId(current);
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        measure();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const goContact = () => {
    window.location.href = "mailto:nhadley0517@gmail.com";
  };

  const scrollToSection = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const offsetTop = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: offsetTop, behavior: "smooth" });
  };

  return (
    <header className="nh-nav-header">
      <div className="nh-nav-pill">
        <Link href="/" style={{ display: "flex", alignItems: "center" }} onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Noah Hadley" className="nh-nav-logo" style={{ borderRadius: "4px", display: "block" }} />
        </Link>

        <nav className="nh-nav-links">
          <Link href="/" className={"nh-nav-link" + (isHome ? " nh-nav-link--current" : "")}>Home</Link>
          <button type="button" onClick={goContact} className="nh-nav-link nh-nav-btn">Contact</button>
        </nav>

        {/* Mobile only — hidden on desktop via CSS, replaces the inline
            links above so a long section list has somewhere to live
            without cluttering the pill. */}
        <button
          type="button"
          className="nh-nav-burger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nh-nav-sheet" role="menu">
          <Link href="/" className="nh-nav-sheet-link" onClick={() => setOpen(false)}>
            Home
          </Link>

          {sections && sections.length > 0 && (
            <div className="nh-nav-sheet-sections">
              {sections.map((s) => (
                <div key={s.id} className="nh-nav-sheet-item">
                  {activeId === s.id && (
                    <motion.span
                      layoutId="nh-nav-sheet-pill"
                      className="nh-nav-sheet-pill"
                      transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.9 }}
                    />
                  )}
                  <button
                    type="button"
                    className={"nh-nav-sheet-link nh-nav-sheet-section" + (activeId === s.id ? " is-active" : "")}
                    onClick={() => scrollToSection(s.id)}
                  >
                    <span className="nh-nav-sheet-dot" style={{ background: accentColor }} />
                    {s.label}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="nh-nav-sheet-link" onClick={() => { setOpen(false); goContact(); }}>
            Contact
          </button>
        </div>
      )}

      {open && <div className="nh-nav-scrim" onClick={() => setOpen(false)} aria-hidden />}

      <style>{`
        .nh-nav-header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding-top: 18px;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }
        .nh-nav-pill {
          pointer-events: auto;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 26px;
          padding: 9px 18px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .nh-nav-logo { width: 28px; height: 28px; }
        .nh-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nh-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #9CA3AF;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .nh-nav-link--current { color: #4B5563; }
        .nh-nav-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          cursor: pointer;
        }
        .nh-nav-link:hover { color: #111827; }

        .nh-nav-burger {
          display: none;
          background: none;
          border: none;
          /* Negative margin keeps the pill's own visual footprint the same
             while the actual tap target grows to ~44px, the accepted
             minimum comfortable touch-target size. */
          padding: 18px 14px;
          margin: -18px -14px;
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
        }
        .nh-nav-burger span {
          display: block;
          width: 17px;
          /* A sub-pixel (1.5px) height straddles two physical pixel rows
             unevenly depending on the line's fractional Y position, which is
             what read as inconsistent stroke weight between the three bars —
             a whole-pixel height rasterizes the same regardless of position. */
          height: 2px;
          background: #4B5563;
          border-radius: 1px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .nh-nav-burger[aria-expanded="true"] span:first-child { transform: translateY(6px) rotate(45deg); }
        .nh-nav-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
        .nh-nav-burger[aria-expanded="true"] span:last-child { transform: translateY(-6px) rotate(-45deg); }

        .nh-nav-scrim {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(19,24,27,0.18);
          pointer-events: auto;
        }
        .nh-nav-sheet {
          pointer-events: auto;
          position: relative;
          z-index: 51;
          margin-top: 8px;
          width: min(88vw, 300px);
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 20px 50px -12px rgba(0,0,0,0.25);
          padding: 8px;
          display: flex;
          flex-direction: column;
        }
        .nh-nav-sheet-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font: inherit;
          font-size: 14px;
          font-weight: 400;
          color: #13181B;
          text-decoration: none;
          padding: 11px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.12s ease;
        }
        .nh-nav-sheet-link:hover { background: rgba(0,0,0,0.035); }
        .nh-nav-sheet-sections {
          display: flex;
          flex-direction: column;
          margin: 4px 0;
          padding: 4px 0;
          border-top: 1px solid #F1F0ED;
          border-bottom: 1px solid #F1F0ED;
        }
        /* fit-content, not the sheet's full width — matches the desktop
           sidebar's pill, which only ever wraps the label itself. */
        .nh-nav-sheet-item { position: relative; width: fit-content; }
        .nh-nav-sheet-item .nh-nav-sheet-link { width: auto; }
        /* Same sliding pill as the home page's SideNav — one shared element
           that Framer physically animates between items via layoutId,
           instead of each row independently toggling its own highlight. */
        .nh-nav-sheet-pill {
          position: absolute;
          inset: 2px 4px;
          background: rgba(19,24,27,0.07);
          border-radius: 4px;
        }
        .nh-nav-sheet-section { font-size: 13px; color: #6B7280; }
        .nh-nav-sheet-section.is-active { color: #13181B; font-weight: 500; }
        .nh-nav-sheet-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 700px) {
          .nh-nav-links { display: none; }
          .nh-nav-burger { display: flex; }
          /* Matches the home page's mobile nav bar: centered, 4px radius
             instead of a full pill, same logo size and padding. */
          .nh-nav-header { align-items: center; padding-top: 12px; }
          /* gap:26px is tuned for the desktop Home/Contact links, which are
             hidden here — with only the logo and burger left, that gap read
             as a wider bar than the home page's matching 16px. */
          .nh-nav-pill { border-radius: 4px; padding: 13px 18px; gap: 16px; }
          .nh-nav-logo { width: 26px; height: 26px; }
        }
      `}</style>
    </header>
  );
}
