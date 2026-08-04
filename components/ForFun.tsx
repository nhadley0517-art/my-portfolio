"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const posters = [
  { src: "/jesse-poster.jpg",   title: "Jesse" },
  { src: "/bryan-poster.jpg",   title: "Bryan" },
  { src: "/payton-poster.jpg",  title: "Payton" },
  { src: "/bauhaus-poster.jpg", title: "Bauhaus" },
  { src: "/cgi-poster.jpg",     title: "CGI" },
  { src: "/email-blast.png",    title: "Email Blast" },
];

export default function ForFun() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % posters.length);
  }, []);

  const prev = () => {
    setIndex((i) => (i - 1 + posters.length) % posters.length);
  };

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [index, paused, next]);

  const current = posters[index];

  return (
    <>
      {/* Preload all poster images off-screen so the browser fetches them early */}
      <div aria-hidden="true" style={{ display: "none" }}>
        {posters.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.src} src={p.src} alt="" />
        ))}
      </div>

      {/* ── Full-screen carousel ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "#0a0a0a",
          // Force GPU layer promotion for the whole carousel
          transform: "translateZ(0)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Blurred background — CSS opacity transition, GPU-composited */}
        {posters.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            src={p.src}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(24px) brightness(0.35)",
              transform: "scale(1.1) translateZ(0)",
              // CSS transition instead of Framer Motion — offloads to GPU
              opacity: i === index ? 1 : 0,
              transition: "opacity 0.6s ease",
              willChange: "opacity",
              zIndex: 0,
            }}
          />
        ))}

        {/* Foreground content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "100px 24px 60px",
            gap: "32px",
          }}
        >
          {/* Poster card — slides in/out */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              display: "flex",
              justifyContent: "center",
              willChange: "transform",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`poster-${index}`}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ width: "100%", maxWidth: "500px", willChange: "transform" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.src}
                  alt={current.title}
                  loading="eager"
                  fetchPriority="high"
                  style={{
                    width: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    borderRadius: "4px",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={`title-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
                letterSpacing: "-0.02em",
              }}
            >
              {current.title}
            </motion.h2>
          </AnimatePresence>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {posters.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to ${posters[i].title}`}
                style={{
                  width: i === index ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === index ? "#FD8973" : "rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Left arrow */}
        <button
          onClick={prev}
          aria-label="Previous"
          style={{
            position: "absolute",
            left: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: 0.6,
            transition: "opacity 0.2s",
            color: "#fff",
            fontSize: "20px",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.6"; }}
        >
          ←
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          aria-label="Next"
          style={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: 0.6,
            transition: "opacity 0.2s",
            color: "#fff",
            fontSize: "20px",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.6"; }}
        >
          →
        </button>
      </section>

      {/* ── Below carousel ── */}
      <section
        style={{
          background: "#13181B",
          padding: "80px 40px",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Outside the Brief
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.35)" }}>
          Posters and layouts made just for fun.
        </p>
      </section>
    </>
  );
}
