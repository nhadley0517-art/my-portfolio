"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import MorphHero from "@/components/MorphHero";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";
import { HRB, HRB_ACCENT, HRB_PRACTICES, HRB_PROCESS, HRB_PROJECTS, HRB_SECTIONS, type HrbDiagram } from "@/lib/hrBlockData";

/** H&R Block is a picture of the job rather than one case study: how a
 *  project moves from kickoff to AEM, what I do along the way, and four
 *  recent projects as evidence. There are no screenshots to share, so each
 *  idea is drawn as a small diagram instead: abstract page blocks, never
 *  real copy or data. */

/* ---------- diagrams ---------- */

/** A page drawn in blocks; `hot` blocks take the accent. */
function Page({ rows, label }: { rows: { h: number; hot?: boolean; tag?: string; split?: number }[]; label?: string }) {
  return (
    <div className="hd-page-wrap">
      <div className="hd-page">
        {rows.map((r, i) => (
          <div key={i} className={`hd-row${r.hot ? " is-hot" : ""}`} style={{ height: r.h }}>
            {r.split ? Array.from({ length: r.split }, (_, k) => <i key={k} />) : null}
            {r.tag && <span>{r.tag}</span>}
          </div>
        ))}
      </div>
      {label && <p className="hd-cap">{label}</p>}
    </div>
  );
}

function Seasons() {
  const seasons = ["Fall", "Jan", "Mar", "Apr", "Summer"];
  const lead = [2, 0, 0, 1, 2];
  return (
    <div className="hd hd-seasons">
      {seasons.map((s, i) => (
        <div key={s} className="hd-season">
          <div className={`hd-hero lead-${lead[i]}`}>
            <i />
            <i />
            <b />
          </div>
          <div className="hd-steady" />
          <div className="hd-steady" />
          <p className="hd-cap">{s}</p>
        </div>
      ))}
      <p className="hd-note">The hero changes with the season. Everything under it stays put.</p>
    </div>
  );
}

function Hierarchy() {
  return (
    <div className="hd hd-pair">
      <Page
        label="Before"
        rows={[
          { h: 44, tag: "Hero", split: 2 },
          { h: 12, hot: true, tag: "Most used" },
          { h: 30 },
          { h: 30 },
          { h: 22, tag: "FAQs" },
        ]}
      />
      <span className="hd-arrow" aria-hidden>→</span>
      <Page
        label="After"
        rows={[
          { h: 44, hot: true, tag: "Hero + main action" },
          { h: 22, tag: "Answers" },
          { h: 14, tag: "Pricing" },
          { h: 30 },
          { h: 22 },
        ]}
      />
    </div>
  );
}

function Assistant() {
  return (
    <div className="hd hd-chat">
      <div className="hd-bubble is-you">Can I book a tax appointment?</div>
      <div className="hd-bubble">Here are offices near you</div>
      <div className="hd-cards">
        <i className="is-hot" />
        <i />
        <i />
      </div>
      <div className="hd-done">Booked, with next steps</div>
    </div>
  );
}

function Campaign() {
  return (
    <div className="hd hd-pair">
      <Page
        label="Grant page"
        rows={[
          { h: 40, hot: true, tag: "Winners hero" },
          { h: 30, hot: true, tag: "Winners", split: 4 },
          { h: 22, tag: "What the grants include" },
          { h: 22, tag: "Products" },
        ]}
      />
      <div className="hd-recipient">
        <div className="hd-avatar" />
        <i />
        <i />
        <i className="short" />
        <p className="hd-cap">New, reusable recipient component</p>
      </div>
    </div>
  );
}

const DIAGRAMS: Record<HrbDiagram, () => React.ReactElement> = {
  seasons: Seasons,
  hierarchy: Hierarchy,
  assistant: Assistant,
  campaign: Campaign,
};

/* ---------- page ---------- */

