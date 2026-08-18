"use client";

import React from "react";
import { play } from "cuelume";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";

export const NO2_SECTIONS = [
  { id: "problem",   label: "Problem" },
  { id: "solution",  label: "Solution" },
  { id: "research",  label: "Research" },
  { id: "decisions", label: "Decisions" },
  { id: "learnings", label: "Learnings" },
];

export const ACCENT = "#7EB77F";

/** The lean/ diagrams don't inline their own font — they expect Nunito
 *  already loaded on the page. React 19 hoists any <link> rendered here up
 *  into <head> (deduped), so this stays scoped to this one case study
 *  instead of touching the site's global font setup. */
function LeanFont() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" precedence="default" />
    </>
  );
}

/** One of the 7 self-contained, self-animating (SMIL, no JS) diagrams in
 *  public/lean. Both <img> and <object> load an SVG as an isolated document
 *  that can't see this page's @font-face rules — measured it directly (SVG
 *  text length identical with Nunito declared vs. forced system-ui), so
 *  either embed silently falls back to a mismatched font despite loading
 *  fine visually. Fetching the raw markup and inlining it into this page's
 *  own DOM is what actually lets it inherit Nunito — the SVG's own
 *  width:100%/display:block plus its viewBox hold the aspect ratio once it
 *  lands; the wrapper's aspect-ratio just reserves the space until then. */
function LeanDiagram({ src, ratio, title }: { src: string; ratio: number; title: string }) {
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setSvg(text); });
    return () => { cancelled = true; };
  }, [src]);

  if (!svg) {
    return <div role="img" aria-label={title} style={{ width: "100%", aspectRatio: ratio }} />;
  }

  return <div role="img" aria-label={title} style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** A real screen recording, boxed at roughly a phone's aspect ratio.
 *  Autoplays muted and loops, same treatment as the home page's own project
 *  thumbnails, so it reads as a living screen rather than a video the
 *  visitor has to press play on. */
function ShotVideo({ src, label, ratio = 9 / 19.5 }: { src: string; label: string; ratio?: number }) {
  return (
    <video
      src={src}
      aria-label={label}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: "100%",
        aspectRatio: ratio,
        background: "#FAFAFA",
        borderRadius: "4px",
        display: "block",
        objectFit: "cover",
      }}
    />
  );
}

/** One tile in a labeled screen comparison — a badge doing the "which one
 *  is this" job instead of a small caption underneath, which read as too
 *  quiet to actually register before/after at a glance. Used both for true
 *  before/after pairs (onboarding) and for a row of same-status screens
 *  (the early UI passes), so `badge` is just whatever label applies — not
 *  hardcoded to "Before"/"After". Sits inside ScreenTileRow's own shared
 *  frame rather than framing itself. */
