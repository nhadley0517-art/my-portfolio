import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Univo — Noah Hadley",
  description:
    "UX case study: a mobile app concept that translates complex medical records into plain-language summaries patients can actually understand.",
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

const COMPETITOR_IMAGE = "https://framerusercontent.com/images/iGhFqxgbf7vw6gD5UNuViA1G0.png";

const WIREFRAME_IMAGES = [
  { src: "https://framerusercontent.com/images/2NOZ2mpiWfKKZmNaHd0GZtWNumk.png", alt: "Wireframe — home screen" },
  { src: "https://framerusercontent.com/images/chQgxujBAVIcCdBZF28NtImnBWM.png", alt: "Wireframe — visit summary" },
  { src: "https://framerusercontent.com/images/HpK3TYbR3OEKaOTR5jvDz7yJuQ.png", alt: "Wireframe — medication detail" },
  { src: "https://framerusercontent.com/images/AR1Zm9FtFFi9k56T2zWipA6qdk.png", alt: "Wireframe — records upload" },
];

const FINAL_IMAGES = [
  { src: "https://framerusercontent.com/images/ghJ6svUJ6gHdAOLPeICeZgRVivI.png", alt: "Final design — overview screen" },
  { src: "https://framerusercontent.com/images/3knfP3ccjan5Bk5xgQT4u8o.png",     alt: "Final design — visit summary" },
  { src: "https://framerusercontent.com/images/Qf1ga3gPk9n8s9KWXh5Se1KSLQ.png",  alt: "Final design — diagnoses" },
  { src: "https://framerusercontent.com/images/4ykcvFM32fAHDjNT2ww9jzeIY.png",   alt: "Final design — medications" },
  { src: "https://framerusercontent.com/images/QlAYHhmDDPAKHzk8I66wfrX8.png",    alt: "Final design — next steps" },
  { src: "https://framerusercontent.com/images/X2Z6xbl9ATopFmJGk8GLsjhqKc.png",  alt: "Final design — insurance details" },
];

