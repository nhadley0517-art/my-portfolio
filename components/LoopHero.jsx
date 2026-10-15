'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// A small version of Loop (loop-music-studio.vercel.app): paint pixels,
// hear them as music. Both halves are ported straight from the real app —
// the score builder (which pixels play, and for how long) and the sound
// engine, which is built on Tone.js with the real app's exact patches and
// master bus. Tone is loaded lazily after the page is idle, and every
// browser API here is only touched inside effects/handlers, so it's SSR-safe.

const COLS = 48;
const ROWS = 24;
const NOTES = 15; // three octaves of a five-note scale
const BASE_MIDI = 48; // C3
const MAJOR = [0, 2, 4, 7, 9];
const MINOR = [0, 3, 5, 7, 10];
const MAX_STACK = 4;
const EMPTY = -1;
const VOLUME_KEY = 'nh-loop-volume';

// The real app plays a bass line under the lowest note and a slow pad chord
// across each quarter of the canvas by default. Both are off here — the pad
// swells in ahead of the playhead, which read as notes playing before their
// pixels. Flip either on to hear the real app's full default.
const WITH_BASS = false;
const WITH_PAD = false;

// The real app's colors and warmth values, minus the whites and pale tints
// that vanish on a light canvas — laid out as one spectrum (warm → cool →
// neutrals) so the row reads as a designed palette rather than a grab bag.
const PALETTE = [
  { c: '#9c3d2e', w: 0.7 },
  { c: '#e4572e', w: 1 },
  { c: '#f29e4c', w: 0.8 },
  { c: '#d4a373', w: 0.5 },
  { c: '#f4d35e', w: 0.6 },
  { c: '#b5c99a', w: 0.1 },
  { c: '#8fb996', w: 0 },
  { c: '#1b7a5a', w: -0.2 },
  { c: '#2a9d8f', w: -0.4 },
  { c: '#3fb6c9', w: -0.5 },
  { c: '#6fa8dc', w: -0.6 },
  { c: '#3d5a99', w: -0.9 },
  { c: '#7b6db5', w: -0.7 },
  { c: '#5b3a8c', w: -0.6 },
  { c: '#c46ab3', w: 0.2 },
  { c: '#ee7b9a', w: 0.5 },
  { c: '#8a5a3c', w: 0.3 },
  { c: '#6b6b6b', w: -0.2 },
  { c: '#1f2a44', w: -1 },
  { c: '#2b2b33', w: -0.3 },
];
const RGB = PALETTE.map(({ c }) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
const EMPTY_RGB = [23, 20, 15]; // the real app's canvas color — the score math is tuned against it

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ---------- intro scene: a mountainscape in the site's own palette ---------- */
// Layered ranges stepping from pale gray to the site's ink, a pine-dotted
// foreground, and a sun in the site's coral accent. Drawn only during the
// intro — never written into the playable canvas.
const SCENE_COLORS = ['#FD8973', '#D9DCE0', '#AEB3BA', '#6E747C', '#13181B'];
const [SUN, FAR, MID, NEAR, GROUND] = [0, 1, 2, 3, 4];

function mountainScene() {
  const px = new Int8Array(COLS * ROWS).fill(EMPTY);
  const set = (x, y, c) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) px[y * COLS + x] = c;
  };
  // A ridge line is the lowest of a few triangular peaks at each column.
  const ridge = (peaks, x) => Math.min(...peaks.map(([px_, py, slope]) => py + Math.abs(x - px_) * slope));
  const fill = (top, c) => {
    for (let x = 0; x < COLS; x++) for (let y = Math.round(top(x)); y < ROWS; y++) set(x, y, c);
  };

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) if (Math.hypot(x - 34, y - 5) < 3.4) set(x, y, SUN);
  }
  fill((x) => ridge([[6, 8, 0.85], [17, 5, 0.75], [28, 8, 0.9], [42, 5, 0.7]], x), FAR);
  fill((x) => ridge([[1, 12, 0.9], [12, 10, 0.8], [24, 12, 0.95], [36, 9, 0.8], [47, 11, 0.9]], x) + (x % 3 === 0 ? 1 : 0), MID);
  fill((x) => ridge([[9, 15, 0.6], [23, 16, 0.55], [39, 14, 0.6]], x), NEAR);
  fill((x) => 20 + Math.round(1.1 * Math.sin(x / 4 + 1)), GROUND);
  // Pines on the foreground hills.
  for (const tx of [4, 10, 15, 31, 36, 44]) {
    const base = 20 + Math.round(1.1 * Math.sin(tx / 4 + 1));
    for (let h = 1; h <= 4; h++) {
      const half = Math.floor((4 - h) / 2);
      for (let dx = -half; dx <= half; dx++) set(tx + dx, base - h, GROUND);
    }
  }
  return px;
}

/* ---------- score: which notes play, and for how long ---------- */
// Ported from the real app. A horizontal run of the same color is one held
// note (not a retrigger every step), and when a column has more than four
// notes it keeps the *edges* of shapes — pixels that contrast with their
// neighbors — so outlines sing and solid fills stay quiet.

