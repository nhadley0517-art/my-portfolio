import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import WritingProcessTabs from "@/components/WritingProcessTabs";
import CaseStudyNav from "@/components/CaseStudyNav";

const WP_SECTIONS = [
  { id: "overview",        label: "Overview" },
  { id: "problem",         label: "Problem" },
  { id: "research",        label: "Research" },
  { id: "first-iteration", label: "First Iteration" },
  { id: "the-pivot",       label: "The Pivot" },
  { id: "final-solution",  label: "Final Solution" },
  { id: "outcome",         label: "Outcome" },
];

export const metadata: Metadata = {
  title: "Writing Process Redesign — Noah Hadley",
  description:
    "UX case study: redesigning GCU's student writing resource from a single overwhelming page into a guided, step-by-step learning experience.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className="text-xs font-semibold text-[#FD8973] uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-[#DDD8D1]" />
    </div>
  );
}

function CaseImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ScrollReveal>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
      />
    </ScrollReveal>
  );
}

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


export default function WritingProcess() {
  return (
    <>
      <Nav />
      <CaseStudyNav sections={WP_SECTIONS} />
      <main className="pt-[72px]">

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          {/* Text content — constrained */}
          <div className="px-6 max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <span className="badge-shipped inline-flex items-center justify-center gap-[6px] bg-[#DCFCE7] text-[#16A34A] font-semibold rounded-full" style={{ padding: "8px 16px 8px 12px", fontSize: "0.9rem", overflow: "visible" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="7" fill="#16A34A" />
                  <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Shipped
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1 className="text-[clamp(40px,7vw,88px)] font-extrabold tracking-tight leading-[1.22] text-[#13181B] mt-5 mb-5">
                Writing Process<br />Redesign
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-xl md:text-2xl text-[#2D3436] font-light mb-10">
                Clarifying how students learn to write
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-wrap gap-3">
                {[
                  "UX/UI Designer (Internship)",
                  "Grand Canyon Education/GCU",
                  "8 weeks",
                  "Figma, Illustrator",
                ].map((pill) => (
                  <span
                    key={pill}
                    className="text-sm font-medium text-[#13181B] border border-[#DDD8D1] bg-white px-4 py-2 rounded-full"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Banner — aligned with page content margins */}
          <ScrollReveal>
            <div className="px-6 max-w-5xl mx-auto py-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="Writing Process Redesign banner"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
              />
            </div>
          </ScrollReveal>
        </section>

        {/* ── 01 — OVERVIEW ── */}
        <section id="overview" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>01 — Overview</SectionLabel>
            </ScrollReveal>

            <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-12 md:gap-20">
              {/* Left: overview paragraph */}
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  During my internship at GCE, I redesigned a student-facing writing resource
                  — originally built as a single, content-heavy page. The material was strong,
                  but the experience had aged: instructional content was buried in menus, students
                  had to self-assemble the writing process, and the interface prioritized
                  comprehensiveness over clarity. My goal was to improve how students discover,
                  navigate, and absorb writing instruction — while aligning the redesigned
                  experience with GCU&apos;s UI and accessibility standards — and it&apos;s now
                  in the final stages before live deployment.
                </p>
              </ScrollReveal>

              {/* Right: bullets + metadata */}
              <ScrollReveal delay={0.2}>
                <div className="space-y-10">
                  {/* Designed For */}
                  <div>
                    <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                      Designed For Students Who
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Feel unsure where to begin when given a writing assignment",
                        "Struggle to locate relevant writing help at the right moment",
                        "Become overwhelmed by dense, all-in-one resource pages",
                        "Benefit from structured guidance through complex tasks",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[#13181B] text-sm font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    {[
                      { label: "Role", value: "UX/UI Designer (Internship)" },
                      { label: "Company", value: "Grand Canyon Education/GCU" },
                      { label: "Status", value: "Shipped" },
                      { label: "Timeline", value: "8 weeks" },
                      { label: "Tools", value: "Figma, Illustrator" },
                      { label: "Project Type", value: "Educational Media Redesign" },
                    ].map(({ label, value }, i, arr) => (
                      <div key={label}>
                        <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.12em] mb-0.5">
                          {label}
                        </p>
                        <p className="text-[#13181B] text-sm font-medium">{value}</p>
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
        <section id="problem" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>02 — The Problem</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[clamp(26px,3.8vw,50px)] font-bold text-[#13181B] leading-tight mb-8">
                The original resource packed the entire writing process into a single page.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light mb-16 max-w-3xl">
                To access any specific stage — prewriting, drafting, revision — students had to
                dig through menus and tabs. The content was all there, but the structure worked
                against the people it was meant to help.
              </p>
            </ScrollReveal>

            <div className="space-y-6 mb-16">
              {PROBLEM_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>

            <ScrollReveal>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "No visible progression through the writing process — students had no sense of where they were or what came next",
                  "Educational videos and resources were buried rather than surfaced at the moment they were relevant",
                  "The interface was built for exploration, not instruction — placing the burden of assembly on the student",
                ].map((issue, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DDD8D1] p-6">
                    <span className="text-xs font-semibold text-[#FD8973] mb-3 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">{issue}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 03 — RESEARCH & EARLY INSIGHTS ── */}
        <section id="research" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>03 — Research &amp; Early Insights</SectionLabel>
            </ScrollReveal>

            <div className="max-w-3xl space-y-7">
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  Before touching Figma, I reviewed student-facing educational platforms and
                  comparable writing resources. A clear pattern emerged: the tools that worked
                  best combined sequential structure with just-in-time content — giving students
                  what they needed at each stage, not everything at once.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  I also spoke with students between classes — asking how they used writing
                  resources, what frustrated them, and whether they&apos;d turned to outside
                  sources (like Google or YouTube) instead of official tools. The answers were
                  consistent: official resources felt overwhelming, so most students either
                  skimmed and gave up, or bypassed them entirely.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <p className="text-[#13181B] text-lg font-semibold leading-relaxed">
                  These early conversations shaped my hypothesis going into the wireframe phase:
                  the problem wasn&apos;t the content — it was the structure around it.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 04 — FIRST ITERATION ── */}
        <section id="first-iteration" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>04 — First Iteration</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                My first approach focused on improving clarity within the existing one-page
                model — introducing a centralized landing page with modal-based access to videos,
                handouts, and transcripts, so students could view content without losing their
                place. The goals were to reduce visual clutter, improve scannability, and surface
                key resources more prominently. I intentionally kept the architecture intact to
                test whether better visual organization alone could solve the problem before
                proposing a more significant structural change.
              </p>
            </ScrollReveal>

            <div className="space-y-6 mb-16">
              {ITERATION_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Testing &amp; The Moment Everything Changed
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-12">
                The visual improvements landed well. But something more fundamental kept
                surfacing: students still felt overwhelmed by seeing the entire writing process
                at once. Even with cleaner layout and modals, the single-page model created a
                wall of information with no clear entry point.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <ul className="space-y-3 mb-12">
                {[
                  "Each stage of the writing process felt significant enough to deserve its own dedicated space",
                  "The modals made it harder to stay oriented — opening a video felt like losing your place",
                  "Videos and downloadable resources felt disconnected from the written instruction they were meant to support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#13181B] text-base font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                This feedback reframed the problem for me. I&apos;d been treating it as a visual
                design issue, but users were telling me it was a structural one. The one-page
                format wasn&apos;t failing because it looked cluttered — it was failing because
                it asked students to hold the entire writing process in their head at once.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 05 — THE PIVOT ── */}
        <section id="the-pivot" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>05 — The Pivot</SectionLabel>
            </ScrollReveal>

            <div className="max-w-3xl space-y-8">
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  Rather than refining the one-page experience further, the project restructured
                  the resource into a linear, eight-page learning flow — each page dedicated to
                  a single stage of the writing process. This pivot reframed the entire product:
                  instead of a reference tool students navigate on their own terms, it became a
                  guided instructional experience that walks them through it step by step. Videos
                  and resources now appear inline, at exactly the stage where they&apos;re
                  relevant, rather than tucked into a modal or a menu.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p className="text-[#13181B] text-xl font-semibold leading-snug">
                  It was a meaningful scope change mid-project, but the right call.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 06 — FINAL SOLUTION ── */}
        <section id="final-solution" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Final Solution</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The final design presents the writing process as a clear, progressive journey
                across eight dedicated pages.
              </p>
            </ScrollReveal>

            <div className="mb-16">
              <WritingProcessTabs />
            </div>

            <ScrollReveal>
              <ul className="space-y-4 mb-12 max-w-3xl">
                {[
                  "A plain-language summary of the stage and its purpose",
                  "Embedded instructional video surfaced in context",
                  "Downloadable handouts and resources tied to that specific step",
                  "Clear navigation to the previous and next stage",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#13181B] text-base font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                The result removes the cognitive burden of self-assembly. Students no longer need
                to figure out where they are or what comes next — the experience guides them
                forward.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 07 — OUTCOME & STAKEHOLDER RESPONSE ── */}
        <section id="outcome" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Outcome &amp; Stakeholder Response</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The redesigned experience is currently pending a final presentation to
                GCU&apos;s writing department before developer handoff and live deployment,
                expected in 2026. During informal testing, students who used the redesigned flow
                were able to identify their starting point and next step without prompting —
                something that wasn&apos;t possible with the original single-page format.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4 mb-16">
              {[
                {
                  title: "Discoverability",
                  body: "Instructional content is surfaced at the moment it's needed, not buried in menus",
                },
                {
                  title: "Comprehension",
                  body: "Each stage gets dedicated focus, reducing the cognitive load of seeing the full process at once",
                },
                {
                  title: "Engagement",
                  body: "Videos and resources are embedded in context, making them more likely to be used",
                },
                {
                  title: "Standards alignment",
                  body: "The redesign meets GCU's UI and accessibility requirements throughout",
                },
              ].map((card, i) => (
                <ScrollReveal key={card.title} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl border border-[#DDD8D1] p-6 h-full">
                    <h4 className="text-sm font-semibold text-[#FD8973] mb-3">{card.title}</h4>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">{card.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <p className="text-[#2D3436] text-base leading-relaxed font-light max-w-3xl">
                This project was completed during my internship at GCE. The redesigned resource
                is currently in final review before live deployment at Grand Canyon University.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── BOTTOM NAVIGATION ── */}
        <section className="px-6 py-12 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a
              href="/#work"
              className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to all work
            </a>
            <a
              href="/univo"
              className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#FD8973] transition-colors"
            >
              Next project: Univo
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
