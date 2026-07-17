"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "cuelume";

export type BentoOverlayVariant = "bare" | "card";

interface OverlayState {
  content: ReactNode;
  variant: BentoOverlayVariant;
  key: string;
}

interface BentoOverlayCtx {
  open: (content: ReactNode, variant: BentoOverlayVariant, key?: string) => void;
  close: () => void;
}

const Ctx = createContext<BentoOverlayCtx | null>(null);

/** Every bento-grid interaction (experience cards, dome posters, archive
 *  projects) opens through this one overlay instead of its own bespoke
 *  expand/navigate behavior — same levitating panel, same click-outside/Esc
 *  to close, same "the grid never moves" feel. */
export function useBentoOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBentoOverlay must be used within a BentoOverlayProvider");
  return ctx;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

export function BentoOverlayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OverlayState | null>(null);
  const [mounted, setMounted] = useState(false);

  // Portals need `document`, which doesn't exist during SSR — this delays
  // the portal render until after the client mount, the standard fix.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const open = useCallback((content: ReactNode, variant: BentoOverlayVariant, key = "overlay") => {
    play("press");
    setState({ content, variant, key });
  }, []);
  const close = useCallback(() => {
    setState(null);
  }, []);

  // Esc closes, and background scroll is locked while any overlay is open.
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [state, close]);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {state && (
              <motion.div
                key={state.key}
                className="bento-overlay-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={close}
              >
                <motion.div
                  className="bento-overlay-panel"
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={spring}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bento-overlay-shell ${state.variant}`}>
                    <div className="bento-overlay-scroll">{state.content}</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <style>{`
        .bento-overlay-backdrop {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--overlay-backdrop-bg);
          -webkit-backdrop-filter: var(--overlay-backdrop-blur);
          backdrop-filter: var(--overlay-backdrop-blur);
        }
        .bento-overlay-panel {
          position: relative;
        }
        /* The shell owns the rounded card look and clips its contents to
           that radius; the scroll region lives inside it. Splitting these
           means the scrollbar renders (and gets clipped) within the rounded
           shape instead of sitting flush against — and visually breaking —
           the corner curve. */
        .bento-overlay-shell.card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 40px 90px -20px rgba(0,0,0,0.35), 0 10px 30px -10px rgba(0,0,0,0.2);
          max-width: 880px;
          width: min(90vw, 880px);
          overflow: hidden;
        }
        .bento-overlay-shell.card .bento-overlay-scroll {
          max-height: min(88vh, 860px);
          overflow-y: auto;
          /* No visible scrollbar at all — content still scrolls fine via
             wheel/touch/keyboard, it just doesn't show a track/thumb. */
          scrollbar-width: none;
        }
        .bento-overlay-shell.card .bento-overlay-scroll::-webkit-scrollbar {
          display: none;
        }
        .bento-overlay-shell.bare {
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: min(92vw, 900px);
        }
        .bento-overlay-shell.bare .bento-overlay-scroll img {
          display: block;
          max-width: 100%;
          max-height: min(88vh, 860px);
          border-radius: 18px;
          box-shadow: 0 30px 70px -15px rgba(0,0,0,0.4);
        }
        @media (max-width: 640px) {
          .bento-overlay-backdrop { padding: 16px; }
          .bento-overlay-shell.card { width: 94vw; }
        }
      `}</style>
    </Ctx.Provider>
  );
}
