"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, type CaseStudyContentProps } from "@/components/CaseStudyShell";
import { HRB, HRB_ACCENT, HRB_PROCESS, HRB_SECTIONS, HRB_STORY } from "@/lib/hrBlockData";

/** H&R Block is a look into the role rather than one case study: what I own,
 *  who I work with, what I've done there in my own words, and how a project
 *  moves. It reads like a résumé, a quiet label column on the left and the
 *  content on the right, with headlines in two tones. */

/** The H&R Block mark: the green square with the name knocked out. */
const LOGO = "M0 0h56v56H0V0zm9.7 33.1H7.2v-3.5h-3v9.7h3v-3.5h2.5v3.5h3.1v-9.7H9.7v3.5zM22 37.3c.3-.6.4-1.3.4-1.9v-1.5h-2.1v1.4L18 32.8c-.2-.3-.4-.5-.4-.8 0-.4.3-.6.7-.6.4 0 .7.3.7.7v.5h2.3V32c0-1.5-1.3-2.5-3.1-2.5-1.9 0-3.2 1-3.2 2.5 0 .4.1 1.1.8 1.7-.9.4-1.8 1.3-1.8 2.7 0 1.9 1.5 3.2 4.2 3.2.9 0 1.8-.3 2.4-.7l.4.5h2.7L22 37.3zm-3.7.2c-.7 0-1.6-.4-1.6-1.3 0-.5.3-.9.7-1.1 0 0 1.6 1.8 1.9 2.1-.2.2-.6.3-1 .3zm9.3-.7h.9l1.5 2.5h3.5l-1.9-3.1c1-.6 1.7-1.7 1.7-3.1 0-2.1-1.3-3.6-3.8-3.6h-4.9v9.7h3v-2.4zm0-4.8h1.5c.7 0 1.1.5 1.1 1.2s-.4 1.2-1.1 1.2h-1.5V32zM10.8 46.7c.8-.4 1.3-1.2 1.3-2.2C12.1 43 11 42 9.2 42h-5v9.7h5.1c2.2 0 3.4-1.1 3.4-2.8 0-1.1-.7-1.9-1.9-2.2zm-3.7-2.4h1.4c.4 0 .7.3.7.7 0 .5-.3.8-.7.8H7.1v-1.5zm2 5.2h-2v-1.6h2c.5 0 .8.4.8.8s-.3.8-.8.8zM17 42h-3v9.7h6.9v-2.5H17V42zm9.4-.2c-3 0-4.6 1.8-4.6 4.4v1.2c0 2.6 1.6 4.4 4.6 4.4S31 50 31 47.4v-1.2c0-2.6-1.6-4.4-4.6-4.4zm1.6 5.9c0 1.1-.6 1.7-1.6 1.7s-1.6-.6-1.6-1.7v-1.6c0-1.1.6-1.7 1.6-1.7s1.6.6 1.6 1.7v1.6zm8.6-3.3c1.1 0 1.5.7 1.5 1.4H41c-.1-2.2-1.6-4-4.3-4-3.1 0-4.6 1.8-4.6 4.4v1.3c0 2.6 1.5 4.4 4.6 4.4 2.7 0 4.3-1.8 4.3-4h-2.9c-.1.7-.4 1.4-1.5 1.4-1 0-1.5-.7-1.5-1.7v-1.5c0-1.1.5-1.7 1.5-1.7zM51.3 42h-3.4l-2 3.4h-.2V42h-3v9.7h3v-4h.2l2 4h3.6l-2.8-5.3 2.6-4.4zm1.4.3h-.3v.7h.2v-.2l.1.2h.3l-.1-.2c0-.1.1-.2.1-.3 0-.2-.1-.2-.3-.2zm0 .3l-.1-.1.1.1c0-.1 0-.1 0 0zm-.1-.8c-.5 0-.8.4-.8.8s.3.8.8.8.8-.4.8-.8c.1-.4-.3-.8-.8-.8zm0 1.4c-.4 0-.6-.3-.6-.6 0-.4.2-.6.6-.6.4 0 .6.3.6.6.1.4-.2.6-.6.6z";

