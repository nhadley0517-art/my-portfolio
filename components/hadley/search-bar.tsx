"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

const out = { duration: 0.36, ease: [0.16, 1, 0.3, 1] } as const;
const ui = { duration: 0.16, ease: [0.2, 0, 0, 1] } as const;
const ROW = 40;

const tones = {
  light: {
    box: "bg-white text-[#13181b]",
    muted: "text-[#13181b]/40",
    faint: "text-[#13181b]/30",
    active: "bg-[#13181b]/[0.05]",
    kbd: "bg-[#13181b]/[0.06] text-[#13181b]/50",
    placeholder: "placeholder:text-[#13181b]/35",
    rule: "bg-[#13181b]/[0.06]",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
  },
  dark: {
    box: "bg-[#13181b] text-white",
    muted: "text-white/45",
    faint: "text-white/30",
    active: "bg-white/[0.08]",
    kbd: "bg-white/[0.1] text-white/55",
    placeholder: "placeholder:text-white/35",
    rule: "bg-white/[0.08]",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
  },
};

type Item = { label: string; hint?: string };

type SearchBarProps = {
  items: Item[];
  placeholder?: string;
  onSelect?: (item: Item) => void;
  /** Max results shown. */
  limit?: number;
  /** Controlled query. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Keep the results open without focus. */
  open?: boolean;
  /** Results that stop matching break into pixels of this size. 0 turns it off. */
  grain?: number;
  tone?: "light" | "dark";
  stroke?: boolean;
  className?: string;
};

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** How long a row takes to dither out, or back in. */
const DITHER = 300;

type Bit = { ox: number; oy: number; a: number; rgb: string; /** When in the sweep this pixel switches */ th: number };
type Ghost = { bits: Bit[]; mode: "out" | "in"; t0: number; x: number; y: number };

/**
 * One surface that grows into its results. Results that stop matching dither
 * out where they stand, a left-to-right sweep of switching pixels, so nothing
 * moves across what you're reading; backspace dithers them back in. ⌘K focuses,
 * arrows move, Tab completes, Enter picks.
 */
