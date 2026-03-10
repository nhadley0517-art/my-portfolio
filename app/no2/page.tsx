import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";

const NO2_SECTIONS = [
  { id: "overview",  label: "Overview" },
  { id: "context",   label: "Context" },
  { id: "insights",  label: "Insights" },
  { id: "process",   label: "Process" },
  { id: "features",  label: "Features" },
  { id: "decisions", label: "Decisions" },
  { id: "roadmap",   label: "Roadmap" },
  { id: "learnings", label: "Learnings" },
];

export const metadata: Metadata = {
  title: "No. 2 — Noah Hadley",
  description:
    "A gut health tracking app built solo in two weeks — design, code, backend, and brand.",
};

const ACCENT = "#7EB77F";
const DARK = "#1C1C1E";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span
        className="text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap"
        style={{ color: ACCENT }}
      >
        {children}
      </span>
      <div className="h-px flex-1 bg-[#DDD8D1]" />
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: "#E5E7EB",
        borderRadius: "12px",
        minHeight: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        color: "#9CA3AF",
      }}
    >
      {label}
    </div>
  );
}

function No2Logo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246 246" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="246" height="246" rx="43.88" ry="43.88" fill="#1c1c1d" />
      <circle cx="47.78" cy="164.32" r="11.44" fill="#7eb880" />
      <path
        fill="#fff"
        d="M185.66,93.37h0c0-12.77-8.71-23.12-19.46-23.12h-92.25c-1.69,0-3.05,1.45-3.05,3.23v38.2c0,1.78,1.37,3.23,3.05,3.23h43.14c3.67,0,4.22,5.61.62,6.39l-31.14,6.82c-9.08,1.99-15.67,11.4-15.67,22.37h0c0,13.91,10.65,25.18,23.78,25.18h87.93c1.69,0,3.05-1.45,3.05-3.23v-38.2c0-1.78-1.37-3.23-3.05-3.23h-30.49c-10.65,0-19.28,13.59-19.28,24.52v-20.64c0-1.28.71-2.43,1.81-2.95l38.54-18.12c.64-.25,1.26-.55,1.87-.88l.25-.12h-.05c6.14-3.45,10.39-10.85,10.39-19.45Z"
      />
    </svg>
  );
}