const noteOfRow = (y) => Math.floor(((ROWS - 1 - y) * NOTES) / ROWS);
const midiOf = (note, minor) => {
  const steps = minor ? MINOR : MAJOR;
  return BASE_MIDI + steps[note % steps.length] + 12 * Math.floor(note / steps.length);
};
const registerOf = (note) => (note < 5 ? 'low' : note < 10 ? 'mid' : 'high');
const velocityOf = (note) => 0.8 * (1 - 0.25 * (note / (NOTES - 1)));

function colorDistance(a, b) {
  if (a === EMPTY && b === EMPTY) return 0;
  const p = a === EMPTY ? EMPTY_RGB : RGB[a];
  const q = b === EMPTY ? EMPTY_RGB : RGB[b];
  const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) / 441.7;
  return a === EMPTY || b === EMPTY ? Math.max(0.35, d) : d;
}

function columnSalience(px, x) {
  const notes = new Map();
  for (let y = 0; y < ROWS; y++) {
    const v = px[y * COLS + x];
    if (v === EMPTY) continue;
    const left = x > 0 ? colorDistance(v, px[y * COLS + x - 1]) : 0;
    const up = y > 0 ? colorDistance(v, px[(y - 1) * COLS + x]) : 0;
    const down = y < ROWS - 1 ? colorDistance(v, px[(y + 1) * COLS + x]) : 0;
    const s = left + up + 0.5 * down;
    const n = noteOfRow(y);
    const prev = notes.get(n);
    if (prev) prev.s = Math.max(prev.s, s);
    else notes.set(n, { c: v, s });
  }
  return notes;
}

const HIGH_NOTE = 11;
const highWeight = (n) => (n < 10 ? 1 : 1 - 0.1 * (n - 9));

function pickNotes(notes, x, spread) {
  const all = [...notes.keys()].sort((a, b) => a - b);
  const withColor = (list) => list.sort((a, b) => a - b).map((n) => ({ n, c: notes.get(n).c }));
  if (all.length <= MAX_STACK) return withColor(all);
  const picked = [];
  let highTaken = false;
  const ranked = all.map((n) => ({ n, s: notes.get(n).s * highWeight(n) })).sort((a, b) => b.s - a.s || a.n - b.n);
  for (const { n, s } of ranked) {
    if (picked.length === MAX_STACK || s < 0.12) break;
    if (n >= HIGH_NOTE) {
      if (highTaken) continue;
      highTaken = true;
    }
    picked.push(n);
  }
  const missing = MAX_STACK - picked.length;
  if (missing > 0) {
    let rest = all.filter((n) => !picked.includes(n) && n < HIGH_NOTE);
    if (!rest.length) rest = all.filter((n) => !picked.includes(n));
    const offset = Math.floor(x / spread) * missing;
    for (let i = 0; i < missing && i < rest.length; i++) picked.push(rest[(offset + Math.floor((i * rest.length) / missing)) % rest.length]);
  }
  return withColor(picked);
}

// Four slow pad chords across the canvas, voiced from how warm each quarter
// of the picture is (only used with WITH_PAD).
function padChords(px) {
  const span = COLS / 4;
  return Array.from({ length: 4 }, (_, q) => {
    let sum = 0;
    let n = 0;
    for (let x = Math.floor(q * span); x < Math.floor((q + 1) * span); x++) {
      for (let y = 0; y < ROWS; y++) {
        const v = px[y * COLS + x];
        if (v !== EMPTY) {
          sum += PALETTE[v].w;
          n++;
        }
      }
    }
    if (!n) return null;
    const root = clamp(Math.round((1 - sum / n) * 1.5), 0, 3);
    return { step: Math.floor(q * span), len: span, notes: [root, root + 2, root + 4] };
  });
}

function buildScore(px) {
  const maxHold = Math.max(2, Math.round(COLS / 6));
  const spread = Math.max(1, Math.round(COLS / 24));
  const columns = Array.from({ length: COLS }, (_, x) => pickNotes(columnSalience(px, x), x, spread));
  const colorAt = columns.map((col) => new Map(col.map(({ n, c }) => [n, c])));
  const sameColor = (a, b) => b !== undefined && colorDistance(a, b) < 0.1;
  const events = Array.from({ length: COLS }, () => []);
  const pad = Array.from({ length: COLS }, () => null);
  for (const chord of padChords(px)) if (chord) pad[chord.step] = chord;

  const held = new Map();
  for (let x = 0; x < COLS; x++) {
    for (const [n, h] of held) {
      const c = colorAt[x].get(n);
      if (sameColor(h.c, c)) h.c = c;
      else held.delete(n);
    }
    for (const { n, c } of columns[x]) {
      const h = held.get(n);
      if (h && x - h.x < maxHold) continue;
      held.set(n, { x, c });
      let len = 1;
      while (len < maxHold && x + len < COLS && sameColor(c, colorAt[x + len].get(n))) len++;
      events[x].push({ n, len });
    }
  }
  return {
    events,
    pad,
    sim: columns.map((col) => col.length),
    lowest: columns.map((col) => (col.length ? col[0].n : -1)),
  };
}

