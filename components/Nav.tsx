"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDark = pathname === "/forfun";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  // Background colors based on route
  const bgScrolled = isDark ? "rgba(19,24,27,0.95)" : "rgba(247,245,240,0.95)";
  const bgTransparent = "rgba(0,0,0,0)";
  const linkColor = isDark ? "rgba(255,255,255,0.6)" : "#4B5563";
  const linkHoverClass = isDark ? "hover:text-white" : "hover:text-[#13181B]";
  const hamburgerStroke = isDark ? "white" : "currentColor";

  return (
    <motion.nav
      animate={{
        backgroundColor: scrolled ? bgScrolled : bgTransparent,
        backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ borderBottom: scrolled ? "1px solid rgba(128,128,128,0.15)" : "1px solid transparent" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NH" style={{ width: "36px", height: "36px", borderRadius: "8px", display: "block" }} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("work")}
            className={`text-sm font-medium transition-colors cursor-pointer ${linkHoverClass}`}
            style={{ color: linkColor }}
          >
            Work
          </button>

          <Link
            href="/forfun"
            className="text-sm font-medium transition-colors"
            style={{
              color: pathname === "/forfun" ? "#FD8973" : linkColor,
              fontWeight: pathname === "/forfun" ? 600 : 500,
            }}
          >
            For Fun
          </Link>

          <button
            onClick={() => scrollTo("contact")}
            className="text-sm font-semibold bg-[#13181B] text-white px-5 py-2.5 rounded-lg hover:bg-[#FD8973] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>

        {/* Mobile hamburger — proper X / ☰ SVG toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hamburgerStroke} strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hamburgerStroke} strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: isDark ? "#1E2428" : "rgba(247,245,240,0.98)",
              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(221,216,209,0.6)",
            }}
          >
            <div className="px-6 py-5 flex flex-col gap-5">
              <button
                onClick={() => scrollTo("work")}
                className="text-left text-base font-medium transition-colors"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#13181B" }}
              >
                Work
              </button>
              <Link
                href="/forfun"
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium"
                style={{ color: pathname === "/forfun" ? "#FD8973" : (isDark ? "rgba(255,255,255,0.7)" : "#13181B") }}
              >
                For Fun
              </Link>
              <button
                onClick={() => scrollTo("contact")}
                className="text-left text-base font-semibold"
                style={{ color: "#FD8973" }}
              >
                Contact
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
