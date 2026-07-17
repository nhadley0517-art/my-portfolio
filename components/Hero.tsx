"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "cuelume";
import PixelArtBackground from "./PixelArtBackground";
import PixelSnow from "./PixelSnow";
import ScrambledText from "./ScrambledText";

const STATEMENT = "Designing products that\nget out of the way.";
const LINES = STATEMENT.split("\n");
const TYPE_SPEED = 40;
const TYPE_JITTER = 16;
const TYPE_DELAY = 320;
const LINE2_DELAY = 450; // after line 1 types out, before tags fade in (line 2 slides in during this)

// Apple-ish settle: soft, decelerating, never bouncy
const charEase = [0.16, 1, 0.3, 1] as const;

const TAGS = ["Product Design", "Prototyping", "Design Systems"];

type Season = "spring" | "summer" | "fall" | "winter";
const SEASONS: { id: Season; label: string; color: string }[] = [
  { id: "spring", label: "Spring", color: "#A3D977" },
  { id: "summer", label: "Summer", color: "#3FA34D" },
  { id: "fall",   label: "Fall",   color: "#E0892E" },
  { id: "winter", label: "Winter", color: "#AFCBE3" },
];
const SEASON_SRC: Record<Season, string> = {
  spring: "/pixelart-spring.webp",
  summer: "/pixelart-summer.webp",
  fall:   "/pixelart-fall.webp",
  winter: "/pixelart-winter.webp",
};

// First title line split into word/space tokens so the typewriter wraps by
// whole words (breaks only at spaces) and never splits a word mid-letter.
type Tok = { type: "word" | "space"; chars: { ch: string; idx: number }[] };
const LINE0_TOKENS: Tok[] = (() => {
  const tokens: Tok[] = [];
  let cur: Tok | null = null;
  [...LINES[0]].forEach((ch, idx) => {
    const type = ch === " " ? "space" : "word";
    if (!cur || cur.type !== type) { cur = { type, chars: [] }; tokens.push(cur); }
    cur.chars.push({ ch, idx });
  });
  return tokens;
})();

