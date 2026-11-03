"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useBentoOverlay } from "@/components/BentoOverlay";
import { MORPH_TRANSITION, morphLayoutId } from "@/components/MorphHero";
import { PhoneSceneSlot, SharedPhoneSceneHost } from "@/components/PhoneScene";
import LoopHero from "@/components/LoopHero";
import ForFunTile from "@/components/ForFunTile";
import { SideNav } from "@/components/hadley/side-nav";
import { HoldToConfirm } from "@/components/hadley/hold-to-confirm";
import { CharacterDemo, SearchDemo } from "@/components/craft/demos";
import { DitherBand, DitherReveal } from "@/components/craft/dither";

const EMAIL = "nhadley0517@gmail.com";
const STILL_FRAMES = ["/craft/still-1.jpg", "/craft/still-3.jpg"];

const COLOR = {
  green: "#3AA97F",
  blue: "#3A9AD0",
  orange: "#DF5D3D",
  gold: "#D9A531",
  purple: "#9168D6",
};

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const NAV = [
  { label: "Work", id: "work", icon: <Icon d="M2.5 4.5a1 1 0 0 1 1-1h3l1.5 1.5h4.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1z" /> },
  { label: "Play", id: "play", icon: <Icon d="M10.5 2.5l3 3L6 13H3v-3zM9 4l3 3" /> },
  { label: "Experience", id: "experience", icon: <Icon d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5" /> },
  { label: "Email", id: "", icon: <Icon d="M2.5 9h3l1 2h3l1-2h3M2.5 9l1.5-5.5h8L13.5 9v4h-11z" /> },
];

type Role = {
  company: string;
  color: string;
  role: string;
  dates: string;
  blurb?: string;
  work?: { slug: string; title: string; line: string; thumb: string }[];
  placeholder?: boolean;
};

const ROLES: Role[] = [
  {
    company: "H&R Block",
    color: COLOR.green,
    role: "Product Designer",
    dates: "Now",
    blurb: "A collection of smaller projects and what I do there.",
    placeholder: true,
  },
  {
    company: "Grand Canyon Education",
    color: COLOR.purple,
    role: "Product Design Intern",
    dates: "2024 – 2026",
    blurb: "Designed for a student platform used by tens of thousands of learners.",
    work: [{ slug: "writing-process", title: "Writing Process", line: "A wall of text, rebuilt as an 8-stage guided tool", thumb: "/wp_thumb.png" }],
  },
  {
    company: "Canyon Creative",
    color: COLOR.orange,
    role: "Product Design Intern",
    dates: "2025 – 2026",
    blurb: "A student-run agency serving national clients.",
    work: [
      { slug: "miah-families", title: "Miah Families", line: "A branded, donation-ready home for an Oregon nonprofit", thumb: "/miah-hero.png" },
      { slug: "actively-ai", title: "Actively AI", line: "Solution pages for an AI revenue platform's launch", thumb: "/actively-hero.png" },
    ],
  },
  {
    company: "Independent",
    color: COLOR.blue,
    role: "Self-directed",
    dates: "",
    work: [
      { slug: "real", title: "Real", line: "A redesign I hand-coded and cold-messaged to the founder", thumb: "/real-thumb.jpg" },
      { slug: "univo", title: "Univo", line: "Medical records in plain language", thumb: "/univo_thumb.png" },
    ],
  },
];

/** One piece of work. `span` is out of six columns. */
function Tile({ span, title, meta, tall, children }: { span: 2 | 3 | 4 | 6; title: string; meta: string; tall?: boolean; children: ReactNode }) {
  return (
    <figure className={`c-tile c-span-${span}${tall ? " is-tall" : ""}`}>
      <div className="c-tile-body">
        <DitherReveal>{children}</DitherReveal>
      </div>
      <figcaption>
        <span>{title}</span> {meta}
      </figcaption>
    </figure>
  );
}

/** A case study thumbnail. Shares a layoutId with the case study's landing
 *  pad, so the media flies into the overlay exactly as on the old grid. */
function CaseThumb({ slug, onOpen, register, children }: { slug: string; onOpen: (slug: string) => void; register: (slug: string, el: HTMLDivElement | null) => void; children: ReactNode }) {
  return (
    <button type="button" className="c-case" onClick={() => onOpen(slug)} aria-label={`Open ${slug}`}>
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

/** Still is built for a TV, so its tile holds two real captures of the
 *  interface and slowly trades between them. */
function StillTile() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % STILL_FRAMES.length), 4200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="c-still">
      {STILL_FRAMES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={i === 0 ? "Still, a concept TV interface: the home screen" : ""} style={{ opacity: i === frame ? 1 : 0 }} />
      ))}
    </div>
  );
}

