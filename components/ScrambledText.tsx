"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function ScrambledText({
  radius = 80,
  duration = 1.0,
  speed = 0.5,
  scrambleChars = "upperCase",
  className = "",
  style = {},
  children,
}: ScrambledTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<Element[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector("p");
    if (!target) return;

    const split = SplitText.create(target, { type: "chars", charsClass: "scramble-char" });
    charsRef.current = split.chars;

    charsRef.current.forEach((c) => {
      gsap.set(c, { display: "inline-block", attr: { "data-content": c.innerHTML } });
    });

    const handleMove = (e: PointerEvent) => {
      charsRef.current.forEach((c) => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: (c as HTMLElement).dataset.content || "",
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      });
    };

    root.addEventListener("pointermove", handleMove);
    return () => {
      root.removeEventListener("pointermove", handleMove);
      split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div ref={rootRef} className={className} style={style}>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
