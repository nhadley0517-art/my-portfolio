"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const WorkIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const FunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const ContactIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 6 10 7L22 6" />
  </svg>
);

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDark = pathname === "/forfun";

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const isWorkActive = pathname === "/";
  const linkColor = isDark ? "rgba(255,255,255,0.75)" : "#4B5563";
  const contactBg = isDark ? "#fff" : "#111827";
  const contactColor = isDark ? "#111827" : "#fff";

  return (
    <>
      {/* Fixed centered container */}
      <div
        style={{
          position: "fixed",
          top: "28px",
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Pill */}
        <motion.div
          initial={{ clipPath: "inset(0 48% 0 48% round 100px)" }}
          animate={{ clipPath: "inset(0 0% 0 0% round 100px)" }}
          transition={{ ...spring, delay: 0.05 }}
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            borderRadius: "100px",
            background: isDark ? "rgba(18,18,22,0.80)" : "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.5)",
            boxShadow: isDark
              ? "0 2px 16px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12)"
              : "0 2px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
            padding: "4px 6px 4px 26px",
            gap: "4px",
          }}
        >
          {/* Contents fade in after pill expands */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.22 }}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {/* Logo */}
            <Link href="/" style={{ marginRight: "16px", display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="NH"
                style={{ width: "28px", height: "28px", borderRadius: "6px", display: "block" }}
              />
            </Link>

            {/* Desktop links */}
            <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => scrollTo("work")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "14px",
                  fontWeight: isWorkActive ? 600 : 500,
                  color: isWorkActive ? "#FD8973" : linkColor,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 13px",
                  borderRadius: "100px",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
                  if (!isWorkActive) (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#fff" : "#111827";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "none";
                  (e.currentTarget as HTMLButtonElement).style.color = isWorkActive ? "#FD8973" : linkColor;
                }}
              >
                <WorkIcon />
                Work
              </button>

              <Link
                href="/forfun"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "14px",
                  fontWeight: pathname === "/forfun" ? 600 : 500,
                  color: pathname === "/forfun" ? "#FD8973" : linkColor,
                  textDecoration: "none",
                  padding: "6px 13px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "none";
                }}
              >
                <FunIcon />
                For Fun
              </Link>

              {/* Contact button */}
              <motion.a
                href="mailto:nhadley0517@gmail.com"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: contactColor,
                  background: contactBg,
                  textDecoration: "none",
                  padding: "6px 18px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  marginLeft: "4px",
                }}
              >
                <ContactIcon />
                Contact
              </motion.a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{
                display: "none",
                background: "none",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                color: linkColor,
                marginLeft: "8px",
              }}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile dropdown — sits below the pill */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 49,
              background: isDark ? "rgba(18,18,22,0.95)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: "20px",
              border: "1px solid rgba(128,128,128,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              padding: "8px",
              minWidth: "200px",
              pointerEvents: "auto",
            }}
          >
            <button
              onClick={() => scrollTo("work")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                textAlign: "left",
                fontSize: "15px",
                fontWeight: 500,
                color: isDark ? "rgba(255,255,255,0.8)" : "#111827",
                background: "none",
                border: "none",
                padding: "12px 16px",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              <WorkIcon />
              Work
            </button>
            <Link
              href="/forfun"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                fontWeight: pathname === "/forfun" ? 600 : 500,
                color: pathname === "/forfun" ? "#FD8973" : (isDark ? "rgba(255,255,255,0.8)" : "#111827"),
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: "12px",
              }}
            >
              <FunIcon />
              For Fun
            </Link>
            <a
              href="mailto:nhadley0517@gmail.com"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#FD8973",
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: "12px",
              }}
            >
              <ContactIcon />
              Contact
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
