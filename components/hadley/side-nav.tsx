"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const out = { duration: 0.42, ease: [0.16, 1, 0.3, 1] } as const;

const tones = {
  light: {
    panel: "bg-white text-[#13181b]",
    item: "text-[#13181b]/50 hover:text-[#13181b]",
    on: "text-[#13181b]",
    active: "bg-[#13181b]/[0.07]",
    muted: "text-[#13181b]/40 hover:text-[#13181b] hover:bg-[#13181b]/[0.05]",
    hover: "bg-[#13181b]/[0.035]",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
  },
  dark: {
    panel: "bg-[#13181b] text-white",
    item: "text-white/55 hover:text-white",
    on: "text-white",
    active: "bg-white/[0.09]",
    muted: "text-white/45 hover:text-white hover:bg-white/[0.08]",
    hover: "bg-white/[0.05]",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
  },
};

type Item = { label: string; icon: React.ReactNode; href?: string };

type SideNavProps = {
  title?: string;
  items: Item[];
  active?: string;
  defaultActive?: string;
  onNavigate?: (label: string) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Pixel size labels dither at as they fold. 0 turns the effect off. */
  grain?: number;
  tone?: "light" | "dark";
  stroke?: boolean;
  radius?: number;
  className?: string;
};

const OPEN = 216;
const SHUT = 60;
/** Row height and row pitch, in px. */
const ROW = 36;
const STEP = 38;
/** Dither timing, in ms. Folding keeps ahead of the closing frame; building waits for it to open. */
const OUT = 260;
const IN = 320;
const IN_DELAY = 110;
/** Tag colors: Figma's palette, softened a little, deep enough for white text. Each hover draws one at random. */
const TAGS = ["#3aa97f", "#3a9ad0", "#df5d3d", "#e8735f", "#d9a531", "#9168d6"];

