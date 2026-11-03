"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const out: Transition = { duration: 0.38, ease: [0.16, 1, 0.3, 1] };
const SIGNAL = "#e4572e";
const signal = `var(--signal, ${SIGNAL})`;

const tones = {
  light: {
    field: "bg-white text-[#13181b]",
    caret: "caret-[#13181b]",
    placeholder: "placeholder:text-[#13181b]/30",
    muted: "text-[#13181b]/40",
    rgb: "19,24,27",
    post: "bg-[#13181b] text-white",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
  },
  dark: {
    field: "bg-[#13181b] text-white",
    caret: "caret-white",
    placeholder: "placeholder:text-white/30",
    muted: "text-white/40",
    rgb: "255,255,255",
    post: "bg-white text-[#13181b]",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
  },
};

type Phase = "idle" | "sending" | "sent";

type CharacterLimitProps = {
  limit?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Characters left when the count switches to "n left". Defaults to 20% of the limit. */
  warnAt?: number;
  /** Size of one grain of sand, in CSS px. */
  grain?: number;
  /** How hard grains fall, 0.5–2. */
  gravity?: number;
  /** Scales how much sand each letter pours, 0.5–1.5. */
  pour?: number;
  /** A faint dither cloud that rises behind the whole card as you near the limit. */
  cloud?: boolean;
  /** On post, blow the sand toward the button instead of just clearing it. */
  wind?: boolean;
  /** How each new character appears. */
  landing?: "blur" | "none";
  action?: string;
  doneLabel?: string;
  onAction?: (value: string) => void;
  onFocus?: () => void;
  tone?: "light" | "dark";
  stroke?: boolean;
  radius?: number;
  label?: string;
  className?: string;
};

/**
 * A composer that keeps a little landscape of what you wrote. Every letter drops
 * grains of sand into the band right under itself; long words build dunes, spaces
 * leave valleys. Past the limit, new sand turns the signal color and spills, and
 * backspacing under the limit takes it back. Posting blows it all toward the button.
 */
