"use client";

import { motion } from "framer-motion";
import { useId, useRef, useState } from "react";

const tones = {
  light: {
    track: "bg-white",
    thumb: "bg-[#13181b]",
    on: "text-white",
    off: "text-[#13181b]/50 hover:text-[#13181b]",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
  },
  dark: {
    track: "bg-[#13181b]",
    thumb: "bg-white",
    on: "text-[#13181b]",
    off: "text-white/50 hover:text-white",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
  },
};

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  tone?: "light" | "dark";
  stroke?: boolean;
  /** 0 = no overshoot, 100 = very springy. */
  bounce?: number;
  /** Corner radius in px. Omit for pills. */
  radius?: number;
  className?: string;
};

/**
 * One surface travels to your choice instead of three states blinking.
 * The label color follows the thumb, not the click.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  tone = "light",
  stroke = false,
  bounce = 15,
  radius,
  className = "",
}: SegmentedControlProps<T>) {
  const t = tones[tone];
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function choose(v: T) {
    setInner(v);
    onValueChange?.(v);
  }

  // One tab stop; arrows move and select, Home and End jump to the ends.
  function onKeyDown(e: React.KeyboardEvent) {
    const i = options.findIndex((o) => o.value === current);
    const last = options.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % options.length
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + options.length) % options.length
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(options[next].value);
    refs.current[next]?.focus();
  }
  const outer = radius == null ? 999 : radius;
  const innerRadius = radius == null ? 999 : Math.max(radius - 4, 2);

  return (
    <div
      role="radiogroup"
      onKeyDown={onKeyDown}
      style={{ borderRadius: outer }}
      className={`inline-flex p-1 text-[13px] ${t.track} ${stroke ? t.stroke : ""} ${className}`}
    >
      {options.map((o, i) => {
        const on = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => choose(o.value)}
            style={{ borderRadius: innerRadius }}
            className={`relative h-8 px-4 outline-none transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:shadow-[0_0_0_2px_rgb(19_24_27/0.3)] ${
              on ? t.on : t.off
            }`}
          >
            {on && (
              <motion.span
                layoutId={`${id}-thumb`}
                className={`absolute inset-0 ${t.thumb}`}
                style={{ borderRadius: innerRadius }}
                transition={{ type: "spring", visualDuration: 0.35, bounce: bounce / 100 }}
              />
            )}
            <span className="relative whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
