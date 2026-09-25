"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sounds";

export type BentoOverlayVariant = "bare" | "card" | "wide";

/** A piece of content that is addressable by slug — case studies, archive
 *  projects, writing posts. These get a URL so they stay linkable and
 *  shareable even though the site is a single page. Ephemeral things
 *  (dome posters, experience cards) use `open()` instead and leave the
 *  URL alone. */
export interface OverlayEntry {
  variant: BentoOverlayVariant;
  /** Cue played on open. Defaults to "open"; reading material uses "flip". */
  sound?: "open" | "flip";
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
   *  region entirely. Takes the live fullscreen flag so the panel can
   *  reposition itself when the shell goes fullscreen. */
  sidePanel?: (ctx: { fullscreen: boolean }) => ReactNode;
}

export type OverlayRegistry = Record<string, OverlayEntry>;

interface OverlayState {
  content: ReactNode;
  variant: BentoOverlayVariant;
  key: string;
  /** Kept as the factory, not a precomputed node — it needs to re-render
   *  with the current fullscreen flag, which changes after this state is
   *  built. */
  sidePanel?: (ctx: { fullscreen: boolean }) => ReactNode;
  /** Set when this overlay was opened by clicking a visible Selected Work
   *  thumbnail — the thumbnail flies up into the case study's hero instead
   *  of the panel doing its own entrance. */
  morphSlug?: string;
}

interface BentoOverlayCtx {
  /** Open ephemeral content that doesn't belong in the URL. */
  open: (content: ReactNode, variant: BentoOverlayVariant, key?: string) => void;
  /** Open registered content by slug, reflecting it in the URL. */
  openSlug: (slug: string, opts?: { morph?: boolean }) => void;
  close: () => void;
  morphSlug: string | null;
}

const Ctx = createContext<BentoOverlayCtx | null>(null);

/** Safe outside a provider — the case study content components also render
 *  as standalone pages (/cove, /no2, ...) where there's no overlay at all. */
export function useOverlayMorphSlug(): string | null {
  return useContext(Ctx)?.morphSlug ?? null;
}

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

/** Close (and, for card/wide content, fullscreen-toggle) controls — fixed to
 *  the real viewport corner rather than living inside the panel's own
 *  scrolling content. Every previous per-content close affordance (the
 *  archive's sticky back arrow, a case study's bottom-of-page link) only
 *  became reachable after scrolling, or — on a phone tall enough that the
 *  centered panel's top edge landed above the viewport — was clipped off
 *  entirely. This is the one close control guaranteed to always be on
 *  screen, regardless of scroll position or content height.
 *
 *  Rendered as its own portal sibling (see the comment on the sidePanel
 *  portal below) so Framer's inline transform on the backdrop/panel can't
 *  turn `position: fixed` here into "fixed relative to that ancestor"
 *  instead of the viewport. */