export default function Univo() {
  return (
    <>
      <Nav />
      <main className="pt-[72px]">

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <div className="px-6 max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <h1 className="text-[clamp(40px,7vw,88px)] font-extrabold tracking-tight leading-[1.22] text-[#13181B] mb-5">
                Univo
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-xl md:text-2xl text-[#2D3436] font-light mb-10">
                Designing for clarity in healthcare communication
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-3">
                {[
                  "UX/UI Designer",
                  "4 weeks",
                  "Figma, Illustrator",
                  "Student Project",
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

            <video src="/univo-hero.webm" autoPlay muted playsInline style={{width: '100%', borderRadius: '12px', display: 'block', marginTop: '32px'}} />
          </div>

        </section>

        {/* ── 01 — OVERVIEW ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>01 — Overview</SectionLabel>
            </ScrollReveal>

            <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-12 md:gap-20">
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  Univo is a mobile app concept created for a student project. It helps adult
                  patients understand their health by turning complex medical records into clear,
                  simple summaries. It highlights diagnoses, medications, next steps, recent
                  visits, and insurance details, and lets users upload their own records.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                      Designed For Patients Who
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Receive digital visit summaries through patient portals",
                        "Are asked to follow up on medications or lifestyle changes",
                        "Feel overwhelmed reviewing medical records on their own",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[#13181B] text-sm font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Role",         value: "UX/UI Designer" },
                      { label: "Timeline",     value: "4 weeks" },
                      { label: "Tools",        value: "Figma, Illustrator" },
                      { label: "Project Type", value: "Student Project" },
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
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>02 — The Problem</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[clamp(26px,3.8vw,50px)] font-bold text-[#13181B] leading-tight mb-8">
                Access was not the problem. Comprehension was.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light mb-16 max-w-3xl">
                At the start of this project, I assumed modern patient portals had largely solved
                usability challenges. After reviewing anonymized visit summaries and existing
                tools, I realized medical notes are written for clinicians — dense, jargon-heavy,
                and structured for documentation, not decision-making. Patients leave appointments
                with information — but not always understanding.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "Written for clinicians",
                  "Dense and jargon-heavy",
                  "Structured for documentation, not decision-making",
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

        {/* ── 03 — RESEARCH & COMPETITOR LANDSCAPE ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>03 — Research &amp; Competitor Landscape</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                To understand how patients engage with their medical records, I reviewed
                anonymized visit summaries and explored existing patient portals and health apps.
              </p>
            </ScrollReveal>

            <div className="mb-16">
              <CaseImage src={COMPETITOR_IMAGE} alt="Competitor landscape analysis" />
            </div>

            <ScrollReveal delay={0.1}>
              <p className="text-[#13181B] text-lg font-semibold leading-relaxed max-w-3xl mb-16">
                Patients generally had access to their information, but struggled to identify
                what mattered most after an appointment.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4 mb-16">
                {[
                  {
                    title: "User Needs",
                    body: "Patients need a clear summary of what happened during their visit, what has changed, and what actions to take next, without medical knowledge.",
                  },
                  {
                    title: "Pain Points",
                    body: "Medical notes are dense and jargon-heavy, making it hard for patients to identify diagnoses, medication changes, and next steps after appointments.",
                  },
                  {
                    title: "Behaviors",
                    body: "When confused, patients skim records, avoid reviewing them, or search online for explanations instead of trusting their official medical notes.",
                  },
                  {
                    title: "Market Insights",
                    body: "Most patient portals prioritize accuracy and completeness, but offer little support for comprehension or emotional clarity after visits.",
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
            </ScrollReveal>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Real-World Constraints
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                This project was completed in four weeks, requiring tight scope control. Instead
                of redesigning healthcare systems broadly, I focused on one specific gap:
                post-visit clarity. I also considered real-world constraints: HIPAA and
                compliance implications, liability risks of modifying clinician language,
                integration complexity with existing EHR systems, and trust concerns around
                AI-generated summaries. Rewriting medical notes risked legal issues and reduced
                trust, so I avoided replacing them. Instead, I added a summary-first layer that
                improves clarity while preserving accuracy and transparency.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 04 — DESIGN GOALS ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>04 — Design Goals</SectionLabel>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Surface key takeaways first",
                  "Use plain language without losing meaning",
                  "Centralize documents and insurance details",
                  "Improve scannability and visual hierarchy",
                ].map((goal, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DDD8D1] p-6">
                    <span className="text-xs font-semibold text-[#FD8973] mb-3 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 05 — WIREFRAMES ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>05 — Wireframes</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                Early wireframes focused on a summary-first layout, surfacing the most important
                information immediately after a visit.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-6 mb-16">
              {WIREFRAME_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-10">
                Initial User Feedback
              </h3>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-12">
              <ScrollReveal delay={0.1}>
                <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                  What Users Said
                </p>
                <ul className="space-y-3">
                  {[
                    "Summaries were helpful",
                    "Some actions were easy to miss",
                    "Hierarchy could be clearer",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#13181B] text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                  What I Changed
                </p>
                <ul className="space-y-3">
                  {[
                    "Increased contrast for key actions",
                    "Improved spacing and grouping",
                    "Clarified labels",
                    "Strengthened visual hierarchy",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#13181B] text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 06 — FINAL SOLUTION ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Final Solution</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The final prototype reflects a balance between clarity and credibility, helping
                patients understand their medical information without feeling overwhelmed or
                confused.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {FINAL_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 07 — OUTCOME & REFLECTION ── */}
        <section className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Outcome &amp; Reflection</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The final design met the core objective of improving clarity around medical
                information. By surfacing diagnoses, medications, and next steps in a
                summary-first layout, Univo helps patients quickly understand their care without
                needing to read complex medical jargon.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Product Thinking &amp; Feasibility
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                If brought to market, Univo would launch as a limited pilot rather than a full
                hospital system replacement. A realistic rollout would begin with read-only visit
                summaries, launch within a single provider network, and prioritize clarity over
                advanced AI features. Full EHR integration is complex and slow — proving
                comprehension gains would come first.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-[#13181B] rounded-2xl p-8 mb-6">
                <p className="text-[#F4F4F5] text-xl md:text-2xl font-semibold leading-snug mb-8">
                  This is not just a UI improvement. It is a comprehension improvement.
                </p>
                <ul className="space-y-3">
                  {[
                    "Operational efficiency",
                    "Patient satisfaction",
                    "Treatment compliance",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[#F4F4F5]/80 text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FD8973] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Growth Reflection
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                This project challenged me to design within emotional and legal context.
                Healthcare design is not just about usability — it involves trust, compliance,
                and high-stakes information. I learned to balance clarity with responsibility,
                scope intentionally, think beyond interface design, and consider system-level
                constraints.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── BOTTOM NAVIGATION ── */}
        <section className="px-6 py-12 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a
              href="/writingprocess"
              className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Writing Process Redesign
            </a>
            <a
              href="/relay"
              className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#FD8973] transition-colors"
            >
              Relay
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
