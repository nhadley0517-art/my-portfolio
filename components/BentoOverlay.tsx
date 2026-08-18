"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "cuelume";

export type BentoOverlayVariant = "bare" | "card" | "wide";

/** A piece of content that is addressable by slug — case studies, archive
 *  projects, writing posts. These get a URL so they stay linkable and
 *  shareable even though the site is a single page. Ephemeral things
 *  (dome posters, experience cards) use `open()` instead and leave the
 *  URL alone. */
export interface OverlayEntry {
  variant: BentoOverlayVariant;
  /** Cue played on open. Defaults to "press". */
  sound?: "press" | "page";
  /** Standalone page this content also lives at. On mobile the long-form
   *  overlay reads as a cramped, hard-to-close modal, so entries with a
   *  route navigate there directly on small screens instead of opening
   *  the overlay at all. Desktop is unaffected. */
  route?: string;
  render: (ctx: { close: () => void }) => ReactNode;
  /** Optional companion panel rendered as a sibling of the main shell, not
   *  inside it — the 3 case studies use this for their section legend.
   *  Keeping it outside the shell means it never competes with the shell's
   *  own content for width (the content's own centering stays untouched)
   *  and it never scrolls away, since it sits outside the shell's scroll
   *  region entirely. */
  sidePanel?: () => ReactNode;
}

export type OverlayRegistry = Record<string, OverlayEntry>;

interface OverlayState {
  content: ReactNode;
  variant: BentoOverlayVariant;
  key: string;
  sidePanel?: ReactNode;
}

interface BentoOverlayCtx {
  /** Open ephemeral content that doesn't belong in the URL. */
  open: (content: ReactNode, variant: BentoOverlayVariant, key?: string) => void;
  /** Open registered content by slug, reflecting it in the URL. */
  openSlug: (slug: string) => void;
  close: () => void;
}

const Ctx = createContext<BentoOverlayCtx | null>(null);

/** Every interaction on the page (case studies, archive projects, writing
 *  posts, experience cards, dome posters) opens through this one overlay —
 *  same levitating panel, same click-outside/Esc to close, same "the page
 *  never moves" feel. */
export function useBentoOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBentoOverlay must be used within a BentoOverlayProvider");
  return ctx;
}

// Slightly softer and slower than a stock modal pop — the panel settles in
// rather than snapping, which reads as deliberate at this size.
const panelSpring = { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.9 };
const URL_PARAM = "p";

function slugFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(URL_PARAM);
}

export function BentoOverlayProvider({
  registry,
  children,
}: {
  /** Slug-addressable content. Define at module scope so its identity is stable. */
  registry?: OverlayRegistry;
  children: ReactNode;
}) {
  const [state, setState] = useState<OverlayState | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const isMobileRef = useRef(false);

  // Portals need `document`, which doesn't exist during SSR — this delays
  // the portal render until after the client mount, the standard fix.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Read as a ref rather than state — this only needs to be current at the
  // moment openSlug is called, not to trigger a re-render of its own.
  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 700; };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Closing an addressable overlay steps back in history rather than pushing
  // a new entry, so the browser's back button and the UI's close affordances
  // stay in sync instead of stacking up duplicate entries.
  const close = useCallback(() => {
    if (slugFromLocation()) window.history.back();
    else setState(null);
  }, []);

  const buildFromSlug = useCallback(
    (slug: string): OverlayState | null => {
      const entry = registry?.[slug];
      if (!entry) return null;
      return {
        content: entry.render({ close }),
        variant: entry.variant,
        key: `slug-${slug}`,
        sidePanel: entry.sidePanel?.(),
      };
    },
    [registry, close]
  );

  const open = useCallback((content: ReactNode, variant: BentoOverlayVariant, key = "overlay") => {
    play("press");
    setState({ content, variant, key });
  }, []);

  const openSlug = useCallback(
    (slug: string) => {
      const entry = registry?.[slug];
      if (isMobileRef.current && entry?.route) {
        router.push(entry.route);
        return;
      }
      const next = buildFromSlug(slug);
      if (!next) return;
      play(registry?.[slug]?.sound ?? "press");
      const url = new URL(window.location.href);
      url.searchParams.set(URL_PARAM, slug);
      window.history.pushState({}, "", url);
      setState(next);
    },
    [buildFromSlug, registry, router]
  );

  // Keep overlay state in sync with the URL so the back button closes an
  // overlay (and forward reopens it) instead of leaving the page behind.
  const syncFromUrl = useCallback(() => {
    const slug = slugFromLocation();
    setState(slug ? buildFromSlug(slug) : null);
  }, [buildFromSlug]);

  useEffect(() => {
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [syncFromUrl]);

  // Deep link: open whatever the URL points at on first load, once. A
  // shared `?p=cove` link opened on mobile redirects to the real route
  // for the same reason openSlug does — same rule, same place it applies.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const slug = slugFromLocation();
    if (!slug) return;
    const entry = registry?.[slug];
    if (isMobileRef.current && entry?.route) {
      router.replace(entry.route);
      return;
    }
    // Reading the URL is exactly the "subscribe to an external system" case:
    // the address bar is the source of truth on first paint, and it can't be
    // known during render without breaking SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFromUrl();
  }, [syncFromUrl, registry, router]);

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
    <Ctx.Provider value={{ open, openSlug, close }}>
      {children}
      {/* Its own separate portal, not a descendant of the backdrop/panel
          tree below — Framer Motion sets transform/will-change inline on
          animated elements even for an opacity-only animation, and any
          transformed ancestor turns a fixed-positioned descendant into one
          that's fixed relative to *that ancestor* instead of the real
          viewport. Being a fully independent sibling under document.body
          sidesteps that regardless of which ancestor in the other tree
          ends up tainted. */}
      {mounted && state?.sidePanel && createPortal(state.sidePanel, document.body)}
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
                  initial={{ opacity: 0, scale: 0.96, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.97, y: 12, filter: "blur(4px)", transition: { duration: 0.18, ease: "easeIn" } }}
                  transition={panelSpring}
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
          background: #f4f4f5;
          border-radius: 4px;
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
        /* Same shell as .card, just noticeably roomier — for the 3 case
           studies, whose 16:9 screenshots and mockups read as cramped at
           the 880px width used by archive projects and writing. Owns its
           own centered width regardless of whether an entry also has a
           sidePanel — the content shell staying centered is the priority,
           not fitting a legend in beside it at every width. The sidePanel
           (case studies' section legend) is fixed-positioned on its own
           and doesn't participate in this box's layout at all. */
        .bento-overlay-shell.wide {
          background: #f4f4f5;
          border-radius: 4px;
          box-shadow: 0 40px 90px -20px rgba(0,0,0,0.35), 0 10px 30px -10px rgba(0,0,0,0.2);
          max-width: 1320px;
          width: min(92vw, 1320px);
          overflow: hidden;
        }
        .bento-overlay-shell.wide .bento-overlay-scroll {
          max-height: min(90vh, 900px);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .bento-overlay-shell.wide .bento-overlay-scroll::-webkit-scrollbar {
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
          border-radius: 4px;
          box-shadow: 0 30px 70px -15px rgba(0,0,0,0.4);
        }
        @media (max-width: 640px) {
          .bento-overlay-backdrop { padding: 16px; }
          .bento-overlay-shell.card { width: 94vw; }
          .bento-overlay-shell.wide { width: 94vw; }
        }
      `}</style>
    </Ctx.Provider>
  );
}