export default function No2() {
  return (
    <>
      <Nav />
      <CaseStudyNav sections={NO2_SECTIONS} accentColor={ACCENT} />
      <main className="pt-[72px]">
        <style>{`
          @media (max-width: 768px) {
            /* iframe scale-to-fit trick — scale 0.38, fixed 900px width */
            .n2-ifr { overflow: hidden; border-radius: 12px; }
            .n2-ifr iframe { width: 900px !important; transform: scale(0.38); transform-origin: top left; }
            /* wrapper heights = original iframe height × 0.38 */
            .n2-ifr-585 { height: 296px; }  /* 780 × 0.38 */
            .n2-ifr-615 { height: 312px; }  /* 820 × 0.38 */
            .n2-ifr-510 { height: 258px; }  /* 680 × 0.38 */
            .n2-ifr-435 { height: 220px; }  /* 580 × 0.38 */
            .n2-ifr-540 { height: 274px; }  /* 720 × 0.38 */
            /* hero iframe */
            .n2-hero-iframe { height: 280px !important; }
            /* feature video wrapper */
            .n2-feat-vid { max-width: 100% !important; }
            /* first iterations side-by-side */
            .n2-iter-img { max-width: 100% !important; }
          }
        `}</style>

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <div className="px-6 max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <span className="badge-shipped inline-flex items-center justify-center gap-[6px] bg-[#DCFCE7] text-[#16A34A] font-semibold rounded-full" style={{ padding: "8px 16px 8px 12px", fontSize: "0.9rem", overflow: "visible" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="7" fill="#16A34A" />
                  <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Shipping to App Store
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="text-[clamp(40px,7vw,88px)] font-extrabold tracking-tight leading-[1.22] text-[#13181B] mt-5 mb-5">
                No. 2
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-xl md:text-2xl text-[#2D3436] font-light mb-10">
                The No. 1 app for your No. 2
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-3">
                {["Solo", "2 weeks", "Built with Claude Code", "Shipping March 2026"].map((pill) => (
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
              <iframe src="/no2-hero.html" scrolling="no" className="n2-hero-iframe" style={{ width: "100%", height: "500px", border: "none", borderRadius: "16px" }} />
            </div>
          </ScrollReveal>
        </section>

        {/* ── 01 — THE PROJECT ── */}
        <section id="overview" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>01 — The Project</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                I built a gut health app. From scratch. In two weeks. Design, code, backend, brand — all me. No team, no handoffs. Just me, Claude Code, and a problem I thought was worth solving. As of March 9th I am waiting on my Apple Developer account. It goes live on the App Store next week.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 02 — CONTEXT ── */}
        <section id="context" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>02 — Context</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                Colorectal cancer is now the number 1 cause of cancer death in adults under 50 in the U.S. It jumped from 5th place. The symptoms show up years before a diagnosis. Most people ignore them because nobody told them it was worth paying attention to.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="n2-ifr n2-ifr-585" style={{ borderRadius: "12px" }}>
                <iframe src="/1-stats.html?v=2" scrolling="no" style={{ width: "100%", height: "780px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 03 — KEY INSIGHTS ── */}
        <section id="insights" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>03 — Key Insights</SectionLabel>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-4 mb-16">
              {[
                {
                  heading: "Nobody tracks their gut health until something is already wrong.",
                  body: "There is no habit around this. No baseline. People go years without thinking about it, and then something changes and they have nothing to compare it to. No. 2 is about building that baseline before you need it.",
                },
                {
                  heading: "The apps that exist are either scary or useless.",
                  body: "They split into two camps. Cold and clinical, like filling out a medical form. Or so soft and vague they had nothing useful to say. Nobody was making something you would actually want to open every day.",
                },
                {
                  heading: "If it is not fast, people will not do it.",
                  body: "Logging has to be frictionless or it just does not happen. Health tracking apps live and die by whether people actually do it every day. That meant the whole input flow had to be designed around speed first.",
                },
              ].map((insight, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl border border-[#DDD8D1] p-6 h-full">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>
                      {insight.heading}
                    </h4>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">
                      {insight.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <div className="n2-ifr n2-ifr-615" style={{ borderRadius: "12px" }}>
                <iframe src="/2-competitor-landscape.html" scrolling="no" style={{ width: "100%", height: "820px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 04 — PROCESS ── */}
        <section id="process" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>04 — Process</SectionLabel>
            </ScrollReveal>

            <div className="space-y-20">
              <div>
                <ScrollReveal delay={0.1}>
                  <h3 className="text-xl md:text-2xl font-bold text-[#13181B] mb-6">
                    I had never built a backend before. So I learned one.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-10">
                    Going into this I was a designer. I knew Figma. I did not know what row-level security was, what a Supabase migration was, or why an API key being exposed in a chat window was a problem. I used Supabase for the backend and spent a serious amount of time researching security standards before writing a single line. Input validation at the database level. Rate limiting on login attempts. No sensitive data in the app bundle. It was one of the harder parts of the project. But it made me a better product thinker because I now understand what I am actually asking engineers to build when I spec something out.
                  </p>
                </ScrollReveal>
                <ScrollReveal>
                  <div className="n2-ifr n2-ifr-585" style={{ borderRadius: "12px" }}>
                    <iframe src="/4-privacy-flow.html" scrolling="no" style={{ width: "100%", height: "780px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
                  </div>
                </ScrollReveal>
              </div>

              <div>
                <ScrollReveal delay={0.1}>
                  <h3 className="text-xl md:text-2xl font-bold text-[#13181B] mb-6">
                    I started with AI insights. Then I did the math.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-10">
                    The original plan was to run every log through an AI model. At $0.003 per call, once a day per user, that is $1.10 per user per year. At 10,000 users that is $11,000 a year before a single dollar of revenue. So I built a rule-based engine instead. Runs on the device, costs nothing. AI becomes a Phase 2 premium feature when there is actually money to pay for it.
                  </p>
                </ScrollReveal>
                <ScrollReveal>
                  <div className="n2-ifr n2-ifr-510" style={{ borderRadius: "12px" }}>
                    <iframe src="/3-architecture-decision.html?v=2" scrolling="no" style={{ width: "100%", height: "680px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
                  </div>
                </ScrollReveal>
              </div>

              <div>
                <ScrollReveal delay={0.1}>
                  <h3 className="text-xl md:text-2xl font-bold text-[#13181B] mb-6">
                    The UI went through a lot of versions.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-10">
                    I did not land on the final design on the first try. Not even close. The home screen alone went through five or six distinct directions before it felt right. A lot of the process was me describing a very specific feeling to Claude Code — not just make it look clean but things like the card should feel like it has weight, the spacing needs to breathe more, the green should feel calm not medical. It was a different kind of design process than Figma but the eye for detail was the same.
                  </p>
                </ScrollReveal>
                <ScrollReveal>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>First iterations</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="n2-iter-img" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home-screen-first-iteration.png" alt="Home screen first iteration" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
                    </div>
                    <div className="n2-iter-img" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/calendar-screen-first-iteration.png" alt="Calendar screen first iteration" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 — FEATURES ── */}
        <section id="features" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>05 — Features</SectionLabel>
            </ScrollReveal>

            <div className="space-y-20">
              {[
                {
                  heading: "Onboarding that actually sets you up.",
                  body: "The onboarding asks about your health goals and any existing conditions. That context shapes what the app pays attention to from day one. It also had to feel warm and easy because gut health is already an awkward topic for most people.",
                  videoSrc: "/onboarding-screen.mp4",
                },
                {
                  heading: "Logging that gets out of your way.",
                  body: "Tap your Bristol type, rate any discomfort, add a quick note if you want. Done. The Bristol Stool Scale is the input method because it is what doctors actually use, so every log is medically meaningful even if you never think about it that way.",
                  videoSrc: "/logging-screen.mp4",
                },
                {
                  heading: "A home screen that tells you where you stand.",
                  body: "Streak count, last log, a nudge if you have not logged today. Designed to feel like a quick check-in, not a dashboard you have to decode.",
                  videoSrc: "/home-screen.mp4",
                },
                {
                  heading: "A calendar so you can actually see your patterns.",
                  body: "The calendar maps every log across the month. At a glance you can see how consistent you have been and spot patterns across days or weeks. Most health apps bury this view. Here it is front and center.",
                  videoSrc: "/calendar-screen.mp4",
                },
                {
                  heading: "Insights that mean something, not just charts.",
                  body: "Your Bristol average, your discomfort trend, whether things are improving or not. The Apple Watch style rings make it quick to read. The copy explains it in plain language. No medical degree required.",
                  videoSrc: "/insights-screen.mp4",
                },
                {
                  heading: "Export everything to a PDF for your doctor.",
                  body: "If something feels off, you can export your full log history as a clean formatted PDF straight from the app. No screenshots, no trying to explain it from memory. Just show your doctor the data.",
                  videoSrc: null,
                },
              ].map((feature, i) => (
                <ScrollReveal key={i}>
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#13181B] mb-4">
                        {feature.heading}
                      </h3>
                      <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                        {feature.body}
                      </p>
                    </div>
                    <div className="n2-feat-vid" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {feature.videoSrc ? (
                        <video src={feature.videoSrc} autoPlay loop muted playsInline style={{ width: "100%", borderRadius: "16px", display: "block" }} />
                      ) : (
                        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "420px", margin: "0 auto" }}>
                        <iframe src="/doctor-pdf.pdf" style={{ width: "100%", height: "600px", border: "none", display: "block" }} />
                      </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 06 — DESIGN DECISIONS ── */}
        <section id="decisions" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Design Decisions</SectionLabel>
            </ScrollReveal>

            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl p-8 md:p-10" style={{ background: DARK }}>
                  <h3 className="text-xl md:text-2xl font-bold text-[#F4F4F5] mb-6">
                    The name is the whole brand strategy.
                  </h3>
                  <p className="text-lg leading-relaxed font-light mb-10" style={{ color: "rgba(244,244,245,0.75)" }}>
                    No. 2. Everyone knows what it means. Slightly funny, immediately clear, owns the subject instead of tiptoeing around it. The tagline was obvious: The No. 1 app for your No. 2. The logo dot is a colon — the punctuation mark and the organ. Two meanings, one mark.
                  </p>
                  <div className="n2-ifr n2-ifr-540" style={{ borderRadius: "12px" }}>
                    <iframe src="/6-brand-identity.html" scrolling="no" style={{ width: "100%", height: "720px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 07 — ROADMAP ── */}
        <section id="roadmap" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Roadmap</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                Phase 1 is just getting it out the door. Ship it, prove the core experience works, build a user base. Phase 2 is where it gets smarter with AI. Phase 3 is where it starts to matter at a clinical level.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="n2-ifr n2-ifr-435" style={{ borderRadius: "12px" }}>
                <iframe src="/5-roadmap.html" scrolling="no" style={{ width: "100%", height: "580px", border: "none", borderRadius: "12px", overflow: "hidden" }} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 08 — KEY LEARNINGS ── */}
        <section id="learnings" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>08 — Key Learnings</SectionLabel>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  heading: "Learning backend as a designer changed how I think about specs.",
                  body: "I used to write specs without really understanding what I was asking for. Now I understand how RLS works, how auth sessions are managed, and what actually happens when data gets stored. It made me a better collaborator and a better product thinker.",
                },
                {
                  heading: "The UI only got good because I refused to let it be fine.",
                  body: "There were a lot of moments where something was almost right. I kept going anyway. The gap between almost right and actually right is where most of the hours went.",
                },
                {
                  heading: "The AI cost thing was a product decision, not a technical one.",
                  body: "Cutting AI from Phase 1 was not a compromise. It made the product cheaper, faster to ship, and more honest about what it actually is right now.",
                },
                {
                  heading: "Two weeks is enough to ship something real.",
                  body: "With Claude Code handling the development work, I could focus on actual product decisions. That is a different kind of solo than it used to be.",
                },
              ].map((learning, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="bg-white rounded-2xl border border-[#DDD8D1] p-6 h-full">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>
                      {learning.heading}
                    </h4>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">
                      {learning.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
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
              href="/univo"
              className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#7EB77F] transition-colors"
            >
              Univo
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
