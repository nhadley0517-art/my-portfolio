"use client";

import { useRef, useState } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

const FRONT_SRC = "/Business-card-front.png";
const BACK_SRC = "/Business-card-back.png";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// How far the card leans when the pointer merely hovers (no drag). Shallow on
// purpose — the big rotations are reserved for an actual drag, so hovering
// reads as "this is a physical thing" rather than as its own animation.
const HOVER_TILT_Y = 15;
const HOVER_TILT_X = 11;
// Degrees of rotation per pixel dragged.
const DRAG_SENSITIVITY_Y = 0.55;
const DRAG_SENSITIVITY_X = 0.4;
// Past this the card would tip toward edge-on and stop being readable.
const MAX_TILT_X = 34;

const settleSpring = { type: "spring" as const, stiffness: 170, damping: 20, mass: 1 };

/** A draggable, two-sided business card rendered with real CSS 3D — not a
 *  flat image with a fake shadow. Both faces are separate planes in one
 *  `preserve-3d` scene with `backface-visibility: hidden`, so whichever side
 *  is turned away genuinely isn't drawn.
 *
 *  Drag turns it (Y accumulates freely so it can be spun through multiple
 *  full turns); on release it settles onto whichever face it's nearest, which
 *  is what makes it feel like an object with weight rather than a slider. */
