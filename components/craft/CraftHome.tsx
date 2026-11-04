"use client";

import { useEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useBentoOverlay } from "@/components/BentoOverlay";
import { MORPH_TRANSITION, morphLayoutId } from "@/components/MorphHero";
import { PhoneSceneSlot, SharedPhoneSceneHost } from "@/components/PhoneScene";
import LoopHero from "@/components/LoopHero";
import Footer from "@/components/Footer";
import { SideNav } from "@/components/hadley/side-nav";
import { SegmentedControl } from "@/components/hadley/segmented-control";
import { CharacterDemo, ProfileDemo, SearchDemo } from "@/components/craft/demos";
import { DitherReveal, PosterDeck, reducedMotion } from "@/components/craft/dither";
import ForestBanner from "@/components/craft/ForestBanner";

const EMAIL = "nhadley0517@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/noah-hadley/";
const X_URL = "https://x.com/NoahUXUI";
const HADLEY_DEV = "https://hadley.dev";
const STILL_DEMO = "/tvos%20demo.mp4";

/** Pops of color, turned up. Each project owns one, used for its hover. */
const C = {
  green: "#00B85C",
  blue: "#1F6BFF",
  orange: "#FF5A1F",
  pink: "#FF2E93",
  yellow: "#FFB800",
  purple: "#7A45FF",
};

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const NAV = [
  { label: "About", id: "about", icon: <Icon d="M8 7.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 14.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" /> },
  { label: "Work", id: "work", icon: <Icon d="M2.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" /> },
  { label: "Experience", id: "experience", icon: <Icon d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5" /> },
];

type View = "work" | "play";
const VIEWS: { value: View; label: string }[] = [
  { value: "work", label: "Selected work" },
  { value: "play", label: "Playground" },
];
/** The hero's top edge, which the side nav lines up with above the fold. */
const HERO_TOP = 112;
const NAV_TOP = 24;

type Item = { title: string; line: string; color: string; thumb: string; video?: boolean; slug?: string; href?: string };
type Role = { company: string; color: string; role: string; dates: string; blurb?: string; work?: Item[]; soon?: boolean };

/** Oldest first, so scrolling down the line is moving forward in time. */
const ROLES: Role[] = [
  {
    company: "Grand Canyon Education",
    color: C.purple,
    role: "Product Design Intern",
    dates: "Oct 2024 – Apr 2026",
    blurb: "Designed for a student platform used by tens of thousands of learners.",
    work: [{ slug: "writing-process", title: "Writing Process", line: "A wall of text, rebuilt as an 8-stage guided tool", thumb: "/wp_thumb.png", color: C.purple }],
  },
  {
    company: "Canyon Creative",
    color: C.orange,
    role: "Product Design Intern",
    dates: "Dec 2025 – Apr 2026",
    blurb: "A student-run agency serving national clients.",
    work: [
      { slug: "miah-families", title: "Miah Families", line: "A branded, donation-ready home for an Oregon nonprofit", thumb: "/miah-hero.png", color: C.orange },
      { slug: "actively-ai", title: "Actively AI", line: "Solution pages for an AI revenue platform's launch", thumb: "/actively-hero.png", color: C.pink },
    ],
  },
  {
    company: "Independent",
    color: C.blue,
    role: "Designing and building my own work",
    dates: "",
    work: [
      { slug: "no2", title: "No. 2", line: "An iOS app I designed and shipped solo in two weeks", thumb: "/no2-thumb.jpg", color: C.yellow },
      { href: HADLEY_DEV, title: "hadley.dev", line: "My library of micro-interactions, installed through the shadcn CLI", thumb: "/craft/cover.jpg", color: C.blue },
      { slug: "sales-dashboard", title: "Driveway Auto Spa", line: "A sales dashboard a detailing business runs on", thumb: "/dwautospademo.mp4", video: true, color: C.pink },
      { slug: "cove", title: "Cove", line: "A field service CRM, as founding designer", thumb: "/dashboard-demo.mp4", video: true, color: C.green },
      { slug: "real", title: "Real", line: "A redesign I hand-coded and cold-messaged to the founder", thumb: "/real-thumb.jpg", color: C.orange },
      { slug: "univo", title: "Univo", line: "Medical records in plain language", thumb: "/univo_thumb.png", color: C.purple },
    ],
  },
  {
    company: "H&R Block",
    color: C.green,
    role: "Product Designer",
    dates: "Now",
    blurb: "A collection of smaller projects and what I do there.",
    soon: true,
  },
];

const colorVar = (color: string) => ({ "--c": color }) as CSSProperties;

/** One piece of work. `span` is out of six columns. */
function Tile({ span, title, meta, color, children }: { span: 2 | 3 | 4 | 6; title: string; meta: string; color: string; children: ReactNode }) {
  return (
    <figure className={`c-tile c-span-${span}`} style={colorVar(color)}>
      <div className="c-tile-body">
        <DitherReveal>{children}</DitherReveal>
      </div>
      <figcaption>
        <span className="c-chip">{title}</span> {meta}
      </figcaption>
    </figure>
  );
}

/** A case study: the product work, so it gets the room and says what it
 *  was and what came of it, and the media opens the full story. */
function CaseTile({ slug, title, kind, line, color, onOpen, register, children }: { slug: string; title: string; kind: string; line: string; color: string; onOpen: (slug: string) => void; register: (slug: string, el: HTMLDivElement | null) => void; children: ReactNode }) {
  return (
    <article className="c-tile c-case-tile c-span-3" style={colorVar(color)}>
      <div className="c-tile-body">
        <DitherReveal>
          <CaseThumb slug={slug} title={title} onOpen={onOpen} register={register}>
            {children}
          </CaseThumb>
        </DitherReveal>
      </div>
      <button type="button" className="c-case-copy" onClick={() => onOpen(slug)}>
        <span className="c-case-head">
          <span className="c-chip">{title}</span>
          <span className="c-kind">{kind}</span>
        </span>
        <span className="c-case-line">{line}</span>
        <span className="c-read">Read the case study <span aria-hidden>→</span></span>
      </button>
    </article>
  );
}

/** A case study thumbnail. Shares a layoutId with the case study's landing
 *  pad, so the media flies into the overlay. */
function CaseThumb({ slug, title, onOpen, register, children }: { slug: string; title: string; onOpen: (slug: string) => void; register: (slug: string, el: HTMLDivElement | null) => void; children: ReactNode }) {
  return (
    <button type="button" className="c-case" onClick={() => onOpen(slug)} aria-label={`Open ${title}`}>
      <motion.div
        ref={(el) => register(slug, el)}
        layoutId={morphLayoutId(slug)}
        transition={MORPH_TRANSITION}
        className="c-case-media"
        data-sw-thumb={slug}
        style={{ borderRadius: 6 }}
      >
        {children}
      </motion.div>
    </button>
  );
}

const SOCIAL = [
  { label: "X", href: X_URL, path: "M9.47 6.77 15.3 0h-1.38L8.85 5.88 4.8 0H.13l6.12 8.9L.13 16h1.38l5.35-6.22L11.14 16h4.67L9.47 6.77Zm-1.9 2.2-.62-.88L2.01 1.04h2.13l3.98 5.69.62.88 5.17 7.4h-2.13L7.57 8.97Z" },
  { label: "LinkedIn", href: LINKEDIN, path: "M13.63 13.63h-2.37V9.92c0-.89-.02-2.03-1.24-2.03-1.24 0-1.43.97-1.43 1.97v3.77H6.22V6h2.28v1.04h.03c.32-.6 1.09-1.24 2.25-1.24 2.4 0 2.85 1.58 2.85 3.64v4.19ZM3.54 4.96a1.37 1.37 0 1 1 0-2.75 1.37 1.37 0 0 1 0 2.75Zm1.19 8.67H2.36V6h2.37v7.63ZM14.82 0H1.18C.53 0 0 .52 0 1.15v13.7C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.15V1.15C16 .52 15.47 0 14.82 0Z" },
  { label: "Email", href: `mailto:${EMAIL}`, path: "M1.5 2.5h13A1.5 1.5 0 0 1 16 4v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12V4a1.5 1.5 0 0 1 1.5-1.5Zm.4 1.6L8 8.3l6.1-4.2H1.9Z" },
];

/** The experience line draws itself as you scroll. Each role lights up, dot
 *  first, then its color, the moment the line reaches it. */
function Timeline({ onOpen }: { onOpen: (slug: string) => void }) {
  const list = useRef<HTMLOListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [lit, setLit] = useState(0);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 72%", "end 72%"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const el = list.current;
    if (!el) return;
    const h = el.offsetHeight;
    setLit(items.current.filter((li) => li && li.offsetTop / h <= p + 0.001).length);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reducedMotion()) setLit(ROLES.length);
  }, []);

  return (
    <ol ref={list} className="c-timeline">
      <motion.span className="c-line" style={{ scaleY: scrollYProgress }} aria-hidden />
      {ROLES.map((r, i) => {
        const on = i < lit;
        return (
          <li key={r.company} ref={(el) => { items.current[i] = el; }} className={on ? "is-on" : ""} style={colorVar(r.color)}>
            <motion.span
              className="c-dot"
              animate={on ? { scale: [0.4, 1.5, 1], backgroundColor: r.color } : { scale: 0.6, backgroundColor: "#CFD1D6" }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            />
            <div className="c-role">
              <h3>{r.company}</h3>
              {r.dates && <time>{r.dates}</time>}
            </div>
            <div className="c-role-body">
              <p className="c-role-title">{r.role}</p>
              {r.blurb && <p className="c-blurb">{r.blurb}</p>}
              {r.soon && (
                <div className="c-soon" aria-hidden>
                  <i /><i /><i />
                </div>
              )}
              {r.work && (
                <div className="c-items">
                  {r.work.map((w) => {
                    const inner = (
                      <>
                        <span className="c-item-thumb">
                          {w.video ? (
                            <video src={`${w.thumb}#t=1`} muted playsInline preload="metadata" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={w.thumb} alt="" />
                          )}
                        </span>
                        <span className="c-item-text">
                          <strong>{w.title}</strong>
                          {w.line}
                        </span>
                      </>
                    );
                    return w.href ? (
                      <a key={w.title} className="c-item" href={w.href} target="_blank" rel="noopener noreferrer" style={colorVar(w.color)}>
                        {inner}
                      </a>
                    ) : (
                      <button key={w.title} type="button" className="c-item" onClick={() => onOpen(w.slug!)} style={colorVar(w.color)}>
                        {inner}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function CraftHome() {
  const { openSlug } = useBentoOverlay();
  const [section, setSection] = useState("about");
  const [view, setView] = useState<View>("work");
  const nav = useRef<HTMLDivElement>(null);
  const [, bumpLaunch] = useReducer((n: number) => n + 1, 0);
  const thumbs = useRef(new Map<string, HTMLDivElement>());

  const register = (slug: string, el: HTMLDivElement | null) => {
    if (el) thumbs.current.set(slug, el);
    else thumbs.current.delete(slug);
  };

  const openProject = (slug: string) => {
    // Only fly a thumbnail that's on screen; one scrolled away would come in
    // from off the edge. The re-render is what makes Framer snapshot it.
    const r = thumbs.current.get(slug)?.getBoundingClientRect();
    const visible = !!r && r.bottom > 0 && r.top < window.innerHeight;
    bumpLaunch();
    openSlug(slug, { morph: visible });
  };

  // Above the fold the nav's top edge sits level with the hero; as the page
  // scrolls it rides up with it, then holds in the corner.
  useEffect(() => {
    const place = () => {
      if (nav.current) nav.current.style.top = `${Math.max(NAV_TOP, HERO_TOP - window.scrollY)}px`;
      // One source of truth for the active section: the last one whose top
      // has passed 40% down the screen, or About at the very top. (A section
      // observer used to fight this and could report Work late at the top.)
      const line = window.innerHeight * 0.4;
      let current = "about";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (n.id !== "about" && el && el.getBoundingClientRect().top <= line) current = n.id;
      }
      if (window.scrollY < 8) current = "about";
      setSection(current);
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, []);

  // A link straight to the playground (#playground) opens on it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash === "#playground") setView("play");
  }, []);

  const showView = (next: View) => {
    setView(next);
    history.replaceState(null, "", next === "play" ? "#playground" : window.location.pathname + window.location.search);
  };

  const active = NAV.find((n) => n.id === section)!.label;

  // The nav only moves around the page; which view of the work is showing
  // is the pill's job alone.
  const go = (label: string) => {
    const id = NAV.find((n) => n.label === label)!.id;
    if (id === "about") window.scrollTo({ top: 0, behavior: "smooth" });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="craft">
      <div ref={nav} className="c-nav" style={{ top: HERO_TOP }}>
        <SideNav title="Noah Hadley" items={NAV} active={active} onNavigate={go} radius={12} />
      </div>
      <nav className="c-bar" aria-label="Sections">
        <strong>Noah Hadley</strong>
        <span>
          {NAV.map((n) => (
            <button key={n.label} type="button" onClick={() => go(n.label)}>
              {n.label}
            </button>
          ))}
        </span>
      </nav>

      <main className="c-main">
        <header id="about" className="c-intro">
          <h1>
            Hi, I&apos;m Noah
            <span>a product designer in Reno, NV</span>
          </h1>
          <p>
            I&apos;m a designer at <span className="c-hl" style={colorVar(C.green)}>H&amp;R Block</span>. I care about how things feel to use, not just how they look, and I design end to end across web and mobile.
          </p>
          <p>
            Outside of work I build what I design.{" "}
            <button type="button" className="c-hl" style={colorVar(C.yellow)} onClick={() => openProject("no2")}>No. 2</button> is an iOS app I designed and shipped solo, and{" "}
            <a className="c-hl" style={colorVar(C.blue)} href={HADLEY_DEV} target="_blank" rel="noopener noreferrer">hadley.dev</a> is my library of micro-interactions, a few of which you can play with below.
          </p>
          <div className="c-social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} target={s.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d={s.path} fillRule="evenodd" />
                </svg>
              </a>
            ))}
          </div>
        </header>

        <div className="c-band">
          <ForestBanner />
        </div>

        {/* One place for the work, two ways to look at it: the case studies
            someone hiring would open, and the playground of things made for
            their own sake. Switching swaps the grid in place, so the
            playground is one click away instead of a long scroll down. */}
        <section id="work" className="c-section is-first" aria-label="Work">
          <div className="c-head">
            <div className={`c-switch is-${view}`}>
              <SegmentedControl options={VIEWS} value={view} onValueChange={showView} radius={10} />
            </div>
            <p>{view === "work" ? "Case studies" : "Interfaces, components, and experiments, made because I wanted to"}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {view === "work" ? (
                <div className="c-grid">
                  <CaseTile slug="no2" title="No. 2" kind="iOS app · 2026" line="A gut-health app I designed and shipped solo in two weeks, live on the App Store." color={C.yellow} onOpen={openProject} register={register}>
                    <SharedPhoneSceneHost />
                    <PhoneSceneSlot />
                  </CaseTile>
                  <CaseTile slug="sales-dashboard" title="Driveway Auto Spa" kind="Sales dashboard · Live" line="Designed, built, and shipped solo in three days. A real detailing business runs on it today." color={C.pink} onOpen={openProject} register={register}>
                    <video src="/dwautospademo.mp4" autoPlay muted loop playsInline />
                  </CaseTile>
                  <CaseTile slug="cove" title="Cove" kind="Field service CRM · 2026" line="Founding designer on the CRM a field service business runs its whole day on." color={C.green} onOpen={openProject} register={register}>
                    <video src="/dashboard-demo.mp4" autoPlay muted loop playsInline />
                  </CaseTile>
                  <article className="c-tile c-case-tile c-span-3 is-soon" style={colorVar(C.green)}>
                    <div className="c-tile-body c-soon-media">
                      <span>H&amp;R Block</span>
                    </div>
                    <div className="c-case-copy">
                      <span className="c-case-head">
                        <span className="c-chip">H&amp;R Block</span>
                        <span className="c-kind">Coming soon</span>
                      </span>
                      <span className="c-case-line">A collection of work from my role as a product designer.</span>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="c-grid">
                  <Tile span={4} title="Still" meta="Concept TV interface" color={C.orange}>
                    <div className="c-still">
                      <video src={STILL_DEMO} autoPlay muted loop playsInline poster="/craft/still-1.jpg" />
                    </div>
                  </Tile>
                  <Tile span={2} title="Search Bar" meta="hadley.dev" color={C.blue}>
                    <div className="c-plinth"><SearchDemo /></div>
                  </Tile>
                  <Tile span={4} title="Profile Card" meta="hadley.dev, drag the edge" color={C.purple}>
                    <div className="c-plinth is-wide"><div className="c-shrink"><ProfileDemo /></div></div>
                  </Tile>
                  <Tile span={2} title="Posters" meta="Made outside any brief" color={C.yellow}>
                    <div className="c-plinth is-deck"><PosterDeck /></div>
                  </Tile>
                  <Tile span={2} title="Character Limit" meta="hadley.dev, 40 characters" color={C.orange}>
                    <div className="c-plinth"><CharacterDemo /></div>
                  </Tile>
                  <Tile span={4} title="Loop" meta="Pixel art that plays as music, try it" color={C.pink}>
                    <div className="c-plinth is-loop"><LoopHero /></div>
                  </Tile>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <section id="experience" className="c-section">
          <div className="c-head">
            <h2>Experience</h2>
          </div>
          <Timeline onOpen={openProject} />
        </section>
      </main>
      <Footer />

      <style>{`
        .craft {
          --ink: #13181B;
          --muted: #6B7280;
          --faint: #A8ABB2;
          --hair: rgba(19,24,27,0.08);
          min-height: 100vh;
          background: #f4f4f5;
          color: var(--ink);
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 400;
        }
        .c-nav { position: fixed; left: 24px; z-index: 50; }
        .c-bar { display: none; }
        /* Centered on the page itself, with the same clearance on both sides
           as the nav takes on the left. */
        .c-main {
          width: min(1080px, 100% - 560px);
          margin: 0 auto;
          padding: 112px 0 120px;
        }

        .c-intro { max-width: 560px; font-size: 16px; line-height: 1.6; color: var(--muted); }
        .c-intro h1 { margin: 0 0 20px; font: inherit; color: var(--ink); }
        .c-intro h1 span { display: block; color: var(--faint); }
        .c-intro p { margin: 0 0 16px; }
        /* A colored word that turns into a solid label on hover. */
        .c-hl {
          font: inherit;
          color: var(--c);
          padding: 0 3px;
          margin: 0 -3px;
          border: 0;
          border-radius: 3px;
          background: transparent;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.18s ease, color 0.18s ease;
        }
        span.c-hl { cursor: default; }
        .c-hl:hover { background: var(--c); color: #fff; }
        .c-social { display: flex; gap: 14px; margin-top: 20px; }
        .c-social a { display: grid; place-items: center; width: 28px; height: 28px; margin: -6px; color: #3F454B; transition: color 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .c-social a:hover { color: var(--ink); transform: translateY(-2px); }
        .c-social svg { width: 16px; height: 16px; fill: currentColor; }
        .c-band { margin: 72px 0 0; }

        .c-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 36px 16px;
        }
        .c-tile { margin: 0; min-width: 0; display: flex; flex-direction: column; }
        .c-span-2 { grid-column: span 2; }
        .c-span-3 { grid-column: span 3; }
        .c-span-4 { grid-column: span 4; }
        .c-span-6 { grid-column: span 6; }
        .c-tile-body {
          outline: 2px solid transparent;
          outline-offset: 0;
          flex: 1;
          min-height: 0;
          border-radius: 6px;
          overflow: hidden;
          transition: outline-color 0.2s ease, outline-offset 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        /* A crisp ring in the project's color, set off from the edge, not
           a glow: it says "this one" without blurring the work. */
        .c-tile:hover .c-tile-body {
          transform: translateY(-2px);
          outline-color: var(--c);
          outline-offset: 4px;
        }
        .c-tile figcaption { margin-top: 12px; font-size: 13px; color: var(--faint); }
        .c-chip {
          display: inline-block;
          padding: 1px 6px;
          margin-left: -6px;
          border-radius: 3px;
          color: var(--ink);
          transition: background-color 0.18s ease, color 0.18s ease;
        }
        .c-tile:hover .c-chip { background: var(--c); color: #fff; }

        .c-case { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; }
        .c-case-media { width: 100%; height: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: #E9E9EC; }
        .c-case-media > video { display: block; width: 100%; height: 100%; object-fit: cover; }

        .c-still { height: 100%; aspect-ratio: 16 / 9; background: #000; }
        .c-still video { display: block; width: 100%; height: 100%; object-fit: cover; }

        .c-plinth {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 280px;
          padding: 20px;
          background: #EBEBED;
        }
        .c-plinth.is-wide { min-height: 400px; overflow: hidden; }
        /* The card's desktop layout is wider than this tile, so it runs a
           little smaller here instead of clipping. */
        .c-shrink { width: 100%; transform: scale(0.84); }
        .c-plinth.is-loop { display: block; min-height: 0; }
        .c-plinth.is-deck { padding: 0; }

        .c-deck { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 380px; }
        .c-deck canvas { flex: 1; min-height: 0; width: 100%; }
        .c-deck-picks {
          display: flex;
          justify-content: center;
          padding: 4px 0 10px;
          gap: 2px;
          font-family: var(--font-geist-mono), monospace;
          font-size: 11px;
        }
        .c-deck-picks button { padding: 4px 5px; border: 0; border-radius: 3px; background: none; color: var(--faint); cursor: pointer; }
        .c-deck-picks button:hover { color: var(--ink); }
        .c-deck-picks button.is-on { background: ${C.yellow}; color: var(--ink); }

        .c-section { margin-top: 112px; scroll-margin-top: 32px; }
        .c-section.is-first { margin-top: 128px; }
        .c-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 0 0 24px; }
        .c-head h2 { margin: 0; font-size: 16px; font-weight: 400; color: var(--ink); }
        /* The selected half of the switch takes its view's color. */
        .c-switch [role="radio"] > span:first-child:not(:last-child) { transition: background-color 0.25s ease; }
        .c-switch.is-work [role="radio"] > span:first-child:not(:last-child) { background: ${C.blue}; }
        .c-switch.is-play [role="radio"] > span:first-child:not(:last-child) { background: ${C.pink}; }
        .c-switch [role="radio"][aria-checked="true"] { color: #fff; }

        /* While the profile card is being stretched, nothing on the page can
           be selected, so a fast drag never paints text or images blue. */
        html.is-stretching, html.is-stretching * {
          -webkit-user-select: none !important;
          user-select: none !important;
          cursor: ew-resize !important;
        }
        .c-head p { margin: 0; font-size: 13px; color: var(--faint); text-align: right; }

        .c-case-copy {
          display: grid;
          gap: 4px;
          margin-top: 14px;
          padding: 0;
          border: 0;
          background: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        div.c-case-copy { cursor: default; }
        .c-case-head { display: flex; align-items: baseline; gap: 10px; font-size: 15px; }
        .c-case-head .c-chip { font-weight: 500; }
        .c-kind { font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: var(--faint); }
        .c-case-line { font-size: 14px; line-height: 1.55; color: var(--muted); max-width: 46ch; }
        .c-read {
          margin-top: 4px;
          font-size: 13px;
          color: var(--c);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .c-case-tile:hover .c-read { opacity: 1; transform: none; }
        .c-case-tile:hover .c-chip { background: var(--c); color: #fff; }
        .c-soon-media {
          display: grid;
          place-items: center;
          aspect-ratio: 16 / 9;
          flex: none;
          border: 1px dashed rgba(19,24,27,0.18);
          font-size: 13px;
          color: var(--faint);
        }
        .is-soon:hover .c-tile-body { outline-color: transparent; transform: none; }
        .is-soon:hover .c-chip { background: none; color: var(--ink); }

        .c-timeline { position: relative; list-style: none; margin: 0; padding: 0 0 0 28px; max-width: 680px; }
        .c-timeline::before, .c-line {
          content: "";
          position: absolute;
          left: 3.5px;
          top: 8px;
          bottom: 0;
          width: 1px;
        }
        .c-timeline::before { background: var(--hair); }
        .c-line { display: block; background: #4B5157; transform-origin: top; }
        .c-timeline li { position: relative; padding-bottom: 56px; }
        .c-timeline li:last-child { padding-bottom: 0; }
        .c-dot {
          position: absolute;
          left: -28px;
          top: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #f4f4f5;
        }
        .c-role { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
        .c-role h3 { margin: 0; font-size: 16px; font-weight: 500; color: var(--faint); transition: color 0.4s ease; }
        .c-timeline li.is-on h3 { color: var(--c); }
        .c-role time { font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: var(--faint); white-space: nowrap; }
        .c-role-body { opacity: 0.35; transform: translateY(6px); transition: opacity 0.5s ease 0.08s, transform 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s; }
        .c-timeline li.is-on .c-role-body { opacity: 1; transform: none; }
        .c-role-title { margin: 2px 0 0; font-size: 14px; color: var(--ink); }
        .c-blurb { margin: 6px 0 0; font-size: 14px; line-height: 1.55; color: var(--muted); }
        .c-soon { display: flex; gap: 8px; margin-top: 14px; }
        .c-soon i { width: 84px; height: 56px; border: 1px dashed rgba(19,24,27,0.18); border-radius: 4px; }
        .c-items { display: grid; gap: 4px; margin-top: 12px; }
        .c-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin: 0 -8px;
          padding: 8px;
          border: 0;
          border-radius: 6px;
          background: none;
          font: inherit;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .c-item:hover { background: color-mix(in srgb, var(--c) 10%, transparent); }
        .c-item-thumb { flex: none; width: 84px; height: 56px; border-radius: 4px; overflow: hidden; background: #E9E9EC; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease; }
        .c-item:hover .c-item-thumb { transform: rotate(-2deg) scale(1.06); box-shadow: 0 0 0 2px var(--c); }
        .c-item-thumb img, .c-item-thumb video { display: block; width: 100%; height: 100%; object-fit: cover; }
        .c-item-text { font-size: 13px; line-height: 1.45; color: var(--muted); }
        .c-item-text strong { display: block; font-weight: 500; color: var(--ink); transition: color 0.2s ease; }
        .c-item:hover .c-item-text strong { color: var(--c); }

        @media (max-width: 1240px) {
          .c-main { width: auto; margin: 0 40px 0 288px; }
        }
        @media (max-width: 1180px) {
          .c-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .c-span-2, .c-span-3 { grid-column: span 1; }
          .c-span-4, .c-span-6 { grid-column: span 2; }
        }
        @media (max-width: 900px) {
          .c-nav { display: none; }
          .c-bar {
            position: sticky;
            top: 0;
            z-index: 50;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 10px 24px;
            background: rgba(244,244,245,0.92);
            font-size: 14px;
          }
          .c-bar strong { font-weight: 500; white-space: nowrap; }
          .c-bar span { display: flex; gap: 14px; }
          .c-bar button { padding: 8px 0; border: 0; background: none; font: inherit; font-size: 13px; color: var(--muted); cursor: pointer; }
          .c-main { margin: 0; padding: 48px 24px 72px; }
        }
        @media (max-width: 640px) {
          .c-grid { grid-template-columns: minmax(0, 1fr); }
          .c-span-2, .c-span-3, .c-span-4, .c-span-6 { grid-column: span 1; }
          .c-plinth.is-wide { min-height: 420px; }
          .c-shrink { transform: none; }
          .c-section { margin-top: 80px; }
          .c-section.is-first { margin-top: 72px; }
          .c-band { margin-top: 48px; }
        }
        @media (hover: none) {
          .c-tile:hover .c-tile-body { transform: none; outline-color: transparent; }
          .c-read { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .c-role-body, .c-tile-body, .c-item-thumb { transition: none; }
        }
      `}</style>
    </div>
  );
}
