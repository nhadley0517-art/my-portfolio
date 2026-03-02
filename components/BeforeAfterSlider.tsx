"use client";

import { useState, useRef, useCallback } from "react";

export default function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      updatePos(e.clientX);
      const onMove = (ev: MouseEvent) => updatePos(ev.clientX);
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [updatePos]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      updatePos(e.touches[0].clientX);
      const onMove = (ev: TouchEvent) => updatePos(ev.touches[0].clientX);
      const onEnd = () => {
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);
      };
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [updatePos]
  );

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: "relative",
        userSelect: "none",
        cursor: "col-resize",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* After — base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt="After"
        draggable={false}
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      {/* Before — clipped overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt="Before"
        draggable={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
        }}
      />

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: "2px",
          background: "white",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      {/* Drag handle */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${pos}%`,
          transform: "translate(-50%, -50%)",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          cursor: "col-resize",
          pointerEvents: "none",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M7 5l-4 5 4 5M13 5l4 5-4 5"
            stroke="#13181B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Labels */}
      <span
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          background: "rgba(0,0,0,0.55)",
          color: "white",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "6px",
          pointerEvents: "none",
        }}
      >
        Before
      </span>
      <span
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          background: "rgba(0,0,0,0.55)",
          color: "white",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "6px",
          pointerEvents: "none",
        }}
      >
        After
      </span>
    </div>
  );
}
