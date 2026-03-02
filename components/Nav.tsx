"use client";

import { useState, useEffect } from "react";
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F0EEEB]/95 backdrop-blur-md border-b border-[#DDD8D1]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <a href="#" aria-label="Noah Hadley — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="NH" width="44" height="44" style={{ imageRendering: "crisp-edges", display: "block", borderRadius: "10px" }} />
        </a>

        <div className="flex items-center gap-8">
          <a
            href="#work"
            className="text-sm font-medium text-[#7D8A93] hover:text-[#13181B] transition-colors"
          >
            Work
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-[#7D8A93] hover:text-[#13181B] transition-colors"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold bg-[#13181B] text-[#F0EEEB] px-5 py-2.5 rounded-full hover:bg-[#FD8973] transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
