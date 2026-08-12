"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBentoOverlay } from "@/components/BentoOverlay";
import { SELECTED_WORK } from "@/lib/workData";

// Shared with the intro's word spans so a name link staggers in as one atomic
// unit in the same sequence, rather than reading as a separate animation.
const revealVariants = {
  hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const revealTransition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };

/** Splits plain text into per-word motion spans — same mechanism as the
 *  hero bio's word-by-word reveal, reused here so the intro "generates in"
 *  the same way. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline" }}>
          <motion.span variants={revealVariants} transition={revealTransition} style={{ display: "inline-block" }}>
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

/** Inline "click me" mention of a project — dark, underlined, and paired
 *  with the matching thumbnail below via the shared `hovered` slug so the
 *  two never read as separate, competing targets. Animates in as one unit
 *  within the intro's word stagger. */
function NameLink({
  slug,
  hovered,
  setHovered,
  onOpen,
  children,
}: {
  slug: string;
  hovered: string | null;
  setHovered: (slug: string | null) => void;
  onOpen: (slug: string) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      variants={revealVariants}
      transition={revealTransition}
      className={"sw-name" + (hovered && hovered !== slug ? " is-dim" : "")}
      onClick={() => onOpen(slug)}
      onPointerEnter={() => setHovered(slug)}
      onPointerLeave={() => setHovered(null)}
      onFocus={() => setHovered(slug)}
      onBlur={() => setHovered(null)}
    >
      {children}
    </motion.button>
  );
}

export default function SelectedWork() {
  const { openSlug } = useBentoOverlay();
  const [hovered, setHovered] = useState<string | null>(null);

  const [no2, cove, wp] = SELECTED_WORK;

  return (
    <div className="sw">
      {/* Scroll-triggered (not on mount) — this section sits below the
          fold, so a mount animation would already be finished by the time
          it's actually scrolled into view. A gentler overshoot ease here
          is distinct from the intro's plain decelerate curve, so the label
          reads as its own small moment. */}
      <motion.p
        className="sw-label"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        Selected work
      </motion.p>

      <motion.p
        className="sw-intro"
        variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Words text="Three projects, three different problems." />{" "}
        <NameLink slug={no2.slug} hovered={hovered} setHovered={setHovered} onOpen={openSlug}>
          {no2.title}
        </NameLink>{" "}
        <Words text="is a gut-health app I designed and shipped solo in two weeks, live on the App Store." />{" "}
        <NameLink slug={cove.slug} hovered={hovered} setHovered={setHovered} onOpen={openSlug}>
          {cove.title}
        </NameLink>{" "}
        <Words text="is the field service CRM a business runs its whole day on." />{" "}
        <NameLink slug={wp.slug} hovered={hovered} setHovered={setHovered} onOpen={openSlug}>
          {wp.title}
        </NameLink>{" "}
        <Words text="turned a wall of text into a guided tool GCU students actually use. Hover a name to see the work, or just click it." />
      </motion.p>

      <div className={"sw-thumbs" + (hovered ? " is-hovering" : "")}>
        {SELECTED_WORK.map((row) => (
          <button
            key={row.slug}
            type="button"
            className={"sw-thumb" + (hovered === row.slug ? " is-active" : "")}
            onClick={() => openSlug(row.slug)}
            onPointerEnter={() => setHovered(row.slug)}
            onPointerLeave={() => setHovered(null)}
            aria-label={`Open ${row.title}`}
          >
            {row.thumb?.type === "video" ? (
              <video src={row.thumb.src} autoPlay muted loop playsInline />
            ) : row.thumb?.type === "iframe" ? (
              // Self-contained HTML scene (its own videos inside) — has no
              // intrinsic size the way an image/video does, so it's the one
              // thumb type that needs an explicit height rather than auto.
              <iframe
                src={row.thumb.src}
                className="sw-thumb-frame"
                scrolling="no"
                tabIndex={-1}
                title={`${row.title} preview`}
              />
            ) : row.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.thumb.src} alt="" />
            ) : null}
            <span className="sw-thumb-caption">{row.title} · {row.category}</span>
          </button>
        ))}
      </div>

      <style>{`
        .sw-label {
          font-size: 16px;
          font-weight: 300;
          color: #13181B;
          margin: 0 0 22px;
        }
        .sw-intro {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.75;
          color: #6B7280;
          max-width: 760px;
          margin: 0 0 40px;
        }
        .sw-name {
          font: inherit;
          color: #13181B;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(19,24,27,0.3);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: opacity 0.25s ease, text-decoration-color 0.25s ease;
        }
        .sw-name:hover,
        .sw-name:focus-visible {
          text-decoration-color: #13181B;
        }
        .sw-name.is-dim { opacity: 0.45; }

        .sw-thumbs {
          display: grid;
          /* Plain 1fr is really minmax(auto, 1fr) — "auto" lets each track's
             minimum be pulled by that item's own intrinsic/min-content size,
             and an <iframe> (No. 2's thumb) has a different default
             intrinsic size than a <video> or <img>, so the three columns
             drifted apart at narrower widths instead of staying equal.
             minmax(0, 1fr) ignores content size entirely — always exactly
             equal thirds. */
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          width: calc(100% + 60px);
        }
        @media (max-width: 1300px) {
          .sw-thumbs { width: 100%; }
        }
        .sw-thumb {
          position: relative;
          display: block;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        /* Every thumb is the same size and shape (Cove's own 16:9 video
           ratio) — object-fit:contain means nothing gets cropped to reach
           it, images/scenes that aren't natively 16:9 just letterbox on a
           neutral matte instead of losing content. */
        .sw-thumb img,
        .sw-thumb video,
        .sw-thumb-frame {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 4px;
          background: #F1F1F3;
        }
        .sw-thumb video {
          object-fit: contain;
        }
        /* The only image-type thumb left (Writing Process) reads better
           filling the frame than letterboxed. */
        .sw-thumb img {
          object-fit: cover;
        }
        .sw-thumb-frame {
          border: none;
          pointer-events: none;
        }
        .sw-thumbs.is-hovering .sw-thumb { opacity: 0.45; }
        .sw-thumbs.is-hovering .sw-thumb.is-active {
          opacity: 1;
          transform: scale(1.02);
        }
        .sw-thumb-caption {
          display: block;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 300;
          color: #A8ABB2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 700px) {
          .sw-thumbs { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
