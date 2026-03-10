import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";

const RELAY_SECTIONS = [
  { id: "overview",       label: "Overview" },
  { id: "problem",        label: "Problem" },
  { id: "research",       label: "Research" },
  { id: "design-goals",   label: "Design Goals" },
  { id: "explorations",   label: "Explorations" },
  { id: "key-decisions",  label: "Key Decisions" },
  { id: "final-solution", label: "Final Solution" },
  { id: "outcome",        label: "Outcome" },
];

export const metadata: Metadata = {
  title: "Relay — Noah Hadley",
  description:
    "UX case study: a mission coordination dashboard for field teams operating in disaster zones with no connectivity.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: ACCENT }}>
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

const ACCENT = "#E53935";

const HERO_IMAGE = "https://framerusercontent.com/images/OpIQOvWMlQ6KeOXJriYn9pAUUfo.png";
const COMPETITOR_IMAGE = "https://framerusercontent.com/images/pg3QcVMTWwXSd3He9299kvaf2eA.jpg";

const EXPLORATION_IMAGES = [
  { src: "https://framerusercontent.com/images/JsDsfNVYzmqHo3KmT89Cm65Y0.png",   alt: "Early exploration — wire mesh map concept" },
  { src: "https://framerusercontent.com/images/ysl90Eic4M7MXzIzKOWdeo2fCss.png", alt: "Early exploration — 3D mission zone concept" },
  { src: "https://framerusercontent.com/images/66ao3hB4Xt70B1piEUDTDx4uFs.png",  alt: "Early exploration — dense dashboard layout" },
  { src: "https://framerusercontent.com/images/eqRDdrrd9svpX4mjsf2f0U0JzU.png",  alt: "Early exploration — hierarchy-first iteration" },
];

const FINAL_IMAGES = [
  { src: "https://framerusercontent.com/images/3Azrq6QuapcijwKBP4UxaMbIc.png",   alt: "Relay — full dashboard view" },
  { src: "https://framerusercontent.com/images/fFKfo9r27kQ37NPp2LEOxdU6AGI.png", alt: "Relay — live map and team locations" },
  { src: "https://framerusercontent.com/images/nhQcnVXi8z86TRVrOn3qOuzBWzg.png", alt: "Relay — hazard alerts and side panels" },
];

export default function Relay() {
  return (
    <>
      <Nav />
      <CaseStudyNav sections={RELAY_SECTIONS} accentColor={ACCENT} />
      <main className="pt-[72px]">

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <div className="px-6 max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <h1 className="text-[clamp(40px,7vw,88px)] font-extrabold tracking-tight leading-[1.22] text-[#13181B] mb-5">
                Relay
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-xl md:text-2xl text-[#2D3436] font-light mb-10">
                A mission coordination dashboard for field teams operating where connectivity fails
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-wrap gap-3">
                {[
                  "UX/UI Designer",
                  "5 weeks",
                  "Figma, Figma Make",
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
          </div>

          <ScrollReveal>
            <div className="px-6 max-w-5xl mx-auto py-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="Relay mission coordination dashboard"
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
                  Relay is a mission coordination and communication dashboard designed for field
                  teams operating in disaster zones, rural areas, and remote environments where
                  radios fail and cell service disappears. It gives teams and command staff a
                  shared, real-time operational view — centralizing team locations, hazard alerts,
                  mission objectives, and emergency actions in one place. This was a class project
                  with an open brief. I chose to design for high-stakes field operations because
                  it presented a genuinely hard UI problem: how do you design a dashboard that
                  supports fast, confident decisions under extreme pressure, with no room for
                  confusion?
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="space-y-10">
                  <div>
                    <p className="text-xs font-semibold text-[#7D8A93] uppercase tracking-[0.15em] mb-5">
                      Designed For Teams Who
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Work in areas with poor or unstable signal",
                        "Coordinate multiple units across large areas",
                        "Need fast access to safety-critical information",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[#13181B] text-sm font-medium">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ACCENT }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Role",         value: "UX/UI Designer" },
                      { label: "Timeline",     value: "5 weeks" },
                      { label: "Tools",        value: "Figma, Figma Make" },
                      { label: "Project Type", value: "Student Project — Mission Coordination Dashboard" },
                      { label: "Team",         value: "Solo designer, with feedback from class pitch presentations" },
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
                The core issue wasn&apos;t missing data. It was prioritization.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light mb-16 max-w-3xl">
                During emergency or remote missions, teams are often working across fragmented
                tools — radios, paper notes, separate apps — while under intense pressure with
                weak or no connectivity. The result is predictable: critical information gets
                missed, situational awareness breaks down, and emergency escalation is slower
                than it needs to be. In a high-stress moment, no one has time to hunt through
                a cluttered interface for what matters most. The tool itself was becoming an
                obstacle.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Teams defaulted to radios and memory when digital tools felt too slow or unclear",
                  "Hazard updates and weather changes were easy to overlook",
                  "Emergency actions were buried behind multiple steps",
                  "Situational awareness broke down across units during critical moments",
                ].map((issue, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DDD8D1] p-6">
                    <span className="text-xs font-semibold mb-3 block" style={{ color: ACCENT }}>
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
                I studied existing emergency response workflows, mission dashboards, and
                real-time mapping tools to understand how the market was handling this problem.
              </p>
            </ScrollReveal>

            <div className="mb-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/rapidsos.webp"
                alt="Competitor landscape analysis"
                style={{ width: "100%", height: "auto", borderRadius: "12px" }}
              />
            </div>

            <ScrollReveal delay={0.1}>
              <p className="text-[#13181B] text-lg font-semibold leading-relaxed max-w-3xl mb-16">
                Most systems fell into one of two camps: communication-focused tools that lacked
                data visualization, or data-heavy dashboards that fell apart under the clarity
                demands of a real emergency. That gap shaped the entire direction of Relay.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "User Needs",
                    body: "Teams need a clear, real-time view of their mission that shows current conditions, team locations, and next actions without slowing response time.",
                  },
                  {
                    title: "Pain Points",
                    body: "Teams often work with scattered tools where critical updates are missed, emergency escalation is delayed, and awareness breaks down in the field.",
                  },
                  {
                    title: "Behaviors",
                    body: "When systems feel slow or unclear, teams rely on radios, memory, or assumptions — leading to missed updates and delayed decisions.",
                  },
                  {
                    title: "Market Insights",
                    body: "Most mission tools focus on communication or data visualization, but few combine both in an interface designed for high-stress situations.",
                  },
                ].map((card, i) => (
                  <ScrollReveal key={card.title} delay={i * 0.1}>
                    <div className="bg-white rounded-2xl border border-[#DDD8D1] p-6 h-full">
                      <h4 className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>{card.title}</h4>
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

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                Before starting in Figma, I defined what Relay needed to do to actually work
                in the field.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Keep critical information visible at all times — no hunting required",
                  "Support fast decision-making under stress through clear visual hierarchy",
                  "Centralize mission data — locations, hazards, weather, objectives — in one shared view",
                  "Make emergency actions impossible to miss, regardless of screen state",
                ].map((goal, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#DDD8D1] p-6">
                    <span className="text-xs font-semibold mb-3 block" style={{ color: ACCENT }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[#13181B] text-sm font-medium leading-relaxed">{goal}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 05 — EARLY EXPLORATIONS & WHAT I REJECTED ── */}
        <section id="explorations" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>05 — Early Explorations &amp; What I Rejected</SectionLabel>
            </ScrollReveal>

            <div className="max-w-3xl space-y-7 mb-16">
              <ScrollReveal delay={0.1}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  My earliest concepts explored wire mesh maps and 3D rendered mission zones.
                  They looked distinctive, but I cut them quickly for a practical reason: in a
                  real deployment, you&apos;re not going to have a custom 3D mesh of every
                  mission area. A satellite imagery layer — pulled from something like the Google
                  Maps API — is what field teams would actually have access to. Designing around
                  an unrealistic asset would have made Relay look good in a portfolio and fail in
                  the field. Satellite imagery was the only credible choice.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                  I also explored dense, data-heavy dashboard layouts early on. They felt
                  overwhelming — too much competing for attention at once. I shifted toward a
                  hierarchy-first approach: the map as the primary focus, with supporting panels
                  for hazards, weather, objectives, and logs arranged around it.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {EXPLORATION_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 06 — KEY DESIGN DECISIONS ── */}
        <section id="key-decisions" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Key Design Decisions</SectionLabel>
            </ScrollReveal>

            <div className="space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="bg-white rounded-2xl border border-[#DDD8D1] p-8 md:p-10">
                  <h3 className="text-xl md:text-2xl font-bold text-[#13181B] mb-6">
                    A Key Interaction Decision
                  </h3>
                  <p className="text-[#2D3436] text-lg leading-relaxed font-light">
                    One of the most important decisions I made on this project wasn&apos;t visual
                    — it was about where controls live on the screen. Through research into tablet
                    ergonomics and field device usage, I found that first responders in the field
                    are most likely using a tablet. When someone is holding a tablet with both
                    hands, their thumbs naturally rest near the edges of the screen — not the
                    bottom center. Placing key dashboard controls along the sides rather than the
                    bottom means faster access with less hand movement, which matters enormously
                    when seconds count. It also kept the bottom of the interface clear — because
                    in a mission context, the map needs to remain the primary focus at all times.
                    This is the kind of decision that&apos;s invisible when it works — but would
                    have been a real usability failure if I&apos;d ignored it.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="bg-[#13181B] rounded-2xl p-8 md:p-10">
                  <h3 className="text-xl md:text-2xl font-bold text-[#F4F4F5] mb-6">
                    The Emergency Alert Button
                  </h3>
                  <p className="text-[#F4F4F5]/75 text-lg leading-relaxed font-light">
                    The feature I&apos;m most deliberate about in Relay is the emergency alert
                    button — and deliberately keeping it visible at all times, regardless of
                    what else is on screen. In a real first-response scenario, if something goes
                    wrong, a team member needs to find that button instantly. Hiding it behind a
                    menu or tucking it away to keep the UI looking clean would be the wrong call.
                    Clarity of that button&apos;s location isn&apos;t a nice-to-have — it&apos;s
                    the difference between a tool that works in a crisis and one that fails at the
                    worst moment. This is a case where &ldquo;clean UI&rdquo; has to take a back
                    seat to functional priority. The button stays prominent. Always.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 07 — FINAL SOLUTION ── */}
        <section id="final-solution" className="px-6 py-20 md:py-28 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Final Solution</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl mb-16">
                Relay provides a shared operational view that helps field teams stay aligned in
                real time across unstable conditions.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-4 mb-16">
                {[
                  {
                    title: "Live Map",
                    body: "Satellite imagery showing real-time team locations, mission zones, and active hazards. The primary focus of the entire interface, kept uncluttered at all times.",
                  },
                  {
                    title: "Side Panels",
                    body: "Key dashboard information positioned along the sides for thumb-accessible control on tablet devices.",
                  },
                  {
                    title: "Emergency Alert",
                    body: "Always visible, always accessible. No navigation required to reach it, no matter what state the interface is in.",
                  },
                  {
                    title: "Mission Log",
                    body: "A shared, real-time record of updates, decisions, and communications keeping command staff and field units aligned.",
                  },
                ].map((card, i) => (
                  <ScrollReveal key={card.title} delay={i * 0.1}>
                    <div className="bg-white rounded-2xl border border-[#DDD8D1] p-6 h-full">
                      <h4 className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>{card.title}</h4>
                      <p className="text-[#13181B] text-sm font-medium leading-relaxed">{card.body}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <video
                src="https://framerusercontent.com/assets/TnnCTxhtSc3f1if5XjqneZ7r1VY.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", borderRadius: "12px", display: "block", marginBottom: "24px" }}
              />
            </ScrollReveal>

            <div className="space-y-6">
              {FINAL_IMAGES.map((img) => (
                <CaseImage key={img.src} src={img.src} alt={img.alt} />
              ))}
            </div>
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
                Relay achieves its core objective: giving field teams a clear, shared operational
                picture under conditions where clarity is hardest to maintain. The hierarchy-first
                layout, satellite-based mapping, and always-visible emergency action reduce the
                cognitive load on users so they can focus on the mission rather than the tool.
                Feedback from class presentation sessions confirmed that the dashboard concept
                was compelling and the visual approach — dark, high-contrast, information-dense
                — felt appropriate for the environment it was designed for.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-[#13181B] rounded-2xl p-8 md:p-10 mb-16">
                <h3 className="text-xl md:text-2xl font-bold text-[#F4F4F5] mb-6">
                  What I Learned
                </h3>
                <p className="text-[#F4F4F5]/75 text-lg leading-relaxed font-light">
                  Designing for extreme contexts taught me that the rules of good UX don&apos;t
                  change under pressure — they become more consequential. Hierarchy, speed, and
                  trust matter more than feature depth or visual novelty. Every decision I made
                  on Relay had a &ldquo;what happens if someone gets this wrong in the
                  field?&rdquo; layer attached to it. I also learned to make practical calls over
                  impressive ones. The wire mesh maps looked better in early mockups. Satellite
                  imagery is what would actually work. Choosing the realistic option made Relay a
                  stronger, more credible product — and that&apos;s a principle I&apos;ll carry
                  into every project.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-bold text-[#13181B] mb-6">
                Future Improvements
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-[#2D3436] text-lg leading-relaxed font-light max-w-3xl">
                If I were to develop Relay further, the priority would be field testing with
                real response teams, improved offline behavior for no-signal environments, and
                deeper integration with external data sources like satellite systems and weather
                APIs.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── BOTTOM NAVIGATION ── */}
        <section className="px-6 py-12 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a
              href="/univo"
              className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Univo
            </a>
            <a
              href="/homify"
              className="group flex items-center gap-2 text-sm font-semibold text-[#13181B] hover:text-[#E53935] transition-colors"
            >
              Homify
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