function OverlayChrome({
  close,
  fullscreen,
  onToggleFullscreen,
  showFullscreenToggle,
}: {
  close: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  showFullscreenToggle: boolean;
}) {
  return (
    <div className="bento-overlay-chrome">
      {showFullscreenToggle && (
        <button
          type="button"
          className="bento-chrome-btn bento-chrome-btn--fullscreen"
          onClick={() => {
            sfx.toggle();
            onToggleFullscreen();
          }}
          aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
        >
          {fullscreen ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M9 6H13M13 6V2M13 6L9.5 2.5M6 9H2M2 9V13M2 9L5.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M9.5 2H13V5.5M5.5 13H2V9.5M13 2L8.5 6.5M2 13L6.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      )}
      <button type="button" className="bento-chrome-btn" onClick={close} aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2.5 2.5L12.5 12.5M12.5 2.5L2.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <style>{`
        .bento-overlay-chrome {
          position: fixed;
          top: calc(env(safe-area-inset-top, 0px) + 16px);
          right: calc(env(safe-area-inset-right, 0px) + 16px);
          z-index: 310;
          display: flex;
          gap: 8px;
        }
        .bento-chrome-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.92);
          color: #6B7280;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .bento-chrome-btn:hover { color: #13181B; transform: scale(1.05); }
        @media (max-width: 700px) {
          .bento-chrome-btn--fullscreen { display: none; }
        }
      `}</style>
    </div>
  );
}

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
  // Remembers *which* overlay was made fullscreen rather than a bare flag, so
  // the next thing opened always starts at its normal size — fullscreen is a
  // per-viewing choice, not a mode that carries over.
  const [fullscreenKey, setFullscreenKey] = useState<string | null>(null);
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
    sfx.close();
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
        sidePanel: entry.sidePanel,
      };
    },
    [registry, close]
  );

  const open = useCallback((content: ReactNode, variant: BentoOverlayVariant, key = "overlay") => {
    sfx.lift();
    setState({ content, variant, key });
  }, []);

  const openSlug = useCallback(
    (slug: string, opts?: { morph?: boolean }) => {
      const entry = registry?.[slug];
      if (isMobileRef.current && entry?.route) {
        router.push(entry.route);
        return;
      }
      const next = buildFromSlug(slug);
      if (!next) return;
      sfx[registry?.[slug]?.sound ?? "open"]();
      const url = new URL(window.location.href);
      url.searchParams.set(URL_PARAM, slug);
      window.history.pushState({}, "", url);
      setState(opts?.morph ? { ...next, morphSlug: slug } : next);
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

  const fullscreen = !!state && fullscreenKey === state.key;

  return (
    <Ctx.Provider value={{ open, openSlug, close, morphSlug: state?.morphSlug ?? null }}>
      {children}
      {/* Its own separate portal, not a descendant of the backdrop/panel
          tree below — Framer Motion sets transform/will-change inline on
          animated elements even for an opacity-only animation, and any
          transformed ancestor turns a fixed-positioned descendant into one
          that's fixed relative to *that ancestor* instead of the real
          viewport. Being a fully independent sibling under document.body
          sidesteps that regardless of which ancestor in the other tree
          ends up tainted. */}
      {mounted && state?.sidePanel && createPortal(state.sidePanel({ fullscreen }), document.body)}
      {mounted && state &&
        createPortal(
          <OverlayChrome
            close={close}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreenKey((k) => (k === state.key ? null : state.key))}
            showFullscreenToggle={state.variant !== "bare"}
          />,
          document.body
        )}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {state && (
              <motion.div
                // Morph and non-morph opens of the same slug get different
                // keys: reopening a slug while its previous instance is still
                // playing its exit would otherwise revive that instance, stale
                // morph state and all, instead of mounting a fresh one.
                key={state.morphSlug ? `${state.key}-morph` : state.key}
                className={`bento-overlay-backdrop${fullscreen ? " is-fullscreen" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={close}
              >
                <motion.div
                  className="bento-overlay-panel"
                  // A morph open skips the panel's own scale/slide entrance:
                  // the thumbnail flying into the hero *is* the entrance, and
                  // an ancestor mid-transform would also throw off where
                  // Framer measures the hero's landing spot.
                  initial={state.morphSlug ? false : { opacity: 0, scale: 0.96, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.97, y: 12, filter: "blur(4px)", transition: { duration: 0.18, ease: "easeIn" } }}
                  transition={panelSpring}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bento-overlay-shell ${state.variant}${fullscreen ? " is-fullscreen" : ""}${state.morphSlug ? " is-morphing" : ""}`}>
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

        /* Morph open: the panel itself doesn't animate (see the panel's
           initial prop), so its surface fades in here instead — the flying
           thumbnail stays the one thing moving. */
        .bento-overlay-shell.is-morphing {
          animation: bento-shell-surface-in 0.4s ease-out both;
        }
        @keyframes bento-shell-surface-in {
          from { background-color: rgba(244,244,245,0); box-shadow: none; }
        }

        /* Fullscreen toggle (desktop) — the shell grows to fill the
           viewport instead of floating as a centered card. Two classes
           beat .card/.wide's own single-class width rules on specificity,
           so no !important is needed to override them. */
        .bento-overlay-backdrop.is-fullscreen { padding: 0; }
        .bento-overlay-shell.card.is-fullscreen,
        .bento-overlay-shell.wide.is-fullscreen {
          width: 100vw;
          height: 100dvh;
          max-width: 100vw;
          max-height: 100dvh;
          border-radius: 0;
        }
        .bento-overlay-shell.card.is-fullscreen .bento-overlay-scroll,
        .bento-overlay-shell.wide.is-fullscreen .bento-overlay-scroll {
          max-height: 100dvh;
          height: 100%;
        }

        @media (max-width: 640px) {
          /* Mobile gets one full-bleed sheet, always — not a scaled-down
             version of the desktop floating card. That centered card used
             to size itself off vh, and on a phone tall enough (or with
             the browser chrome expanded) that math could push the card's
             top edge above the actual visible viewport, clipping whatever
             sat at the top of its content — which is exactly what read as
             "the close button gets cut off." A full-bleed sheet has no top
             edge to clip in the first place, and dvh (rather than vh)
             tracks the browser's actual visible area as its chrome
             shows/hides, instead of the taller value vh uses. */
          .bento-overlay-backdrop { padding: 0; align-items: stretch; }
          .bento-overlay-shell.card,
          .bento-overlay-shell.wide {
            width: 100vw;
            height: 100dvh;
            max-width: 100vw;
            max-height: 100dvh;
            border-radius: 0;
          }
          .bento-overlay-shell.card .bento-overlay-scroll,
          .bento-overlay-shell.wide .bento-overlay-scroll {
            max-height: 100dvh;
            height: 100%;
          }
        }
      `}</style>
    </Ctx.Provider>
  );
}