export default function HRBlockContent({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";
  const practiceTitle = (id: string) => HRB_PRACTICES.find((p) => p.id === id)?.title ?? id;

  const body = (
    <div className="hrb">
      {/* ── Hero ── */}
      <section className="pt-14 md:pt-20">
        <div className="max-w-5xl mx-auto py-6">
          <MorphHero slug={HRB.slug}>
            <div className="hrb-hero" aria-hidden>
              <div className="hrb-hero-page">
                <div className="hrb-hero-top">
                  <b />
                  <i />
                  <i />
                </div>
                <div className="hrb-hero-grid">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="hrb-hero-band" />
              </div>
              <span className="hrb-hero-mark">H&amp;R Block</span>
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
                  <p className="hrb-meta">{m.value}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Overview ── */}
      <section id="overview" className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>01. Overview</SectionLabel>
          </ScrollReveal>
          {HRB.intro.map((p, i) => (
            <ScrollReveal key={i} delay={0.05 + i * 0.05}>
              <p className="hrb-prose">{p}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── How a project moves ── */}
      <section id="process" className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>02. How a project moves</SectionLabel>
          </ScrollReveal>
          <div className="hrb-flow" role="list">
            {HRB_PROCESS.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.05}>
                <div className="hrb-flow-step" role="listitem">
                  <span className="hrb-step">{String(i + 1).padStart(2, "0")}</span>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                  <ul className="hrb-with">
                    {s.with.map((w) => (
                      <li key={w} className={w === "Me" ? "is-me" : undefined}>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What I do ── */}
      <section id="practice" className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>03. What I do</SectionLabel>
          </ScrollReveal>
          <div className="hrb-practices">
            {HRB_PRACTICES.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.04}>
                <div className="hrb-practice">
                  <strong>{p.title}</strong>
                  <p>{p.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent work ── */}
      <section id="work" className="px-6 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <SectionLabel>04. Recent work</SectionLabel>
          </ScrollReveal>
          <div className="hrb-projects">
            {HRB_PROJECTS.map((p, i) => {
              const Diagram = DIAGRAMS[p.diagram];
              return (
                <ScrollReveal key={p.title} delay={(i % 2) * 0.06}>
                  <article className="hrb-project">
                    <div className="hrb-diagram">
                      <Diagram />
                    </div>
                    <div className="hrb-project-copy">
                      <p className="hrb-kind">
                        {p.title} · {p.kind}
                        <span className="hrb-status">{p.status}</span>
                      </p>
                      <h3>{p.headline}</h3>
                      <p>{p.body}</p>
                      <ul className="hrb-tags">
                        {p.practices.map((id) => (
                          <li key={id}>{practiceTitle(id)}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <CaseStudyBottomNav isOverlay={isOverlay} onClose={onClose} />

      <style>{`
        .hrb { --accent: ${HRB_ACCENT}; --deep: #0B5132; --line: rgba(19,24,27,0.1); }
        .hrb-label { font-size: 11px; font-weight: 500; color: #9CA3AF; margin: 0 0 14px; }
        .hrb-meta { font-size: 15px; color: #13181B; line-height: 1.6; margin: 0; }
        .hrb-prose { font-size: 15px; color: #4B5563; line-height: 1.85; max-width: 640px; margin: 0 0 16px; }

        /* Hero: a page assembled from library modules, in brand green. */
        .hrb-hero { position: relative; display: grid; place-items: center; aspect-ratio: 16 / 9; border-radius: 4px; overflow: hidden; background: var(--deep); }
        .hrb-hero-page { width: 62%; display: grid; gap: 4%; padding: 4%; border-radius: 6px; background: rgba(255,255,255,0.06); }
        .hrb-hero-top { display: grid; grid-template-columns: 1.4fr 1fr; grid-template-rows: auto auto; gap: 6px 12px; padding: 5%; border-radius: 4px; background: var(--accent); }
        .hrb-hero-top b { grid-row: span 2; aspect-ratio: 2.2; border-radius: 3px; background: rgba(255,255,255,0.9); }
        .hrb-hero-top i { border-radius: 3px; background: rgba(255,255,255,0.35); }
        .hrb-hero-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .hrb-hero-grid i { aspect-ratio: 1.3; border-radius: 4px; background: rgba(255,255,255,0.14); }
        .hrb-hero-band { height: 14%; min-height: 18px; border-radius: 4px; background: rgba(255,255,255,0.08); }
        .hrb-hero-mark { position: absolute; left: 4%; bottom: 5%; color: #fff; font-size: clamp(14px, 1.8vw, 20px); font-weight: 600; letter-spacing: -0.01em; }

        /* Process flow */
        .hrb-flow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; }
        .hrb-flow-step { position: relative; display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 20px; border-radius: 6px; background: #fff; }
        .hrb-step { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--accent); }
        .hrb-flow strong { font-size: 15px; font-weight: 500; color: #13181B; }
        .hrb-flow p { margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280; }
        .hrb-with { display: flex; flex-wrap: wrap; gap: 6px; margin: auto 0 0; padding: 6px 0 0; list-style: none; }
        .hrb-with li { padding: 2px 8px; border-radius: 999px; background: #F2F2F3; color: #6B7280; font-size: 12px; }
        .hrb-with li.is-me { background: var(--accent); color: #fff; }

        /* Practices */
        .hrb-practices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px 32px; }
        .hrb-practice strong { display: block; margin: 0 0 6px; padding-top: 12px; border-top: 2px solid var(--accent); font-size: 15px; font-weight: 500; color: #13181B; }
        .hrb-practice p { margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280; }

        /* Projects */
        .hrb-projects { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px 16px; }
        .hrb-diagram { display: grid; place-items: center; aspect-ratio: 16 / 10; padding: 6%; border-radius: 6px; background: #EBEBED; overflow: hidden; }
        .hrb-project-copy { margin-top: 16px; }
        .hrb-kind { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: #A8ABB2; }
        .hrb-status { padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: #0B7A40; font-family: var(--font-geist-sans), sans-serif; font-size: 11px; }
        .hrb-project-copy h3 { margin: 0 0 8px; font-size: 18px; font-weight: 500; letter-spacing: -0.01em; color: #13181B; }
        .hrb-project-copy > p:not(.hrb-kind) { margin: 0; font-size: 14px; line-height: 1.65; color: #6B7280; }
        .hrb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; }
        .hrb-tags li { padding: 2px 8px; border-radius: 4px; background: #fff; color: #6B7280; font-size: 12px; }

        /* Diagram parts: abstract page blocks, never real copy or data. */
        .hd { width: 100%; }
        .hd-cap { margin: 8px 0 0; font-family: var(--font-geist-mono), monospace; font-size: 10.5px; color: #8A8F98; text-align: center; }
        .hd-note { grid-column: 1 / -1; margin: 6px 0 0; font-size: 12px; color: #8A8F98; text-align: center; }

        .hd-seasons { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; align-items: start; }
        .hd-season { display: grid; gap: 5px; }
        .hd-hero { display: grid; gap: 4px; padding: 8px; border-radius: 4px; aspect-ratio: 1; align-content: center; }
        .hd-hero i { height: 5px; border-radius: 2px; background: rgba(255,255,255,0.75); }
        .hd-hero i + i { width: 60%; opacity: 0.7; }
        .hd-hero b { width: 55%; height: 9px; margin-top: 4px; border-radius: 999px; background: #fff; }
        .hd-hero.lead-0 { background: var(--deep); }
        .hd-hero.lead-1 { background: var(--accent); }
        .hd-hero.lead-2 { background: #6FA287; }
        .hd-steady { height: 14px; border-radius: 3px; background: #fff; }

        .hd-pair { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .hd-page-wrap { width: 36%; max-width: 170px; }
        .hd-page { display: grid; gap: 5px; padding: 7px; border-radius: 5px; background: #fff; }
        .hd-row { position: relative; display: flex; gap: 4px; padding: 4px; border-radius: 3px; background: #E2E3E6; }
        .hd-row i { flex: 1; border-radius: 2px; background: rgba(255,255,255,0.7); }
        .hd-row span { position: absolute; left: 6px; top: 50%; transform: translateY(-50%); font-size: 9.5px; line-height: 1; color: #6B7280; white-space: nowrap; }
        .hd-row.is-hot { background: var(--accent); }
        .hd-row.is-hot span { color: #fff; }
        .hd-row.is-hot i { background: rgba(255,255,255,0.35); }
        .hd-row:has(i) span { display: none; }
        .hd-arrow { font-size: 18px; color: #8A8F98; }

        .hd-chat { display: grid; gap: 7px; max-width: 280px; margin: 0 auto; }
        .hd-bubble { justify-self: start; max-width: 80%; padding: 7px 10px; border-radius: 10px 10px 10px 3px; background: #fff; font-size: 11.5px; color: #4B5563; }
        .hd-bubble.is-you { justify-self: end; border-radius: 10px 10px 3px 10px; background: var(--deep); color: #fff; }
        .hd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .hd-cards i { aspect-ratio: 1.1; border-radius: 6px; background: #fff; box-shadow: inset 0 -10px 0 #E2E3E6; }
        .hd-cards i.is-hot { box-shadow: inset 0 -10px 0 var(--accent); }
        .hd-done { justify-self: start; padding: 5px 10px; border-radius: 999px; background: var(--accent); color: #fff; font-size: 11px; }

        .hd-recipient { display: grid; gap: 6px; width: 30%; max-width: 130px; padding: 10px; border-radius: 6px; background: #fff; outline: 2px solid var(--accent); outline-offset: 3px; }
        .hd-recipient .hd-avatar { aspect-ratio: 1; border-radius: 4px; background: linear-gradient(160deg, #6FA287, var(--deep)); }
        .hd-recipient > i { height: 5px; border-radius: 2px; background: #E2E3E6; }
        .hd-recipient > i.short { width: 55%; }
        .hd-recipient .hd-cap { margin-top: 6px; }

        @media (max-width: 860px) {
          .hrb-flow, .hrb-practices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hrb-projects { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 560px) {
          .hrb-flow, .hrb-practices { grid-template-columns: minmax(0, 1fr); }
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