function warmthOf(px) {
  let sum = 0;
  let n = 0;
  for (const v of px) {
    if (v === EMPTY) continue;
    sum += PALETTE[v].w;
    n++;
  }
  return n ? sum / n : 0;
}
// Warm pictures play in major and a little faster, cool ones drift into
// minor. Hysteresis, so art hovering around neutral doesn't flip every loop.
const nextMinor = (minor, warmth) => (minor && warmth > 0.05 ? false : !minor && warmth < -0.2 ? true : minor);
const stepSecondsFor = (warmth) => (clamp(175 - 45 * warmth, 110, 240) / 1000) * (32 / COLS);

/* ---------- sound: the real app's engine, on Tone.js ---------- */

const env = (attack, decay, sustain, release) => ({ attack, decay, sustain, release });
const GLIDE = { time: 0.07, window: 0.45, range: 5 };
const REED = { engine: 'analog', wave: 'sine', filterSweep: 0.12, poolSize: 8 };
const PATCHES = {
  low: { ...REED, env: env(0.12, 0.3, 0.85, 0.55), cutoff: 1500, resonance: 0.3, vibrato: 0.07, glide: { ...GLIDE, time: 0.09 }, poolSize: 6, out: { volume: -9, reverb: 0.2, delay: 0.08 } },
  mid: { ...REED, env: env(0.1, 0.3, 0.85, 0.5), cutoff: 2800, resonance: 0.4, vibrato: 0.14, glide: GLIDE, out: { volume: -12, reverb: 0.35, delay: 0.15 } },
  high: { ...REED, env: env(0.08, 0.3, 0.8, 0.5), cutoff: 4200, resonance: 0.4, vibrato: 0.2, glide: { ...GLIDE, time: 0.055 }, poolSize: 6, out: { volume: -14, reverb: 0.45, delay: 0.2 } },
  bass: { ...REED, wave: 'triangle', env: env(0.08, 0.3, 0.85, 0.4), cutoff: 650, resonance: 0.3, filterSweep: 0.08, vibrato: 0, glide: null, poolSize: 4, out: { volume: -11, reverb: 0.08, delay: 0 } },
  pad: { ...REED, engine: 'fat', wave: 'triangle', env: env(0.7, 0.6, 0.85, 1.2), cutoff: 1300, resonance: 0.4, filterSweep: 0.1, vibrato: 0.05, glide: null, poolSize: 6, out: { volume: -18, reverb: 0.6, delay: 0.1 } },
};
const STEAL_GAP = 0.015; // the real app's voice-steal gap

async function createMaster(Tone) {
  const limiter = new Tone.Limiter(-1).toDestination();
  const glue = new Tone.Compressor({ threshold: -14, ratio: 3, attack: 0.02, release: 0.25 }).connect(limiter);
  const level = new Tone.Gain(1).connect(glue);
  const out = new Tone.Gain(0.7).connect(level);
  const reverb = new Tone.Reverb({ decay: 7, preDelay: 0.03, wet: 1 }).connect(out);
  // A dotted-quarter echo filtered inside its own feedback loop, so each
  // repeat loses lows and highs and thins out instead of piling up.
  const delay = new Tone.Gain(1);
  const echo = new Tone.Delay({ delayTime: '4n.', maxDelay: 2 });
  const hp = new Tone.Filter(220, 'highpass');
  const lp = new Tone.Filter(2800, 'lowpass');
  const feedback = new Tone.Gain(0.36);
  delay.connect(echo);
  echo.connect(hp);
  hp.connect(lp);
  lp.connect(out);
  lp.connect(feedback);
  feedback.connect(echo);
  await reverb.generate();
  return { out, level, reverb, delay, nodes: [limiter, glue, level, out, reverb, delay, echo, hp, lp, feedback] };
}