export function CharacterLimit({
  limit = 140,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "What's happening?",
  warnAt,
  grain = 3,
  gravity = 1,
  pour = 1,
  cloud = true,
  wind = true,
  landing = "blur",
  action = "Post",
  doneLabel = "Posted",
  onAction,
  onFocus,
  tone = "light",
  stroke = false,
  radius = 28,
  label = "Post",
  className = "",
}: CharacterLimitProps) {
  const t = tones[tone];
  const id = useId();
  const reduce = !!useReducedMotion();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const chars = useMemo(() => graphemes(text), [text]);
  const left = limit - chars.length;
  const threshold = warnAt ?? Math.max(5, Math.round(limit * 0.2));
  const near = left <= threshold;
  const over = left < 0;
  const [phase, setPhase] = useState<Phase>("idle");
  const [box, shake] = useAnimate<HTMLDivElement>();
  const [button, punch] = useAnimate<HTMLButtonElement>();
  const content = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);

  // Characters present on first render appear quietly; only new ones arrive.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  // Crossing the limit gets one small shake — the moment, not every keystroke after.
  const wasOver = useRef(over);
  useEffect(() => {
    if (over && !wasOver.current && box.current) shake(box.current, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.38 });
    wasOver.current = over;
  }, [over, box, shake]);

  function post() {
    if (phase !== "idle" || over || !text.trim()) return;
    setPhase("sending");
    // The sand blows toward the button; it takes the hit as the gust arrives.
    setTimeout(() => {
      if (button.current) punch(button.current, { scale: [1, 0.9, 1.05, 1] }, { duration: 0.5, ease: [0.34, 1.45, 0.5, 1] });
      navigator.vibrate?.(10);
    }, reduce ? 0 : 480);
    setTimeout(() => {
      onAction?.(text);
      setInner("");
      if (value === undefined) onValueChange?.("");
      setPhase("sent");
    }, reduce ? 0 : 640);
    setTimeout(() => setPhase("idle"), 1900);
  }

  // Normal flowing text — the same wrapping as the textarea, at any length.
  const font = "text-[17px] leading-[26px] tracking-[-0.01em]";
  const sending = phase === "sending";
  const stagger = Math.min(0.012, 0.35 / Math.max(chars.length, 1));
  const can = !over && !!text.trim() && phase === "idle";

  return (
    <motion.div
      ref={box}
      style={{ borderRadius: radius }}
      className={`relative w-[460px] max-w-full overflow-hidden ${t.field} ${stroke ? t.stroke : ""} ${className}`}
    >
      {cloud && <Cloud box={box} count={chars.length} limit={limit} phase={phase} reduce={reduce} rgb={t.rgb} />}

      <div ref={content} className="relative px-6 pb-4 pt-5">
        <div className="relative">
          {/* What you see: inline letters, so each can arrive and leave without changing the flow. */}
          <motion.div
            aria-hidden
            className={`min-h-[52px] whitespace-pre-wrap break-words ${font}`}
            animate={{ y: sending ? -10 : 0 }}
            transition={sending ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
          >
            {chars.map((c, i) => (
              <motion.span
                key={i}
                ref={(el) => {
                  charEls.current[i] = el;
                }}
                initial={ready && landing === "blur" ? { opacity: 0, filter: "blur(5px)" } : false}
                animate={
                  sending
                    ? { opacity: 0, filter: "blur(6px)", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: i * stagger } }
                    : { opacity: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
                }
                style={i >= limit ? { color: signal } : undefined}
              >
                {c}
              </motion.span>
            ))}
            {"​"}
          </motion.div>

          {/* What you type into: real, accessible, invisible. */}
          <textarea
            id={id}
            aria-label={label}
            aria-invalid={over || undefined}
            aria-describedby={`${id}-count`}
            value={text}
            readOnly={phase !== "idle"}
            placeholder={phase === "idle" ? placeholder : ""}
            onChange={(e) => {
              setInner(e.target.value);
              onValueChange?.(e.target.value);
            }}
            onFocus={onFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                post();
              }
            }}
            spellCheck={false}
            className={`absolute inset-0 size-full resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent text-transparent outline-none ${font} ${t.caret} ${t.placeholder}`}
          />
        </div>

        {/* The sand settles here. */}
        <div ref={band} className="mt-4 h-11" aria-hidden />

        <div className="mt-3 flex h-10 items-center justify-between">
          <Count count={chars.length} limit={limit} left={left} near={near} over={over} muted={t.muted} />
          <motion.button
            ref={button}
            type="button"
            data-post
            onClick={post}
            aria-disabled={!can}
            animate={{ opacity: can || phase !== "idle" ? 1 : 0.3 }}
            transition={{ duration: 0.2 }}
            className={`relative h-10 min-w-[96px] overflow-hidden rounded-full px-4 text-[13.5px] outline-none focus-visible:shadow-[0_0_0_2px_rgb(19_24_27/0.3)] ${t.post} ${can ? "" : "cursor-default"}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={phase === "sent" ? "sent" : "post"}
                className="flex items-center justify-center gap-1.5"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={out}
              >
                {phase === "sent" ? (
                  <>
                    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                      <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
                    </svg>
                    {doneLabel}
                  </>
                ) : (
                  action
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <Sand
          count={chars.length}
          limit={limit}
          phase={phase}
          content={content}
          band={band}
          charEls={charEls}
          grain={grain}
          gravity={gravity}
          pour={pour}
          wind={wind}
          reduce={reduce}
          rgb={t.rgb}
        />
      </div>

      <span id={`${id}-count`} className="sr-only" aria-live="polite">
        {phase === "sent" ? doneLabel : near ? (over ? `${-left} characters over the limit` : `${left} characters left`) : ""}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Sand: a falling-sand grid. Grains fall straight down, slide off     */
/* slopes diagonally, and settle. Free particles carry grains from the */
/* letters into the band, lift them off on delete, spill them past the */
/* limit, and blow them away on post.                                  */
/* ------------------------------------------------------------------ */

// Grain values: 1 is sand (one dark gray), 4 is signal (past the limit).
const SAND_ALPHA = 0.78;
// Each letter pours sand in proportion to its own width — the same text always makes
// the same landscape, whatever the limit. One line of text fills about a third of the band.
const POUR = 0.34;
// The top of the band is never filled, so peaks stay apart and valleys survive.
const HEADROOM = 0.15;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  v: number;
  kind: "fall" | "lift" | "spill" | "wind";
  t: number;
  delay: number;
};

function Sand({
  count,
  limit,
  phase,
  content,
  band,
  charEls,
  grain,
  gravity,
  pour,
  wind,
  reduce,
  rgb,
}: {
  count: number;
  limit: number;
  phase: Phase;
  content: React.RefObject<HTMLDivElement | null>;
  band: React.RefObject<HTMLDivElement | null>;
  charEls: React.RefObject<(HTMLSpanElement | null)[]>;
  grain: number;
  gravity: number;
  pour: number;
  wind: boolean;
  reduce: boolean;
  rgb: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef({
    cols: 0,
    rows: 0,
    size: grain,
    left: 0,
    top: 0,
    grid: new Uint8Array(0),
    particles: [] as Particle[],
    pours: [] as [number, number][], // [column, grains] per letter, for undoing exactly
    flip: false,
    last: 0,
    frame: 0,
    running: false,
    settled: true,
  });
  const live = useRef({ gravity, pour, wind, reduce, rgb, limit });
  useEffect(() => {
    live.current = { gravity, pour, wind, reduce, rgb, limit };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gravity, pour, wind, reduce, rgb, limit]);

  const perLetter = (widthPx = 9) => {
    const s = sim.current;
    return Math.max(1, Math.round(Math.max(1, widthPx / s.size) * s.rows * POUR * live.current.pour));
  };
  const ceiling = () => Math.ceil(sim.current.rows * HEADROOM);

  // Lay out the grid over the band; a new size starts a fresh pile.
  function measure() {
    const s = sim.current;
    const root = content.current;
    const b = band.current;
    const cv = canvas.current;
    if (!root || !b || !cv) return;
    const cols = Math.floor(b.offsetWidth / grain);
    const rows = Math.floor(b.offsetHeight / grain);
    s.left = b.offsetLeft + Math.floor((b.offsetWidth - cols * grain) / 2);
    s.top = b.offsetTop + (b.offsetHeight - rows * grain);
    if (cols !== s.cols || rows !== s.rows || grain !== s.size) {
      s.cols = cols;
      s.rows = rows;
      s.size = grain;
      s.grid = new Uint8Array(cols * rows);
      s.pours = [];
      s.particles = [];
      // Text that's already there starts with its sand already settled.
      const existing = prev.current;
      const n = perLetter();
      for (let i = 0; i < existing; i++) {
        const col = Math.min(cols - 1, Math.floor(((i + 0.5) / Math.max(existing, 1)) * cols));
        s.pours.push([col, n]);
        for (let k = 0; k < n; k++) settleAt(Math.max(0, Math.min(cols - 1, col + Math.round((Math.random() - 0.5) * 4))), i >= live.current.limit ? 4 : 1);
      }
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(root.offsetWidth * dpr);
    cv.height = Math.round(root.offsetHeight * dpr);
    kick();
  }

  useEffect(() => {
    const root = content.current;
    if (!root) return;
    // Measure now, not just when the observer first reports (it waits for a painted frame).
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const st = sim.current;
    return () => {
      ro.disconnect();
      cancelAnimationFrame(st.frame);
      st.running = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grain]);

  /** Drop a grain straight into the lowest free cell of a column (no animation). */
  function settleAt(col: number, v: number) {
    const s = sim.current;
    for (let r = s.rows - 1; r >= ceiling(); r--) {
      const i = r * s.cols + col;
      if (!s.grid[i]) {
        s.grid[i] = v;
        return true;
      }
    }
    return false;
  }

  /** Lift the topmost grains near a column, nearest first — only of one kind if `only` is set. */
  function lift(col: number, n: number, only?: number) {
    const s = sim.current;
    for (let k = 0; k < n; k++) {
      let done = false;
      for (let spread = 0; spread < s.cols && !done; spread++) {
        for (const c of spread ? [col - spread, col + spread] : [col]) {
          if (c < 0 || c >= s.cols) continue;
          for (let r = 0; r < s.rows; r++) {
            const i = r * s.cols + c;
            if (s.grid[i] && (only === undefined || s.grid[i] === only)) {
              const v = s.grid[i];
              s.grid[i] = 0;
              if (!live.current.reduce)
                s.particles.push({ x: s.left + c * s.size, y: s.top + r * s.size, vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 40, v, kind: "lift", t: 0, delay: 0 });
              done = true;
              break;
            }
          }
          if (done) break;
        }
      }
    }
  }

  // Typing pours; deleting lifts.
  const prev = useRef(count);
  useEffect(() => {
    const s = sim.current;
    // Make sure the grid exists before the first pour, so letters never get re-seeded evenly.
    if (!s.cols) measure();
    const delta = count - prev.current;
    prev.current = count;
    if (!s.cols || phase !== "idle") return kick();
    const root = content.current?.getBoundingClientRect();
    // Screen rects include any CSS scale on an ancestor (a zoomed stage, a shrunk plinth);
    // the grid works in the component's own pixels, so convert back.
    const scale = root && content.current?.offsetWidth ? root.width / content.current.offsetWidth : 1;

    if (delta > 0) {
      for (let k = 0; k < delta; k++) {
        const index = count - delta + k;
        const v = index >= live.current.limit ? 4 : 1;
        const el = charEls.current[index];
        // Spaces pour nothing — they leave the valleys between words.
        if (/\s/.test(el?.textContent ?? "")) {
          s.pours.push([-1, 0]);
          continue;
        }
        // Each letter pours directly under where it was typed.
        const r = el?.getBoundingClientRect();
        let x =
          r && root
            ? (r.left - root.left + r.width / 2) / scale
            : s.left + Math.min(1, (index + 0.5) / live.current.limit) * s.cols * s.size;
        x = Math.max(s.left, Math.min(s.left + (s.cols - 1) * s.size, x));
        const col = Math.round((x - s.left) / s.size);
        const n = perLetter(r ? r.width / scale : 9);
        s.pours.push([col, n]);
        const bulk = live.current.reduce || k < delta - 8; // pastes settle instantly
        for (let g = 0; g < n; g++) {
          if (bulk) {
            if (!settleAt(Math.max(0, Math.min(s.cols - 1, col + ((g % 5) - 2))), v)) spill(x, s.top, v);
            continue;
          }
          // Grains appear just above the band and drop in — the band is the only place sand lives.
          s.particles.push({
            x: x + (Math.random() - 0.5) * s.size * 2.5,
            y: s.top - 4 - Math.random() * 10,
            vx: (Math.random() - 0.5) * 16,
            vy: Math.random() * 30,
            v,
            kind: "fall",
            t: 0,
            delay: g * 0.01,
          });
        }
      }
    } else if (delta < 0) {
      for (let k = 0; k < -delta; k++) {
        const index = count - delta - 1 - k; // the k-th character removed, counting back from the old end
        const [col, n] = s.pours.pop() ?? [Math.floor(s.cols / 2), perLetter()];
        if (col < 0) continue; // a space: nothing to give back
        // Deleting an over-limit character takes orange back; anything else takes gray.
        const kind = index >= live.current.limit ? 4 : 1;
        let left = n;
        for (let i = s.particles.length - 1; i >= 0 && left > 0; i--) {
          if (s.particles[i].kind === "fall" && s.particles[i].v === kind) {
            s.particles.splice(i, 1);
            left--;
          }
        }
        lift(col, left, kind);
      }
      // Back under the limit, no orange may remain anywhere in the pile.
      if (count <= live.current.limit) {
        s.particles = s.particles.filter((p) => !(p.kind === "fall" && p.v === 4));
        let orange = 0;
        for (let i = 0; i < s.grid.length; i++) if (s.grid[i] === 4) orange++;
        if (orange) lift(Math.floor(s.cols / 2), orange, 4);
      }
    }
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  function spill(x: number, y: number, v: number) {
    const s = sim.current;
    if (live.current.reduce) return;
    const dir = x < s.left + (s.cols * s.size) / 2 ? -1 : 1;
    s.particles.push({ x, y, vx: dir * (40 + Math.random() * 60), vy: -20 - Math.random() * 30, v, kind: "spill", t: 0, delay: 0 });
  }

  // Posting: every grain catches the wind toward the button, right side first.
  useEffect(() => {
    const s = sim.current;
    if (phase === "sending") {
      if (live.current.wind && !live.current.reduce) {
        for (let r = 0; r < s.rows; r++)
          for (let c = 0; c < s.cols; c++) {
            const v = s.grid[r * s.cols + c];
            if (!v) continue;
            s.particles.push({
              x: s.left + c * s.size,
              y: s.top + r * s.size,
              vx: 40 + Math.random() * 60,
              vy: -10 - Math.random() * 30,
              v,
              kind: "wind",
              t: 0,
              delay: (1 - c / s.cols) * 0.18 + Math.random() * 0.08,
            });
          }
      }
      s.grid.fill(0);
      s.particles = s.particles.filter((p) => p.kind === "wind");
    }
    if (phase === "sent") s.pours = [];
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function step() {
    // One pass of falling sand, bottom-up, alternating direction to avoid drift.
    const s = sim.current;
    const { cols, rows, grid } = s;
    let moved = false;
    s.flip = !s.flip;
    for (let r = rows - 2; r >= 0; r--) {
      for (let k = 0; k < cols; k++) {
        const c = s.flip ? k : cols - 1 - k;
        const i = r * cols + c;
        const v = grid[i];
        if (!v) continue;
        const below = i + cols;
        if (!grid[below]) {
          grid[below] = v;
          grid[i] = 0;
          moved = true;
          continue;
        }
        // Slightly sticky sand: it only slides when there's a two-grain drop, so slopes
        // stand steeper and words leave visible dunes instead of a flat layer.
        const deep = (d: number) => r + 2 >= rows || !grid[below + cols + d];
        const dl = c > 0 && !grid[below - 1] && deep(-1);
        const dr = c < cols - 1 && !grid[below + 1] && deep(1);
        if (dl || dr) {
          const go = dl && dr ? (Math.random() < 0.5 ? -1 : 1) : dl ? -1 : 1;
          grid[below + go] = v;
          grid[i] = 0;
          moved = true;
        }
      }
    }
    return moved;
  }

  function frame(now: number) {
    const s = sim.current;
    const cv = canvas.current;
    if (!cv || !s.cols) {
      s.running = false;
      return;
    }
    const dt = Math.min(0.04, (now - (s.last || now)) / 1000);
    s.last = now;
    const { gravity: gv, rgb: ink } = live.current;
    const g = s.size;

    // Free particles.
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.t += dt;
      if (p.kind === "fall") {
        p.vy += 1100 * gv * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const top = ceiling();
        if (p.y >= s.top + top * g) {
          // Enter just under the headroom; if that peak is full, slide toward lower ground nearby.
          const col = Math.max(0, Math.min(s.cols - 1, Math.round((p.x - s.left) / g)));
          let placed = false;
          for (let spread = 0; spread <= 8 && !placed; spread++) {
            for (const c of spread ? [col - spread, col + spread] : [col]) {
              const i = top * s.cols + c;
              if (c >= 0 && c < s.cols && !s.grid[i]) {
                s.grid[i] = p.v;
                placed = true;
                break;
              }
            }
          }
          s.particles.splice(i, 1);
          if (!placed) spill(p.x, s.top - g, p.v);
        }
      } else if (p.kind === "lift") {
        p.vy -= 60 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.t > 0.45) s.particles.splice(i, 1);
      } else if (p.kind === "spill") {
        p.vy += 700 * gv * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.t > 0.7) s.particles.splice(i, 1);
      } else {
        p.vx += 1500 * dt;
        p.vy -= 30 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.t > 0.6) s.particles.splice(i, 1);
      }
    }

    // Gravity sets how many sand passes run per frame.
    const passes = Math.max(1, Math.round(gv * 2));
    let moved = false;
    for (let k = 0; k < passes; k++) moved = step() || moved;

    // Draw: snapped to device pixels so grains stay crisp.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const px = Math.max(1, Math.round(g * dpr));
    const color = (v: number, a = 1) => (v === 4 ? `rgba(228,87,46,${a})` : `rgba(${ink},${SAND_ALPHA * a})`);
    for (let r = 0; r < s.rows; r++)
      for (let c = 0; c < s.cols; c++) {
        const v = s.grid[r * s.cols + c];
        if (!v) continue;
        ctx.fillStyle = color(v);
        ctx.fillRect(Math.round((s.left + c * g) * dpr), Math.round((s.top + r * g) * dpr), px, px);
      }
    for (const p of s.particles) {
      if (p.delay > 0) {
        if (p.kind === "wind") {
          ctx.fillStyle = color(p.v);
          ctx.fillRect(Math.round(p.x * dpr), Math.round(p.y * dpr), px, px);
        }
        continue;
      }
      const fade = p.kind === "fall" ? 1 : p.kind === "lift" ? 1 - p.t / 0.45 : p.kind === "spill" ? 1 - p.t / 0.7 : 1 - p.t / 0.6;
      ctx.fillStyle = color(p.v, Math.max(0, fade));
      ctx.fillRect(Math.round(p.x * dpr), Math.round(p.y * dpr), px, px);
    }

    if (moved || s.particles.length) s.frame = requestAnimationFrame(frame);
    else s.running = false;
  }

  function kick() {
    const s = sim.current;
    if (s.running) return;
    s.running = true;
    s.last = 0;
    s.frame = requestAnimationFrame(frame);
  }

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 z-10 size-full [image-rendering:pixelated]" />;
}

/* ------------------------------------------------------------------ */
/* Cloud: a faint ordered-dither field behind the whole card. It rises */
/* from the bottom-right corner as you near the limit — quiet early,   */
/* reaching behind the text only at the end, light enough to read     */
/* through. Its edge is broken up with noise so it reads as a cloud.   */
/* ------------------------------------------------------------------ */

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3,
  35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const DOT = 3;
const PITCH = 5;

function Cloud({
  box,
  count,
  limit,
  phase,
  reduce,
  rgb,
}: {
  box: React.RefObject<HTMLDivElement | null>;
  count: number;
  limit: number;
  phase: Phase;
  reduce: boolean;
  rgb: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    w: 0,
    h: 0,
    p: 0,
    target: 0,
    over: false,
    dissolve: -1,
    lit: new Uint8Array(0),
    born: new Float64Array(0),
    noise: new Float32Array(0),
    last: 0,
    frame: 0,
    running: false,
  });
  const live = useRef({ reduce, rgb });
  useEffect(() => {
    live.current = { reduce, rgb };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, rgb]);

  useEffect(() => {
    const el = box.current;
    const s = st.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      s.w = el.offsetWidth;
      s.h = el.offsetHeight;
      kick();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(s.frame);
      s.running = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = st.current;
    s.target = Math.min(count / limit, 1);
    s.over = count > limit;
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, limit]);

  useEffect(() => {
    const s = st.current;
    if (phase === "sending") s.dissolve = 0;
    if (phase === "sent") {
      s.dissolve = -1;
      s.p = 0;
      s.lit.fill(0);
    }
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function frame(now: number) {
    const s = st.current;
    const cv = canvas.current;
    if (!cv || !s.w) {
      s.running = false;
      return;
    }
    const { reduce: still, rgb: ink } = live.current;
    const dt = Math.min(0.05, (now - (s.last || now)) / 1000);
    s.last = now;
    s.p = still ? s.target : s.p + (s.target - s.p) * Math.min(1, dt * 4);
    if (s.dissolve >= 0) s.dissolve = Math.min(1.2, s.dissolve + dt / 0.5);

    const cols = Math.ceil(s.w / PITCH);
    const rows = Math.ceil(s.h / PITCH);
    if (s.lit.length !== cols * rows) {
      s.lit = new Uint8Array(cols * rows);
      s.born = new Float64Array(cols * rows);
      // Smooth-ish noise per cell (two octaves of hashed values) to break up the edge.
      s.noise = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const a = hash(Math.floor(c / 6), Math.floor(r / 6));
          const b = hash(Math.floor(c / 2) + 99, Math.floor(r / 2) + 7);
          s.noise[r * cols + c] = a * 0.7 + b * 0.3;
        }
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(s.w * dpr);
    const H = Math.round(s.h * dpr);
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const px = Math.max(1, Math.round(DOT * dpr));

    // A corner accent, not a takeover: distance is measured relative to a region around
    // the button (right ~45%, lower ~70% of the card), and the cloud never grows past it.
    const reach = s.p > 0 ? 0.25 + 0.75 * Math.pow(s.p, 0.9) : 0;
    const spanX = s.w * 0.45;
    const spanY = s.h * 0.7;
    let animating = Math.abs(s.target - s.p) > 0.001 || (s.dissolve >= 0 && s.dissolve < 1.2);

    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const x = c * PITCH;
        const y = r * PITCH;
        // Distance from the bottom-right corner, where 1 is the edge of the allowed region.
        const d = Math.hypot((s.w - x) / spanX, (s.h - y) / spanY);
        const edge = (reach - d + (s.noise[i] - 0.5) * 0.45) / 0.3;
        const intensity = Math.max(0, Math.min(0.85, edge));
        let on = s.p > 0 && intensity > BAYER8[(r % 8) * 8 + (c % 8)];
        if (s.dissolve >= 0 && BAYER8[(r % 8) * 8 + (c % 8)] * 0.5 + (1 - c / cols) * 0.5 < s.dissolve) on = false;
        if (on && !s.lit[i]) s.born[i] = now;
        s.lit[i] = on ? 1 : 0;
        if (!on) continue;
        const age = still ? 1 : Math.min(1, (now - s.born[i]) / 350);
        if (age < 1) animating = true;
        ctx.fillStyle = s.over ? `rgba(228,87,46,${0.16 * age})` : `rgba(${ink},${0.1 * age})`;
        ctx.fillRect(Math.round(x * dpr), Math.round(y * dpr), px, px);
      }

    if (animating) s.frame = requestAnimationFrame(frame);
    else s.running = false;
  }

  function kick() {
    const s = st.current;
    if (s.running) return;
    s.running = true;
    s.last = 0;
    s.frame = requestAnimationFrame(frame);
  }

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]" />;
}

/** Cheap deterministic 0–1 hash for a grid cell. */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/* ------------------------------------------------------------------ */

/** "48 / 140" while there's room, "12 left" near the end, "−3" in signal past it. Digits roll. */
function Count({ count, limit, left, near, over, muted }: { count: number; limit: number; left: number; near: boolean; over: boolean; muted: string }) {
  const mode = over ? "over" : near ? "near" : "room";
  return (
    <span className="relative flex h-6 items-center overflow-hidden font-mono text-[12px] tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={mode}
          className={`flex items-center gap-1 ${over ? "" : muted}`}
          style={over ? { color: signal } : undefined}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={out}
        >
          {mode === "room" && (
            <>
              <Roll text={String(count)} /> / {limit}
            </>
          )}
          {mode === "near" && (
            <>
              <Roll text={String(left)} /> left
            </>
          )}
          {mode === "over" && <Roll text={`−${-left}`} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Roll({ text }: { text: string }) {
  return (
    <span className="inline-flex">
      {[...text].map((c, i, all) => (
        <span key={all.length - i} className="relative inline-flex overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", visualDuration: 0.25, bounce: 0.2 }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/** Count what people see as characters: "👋🏽" is one, not four. */
function graphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((x) => x.segment);
  }
  return Array.from(text);
}
