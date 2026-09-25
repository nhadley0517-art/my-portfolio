"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoopHero from "./LoopHero";

const LOCATION = "Reno, NV";
const TIME_ZONE = "America/Los_Angeles";

/** Small mono status line above the bio — availability plus local time,
 *  the kind of detail that reads as "a real person is on the other end."
 *  The clock renders client-side only: the server's time and the visitor's
 *  first paint would never match, which React treats as a hydration error. */
function StatusLine() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="hero-status"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="hero-status-item">
        <span className="hero-status-dot" aria-hidden />
        Available for work
      </span>
      <span className="hero-status-item">
        {LOCATION}
        <span className="hero-status-sep" aria-hidden>·</span>
        <span className="hero-status-time">{time ?? " "}</span>
      </span>
    </motion.div>
  );
}

type BioChunk = { text: string; strong?: boolean };

// Each paragraph's last two words are joined with a non-breaking space so
// the final line never leaves a single word stranded alone.
const BIO_PARAGRAPHS: BioChunk[][] = [
  [
    { text: "Hi! I'm" },
    { text: "Noah,", strong: true },
    { text: "a" },
    { text: "product designer", strong: true },
    { text: "who graduated from Grand Canyon University in April 2026. I care about how things feel to use, not just how they look. I design end to end across web and mobile, use Claude Code and Cursor as a core part of my workflow, and recently shipped a" },
    { text: "solo iOS app", strong: true },
    { text: "built completely from scratch in two weeks." },
  ],
  [
    { text: "I previously interned at Canyon Creative, designing client-facing products in an agency environment, and at Grand Canyon Education, where I led a full platform redesign for tens of thousands of students." },
  ],
  [
    { text: "I'm actively looking for" },
    { text: "full-time product design roles,", strong: true },
    { text: "open to remote, hybrid, or relocation." },
  ],
];

const BIO_PARAGRAPHS_WORDS = BIO_PARAGRAPHS.map((chunks) =>
  chunks.flatMap((c) => c.text.split(" ").map((word) => ({ word, strong: c.strong })))
);

function HeroBio() {
  return (
    // Word-by-word reveal on load — reads as the text generating in, not
    // just fading up as one static block. One shared stagger across all
    // three paragraphs, so it plays as one continuous sequence rather than
    // three separate ones.
    <motion.div
      variants={{ visible: { transition: { staggerChildren: 0.016 } } }}
      initial="hidden"
      animate="visible"
    >
      {BIO_PARAGRAPHS_WORDS.map((words, pi) => (
        <p key={pi} className="hero-bio">
          {words.map((item, i) => (
            <span key={i} className="hero-bio-word-wrap">
              <motion.span
                className={"hero-bio-word" + (item.strong ? " is-strong" : "")}
                variants={{
                  hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.word}
              </motion.span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      ))}
    </motion.div>
  );
}

export default function Hero() {
  // Keep the page pinned to the hero on load (don't let the browser restore
  // a previous scroll position or jump to an anchor).
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <section id="welcome" className="hero-section">
      <div className="site-container hero-bio-wrap">
        <StatusLine />
        <HeroBio />
        <div className="hero-loop-wrap">
          <LoopHero />
          <p className="hero-loop-caption">
            This is a lite version of <strong>Loop</strong>, a pixel-art music sequencer I designed and built —{" "}
            <a href="https://loop-music-studio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hero-loop-link">
              see the full thing
            </a>
            .
          </p>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding-top: 108px;
          padding-bottom: clamp(56px, 7vw, 96px);
        }
        .hero-bio {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: -0.005em;
          color: #6B7280;
          max-width: 840px;
          margin: 0 0 16px;
        }
        .hero-status {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 24px;
          margin-bottom: 28px;
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 11.5px;
          letter-spacing: 0.01em;
          color: #A8ABB2;
        }
        .hero-status-item { display: inline-flex; align-items: center; gap: 8px; }
        .hero-status-dot {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }
        /* A slow ring pulsing out of the dot — the one bit of motion that
           says "live" without anything else on the line moving. */
        .hero-status-dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #16A34A;
          animation: hero-status-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes hero-status-ping {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(2.6); opacity: 0; }
        }
        .hero-status-sep { color: #D1D3D8; }
        .hero-status-time { font-variant-numeric: tabular-nums; min-width: 7ch; }
        @media (prefers-reduced-motion: reduce) {
          .hero-status-dot::after { animation: none; }
        }

        .hero-bio-word-wrap { display: inline; }
        .hero-bio-word { display: inline-block; }
        /* Key facts (name, role, standout details) pulled out of the
           body gray — same size and weight shift the site already uses
           to separate a title from surrounding copy. */
        .hero-bio-word.is-strong { color: #13181B; font-weight: 400; }

        /* Same max-width as .hero-bio, not the wider site-container it sits
           in — matches the paragraph's own column exactly rather than
           stretching edge to edge underneath it. */
        .hero-loop-wrap {
          max-width: 840px;
          margin-top: clamp(28px, 3.5vw, 40px);
        }
        .hero-loop-caption {
          font-size: 13px;
          font-weight: 300;
          color: #A8ABB2;
          margin: 12px 0 0;
        }
        .hero-loop-caption strong { font-weight: 500; color: #6B7280; }
        .hero-loop-link {
          color: #6B7280;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(107,114,128,0.35);
          transition: color 0.2s ease;
        }
        .hero-loop-link:hover { color: #13181B; }

        /* Below 900px the sidebar is a bar pinned above the hero, which
           already accounts for most of the desktop top offset. */
        @media (max-width: 900px) {
          .hero-section { padding-top: 64px; }
        }
        @media (max-width: 700px) {
          .hero-section { padding: 48px 0 56px; }
        }
      `}</style>
    </section>
  );
}