/** A rounded rectangle, drawn clockwise, as SVG path data. */
function roundRect(x: number, y: number, w: number, h: number, r: number) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + k},${y}H${x + w - k}A${k},${k} 0 0 1 ${x + w},${y + k}V${y + h - k}A${k},${k} 0 0 1 ${x + w - k},${y + h}H${x + k}A${k},${k} 0 0 1 ${x},${y + h - k}V${y + k}A${k},${k} 0 0 1 ${x + k},${y}Z`;
}

/**
 * The collapsed hover as one vector shape: the icon's plate, the name tag, and a neck between them
 * that pinches thin in the middle and flares into both ends, a hyperboloid. `p` is how far the tag
 * has poured out of the plate, 0 to 1.
 */
function liquid(y: number, p: number, tagW: number) {
  const plate = roundRect(0, y, 40, ROW, 10);
  const left = 40 + 18 * p;
  const w = tagW * Math.max(0, p);
  if (w < 2) return plate;
  const tag = roundRect(left, y + 6, w, 24, 6);
  const gap = left - 40;
  if (gap < 1) return plate + tag;
  const cy = y + ROW / 2;
  // A fine liquid thread. Each end meets its shape's flat edge like a fillet, running along the
  // edge before it turns out, then the thread thins to a hairline waist and flares into the other.
  const x0 = 39.5;
  const x1 = left + 0.5;
  const xm = (x0 + x1) / 2;
  const d = xm - x0;
  const a = 5.5; // half-height where it leaves the square
  const b = 4; // half-height where it meets the pill
  const n = 1.1; // half-height at the waist
  const neck =
    `M${x0},${cy - a}C${x0 + d * 0.12},${cy - n} ${xm - d * 0.55},${cy - n} ${xm},${cy - n}` +
    `C${xm + d * 0.55},${cy - n} ${x1 - d * 0.12},${cy - n} ${x1},${cy - b}V${cy + b}` +
    `C${x1 - d * 0.12},${cy + n} ${xm + d * 0.55},${cy + n} ${xm},${cy + n}` +
    `C${xm - d * 0.55},${cy + n} ${x0 + d * 0.12},${cy + n} ${x0},${cy + a}Z`;
  return plate + neck + tag;
}
// Kept outside the component: only ever called from pointer and focus handlers.
const rand = () => Math.random();

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

type Flight = {
  word: HTMLElement;
  /** The mask, painted each frame */
  mask: HTMLCanvasElement;
  /** When in the sweep each cell switches */
  th: Float32Array;
  cols: number;
  /** 1 dithers out, -1 dithers in */
  dir: 1 | -1;
  t0: number;
  dur: number;
  done?: () => void;
  landed?: boolean;
};

/**
 * Collapses to icons without anything losing its place: icons sit on a fixed
 * column and the width eases. Labels don't fade, they dither: the real text is
 * shown through an ordered-dither mask, so folding thins each word out from its
 * last letter back toward its icon, and opening dithers it in from the icon
 * outward, in its own font from the first pixel to the last. Collapsed, hovering
 * an icon dithers its name into a tooltip. Press [ to toggle.
 */
export function SideNav({
  title = "Workspace",
  items,
  active,
  defaultActive,
  onNavigate,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  grain = 2,
  tone = "light",
  stroke = false,
  radius = 20,
  className = "",
}: SideNavProps) {
  const t = tones[tone];
  const [innerShut, setInnerShut] = useState(defaultCollapsed);
  const shut = collapsed ?? innerShut;
  const [innerActive, setInnerActive] = useState(defaultActive ?? items[0]?.label);
  const current = active ?? innerActive;
  const [tip, setTip] = useState<string | null>(null);
  const [tag, setTag] = useState(0);

  /** Show a row's name in the tag, in a fresh color: never the same one twice in a row. */
  function name(label: string) {
    if (label === tip) return;
    setTip(label);
    setTag((c) => (c + 1 + Math.floor(rand() * (TAGS.length - 1))) % TAGS.length);
  }
  const nav = useRef<HTMLElement>(null);
  const flights = useRef<Flight[]>([]);
  const loop = useRef({ frame: 0, running: false });
  const was = useRef(shut);
  const pixels = grain > 0;

  function setShut(next: boolean) {
    setInnerShut(next);
    onCollapsedChange?.(next);
    setTip(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if (e.key === "[" && !typing && !e.metaKey && !e.ctrlKey) setShut(!shut);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /** A dither mask for a word: a cell per grain, each with its moment in the sweep. */
  function prepare(word: HTMLElement, dir: 1 | -1, delay: number, dur: number): Flight | null {
    const S = grain;
    const w = word.offsetWidth + 2;
    const h = word.offsetHeight;
    if (!w || !h) return null;
    const cols = Math.ceil(w / S);
    const rows = Math.ceil(h / S);
    const mask = document.createElement("canvas");
    // Drawn at device resolution, so the cells are hard-edged at any zoom.
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    mask.width = Math.round(cols * S * dpr);
    mask.height = Math.round(rows * S * dpr);
    const th = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Leaving sweeps from the far end toward the icon; arriving, from the icon outward.
        const along = dir > 0 ? 1 - x / cols : x / cols;
        th[y * cols + x] = 0.55 * (BAYER[(y % 4) * 4 + (x % 4)] / 16) + 0.45 * along;
      }
    }
    word.style.maskSize = `${cols * S}px ${rows * S}px`;
    word.style.maskRepeat = "no-repeat";
    word.style.setProperty("-webkit-mask-size", `${cols * S}px ${rows * S}px`);
    word.style.setProperty("-webkit-mask-repeat", "no-repeat");
    return { word, mask, th, cols, dir, t0: performance.now() + delay, dur };
  }

  function paint(f: Flight, p: number) {
    const ctx = f.mask.getContext("2d")!;
    const cell = f.mask.width / f.cols;
    ctx.clearRect(0, 0, f.mask.width, f.mask.height);
    ctx.fillStyle = "#000";
    for (let i = 0; i < f.th.length; i++) {
      const on = f.dir > 0 ? f.th[i] >= p : p >= 0 && f.th[i] < p;
      if (on) ctx.fillRect(Math.round((i % f.cols) * cell), Math.round(Math.floor(i / f.cols) * cell), Math.ceil(cell), Math.ceil(cell));
    }
    const url = `url(${f.mask.toDataURL()})`;
    f.word.style.maskImage = url;
    f.word.style.setProperty("-webkit-mask-image", url);
  }

  function release(word: HTMLElement) {
    for (const k of ["mask-image", "-webkit-mask-image", "mask-size", "-webkit-mask-size", "mask-repeat", "-webkit-mask-repeat"]) word.style.removeProperty(k);
  }

  function frame(now: number) {
    let live = false;
    for (const f of flights.current) {
      if (f.landed) continue;
      const p = (now - f.t0) / f.dur;
      paint(f, p);
      if (p >= 1) {
        f.landed = true;
        f.done?.();
      } else live = true;
    }
    if (live) loop.current.frame = requestAnimationFrame(frame);
    else {
      loop.current.running = false;
      flights.current = [];
    }
  }

  function launch(next: Flight[]) {
    // Paint the first frame now, before the browser does, so nothing flashes.
    next.forEach((f) => paint(f, f.dir > 0 ? 0 : -1));
    flights.current = [...flights.current.filter((f) => !f.landed), ...next];
    if (loop.current.running) return;
    loop.current.running = true;
    loop.current.frame = requestAnimationFrame(frame);
  }

  /** Cut anything mid-dither short, so a quick re-toggle starts clean. */
  function settle() {
    for (const f of flights.current) {
      if (f.landed) continue;
      f.landed = true;
      f.done?.();
    }
  }

  useEffect(() => {
    const l = loop.current;
    return () => {
      cancelAnimationFrame(l.frame);
      l.running = false;
    };
  }, []);

  // Fold or unfold: every label dithers out ahead of the frame, or in behind it.
  useLayoutEffect(() => {
    if (was.current === shut) return;
    was.current = shut;
    const el = nav.current;
    if (!pixels || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    settle();
    const dir = shut ? 1 : -1;
    const next: Flight[] = [];
    el.querySelectorAll<HTMLElement>("[data-fold]").forEach((word, i) => {
      // A small top-to-bottom stagger, so the column reads as one sweep.
      const f = dir > 0 ? prepare(word, 1, i * 10, OUT) : prepare(word, -1, IN_DELAY + i * 14, IN);
      if (!f) return;
      // The word stays itself the whole way; only the mask changes.
      word.style.opacity = "1";
      f.done = () => {
        release(word);
        word.style.opacity = dir > 0 ? "0" : "1";
      };
      next.push(f);
    });
    launch(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shut]);

  // Collapsed, a hovered icon dithers its name into the tooltip.
  useLayoutEffect(() => {
    const el = nav.current;
    if (!tip || !shut || !pixels || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const word = el.querySelector<HTMLElement>("[data-tip-text]");
    if (!word) return;
    const f = prepare(word, -1, 40, 220);
    if (!f) return;
    f.done = () => release(word);
    launch([f]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip]);

  const quiet = shut ? 0 : 1;

  // Rows are 36px with 2px between, so a row's top is its index times 38.
  const index = Math.max(0, items.findIndex((item) => item.label === current));
  const pillTop = useMotionValue(index * STEP);
  const pillBottom = useMotionValue(index * STEP + ROW);
  const pillH = useTransform(() => pillBottom.get() - pillTop.get());
  const hoverY = useMotionValue(index * STEP);
  const tipY = useTransform(hoverY, (y) => y + (ROW - 24) / 2);
  const [hovered, setHovered] = useState<number | null>(null);
  const fresh = useRef(true);

  // Collapsed hover: the icon's plate and the name tag are one liquid shape. A goo filter
  // (blur, then a hard alpha threshold) melts the plate, a thin neck and the tag together,
  // so the neck pinches in like a hyperboloid wherever they meet.
  const pouring = shut && hovered !== null && tip !== null;
  const tagX = useMotionValue(-44);
  const tagW = useMotionValue(0);
  // How far the tag has poured out, 0 to 1 (a touch past 1 as it settles).
  const poured = useTransform(tagX, (x) => 1 + x / 44);
  const shape = useTransform(() => liquid(hoverY.get(), poured.get(), tagW.get()));
  // The text rides its own values: when it mounts, it can't stop the pour that's driving it.
  const textX = useTransform(poured, (p) => (p - 1) * 18);
  const textOpacity = useTransform(poured, [0.55, 0.9], [0, 1]);
  const tagText = useRef<HTMLSpanElement>(null);

  // The tag pours out from under the plate, and draws back into it when you leave.
  useEffect(() => {
    if (pouring) {
      // Pour from under the plate if it was tucked away; otherwise just settle where it is.
      const from = tagX.get() <= -40 ? -44 : tagX.get();
      const c = animate(tagX, [from, 0], { type: "spring", visualDuration: 0.38, bounce: 0.18 });
      return () => c.stop();
    }
    const c = animate(tagX, -44, { duration: 0.18, ease: [0.4, 0, 1, 1] });
    return () => c.stop();
  }, [pouring, tagX]);

  // The tag's width follows its name, gliding between rows.
  useLayoutEffect(() => {
    const el = tagText.current;
    if (!el) return;
    if (tagW.get() === 0) tagW.jump(el.offsetWidth);
    else animate(tagW, el.offsetWidth, { duration: 0.2, ease: [0.2, 0, 0, 1] });
  }, [tip, tagW]);

  // The current plate stretches toward where it's going, then gathers itself in.
  useEffect(() => {
    const to = index * STEP;
    const down = to > pillTop.get();
    const lead = { type: "spring", stiffness: 900, damping: 55 } as const;
    const trail = { type: "spring", stiffness: 260, damping: 30 } as const;
    const a = animate(pillTop, to, down ? trail : lead);
    const b = animate(pillBottom, to + ROW, down ? lead : trail);
    return () => {
      a.stop();
      b.stop();
    };
  }, [index, pillTop, pillBottom]);

  // The hover plate jumps to the first row you touch, then glides between rows.
  useEffect(() => {
    if (hovered === null) {
      fresh.current = true;
      return;
    }
    if (fresh.current) {
      fresh.current = false;
      hoverY.jump(hovered * STEP);
      return;
    }
    const c = animate(hoverY, hovered * STEP, { type: "spring", visualDuration: 0.2, bounce: 0 });
    return () => c.stop();
  }, [hovered, hoverY]);

  return (
    <motion.nav
      ref={nav}
      aria-label={title}
      initial={false}
      animate={{ width: shut ? SHUT : OPEN }}
      transition={out}
      style={{ borderRadius: radius }}
      className={`relative flex flex-col p-2.5 text-[13px] ${t.panel} ${stroke ? t.stroke : ""} ${className}`}
    >
      <ul
        className="relative flex flex-col gap-0.5"
        onPointerLeave={() => {
          setHovered(null);
          setTip(null);
        }}
      >
        {/* Hover: a faint plate that follows the cursor from row to row. */}
        <motion.span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 rounded-[10px] ${t.hover}`}
          style={{ y: hoverY, height: ROW }}
          initial={false}
          animate={{ opacity: !shut && hovered !== null && hovered !== index ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
        {/* Current: travels with a stretch, its leading edge first and the trailing edge catching up. */}
        <motion.span aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 rounded-[10px] ${t.active}`} style={{ y: pillTop, height: pillH }} />

        {/* The liquid: plate, neck and tag as one smooth vector shape. Text and icons sit above it. */}
        <motion.svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-[280px] overflow-visible"
          initial={false}
          animate={{ opacity: pouring ? 1 : 0 }}
          transition={{ duration: pouring ? 0.1 : 0.2 }}
        >
          <motion.path d={shape} fill={TAGS[tag]} className="transition-[fill] duration-200" />
        </motion.svg>

        {items.map((item, i) => {
          const on = item.label === current;
          const lit = shut && hovered === i && tip !== null;
          return (
            <li key={item.label} className="relative">
              <a
                href={item.href ?? "#"}
                aria-current={on ? "page" : undefined}
                aria-label={shut ? item.label : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (!on) {
                    // The icon gives under your click as the plate arrives.
                    e.currentTarget.querySelector("[data-fold-icon]")?.animate([{ transform: "scale(1)" }, { transform: "scale(0.82)" }, { transform: "scale(1)" }], {
                      duration: 320,
                      easing: "cubic-bezier(0.34, 1.45, 0.5, 1)",
                    });
                  }
                  setInnerActive(item.label);
                  onNavigate?.(item.label);
                }}
                onPointerEnter={() => {
                  setHovered(i);
                  if (shut) name(item.label);
                }}
                onFocus={() => {
                  setHovered(i);
                  if (shut) name(item.label);
                }}
                onBlur={() => {
                  setHovered(null);
                  setTip(null);
                }}
                className={`relative flex h-9 items-center gap-3 overflow-hidden rounded-[10px] pl-[11px] outline-none transition-colors duration-150 focus-visible:shadow-[inset_0_0_0_1.5px_currentColor] ${lit ? "text-white" : on ? t.on : t.item}`}
              >
                <span data-fold-icon={item.label} className="relative grid size-4 shrink-0 place-items-center">
                  {item.icon}
                </span>
                <Label show={!shut} pixels={pixels} fold={item.label} initial={quiet}>
                  {item.label}
                </Label>
              </a>
            </li>
          );
        })}

        {/* Collapsed: one tag that glides beside whichever icon you're on, and dithers in each name. */}
        <AnimatePresence>
          {shut && tip && (
            <motion.span
              key="tip"
              ref={tagText}
              aria-hidden
              className="pointer-events-none absolute left-full top-0 z-10 ml-[18px] flex h-6 items-center whitespace-nowrap px-2 text-[12px] text-white"
              style={{ y: tipY, x: textX, opacity: textOpacity }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
            >
              <span data-tip-text key={tip}>
                {tip}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </ul>

      <button
        type="button"
        onClick={() => setShut(!shut)}
        aria-label={shut ? "Expand sidebar" : "Collapse sidebar"}
        aria-keyshortcuts="["
        className={`mt-2 flex h-9 items-center gap-3 overflow-hidden rounded-[10px] pl-[11px] outline-none transition-colors ${t.muted}`}
      >
        <motion.svg
          data-fold-icon="__collapse"
          viewBox="0 0 16 16"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: shut ? 180 : 0 }}
          transition={out}
          aria-hidden
        >
          <rect x="2" y="2.5" width="12" height="11" rx="2.5" />
          <path d="M6 2.5v11M10.5 6.5 9 8l1.5 1.5" />
        </motion.svg>
        <Label show={!shut} pixels={pixels} fold="__collapse" initial={quiet}>
          Collapse
        </Label>
      </button>

    </motion.nav>
  );
}

/**
 * A label that hides instantly and lets its pixels do the moving, or — with
 * pixels off — fades and blurs out on its own.
 */
function Label({ show, pixels, fold, initial, children }: { show: boolean; pixels: boolean; fold: string; initial: number; children: React.ReactNode }) {
  if (pixels)
    return (
      <span data-fold={fold} className="relative whitespace-nowrap" style={{ opacity: initial, pointerEvents: show ? "auto" : "none" }} aria-hidden={!show}>
        {children}
      </span>
    );
  return (
    <motion.span
      className="relative whitespace-nowrap"
      style={{ pointerEvents: show ? "auto" : "none" }}
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -4, filter: show ? "blur(0px)" : "blur(2px)" }}
      transition={{ duration: show ? 0.3 : 0.14, delay: show ? 0.08 : 0, ease: [0.2, 0, 0, 1] }}
      aria-hidden={!show}
    >
      {children}
    </motion.span>
  );
}