export function SearchBar({
  items,
  placeholder = "Search",
  onSelect,
  limit = 5,
  value,
  onValueChange,
  open: openProp,
  grain = 2,
  tone = "light",
  stroke = false,
  className = "",
}: SearchBarProps) {
  const t = tones[tone];
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState("");
  const query = value ?? inner;
  // What the list shows lags the query by one layout pass, so leaving rows can be painted into dust.
  const [sifted, setSifted] = useState(query);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [mac, setMac] = useState(true);
  const [forming, setForming] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const ghosts = useRef(new Map<string, Ghost>());
  const loop = useRef({ frame: 0, running: false });
  const returning = useRef<string[]>([]);

  const results = useMemo(
    () =>
      items
        .map((item) => ({ item, hits: match(item.label, sifted) }))
        .filter((r) => r.hits)
        .slice(0, limit) as { item: Item; hits: number[] }[],
    [items, sifted, limit],
  );
  const open = openProp ?? focused;
  const cursor = Math.min(active, Math.max(0, results.length - 1));
  // Inline completion when the top result starts with what you typed.
  const top = results[0]?.item.label ?? "";
  const ghost = query && top.toLowerCase().startsWith(query.toLowerCase()) ? top.slice(query.length) : "";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function relative() {
    const el = root.current!;
    const base = el.getBoundingClientRect();
    return { base, scale: base.width / el.offsetWidth || 1 };
  }

  /** Paint a row into pixels, and switch them off in an ordered sweep. */
  function crumble(label: string) {
    const row = rows.current.get(label);
    if (!row || !root.current || grain <= 0) return;
    const { base, scale } = relative();
    const r = row.getBoundingClientRect();
    const w = Math.ceil(r.width / scale);
    const h = Math.ceil(r.height / scale);
    if (!w || !h) return;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d", { willReadFrequently: true })!;
    const colors: string[] = [];
    // Each letter in its own color, so the marked letters stay darker as they go.
    row.querySelectorAll<HTMLElement>("[data-ch], [data-hint]").forEach((part) => {
      const pr = part.getBoundingClientRect();
      const cs = getComputedStyle(part);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.textBaseline = "middle";
      const n = colors.indexOf(cs.color) >= 0 ? colors.indexOf(cs.color) : colors.push(cs.color) - 1;
      // Which color, coded in the red channel; alpha carries the glyph's coverage.
      ctx.fillStyle = `rgb(${n * 40},0,0)`;
      ctx.fillText(part.textContent ?? "", (pr.left - r.left) / scale, (pr.top - r.top) / scale + pr.height / scale / 2);
    });
    const data = ctx.getImageData(0, 0, w, h).data;
    const rgb = colors.map((c) => {
      const v = c.match(/[\d.]+/g)?.map(Number) ?? [19, 24, 27, 1];
      return { rgb: `${v[0]},${v[1]},${v[2]}`, a: v.length > 3 ? v[3] : 1 };
    });
    const S = grain;
    const bits: Bit[] = [];
    for (let y = 0, gy = 0; y < h; y += S, gy++) {
      for (let x = 0, gx = 0; x < w; x += S, gx++) {
        const i = (Math.min(h - 1, Math.floor(y + S / 2)) * w + Math.min(w - 1, Math.floor(x + S / 2))) * 4;
        const a = data[i + 3] / 255;
        if (a < 0.3) continue;
        const c = rgb[Math.round(data[i] / 40)] ?? rgb[0];
        // An ordered dither riding a left-to-right sweep: the word thins out evenly, then goes.
        const th = 0.55 * (BAYER[(gy % 4) * 4 + (gx % 4)] / 16) + 0.45 * (x / w);
        bits.push({ ox: x, oy: y, a: Math.min(1, a) * c.a, rgb: c.rgb, th });
      }
    }
    ghosts.current.set(label, { bits, mode: "out", t0: performance.now(), x: (r.left - base.left) / scale, y: (r.top - base.top) / scale });
    kick();
  }

  /** Dither a row back in, from the pixels it left with. */
  function gather(label: string) {
    const g = ghosts.current.get(label);
    if (!g?.bits.length) return false;
    g.mode = "in";
    g.t0 = performance.now();
    kick();
    return true;
  }

  function frame(now: number) {
    const cv = canvas.current;
    const el = root.current;
    if (!cv || !el) {
      loop.current.running = false;
      return;
    }
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const { base, scale } = relative();
    const S = grain;
    let live = false;
    const landed: string[] = [];

    for (const [label, g] of ghosts.current) {
      const p = (now - g.t0) / DITHER;
      if (g.mode === "out" && p >= 1) continue;
      // Follow the row if it's still on the page (it may be sliding into place).
      const row = rows.current.get(label);
      if (row) {
        const r = row.getBoundingClientRect();
        g.x = (r.left - base.left) / scale;
        g.y = (r.top - base.top) / scale;
      }
      for (const b of g.bits) {
        const on = g.mode === "out" ? b.th >= p : b.th < p;
        if (!on) continue;
        ctx.fillStyle = `rgba(${b.rgb},${b.a.toFixed(3)})`;
        ctx.fillRect(Math.round(g.x + b.ox), Math.round(g.y + b.oy), S, S);
      }
      if (g.mode === "in" && p >= 1) landed.push(label);
      else live = true;
    }

    if (landed.length) {
      landed.forEach((l) => ghosts.current.delete(l));
      setForming((f) => f.filter((l) => !landed.includes(l)));
    }
    if (live) loop.current.frame = requestAnimationFrame(frame);
    else {
      loop.current.running = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function kick() {
    if (loop.current.running) return;
    loop.current.running = true;
    loop.current.frame = requestAnimationFrame(frame);
  }

  useEffect(() => {
    const l = loop.current;
    return () => {
      cancelAnimationFrame(l.frame);
      l.running = false;
    };
  }, []);

  // Sift in a layout effect, while the leaving rows are still on the page to be painted.
  useLayoutEffect(() => {
    if (query === sifted) return;
    const now = new Set(results.map((r) => r.item.label));
    const next = items
      .filter((item) => match(item.label, query))
      .slice(0, limit)
      .map((i) => i.label);
    if (open) results.filter((r) => !next.includes(r.item.label)).forEach((r) => crumble(r.item.label));
    const back = next.filter((l) => !now.has(l) && ghosts.current.get(l)?.bits.length);
    if (back.length) {
      returning.current = back;
      setForming((f) => [...f.filter((l) => !back.includes(l)), ...back]);
    }
    setActive(0);
    setSifted(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Rows that just came back call their dust home.
  useLayoutEffect(() => {
    const back = returning.current;
    if (!back.length) return;
    returning.current = [];
    const lost = back.filter((l) => !gather(l));
    if (lost.length) setForming((f) => f.filter((l) => !lost.includes(l)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sifted]);

  function change(next: string) {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  }

  function pick(item: Item) {
    onSelect?.(item);
    change(item.label);
    input.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((cursor + d + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Tab" && ghost) {
      e.preventDefault();
      change(top);
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      pick(results[cursor].item);
    } else if (e.key === "Escape") {
      if (query) change("");
      else input.current?.blur();
    }
  }

  return (
    <motion.div
      ref={root}
      initial={false}
      animate={{ borderRadius: open ? 20 : 24 }}
      transition={out}
      className={`relative w-[360px] max-w-full overflow-hidden text-[13px] ${t.box} ${stroke ? t.stroke : ""} ${className}`}
    >
      <div className="flex h-12 items-center gap-3 px-4">
        <svg viewBox="0 0 16 16" className={`size-4 shrink-0 ${t.muted}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 13.5 13.5" />
        </svg>
        <span className="relative flex min-w-0 flex-1">
          <input
            ref={input}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-activedescendant={open && results[cursor] ? `${id}-o${cursor}` : undefined}
            aria-autocomplete="both"
            value={query}
            placeholder={placeholder}
            onChange={(e) => change(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            className={`min-w-0 flex-1 bg-transparent outline-none ${t.placeholder}`}
          />
          {/* The completion, drawn right after what you typed. */}
          {ghost && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre" aria-hidden>
              <span className="invisible">{query}</span>
              <span className={t.faint}>{ghost}</span>
            </span>
          )}
        </span>
        <span className="relative grid overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.kbd
              key={ghost ? "tab" : focused ? "esc" : "k"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={ui}
              className={`inline-flex h-6 items-center rounded-full px-2 font-mono text-[10.5px] ${t.kbd}`}
            >
              {ghost ? "Tab" : focused ? "Esc" : mac ? "⌘K" : "Ctrl K"}
            </motion.kbd>
          </AnimatePresence>
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={out} className="overflow-hidden">
            <div className={`mx-4 h-px ${t.rule}`} />
            <ul id={`${id}-list`} role="listbox" className="px-1.5 pt-1.5">
              <AnimatePresence initial={false}>
                {results.map(({ item, hits }, i) => (
                  <motion.li
                    key={item.label}
                    ref={(node: HTMLLIElement | null) => {
                      if (node) rows.current.set(item.label, node);
                      else rows.current.delete(item.label);
                    }}
                    id={`${id}-o${i}`}
                    role="option"
                    aria-selected={i === cursor}
                    onPointerMove={() => setActive(i)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      pick(item);
                    }}
                    // Leaving rows vanish at once (their dust takes over), then close the gap.
                    initial={{ height: 0, opacity: forming.includes(item.label) ? 1 : 0 }}
                    animate={{ height: ROW, opacity: 1 }}
                    exit={{ height: 0, opacity: 0, transition: { height: { type: "spring", visualDuration: 0.34, bounce: 0, delay: 0.24 }, opacity: { duration: grain > 0 ? 0 : 0.15 } } }}
                    transition={{ height: { type: "spring", visualDuration: 0.5, bounce: 0.22 }, opacity: { duration: 0.25 } }}
                    className="relative cursor-pointer overflow-hidden"
                  >
                    <span className="absolute inset-x-0 top-0 flex h-10 items-center justify-between gap-3 rounded-[12px] px-3">
                      {i === cursor && (
                        <motion.span
                          layoutId={`${id}-active`}
                          className={`absolute inset-0 rounded-[12px] ${t.active}`}
                          transition={{ type: "spring", visualDuration: 0.22, bounce: 0 }}
                        />
                      )}
                      <span className="relative truncate" style={{ opacity: forming.includes(item.label) ? 0 : 1 }}>
                        {[...item.label].map((c, j) => (
                          <span key={j} data-ch className={hits.includes(j) ? "" : t.muted}>
                            {c}
                          </span>
                        ))}
                      </span>
                      {item.hint && (
                        <span data-hint className={`relative shrink-0 font-mono text-[11px] ${t.faint}`} style={{ opacity: forming.includes(item.label) ? 0 : 1 }}>
                          {item.hint}
                        </span>
                      )}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {results.length === 0 && (
                <li className={`flex h-10 items-center px-3 ${t.muted}`}>
                  No matches for “{sifted}”
                </li>
              )}
            </ul>
            <div className={`flex h-9 items-center justify-between px-4 font-mono text-[10.5px] ${t.faint}`}>
              <span className="flex gap-3">
                <span>↑↓ move</span>
                <span>↵ open</span>
                <span>⇥ complete</span>
              </span>
              <span className="tabular-nums">
                <Roll value={results.length} /> of {items.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {grain > 0 && <canvas ref={canvas} className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]" aria-hidden />}
    </motion.div>
  );
}

/** The count rolls as results come and go. */
function Roll({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Subsequence match: the indexes of each typed character, in order, or null. */
function match(label: string, query: string): number[] | null {
  if (!query) return [];
  const hits: number[] = [];
  const l = label.toLowerCase();
  let from = 0;
  for (const c of query.toLowerCase()) {
    if (c === " ") continue;
    const at = l.indexOf(c, from);
    if (at === -1) return null;
    hits.push(at);
    from = at + 1;
  }
  return hits;
}
