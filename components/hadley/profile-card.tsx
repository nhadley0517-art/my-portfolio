"use client";

import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue, type PanInfo } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const ui = { duration: 0.2, ease: [0.2, 0, 0, 1] } as const;
/** The snap after a drag: a quick swoosh out, a crisp landing. */
const move = { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as const;

const PHONE = 320;
const DESK = 720;
const FOLLOW_W = 112;
const MESSAGE_W = 100;

const tones = {
  light: {
    card: "bg-white text-[#13181b]",
    muted: "text-[#13181b]/50",
    ring: "#ffffff",
    follow: "bg-[#13181b] text-white hover:bg-[#2a2f32]",
    following: "bg-[#13181b]/[0.06] text-[#13181b]",
    quiet: "bg-[#13181b]/[0.06] text-[#13181b] hover:bg-[#13181b]/[0.09]",
    chip: "bg-[#13181b]/[0.06] text-[#13181b]/60",
    tab: "text-[#13181b]/45 hover:text-[#13181b]",
    rule: "bg-[#13181b]/[0.07]",
    handle: "bg-[#13181b]/20 group-hover/handle:bg-[#13181b]/45",
    stroke: "shadow-[0_0_0_1px_rgb(19_24_27/0.1)]",
  },
  dark: {
    card: "bg-[#13181b] text-white",
    muted: "text-white/50",
    ring: "#13181b",
    follow: "bg-white text-[#13181b] hover:bg-white/90",
    following: "bg-white/[0.1] text-white",
    quiet: "bg-white/[0.1] text-white hover:bg-white/[0.14]",
    chip: "bg-white/[0.1] text-white/60",
    tab: "text-white/45 hover:text-white",
    rule: "bg-white/[0.08]",
    handle: "bg-white/25 group-hover/handle:bg-white/50",
    stroke: "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]",
  },
};

type View = "phone" | "desktop";

type ProfileCardProps = {
  name: string;
  handle: string;
  bio?: string;
  /** Their photo. Without one, a pixel bear. */
  avatar?: string;
  /** Their banner. Without one, a pixel-art landscape is drawn. */
  cover?: string;
  followers: number;
  following: number;
  /** Shows a "Follows you" chip, which becomes "Mutuals" when you follow back. */
  followsYou?: boolean;
  online?: boolean;
  /** Your own profile: Edit instead of Follow, and the banner and avatar can be changed. */
  own?: boolean;
  onChangeCover?: () => void;
  onChangeAvatar?: () => void;
  /** Phone or desktop. Drag the right edge to stretch between them. */
  view?: View;
  defaultView?: View;
  onViewChange?: (view: View) => void;
  tabs?: string[];
  defaultFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
  tone?: "light" | "dark";
  stroke?: boolean;
  radius?: number;
  className?: string;
};

/** Widths (of the card) where the layout steps, with a little hysteresis so it never flickers. */
const SIDE = { up: 520, down: 505 };
const INLINE = { up: 640, down: 625 };
/** Widths over which the Message button and the tabs scrub in with the drag. */
const MESSAGE_IN: [number, number] = [580, 660];
const TABS_IN: [number, number] = [650, 712];
/** Every layout step glides on the same spring as the snap. */
const glide = { duration: 0.5, ease: [0.16, 1, 0.3, 1] } as const;

/**
 * A profile that stretches. Drag its edge from a phone card out to a desktop
 * header. The card steps through real layouts on a grid: the name moves up
 * beside the avatar, then the stats move into line with the bio. Each step
 * glides; everything in between scrubs with your hand: the avatar grows, the
 * banner deepens, Message slides in, and the tabs arrive one by one.
 */
export function ProfileCard({
  name,
  handle,
  bio,
  avatar,
  cover,
  followers,
  following,
  followsYou = false,
  online = true,
  own = false,
  onChangeCover,
  onChangeAvatar,
  view,
  defaultView = "phone",
  onViewChange,
  tabs = ["Posts", "Replies", "Media", "Likes"],
  defaultFollowing = false,
  onFollowChange,
  tone = "light",
  stroke = false,
  radius = 24,
  className = "",
}: ProfileCardProps) {
  const t = tones[tone];
  const uid = useId();
  const target = view ?? defaultView;
  const width = useMotionValue(target === "desktop" ? DESK : PHONE);
  const [side, setSide] = useState(target === "desktop");
  const [inline, setInline] = useState(target === "desktop");
  const [tabsOn, setTabsOn] = useState(target === "desktop");
  const [dragging, setDragging] = useState(false);
  const start = useRef({ w: 0, scale: 1 });
  const card = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const bodyTarget = useMotionValue(0);
  const bodyH = useSpring(bodyTarget, { stiffness: 520, damping: 46 });
  const [isFollowing, setFollowing] = useState(defaultFollowing);
  const [hover, setHover] = useState(false);
  const [tab, setTab] = useState(tabs[0]);
  const count = followers + (isFollowing && !defaultFollowing ? 1 : !isFollowing && defaultFollowing ? -1 : 0);
  const label = isFollowing ? (hover ? "Unfollow" : "Following") : "Follow";
  const chip = followsYou ? (isFollowing ? "Mutuals" : "Follows you") : null;

  // Continuous: these follow the width exactly, so a slow drag is a slow change.
  const bannerH = useTransform(width, [PHONE, DESK], [132, 208], { clamp: true });
  const padX = useTransform(width, [PHONE, DESK], [20, 32], { clamp: true });
  const padB = useTransform(width, [PHONE, DESK], [24, 10], { clamp: true });
  const avatarSize = useTransform(width, [PHONE, DESK], [72, 104], { clamp: true });
  const messageW = useTransform(width, MESSAGE_IN, [0, MESSAGE_W], { clamp: true });
  const messageGap = useTransform(width, MESSAGE_IN, [0, 8], { clamp: true });
  const messageOpacity = useTransform(width, [MESSAGE_IN[0] + 30, MESSAGE_IN[1]], [0, 1], { clamp: true });
  const tabsH = useTransform(width, TABS_IN, [0, 56], { clamp: true });
  const tabsP = useTransform(width, TABS_IN, [0, 1], { clamp: true });

  const who = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const before = useRef<Map<HTMLElement, DOMRect> | null>(null);
  // True from the moment the layout decides to step until the step's glides are set; rewraps in that
  // window are already covered by the step.
  const stepping = useRef(false);
  const movers = () => [who, actions, bioRef, statsRef, tabsRef].map((r) => r.current).filter((el): el is NonNullable<typeof el> => !!el);
  // Each piece's glide offset, as motion values it owns.
  const shift = {
    who: { x: useMotionValue(0), y: useMotionValue(0) },
    actions: { x: useMotionValue(0), y: useMotionValue(0) },
    bio: { x: useMotionValue(0), y: useMotionValue(0) },
    stats: { x: useMotionValue(0), y: useMotionValue(0) },
    tabs: { x: useMotionValue(0), y: useMotionValue(0) },
  };
  // How far the stats still are toward the right edge, 1 to 0, while they glide home from being in line.
  // Tied to the live width, so if the card keeps shrinking they come along and never overhang.
  const statsHome = useMotionValue(0);
  const statsSpan = (w: number) => w - 16 - 2 * padX.get() - (statsRef.current?.offsetWidth ?? 0);
  const statsX = useTransform(() => shift.stats.x.get() + statsHome.get() * statsSpan(width.get()));
  const wasInline = useRef(inline);
  const shiftOf = (node: HTMLElement) =>
    node === who.current ? shift.who : node === actions.current ? shift.actions : node === bioRef.current ? shift.bio : node === statsRef.current ? shift.stats : shift.tabs;

  // When the layout steps, each piece glides from where it was to where it now belongs.
  // Measured on screen, converted through the card's scale, so it's right even when the card is
  // shown scaled down (in a gallery, or blown up in demo mode).
  useLayoutEffect(() => {
    const was = before.current;
    const el = card.current;
    if (!was || !el) return;
    before.current = null;
    requestAnimationFrame(() => (stepping.current = false));
    const scale = el.getBoundingClientRect().width / el.offsetWidth || 1;
    for (const node of movers()) {
      const from = was.get(node);
      if (!from) continue;
      const to = node.getBoundingClientRect();
      const dx = (from.left - to.left) / scale;
      const dy = (from.top - to.top) / scale;
      if (Math.abs(dx) + Math.abs(dy) < 0.5) continue;
      const m = shiftOf(node);
      if (node === statsRef.current) {
        // Fold whatever edge-anchored offset is left into the plain one, then decide how to leave.
        const span = statsSpan(width.get());
        if (wasInline.current && !inline) {
          // Leaving the right edge: start fully edge-anchored, and let go of the edge as it glides.
          const carried = m.x.get() + statsHome.get() * span + dx;
          statsHome.set(1);
          m.x.set(carried - span);
          animate(statsHome, [1, 0], glide);
        } else {
          // Any other step keeps whatever edge-anchoring is still in flight, and adds its own move.
          m.x.set(m.x.get() + dx);
        }
        animate(m.x, [m.x.get(), 0], glide);
        animate(m.y, [m.y.get() + dy, 0], glide);
        continue;
      }
      // Start from where it visibly was, including any glide still in progress.
      animate(m.x, [m.x.get() + dx, 0], glide);
      animate(m.y, [m.y.get() + dy, 0], glide);
    }
    wasInline.current = inline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, inline]);

  // When the bio rewraps (two lines to one, or back), the rows under it glide up or down instead of jumping.
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (!el) return;
    let last = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      const dh = h - last;
      last = h;
      // Only when it's stacked above them; in line, the stats sit beside it.
      if (!dh || stepping.current || inline) return;
      for (const m of [shift.stats, shift.tabs]) animate(m.y, [m.y.get() - dh, 0], glide);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inline]);

  // Stepped: the layout only changes at these widths, and React only re-renders there.
  useMotionValueEvent(width, "change", (w) => {
    const nextSide = side ? w >= SIDE.down : w >= SIDE.up;
    const nextInline = inline ? w >= INLINE.down : w >= INLINE.up;
    if (nextSide !== side || nextInline !== inline) {
      // Where everything is right now, before the grid changes under it.
      before.current = new Map(movers().map((el) => [el, el.getBoundingClientRect()]));
      stepping.current = true;
      setSide(nextSide);
      setInline(nextInline);
    }
    const on = w > (TABS_IN[0] + TABS_IN[1]) / 2;
    if (on !== tabsOn) setTabsOn(on);
  });

  // The card's height follows its content on a spring, always: closely while you drag, gliding when
  // the layout steps. Nothing is ever drawn past the card's edge while it catches up; it's clipped.
  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    bodyTarget.set(el.offsetHeight);
    bodyH.jump(el.offsetHeight);
    const ro = new ResizeObserver(() => bodyTarget.set(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [bodyH, bodyTarget]);

  // A view set from outside (or a snap after a drag) eases the width there.
  useEffect(() => {
    const c = animate(width, target === "desktop" ? DESK : PHONE, move);
    return () => c.stop();
  }, [target, width]);

  function settle(info: PanInfo) {
    setDragging(false);
    const v = width.get();
    const next: View = info.velocity.x > 300 ? "desktop" : info.velocity.x < -300 ? "phone" : v > (PHONE + DESK) / 2 ? "desktop" : "phone";
    if (view === undefined || next === view) animate(width, next === "desktop" ? DESK : PHONE, { ...move, velocity: info.velocity.x / start.current.scale });
    onViewChange?.(next);
  }

  function toggle() {
    setFollowing(!isFollowing);
    setHover(false);
    onFollowChange?.(!isFollowing);
  }

  // The grid for each step. Columns: avatar, name, actions.
  const areas = inline
    ? `"avatar who actions" "bio bio stats" "tabs tabs tabs"`
    : side
      ? `"avatar who actions" "bio bio bio" "stats stats stats" "tabs tabs tabs"`
      : `"avatar . actions" "who who who" "bio bio bio" "stats stats stats" "tabs tabs tabs"`;

  return (
    <motion.div
      ref={card}
      style={{ width, borderRadius: radius }}
      className={`relative max-w-full p-2 text-[13px] ${t.card} ${stroke ? t.stroke : ""} ${className}`}
    >
      <motion.div className="group/cover relative overflow-hidden" style={{ height: bannerH, borderRadius: Math.max(radius - 6, 4) }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" draggable={false} decoding="async" />
        ) : (
          <Landscape />
        )}
        {own && (
          <button
            type="button"
            onClick={onChangeCover}
            className="absolute bottom-2.5 right-2.5 flex h-7 items-center gap-1.5 rounded-full bg-[#13181b]/70 px-2.5 text-[12px] text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 focus-visible:opacity-100 group-hover/cover:opacity-100"
          >
            <Camera /> Change cover
          </button>
        )}
      </motion.div>

      {/* Clipped only at the bottom: the avatar still rises over the banner. */}
      <motion.div style={{ height: bodyH, clipPath: "inset(-200px -80px 0 -80px)" }}>
        <motion.div
          ref={content}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-5"
          style={{ gridTemplateAreas: areas, paddingLeft: padX, paddingRight: padX, paddingBottom: padB }}
        >
          {/* Avatar: its size scrubs with the width; it never changes cell, so it never jumps. */}
          <motion.span className="group/avatar relative block" style={{ gridArea: "avatar", width: avatarSize, height: avatarSize, marginTop: -36 }}>
            <span className="block size-full overflow-hidden rounded-full" style={{ boxShadow: `0 0 0 5px ${t.ring}` }}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="size-full object-cover" />
              ) : (
                <PixelBear />
              )}
            </span>
            {own && (
              <button
                type="button"
                onClick={onChangeAvatar}
                aria-label="Change photo"
                className="absolute inset-0 grid place-items-center rounded-full bg-[#13181b]/50 text-white opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover/avatar:opacity-100"
              >
                <Camera />
              </button>
            )}
            {online && !own && (
              <span className="absolute bottom-[6%] right-[6%] size-4 rounded-full bg-[#13181b]" style={{ boxShadow: `0 0 0 3.5px ${t.ring}` }} aria-label="Online">
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#13181b]"
                  animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", repeatDelay: 0.6 }}
                />
              </span>
            )}
          </motion.span>

          {/* Name and handle: under the avatar on a phone, up beside it once there's room. */}
          <motion.div ref={who} className={`min-w-0 self-start whitespace-nowrap ${side ? "mt-[18px]" : "mt-4"}`} style={{ gridArea: "who", x: shift.who.x, y: shift.who.y }}>
            <motion.div className="truncate tracking-[-0.01em]" initial={false} animate={{ fontSize: side ? 20 : 16, lineHeight: side ? "28px" : "24px" }} transition={glide}>
              {name}
            </motion.div>
            <div className={`flex items-center gap-2 ${t.muted}`}>
              <span className="truncate">@{handle}</span>
              {chip && (
                <span className={`relative inline-flex h-5 shrink-0 items-center overflow-hidden rounded-full px-2 text-[11px] ${t.chip}`}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={chip} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={ui}>
                      {chip}
                    </motion.span>
                  </AnimatePresence>
                </span>
              )}
            </div>
          </motion.div>

          {/* Actions, always flush right. Message opens up beside Follow as the card widens. */}
          <motion.div ref={actions} className="mt-5 flex self-start justify-self-end" style={{ gridArea: "actions", x: shift.actions.x, y: shift.actions.y }}>
            {!own && (
              <motion.div className="overflow-hidden" style={{ width: messageW, marginRight: messageGap }}>
                <motion.button
                  type="button"
                  tabIndex={tabsOn ? 0 : -1}
                  aria-hidden={!tabsOn}
                  className={`h-9 rounded-full transition-colors ${t.quiet}`}
                  style={{ width: MESSAGE_W, opacity: messageOpacity }}
                >
                  Message
                </motion.button>
              </motion.div>
            )}
            {own ? (
              <button type="button" className={`h-9 rounded-full px-4 transition-colors ${t.quiet}`}>
                Edit profile
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={toggle}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                aria-pressed={isFollowing}
                whileTap={{ scale: 0.95 }}
                style={{ width: FOLLOW_W }}
                className={`relative h-9 shrink-0 overflow-hidden rounded-full transition-colors duration-200 ${isFollowing ? t.following : t.follow}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={label}
                    className="flex items-center justify-center gap-1.5"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={ui}
                  >
                    {label === "Following" && (
                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                        <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.05 }} />
                      </svg>
                    )}
                    {label}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            )}
          </motion.div>

          {bio && (
            <motion.p ref={bioRef} className={`max-w-[380px] leading-5 ${side ? "mt-5" : "mt-3"}`} style={{ gridArea: "bio", x: shift.bio.x, y: shift.bio.y }}>
              {bio}
            </motion.p>
          )}

          {/* Stats: their own row, then in line with the bio, flush with the buttons above. */}
          <motion.div
            ref={statsRef}
            className={`flex gap-5 whitespace-nowrap ${inline ? "mt-5 justify-self-end" : "mt-4 justify-self-start"}`}
            style={{ gridArea: "stats", x: statsX, y: shift.stats.y }}
          >
            <span>
              <Count value={count} /> <span className={t.muted}>followers</span>
            </span>
            <span>
              {following.toLocaleString("en-US")} <span className={t.muted}>following</span>
            </span>
          </motion.div>

          {/* Tabs scrub in over the last stretch: the row opens, the rule draws, each tab rises in turn. */}
          <motion.div ref={tabsRef} className="relative overflow-hidden" style={{ gridArea: "tabs", height: tabsH, x: shift.tabs.x, y: shift.tabs.y }} aria-hidden={!tabsOn}>
            <div role="tablist" className="absolute inset-x-0 bottom-0 flex gap-1" style={{ pointerEvents: tabsOn ? "auto" : "none" }}>
              {tabs.map((name, i) => (
                <Tab key={name} name={name} index={i} count={tabs.length} p={tabsP} on={tab === name} live={tabsOn} uid={uid} t={t} onPick={() => setTab(name)} />
              ))}
              <Rule p={tabsP} t={t} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The stretch handle, with a width readout while you drag. */}
      <motion.div
        className="group/handle absolute -right-3 top-1/2 flex h-16 w-6 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center"
        onPanStart={() => {
          const el = card.current;
          const scale = el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
          start.current = { w: width.get(), scale };
          setDragging(true);
        }}
        onPan={(_, info) => width.set(Math.max(PHONE - 20, Math.min(DESK + 30, start.current.w + info.offset.x / start.current.scale)))}
        onPanEnd={(_, info) => settle(info)}
        role="separator"
        aria-orientation="vertical"
        aria-label="Stretch between phone and desktop"
      >
        <span className={`h-9 w-1 rounded-full transition-colors ${dragging ? "bg-[#13181b]/60" : t.handle}`} />
        <AnimatePresence>{dragging && <Readout width={width} side={side} />}</AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/** The width while you drag. It reads the motion value directly, so the card doesn't re-render per frame. */
function Readout({ width, side }: { width: MotionValue<number>; side: boolean }) {
  const px = useTransform(width, (w) => Math.round(w));
  return (
    <motion.span
      className="pointer-events-none absolute left-7 whitespace-nowrap rounded-full bg-[#13181b] px-2 py-1 font-mono text-[10.5px] tabular-nums text-white"
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={ui}
    >
      {side ? "DESKTOP" : "PHONE"} · <motion.span>{px}</motion.span>
    </motion.span>
  );
}

function Tab({
  name,
  index,
  count,
  p,
  on,
  live,
  uid,
  t,
  onPick,
}: {
  name: string;
  index: number;
  count: number;
  p: MotionValue<number>;
  on: boolean;
  live: boolean;
  uid: string;
  t: (typeof tones)["light"];
  onPick: () => void;
}) {
  // Each tab gets its own slice of the stretch, overlapping the next, so they rise in turn.
  const from = (index / count) * 0.6;
  const opacity = useTransform(p, [from, from + 0.4], [0, 1]);
  const y = useTransform(p, [from, from + 0.4], [10, 0]);
  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={on}
      tabIndex={live ? 0 : -1}
      onClick={onPick}
      className={`relative h-11 px-3 outline-none transition-colors first:-ml-3 ${on ? "" : t.tab}`}
      style={{ opacity, y }}
    >
      {name}
      {on && <motion.span layoutId={`${uid}-tab`} className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-current" transition={{ type: "spring", visualDuration: 0.25, bounce: 0.1 }} />}
    </motion.button>
  );
}

/** The hairline under the tabs draws across as they arrive. */
function Rule({ p, t }: { p: MotionValue<number>; t: (typeof tones)["light"] }) {
  const scaleX = useTransform(p, [0, 0.9], [0, 1]);
  return <motion.span className={`absolute inset-x-0 bottom-0 h-px origin-left ${t.rule}`} style={{ scaleX }} />;
}

/** The default avatar: a pixel bear, drawn on a 16-cell grid. */
const BEAR = [
  "................",
  "..bbb......bbb..",
  ".bmpmb....bmpmb.",
  ".bmmmbbbbbbmmmb.",
  "..bmhmmmmmmmmb..",
  ".bmhmmmmmmmmmmb.",
  ".bmmmmmmmmmmmmb.",
  ".bmmkkmmmmkkmmb.",
  ".bmmkkmmmmkkmmb.",
  ".bmmmmmllmmmmmb.",
  ".bmmmmllllmmmmb.",
  ".bmmmllkkllmmmb.",
  "..bmmllllllmmb..",
  "..bbmmllllmmbb..",
  "....bbbbbbbb....",
  "................",
];
const FUR: Record<string, string> = { b: "#4a2f1c", m: "#8a5a35", h: "#a8744a", l: "#e2c29a", k: "#1b1512", p: "#d08a76" };

function PixelBear() {
  const cells: { x: number; y: number; c: string }[] = [];
  BEAR.forEach((row, y) => [...row].forEach((ch, x) => FUR[ch] && cells.push({ x, y, c: FUR[ch] })));
  return (
    <svg viewBox="-3 -2 22 22" className="size-full bg-[#cfe3ee]" shapeRendering="crispEdges" aria-hidden>
      {/* Shoulders, so it sits in the frame like a portrait. */}
      <rect x="-3" y="15" width="22" height="7" fill="#6e4528" />
      {cells.map(({ x, y, c }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c} />
      ))}
    </svg>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ type: "spring", visualDuration: 0.3, bounce: 0.2 }}>
          {value.toLocaleString("en-US")}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Camera() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 5.5a1 1 0 0 1 1-1h2l1-1.5h4l1 1.5h2a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      <circle cx="8" cy="8.5" r="2.2" />
    </svg>
  );
}

/* ---------- The banner: a pixel landscape, painted in layers ---------- */

/** One art pixel, in CSS pixels. */
const P = 3;
/** Spare art pixels each side, so layers can shift without showing an edge. */
const M = 8;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
/** Deterministic noise, so the world is the same every time and extends as the banner widens. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  // ABGR, for a Uint32 view over RGBA bytes.
  return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16);
};
const SKY = ["#3f74b8", "#5a8fd0", "#7fb1e2", "#a9d0ee", "#d6eaf2"].map(hex);
const CLOUD = { lit: hex("#fffdf5"), mid: hex("#e9eef3"), shade: hex("#c5d3e2"), base: hex("#a9bdd3") };
const FAR = { top: hex("#9cc3a3"), body: hex("#7eac8c"), deep: hex("#6c9c7c") };
const NEAR = { top: hex("#9ccd5f"), body: hex("#6aa648"), deep: hex("#4f8a3a"), dark: hex("#3e7231") };
const TREE = { lit: hex("#4f8f3f"), body: hex("#336a32"), deep: hex("#244f27"), trunk: hex("#5b4630") };
const HOUSE = { wall: hex("#f1e8d1"), wallShade: hex("#d8cbae"), roof: hex("#c4553b"), roofShade: hex("#9c3f2c"), window: hex("#2c3a46") };

/** Sky, clouds, far hills, near hills: how much each shifts with the cursor. */
const DEPTHS = [0, 0.2, 0.45, 1];

function Landscape() {
  const box = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLCanvasElement | null)[]>([]);

  // Repaint at the banner's size; the world is anchored left, so widening reveals more of it.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const paint = () => {
      const W = Math.ceil(el.offsetWidth / P) + M * 2;
      const H = Math.ceil(el.offsetHeight / P);
      if (W <= M * 2 || !H) return;
      const painters = [sky, clouds, far, near];
      layers.current.forEach((cv, i) => {
        if (!cv) return;
        if (cv.width !== W || cv.height !== H) {
          cv.width = W;
          cv.height = H;
        }
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(W, H);
        const px = new Uint32Array(img.data.buffer);
        painters[i](px, W, H);
        ctx.putImageData(img, 0, 0);
        cv.style.width = `${W * P}px`;
        cv.style.height = `${H * P}px`;
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className="absolute inset-0"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        // Nearer layers move more; every shift snaps to whole art pixels so nothing blurs.
        const k = ((e.clientX - r.left) / r.width - 0.5) * -2 * M;
        layers.current.forEach((cv, i) => cv && (cv.style.transform = `translateX(${Math.round(k * DEPTHS[i]) * P}px)`));
      }}
      onPointerLeave={() => layers.current.forEach((cv) => cv && (cv.style.transform = ""))}
      aria-hidden
    >
      {DEPTHS.map((_, i) => (
        <canvas
          key={i}
          ref={(node) => {
            layers.current[i] = node;
          }}
          className="absolute bottom-0 [image-rendering:pixelated] transition-transform duration-300 ease-out"
          style={{ left: -M * P }}
        />
      ))}
    </div>
  );
}

function sky(px: Uint32Array, W: number, H: number) {
  for (let y = 0; y < H; y++) {
    const t = (y / H) * (SKY.length - 1);
    for (let x = 0; x < W; x++) {
      const i = Math.min(SKY.length - 1, Math.floor(t) + (t % 1 > bayer(x, y) ? 1 : 0));
      px[y * W + x] = SKY[i];
    }
  }
}

/** Big summer cumulus: stacked puffs, lit from the upper left, flat dark bases. */
function clouds(px: Uint32Array, W: number, H: number) {
  for (let c = 0; c * 62 < W + 50; c++) {
    const cx = c * 62 + 14 + Math.floor(hash(c) * 22);
    const base = Math.floor(H * (0.46 + hash(c + 9) * 0.12));
    const size = 9 + Math.floor(hash(c + 3) * 6) + (c % 3 === 1 ? 6 : 0);
    const puffs: [number, number, number][] = [
      [cx, base - size * 0.4, size],
      [cx - size * 0.9, base - size * 0.15, size * 0.65],
      [cx + size * 0.95, base - size * 0.2, size * 0.7],
      [cx + size * 0.2, base - size * 1.15, size * 0.75],
    ];
    // The towering one gets another tier.
    if (c % 3 === 1) puffs.push([cx - size * 0.2, base - size * 1.8, size * 0.55]);
    for (let y = Math.max(0, Math.floor(base - size * 2.6)); y <= base && y < H; y++) {
      for (let x = Math.max(0, Math.floor(cx - size * 2)); x < Math.min(W, cx + size * 2); x++) {
        let inside = false;
        let shade = 0;
        for (const [px0, py0, r] of puffs) {
          const d = Math.hypot(x - px0, (y - py0) * 1.1);
          if (d <= r) {
            inside = true;
            // Light from the upper left: how far toward the lower right of this puff.
            shade = Math.max(shade, ((x - px0) * 0.6 + (y - py0) * 0.9) / r);
          }
        }
        if (!inside) continue;
        const b = bayer(x, y) - 0.5;
        const v = shade + b * 0.35;
        px[y * W + x] = y >= base - 1 ? CLOUD.base : v > 0.55 ? CLOUD.shade : v > 0.15 ? CLOUD.mid : CLOUD.lit;
      }
    }
  }
}

const farLine = (x: number, H: number) => Math.floor(H * 0.64 + Math.sin(x * 0.045) * 4 + Math.sin(x * 0.013 + 1) * 5);
const nearLine = (x: number, H: number) => Math.floor(H * 0.8 + Math.sin(x * 0.028 + 2) * 6 + Math.sin(x * 0.071) * 2);

function far(px: Uint32Array, W: number, H: number) {
  for (let x = 0; x < W; x++) {
    const top = farLine(x, H);
    for (let y = Math.max(0, top); y < H; y++) {
      const d = y - top;
      px[y * W + x] = d === 0 ? FAR.top : d > 6 && bayer(x, y) < 0.5 ? FAR.deep : FAR.body;
    }
  }
}

function near(px: Uint32Array, W: number, H: number) {
  for (let x = 0; x < W; x++) {
    const top = nearLine(x, H);
    for (let y = Math.max(0, top); y < H; y++) {
      const d = y - top;
      // Sunlit lip, a dithered falloff, and darker ground at the bottom.
      const v = d / 10 + (bayer(x, y) - 0.5) * 0.5;
      px[y * W + x] = d === 0 || (d === 1 && hash(x) > 0.6) ? NEAR.top : v < 0.4 ? NEAR.body : v < 1 ? NEAR.deep : NEAR.dark;
    }
  }
  // Grass tufts along the ridge.
  for (let x = 0; x < W; x++) {
    if (hash(x + 77) > 0.82) {
      const y = nearLine(x, H) - 1;
      if (y >= 0) px[y * W + x] = NEAR.top;
    }
  }
  tree(px, W, H, M + 22);
  tree(px, W, H, M + 131, 0.8);
  house(px, W, H, M + 168);
  tree(px, W, H, M + 214, 1.15);
}

function tree(px: Uint32Array, W: number, H: number, x0: number, s = 1) {
  if (x0 > W + 10) return;
  const ground = nearLine(x0, H);
  const put = (x: number, y: number, c: number) => x >= 0 && x < W && y >= 0 && y < H && (px[y * W + x] = c);
  const trunk = Math.round(7 * s);
  for (let y = ground - trunk; y <= ground; y++) for (let x = x0; x < x0 + 2; x++) put(x, y, TREE.trunk);
  const r = 7 * s;
  const cy = ground - trunk - r * 0.55;
  for (let y = Math.floor(cy - r * 1.3); y <= cy + r * 0.8; y++) {
    for (let x = Math.floor(x0 - r * 1.2); x <= x0 + r * 1.3; x++) {
      const blob = [
        [x0 + 1, cy, r],
        [x0 - r * 0.45, cy + r * 0.2, r * 0.7],
        [x0 + r * 0.55, cy - r * 0.35, r * 0.75],
      ].some(([bx, by, br]) => Math.hypot(x - bx, y - by) <= br);
      if (!blob) continue;
      const lit = (x0 - x) * 0.5 + (cy - y) * 0.9 + (bayer(x, y) - 0.5) * 4;
      put(x, y, lit > 3 ? TREE.lit : lit > -3 ? TREE.body : TREE.deep);
    }
  }
}

function house(px: Uint32Array, W: number, H: number, x0: number) {
  if (x0 > W + 10) return;
  const ground = nearLine(x0 + 5, H);
  const put = (x: number, y: number, c: number) => x >= 0 && x < W && y >= 0 && y < H && (px[y * W + x] = c);
  for (let y = ground - 6; y <= ground; y++) for (let x = x0; x < x0 + 11; x++) put(x, y, x > x0 + 7 ? HOUSE.wallShade : HOUSE.wall);
  // Pitched red roof with an overhang.
  for (let i = 0; i < 5; i++) for (let x = x0 - 1 + i; x < x0 + 12 - i; x++) put(x, ground - 7 - i, x > x0 + 5 ? HOUSE.roofShade : HOUSE.roof);
  put(x0 + 2, ground - 4, HOUSE.window);
  put(x0 + 3, ground - 4, HOUSE.window);
  put(x0 + 2, ground - 3, HOUSE.window);
  put(x0 + 3, ground - 3, HOUSE.window);
  for (let y = ground - 3; y <= ground; y++) put(x0 + 7, y, HOUSE.window);
}