// One patch: a pool of oscillators with their own amp envelopes, sharing a
// limiter → swept lowpass → vibrato → channel, sent to the master reverb
// and echo. Mirrors the real app's voice, including its note glide.
function createVoice(Tone, patch, master) {
  const channel = new Tone.Channel({ volume: patch.out.volume });
  const reverbSend = new Tone.Gain(patch.out.reverb);
  const delaySend = new Tone.Gain(patch.out.delay);
  const filter = new Tone.Filter({ type: 'lowpass', Q: patch.resonance });
  const filterEnv = new Tone.FrequencyEnvelope({ ...patch.env, baseFrequency: patch.cutoff, octaves: patch.filterSweep * 6 });
  filterEnv.connect(filter.frequency);
  const vibrato = new Tone.Vibrato({ frequency: 5.5, depth: patch.vibrato, wet: patch.vibrato });
  const head = new Tone.Limiter(-6);
  head.connect(filter);
  filter.connect(vibrato);
  vibrato.connect(channel);
  channel.connect(master.out);
  channel.connect(reverbSend);
  reverbSend.connect(master.reverb);
  channel.connect(delaySend);
  delaySend.connect(master.delay);

  const pool = Array.from({ length: patch.poolSize }, () => {
    const source =
      patch.engine === 'fat'
        ? new Tone.FatOscillator({ frequency: 220, type: patch.wave, spread: 22, count: 3 }).start()
        : new Tone.Oscillator(220, patch.wave).start();
    const amp = new Tone.AmplitudeEnvelope(patch.env);
    source.connect(amp);
    amp.connect(head);
    return { source, amp, since: 0, busyUntil: 0 };
  });

  let glide = patch.glide;
  let release = patch.env.release;
  let recent = [];

  const freeVoice = (time) => pool.find((v) => time >= v.busyUntil) ?? pool.reduce((a, b) => (a.since <= b.since ? a : b));
  const startAt = (v, time) => {
    if (time >= v.busyUntil) return time;
    v.amp.triggerRelease(time);
    return time + STEAL_GAP;
  };
  // Slides into a new note from any note this voice played within the
  // glide window, if one's within a few semitones.
  const glideStarts = (freqs, time) => {
    if (!glide) return freqs.map(() => null);
    const pool_ = recent.filter((r) => time - r.time > 0 && time - r.time <= glide.window);
    return freqs.map((f) => {
      let best = -1;
      let bestDist = glide.range;
      pool_.forEach((r, i) => {
        if (r.used || r.freq === f) return;
        const d = Math.abs(12 * Math.log2(f / r.freq));
        if (d <= bestDist) {
          best = i;
          bestDist = d;
        }
      });
      if (best < 0) return null;
      pool_[best].used = true;
      return pool_[best].freq;
    });
  };

  return {
    trigger(midis, dur, time, velocity) {
      const freqs = midis.map((m) => Tone.Frequency(m, 'midi').toFrequency());
      const starts = glideStarts(freqs, time);
      freqs.forEach((f, i) => {
        const v = freeVoice(time);
        const at = startAt(v, time);
        if (starts[i] !== null) {
          v.source.frequency.setValueAtTime(starts[i], at);
          v.source.frequency.exponentialRampToValueAtTime(f, at + glide.time);
        } else {
          v.source.frequency.setValueAtTime(f, at);
        }
        v.amp.triggerAttackRelease(dur, at, velocity);
        v.since = time;
        v.busyUntil = at + dur + release;
      });
      filterEnv.triggerAttackRelease(dur, time);
      recent = recent.filter((r) => time - r.time < 1).concat(freqs.map((freq) => ({ freq, time, used: false })));
    },
    // The real app's per-loop retune: brighter filters and drier sends for
    // warm art, darker and wetter for cool art; attack and glide scaled to
    // the tempo.
    tune({ cutoff, attack, glide: g, reverb, delay }) {
      glide = g;
      release = patch.env.release;
      for (const v of pool) v.amp.attack = attack;
      filterEnv.attack = attack;
      filterEnv.baseFrequency = cutoff;
      reverbSend.gain.rampTo(reverb, 0.05);
      delaySend.gain.rampTo(delay, 0.05);
    },
    dispose() {
      for (const v of pool) {
        v.source.dispose();
        v.amp.dispose();
      }
      [channel, reverbSend, delaySend, filter, filterEnv, vibrato, head].forEach((n) => n.dispose());
    },
  };
}

async function createBand(Tone) {
  const master = await createMaster(Tone);
  const names = ['low', 'mid', 'high', ...(WITH_BASS ? ['bass'] : []), ...(WITH_PAD ? ['pad'] : [])];
  const voices = Object.fromEntries(names.map((name) => [name, createVoice(Tone, PATCHES[name], master)]));
  return {
    tune(warmth, stepSec) {
      const cutoffScale = (2800 + 900 * warmth) / 2800;
      const reverbScale = (0.35 - 0.1 * warmth) / 0.35;
      const delayScale = (0.3 - 0.15 * warmth) / 0.15;
      const padSpan = (stepSec * COLS) / 4;
      for (const name of names) {
        const p = PATCHES[name];
        voices[name].tune({
          cutoff: p.cutoff * cutoffScale,
          attack: name === 'pad' ? Math.min(p.env.attack, padSpan * 0.4) : Math.min(p.env.attack, stepSec * 0.35),
          glide: p.glide ? { ...p.glide, time: Math.min(p.glide.time, stepSec * 0.7), window: stepSec * 2.2 } : null,
          reverb: p.out.reverb * reverbScale,
          delay: p.out.delay * delayScale,
        });
      }
    },
    playStep(score, step, time, stepSec, minor) {
      for (const { n, len } of score.events[step]) {
        const midi = midiOf(n, minor);
        const dur = stepSec * len * 0.96;
        voices[registerOf(n)].trigger([midi], dur, time, velocityOf(n));
        if (WITH_BASS && n === score.lowest[step]) voices.bass.trigger([midi - 12], dur, time, 0.6);
      }
      const chord = score.pad[step];
      if (WITH_PAD && chord) voices.pad.trigger(chord.notes.map((n) => midiOf(n, minor)), stepSec * chord.len * 1.02, time, 0.6);
      // Crowded columns duck the whole mix a little so they don't jump out.
      const count = score.sim[step] ?? 0;
      master.level.gain.rampTo(clamp(1 / Math.sqrt(Math.max(1, count) / 3), 0.4, 1), 0.12, time);
    },
    dispose() {
      Object.values(voices).forEach((v) => v.dispose());
      master.nodes.forEach((n) => n.dispose());
    },
  };
}

