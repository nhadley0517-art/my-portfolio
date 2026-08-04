"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import BusinessCard from "./BusinessCard";

type BioChunk = { text: string; strong?: boolean };

// Each paragraph's last two words are joined with a non-breaking space so
// the final line never leaves a single word stranded alone.
const BIO_PARAGRAPHS: BioChunk[][] = [
  [
    { text: "Noah Hadley", strong: true },
    { text: "is a" },
    { text: "product designer", strong: true },
    { text: "who graduated from Grand Canyon University in April 2026. He cares about how things feel to use, not just how they look. He designs end to end across web and mobile, uses Claude Code and Cursor as a core part of his workflow, and recently shipped a" },
    { text: "solo iOS app", strong: true },
    { text: "built completely from scratch in two weeks." },
  ],
  [
    { text: "He previously interned at Canyon Creative, designing client-facing products in an agency environment, and at Grand Canyon Education, where he led a full platform redesign for tens of thousands of students." },
  ],
  [
    { text: "He's actively looking for" },
    { text: "full-time product design roles,", strong: true },
    { text: "open to remote, hybrid, or relocation." },
  ],
];

const BIO_PARAGRAPHS_WORDS = BIO_PARAGRAPHS.map((chunks) =>
  chunks.flatMap((c) => c.text.split(" ").map((word) => ({ word, strong: c.strong })))
);

// Both card images are 1050x600 — the real 3.5x2in business card proportion.
// Everything sizes off this so the card is never subtly stretched.
const CARD_RATIO = 1050 / 600;

/* Sizing is expressed as CSS math rather than read off `window`. Reading the
   viewport during render is what caused a hydration mismatch — the server has
   no window, so it emitted a different height than the client. `vh`/`vw` units
   are resolved by the browser itself, so the exact same string is correct on
   both, there's no wrong-size frame before a JS effect corrects it, and window
   resizes are handled for free without a listener. */

/** Resting height of the hero section: taller than the content strictly needs,
 *  because the card is centered in the stage below the bio, so a deeper
 *  resting section is what drops it clear of the text. Never taller than the
 *  viewport, or the section would shrink as you scroll instead of growing. */
const HERO_REST_H = "min(100vh, max(68vh, 840px))";

const CARD_SMALL_W = "300px";
/** The grown card, capped three ways: by viewport width, by the source
 *  image's own native size (so it's never upscaled), and — the cap that
 *  actually binds on short screens — by the vertical room left under the bio,
 *  so the card and its shadow can't overflow the section's `overflow: hidden`
 *  and get sliced off. The 520px covers the bio block plus the section's
 *  padding, with margin so the card never lands flush against the clip edge. */
const CARD_LARGE_W =
  `max(${CARD_SMALL_W}, min(100vw - 260px, 660px, calc(max(180px, 100vh - 520px) * ${CARD_RATIO})))`;

/** Mobile doesn't scroll-jack at all, so it just needs one fixed size —
 *  the desktop formula's constants (260px of side margin) are tuned for a
 *  much wider stage and read as cramped down here. 48px matches the
 *  page's own mobile edge margin. */
const CARD_MOBILE_W = "min(420px, calc(100vw - 48px))";