function ScreenTile({
  badge,
  tone = "neutral",
  src,
  video,
  caption,
}: {
  badge: string;
  tone?: "neutral" | "accent";
  src: string;
  video?: boolean;
  caption?: string;
}) {
  return (
    <div>
      <span
        style={{
          display: "inline-block",
          fontSize: "11px",
          fontWeight: 600,
          color: tone === "accent" ? ACCENT : "#9CA3AF",
          background: tone === "accent" ? "rgba(126,183,127,0.12)" : "rgba(0,0,0,0.045)",
          padding: "3px 9px",
          borderRadius: "4px",
          marginBottom: "12px",
        }}
      >
        {badge}
      </span>
      {video ? (
        <ShotVideo src={src} label={`${badge}${caption ? `: ${caption}` : ""}`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${badge}${caption ? `: ${caption}` : ""}`} style={{ width: "100%", aspectRatio: 9 / 19.5, objectFit: "cover", borderRadius: "4px", display: "block" }} />
      )}
      {caption && <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "10px" }}>{caption}</p>}
    </div>
  );
}

/** One shared frame around a row of ScreenTiles, flush with the same left
 *  edge as the body copy and diagram above it — matching how the diagram
 *  itself reads as a single framed unit, instead of each tile framing
 *  itself and the whole row floating centered (and narrower than the
 *  content around it) inside the section. No border — the white fill
 *  against the section's own off-white background is enough to read as a
 *  distinct surface without an outlined edge. */
function ScreenTileRow({ tiles }: { tiles: React.ComponentProps<typeof ScreenTile>[] }) {
  return (
    <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", maxWidth: "480px" }}>
      <div className="grid grid-cols-2" style={{ gap: "20px" }}>
        {tiles.map((tile) => (
          <ScreenTile key={tile.badge + tile.src} {...tile} />
        ))}
      </div>
    </div>
  );
}

/** One screen at a time, given real room to breathe, instead of a grid
 *  showing all six simultaneously — a scroll-snap carousel with arrows and
 *  dots, closer to how the App Store itself spotlights screenshots one at a
 *  time. The active card gets full opacity/scale, the same dim-then-focus
 *  treatment Selected Work's own thumbnails already use on hover, so the
 *  "spotlight" is visual as well as positional. */
function SolutionCarousel({ items }: { items: typeof SOLUTION_SCREENS }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndexState] = React.useState(0);
  // A ref alongside the state — the arrow buttons need the *current* index
  // at the instant they're clicked, and reading only the state closure risks
  // acting on a value from a render that hasn't been superseded yet (most
  // visible right after mount, before things settle). The ref is always
  // current; the state still drives the opacity/scale re-render.
  const indexRef = React.useRef(0);
  const setIndex = (i: number) => {
    indexRef.current = i;
    setIndexState(i);
  };

  // The track's own edge padding — the first card starts flush with the
  // text column above it, not centered in the viewport. This value cancels
  // out the track's own -24px bleed margin exactly.
  const EDGE = 24;

  // Arrows/dots set the index directly rather than inferring it from scroll
  // position. The old scroll-position-based version broke down for the last
  // couple of cards specifically: their "start-aligned" target scroll
  // position (offsetLeft - EDGE) exceeds the track's actual max scrollLeft,
  // since there's no more track left to scroll past them, so the closest-
  // card measurement could never resolve to anything past roughly the
  // middle card — which is exactly what read as "it stops at Quick Log."
  // Driving the index directly sidesteps that; scrollTo still gets clamped
  // to the real max by the browser, which is fine since the card is either
  // already fully in view or as close as the track can physically get it.
  const scrollToIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    setIndex(clamped);
    const track = trackRef.current;
    const card = track?.children[clamped] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - EDGE, behavior: "smooth" });
  };

  // Maps drag position to an index by scroll *progress* (0 at the start, 1
  // at the true max), not by comparing scrollLeft against each card's own
  // "start-aligned" target. That comparison approach — even clamped to the
  // real max scrollLeft — still couldn't reach every card: since the track
  // shows more than one card at a time (~3.5 fit in the viewport at once),
  // the last several cards' start-aligned targets end up past the max
  // scrollLeft and clamp to the *same* value, so they permanently tie with
  // each other no matter how the tie is broken — the middle ones (History,
  // Insights) could never win. Progress is continuous and strictly
  // increasing over the whole drag range, so rounding progress * (last
  // index) sweeps through every index in order — every card gets its own
  // slice of the drag, including the ones that can't be scrolled fully
  // flush-left.
  const measureFromScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) { setIndex(0); return; }
    const progress = Math.max(0, Math.min(1, track.scrollLeft / maxScroll));
    setIndex(Math.round(progress * (items.length - 1)));
  };

  // Click-and-drag for mouse users — the only way to move the track besides
  // the arrows/dots now that wheel scrolling has been dropped entirely.
  // Touch keeps native scrolling (overflow-x:hidden blocks it too, same as
  // wheel — touch users are on the arrows same as everyone else), so this
  // only engages for pointerType "mouse".
  const dragRef = React.useRef<{ startX: number; startScroll: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { startX: e.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
    track.classList.add("is-dragging");
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    track.scrollLeft = Math.max(0, Math.min(maxScroll, drag.startScroll - (e.clientX - drag.startX)));
    measureFromScroll();
  };
  const endDrag = () => {
    dragRef.current = null;
    trackRef.current?.classList.remove("is-dragging");
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={trackRef}
        className="n2-carousel-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {items.map((s, i) => (
          <div
            key={s.name}
            className={"n2-carousel-card" + (i === index ? " is-active" : "")}
          >
            <div className="n2-carousel-screen">
              <ShotVideo src={s.video} label={`Screen recording: ${s.name}`} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#13181B", marginTop: "16px", marginBottom: "4px" }}>
              {s.name}
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>{s.line}</p>
          </div>
        ))}
      </div>

      <div className="n2-carousel-controls">
        {/* "press" — same cue as picking a case study or a dome gallery
            image, not a new sound just for this carousel. */}
        <button
          type="button"
          onClick={() => { play("press"); scrollToIndex(indexRef.current - 1); }}
          disabled={index === 0}
          aria-label="Previous screen"
          className="n2-carousel-arrow"
        >
          ‹
        </button>

        <div className="n2-carousel-dots">
          {items.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${s.name}`}
              className={"n2-carousel-dot" + (i === index ? " is-active" : "")}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => { play("press"); scrollToIndex(indexRef.current + 1); }}
          disabled={index === items.length - 1}
          aria-label="Next screen"
          className="n2-carousel-arrow"
        >
          ›
        </button>
      </div>

      <style>{`
        .n2-carousel-track {
          display: flex;
          /* Without this, the cards' offsetLeft (what scrollToIndex/measure
             both key off) skips past this element entirely and resolves
             against the outer position:relative wrapper instead — a totally
             different coordinate space than this element's own scrollLeft,
             which is what was corrupting both the scroll target and the
             active-card detection. */
          position: relative;
          gap: 48px;
          /* Hidden, not auto — wheel/trackpad/touch shouldn't scroll this
             directly (arrows, dots, and dragging are the only ways to move
             it). overflow:hidden still allows the programmatic scrollLeft
             writes below (both scrollTo and the drag handler) to work fine. */
          overflow-x: hidden;
          scrollbar-width: none;
          width: calc(100% + 48px);
          /* Signals the track itself is draggable (mouse only — see
             onPointerDown) instead of just an inert box. */
          cursor: grab;
          margin: 0 -24px;
          /* Left/right 24px: the first card starts flush with the text
             column above, then the rest bleed off to the right — not
             centered in the viewport. 24px on the left exactly cancels the
             -24px bleed margin above, landing card one right where the
             heading and body copy already start; 24px on the right just
             keeps the last card off the very edge once scrolled into view.
             (Left/right only — scrollToIndex/measureFromScroll both anchor
             on this exact 24px via EDGE, so it can't change independently
             of that constant.)
             Top/bottom: a scroll container can't have one axis clip and the
             other stay visible, so the vertical padding here is real
             headroom, not decorative — without it the taller cards' last
             line of body copy gets clipped against the flex row's own
             auto-computed cross-axis height. The top side also has to
             clear the active screen's own growth: it scales up from its
             *bottom* edge (see .n2-carousel-screen), so all of that growth
             goes upward, not split between top and bottom — 24px covers
             scale(1.03) on a ~520px-tall screen with room to spare. */
          padding: 24px 24px 18px;
        }
        .n2-carousel-track::-webkit-scrollbar { display: none; }
        .n2-carousel-track.is-dragging {
          cursor: grabbing;
          /* Dragging fast enough to cross a text node otherwise selects it,
             which fights the pointer-driven scroll. */
          user-select: none;
        }
        .n2-carousel-card {
          flex: 0 0 240px;
          opacity: 0.55;
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .n2-carousel-card.is-active {
          opacity: 1;
        }
        /* The depth cue lives on the screen itself, not the whole card
           (name + description included) — a shadow around the full card
           would frame the caption text too, which read as a box around a
           paragraph rather than a screen lifting off the page. Shrinking
           the inactive screens (instead of only scaling the active one up)
           reads as much clearer contrast than opacity alone was giving it. */
        .n2-carousel-screen {
          position: relative;
          border-radius: 4px;
          /* Anchored to the bottom, not the default center — a transform
             doesn't affect layout, so the 16px gap to the name/description
             below is fixed at the screen's *unscaled* height regardless.
             Scaling from center grew the screen an equal few px past that
             gap on both edges, which is what read as the active screen
             "kissing" its own title. Scaling from the bottom keeps that
             bottom edge (and the gap after it) exactly where it already
             was; all the growth goes upward instead, where there's nothing
             to crowd. */
          transform-origin: 50% 100%;
          transform: scale(0.85);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .n2-carousel-card.is-active .n2-carousel-screen {
          /* Smaller than it was (1.06) — scaling from the bottom means all
             of this growth goes upward now instead of splitting between
             top and bottom, so the same visual "pop" needs less of it
             before it outgrows the track's own top padding below. */
          transform: scale(1.03);
          box-shadow: 0 14px 26px -14px rgba(0,0,0,0.16), 0 4px 10px -6px rgba(0,0,0,0.08);
        }
        /* A dark scrim laid directly over the inactive screens — dimming
           via opacity alone (on the whole card, text included) faded
           toward the section's light background rather than actually
           reading as "dimmed," since a video doesn't have a fixed color to
           fade against. This sits on the screen itself and fades out
           entirely for the active card. */
        .n2-carousel-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 4px;
          background: rgba(0,0,0,0.4);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .n2-carousel-card.is-active .n2-carousel-screen::after {
          opacity: 0;
        }
        /* Arrows sit in their own row below the track, flanking the dots,
           instead of floating on top of the cards — absolutely positioning
           them in the track's own bleed margin still let roughly half of
           each circle overlap the first/last card underneath it. */
        .n2-carousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
        }
        .n2-carousel-arrow {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          color: #4B5563;
          cursor: pointer;
          transition: opacity 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
        }
        .n2-carousel-arrow:hover:not(:disabled) { color: #13181B; }
        .n2-carousel-arrow:disabled { opacity: 0.3; cursor: default; }
        .n2-carousel-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .n2-carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D8D9DD;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .n2-carousel-dot.is-active {
          background: #7EB77F;
          transform: scale(1.3);
        }
        @media (max-width: 700px) {
          .n2-carousel-card { flex: 0 0 200px; }
        }
      `}</style>
    </div>
  );
}

/** Inline flag for a number or date that's a stand-in until the real one is
 *  confirmed — visually distinct so it doesn't read as finished copy. */
function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#FFF7ED",
        color: "#B45309",
        padding: "2px 7px",
        borderRadius: "4px",
        fontSize: "0.82em",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

/** A single one-line point — the Problem section is meant to read fast, not
 *  argue its case in paragraphs. Same type, color, size, and line-height as
 *  every other case study's body copy (verified: both compute to 15px /
 *  27.75px) — just one line at a time instead of one wrapped paragraph.
 *  That's exactly why the old 12px margin between points read as more
 *  "leading" than a normal paragraph's internal line spacing, even with an
 *  identical line-height value: a wrapped paragraph's lines are only ever
 *  line-height apart, but three separate <p> elements each add their own
 *  half-leading above and below *plus* whatever margin sits between them.
 *  A much smaller margin here keeps that stacked gap close to what a
 *  wrapped paragraph's own line spacing would look like. */
function Point({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "2px", maxWidth: "640px" }}>
      {children}
    </p>
  );
}

