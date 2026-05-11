"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const mouseSpring = { stiffness: 80, damping: 20 };
const spring = { type: "spring" as const, stiffness: 300, damping: 28 };

const roles = [
  {
    company: "Grand Canyon Education",
    role: "Product Design Intern",
    period: "Oct 2024 – Apr 2026",
    description:
      "Partnered with PMs, engineers, and designers to ship improvements to a student-facing platform used by tens of thousands of GCU users. Ran user research and usability testing throughout, synthesizing findings to inform design decisions and iterate on solutions.",
  },
  {
    company: "Canyon Creative",
    role: "Product Design Intern",
    period: "Dec 2025 – Apr 2026",
    description:
      "Designed user-facing features end to end across multiple client products, from wireframes through high-fidelity UI and developer handoff. Built and maintained design systems, prototyped in Figma, and collaborated with engineering through implementation and QA.",
  },
];

function fadeUp(delay: number, opts?: { y?: number }) {
  return {
    initial: { opacity: 0, y: opts?.y ?? 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease },
  };
}

function shapeLoad(delay: number) {
  return {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, delay, ease },
  };
}

export default function Hero() {
  // Mouse parallax — offset from viewport center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, mouseSpring);
  const springY = useSpring(mouseY, mouseSpring);
  const backX = useTransform(springX, v => v * 0.02);
  const backY = useTransform(springY, v => v * 0.02);
  const frontX = useTransform(springX, v => v * 0.06);
  const frontY = useTransform(springY, v => v * 0.06);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  };

  // Card motion values — driven imperatively by scroll snap
  const heroY       = useMotionValue(0);
  const heroOpacity = useMotionValue(1);
  const heroScale   = useMotionValue(1);
  const heroRotate  = useMotionValue(0);
  const heroZIndex  = useMotionValue(2);

  // Experience card starts off-screen below for the load animation
  const expY       = useMotionValue(80);
  const expOpacity = useMotionValue(0);
  const expScale   = useMotionValue(0.94);
  const expRotate  = useMotionValue(0);
  const expZIndex  = useMotionValue(1);

  // Tracks animation state — avoids React re-renders
  const locked  = useRef(false); // true while animation is in flight
  const flipped = useRef(false); // true once exp card is in foreground

  // Refs for measuring card heights to compute mobile peek offset
  const expCardRef  = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // Load sequence — blocks scroll until complete, then hands off to scroll logic
  useEffect(() => {
    locked.current = true;

    const timer = setTimeout(async () => {
      await Promise.all([
        animate(expY, 60, { type: "spring", stiffness: 200, damping: 22 }),
        animate(expOpacity, 1, { duration: 0.3 }),
      ]);
      locked.current = false;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const animateForward = async () => {
      // Hero departs: slides up, tilts, fades; exp rises to foreground
      await Promise.all([
        animate(heroY,       -80,  spring),
        animate(heroOpacity, 0,    { duration: 0.25, ease: "easeIn" }),
        animate(heroRotate,  -4,   spring),
        animate(heroScale,   0.96, spring),
        animate(expY,        0,    spring),
        animate(expScale,    1,    spring),
      ]);
      // Invisible snap: reposition hero behind exp card at peek.
      // On mobile the exp card is single-column (taller) so 60px isn't enough —
      // compute the minimum y that lets the hero peek below the exp card.
      let peekY = 60;
      if (window.innerWidth < 768 && expCardRef.current && heroCardRef.current) {
        const expH  = expCardRef.current.offsetHeight;
        const heroH = heroCardRef.current.offsetHeight;
        // heroY + heroH * heroScale must exceed expH to peek; add 32px of peek
        peekY = Math.max(60, expH - heroH * 0.94 + 32);
      }
      heroY.set(peekY);
      heroRotate.set(0);
      heroScale.set(0.94);
      heroZIndex.set(1);
      expZIndex.set(2);
      // Fade hero back in — now peeking below exp card
      await animate(heroOpacity, 1, { duration: 0.2 });
      flipped.current = true;
      locked.current  = false;
    };

    const animateReverse = async () => {
      // Exp departs upward (mirrors hero forward); hero rises from peek
      heroZIndex.set(2);
      expZIndex.set(1);
      await Promise.all([
        animate(expY,       -80,  spring),
        animate(expOpacity, 0,    { duration: 0.25, ease: "easeIn" }),
        animate(expRotate,  -4,   spring),
        animate(expScale,   0.96, spring),
        animate(heroY,      0,    spring),
        animate(heroScale,  1,    spring),
        animate(heroRotate, 0,    spring),
      ]);
      // Invisible snap: reposition exp behind hero at peek
      expY.set(60);
      expRotate.set(0);
      expScale.set(0.94);
      await animate(expOpacity, 1, { duration: 0.2 });
      flipped.current = false;
      locked.current  = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Always block scroll while animation is running
      if (locked.current) { e.preventDefault(); return; }

      if (e.deltaY > 0 && !flipped.current) {
        e.preventDefault();
        locked.current = true;
        animateForward();
        return;
      }
      if (e.deltaY < 0 && flipped.current && window.scrollY === 0) {
        e.preventDefault();
        locked.current = true;
        animateReverse();
        return;
      }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (locked.current) { e.preventDefault(); return; }
      const dy = touchStartY - e.touches[0].clientY; // positive = swipe up = scroll down
      touchStartY = e.touches[0].clientY;

      if (dy > 0 && !flipped.current) {
        e.preventDefault();
        locked.current = true;
        animateForward();
        return;
      }
      if (dy < 0 && flipped.current && window.scrollY === 0) {
        e.preventDefault();
        locked.current = true;
        animateReverse();
        return;
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, []); // motion values and refs are stable — safe empty deps

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ padding: "144px 0 80px", background: "transparent" }}
    >
      <div style={{ width: "100%", maxWidth: "1120px", margin: "0 auto", padding: "0 24px" }}>

        {/*
          CSS Grid overlap: both cards share gridRow/gridColumn 1 — cell height
          equals the tallest card (hero), giving both cards identical dimensions.
        */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>

          {/* ── Experience card ── peeking below hero at rest */}
          <motion.div
            style={{
              gridRow: 1,
              gridColumn: 1,
              y: expY,
              opacity: expOpacity,
              scale: expScale,
              rotate: expRotate,
              zIndex: expZIndex,
              transformOrigin: "center bottom",
            }}
          >
            <div ref={expCardRef} className="exp-card">
              <p className="exp-label">Experience</p>
              <div className="exp-grid">
                {roles.map((role) => (
                  <div key={role.company}>
                    <p className="exp-period">{role.period}</p>
                    <h3 className="exp-company">{role.company}</h3>
                    <p className="exp-role">{role.role}</p>
                    <p className="exp-desc">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Hero card ── on top at rest */}
          <motion.div
            style={{
              gridRow: 1,
              gridColumn: 1,
              y: heroY,
              scale: heroScale,
              opacity: heroOpacity,
              rotate: heroRotate,
              zIndex: heroZIndex,
              transformOrigin: "center top",
            }}
          >
            <div style={{ perspective: "1000px" }}>
              {/*
                Outer container: layout + overflow clipping only.
                No background — the decoration layer (below) fades in at 600ms.
              */}
              <div
                ref={heroCardRef}
                className="hero-card"
                style={{
                  borderRadius: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Step 2 — Card shell fades in at 600ms */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "24px",
                    background: "#FFFFFF",
                    boxShadow: "0 8px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                    zIndex: 0,
                  }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                />

                {/* Back blob layer — shapes animate in during Step 1 */}
                <motion.div
                  aria-hidden
                  style={{ x: backX, y: backY, position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
                >
                  <motion.div {...shapeLoad(0.05)} style={{ position: "absolute", top: -28, right: 32, width: 120, height: 120 }}>
                    <div className="hs--back" style={{ width: 120, height: 120, background: "rgba(220,100,70,0.5)", borderRadius: "50%", animation: "hd1 13s ease-in-out infinite" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.15)} style={{ position: "absolute", top: 18, right: -10, width: 80, height: 46 }}>
                    <div className="hs--back" style={{ width: 80, height: 46, background: "rgba(100,190,140,0.5)", borderRadius: 100, animation: "hd2 10s ease-in-out infinite" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.25)} style={{ position: "absolute", bottom: 24, left: 18, width: 72, height: 72 }}>
                    <div className="hs--back" style={{ width: 72, height: 72, background: "rgba(100,170,220,0.5)", borderRadius: 18, animation: "hd3 15s ease-in-out infinite" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.35)} style={{ position: "absolute", bottom: -8, right: 80, width: 50, height: 50 }}>
                    <div className="hs--back" style={{ width: 50, height: 50, background: "rgba(230,150,100,0.45)", borderRadius: "50%", animation: "hd1 11s ease-in-out infinite 2s" }} />
                  </motion.div>
                </motion.div>

                {/* Content — Step 1 fadeUp animations, front-loaded delays */}
                <div style={{ position: "relative", zIndex: 2 }}>
                  <motion.p {...fadeUp(0.05, { y: 8 })} className="hero-label">
                    Product Designer &amp; Builder
                  </motion.p>
                  <motion.h1 {...fadeUp(0.12)} className="hero-name">
                    Noah Hadley
                  </motion.h1>
                  <motion.p {...fadeUp(0.20)} className="hero-tagline">
                    Designing things. Learning by doing.
                  </motion.p>
                  <motion.hr {...fadeUp(0.27)} className="hero-rule" />
                  <motion.p {...fadeUp(0.35)} className="hero-bio">
                    I&apos;m a product and UX designer who cares about how things feel to use,
                    not just how they look. Recently graduated from GCU, and now actively looking
                    for full-time product design roles.
                  </motion.p>
                  <motion.div {...fadeUp(0.45)} className="hero-links">
                    <motion.a
                      href="mailto:nhadley0517@gmail.com"
                      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.10)" }}
                      whileTap={{ scale: 0.97 }}
                      className="hero-btn hero-btn--outline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FD8973" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Email
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/noah-hadley/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(253,137,115,0.28)" }}
                      whileTap={{ scale: 0.97 }}
                      className="hero-btn hero-btn--filled"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                      LinkedIn
                    </motion.a>
                  </motion.div>
                </div>

                {/* Front blob layer — shapes animate in during Step 1 */}
                <motion.div
                  aria-hidden
                  style={{ x: frontX, y: frontY, position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
                >
                  <motion.div {...shapeLoad(0.10)} style={{ position: "absolute", top: 30, left: -8, width: 44, height: 70 }}>
                    <div className="hs--front" style={{ width: 44, height: 70, background: "rgba(210,80,80,0.45)", borderRadius: 100, filter: "blur(2px)", animation: "hd2 12s ease-in-out infinite 1s" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.20)} style={{ position: "absolute", bottom: 36, right: -6, width: 42, height: 42 }}>
                    <div className="hs--front" style={{ width: 42, height: 42, background: "rgba(100,170,220,0.5)", borderRadius: 10, filter: "blur(3px)", animation: "hd3 9s ease-in-out infinite" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.30)} style={{ position: "absolute", bottom: 70, left: 55, width: 32, height: 32 }}>
                    <div className="hs--front" style={{ width: 32, height: 32, background: "rgba(100,190,140,0.5)", borderRadius: "50%", filter: "blur(2px)", animation: "hd1 14s ease-in-out infinite 3s" }} />
                  </motion.div>
                  <motion.div {...shapeLoad(0.40)} style={{ position: "absolute", top: 60, right: 20, width: 28, height: 28 }}>
                    <div className="hs--front" style={{ width: 28, height: 28, background: "rgba(230,150,100,0.45)", borderRadius: "50%", filter: "blur(2px)", animation: "hd2 8s ease-in-out infinite 0.5s" }} />
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        /* Hero card */
        .hero-card { padding: 56px 52px; }
        .hero-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: #9CA3AF; margin: 0 0 20px; text-align: center;
        }
        .hero-name {
          font-size: 80px; font-weight: 800; color: #111827; line-height: 0.92;
          letter-spacing: -0.035em; margin: 0 0 18px; text-align: center;
        }
        .hero-tagline {
          font-size: 21px; font-weight: 400; color: #6B7280;
          line-height: 1.6; margin: 0 0 24px; text-align: center;
        }
        .hero-rule { border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 0 0 24px; }
        .hero-bio { font-size: 15px; color: #4B5563; line-height: 1.75; margin: 0; text-align: center; }
        .hero-links {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 28px;
        }
        .hero-btn {
          display: inline-flex; align-items: center; gap: 7px; font-size: 14px;
          font-weight: 600; padding: 11px 22px; border-radius: 8px;
          text-decoration: none; cursor: pointer;
        }
        .hero-btn--outline {
          color: #111827; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.7);
        }
        .hero-btn--filled { color: #fff; background: #FD8973; border: 1px solid transparent; }

        /* Experience card */
        .exp-card {
          background: #2667FF;
          border-radius: 24px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
          padding: 56px 52px;
          height: 100%;
          box-sizing: border-box;
        }
        .exp-label {
          font-size: 13px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 32px;
        }
        .exp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .exp-period {
          font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px;
        }
        .exp-company {
          font-size: 22px; font-weight: 800; color: #FFFFFF;
          letter-spacing: -0.015em; line-height: 1.2; margin: 0 0 4px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .exp-role {
          font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.55);
          text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;
        }
        .exp-desc { font-size: 14px; color: rgba(255,255,255,0.78); line-height: 1.7; margin: 0; }

        /* Floating shape keyframes */
        @keyframes hd1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(12px,-8px) scale(1.07); }
        }
        @keyframes hd2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(-9px,11px) scale(0.94); }
        }
        @keyframes hd3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          35%       { transform: translate(8px,10px) scale(1.05); }
          70%       { transform: translate(-6px,-5px) scale(0.97); }
        }
        .hs--back  { filter: blur(8px); opacity: 0.3; }
        .hs--front { opacity: 0.45; }

        @media (max-width: 767px) {
          .hero-card    { padding: 36px 28px !important; }
          .hero-name    { font-size: clamp(52px, 13vw, 72px); }
          .hero-tagline { font-size: 18px; }
          .exp-card     { padding: 36px 28px; }
          .exp-grid     { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>
    </div>
  );
}
