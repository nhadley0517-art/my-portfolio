"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const goContact = () => {
    window.location.href = "mailto:nhadley0517@gmail.com";
  };

  return (
    <header className="nh-nav-header">
      <div className="nh-nav-pill">
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Noah Hadley" style={{ width: "28px", height: "28px", borderRadius: "7px", display: "block" }} />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/" className={"nh-nav-link" + (isHome ? " nh-nav-link--current" : "")}>Home</Link>
          <button type="button" onClick={goContact} className="nh-nav-link nh-nav-btn">Contact</button>
        </nav>
      </div>

      <style>{`
        .nh-nav-header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding-top: 18px;
          background: transparent;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .nh-nav-pill {
          pointer-events: auto;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 26px;
          padding: 9px 18px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .nh-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #9CA3AF;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .nh-nav-link--current { color: #4B5563; }
        .nh-nav-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          cursor: pointer;
        }
        .nh-nav-link:hover { color: #111827; }
      `}</style>
    </header>
  );
}
