"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import WritingProcessTabs from "@/components/WritingProcessTabs";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";

export const WP_SECTIONS = [
  { id: "overview",        label: "Overview" },
  { id: "problem",         label: "Problem" },
  { id: "research",        label: "Research" },
  { id: "first-iteration", label: "First Iteration" },
  { id: "the-pivot",       label: "The Pivot" },
  { id: "final-solution",  label: "Final Solution" },
  { id: "outcome",         label: "Outcome" },
];

export const ACCENT = "#6B3FA0";

const HERO_IMAGE = "https://framerusercontent.com/images/zZ2hHER48PtEN221uFQgkjWkY.png";
const PROBLEM_IMAGES = [
  { src: "https://framerusercontent.com/images/XR1s5yIqoAkXajuYwVFwZQznPk.png", alt: "Original writing resource — overview" },
  { src: "https://framerusercontent.com/images/xGvmGXt1GzRR0ReKqX8RuBD0I7g.png", alt: "Original writing resource — detail" },
];
const ITERATION_IMAGES = [
  { src: "https://framerusercontent.com/images/PuNIHBQJnsQpEZhZTb3SMwQZGgQ.png", alt: "First iteration — landing page" },
  { src: "https://framerusercontent.com/images/N8U4RzIbpHoY0LeQahcfhVUtqE.png", alt: "First iteration — modal design" },
  { src: "https://framerusercontent.com/images/nDyMUY2ydouKK9zTUudd9pLzM.png", alt: "First iteration — resource layout" },
];

function CaseImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ScrollReveal>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }} />
    </ScrollReveal>
  );
}

function PullQuote({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <div style={{ borderLeft: "2px solid #E4E4E7", paddingLeft: "24px", margin: "8px 0" }}>
      <p style={{ fontSize: "19px", fontWeight: 500, color: "#13181B", lineHeight: 1.45, marginBottom: "10px", letterSpacing: "-0.01em" }}>
        &ldquo;{quote}&rdquo;
      </p>
      <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{attribution}</p>
    </div>
  );
}

