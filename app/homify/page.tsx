import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";

const HOMIFY_SECTIONS = [
  { id: "overview",       label: "Overview" },
  { id: "problem",        label: "Problem" },
  { id: "research",       label: "Research" },
  { id: "design-goals",   label: "Design Goals" },
  { id: "wireframes",     label: "Wireframes" },
  { id: "final-solution", label: "Final Solution" },
  { id: "before-after",   label: "Before & After" },
  { id: "outcome",        label: "Outcome" },
];
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export const metadata: Metadata = {
  title: "Homify — Noah Hadley",
  description:
    "UX case study: a smart home dashboard redesigned from scratch for a cleaner, more intuitive everyday experience.",
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

const HERO_IMAGE      = "https://framerusercontent.com/images/AtApTh1FMEDZj6uzUvXM2fytFnc.png";
const COMPETITOR_IMAGE = "https://framerusercontent.com/images/7wSuHvkAFDVfn28GeSOlIbavyM.png";

const WIREFRAME_IMAGES = [
  { src: "https://framerusercontent.com/images/i4TqqEdNZfehqJ0w0aTdE412jA.png", alt: "Wireframe — home screen" },
  { src: "https://framerusercontent.com/images/u1YFgOG4iNdIx4EcuFHmbDLmcYw.png", alt: "Wireframe — device controls" },
];

const FINAL_IMAGES = [
  { src: "https://framerusercontent.com/images/or1gxbsL4ov05A8a8JH4rk3vo9Y.png", alt: "Final design — dashboard overview" },
  { src: "https://framerusercontent.com/images/lWdSVGw3v0DFrSxUHzXhBtFMuTQ.png", alt: "Final design — device management" },
];

const BEFORE_IMAGE = "https://framerusercontent.com/images/OOPmuReHUQ4ADh4SHcIuWgJmYg.png";
const AFTER_IMAGE  = "https://framerusercontent.com/images/OmMICPUxM6W4cq7UCRWEPBEww.png";

export default function Homify() {
  return (
    <>
      <Nav />
      <CaseStudyNav sections={HOMIFY_SECTIONS} />
      <main className="pt-[72px]">

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <div className="px-6 max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <h1 className="text-[clamp(40px,7vw,88px)] font-extrabold tracking-tight leading-[1.22] text-[#13181B] mb-5">
                Homify
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-xl md:text-2xl text-[#2D3436] font-light mb-10">
                A new way to control your home
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-3">
                {["UX/UI Designer", "5 weeks", "Figma", "Student Project"].map((pill) => (
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

          <ScrollReveal>
            <div className="px-6 max-w-5xl mx-auto py-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="Homify smart home dashboard"
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
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  Smart home systems give users powerful control and insight into their homes,
                  but many platforms feel overwhelming, confusing, and spread across too many
                  places. Users want one simple space to manage lighting, temperature, devices,
                  and home activity without the usual frustration.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                      Designed For Users Who
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Want to easily understand their home environment at a glance",
                        "Need simple but powerful tools to control and monitor devices",
                        "Feel overwhelmed by scattered systems and confusing dashboards",
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
                      { label: "Timeline",     value: "5 weeks" },
                      { label: "Tools",        value: "Figma" },
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
        <section id="problem" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>02 — The Problem</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[clamp(26px,3.8vw,50px)] font-bold text-[#13181B] leading-tight mb-8">
                Smart home technology is powerful. Managing it shouldn&apos;t feel like a chore.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light mb-16 max-w-3xl">
                Smart home technology gives people powerful control over their homes, but the
                experience of managing it is not always intuitive. Users are forced to navigate
                multiple apps, learn different systems, and constantly work to understand
                what&apos;s happening in their home. Instead of feeling confident and supported,
                the experience can feel fragmented and overwhelming.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Users struggle to see important information clearly",
                  "Basic controls take more effort than they should",
                  "Smart home technology can feel intimidating and complicated",
                  "Managing devices doesn't feel streamlined or efficient",
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
        <section id="research" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>03 — Research &amp; Competitor Landscape</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                To understand how users interact with smart homes, I reviewed existing
                dashboards, studied competitor platforms, and gathered feedback from active
                users.
              </p>
            </ScrollReveal>

            <div className="mb-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPETITOR_IMAGE}
                alt="Competitor landscape analysis"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
              />
            </div>

            <ScrollReveal delay={0.1}>
              <p className="text-[#13181B] text-lg font-semibold leading-relaxed max-w-3xl mb-16">
                Research confirmed that users wanted clarity, organization, and reassurance
                rather than complexity. Managing devices feels powerful but not always simple
                — important controls are often hidden behind layers of navigation.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "User Needs",
                    body: "Users need a clear summary of what is happening in their home, what devices are active, and what actions to take next, without technical expertise.",
                  },
                  {
                    title: "Pain Points",
                    body: "Most users struggle to understand scattered device controls, unclear settings, and confusing interfaces, which makes managing smart homes difficult.",
                  },
                  {
                    title: "Behaviors",
                    body: "Users often check devices multiple times a day to adjust lighting, temperature, and media, wanting quick updates without complex menus.",
                  },
                  {
                    title: "Market Insights",
                    body: "Most users responded positively to simple layouts, friendly visuals, and clear organization, which helped them feel more confident managing their home.",
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
          </div>
        </section>

        {/* ── 04 — DESIGN GOALS ── */}
        <section id="design-goals" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>04 — Design Goals</SectionLabel>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Make smart home information easy to understand at a glance",
                  "Support quick actions while allowing deeper device control",
                  "Create a visual system that feels friendly, modern, and approachable",
                  "Help users feel confident managing their home technology",
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
        <section id="wireframes" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>05 — Wireframes</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The design process focused on simplifying smart home management while preserving
                depth and functionality. I explored layout systems, interaction patterns, and
                visual hierarchy to ensure that essential features stayed clear and approachable.
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
                    "Appreciated having everything in one organized dashboard",
                    "Found lighting, temperature, and device controls very helpful",
                    "Responded well to simple navigation and clear controls",
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
                    "Refined spacing and visual hierarchy",
                    "Improved component clarity",
                    "Strengthened visual separation between features",
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
        <section id="final-solution" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Final Solution</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The final dashboard gives users a clear understanding of their home while making
                control simple and intuitive. Key features like lighting, temperature, media,
                and system insights are easy to access, visually organized, and designed to
                reduce complexity.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {FINAL_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 07 — BEFORE & AFTER ── */}
        <section id="before-after" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Before &amp; After</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The first iteration was created in 2024 as a student project. I revisited it
                a year later and revised the visual design along with how the interface
                functioned for users — adding an interactive temperature gauge, removing
                unnecessary colors, and improving the graphs with clearer, more meaningful
                information.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <BeforeAfterSlider before={BEFORE_IMAGE} after={AFTER_IMAGE} />
            </ScrollReveal>
          </div>
        </section>

        {/* ── 08 — OUTCOME & REFLECTION ── */}
        <section id="outcome" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>08 — Outcome &amp; Reflection</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                The design improved clarity, reduced confusion, and helped users feel more
                comfortable interacting with their smart home systems. It successfully created
                a structured and understandable dashboard experience.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <ScrollReveal delay={0.1}>
                <h4 className="text-sm font-semibold text-[#FD8973] uppercase tracking-[0.12em] mb-5">
                  Impact on Users
                </h4>
                <p className="text-[#2D3436] text-base leading-relaxed font-light">
                  Users now have a single space to monitor activity, manage devices, and
                  understand what is happening in their home. The experience supports everyday
                  tasks and helps them feel more aware and in control.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <h4 className="text-sm font-semibold text-[#FD8973] uppercase tracking-[0.12em] mb-5">
                  Lessons Learned
                </h4>
                <p className="text-[#2D3436] text-base leading-relaxed font-light">
                  Designing for simplicity requires careful decisions about what to highlight
                  and what to reduce. Clear hierarchy, thoughtful structure, and visual
                  communication play a huge role in user confidence.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Future Improvements
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                Future opportunities include expanding personalization, improving automation
                features, and offering deeper insights into performance and energy use to
                support smarter home management.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── BOTTOM NAVIGATION ── */}
        <section className="px-6 py-12 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a
              href="/relay"
              className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Relay
            </a>
            <a
              href="/#work"
              className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#FD8973] transition-colors"
            >
              View all work
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
