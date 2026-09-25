"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const NO2_PHONE_VIDEOS = [
  "/no2-demos/updated-insights.mp4",
  "/no2-demos/updated-home.mp4",
  "/no2-demos/updated-logging.mp4",
] as const;

/* ---- one shared, movable copy of the scene ----
   No. 2's thumbnail-to-case-study flight needs the phones to arrive exactly
   as they were: any copy of the scene means three new videos to download
   and decode, which read as a stutter and phones blinking in. Instead the
   scene is rendered once, into a standalone container, and that container
   is physically moved into whichever slot was mounted most recently — the
   thumbnail, then the flight's landing pad, then back. Browsers don't pause
   or reload a playing <video> that's moved within the same task, so the
   phones just carry on. */
let sharedNode: HTMLDivElement | null = null;
const slots: HTMLElement[] = [];

function getSharedNode() {
  if (!sharedNode) {
    sharedNode = document.createElement("div");
    sharedNode.style.cssText = "width:100%;height:100%";
  }
  return sharedNode;
}

function placeSharedNode() {
  const target = slots[slots.length - 1];
  if (target && sharedNode && sharedNode.parentNode !== target) target.appendChild(sharedNode);
}

/** Renders the shared scene into its container. Mount exactly one, somewhere
 *  that stays mounted while any slot is showing it (No. 2's thumbnail). */
export function SharedPhoneSceneHost() {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  // The container is a DOM node, which only exists client-side — creating it
  // after mount keeps the server and first client render identical.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNode(getSharedNode()), []);
  return node ? createPortal(<PhoneScene />, node) : null;
}

/** A place the shared scene can show. The most recently mounted active slot
 *  holds it; when that slot unmounts or goes inactive, it moves back to the
 *  one before. `active={false}` lets a slot hand the scene back while it's
 *  still on screen — the landing pad does this the moment its overlay starts
 *  closing, so the phones ride the thumbnail's flight back into the grid
 *  instead of waiting out the close. */
export function PhoneSceneSlot({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!active) return;
    const el = ref.current!;
    getSharedNode();
    slots.push(el);
    placeSharedNode();
    return () => {
      slots.splice(slots.lastIndexOf(el), 1);
      placeSharedNode();
    };
  }, [active]);
  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

/** Three phones on a dark stage — No. 2's thumbnail, the flying copy in its
 *  thumbnail-to-case-study transition, and the case study's hero. Plain DOM
 *  (it used to be an iframe) that scales with its own container via
 *  container-query units, so one component covers a ~150px mobile thumbnail
 *  up to the full-width hero. */
export default function PhoneScene() {
  const phone = (i: number, cls: string) => (
    <div className={`ps-phone ${cls}`}>
      <video src={NO2_PHONE_VIDEOS[i]} autoPlay muted loop playsInline />
    </div>
  );

  return (
    <div className="ps">
      <div className="ps-glow" />
      <div className="ps-row">
        {phone(0, "ps-side ps-left")}
        {phone(1, "ps-center")}
        {phone(2, "ps-side ps-right")}
      </div>

      <style>{`
        .ps {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #1C1C1E;
          container-type: inline-size;
        }
        .ps-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 70%;
          height: 200%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(126, 183, 127, 0.13) 0%, transparent 65%);
          pointer-events: none;
        }
        .ps-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3%;
          height: 100%;
        }
        /* Auto on both axes plus a max on both is the "contain" pattern:
           whichever bound is tighter wins and aspect-ratio keeps the other
           proportional, so a narrow container shrinks the phones instead of
           pushing the side ones out of frame. */
        .ps-phone {
          flex-shrink: 1;
          min-width: 0;
          height: auto;
          width: auto;
          aspect-ratio: 9 / 19.5;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
        }
        /* Corners at ~16.5% of each phone's width — a touch rounder than a
           bare iPhone screen (~14%), since these have no bezel and a real
           phone in hand reads rounder than its screen alone. In a 16:9 scene
           the phones are height-bound, which makes the center phone 23.4% of
           the scene's width (90% of the height at 9:19.5) and the side ones
           19.7%, so the radius is set in scene-width units and holds at
           every size from thumbnail to hero. */
        .ps-center { max-height: 90%; max-width: 32%; border-radius: 3.85cqw; }
        .ps-side { max-height: 76%; max-width: 26%; border-radius: 3.25cqw; }
        .ps-left { transform: rotate(-1deg) translateY(8%); }
        .ps-right { transform: rotate(1deg) translateY(8%); }
        .ps-phone video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