/** Heading + body + diagram + one-line caption — the repeated shape for
 *  every Research and Design Decisions story. */
function Story({
  heading,
  body,
  asset,
  caption,
  delay = 0,
}: {
  heading: string;
  body: React.ReactNode;
  asset?: React.ReactNode;
  caption?: string;
  delay?: number;
}) {
  return (
    <div>
      <ScrollReveal delay={delay}>
        <h4 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", marginBottom: "24px", lineHeight: 1.3 }}>
          {heading}
        </h4>
      </ScrollReveal>
      <ScrollReveal delay={delay + 0.1}>
        <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: asset ? "40px" : 0 }}>
          {body}
        </p>
      </ScrollReveal>
      {asset && (
        <ScrollReveal delay={delay + 0.15}>
          <div style={{ maxWidth: "760px" }}>
            {asset}
            {caption && (
              <p style={{ fontSize: "14px", fontStyle: "italic", color: "#8A8F98", marginTop: "18px", maxWidth: "640px" }}>
                {caption}
              </p>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

const STATS = [
  { label: "Role", lines: ["Designer & Developer"] as React.ReactNode[] },
  { label: "Duration", lines: ["Live since March 2026"] as React.ReactNode[] },
  { label: "Scope", lines: ["0 to 1 iOS app", "Built with Claude Code"] as React.ReactNode[] },
];

const SOLUTION_SCREENS = [
  { name: "Home", line: "Where you stand today: streak and last log at a glance.", video: "/no2-demos/updated-home.mp4" },
  { name: "Log flow", line: "Bristol scale, symptoms, done in under 20 seconds.", video: "/no2-demos/updated-logging.mp4" },
  { name: "Quick Log", line: "Already know your type? One tap, no form.", video: "/no2-demos/updated-quicklog.mp4" },
  { name: "History", line: "Every log, mapped across the month.", video: "/no2-demos/updated-history.mp4" },
  { name: "Insights", line: "Your Bristol average and discomfort trend, plain language.", video: "/no2-demos/updated-insights.mp4" },
  { name: "Profile", line: "Edit your profile and settings, or export your doctor report.", video: "/no2-demos/updated-profile.mp4" },
];

export default function No2Content({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";

  const body = (
    <>
      <LeanFont />

      {/* ── 01 — INTRO ── */}
      <section className="pt-14 md:pt-20 px-6">
        <div className="max-w-5xl mx-auto mb-10">
          <ScrollReveal>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "4px", background: "#fff", fontSize: "13px", fontWeight: 400, color: "#4B5563" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
              Live on the App Store, real people using it right now.
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="text-[clamp(40px,7vw,72px)] font-medium tracking-[-0.02em] leading-[1.1] text-[#13181B] mt-5 mb-5">
              No. 2
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="text-lg font-medium mb-8 max-w-2xl" style={{ color: "#8A8F98" }}>
              A gut health app, live on the App Store. People are logging their poop with it right now.
            </p>
          </ScrollReveal>
        </div>

        <div className="max-w-5xl mx-auto mb-14 md:mb-16">
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-3" style={{ columnGap: "24px", rowGap: "32px" }}>
              {STATS.map(({ label, lines }) => (
                <div key={label}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginBottom: "14px" }}>
                    {label}
                  </p>
                  {lines.map((line, i) => (
                    <p key={i} style={{ fontSize: "15px", fontWeight: 400, color: "#13181B", lineHeight: 1.7 }}>
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="max-w-5xl mx-auto mb-8 md:mb-14">
          <ScrollReveal delay={0.15}>
            <div style={{ width: "100%", maxWidth: "760px", margin: "0 auto" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-preview.png" alt="No. 2, live on the App Store" style={{ width: "100%", borderRadius: "4px", display: "block" }} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 01 — PROBLEM ── */}
      <section id="problem" className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>01. Problem</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div style={{ marginBottom: "56px" }}>
              <Point>Colorectal cancer is now the #1 cancer killer of adults under 50 in the U.S.</Point>
              <Point>There&apos;s no habit around tracking gut health, no baseline, nothing to compare against.</Point>
              <Point>Existing apps are either cold and clinical, or vague and useless.</Point>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <LeanDiagram src="/lean/no-baseline.svg" ratio={1120 / 400} title="The baseline never exists when you need it" />
          </ScrollReveal>
        </div>
      </section>

      {/* ── 02 — SOLUTION ── */}
      <section id="solution" className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>02. Solution</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
              Six screens. One job each.
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "72px" }}>
              Live recordings from the shipped app — the actual product, not a mockup.
            </p>
          </ScrollReveal>

          {/* A 2-row, 6-up grid put all six screens in front of you at
              once — a lot to take in for someone skimming. A one-at-a-time
              carousel gives each screen actual focus instead, closer to how
              the App Store itself spotlights screenshots. */}
          <ScrollReveal delay={0.2}>
            <SolutionCarousel items={SOLUTION_SCREENS} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── 03 — RESEARCH ── */}
      <section id="research" className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>03. Research</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
              Three things I didn&apos;t see coming.
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "72px" }}>
              Design was the part I expected to be hard. These weren&apos;t the moments I expected instead.
            </p>
          </ScrollReveal>

          <div className="space-y-24">
            <Story
              heading="I'd never built a backend before this."
              body={
                <>
                  I knew Figma. I didn&apos;t know what an API key was, or why leaving one sitting in a chat window was a problem. Supabase runs accounts now, and honestly, figuring out row-level security took longer than any screen in this app. One person&apos;s data has to be physically impossible for anyone else to see, not just hidden in the UI.
                </>
              }
              asset={<LeanDiagram src="/lean/system-map.svg" ratio={1120 / 720} title="Where No. 2 data lives" />}
              caption="Your logs never leave the phone. Accounts are the only thing touching a server."
            />

            <Story
              heading="Onboarding accidentally lied to someone."
              body={
                <>
                  One of the onboarding questions asked about diet, just trying to understand someone&apos;s situation, and a user read it as &ldquo;oh, this tracks diet too.&rdquo; It didn&apos;t. They uninstalled feeling misled, and that one was on me. I rebuilt onboarding around being honest about what the app actually does instead of sounding more capable than it is.
                </>
              }
              asset={
                <>
                  <LeanDiagram src="/lean/onboarding-gap.svg" ratio={1120 / 660} title="The onboarding expectation gap" />
                  <div style={{ marginTop: "28px" }}>
                    <ScreenTileRow
                      tiles={[
                        { badge: "Before", tone: "neutral", src: "/onboarding-screen.mp4", video: true },
                        { badge: "After", tone: "accent", src: "/no2-demos/updated-onboarding.mp4", video: true },
                      ]}
                    />
                  </div>
                </>
              }
              caption="Same questions, different job: setting expectations instead of guessing at them."
              delay={0.05}
            />

            <Story
              heading="Not everyone wants to fill out a form to log a poop."
              body={
                <>
                  Some people know their type the second they&apos;re done. Making them tap through symptoms, pain level, and notes every time was friction nobody asked for. Quick Log exists for that person: one tap, done. The full flow&apos;s still there if you actually want to log more.
                </>
              }
              asset={<LeanDiagram src="/lean/log-paths.svg" ratio={1120 / 730} title="Full log versus quick log" />}
              caption="Four steps, or one tap. Your call."
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ── 04 — DESIGN DECISIONS ── */}
      <section id="decisions" className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>04. Design Decisions</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
              The calls that shaped what shipped.
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "72px" }}>
              Not every decision came from user feedback. Some were just judgment calls I made and stand behind.
            </p>
          </ScrollReveal>

          <div className="space-y-24">
            <Story
              heading="Running every log through AI would have cost real money before it earned a dollar."
              body={
                <>
                  The original plan ran every log through a model. At $0.003 a call, once a day, per user, that&apos;s $11,000 a year at 10,000 users, before a single dollar of revenue. A rule-based engine running on the device costs nothing at any scale. Cutting AI from v1 wasn&apos;t a compromise, it made the product cheaper, faster to ship, and more honest about what it actually is right now.
                </>
              }
              asset={<LeanDiagram src="/lean/ai-cost.svg" ratio={1120 / 640} title="What AI insights would have cost" />}
            />

            <Story
              heading="Streaks and History: my own call, not sourced from feedback."
              body={
                <>
                  Daily-use health apps live or die on habit. A visible calendar plus a small reward loop is a known way to keep people coming back. Framed honestly here as design judgment, not something a user asked for.
                </>
              }
              asset={
                <ScreenTileRow
                  tiles={[
                    { badge: "Early pass", tone: "neutral", src: "/home-screen-first-iteration.png", caption: "Home" },
                    { badge: "Early pass", tone: "neutral", src: "/calendar-screen-first-iteration.png", caption: "History" },
                  ]}
                />
              }
              caption="Shipped versions of both are in the Solution section above."
              delay={0.15}
            />
          </div>
        </div>
      </section>

      {/* ── 05 — FINAL SOLUTION & KEY LEARNINGS ── */}
      <section id="learnings" className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>05. Final Solution &amp; Key Learnings</SectionLabel>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
              What shipping actually looked like.
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "28px" }}>
              The real numbers, and what the process taught me past the app itself.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "64px" }}>
              <div>
                <p style={{ fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 600, color: "#C4C4C4", lineHeight: 1, letterSpacing: "-0.02em" }}>~1 min</p>
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginTop: "10px" }}>Old logging time</p>
              </div>
              <div style={{ width: "1px", background: "#EAEAED", alignSelf: "stretch", margin: "4px 0" }} />
              <div>
                <p style={{ fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 600, color: "#13181B", lineHeight: 1, letterSpacing: "-0.02em" }}>&lt;20 sec</p>
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginTop: "10px" }}>Logging time now</p>
              </div>
              <div style={{ width: "1px", background: "#EAEAED", alignSelf: "stretch", margin: "4px 0" }} />
              <div>
                <Todo>current rating + download count</Todo>
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginTop: "10px" }}>App Store rating &amp; downloads</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-24">
            <Story
              heading="Shipping isn't the finish line."
              body={
                <>
                  Real feedback (the onboarding uninstall, the logging friction) only shows up after launch. The App Store submission process has its own learning curve every time: credentials, media specs, review gates, separate from writing code.
                </>
              }
              asset={<LeanDiagram src="/lean/shipping.svg" ratio={1120 / 520} title="What it actually took to ship an update" />}
            />

            <Story
              heading="Getting it live was the smallest part of it."
              body={
                <>
                  Launch was one month. Everything since (the design system, every screen redesigned, the new features, the onboarding rebuild) is the part that actually made it good.
                </>
              }
              asset={<LeanDiagram src="/lean/timeline.svg" ratio={1120 / 520} title="Launch was the smallest part of it" />}
              delay={0.05}
            />

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "40px" }}>
                No. 2 is live, and it does exactly what it set out to do: give people a reason to start paying attention before something forces them to. The AI insights layer is still on the roadmap, once the usage numbers justify the cost. Until then, I&apos;m watching how people actually use streaks and history and deciding what to build next from that, not from a guess.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div style={{ width: "100%", maxWidth: "760px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/app-review.png?v=2" alt="App Store review" style={{ width: "100%", borderRadius: "4px", display: "block" }} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CaseStudyBottomNav
        isOverlay={isOverlay}
        onClose={onClose}
        nextHref="/cove"
        nextLabel="Cove"
      />
    </>
  );

  if (isOverlay) return <div className="cs-body">{body}</div>;

  return (
    <>
      <Nav sections={NO2_SECTIONS} accentColor={ACCENT} />
      <CaseStudyNav sections={NO2_SECTIONS} accentColor={ACCENT} card />
      <main className="pt-[72px] cs-body">{body}</main>
      <Footer />
    </>
  );
}