// The real app sets the output 4dB down; the volume slider rides on top.
const outputDb = (Tone, volume) => -4 + (volume > 0 ? Tone.gainToDb(volume * volume) : -Infinity);

function readVolume() {
  try {
    const v = parseFloat(window.localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) ? clamp(v, 0, 1) : 0.7;
  } catch {
    return 0.7;
  }
}

/* ---------- motion ---------- */

const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
const easeInCubic = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// A square that morphs from a dot (s ≈ 0: fully rounded) into a crisp pixel
// (s = 1: square), centered in its cell. Overshoot past 1 stays square.
function fillPixel(ctx, x, y, cell, s) {
  if (s <= 0.01) return;
  const size = cell * Math.min(s, 1.14);
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;
  if (s >= 1 || !ctx.roundRect) {
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
    return;
  }
  ctx.beginPath();
  ctx.roundRect(cx - size / 2, cy - size / 2, size, size, (size / 2) * (1 - s));
  ctx.fill();
}

// Intro timing: the scene blooms in, a highlight passes over it once, then
// it folds away — about 2.5 seconds in all.
const INTRO = { grow: 1100, pixel: 420, hold: 750, shrink: 650, fold: 300 };
const INTRO_TOTAL = INTRO.grow + INTRO.hold + INTRO.shrink;
// Rises from the bottom up — foreground first, far peaks after — with a
// slight left-to-right lean, and the sun comes up last, like a sunrise.
const introOrder = (x, y, v) => (v === SUN ? 1 : ((ROWS - 1 - y) / ROWS) * 0.75 + (x / COLS) * 0.2);
// Freshly painted pixels pop in over this long.
const POP_MS = 220;

