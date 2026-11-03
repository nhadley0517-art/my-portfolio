"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const out = { duration: 0.24, ease: [0.16, 1, 0.3, 1] } as const;
const signal = "var(--signal, #e4572e)";

const tones = {
  light: {
    base: "bg-white text-[#13181b] hover:bg-[#fafafa]",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
    focus: "focus-visible:shadow-[0_0_0_2px_#f4f4f5,0_0_0_3.5px_rgb(19_24_27/0.4)]",
  },
  dark: {
    base: "bg-[#13181b] text-white hover:bg-[#1f2427]",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
    focus: "focus-visible:shadow-[0_0_0_2px_#f4f4f5,0_0_0_3.5px_rgb(19_24_27/0.6)]",
  },
};

type Phase = "idle" | "holding" | "hint" | "done";

type HoldToConfirmProps = {
  /** Label while idle. */
  children?: string;
  /** Shown briefly when released too early. */
  hintLabel?: string;
  /** Shown once the hold completes. */
  confirmedLabel?: string;
  /** How long the hold takes, in ms. Scale it with how hard the action is to undo. */
  duration?: number;
  tone?: "light" | "dark";
  stroke?: boolean;
  /** Corner radius in px. Omit for a pill. */
  radius?: number;
  /** When set, returns to idle this many ms after confirming. */
  resetAfter?: number;
  onConfirm?: () => void;
  className?: string;
};

/**
 * Friction you can feel. The fill tracks the hold while the lid lifts;
 * let go early and it springs back and tells you why.
 */
export function HoldToConfirm({
  children = "Hold to delete",
  hintLabel = "Keep holding",
  confirmedLabel = "Deleted",
  duration = 1200,
  tone = "light",
  stroke = false,
  radius,
  resetAfter,
  onConfirm,
  className = "",
}: HoldToConfirmProps) {
  const t = tones[tone];
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (p) => `inset(0 ${100 - p * 100}% 0 0)`);
  const scale = useMotionValue(1);
  const fillAnim = useRef<AnimationPlaybackControls>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase === "hint") {
      const id = setTimeout(() => setPhase("idle"), 1100);
      return () => clearTimeout(id);
    }
    if (phase === "done" && resetAfter != null) {
      const id = setTimeout(() => {
        setPhase("idle");
        fillAnim.current = animate(progress, 0, { duration: 0.35, ease: [0.2, 0, 0, 1] });
      }, resetAfter);
      return () => clearTimeout(id);
    }
  }, [phase, resetAfter, progress]);

  function start() {
    if (phase === "done") return;
    setPhase("holding");
    animate(scale, 0.97, { type: "spring", stiffness: 600, damping: 30 });
    fillAnim.current?.stop();
    fillAnim.current = animate(progress, 1, {
      duration: ((1 - progress.get()) * duration) / 1000,
      ease: "linear",
      onComplete: () => {
        setPhase("done");
        animate(scale, [0.97, 0.94, 1], { duration: 0.45, ease: [0.34, 1.45, 0.5, 1] });
        navigator.vibrate?.(12);
        onConfirm?.();
      },
    });
  }

  function cancel() {
    if (phase !== "holding") return;
    setPhase("hint");
    fillAnim.current?.stop();
    fillAnim.current = animate(progress, 0, { type: "spring", stiffness: 380, damping: 32 });
    animate(scale, 1, { type: "spring", stiffness: 600, damping: 26 });
  }

  const label = phase === "done" ? confirmedLabel : phase === "hint" ? hintLabel : children;
  const labels = [children, hintLabel, confirmedLabel];
  const corner = radius == null ? 999 : radius;

  return (
    <motion.button
      type="button"
      aria-label={phase === "done" ? confirmedLabel : `${children}. Press and hold to confirm.`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onBlur={cancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ scale, borderRadius: corner }}
      className={`relative inline-flex h-10 touch-none select-none items-center overflow-hidden text-[13px] outline-none transition-colors duration-150 ${t.base} ${stroke ? t.stroke : ""} ${t.focus} ${className}`}
    >
      <Face label={label} labels={labels} progress={progress} done={phase === "done"} />

      {/* The same face in white, revealed by the fill. */}
      <motion.span aria-hidden style={{ clipPath: clip, background: signal }} className="absolute inset-0 text-white">
        <Face label={label} labels={labels} progress={progress} done={phase === "done"} />
      </motion.span>

      <span className="sr-only" aria-live="polite">
        {phase === "done" ? confirmedLabel : ""}
      </span>
    </motion.button>
  );
}

function Face({
  label,
  labels,
  progress,
  done,
}: {
  label: string;
  labels: string[];
  progress: MotionValue<number>;
  done: boolean;
}) {
  const lidY = useTransform(progress, [0, 1], [0, -1.6]);
  const lidRotate = useTransform(progress, [0, 1], [0, -16]);

  return (
    <span className="flex h-full items-center gap-2 pl-4 pr-[18px]">
      <span className="relative size-3.5 shrink-0">
        <AnimatePresence initial={false}>
          {done ? (
            <motion.svg
              key="check"
              viewBox="0 0 16 16"
              className="absolute inset-0 size-3.5"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={out}
            >
              <motion.path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.06 }}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="trash"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute inset-0 size-3.5 overflow-visible"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={out}
            >
              <motion.g style={{ y: lidY, rotate: lidRotate, transformOrigin: "2.5px 4px" }}>
                <path d="M2.5 4h11" />
                <path d="M6 4V2.75c0-.41.34-.75.75-.75h2.5c.41 0 .75.34.75.75V4" />
              </motion.g>
              <path d="M3.75 4.5l.6 8.3c.05.68.62 1.2 1.3 1.2h4.7c.68 0 1.25-.52 1.3-1.2l.6-8.3" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>

      {/* Every label shares one grid cell, so the width never changes. */}
      <span className="grid">
        {labels.map((l) => (
          <span key={l} className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {l}
          </span>
        ))}
        <span className="relative col-start-1 row-start-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={label}
              className="block whitespace-nowrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={out}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </span>
  );
}