export default function CraftHome() {
  const { openSlug } = useBentoOverlay();
  const [active, setActive] = useState("Work");
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

  useEffect(() => {
    const sections = NAV.filter((n) => n.id).map((n) => document.getElementById(n.id)!);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(NAV.find((n) => n.id === e.target.id)!.label);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const go = (label: string) => {
    const item = NAV.find((n) => n.label === label)!;
    if (item.id) document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = `mailto:${EMAIL}`;
  };

  return (
    <div className="craft">
      <div className="c-nav">
        <SideNav title="Noah Hadley" items={NAV} active={active} onNavigate={go} stroke />
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
        <header className="c-intro">
          <h1>
            Hi, I&apos;m Noah
            <span>a product designer in Reno, NV</span>
          </h1>
          <p>
            I design at <b style={{ color: COLOR.green }}>H&amp;R Block</b>, and I care most about how things feel in the hand: the timing, the weight, the small decisions nobody asks for.
          </p>
          <p>
            On my own time I make things like <button type="button" className="c-word" style={{ color: COLOR.gold }} onClick={() => openProject("no2")}>No. 2</button>, an iOS app I shipped solo, <a href="#play" style={{ color: COLOR.orange }}>Still</a>, a TV interface with no ads, and{" "}
            <a href="https://hadley.dev" target="_blank" rel="noopener noreferrer" style={{ color: COLOR.blue }}>hadley.dev</a>, a library of micro-interactions.
          </p>
        </header>

        <div className="c-band">
          <DitherBand />
        </div>

        <section id="work" className="c-grid" aria-label="Work">
          <Tile span={4} title="Still" meta="Concept TV interface">
            <StillTile />
          </Tile>
          <Tile span={2} title="Search Bar" meta="hadley.dev">
            <div className="c-plinth"><SearchDemo /></div>
          </Tile>
          <Tile span={3} title="No. 2" meta="iOS app, shipped solo">
            <CaseThumb slug="no2" onOpen={openProject} register={register}>
              <SharedPhoneSceneHost />
              <PhoneSceneSlot />
            </CaseThumb>
          </Tile>
          <Tile span={3} title="Driveway Auto Spa" meta="Sales dashboard, in daily use">
            <CaseThumb slug="sales-dashboard" onOpen={openProject} register={register}>
              <video src="/dwautospademo.mp4" autoPlay muted loop playsInline />
            </CaseThumb>
          </Tile>
          <Tile span={2} title="Character Limit" meta="hadley.dev">
            <div className="c-plinth"><CharacterDemo /></div>
          </Tile>
          <Tile span={4} title="Cove" meta="Field service CRM, founding designer">
            <CaseThumb slug="cove" onOpen={openProject} register={register}>
              <video src="/dashboard-demo.mp4" autoPlay muted loop playsInline />
            </CaseThumb>
          </Tile>
        </section>

        <section id="play" className="c-section">
          <h2>Play</h2>
          <div className="c-grid">
            <Tile span={4} title="Loop" meta="Pixel art that plays as music, try it">
              <div className="c-plinth is-loop"><LoopHero /></div>
            </Tile>
            <Tile span={2} title="Hold to Confirm" meta="hadley.dev, press and hold">
              <div className="c-plinth"><HoldToConfirm resetAfter={1800} stroke /></div>
            </Tile>
            <Tile span={6} tall title="Posters" meta="Made outside any brief, drag to spin">
              <ForFunTile />
            </Tile>
          </div>
        </section>

        <section id="experience" className="c-section">
          <h2>Experience</h2>
          <ol className="c-timeline">
            {ROLES.map((r) => (
              <li key={r.company}>
                <span className="c-dot" style={{ background: r.color }} />
                <div className="c-role">
                  <h3 style={{ color: r.color }}>{r.company}</h3>
                  {r.dates && <time>{r.dates}</time>}
                </div>
                <p className="c-role-title">{r.role}</p>
                {r.blurb && <p className="c-blurb">{r.blurb}</p>}
                {r.placeholder && (
                  <div className="c-soon" aria-hidden>
                    <i /><i /><i />
                  </div>
                )}
                {r.work?.map((w) => (
                  <button key={w.slug} type="button" className="c-item" onClick={() => openProject(w.slug)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.thumb} alt="" />
                    <span>
                      <strong>{w.title}</strong>
                      {w.line}
                    </span>
                  </button>
                ))}
              </li>
            ))}
          </ol>
        </section>

        <footer className="c-footer">
          Say hi at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </footer>
      </main>

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
        .c-nav { position: fixed; top: 24px; left: 24px; z-index: 50; }
        .c-bar { display: none; }
        .c-main {
          max-width: 1360px;
          margin: 0 auto;
          padding: 112px 48px 72px 288px;
        }

        .c-intro { max-width: 540px; font-size: 16px; line-height: 1.6; color: var(--muted); }
        .c-intro h1 { margin: 0 0 20px; font: inherit; color: var(--ink); }
        .c-intro h1 span { display: block; color: var(--faint); }
        .c-intro p { margin: 0 0 16px; }
        .c-intro b { font-weight: 400; }
        .c-intro a, .c-word {
          font: inherit;
          padding: 0;
          border: 0;
          background: none;
          cursor: pointer;
          text-decoration: none;
        }
        .c-intro a:hover, .c-word:hover { text-decoration: underline; text-underline-offset: 3px; }
        .c-band { margin: 32px 0 40px; }

        .c-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 32px 16px;
        }
        .c-tile { margin: 0; min-width: 0; display: flex; flex-direction: column; }
        .c-span-2 { grid-column: span 2; }
        .c-span-3 { grid-column: span 3; }
        .c-span-4 { grid-column: span 4; }
        .c-span-6 { grid-column: span 6; }
        .c-tile-body { flex: 1; min-height: 0; border-radius: 6px; overflow: hidden; }
        .c-tile.is-tall .c-tile-body { height: 520px; flex: none; }
        .c-tile figcaption {
          margin-top: 10px;
          font-size: 13px;
          color: var(--faint);
        }
        .c-tile figcaption span { color: var(--ink); }

        .c-case { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; }
        .c-case-media { width: 100%; height: 100%; min-height: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: #E9E9EC; }
        .c-case-media > video { display: block; width: 100%; height: 100%; object-fit: cover; }

        .c-still { position: relative; aspect-ratio: 16 / 9; height: 100%; width: 100%; background: #000; }
        .c-still img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 1.1s ease;
        }

        .c-plinth {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 280px;
          padding: 16px;
          background: #EBEBED;
        }
        .c-plinth.is-loop { display: block; min-height: 0; background: #EBEBED; }

        .c-section { margin-top: 96px; scroll-margin-top: 32px; }
        #work { scroll-margin-top: 32px; }
        .c-section h2 { margin: 0 0 24px; font-size: 16px; font-weight: 400; color: var(--ink); }

        .c-timeline {
          list-style: none;
          margin: 0;
          padding: 0 0 0 24px;
          max-width: 640px;
          border-left: 1px solid var(--hair);
        }
        .c-timeline li { position: relative; padding-bottom: 44px; }
        .c-timeline li:last-child { padding-bottom: 0; }
        .c-dot {
          position: absolute;
          left: -28.5px;
          top: 7px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #f4f4f5;
        }
        .c-role { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
        .c-role h3 { margin: 0; font-size: 16px; font-weight: 500; }
        .c-role time { font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: var(--faint); white-space: nowrap; }
        .c-role-title { margin: 2px 0 0; font-size: 14px; color: var(--ink); }
        .c-blurb { margin: 6px 0 0; font-size: 14px; line-height: 1.55; color: var(--muted); }
        .c-soon { display: flex; gap: 8px; margin-top: 14px; }
        .c-soon i { width: 76px; height: 52px; border: 1px dashed rgba(19,24,27,0.18); border-radius: 4px; }
        .c-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          margin-top: 12px;
          padding: 0;
          border: 0;
          background: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        .c-item img {
          flex: none;
          width: 76px;
          height: 52px;
          object-fit: cover;
          border-radius: 4px;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .c-item:hover img { transform: scale(1.05) rotate(-1.5deg); }
        .c-item span { font-size: 13px; line-height: 1.45; color: var(--muted); }
        .c-item strong { display: block; font-weight: 500; color: var(--ink); }

        .c-footer { margin-top: 96px; padding-top: 20px; border-top: 1px dashed var(--hair); font-size: 14px; color: var(--muted); }
        .c-footer a { color: var(--ink); }

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
          .c-main { padding: 48px 24px 56px; }
        }
        @media (max-width: 640px) {
          .c-bar button:nth-child(4) { display: none; }
          .c-grid { grid-template-columns: minmax(0, 1fr); }
          .c-span-2, .c-span-3, .c-span-4, .c-span-6 { grid-column: span 1; }
          .c-tile.is-tall .c-tile-body { height: 420px; }
          .c-section { margin-top: 72px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .c-still img, .c-item img { transition: none; }
        }
      `}</style>
    </div>
  );
}