export default function BusinessCard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  // The rotation the card settles to — always a multiple of 180 (a whole
  // number of half-turns), so hover tilt can be applied relative to whichever
  // face is currently showing instead of snapping back to the front.
  const restY = useRef(0);

  const [dragging, setDragging] = useState(false);
  const [lit, setLit] = useState(false);
  const [touched, setTouched] = useState(false);

  // Raw targets, in degrees.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  // Springs smooth the pointer's raw jitter into something that reads as
  // momentum. Stiff enough during a drag to still feel 1:1.
  const rxs = useSpring(rx, { stiffness: 320, damping: 32, mass: 0.8 });
  const rys = useSpring(ry, { stiffness: 320, damping: 32, mass: 0.8 });

  // Specular highlight position, in % of the card's own box.
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  // The back face is mirrored in 3D, so its highlight has to be mirrored too
  // or the light would appear to come from the opposite side when you flip.
  const gxBack = useTransform(gx, (v) => 100 - v);

  // Matte stock: one broad, very soft wash rather than a tight specular
  // hotspot. Uncoated paper scatters light instead of reflecting it, so the
  // surface should brighten gently across a wide area and never glint.
  const glareFront = useMotionTemplate`radial-gradient(circle 340px at ${gx}% ${gy}%, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0) 82%)`;
  const glareBack = useMotionTemplate`radial-gradient(circle 340px at ${gxBack}% ${gy}%, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0) 82%)`;

  // Ground shadow reacts to the turn: it slides opposite the lean and
  // narrows as the card goes edge-on, which is most of what sells depth.
  const shadowX = useTransform(rys, (v) => -Math.sin((v * Math.PI) / 180) * 26);
  const shadowScaleX = useTransform(rys, (v) => 0.62 + Math.abs(Math.cos((v * Math.PI) / 180)) * 0.38);
  const shadowOpacity = useTransform(rys, (v) => 0.16 + Math.abs(Math.cos((v * Math.PI) / 180)) * 0.16);

  const pointerToGlare = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gx.set(clamp(px, 0, 1) * 100);
    gy.set(clamp(py, 0, 1) * 100);
    return { px, py };
  };

  const handleMove = (e: React.PointerEvent) => {
    const p = pointerToGlare(e);
    if (!p) return;

    if (dragging && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      ry.set(dragStart.current.ry + dx * DRAG_SENSITIVITY_Y);
      rx.set(clamp(dragStart.current.rx - dy * DRAG_SENSITIVITY_X, -MAX_TILT_X, MAX_TILT_X));
      return;
    }

    // Hover lean, applied on top of whichever face is settled.
    ry.set(restY.current + (p.px - 0.5) * 2 * HOVER_TILT_Y);
    rx.set((0.5 - p.py) * 2 * HOVER_TILT_X);
  };

  const handleDown = (e: React.PointerEvent) => {
    wrapRef.current?.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, rx: rx.get(), ry: ry.get() };
    setDragging(true);
    setTouched(true);
  };

  const settle = () => {
    // Nearest half-turn, so it always comes to rest showing a clean face.
    const target = Math.round(ry.get() / 180) * 180;
    restY.current = target;
    animate(ry, target, settleSpring);
    animate(rx, 0, settleSpring);
  };

  const handleUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    wrapRef.current?.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    dragStart.current = null;
    settle();
  };

  const handleLeave = () => {
    setLit(false);
    if (dragging) {
      setDragging(false);
      dragStart.current = null;
    }
    settle();
  };

  const flip = () => {
    setTouched(true);
    restY.current += 180;
    animate(ry, restY.current, settleSpring);
    animate(rx, 0, settleSpring);
  };

  return (
    <div
      ref={wrapRef}
      className={"bcard-wrap" + (dragging ? " is-dragging" : "") + (lit ? " is-lit" : "")}
      onPointerMove={handleMove}
      onPointerEnter={() => setLit(true)}
      onPointerLeave={handleLeave}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Noah Hadley's business card. Drag to turn it over, or press Enter to flip."
    >
      <motion.div
        className="bcard-shadow"
        style={{ x: shadowX, scaleX: shadowScaleX, opacity: shadowOpacity }}
      />

      <motion.div className="bcard" style={{ rotateX: rxs, rotateY: rys }}>
        <div className="bcard-face bcard-front">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FRONT_SRC} alt="Business card, front" draggable={false} />
          <motion.div className="bcard-glare" style={{ background: glareFront }} />
        </div>

        <div className="bcard-face bcard-back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BACK_SRC} alt="Business card, back" draggable={false} />
          <motion.div className="bcard-glare" style={{ background: glareBack }} />
        </div>
      </motion.div>

      <span className={"bcard-hint" + (touched ? " is-gone" : "")} aria-hidden>
        Drag to turn
      </span>

      <style>{`
        .bcard-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          /* Perspective lives on the wrapper, which never itself transforms —
             so the vanishing point stays put while the card turns inside it. */
          perspective: 1300px;
          /* Lets a finger drag the card instead of scrolling the page. */
          touch-action: none;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
          outline: none;
        }
        .bcard-wrap.is-dragging { cursor: grabbing; }
        .bcard-wrap:focus-visible { outline: 2px solid #13181B; outline-offset: 14px; border-radius: 4px; }

        .bcard {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .bcard-face {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          overflow: hidden;
          /* The half turned away genuinely isn't painted, so you never see
             the front bleeding through the back. */
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.07),
            0 18px 40px -22px rgba(0,0,0,0.45);
        }
        .bcard-back { transform: rotateY(180deg); }
        .bcard-face img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        /* Diffuse ambient response, not a specular highlight — soft-light
           rather than screen, so the wash lifts the surface slightly instead
           of adding a bright hotspot on top of it. Matte stock catches light
           broadly and never glints. */
        .bcard-glare {
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: soft-light;
          opacity: 0;
          transition: opacity 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bcard-wrap.is-lit .bcard-glare { opacity: 0.55; }

        .bcard-shadow {
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: -7%;
          height: 13%;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%);
          filter: blur(7px);
          pointer-events: none;
        }

        .bcard-hint {
          position: absolute;
          left: 50%;
          bottom: -34px;
          transform: translateX(-50%);
          font-size: 11.5px;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #A8ABB2;
          white-space: nowrap;
          pointer-events: none;
          transition: opacity 400ms ease;
        }
        .bcard-hint.is-gone { opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .bcard { transform: none !important; }
          .bcard-shadow { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