export default function Hero() {
  const [progress, setProgress]         = useState(0); // characters revealed in line 1
  const [showLine2, setShowLine2]       = useState(false);
  const [showMeta, setShowMeta]         = useState(false);
  const [season, setSeason]             = useState<Season>("summer");

  // Keep the page pinned to the hero on load (don't let the browser restore
  // a previous scroll position or jump to an anchor).
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Preload every season image so switching is instant (no fetch on click).
  useEffect(() => {
    Object.values(SEASON_SRC).forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Typewriter
  useEffect(() => {
    let idx = 0;
    let t: ReturnType<typeof setTimeout>;

    const tick = () => {
      idx++;
      setProgress(idx);
      if (idx < LINES[0].length) {
        t = setTimeout(tick, TYPE_SPEED + (Math.random() * TYPE_JITTER * 2 - TYPE_JITTER));
      } else {
        // line 1 done — slide line 2 in as a block, then reveal tags
        setShowLine2(true);
        setTimeout(() => setShowMeta(true), LINE2_DELAY);
      }
    };

    const init = setTimeout(tick, TYPE_DELAY);
    return () => { clearTimeout(init); clearTimeout(t); };
  }, []);

  return (
    <section
      className="px-6 md:px-10 lg:px-16"
      style={{
        background: "#f4f4f5",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "28px",
        paddingBottom: "64px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Framed, rounded, animated pixel-art background (crossfades between seasons) */}
      <div className="hero-bg-frame">
        <AnimatePresence>
          <motion.div
            key={season}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="hero-bg-art"
            style={{ position: "absolute", inset: 0 }}
          >
            <PixelArtBackground src={SEASON_SRC[season]} />
          </motion.div>
        </AnimatePresence>
        {/* Soft-focus + grain so the low-res crop reads as an intentional, dreamy backdrop */}
        <div className="hero-bg-grain" />
        {/* Pixel snow drifting over the scene — matches the pixel-art aesthetic */}
        <div className="hero-bg-snow">
          <PixelSnow
            color="#ffffff"
            density={0.16}
            speed={0.5}
            pixelResolution={240}
            minFlakeSize={2.0}
            brightness={1.6}
            depthFade={7}
            farPlane={16}
            direction={112}
            variant="round"
          />
        </div>
        <div className="hero-bg-scrim" />
      </div>

      <div className="max-w-5xl mx-auto w-full" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-glass">

        {/* Season switcher — nestled in the panel's top-right corner */}
        <div className="season-switch" role="group" aria-label="Background season">
          {SEASONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { play("toggle"); setSeason(s.id); }}
              className={"season-btn" + (season === s.id ? " active" : "")}
              title={s.label}
              aria-label={s.label}
              aria-pressed={season === s.id}
            >
              <span className="season-ind" style={{ background: s.color }} />
              <span className="season-name">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "clamp(20px, 3vw, 32px)" }}
        >
          <span className="nh-label">Noah Hadley</span>
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4B5563" }} />
          <span className="nh-label" style={{ color: "#374151" }}>Product Designer &amp; Builder</span>
        </motion.div>

        {/* Statement — typewriter with per-character depth.
            A hidden copy of the full statement reserves the exact height + width
            so the title types in place without ever reflowing the layout. */}
        <h1 className="nh-statement" style={{ position: "relative" }}>
          <span aria-hidden style={{ visibility: "hidden" }}>
            {STATEMENT.split("\n").map((ln, i) => (
              <span key={i} style={{ display: "block" }}>{ln}</span>
            ))}
          </span>
          <span style={{ position: "absolute", inset: 0 }}>
            {/* Line 1 — types out word by word so words never break mid-letter */}
            <span style={{ display: "block" }}>
              {LINE0_TOKENS.map((tok, ti) => {
                const revealed = tok.chars.filter(c => c.idx < progress);
                if (revealed.length === 0) return null;
                // breakable space between words (where wrapping is allowed)
                if (tok.type === "space") return <span key={ti}> </span>;
                // word kept on one line
                return (
                  <span key={ti} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {revealed.map(c => (
                      <motion.span
                        key={c.idx}
                        initial={{ opacity: 0, y: "0.4em", filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, ease: charEase }}
                        style={{ display: "inline-block" }}
                      >
                        {c.ch}
                      </motion.span>
                    ))}
                  </span>
                );
              })}
              {/* cursor trails line 1 while it types */}
              {!showLine2 && <span className="nh-cursor">|</span>}
            </span>

            {/* Line 2 — slides in as a whole block once line 1 finishes */}
            <span style={{ display: "block" }}>
              {showLine2 && (
                <motion.span
                  initial={{ opacity: 0, y: "0.5em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.55, ease: charEase }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {LINES[1]}
                </motion.span>
              )}
            </span>
          </span>
        </h1>

        {/* Discipline tags — always present (reserves space), fades in place */}
        <motion.div
          animate={{ opacity: showMeta ? 1 : 0, y: showMeta ? 0 : 6 }}
          transition={{ duration: 0.55, ease: charEase }}
          aria-hidden={!showMeta}
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: "clamp(20px, 3vw, 28px)" }}
        >
          <ScrambledText className="nh-tags-scramble" radius={70} duration={0.9} speed={0.4}>
            {TAGS.join("   /   ")}
          </ScrambledText>
        </motion.div>
        </div>{/* /hero-glass */}
      </div>

      {/* Scroll cue — fills the empty bottom of the centered hero and hints at what's below.
          Absolutely positioned so it never affects the centered content. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showMeta ? 1 : 0 }}
        transition={{ duration: 0.6, delay: showMeta ? 0.35 : 0, ease: charEase }}
        aria-hidden={!showMeta}
        className="nh-cue-wrap px-6 md:px-10 lg:px-16"
        style={{ position: "absolute", left: 0, right: 0, bottom: "32px", pointerEvents: showMeta ? "auto" : "none" }}
      >
        <div
          className="max-w-5xl mx-auto"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.35)",
            paddingTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <span className="nh-label" style={{ color: "#9CA3AF" }}>Open to full-time roles</span>
          <button
            type="button"
            onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
            className="nh-scrollcue"
            tabIndex={showMeta ? 0 : -1}
          >
            Selected Work
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              ↓
            </motion.span>
          </button>
        </div>
      </motion.div>

      <style>{`
        .hero-bg-frame {
          position: absolute;
          top: 12px;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
          max-width: 1500px;
          border-radius: 24px;
          overflow: hidden;
          z-index: 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border: 1px solid rgba(0,0,0,0.06);
        }
        /* Soft-focus on the artwork to mask the low-res crop; the slight scale
           keeps the blur from revealing soft edges inside the rounded frame. */
        .hero-bg-art {
          filter: blur(2px) saturate(1.05);
          transform: scale(1.06);
        }
        /* Fine film grain layered over the art — sells the soft focus as a
           deliberate, textured look rather than a quality problem. */
        .hero-bg-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.5;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }
        .hero-bg-snow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .hero-bg-scrim {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0) 26%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.34));
        }
        .hero-glass {
          position: relative;
          display: block;
          width: 100%;
          padding: clamp(44px, 6vw, 72px) clamp(32px, 5vw, 56px);
          border-radius: 24px;
          background: rgba(255,255,255,0.52);
          -webkit-backdrop-filter: blur(11px) saturate(1.28);
          backdrop-filter: blur(11px) saturate(1.28);
          box-shadow: 0 34px 80px -24px rgba(0,0,0,0.5), 0 10px 28px -12px rgba(0,0,0,0.28);
        }
        .season-switch {
          position: absolute;
          top: 22px;
          right: 22px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        /* Desktop: subtle dots only (label hidden) */
        .season-btn {
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
        }
        .season-ind {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          opacity: 0.5;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15);
          transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }
        .season-btn:hover .season-ind { opacity: 1; transform: scale(1.18); }
        .season-btn.active .season-ind {
          opacity: 1;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.22);
        }
        .season-name { display: none; }
        @media (max-width: 640px) {
          .hero-bg-frame { top: 8px; bottom: 8px; width: calc(100% - 16px); border-radius: 18px; }
          /* Tighter glass padding on mobile so the switcher sits higher */
          .hero-glass { padding: 30px 24px; }
          /* Mobile: dots only, in bigger circular tap targets, all on one line */
          .season-switch {
            position: static;
            width: auto;
            margin: 0 0 22px 0;
            padding: 0;
            background: none;
            border: none;
            box-shadow: none;
            gap: 10px;
            flex-wrap: nowrap;
            justify-content: flex-start;
          }
          .season-btn {
            width: 38px;
            height: 38px;
            padding: 0;
            justify-content: center;
            border-radius: 999px;
            background: rgba(255,255,255,0.7);
            border: 1px solid rgba(0,0,0,0.08);
          }
          /* selected = subtle muted-gray container, no ring */
          .season-btn.active { background: #BFC4CC; border-color: rgba(0,0,0,0.08); }
          /* thin dark outline keeps even the pale dots (spring/winter) defined on light containers */
          .season-ind,
          .season-btn.active .season-ind { box-shadow: inset 0 0 0 1.5px rgba(0,0,0,0.22); }
          .season-ind { width: 14px; height: 14px; opacity: 1; }
          .season-btn:hover .season-ind { transform: none; }
          .season-name { display: none; }
        }
        .nh-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #111827;
        }
        .nh-statement {
          font-size: clamp(30px, 4.2vw, 50px);
          font-weight: 500;
          color: #111827;
          line-height: 1.34;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .nh-tags-scramble p {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #374151;
          font-family: inherit;
          white-space: pre;
        }
        .nh-tags-scramble .scramble-char { will-change: contents; }
        @media (max-width: 640px) {
          .nh-tags-scramble p { white-space: normal; }
        }
        .nh-scrollcue {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #111827;
          transition: color 0.15s ease;
        }
        .nh-scrollcue:hover { color: #FD8973; }
        /* Scroll cue sits over the artwork — force legible white text + shadow */
        .nh-cue-wrap .nh-label { color: #fff !important; text-shadow: 0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.55); }
        .nh-cue-wrap .nh-scrollcue { color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.55); }
        .nh-cue-wrap .nh-scrollcue:hover { color: #fff; }
        /* Hide the cue when the viewport is too short to fit it below the centered content */
        @media (max-height: 720px), (max-width: 640px) {
          .nh-cue-wrap { display: none !important; }
        }
        .nh-cursor {
          display: inline-block;
          color: #FD8973;
          font-weight: 300;
          margin-left: 2px;
          transform: translateY(-0.02em);
          animation: nh-blink 0.8s steps(1) infinite;
        }
        @keyframes nh-blink {
          0%, 50%   { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
