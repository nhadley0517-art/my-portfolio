"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Shared plumbing for the long-form case studies (No. 2, Cove, Writing
 *  Process). Each one renders either as its own page or as the body of a
 *  bento overlay on the home page, so the same content serves both a
 *  shareable URL and the single-page browsing experience. */
export interface CaseStudyContentProps {
  variant?: "page" | "overlay";
  /** Required when variant="overlay" — closes the overlay instead of navigating. */
  onClose?: () => void;
}

/** One neutral section label for every case study, styled to match the home
 *  page's type system — sentence case, dark, no hairline or letter-spacing
 *  tricks, so it reads as a heading rather than a tag. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: "16px",
        fontWeight: 300,
        color: "#13181B",
        margin: "0 0 24px",
      }}
    >
      {children}
    </p>
  );
}

const linkClass =
  "group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors";

export function CaseStudyBottomNav({
  isOverlay,
  onClose,
  nextHref,
  nextLabel,
}: {
  isOverlay: boolean;
  onClose?: () => void;
  /** The next case study, shown only on the standalone page. */
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <section className="px-6 py-12 border-t border-[#E9E9EC]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {isOverlay ? (
          <button
            type="button"
            onClick={onClose}
            className={linkClass}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to all work
          </button>
        ) : (
          <>
            <Link href="/#work" className={linkClass}>
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to all work
            </Link>
            {nextHref && nextLabel && (
              <Link
                href={nextHref}
                className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#7D8A93] transition-colors"
              >
                {nextLabel}
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
