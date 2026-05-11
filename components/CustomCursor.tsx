"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";

interface PillState {
  label: string;
  color: string;
}

function resetCursor() {
  document.body.style.cursor = "";
}

export default function CustomCursor() {
  const pathname = usePathname();
  const [pill, setPill] = useState<PillState | null>(null);
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // False until 300ms after landing on the homepage — blocks cursor-enter events
  // that fire from residual hover state during a page transition.
  const readyRef = useRef(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setMounted(true);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onEnter = (e: Event) => {
      if (!readyRef.current) return;
      const { label, color } = (e as CustomEvent<PillState>).detail;
      setPill({ label, color });
      document.body.style.cursor = "none";
    };

    const onLeave = () => {
      setPill(null);
      resetCursor();
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("cursor-enter", onEnter);
    document.addEventListener("cursor-leave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("cursor-enter", onEnter);
      document.removeEventListener("cursor-leave", onLeave);
      setPill(null);
      resetCursor();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset on every route change. When arriving at '/', hold off cursor-enter
  // for 300ms so residual hover events from the transition don't trigger the pill.
  useEffect(() => {
    setPill(null);
    resetCursor();
    readyRef.current = false;
    if (pathname === "/") {
      const t = setTimeout(() => { readyRef.current = true; }, 300);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  if (!mounted || pathname !== "/") return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {pill && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: pill.color,
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.01em",
              padding: "8px 16px",
              borderRadius: "100px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            }}
          >
            {pill.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
