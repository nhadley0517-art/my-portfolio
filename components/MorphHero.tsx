"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useOverlayMorphSlug } from "@/components/BentoOverlay";
import { PhoneSceneSlot } from "@/components/PhoneScene";
import { SELECTED_WORK } from "@/lib/workData";

export const morphLayoutId = (slug: string) => `sw-morph-${slug}`;
export const MORPH_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
// When the flight has landed. The handoff to the real hero waits for this
// *and* for the hero's media to have loaded, whichever comes last.
const LAND_MS = 550;
const HANDOFF = { duration: 0.3 };

/** What rides along in the flight: a copy of the thumbnail itself, picking
 *  up its playback where it is, so takeoff is seamless. */
function Pad({ slug, open }: { slug: string; open: boolean }) {
  const thumb = SELECTED_WORK.find((r) => r.slug === slug)?.thumb;
  const fill = { width: "100%", height: "100%", display: "block" } as const;
  // The thumbnail's own phone scene, moved here for the flight (see
  // PhoneSceneSlot) — no second copy to load, so it arrives mid-playback —
  // and handed straight back the moment the overlay starts closing.
  if (thumb?.type === "phones") return <PhoneSceneSlot active={open} />;
  if (thumb?.type === "video") {
    return (
      <video
        src={thumb.src}
        autoPlay
        muted
        loop
        playsInline
        // Pick up the thumbnail's own playback position so takeoff doesn't
        // visibly jump back to the first frame.
        onLoadedMetadata={(e) => {
          const source = document.querySelector<HTMLVideoElement>(`[data-sw-thumb="${slug}"] video`);
          if (source) e.currentTarget.currentTime = source.currentTime;
        }}
        style={{ ...fill, objectFit: "contain" }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return thumb?.type === "image" ? <img src={thumb.src} alt="" style={{ ...fill, objectFit: "cover" }} /> : null;
}

/** Holds back heavy, below-the-fold case study content until a thumbnail
 *  flight has landed, so mounting it (images decoding, carousels laying out)
 *  can't stutter the flight itself. Renders immediately for every other kind
 *  of open. */
export function AfterLanding({ slug, children }: { slug: string; children: ReactNode }) {
  const morphSlug = useOverlayMorphSlug();
  // Frozen at mount, like MorphHero — the overlay's state clears on close.
  const [ready, setReady] = useState(morphSlug !== slug);
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setReady(true), LAND_MS + 150);
    return () => clearTimeout(t);
  }, [ready]);
  return ready ? <>{children}</> : null;
}

/** Resolves once every image and video in the hero can show a frame. */
function mediaReady(root: HTMLElement | null): Promise<void> {
  const els = [...(root?.querySelectorAll("img, video") ?? [])];
  return Promise.all(
    els.map((el) => {
      if (el instanceof HTMLImageElement && el.complete) return;
      if (el instanceof HTMLVideoElement && el.readyState >= 2) return;
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        el.addEventListener(el instanceof HTMLVideoElement ? "loadeddata" : "load", done, { once: true });
        el.addEventListener("error", done, { once: true });
      });
    })
  ).then(() => undefined);
}

/** Wraps a case study's hero media. Normally it's just the scroll reveal
 *  every hero already had. When the overlay was opened by clicking this
 *  project's Selected Work thumbnail, it instead renders a landing pad that
 *  shares the thumbnail's layoutId — Framer flies the thumbnail from its spot
 *  on the page into this one — and hands off to the real hero once the pad
 *  has landed and the hero has actually loaded, so it never dissolves into
 *  an empty space. */
export default function MorphHero({
  slug,
  delay = 0,
  same = false,
  children,
}: {
  slug: string;
  delay?: number;
  /** The hero is the thumbnail's own 16:9 media (No. 2's phones, Driveway's
   *  demo video). The landed pad then simply stays as the hero — it's the
   *  same thing, already playing in step with the thumbnail — so the real
   *  hero isn't rendered at all during a morph: no second copy loading
   *  underneath mid-flight, no swap that could jump. */
  same?: boolean;
  children: ReactNode;
}) {
  const morphSlug = useOverlayMorphSlug();
  // Frozen at mount: the overlay's state clears the moment it starts
  // closing, and flipping to the ScrollReveal branch mid-exit would remount
  // the hero instead of letting it leave as-is.
  const [morphing] = useState(morphSlug === slug);
  // Flips when the real hero should dissolve in over the landed pad (only
  // when the hero is a different picture from the thumbnail).
  const [reveal, setReveal] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!morphing || same) return;
    let cancelled = false;
    const landed = new Promise((r) => setTimeout(r, LAND_MS));
    // Never leave the pad parked over the hero indefinitely on a slow load.
    const loaded = Promise.race([mediaReady(heroRef.current), new Promise((r) => setTimeout(r, 2500))]);
    Promise.all([landed, loaded]).then(() => {
      if (!cancelled) setReveal(true);
    });
    return () => {
      cancelled = true;
    };
  }, [morphing, same]);

  if (!morphing) return <ScrollReveal delay={delay}>{children}</ScrollReveal>;

  return (
    <div style={{ position: "relative" }}>
      {same ? (
        // Holds the hero's space; the pad sitting on top of it is the hero.
        <div style={{ aspectRatio: "16 / 9" }} />
      ) : (
        <motion.div ref={heroRef} initial={{ opacity: 0 }} animate={{ opacity: reveal ? 1 : 0 }} transition={HANDOFF}>
          {children}
        </motion.div>
      )}
      <motion.div
        layoutId={morphLayoutId(slug)}
        transition={MORPH_TRANSITION}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 4,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <motion.div
          animate={{ opacity: reveal ? 0 : 1 }}
          transition={{ ...HANDOFF, delay: 0.05 }}
          style={{ width: "100%", height: "100%", background: "#F1F1F3" }}
        >
          {/* Live, not frozen: goes false as soon as the overlay starts closing. */}
          <Pad slug={slug} open={morphSlug === slug} />
        </motion.div>
      </motion.div>
    </div>
  );
}
