"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import MorphHero from "@/components/MorphHero";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";
import { HRB, HRB_ACCENT, HRB_SECTIONS, type HrbProject } from "@/lib/hrBlockData";

/** H&R Block is a library, not a single case study: what I do on the team,
 *  who I do it with, and a filterable set of the work, each piece tagged by
 *  the practices it shows. Copy and screens arrive over time, so anything
 *  not filled in yet renders as a deliberate "coming soon" state. */

const SOON = "Coming soon";

function Soon({ children = SOON }: { children?: string }) {
  return <span className="hrb-soon">{children}</span>;
}

function ProjectCard({ p }: { p: HrbProject }) {
  const tags = p.practices.map((id) => HRB.practices.find((x) => x.id === id)?.title).filter(Boolean) as string[];
  return (
    <article className="hrb-card">
      <div className={`hrb-card-media${p.media ? "" : " is-empty"}`}>
        {p.media?.type === "video" ? (
          <video src={p.media.src} autoPlay muted loop playsInline />
        ) : p.media ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.media.src} alt={p.title} />
        ) : (
          <span>Screens coming soon</span>
        )}
      </div>
      <div className="hrb-card-copy">
        <h3>
          {p.draft ? <span className="hrb-muted">{p.title}</span> : p.title}
          {p.when && <span className="hrb-when">{p.when}</span>}
        </h3>
        {p.summary ? <p>{p.summary}</p> : <p className="hrb-muted">Details coming soon.</p>}
        <ul className="hrb-tags">
          {tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function HRBlockContent({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? HRB.projects.filter((p) => p.practices.includes(filter)) : HRB.projects;

  const body = (
    <div className="hrb">
      {/* ── Hero ── */}
      <section className="pt-14 md:pt-20">
        <div className="max-w-5xl mx-auto py-6">
          <MorphHero slug={HRB.slug}>
            <div className="hrb-hero">
              <span>H&amp;R Block</span>
            </div>
          </MorphHero>
        </div>
        <div className="max-w-5xl mx-auto mt-16 md:mt-20">
          <ScrollReveal delay={0.05}>
            <h1 className="text-[clamp(40px,7vw,72px)] font-medium tracking-[-0.02em] leading-[1.1] text-[#13181B] mb-5">{HRB.title}</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-lg font-medium max-w-2xl" style={{ color: "#8A8F98" }}>
              {HRB.oneLiner}
            </p>
          </ScrollReveal>
        </div>
        <div className="max-w-5xl mx-auto mt-14 md:mt-16 mb-8 md:mb-14">
          <ScrollReveal delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ columnGap: "32px", rowGap: "36px" }}>
              {HRB.meta.map((m) => (
                <div key={m.label}>
                  <p className="hrb-label">{m.label}</p>
                  <p className="hrb-meta">{m.value ?? <Soon />}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Overview ── */}
      <section id="overview" className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>01. Overview</SectionLabel>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            {HRB.intro.length ? (
              HRB.intro.map((p, i) => (
                <p key={i} className="hrb-prose">
                  {p}
                </p>
              ))
            ) : (
              <p className="hrb-prose hrb-muted">An introduction to the role, the product, and the team is coming soon.</p>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ── What I do ── */}
      <section id="practice" className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>02. What I do</SectionLabel>
          </ScrollReveal>
          <div className="hrb-practices">
            {HRB.practices.map((p, i) => {
              const count = HRB.projects.filter((x) => x.practices.includes(p.id)).length;
              return (
                <ScrollReveal key={p.id} delay={i * 0.04}>
                  <button
                    type="button"
                    className="hrb-practice"
                    onClick={() => {
                      setFilter(p.id);
                      document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <span className="hrb-num">{String(i + 1).padStart(2, "0")}</span>
                    <strong>{p.title}</strong>
                    {p.body ? <span className="hrb-body">{p.body}</span> : <span className="hrb-body hrb-muted">Details coming soon.</span>}
                    <span className="hrb-see">
                      {count} {count === 1 ? "project" : "projects"} <span aria-hidden>→</span>
                    </span>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who I work with ── */}
      <section id="people" className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>03. Who I work with</SectionLabel>
          </ScrollReveal>
          <div className="hrb-partners">
            {HRB.partners.map((p, i) => (
              <ScrollReveal key={p.role} delay={i * 0.04}>
                <div className="hrb-partner">
                  <p className="hrb-partner-role">{p.role}</p>
                  {p.body ? <p className="hrb-body">{p.body}</p> : <p className="hrb-body hrb-muted">Details coming soon.</p>}
                  {p.people && p.people.length > 0 && <p className="hrb-people">{p.people.join(", ")}</p>}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Library ── */}
      <section id="library" className="px-6 py-16 md:py-24" style={{ scrollMarginTop: 24 }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>04. Library</SectionLabel>
          </ScrollReveal>
          <div className="hrb-filters" role="group" aria-label="Filter projects by practice">
            <button type="button" className={filter === null ? "is-on" : ""} onClick={() => setFilter(null)}>
              All
            </button>
            {HRB.practices.map((p) => (
              <button key={p.id} type="button" className={filter === p.id ? "is-on" : ""} onClick={() => setFilter(p.id)}>
                {p.title}
              </button>
            ))}
          </div>
          <div className="hrb-grid">
            {shown.map((p, i) => (
              <ProjectCard key={`${p.title}-${i}`} p={p} />
            ))}
          </div>
        </div>
      </section>

      <CaseStudyBottomNav isOverlay={isOverlay} onClose={onClose} />

      <style>{`
        .hrb { --accent: ${HRB_ACCENT}; }
        .hrb-hero {
          display: grid; place-items: center; aspect-ratio: 16 / 9; border-radius: 4px;
          background: var(--accent); color: #fff; font-size: clamp(28px, 5vw, 56px); font-weight: 600; letter-spacing: -0.02em;
        }
        .hrb-label { font-size: 11px; font-weight: 500; color: #9CA3AF; margin: 0 0 14px; }
        .hrb-meta { font-size: 15px; color: #13181B; line-height: 1.7; margin: 0; }
        .hrb-soon { font-size: 13px; color: #B0B4BB; }
        .hrb-muted { color: #B0B4BB !important; }
        .hrb-prose { font-size: 15px; color: #4B5563; line-height: 1.85; max-width: 640px; margin: 0 0 16px; }
        .hrb-body { display: block; font-size: 14px; line-height: 1.6; color: #6B7280; }

        .hrb-practices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .hrb-practice {
          display: flex; flex-direction: column; align-items: flex-start; gap: 8px; width: 100%; height: 100%;
          padding: 20px; border: 0; border-radius: 6px; background: #fff; font: inherit; text-align: left; cursor: pointer;
          outline: 2px solid transparent; outline-offset: 0;
          transition: outline-color .2s ease, outline-offset .25s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1);
        }
        .hrb-practice:hover { outline-color: var(--accent); outline-offset: 3px; transform: translateY(-2px); }
        .hrb-practice strong { font-size: 15px; font-weight: 500; color: #13181B; }
        .hrb-num { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: #A8ABB2; }
        .hrb-see { margin-top: auto; padding-top: 6px; font-size: 12.5px; color: var(--accent); }

        .hrb-partners { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px 32px; }
        .hrb-partner-role { margin: 0 0 6px; font-size: 15px; font-weight: 500; color: #13181B; }
        .hrb-people { margin: 8px 0 0; font-size: 13px; color: #8A8F98; }

        .hrb-filters { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 24px; }
        .hrb-filters button {
          padding: 6px 12px; border: 0; border-radius: 999px; background: #fff; color: #6B7280;
          font: inherit; font-size: 13px; cursor: pointer; transition: background-color .18s ease, color .18s ease;
        }
        .hrb-filters button:hover { color: #13181B; }
        .hrb-filters button.is-on { background: var(--accent); color: #fff; }

        .hrb-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 16px; }
        .hrb-card-media { aspect-ratio: 16 / 10; border-radius: 6px; overflow: hidden; background: #E9E9EC; }
        .hrb-card-media img, .hrb-card-media video { display: block; width: 100%; height: 100%; object-fit: cover; }
        .hrb-card-media.is-empty { display: grid; place-items: center; background: none; border: 1px dashed rgba(19,24,27,0.18); font-size: 13px; color: #B0B4BB; }
        .hrb-card-copy { margin-top: 14px; }
        .hrb-card-copy h3 { display: flex; align-items: baseline; gap: 10px; margin: 0 0 4px; font-size: 15px; font-weight: 500; color: #13181B; }
        .hrb-when { font-family: var(--font-geist-mono), monospace; font-size: 11.5px; font-weight: 400; color: #A8ABB2; }
        .hrb-card-copy p { margin: 0; font-size: 14px; line-height: 1.55; color: #6B7280; }
        .hrb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
        .hrb-tags li { padding: 2px 8px; border-radius: 4px; background: color-mix(in srgb, var(--accent) 12%, transparent); color: #0B7A40; font-size: 12px; }

        @media (max-width: 860px) {
          .hrb-practices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hrb-partners { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .hrb-practices, .hrb-grid { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
    </div>
  );

  if (isOverlay) return <div className="cs-body">{body}</div>;

  return (
    <>
      <Nav sections={HRB_SECTIONS} accentColor={HRB_ACCENT} />
      <CaseStudyNav sections={HRB_SECTIONS} accentColor={HRB_ACCENT} card />
      <main className="pt-[72px] cs-body">{body}</main>
      <Footer />
    </>
  );
}