/** The six steps on one line: squares where I lead, circles where I work
 *  with others. */
function Flow() {
  return (
    <div className="hd-flow">
      <ol>
        {HRB_PROCESS.map((s) => (
          <li key={s.title} className={s.lead ? "is-lead" : undefined}>
            <i />
            <span>{s.title}</span>
          </li>
        ))}
      </ol>
      <p className="hd-legend">
        <span>
          <i className="hd-swatch is-tax" /> I lead
        </span>
        <span>
          <i className="hd-ring" /> With others
        </span>
      </p>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- page ---------- */

function Row({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="hrb-sec px-6">
      <div className="max-w-5xl mx-auto hrb-row">
        <h2 className="hrb-side">{label}</h2>
        <div className="hrb-main">{children}</div>
      </div>
    </section>
  );
}

export default function HRBlockContent({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";

  const body = (
    <div className="hrb">
      {/* ── Hero: a small logo eyebrow, then the one line ── */}
      <section className="hrb-sec is-hero px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="hrb-pill">
              <svg viewBox="0 0 56 56" aria-hidden>
                <path d={LOGO} />
              </svg>
              <strong>{HRB.role}</strong>
              <span>Now</span>
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h1 className="hrb-statement">
              {HRB.title}. <span>{HRB.statement}</span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* ── The role ── */}
      <Row id="role" label="Role">
        <ScrollReveal>
          <p className="hrb-prose">{HRB.intro}</p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <div className="hrb-cols">
            {HRB.columns.map((c) => (
              <div key={c.label}>
                <p className="hrb-label">{c.label}</p>
                <ul>
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="is-wide">
              <p className="hrb-label">Shipped</p>
              <ul>
                {HRB.shipped.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </Row>

      {/* ── The work: experience in my own words ── */}
      <Row id="the-work" label="The work">
        <div className="hrb-story">
          {HRB_STORY.map((s, i) => (
            <ScrollReveal key={s.lead} delay={i * 0.03}>
              <p>
                <strong>{s.lead}</strong> {s.body}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </Row>

      {/* ── Process ── */}
      <Row id="process" label="Process">
        <ScrollReveal>
          <h3 className="hrb-headline">
            Six steps, every page. <span>I lead the design from kickoff to a locked file, and stay on call after it&apos;s built.</span>
          </h3>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <div className="hd-panel is-flow">
            <Flow />
          </div>
        </ScrollReveal>
        <ol className="hrb-steps">
          {HRB_PROCESS.map((s, i) => (
            <li key={s.title}>
              <ScrollReveal delay={(i % 3) * 0.04}>
                <span className="hrb-n">{pad(i + 1)}</span>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
                <p className="hrb-with">{s.with ? `With ${s.with}` : "Mine"}</p>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </Row>

      <CaseStudyBottomNav isOverlay={isOverlay} onClose={onClose} />

      <style>{`
        .hrb {
          --accent: ${HRB_ACCENT};
          --ink: #13181B;
          --body: #4B5260;
          --gray: #858B95;
          --panel: rgba(19,24,27,0.05);
          --block: #E6E7E9;
        }

        /* Hero: a small eyebrow pill with the logo, then the one line. */
        .hrb-sec.is-hero { padding-top: 112px; padding-bottom: 24px; }
        .hrb-pill { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 28px; padding: 6px 12px 6px 6px; border-radius: 8px; background: #fff; font-size: 13px; }
        .hrb-pill svg { width: 22px; height: 22px; fill: var(--accent); border-radius: 2px; }
        .hrb-pill strong { font-weight: 500; color: var(--ink); }
        .hrb-pill span { color: var(--gray); }

        /* The résumé grid: a label column, then the content. */
        .hrb-sec { padding-top: 56px; padding-bottom: 56px; }
        .hrb-row { display: grid; grid-template-columns: 168px minmax(0, 1fr); gap: 56px; }
        .hrb-side { position: sticky; top: 32px; align-self: start; margin: 0; font-size: 15px; font-weight: 500; color: var(--ink); }
        .hrb-main { min-width: 0; }

        .hrb-statement { margin: 0; font-size: clamp(28px, 3.4vw, 38px); font-weight: 500; line-height: 1.2; letter-spacing: -0.025em; color: var(--ink); }
        .hrb-statement span, .hrb-headline span { color: var(--gray); }

        .hrb-prose { margin: 0; max-width: 62ch; font-size: 16px; line-height: 1.7; color: var(--body); }
        .hrb-label { margin: 0 0 12px; font-size: 13px; color: var(--gray); }
        .hrb-n { font-variant-numeric: tabular-nums; color: var(--gray); }

        /* Role: what I own, who I work with, tools, like a résumé's skills. */
        .hrb-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; margin: 44px 0 0; }
        .hrb-cols ul { margin: 0; padding: 0; list-style: none; }
        .hrb-cols li { display: flex; align-items: center; gap: 10px; font-size: 14.5px; line-height: 1.85; color: var(--ink); }
        .hrb-cols li::before { content: ""; flex: none; width: 8px; height: 1px; background: var(--gray); }
        .hrb-cols > .is-wide { grid-column: 1 / -1; }

        /* The work: experience written as prose, each paragraph led by the
           way I work in ink. */
        .hrb-story { display: grid; gap: 22px; max-width: 64ch; }
        .hrb-story p { margin: 0; font-size: 16px; line-height: 1.7; color: var(--body); }
        .hrb-story strong { font-weight: 500; color: var(--ink); }
        .hrb-headline { margin: 0 0 18px; max-width: 34ch; font-size: clamp(22px, 2.6vw, 28px); font-weight: 500; line-height: 1.2; letter-spacing: -0.02em; color: var(--ink); }

        /* Process */
        .hrb-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px 32px; margin: 36px 0 0; padding: 0; list-style: none; }
        .hrb-steps .hrb-n { display: block; margin-bottom: 10px; font-size: 13px; }
        .hrb-steps strong { display: block; margin-bottom: 6px; font-size: 15px; font-weight: 500; color: var(--ink); }
        .hrb-steps p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--body); }
        .hrb-steps .hrb-with { margin-top: 10px; font-size: 13px; color: var(--gray); }

        /* ---------- the process flow: plain geometry on a gray panel ---------- */
        .hd-panel {
          container-type: inline-size;
          display: grid; place-items: center;
          aspect-ratio: 16 / 9; padding: 6%;
          border-radius: 6px; background: var(--panel); overflow: hidden;
        }
        .hd-swatch { display: inline-block; width: 18px; height: 6px; background: var(--ink); }
        .hd-swatch.is-tax { background: var(--accent); }
        .hd-ring { display: inline-block; width: 9px; height: 9px; border-radius: 50%; box-shadow: inset 0 0 0 1.5px var(--ink); }
        .hd-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 22px; margin: 22px 0 0; font-size: 12px; color: var(--body); }
        .hd-legend span { display: inline-flex; align-items: center; gap: 7px; }
        /* Process flow */
        .hd-panel.is-flow { aspect-ratio: 16 / 5; }
        .hd-flow { width: 100%; }
        .hd-flow ol { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); margin: 0; padding: 0; list-style: none; }
        .hd-flow ol::before { content: ""; position: absolute; left: 8.33%; right: 8.33%; top: 1.4cqw; height: 1px; background: var(--ink); opacity: 0.25; }
        .hd-flow li { position: relative; display: grid; justify-items: center; gap: 2cqw; font-size: clamp(10px, 1.5cqw, 13px); color: var(--body); text-align: center; }
        .hd-flow li i { width: 2.8cqw; height: 2.8cqw; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 1.5px var(--ink); }
        .hd-flow li.is-lead i { border-radius: 0; background: var(--accent); box-shadow: none; }
        .hd-flow li.is-lead span { color: var(--ink); }
        .hd-flow .hd-legend { margin-top: 4cqw; }

        @media (max-width: 900px) {
          .hrb-row { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .hrb-side { position: static; }
          .hrb-sec { padding-top: 40px; padding-bottom: 40px; }
          .hrb-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .hrb-cols, .hrb-steps { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .hd-panel.is-flow { aspect-ratio: 16 / 9; }
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
