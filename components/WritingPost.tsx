"use client";

import ScrollReveal from "@/components/ScrollReveal";
import type { Post } from "@/content/posts";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** A single written post, rendered inside the shared overlay. Same quiet
 *  type scale and margins as the case studies so writing and work read as
 *  one publication. */
export default function WritingPost({ post, onClose }: { post: Post; onClose?: () => void }) {
  const { Component } = post;

  return (
    <div className="cs-body">
      <section className="pt-14 md:pt-16 pb-4">
        <div className="max-w-5xl mx-auto" style={{ maxWidth: "680px" }}>
          <ScrollReveal>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#9CA3AF",
                marginBottom: "16px",
              }}
            >
              Writing
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1
              style={{
                fontSize: "clamp(26px, 3.4vw, 38px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: "#0B0F12",
                margin: "0 0 18px",
              }}
            >
              {post.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#9CA3AF" }}>
              <span>{formatDate(post.date)}</span>
              <span aria-hidden>·</span>
              <span>{post.readingTime} read</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="pt-8 pb-16">
        <div className="max-w-5xl mx-auto" style={{ maxWidth: "680px" }}>
          <ScrollReveal delay={0.1}>
            <Component />
          </ScrollReveal>
        </div>
      </section>

      <section className="py-12 border-t border-[#EAEAED]">
        <div className="max-w-5xl mx-auto" style={{ maxWidth: "680px" }}>
          <button
            type="button"
            onClick={onClose}
            className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to writing
          </button>
        </div>
      </section>
    </div>
  );
}
