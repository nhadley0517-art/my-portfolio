"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SoundToggle from "@/components/SoundToggle";

const SECTIONS = [
  { id: "welcome", label: "Welcome" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "sandbox", label: "Sandbox" },
];

/** Fixed index of the page. Tracks which section you're in as you scroll.
 *  Below the layout breakpoint this collapses into a hamburger — the old
 *  frosted horizontal bar packed all 4 links in edge to edge, which read as
 *  cramped and dated; a menu keeps the bar itself minimal. */
export default function SideNav() {
  const [active, setActive] = useState("welcome");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Scroll-position based rather than IntersectionObserver-ratio based:
    // the hero section is `position: sticky` and stays fully visible for
    // its whole (long) pinned scroll range, so ratio-based detection never
    // hands off to the next section. Comparing each section's top edge to a
    // fixed line is immune to that — it just tracks which section you've
    // most recently scrolled past.
    const THRESHOLD = 160;
    const measure = () => {
      const positions = SECTIONS.map((s) => ({
        id: s.id,
        top: document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity,
      }));
      const passed = positions.filter((p) => p.top <= THRESHOLD);
      let current = passed.length
        ? passed.reduce((a, b) => (b.top > a.top ? b : a))
        : positions[0];
      // Near the bottom of the page, the last section's own top edge may
      // never be able to cross THRESHOLD if there isn't enough scroll room
      // left below it — without this, the final section (e.g. Sandbox)
      // could never register as active, and clicking it from further up
      // would appear to land on the section just above instead.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = positions[positions.length - 1];
      setActive(current.id);
    };

    // rAF-throttled: a fast scroll (especially the programmatic smooth-scroll
    // from clicking a nav item) fires far more scroll events than there are
    // frames to paint, and each one that lands mid-flight retargets the
    // pill's animation. Capping this to once per frame means the pill
    // retargets at most once per frame too, instead of stuttering through
    // every intermediate section it happens to scroll past.
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
  }, []);

  const scrollTo = (id: string) => {
    // Set directly instead of waiting for the scroll-spy — browsers
    // coalesce/throttle 'scroll' events during a smooth animated scroll, and
    // the last one to fire can land short of a long jump's real target,
    // which is what read as the pill landing one section above whatever was
    // actually clicked. We already know which section the user meant.
    setActive(id);
    // Scroll BEFORE closing the sheet, not after — closing it first
    // unmounts the sheet mid-click and can shift the page's layout (and
    // therefore the target's position) out from under scrollIntoView
    // before it's had a chance to act on it.
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <>
      <nav className="side-nav" aria-label="Sections">
        <Link href="/" className="side-nav-mark" aria-label="Noah Hadley, home" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={26} />
        </Link>

        <ul className="side-nav-list">
          {SECTIONS.map((s) => (
            <li key={s.id} className="side-nav-item">
              {/* One shared element — when `active` moves to a different
                  item, Framer tracks the layoutId across the position swap
                  and physically animates between the two spots (and widths)
                  instead of each item independently fading its own marker
                  in and out. A spring, not a fixed-duration tween — a tween
                  restarts from scratch (and visibly stalls) if it gets
                  retargeted again before finishing, which a fast scroll
                  through several sections does constantly. A spring carries
                  its current velocity into the new target instead. */}
              {active === s.id && (
                <motion.span
                  layoutId="side-nav-pill"
                  className="side-nav-pill"
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.9 }}
                />
              )}
              <button
                type="button"
                onClick={() => scrollTo(s.id)}
                className={"side-nav-link" + (active === s.id ? " is-active" : "")}
                aria-current={active === s.id ? "true" : undefined}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="side-nav-bottom">
          <a href="mailto:nhadley0517@gmail.com" className="side-nav-contact">
            nhadley0517@gmail.com
          </a>
          <SoundToggle />
        </div>

        {/* Mobile only — hidden on desktop via CSS. */}
        <button
          type="button"
          className="side-nav-burger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {open && (
        <div className="side-nav-sheet" role="menu">
          {SECTIONS.map((s) => (
            <div key={s.id} className="side-nav-sheet-item">
              {/* Same shared sliding pill as the desktop sidebar and the
                  case-study mobile menu — one element Framer physically
                  animates between items via layoutId. */}
              {active === s.id && (
                <motion.span
                  layoutId="side-nav-sheet-pill"
                  className="side-nav-sheet-pill"
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.9 }}
                />
              )}
              <button
                type="button"
                className={"side-nav-sheet-link" + (active === s.id ? " is-active" : "")}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            </div>
          ))}
          <div className="side-nav-sheet-divider" />
          <a
            href="mailto:nhadley0517@gmail.com"
            className="side-nav-sheet-link"
            onClick={() => setOpen(false)}
          >
            nhadley0517@gmail.com
          </a>
          <div className="side-nav-sheet-sound">
            <SoundToggle />
          </div>
        </div>
      )}

      {open && <div className="side-nav-scrim" onClick={() => setOpen(false)} aria-hidden />}

      <style>{`
        .side-nav {
          /* Sticky (not fixed) within the .page-row flex row — it pins to
             the viewport top while scrolling through main's content, but
             can never render past the bottom of its own flex row, so it
             naturally stops before the Footer instead of overlapping it. */
          position: sticky;
          top: 0;
          align-self: flex-start;
          flex-shrink: 0;
          z-index: 60;
          width: var(--side-nav-width);
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 38px 0 34px 40px;
          pointer-events: none;
        }
        .side-nav > * { pointer-events: auto; }
        .side-nav-mark { display: block; width: fit-content; margin-bottom: 46px; }
        .side-nav-mark img { display: block; border-radius: 4px; }

        .side-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
          width: fit-content;
        }
        .side-nav-item {
          position: relative;
          width: fit-content;
        }
        /* The shared pill sits behind the label, sized to the item's own
           footprint (not the list's fit-content width) via .side-nav-item
           being sized to its own button rather than stretching. */
        .side-nav-pill {
          position: absolute;
          inset: -3px -8px;
          background: rgba(19,24,27,0.07);
          border-radius: 4px;
        }
        .side-nav-link {
          position: relative;
          display: block;
          padding: 4px 0;
          border: none;
          background: none;
          font: inherit;
          font-size: 13.5px;
          font-weight: 400;
          color: #A8ABB2;
          cursor: pointer;
          transition: color 0.22s ease;
        }
        .side-nav-link:hover { color: #4B5563; }
        .side-nav-link.is-active { color: #13181B; }

        .side-nav-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .side-nav-contact {
          font-size: 12px;
          color: #A8ABB2;
          text-decoration: none;
          transition: color 0.22s ease;
          width: fit-content;
        }
        .side-nav-contact:hover { color: #13181B; }

        .side-nav-burger {
          display: none;
          background: none;
          border: none;
          padding: 15px 12px;
          margin: -15px -12px;
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          justify-content: center;
        }
        .side-nav-burger span {
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
        .side-nav-burger[aria-expanded="true"] span:first-child { transform: translateY(6px) rotate(45deg); }
        .side-nav-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
        .side-nav-burger[aria-expanded="true"] span:last-child { transform: translateY(-6px) rotate(-45deg); }

        .side-nav-scrim {
          position: fixed;
          inset: 0;
          z-index: 59;
          background: rgba(19,24,27,0.18);
        }
        .side-nav-sheet {
          display: none;
        }

        /* Below the layout breakpoint the nav becomes a slim bar — solid,
           4px radius, matching the site's corner-radius convention. No
           blur: a frosted bar reads as a generic OS chrome trick, not part
           of this site's own visual language. */
        @media (max-width: 900px) {
          .side-nav {
            position: sticky;
            /* top (not margin-top) is what sticky actually measures its
               stuck offset against — a margin-top here reads correctly at
               rest but collapses away the instant the bar is actually
               pinned mid-scroll, so the gap only holds using top. */
            top: 12px;
            /* .page-row stretches its column children full-width by
               default — align-self overrides just this one child so the
               auto-width bar centers itself instead of hugging the left
               edge, without touching how .site-main sizes itself. */
            align-self: center;
            width: auto;
            height: auto;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 0 12px 12px;
            padding: 13px 18px;
            background: #fff;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .side-nav-mark { margin-bottom: 0; }
          .side-nav-list { display: none; }
          .side-nav-bottom { display: none; }
          .side-nav-burger { display: flex; }

          .side-nav-sheet {
            position: fixed;
            top: 78px;
            right: 12px;
            left: 12px;
            z-index: 61;
            display: flex;
            flex-direction: column;
            background: #fff;
            border-radius: 4px;
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0 20px 50px -12px rgba(0,0,0,0.25);
            padding: 8px;
          }
          .side-nav-sheet-link {
            position: relative;
            display: block;
            width: 100%;
            text-align: left;
            background: none;
            border: none;
            font: inherit;
            font-size: 14px;
            font-weight: 400;
            color: #6B7280;
            text-decoration: none;
            padding: 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.12s ease, color 0.12s ease;
          }
          .side-nav-sheet-link:hover { background: rgba(0,0,0,0.035); }
          .side-nav-sheet-link.is-active { color: #13181B; font-weight: 500; }
          /* fit-content, not the sheet's full width — matches the desktop
             sidebar's pill, which only ever wraps the label itself. */
          .side-nav-sheet-item { position: relative; width: fit-content; }
          .side-nav-sheet-item .side-nav-sheet-link { width: auto; }
          .side-nav-sheet-pill {
            position: absolute;
            inset: 2px 4px;
            background: rgba(19,24,27,0.07);
            border-radius: 4px;
          }
          .side-nav-sheet-divider {
            height: 1px;
            background: #F1F0ED;
            margin: 4px 8px;
          }
          .side-nav-sheet-sound { padding: 6px 12px 4px; }
        }
      `}</style>
    </>
  );
}
