"use client";

import { useBentoOverlay } from "@/components/BentoOverlay";
import { POSTS } from "@/content/posts";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** The writing index, shown in the overlay when Writing is picked from the
 *  side nav. Selecting a post swaps the overlay to that post, so the whole
 *  reading flow happens without ever leaving the home page. */
export default function WritingIndex() {
  const { openSlug } = useBentoOverlay();

  return (
    <div className="wi">
      <p className="wi-label">Writing</p>
      <p className="wi-intro">
        Notes on building things, and on the details that make software feel like someone made it.
      </p>

      <div className="wi-list">
        {POSTS.map((post) => (
          <button
            key={post.slug}
            type="button"
            className="wi-row"
            onClick={() => openSlug(`writing/${post.slug}`)}
          >
            <span className="wi-row-top">
              <span className="wi-title">{post.title}</span>
              <span className="wi-date">{formatDate(post.date)}</span>
            </span>
            <span className="wi-blurb">{post.blurb}</span>
          </button>
        ))}
      </div>

      <style>{`
        .wi { padding: clamp(40px, 5vw, 64px) clamp(28px, 6vw, 76px) clamp(44px, 5vw, 64px); }
        .wi-label {
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: #A8ABB2; margin: 0 0 16px;
        }
        .wi-intro {
          font-size: 15px; color: #6B7280; line-height: 1.75;
          max-width: 460px; margin: 0 0 44px;
        }
        .wi-list { display: flex; flex-direction: column; }
        .wi-row {
          display: flex;
          flex-direction: column;
          gap: 7px;
          width: 100%;
          padding: 22px 0;
          border: none;
          border-top: 1px solid #E9E9EC;
          background: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        .wi-row:last-child { border-bottom: 1px solid #E9E9EC; }
        .wi-row-top {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 24px;
        }
        .wi-title {
          font-size: 16.5px; font-weight: 500; color: #13181B;
          letter-spacing: -0.015em; transition: opacity 0.2s ease;
        }
        .wi-date { font-size: 12px; color: #A8ABB2; white-space: nowrap; }
        .wi-blurb {
          font-size: 13.5px; color: #8A8F98; line-height: 1.65; max-width: 540px;
        }
        .wi-row:hover .wi-title { opacity: 0.55; }

        @media (max-width: 600px) {
          .wi-row-top { flex-direction: column; gap: 4px; }
        }
      `}</style>
    </div>
  );
}