export default function LoopHero() {
  const canvasRef = useRef(null);
  const pxRef = useRef(new Int8Array(COLS * ROWS).fill(EMPTY));
  const popRef = useRef(new Float64Array(COLS * ROWS));
  const dirtyRef = useRef(true);
  const cellRef = useRef(0);
  // Cells painted per touch along each axis. 1 normally; 2 when the canvas
  // is narrow enough (a phone) that single cells are smaller than a
  // fingertip can hit — the brush then snaps to a 24×12 grid of 2×2 blocks,
  // and the dot grid switches to match, so what you see is what you paint.
  const brushRef = useRef(1);
  const hoverRef = useRef(null);
  // { start, art } while the intro plays; drawn on its own layer and never
  // written into the real canvas, so it can't leak into the music.
  const introRef = useRef(null);

  const [color, setColor] = useState(1);
  const [erasing, setErasing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // The pointer handlers are bound once, so they read the current tool
  // through a ref rather than closing over stale state.
  const liveRef = useRef({ color, erasing });
  useEffect(() => {
    liveRef.current = { color, erasing };
  }, [color, erasing]);
  const volumeRef = useRef(0.7);

  /* ---------- audio ---------- */
  const toneRef = useRef(null); // the Tone module, once loaded
  const bandRef = useRef(null); // Promise<band>
  const schedRef = useRef(null); // { nextTime, step, minor, stepSec, score, timer }
  const minorRef = useRef(false);
  // Audio-clock start time of each column, most recent lap — read by the
  // playhead to show what's actually sounding, not what's been queued.
  const stepTimeRef = useRef(new Float64Array(COLS).fill(-1));

  useEffect(() => {
    // Saved volume lives in localStorage, which doesn't exist during SSR —
    // reading it after mount is what keeps the first render hydration-safe.
    const saved = readVolume();
    volumeRef.current = saved;
    setVolume(saved);
  }, []);

  const loadTone = useCallback(async () => {
    if (!toneRef.current) toneRef.current = await import('tone');
    return toneRef.current;
  }, []);

  // Tone is ~100KB, so it's fetched once the page is idle rather than with
  // the first paint — in hand well before anyone presses play.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const id = idle(() => loadTone());
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, [loadTone]);

  const ensureBand = useCallback(async () => {
    const Tone = await loadTone();
    if (!bandRef.current) bandRef.current = createBand(Tone);
    const band = await bandRef.current;
    Tone.getDestination().volume.value = outputDb(Tone, volumeRef.current);
    return { Tone, band };
  }, [loadTone]);

  const changeVolume = useCallback((v) => {
    volumeRef.current = v;
    setVolume(v);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      // private mode — the slider still works for this visit
    }
    const Tone = toneRef.current;
    if (Tone) Tone.getDestination().volume.rampTo(outputDb(Tone, v), 0.05);
  }, []);

  // Bumped by every stop, so a play still waiting on Tone to load (or the
  // reverb to generate) knows it was cancelled and doesn't start afterward.
  const runRef = useRef(0);

  const stop = useCallback(() => {
    runRef.current++;
    if (schedRef.current?.timer) clearInterval(schedRef.current.timer);
    schedRef.current = null;
    stepTimeRef.current.fill(-1);
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    const run = ++runRef.current;
    setPlaying(true);
    const Tone = await loadTone();
    await Tone.start();
    const { band } = await ensureBand();
    if (runRef.current !== run) return;
    const ctx = Tone.getContext();
    const s = { nextTime: ctx.currentTime + 0.1, step: 0, minor: minorRef.current, stepSec: stepSecondsFor(0), score: null };
    schedRef.current = s;
    const tick = () => {
      if (schedRef.current !== s) return;
      const horizon = ctx.currentTime + 0.15;
      while (s.nextTime < horizon) {
        // Tempo, scale and tone settle once per loop, on the downbeat, so a
        // repaint never lurches a phrase already playing; the notes
        // themselves pick up edits right away.
        if (s.step === 0) {
          const warmth = warmthOf(pxRef.current);
          s.minor = nextMinor(s.minor, warmth);
          minorRef.current = s.minor;
          s.stepSec = stepSecondsFor(warmth);
          band.tune(warmth, s.stepSec);
        }
        if (dirtyRef.current || !s.score) {
          s.score = buildScore(pxRef.current);
          dirtyRef.current = false;
        }
        stepTimeRef.current[s.step] = s.nextTime;
        band.playStep(s.score, s.step, s.nextTime, s.stepSec, s.minor);
        s.nextTime += s.stepSec;
        s.step = (s.step + 1) % COLS;
      }
    };
    tick();
    s.timer = setInterval(tick, 40);
  }, [loadTone, ensureBand]);

  useEffect(
    () => () => {
      stop();
      bandRef.current?.then((band) => band.dispose());
      bandRef.current = null;
    },
    [stop]
  );

  /* ---------- canvas sizing ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const cell = Math.max(2, Math.floor((canvas.clientWidth * dpr) / COLS));
      cellRef.current = cell;
      brushRef.current = canvas.clientWidth / COLS < 12 ? 2 : 1;
      canvas.width = cell * COLS;
      canvas.height = cell * ROWS;
      setReady(true);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  /* ---------- intro ---------- */
  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowHint(true);
      return;
    }
    introRef.current = { start: performance.now(), art: mountainScene() };
  }, [ready]);

  const endIntro = useCallback(() => {
    introRef.current = null;
    setShowHint(false);
  }, []);

  /* ---------- draw loop ---------- */
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const drawIntro = (cell, t, art) => {
      const growing = t < INTRO.grow;
      const holding = !growing && t < INTRO.grow + INTRO.hold;
      // Where the highlight is during the hold, in canvas-width fractions.
      const sheen = holding ? -0.25 + 1.5 * easeInOut((t - INTRO.grow) / INTRO.hold) : null;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const v = art[y * COLS + x];
          if (v === EMPTY) continue;
          const order = introOrder(x, y, v);
          let s;
          if (growing) {
            s = easeOutBack(clamp((t - order * (INTRO.grow - INTRO.pixel)) / INTRO.pixel, 0, 1));
          } else if (holding) {
            s = 1;
          } else {
            const start = INTRO.grow + INTRO.hold + (1 - order) * (INTRO.shrink - INTRO.fold);
            s = 1 - easeInCubic(clamp((t - start) / INTRO.fold, 0, 1));
          }
          ctx.fillStyle = SCENE_COLORS[v];
          fillPixel(ctx, x, y, cell, s);
          if (sheen !== null) {
            const glow = Math.exp(-Math.pow(((x + 0.5) / COLS - sheen) / 0.07, 2));
            if (glow > 0.02) {
              ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * glow})`;
              ctx.fillRect(x * cell, y * cell, cell, cell);
            }
          }
        }
      }
    };

    const draw = () => {
      const cell = cellRef.current;
      const px = pxRef.current;
      const now = performance.now();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // A dot at each grid intersection instead of full grid lines — enough
      // to paint to, without a mesh fighting the picture.
      const brush = brushRef.current;
      const r = Math.max(1, Math.round(cell * 0.05 * brush));
      ctx.fillStyle = 'rgba(19, 24, 27, 0.08)';
      for (let x = brush; x < COLS; x += brush) {
        for (let y = brush; y < ROWS; y += brush) ctx.fillRect(x * cell - r, y * cell - r, r * 2, r * 2);
      }

      const intro = introRef.current;
      if (intro) {
        const t = now - intro.start;
        if (t >= INTRO_TOTAL) {
          introRef.current = null;
          setShowHint(true);
        } else {
          drawIntro(cell, t, intro.art);
        }
      }

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = y * COLS + x;
          const v = px[i];
          if (v === EMPTY) continue;
          ctx.fillStyle = PALETTE[v].c;
          const age = now - popRef.current[i];
          if (age < POP_MS) fillPixel(ctx, x, y, cell, 0.45 + 0.55 * easeOutBack(age / POP_MS));
          else ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }

      const Tone = toneRef.current;
      if (Tone && schedRef.current) {
        const at = Tone.getContext().currentTime;
        let col = -1;
        let latest = -Infinity;
        for (let c = 0; c < COLS; c++) {
          const st = stepTimeRef.current[c];
          if (st >= 0 && st <= at && st > latest) {
            latest = st;
            col = c;
          }
        }
        if (col >= 0) {
          ctx.fillStyle = 'rgba(19, 24, 27, 0.05)';
          ctx.fillRect(col * cell, 0, cell, canvas.height);
          ctx.fillStyle = 'rgba(19, 24, 27, 0.55)';
          ctx.fillRect(col * cell, 0, Math.max(1, Math.round(cell * 0.1)), canvas.height);
        }
      }

      if (hoverRef.current) {
        const { x, y } = hoverRef.current;
        ctx.strokeStyle = 'rgba(19, 24, 27, 0.35)';
        ctx.lineWidth = Math.max(1, cell * 0.08);
        ctx.strokeRect(x * cell + 0.5, y * cell + 0.5, cell * brush - 1, cell * brush - 1);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  /* ---------- pointer interaction ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    let down = false;

    let last = null;

    // The brush-aligned cell under the pointer (a 2×2 block's top-left on a
    // phone, a single cell otherwise).
    const cellAt = (e) => {
      const r = canvas.getBoundingClientRect();
      const b = brushRef.current;
      const snap = (v, max) => Math.floor(clamp(Math.floor(v), 0, max - 1) / b) * b;
      return [snap(((e.clientX - r.left) / r.width) * COLS, COLS), snap(((e.clientY - r.top) / r.height) * ROWS, ROWS)];
    };

    // Painting is silent — the music is the loop, and only the play button
    // starts it.
    const paint = (x0, y0) => {
      const { color, erasing } = liveRef.current;
      const next = erasing ? EMPTY : color;
      const b = brushRef.current;
      const now = performance.now();
      for (let y = y0; y < Math.min(y0 + b, ROWS); y++) {
        for (let x = x0; x < Math.min(x0 + b, COLS); x++) {
          const i = y * COLS + x;
          if (pxRef.current[i] === next) continue;
          pxRef.current[i] = next;
          popRef.current[i] = now;
          dirtyRef.current = true;
        }
      }
    };

    // A fast stroke (especially a finger) jumps several cells between
    // pointer events — fill every block along the way so lines stay solid.
    const paintLine = (from, to) => {
      const b = brushRef.current;
      const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1])) / b;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const snap = (v) => Math.round(v / b) * b;
        paint(snap(from[0] + (to[0] - from[0]) * t), snap(from[1] + (to[1] - from[1]) * t));
      }
    };

    const onDown = (e) => {
      endIntro();
      try {
        canvas.setPointerCapture?.(e.pointerId);
      } catch {
        // capture can throw in rare cases; never let it skip the paint
      }
      down = true;
      const [x, y] = cellAt(e);
      hoverRef.current = { x, y };
      paint(x, y);
      last = [x, y];
    };
    const onMove = (e) => {
      const [x, y] = cellAt(e);
      hoverRef.current = { x, y };
      if (!down) return;
      if (last) paintLine(last, [x, y]);
      else paint(x, y);
      last = [x, y];
    };
    const onUp = () => {
      down = false;
      last = null;
    };
    const onLeave = () => {
      hoverRef.current = null;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [endIntro]);

  return (
    <div className="loop">
      <style>{CSS}</style>
      <div className="loop-canvas-wrap">
        <canvas ref={canvasRef} className="loop-board" aria-label="Paint pixels; they play as music." />
        {showHint && <div className="loop-hint">Paint with the colors below, then press play</div>}
      </div>

      <div className="loop-bar">
        <button
          type="button"
          className={'loop-play' + (playing ? ' is-on' : '')}
          onClick={() => {
            endIntro();
            if (playing) {
              stop();
              return;
            }
            // Browsers only let audio start inside the click itself, so
            // unlock Tone's context here, synchronously, when it's loaded.
            toneRef.current?.start();
            play();
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="loop-tools" role="radiogroup" aria-label="Color">
          <div className="loop-swatches">
          {PALETTE.map((p, i) => (
            <button
              key={p.c}
              type="button"
              role="radio"
              aria-checked={!erasing && i === color}
              aria-label={`Color ${i + 1}`}
              className={'loop-swatch' + (!erasing && i === color ? ' is-on' : '')}
              style={{ background: p.c }}
              onClick={() => {
                setErasing(false);
                setColor(i);
              }}
            />
          ))}
          </div>
          <button
            type="button"
            role="radio"
            aria-checked={erasing}
            aria-label="Eraser"
            className={'loop-swatch loop-eraser' + (erasing ? ' is-on' : '')}
            onClick={() => {
              setErasing(true);
            }}
          >
            <EraseIcon />
          </button>
        </div>

        <div className="loop-tail">
          <label className="loop-volume">
            <SpeakerIcon muted={volume === 0} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              aria-label="Volume"
              style={{ '--fill': `${volume * 100}%` }}
            />
          </label>
          <button
            type="button"
            className="loop-clear"
            onClick={() => {
              endIntro();
              pxRef.current.fill(EMPTY);
              dirtyRef.current = true;
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4.5l13 7.5-13 7.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" />
    </svg>
  );
}
function EraseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16l9-9 6 6-6 6H8z" />
      <path d="M9 11l6 6" />
    </svg>
  );
}
function SpeakerIcon({ muted }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  );
}

// Styled as part of the site rather than an embedded app: white canvas on
// the page's own hairline border, the site's ink color for the one primary
// control, and the same muted gray and type sizes as everything around it.
const CSS = `
.loop { width: 100%; font-family: inherit; }
.loop-canvas-wrap { position: relative; }
.loop-board {
  display: block; width: 100%; aspect-ratio: 2 / 1;
  background: #fff; border: 1px solid rgba(19,24,27,0.07); border-radius: 6px;
  image-rendering: pixelated; cursor: crosshair; touch-action: none;
}
.loop-hint {
  position: absolute; inset: 0; display: grid; place-items: center;
  pointer-events: none; color: #A8ABB2; font-size: 13px; font-weight: 300; text-align: center; padding: 0 16px;
  animation: loop-fade .6s ease;
}
.loop-bar { display: flex; align-items: center; gap: 16px; margin-top: 12px; }
.loop-play {
  flex-shrink: 0; display: inline-grid; place-items: center; width: 30px; height: 30px;
  border: 0; border-radius: 50%; background: #13181B; color: #fff; cursor: pointer;
  transition: transform .2s cubic-bezier(.34,1.45,.5,1), border-radius .25s ease;
}
.loop-play:hover { transform: scale(1.06); }
.loop-play:active { transform: scale(.92); }
.loop-play.is-on { border-radius: 8px; }
.loop-tools, .loop-swatches { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.loop-swatch {
  width: 14px; height: 14px; padding: 0; border: 0; border-radius: 3px; cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(19,24,27,0.06);
  transition: transform .18s cubic-bezier(.34,1.8,.5,1), box-shadow .15s ease;
}
.loop-swatch:hover { transform: scale(1.15); }
.loop-swatch.is-on { transform: scale(1.15); box-shadow: 0 0 0 1.5px #f4f4f5, 0 0 0 3px #13181B; }
.loop-eraser { display: grid; place-items: center; margin-left: 4px; background: #fff; color: #A8ABB2; box-shadow: inset 0 0 0 1px rgba(19,24,27,0.12); }
.loop-eraser.is-on { color: #13181B; }
.loop-tail { margin-left: auto; display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.loop-volume { display: flex; align-items: center; gap: 8px; color: #A8ABB2; cursor: pointer; }
.loop-volume input {
  -webkit-appearance: none; appearance: none; width: 72px; height: 2px; border-radius: 2px; cursor: pointer;
  background: linear-gradient(to right, #13181B var(--fill), #E4E5E8 var(--fill));
}
.loop-volume input::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #13181B; }
.loop-volume input::-moz-range-thumb { width: 10px; height: 10px; border: 0; border-radius: 50%; background: #13181B; }
.loop-clear {
  padding: 0; border: 0; background: none; font-size: 12px; font-weight: 400; color: #A8ABB2; cursor: pointer;
  transition: color .15s ease;
}
.loop-clear:hover { color: #13181B; }
@keyframes loop-fade { from { opacity: 0 } to { opacity: 1 } }
/* Phones: everything sized for a fingertip. Play, the eraser and Clear
   share the top row; the 20 colors become a full-width 10×2 grid of ~28px
   swatches (each tappable right up to its neighbors) instead of a strip of
   14px ones; the volume slider goes, since phones have volume buttons.
   .loop-tools steps out of the layout so its two parts can sit in
   different rows while staying one radio group. Touch tablets get the
   same treatment, with the palette capped so the swatches stay swatches. */
@media (max-width: 700px), (pointer: coarse) {
  .loop-bar { flex-wrap: wrap; gap: 12px; row-gap: 14px; margin-top: 14px; }
  .loop-play { width: 40px; height: 40px; }
  .loop-play.is-on { border-radius: 10px; }
  .loop-play svg { width: 14px; height: 14px; }
  .loop-tools { display: contents; }
  .loop-swatches {
    order: 3; width: 100%; max-width: 420px;
    display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 6px;
  }
  .loop-swatch { position: relative; width: 100%; height: auto; aspect-ratio: 1; border-radius: 6px; }
  .loop-swatch::after { content: ""; position: absolute; inset: -3px; }
  .loop-swatch:hover, .loop-swatch.is-on { transform: none; }
  .loop-swatch.is-on { box-shadow: 0 0 0 2px #f4f4f5, 0 0 0 3.5px #13181B; }
  .loop-eraser { width: 40px; height: 40px; aspect-ratio: auto; margin-left: 0; border-radius: 10px; }
  .loop-eraser::after { content: none; }
  .loop-eraser svg { width: 16px; height: 16px; }
  .loop-volume { display: none; }
  .loop-clear { font-size: 13px; padding: 10px 2px; }
}
@media (prefers-reduced-motion: reduce) {
  .loop-play, .loop-swatch, .loop-hint { transition: none; animation: none; }
}
`;