/** Linear interpolation between two CSS lengths, driven by scroll progress. */
const lerpCss = (from: string, to: string, p: number) => `calc(${from} + (${to} - ${from}) * ${p})`;

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

  // Scroll-linked growth: the card starts small and scales up as the user
  // scrolls through this wrapper, while the section itself stays pinned
  // (`position: sticky`). No spring/smoothing on these values — a direct
  // algebraic map off scrollYProgress means the card's size always matches
  // scroll position exactly, with nothing left to settle.
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollWrapRef, offset: ["start start", "end end"] });

  // The section needs a concrete (not min-) height so the bio can sit at a
  // fixed size up top while the card stage below it (flex: 1) has room to
  // grow into.
  const heroHeight = useTransform(scrollYProgress, (p) => lerpCss(HERO_REST_H, "100vh", p));
  const cardWidth = useTransform(scrollYProgress, (p) => lerpCss(CARD_SMALL_W, CARD_LARGE_W, p));
  const cardHeight = useTransform(
    scrollYProgress,
    (p) => `calc((${lerpCss(CARD_SMALL_W, CARD_LARGE_W, p)}) / ${CARD_RATIO})`
  );

  // Keep the page pinned to the hero on load (don't let the browser restore
  // a previous scroll position or jump to an anchor).
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Preload the back face so the first flip doesn't show a blank plane.
  useEffect(() => {
    const img = new window.Image();
    img.src = "/Business-card-back.png";
  }, []);

  return (
    <section id="welcome">
      {/* Desktop: the scroll-jack growth sequence, entirely unchanged.
          Hidden below the mobile breakpoint via CSS only — nothing here
          reads the viewport in JS, so there's no hydration risk and no
          behavior change for desktop. */}
      <div ref={scrollWrapRef} className="hero-desktop-scroll" style={{ position: "relative", height: "190vh" }}>
        <motion.section
          className="hero-section"
          style={{
            background: "#f4f4f5",
            height: heroHeight,
            boxSizing: "border-box",
            position: "sticky",
            top: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Bio — fixed at the top of the sticky section, so it stays
              visible and never moves for the entire hero scroll sequence;
              only the image stage below it grows. Uses .site-container
              directly so it's centered in exactly the same column as every
              other section, rather than a separately-maintained formula. */}
          <div className="site-container hero-bio-wrap">
            <HeroBio />
          </div>

          {/* The business card — a real CSS 3D object you can turn over.
              Only its stage is scroll-sized; the card's own tilt/turn
              transforms live inside BusinessCard, so the two never fight
              over the same element's transform. */}
          <div className="hero-image-stage">
            <motion.div
              className="hero-card-stage"
              style={{ width: cardWidth, height: cardHeight }}
            >
              <BusinessCard />
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Mobile: no scroll-jack, no pin — the card just renders at its full
          size right away and the section takes only the height its content
          needs, so scrolling past the hero is one normal scroll like every
          other section instead of a dead zone spent growing an image. */}
      <div className="hero-mobile-static">
        <div className="site-container hero-bio-wrap">
          <HeroBio />
        </div>
        <div className="hero-image-stage">
          <div className="hero-card-stage hero-card-stage--mobile">
            <BusinessCard mobile />
          </div>
        </div>
      </div>

      <style>{`
        /* No horizontal padding here — the bio uses .site-container
           directly, and the image stage centers its box within this
           section's full width, which shares the same center line as
           .site-container since both center within the same site-main. */
        .hero-section {
          padding-top: 108px;
          /* Deeper than it looks like it needs to be — the card's ground
             shadow and "drag to turn" hint both sit *outside* the card's
             own box, and the section clips its overflow. */
          padding-bottom: 56px;
        }
        .hero-image-stage {
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hero-card-stage { position: relative; flex-shrink: 0; }
        .hero-card-stage--mobile {
          width: ${CARD_MOBILE_W};
          height: calc(${CARD_MOBILE_W} / ${CARD_RATIO});
        }
        /* Flex items with auto cross-axis margins shrink-wrap to content
           instead of stretching first — explicit width forces it to fill
           the row before max-width caps it, so it centers exactly like
           every other section's plain-block .site-container does. */
        .hero-bio-wrap { flex-shrink: 0; width: 100%; padding-bottom: clamp(56px, 7vw, 100px); }
        .hero-bio {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: -0.005em;
          color: #6B7280;
          max-width: 840px;
          margin: 0 0 16px;
        }
        .hero-bio:last-child { margin-bottom: 0; }
        .hero-bio-word-wrap { display: inline; }
        .hero-bio-word { display: inline-block; }
        /* Key facts (name, role, standout details) pulled out of the
           body gray — same size and weight shift the site already uses
           to separate a title from surrounding copy. */
        .hero-bio-word.is-strong { color: #13181B; font-weight: 400; }

        .hero-mobile-static {
          display: none;
        }
        @media (max-width: 700px) {
          .hero-desktop-scroll { display: none; }
          .hero-mobile-static {
            display: flex;
            flex-direction: column;
            padding: 96px 0 64px;
          }
        }
      `}</style>
    </section>
  );
}