function Callout({ label, heading, body, delay = 0 }: { label: string; heading: string; body: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div style={{ paddingBottom: "72px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "16px" }}>
          {label}
        </p>
        <p style={{ fontSize: "clamp(24px, 3vw, 30px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "20px", maxWidth: "680px" }}>
          {heading}
        </p>
        <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px" }}>
          {body}
        </p>
      </div>
    </ScrollReveal>
  );
}

export default function WritingProcessContent({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";

  const body = (
    <>
        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto pb-10 md:pb-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="Writing Process Redesign banner" style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }} />
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "4px", background: "#fff", fontSize: "13px", fontWeight: 400, color: "#4B5563" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                Shipped
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="text-[clamp(34px,5vw,56px)] font-medium tracking-[-0.02em] leading-[1.1] text-[#13181B] mt-5 mb-5">
                Writing Process Redesign
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p className="text-lg font-medium mb-8 max-w-2xl" style={{ color: "#8A8F98" }}>
                Redesigning how GCU students learn to write — from a single overwhelming page to an eight-stage guided experience.
              </p>
            </ScrollReveal>

          </div>

          {/* ── METADATA ── */}
          <div className="max-w-5xl mx-auto mt-2 md:mt-4 mb-8 md:mb-14">
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ columnGap: "32px", rowGap: "44px" }}>
                {[
                  { label: "Role", values: ["Product Design Intern", "Grand Canyon Education"] },
                  { label: "Duration", values: ["2025", "8 weeks"] },
                  { label: "Scope", values: ["UX Redesign", "Figma, Illustrator"] },
                  { label: "Team", values: ["1 designer (me)", "1 PM, 1 dev", "Mentored by 3 senior designers"] },
                ].map(({ label, values }) => (
                  <div key={label}>
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginBottom: "14px" }}>
                      {label}
                    </p>
                    {values.map((v) => (
                      <p key={v} style={{ fontSize: "15px", fontWeight: 400, color: "#13181B", lineHeight: 1.7 }}>
                        {v}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 01 — OVERVIEW ── */}
        <section id="overview" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>01 — Overview</SectionLabel></ScrollReveal>

            <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-12 md:gap-20">
              <ScrollReveal delay={0.1}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "24px" }}>
                  During my internship at GCE, I redesigned a student-facing writing resource.
                  It started as a single, content-heavy page. The material was strong, but the
                  experience had aged — instructional content buried in menus, no clear path
                  through the writing process.
                </p>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85 }}>
                  My goal was to improve how students discover, navigate, and absorb writing
                  instruction while aligning with GCU&apos;s UI and accessibility standards.
                  It&apos;s now shipped and in final review before live deployment.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "16px" }}>
                      Designed For Students Who
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Feel unsure where to begin when given a writing assignment",
                        "Struggle to locate relevant writing help at the right moment",
                        "Become overwhelmed by dense, all-in-one resource pages",
                        "Benefit from structured guidance through complex tasks",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm font-medium" style={{ color: "#13181B" }}>
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "#C4C4C4" }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Role",         value: "Product Design Intern" },
                      { label: "Company",      value: "Grand Canyon Education / GCU" },
                      { label: "Status",       value: "Shipped" },
                      { label: "Timeline",     value: "8 weeks" },
                      { label: "Tools",        value: "Figma, Illustrator" },
                      { label: "Project Type", value: "Educational Media Redesign" },
                    ].map(({ label, value }, i, arr) => (
                      <div key={label}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "2px" }}>{label}</p>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#13181B" }}>{value}</p>
                        {i < arr.length - 1 && <div className="h-px bg-[#DDD8D1] mt-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 02 — THE PROBLEM ── */}
        <section id="problem" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>02 — The Problem</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, maxWidth: "760px", marginBottom: "32px" }}>
                The original resource packed the entire writing process into a single page.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "64px" }}>
                To access any specific stage — prewriting, drafting, revision — students had to
                dig through menus and tabs. The content was all there, but the structure worked
                against the people it was meant to help.
              </p>
            </ScrollReveal>

            <div className="space-y-6 mb-24">
              {PROBLEM_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>

            <div>
              <Callout
                label="Problem 01"
                heading="No visible progression through the writing process."
                body="Students had no sense of where they were or what came next. The entire writing journey was compressed into a single scrollable page with no sense of forward movement."
              />
              <Callout
                label="Problem 02"
                heading="Instructional media was buried instead of surfaced."
                body="Videos and downloadable resources lived in menus and modals rather than alongside the relevant instruction. Students who needed help had to go hunting for it."
                delay={0.05}
              />
              <Callout
                label="Problem 03"
                heading="The interface placed the burden of assembly on the student."
                body="It was built for exploration, not instruction. Students were expected to self-navigate a complex resource at the exact moment they needed clear, sequential guidance."
                delay={0.1}
              />
            </div>
          </div>
        </section>

        {/* ── 03 — RESEARCH & EARLY INSIGHTS ── */}
        <section id="research" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>03 — Research &amp; Early Insights</SectionLabel></ScrollReveal>

            <div className="max-w-3xl">
              <ScrollReveal delay={0.1}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "28px" }}>
                  Before touching Figma, I reviewed comparable student-facing writing platforms.
                  A clear pattern emerged: the tools that worked best gave students what they
                  needed at each stage of the process — not everything at once.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "40px" }}>
                  I also spoke with students between classes — asking how they used writing
                  resources, what frustrated them, and whether they&apos;d turned to Google or
                  YouTube instead. The pattern was consistent: official tools felt overwhelming,
                  so most students either skimmed and gave up, or bypassed them entirely.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.25}>
                <div style={{ marginBottom: "40px" }}>
                  <PullQuote
                    quote="Navigating the old resource, it was easy to get lost — like information was hidden in menus even when it was all related."
                    attribution="GCU student, informal research session"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <p style={{ fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                  The problem wasn&apos;t the content — it was the structure around it.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 04 — FIRST ITERATION ── */}
        <section id="first-iteration" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>04 — First Iteration</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "64px" }}>
                My first approach improved clarity within the existing one-page model. I introduced
                a centralized landing page with modal-based access to videos, handouts, and
                transcripts. The goal was to test whether better visual organization alone could
                solve the problem before proposing a bigger structural change.
              </p>
            </ScrollReveal>

            <div className="space-y-6 mb-24">
              {ITERATION_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>

            <ScrollReveal>
              <p style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, maxWidth: "680px", marginBottom: "28px" }}>
                What the feedback revealed
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "32px" }}>
                The visual improvements landed well. But something more fundamental kept
                surfacing: students still felt overwhelmed by seeing the entire writing process
                at once.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "40px" }}>
                Even with cleaner layout and modals, the single-page model created a wall of
                information with no clear entry point. Opening a video in a modal made it harder
                to stay oriented. Videos and resources felt disconnected from the instruction
                they were meant to support.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p style={{ fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, maxWidth: "640px" }}>
                I&apos;d been treating it as a visual design problem. Users were telling me it was structural.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 05 — THE PIVOT ── */}
        <section id="the-pivot" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>05 — The Pivot</SectionLabel></ScrollReveal>

            <div className="max-w-3xl">
              <ScrollReveal delay={0.1}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "32px" }}>
                  The pivot didn&apos;t start with the data — it started in a design review.
                  During a progress presentation, the Head of AWS at GCE (my manager) suggested
                  moving to a fully linear model: each stage of the writing process on its own
                  dedicated page.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "14px" }}>
                  How it was validated
                </p>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "32px" }}>
                  I went back and wireframed the new structure. At the next weekly design
                  meeting — with my manager, two senior designers, a mid-level designer,
                  and the video team — the new direction was immediately approved. It aligned
                  with the vision: each section having its own page, its own focus.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, marginBottom: "48px" }}>
                  From there, the work was mine: take all the content scattered across the
                  original piece — written instruction, embedded videos, downloadable resources —
                  and organize it across eight dedicated pages in a way that actually made sense
                  to students. The eight stages weren&apos;t arbitrary. They emerged from the
                  content itself — identifying which subjects in the original resource carried
                  enough weight to stand alone.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.25}>
                <p style={{ fontSize: "clamp(22px, 2.8vw, 28px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                  A meaningful scope change mid-project. The right call.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 06 — FINAL SOLUTION ── */}
        <section id="final-solution" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>06 — Final Solution</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "64px" }}>
                The final design presents the writing process as a clear, progressive journey
                across eight dedicated pages.
              </p>
            </ScrollReveal>

            <div className="mb-24">
              <WritingProcessTabs />
            </div>

            <ScrollReveal>
              <ul className="space-y-5 mb-16 max-w-2xl">
                {[
                  "A plain-language summary of the stage and its purpose",
                  "Embedded instructional video surfaced in context — not buried in a modal or a menu",
                  "Downloadable handouts and resources tied to that specific step",
                  "A persistent resources section at the bottom of every page, so students always know where to go for help",
                  "Clear navigation to the previous and next stage",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium" style={{ color: "#13181B" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: "#C4C4C4" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "clamp(22px, 2.8vw, 28px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, maxWidth: "640px" }}>
                Students no longer need to figure out where they are or what comes next. The experience guides them forward.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 07 — OUTCOME ── */}
        <section id="outcome" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>07 — Outcome &amp; Stakeholder Response</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "80px" }}>
                The redesigned experience is awaiting a final presentation to GCU&apos;s writing
                department before developer handoff and live deployment. During informal feedback
                sessions, students navigating the redesigned flow were able to identify their
                starting point and next step without prompting — something the original
                single-page format didn&apos;t support.
              </p>
            </ScrollReveal>

            <div>
              <Callout
                label="Discoverability"
                heading="Content surfaced where students actually need it."
                body="Each page presents only what's relevant to that stage — nothing competes for attention. Students encounter the right resource at exactly the right moment."
              />
              <Callout
                label="Comprehension"
                heading="One stage at a time reduces cognitive load."
                body="Dedicated pages let students focus on prewriting, or revision, or citation — without the rest of the process in view at the same time."
                delay={0.05}
              />
              <Callout
                label="Engagement"
                heading="Videos and resources are embedded in context, not tucked behind a modal."
                body="Students no longer have to decide whether to open supplemental content. It's already there, at the right moment, on the right page."
                delay={0.1}
              />
              <Callout
                label="Standards Alignment"
                heading="The redesign meets GCU's UI and accessibility requirements throughout."
                body="From typography and color contrast to responsive layouts, every decision was made within GCU's established design guidelines."
                delay={0.15}
              />
            </div>

            <ScrollReveal>
              <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: 1.7, maxWidth: "560px" }}>
                This project was completed during my internship at GCE. The redesigned resource
                is currently in final review before live deployment at Grand Canyon University.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <CaseStudyBottomNav isOverlay={isOverlay} onClose={onClose} />
    </>
  );

  if (isOverlay) return <div className="cs-body">{body}</div>;

  return (
    <>
      <Nav sections={WP_SECTIONS} accentColor={ACCENT} />
      <CaseStudyNav sections={WP_SECTIONS} accentColor={ACCENT} card />
      <main className="pt-[72px] cs-body">{body}</main>
      <Footer />
    </>
  );
}
