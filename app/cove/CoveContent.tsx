"use client";

import React from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";

const COVE_SECTIONS = [
  { id: "brief",         label: "Brief" },
  { id: "problem",       label: "Problem" },
  { id: "design-system", label: "Design System" },
  { id: "product",       label: "Product" },
  { id: "intelligence",  label: "Intelligence" },
  { id: "reflection",    label: "Reflection" },
];

const ACCENT = "#4F46E5";       // brand / primary-600
const ACCENT_SOFT = "#A5B4FC";  // primary-300, accent on dark surfaces
const DARK = "#1E1B4B";         // primary-950
const MONO = "var(--font-geist-mono), ui-monospace, monospace";
const SANS = "var(--font-geist-sans), ui-sans-serif, sans-serif";

function AutoplayVideo({ src }: { src: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      style={{ width: "100%", borderRadius: "4px", display: "block" }}
    />
  );
}

function Placeholder({
  label,
  ratio = "16 / 9",
  dark = false,
}: {
  label: string;
  ratio?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        aspectRatio: ratio,
        width: "100%",
        borderRadius: "4px",
        border: `1px dashed ${dark ? "rgba(165,180,252,0.45)" : "rgba(79,70,229,0.32)"}`,
        background: dark ? DARK : "rgba(79,70,229,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: dark ? ACCENT_SOFT : ACCENT,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const META_CELLS: { label: string; values: string[] }[] = [
  { label: "Role", values: ["Founding Product Designer"] },
  { label: "Duration", values: ["May 2026 – Present", "In Development"] },
  {
    label: "Scope",
    values: [
      "0 to 1 End-to-end",
      "Claude Code, Next.js, Tailwind",
    ],
  },
  { label: "Team", values: ["Solo designer", "1 founder"] },
];

const PROBLEM_CARDS = [
  "Jobs live in text threads",
  "Scheduling is manual and error-prone",
  "No visibility into revenue or patterns",
  "Client history is scattered or nonexistent",
];

// ── Design tokens ──────────────────────────────────────────────
const BRAND_RAMP = [
  { step: "50", hex: "#EEF2FF" },
  { step: "100", hex: "#E0E7FF" },
  { step: "200", hex: "#C7D2FE" },
  { step: "300", hex: "#A5B4FC" },
  { step: "400", hex: "#818CF8" },
  { step: "500", hex: "#6366F1" },
  { step: "600", hex: "#4F46E5" },
  { step: "700", hex: "#4338CA" },
  { step: "800", hex: "#3730A3" },
  { step: "900", hex: "#312E81" },
  { step: "950", hex: "#1E1B4B" },
];

const NEUTRAL_RAMP = [
  { step: "50", hex: "#FAFAFA" },
  { step: "100", hex: "#F4F4F5" },
  { step: "200", hex: "#E4E4E7" },
  { step: "300", hex: "#D4D4D8" },
  { step: "400", hex: "#A1A1AA" },
  { step: "500", hex: "#71717A" },
  { step: "600", hex: "#52525B" },
  { step: "700", hex: "#3F3F46" },
  { step: "800", hex: "#27272A" },
  { step: "900", hex: "#18181B" },
  { step: "950", hex: "#09090B" },
];

const SEMANTIC = [
  { name: "Success", base: "#16A34A", light: "#DCFCE7" },
  { name: "Warning", base: "#F59E0B", light: "#FEF3C7" },
  { name: "Error", base: "#EF4444", light: "#FEE2E2" },
  { name: "Info", base: "#0EA5E9", light: "#E0F2FE" },
];

const TYPE_SCALE = [
  { label: "5xl", px: 48 },
  { label: "3xl", px: 30 },
  { label: "xl", px: 20 },
  { label: "base", px: 16 },
  { label: "xs", px: 12 },
];

const SPACING_SCALE = [
  { label: "1", px: 4 },
  { label: "2", px: 8 },
  { label: "4", px: 16 },
  { label: "6", px: 24 },
  { label: "12", px: 48 },
  { label: "24", px: 96 },
];

const RADIUS_SCALE = [
  { label: "sm", px: 4 },
  { label: "base", px: 8 },
  { label: "lg", px: 10 },
  { label: "xl", px: 12 },
  { label: "2xl", px: 16 },
  { label: "3xl", px: 24 },
];

const SHADOWS = [
  { label: "xs", css: "0 1px 2px rgba(16,12,40,0.06)" },
  { label: "md", css: "0 4px 8px -2px rgba(16,12,40,0.10), 0 2px 4px -2px rgba(16,12,40,0.06)" },
  { label: "xl", css: "0 20px 25px -5px rgba(16,12,40,0.14), 0 8px 10px -6px rgba(16,12,40,0.08)" },
];

function TokenGroup({
  label,
  caption,
  first = false,
  children,
}: {
  label: string;
  caption?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        paddingTop: first ? 0 : 32,
        marginTop: first ? 0 : 32,
        borderTop: first ? "none" : "1px solid #F1F0ED",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF" }}>{label}</p>
        {caption && <p style={{ fontSize: 11, color: "#C4C4C4", fontFamily: MONO }}>{caption}</p>}
      </div>
      {children}
    </div>
  );
}

function Ramp({ swatches, highlight }: { swatches: { step: string; hex: string }[]; highlight?: string }) {
  return (
    <>
      {/* Flex-shrinking 11 swatches into a fixed-width mobile screen crushes
          them down to a sliver too thin to read as a color or a label — a
          horizontal scroll with a floor width keeps every swatch legible
          instead. Desktop still lays out as one full-width row. */}
      <div className="ramp-row">
        {swatches.map((s) => {
          const active = s.step === highlight;
          return (
            <div key={s.step} className="ramp-swatch">
              <div
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: s.hex,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${s.hex}` : "none",
                }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: active ? "#13181B" : "#9CA3AF",
                  fontWeight: active ? 700 : 500,
                  fontFamily: MONO,
                  textAlign: "center",
                  marginTop: 9,
                }}
              >
                {s.step}
              </p>
            </div>
          );
        })}
      </div>
      <style>{`
        .ramp-row { display: flex; gap: 6px; }
        .ramp-swatch { flex: 1; min-width: 0; }
        @media (max-width: 700px) {
          .ramp-row { overflow-x: auto; scrollbar-width: none; }
          .ramp-row::-webkit-scrollbar { display: none; }
          .ramp-swatch { flex: 0 0 34px; }
        }
      `}</style>
    </>
  );
}

const PRODUCT_SUBSECTIONS: { title: string; placeholder: string; video?: string; body: string }[] = [
  {
    title: "Dashboard",
    placeholder: "DASHBOARD PLACEHOLDER",
    video: "/dashboard-demo.mp4",
    body: "The dashboard leads with four YTD stat cards so the most important numbers are visible immediately. The revenue chart sits below rather than above the stats because context matters more than the chart itself. Recent activity on the right keeps the owner aware of what is happening without requiring navigation.",
  },
  {
    title: "Creating a Booking",
    placeholder: "NEW BOOKING PLACEHOLDER",
    video: "/creating-a-booking-demo.mp4",
    body: "Creating a booking is a four-step guided flow in a slide-over panel: choose the client, pick the service, set the schedule, and confirm. A progress bar tracks each step. Client details like address and contact pull straight from the profile so the owner never re-enters the same information. The schedule step shows an inline calendar with flagged days, 30-minute time slots, and employee assignment. On confirm, a success animation plays and the new booking appears instantly on the calendar, the bookings list, and the dashboard.",
  },
  {
    title: "Bookings and Calendar",
    placeholder: "BOOKINGS CALENDAR PLACEHOLDER",
    video: "/bookings-and-calendar-demo.mp4",
    body: "We tested a list view first. Owners kept asking where their Tuesday was. Calendar became the default. Job pills are color coded by status so the owner can scan the week at a glance. Clicking a day opens a side panel rather than navigating away, preserving the calendar context.",
  },
  {
    title: "Job Detail and Status Timeline",
    placeholder: "JOB DETAIL PLACEHOLDER",
    video: "/Job-Detail-and-Status-Timeline-demo.mp4",
    body: "An earlier version buried the status timeline below the job details. Owners were missing it entirely. We moved it to the top. Each state has a timestamp and a one line description. Marking a job complete is the primary action because it is the most frequent interaction in the product.",
  },
  {
    title: "Client Profile",
    placeholder: "CLIENT PROFILE PLACEHOLDER",
    video: "/client-profile-demo.mp4",
    body: "Booking history is the first thing visible on a client profile because service businesses live on repeat customers. The re-engagement signal surfaces clients who have not booked recently so the owner does not have to go looking.",
  },
  {
    title: "Payments",
    placeholder: "PAYMENTS PLACEHOLDER",
    video: "/payments-demo.mp4",
    body: "Weekly view was chosen over monthly because service businesses get paid job by job and need to see patterns at that resolution. Overdue rows have a soft red tint so nothing slips through without the owner noticing.",
  },
  {
    title: "Phone",
    placeholder: "PHONE PLACEHOLDER",
    video: "/phone-demo.mp4",
    body: "The conversation interface mirrors a familiar messaging pattern because most of these owners communicate with clients over text. The business number is shared across employees so client conversations are never trapped on one person's phone.",
  },
];

const AI_SUBSECTIONS: { title: string; placeholder: string; video?: string; body: string }[] = [
  {
    title: "Payment Follow-ups",
    placeholder: "AI PAYMENT FOLLOWUP PLACEHOLDER",
    video: "/payment-followup-demo.mp4",
    body: "On the Payments page, opening the AI panel surfaces a revenue summary tailored to that screen. A month-over-month comparison of this month versus last, a list of overdue invoices each with a one-tap send reminder, and a forward projection of where the month will land if pending payments clear.",
  },
  {
    title: "Post-Job Communication",
    placeholder: "AI COMMUNICATION PLACEHOLDER",
    video: "/post-job-phone-demo.mp4",
    body: "When a job is marked complete a single card slides in with a pre-written follow up message ready to send. One tap sends it. We considered putting this in the phone page as a chip menu with multiple options. Owners did not want to choose. They wanted it done.",
  },
  {
    title: "Dashboard Insights",
    placeholder: "AI INSIGHTS PLACEHOLDER",
    video: "/dashboard-insights-demo.mp4",
    body: "The dashboard surfaces two or three proactive insights the owner would otherwise have to go looking for. We capped it at three cards maximum. More than three and owners stopped reading them entirely.",
  },
];


export default function CoveContent({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";

  const body = (
    <>
        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto py-6">
              <AutoplayVideo src="/creating-a-booking-demo.mp4" />
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto mt-16 md:mt-20 mb-0">
            <ScrollReveal delay={0.05}>
              <h1 className="text-[clamp(40px,7vw,72px)] font-medium tracking-[-0.02em] leading-[1.1] text-[#13181B] mb-5">
                Cove
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-lg font-medium max-w-2xl" style={{ color: "#8A8F98" }}>
                A field service CRM built for the businesses that keep everything running.
              </p>
            </ScrollReveal>
          </div>

          {/* ── METADATA BLOCK ── */}
          <div className="max-w-5xl mx-auto mt-14 md:mt-16 mb-8 md:mb-14">
            <ScrollReveal delay={0.15}>
              <div
                className="grid grid-cols-2 md:grid-cols-4"
                style={{ columnGap: "32px", rowGap: "44px" }}
              >
                {META_CELLS.map(({ label, values }) => (
                  <div key={label}>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#9CA3AF",
                        marginBottom: "14px",
                      }}
                    >
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

        {/* 01. THE BRIEF */}
        <section id="brief" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>01. The Brief</SectionLabel></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px" }}>
                A friend came to me with a problem he kept seeing in service businesses. Owners were
                running their entire operation through text threads, spreadsheets, and gut instinct.
                He wanted to build a CRM designed specifically for that world. I came on as the
                founding designer and built the product from zero, owning everything from the design
                system through a fully functional interactive prototype.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* 02. THE PROBLEM */}
        <section id="problem" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>02. The Problem</SectionLabel></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "56px" }}>
                Small service businesses have no good software built for them. Cleaning companies,
                auto detailers, pest control operators, anyone who travels to their clients. Enterprise
                CRMs are too complex. Generic tools do not account for routing, employee dispatch, or
                the job-by-job payment model these businesses run on. The owner is usually also the
                scheduler, the salesperson, and the technician. They need something that thinks like
                they do.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROBLEM_CARDS.map((card, i) => (
                <ScrollReveal key={card} delay={0.1 + i * 0.05}>
                  <div
                    style={{
                      background: "#FAFAFA",
                      borderRadius: "4px",
                      padding: "22px 20px",
                      height: "100%",
                    }}
                  >
                    <p style={{ fontSize: "12px", fontWeight: 300, color: "#A8ABB2", margin: "0 0 12px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p style={{ fontSize: "15px", fontWeight: 400, color: "#13181B", lineHeight: 1.5 }}>
                      {card}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 03. DESIGN SYSTEM */}
        <section id="design-system" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>03. Design System</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
                Built in Code First
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "48px" }}>
                Rather than designing in Figma and handing off to a developer, I built the design system
                directly in code using Claude Code. Every design decision was immediately testable in
                the real product rather than approximated in a mockup. A token file defines every color,
                spacing value, border radius, and shadow level as CSS variables consumed throughout the
                app. Components were built on top of Shadcn/UI with Tailwind utilities mapped to the
                token system.
              </p>
            </ScrollReveal>

            {/* ── Token showcase graphic ── */}
            <ScrollReveal delay={0.1}>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "4px",
                  padding: "clamp(24px, 4vw, 40px)",
                  boxShadow: "0 1px 2px rgba(16,12,40,0.04)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#13181B", letterSpacing: "-0.01em" }}>
                    Cove Design Tokens
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: MONO }}>tokens.css</p>
                </div>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>
                  Indigo brand · warm neutrals · Geist · 4px base
                </p>

                <div style={{ borderTop: "1px solid #F1F0ED", marginTop: 24 }} />

                <TokenGroup label="Brand · indigo" caption="--color-primary-*" first>
                  <Ramp swatches={BRAND_RAMP} highlight="600" />
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 14 }}>
                    <span style={{ color: ACCENT, fontWeight: 600, fontFamily: MONO }}>600</span> is the brand default. Logo, primary actions, focus ring.
                  </p>
                </TokenGroup>

                <TokenGroup label="Neutral · warm gray" caption="--color-neutral-*">
                  <Ramp swatches={NEUTRAL_RAMP} />
                </TokenGroup>

                <TokenGroup label="Semantic" caption="success · warning · error · info">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {SEMANTIC.map((s) => (
                      <div key={s.name}>
                        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                          <div style={{ flex: 1, height: 40, background: s.light }} />
                          <div style={{ flex: 1, height: 40, background: s.base }} />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#13181B", marginTop: 10 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", fontFamily: MONO }}>{s.base}</p>
                      </div>
                    ))}
                  </div>
                </TokenGroup>

                <TokenGroup label="Type scale" caption="Geist Sans">
                  <div>
                    {TYPE_SCALE.map((t, i) => (
                      <div
                        key={t.label}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 20,
                          paddingBottom: i < TYPE_SCALE.length - 1 ? 16 : 0,
                          marginBottom: i < TYPE_SCALE.length - 1 ? 16 : 0,
                          borderBottom: i < TYPE_SCALE.length - 1 ? "1px solid #F1F0ED" : "none",
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: MONO, width: 48, flexShrink: 0 }}>
                          {t.label}
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: `${t.px}px`, fontWeight: 600, color: "#13181B", lineHeight: 1.1, letterSpacing: "-0.02em", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Cove
                        </span>
                        <span style={{ fontSize: 12, color: "#C4C4C4", fontFamily: MONO, flexShrink: 0 }}>{t.px}px</span>
                      </div>
                    ))}
                  </div>
                </TokenGroup>

                <TokenGroup label="Spacing" caption="4px base">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {SPACING_SCALE.map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: MONO, width: 28, flexShrink: 0 }}>{s.label}</span>
                        <div style={{ height: 14, width: `${s.px}px`, background: ACCENT, borderRadius: 4, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#C4C4C4", fontFamily: MONO }}>{s.px}px</span>
                      </div>
                    ))}
                  </div>
                </TokenGroup>

                <TokenGroup label="Radius" caption="xs → 3xl">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                    {RADIUS_SCALE.map((r) => (
                      <div key={r.label} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            background: "#EEF2FF",
                            border: `1.5px solid ${ACCENT}`,
                            borderTopLeftRadius: r.px,
                            borderTopRightRadius: r.px,
                          }}
                        />
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: MONO, marginTop: 10 }}>{r.label}</p>
                        <p style={{ fontSize: 10, color: "#C4C4C4", fontFamily: MONO }}>{r.px}px</p>
                      </div>
                    ))}
                  </div>
                </TokenGroup>

                <TokenGroup label="Elevation" caption="--shadow-*">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
                    {SHADOWS.map((sh) => (
                      <div key={sh.label} style={{ textAlign: "center" }}>
                        <div style={{ width: 72, height: 56, background: "#fff", border: "1px solid #F1F0ED", borderRadius: 10, boxShadow: sh.css }} />
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: MONO, marginTop: 14 }}>{sh.label}</p>
                      </div>
                    ))}
                  </div>
                </TokenGroup>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 04. THE PRODUCT */}
        <section id="product" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>04. Core Product</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
                The Product
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "72px" }}>
                Cove covers the full operational surface of a service business: scheduling, client
                management, payments, team communication, and business intelligence. Every screen was
                designed around one principle. The owner should be able to understand the state of
                their business in under 10 seconds.
              </p>
            </ScrollReveal>

            <div className="space-y-24">
              {PRODUCT_SUBSECTIONS.map((sub, i) => (
                <ScrollReveal key={sub.title} delay={0.05}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "8px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h4 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px" }}>
                      {sub.title}
                    </h4>
                    <div style={{ marginBottom: "24px" }}>
                      {sub.video
                        ? <AutoplayVideo src={sub.video} />
                        : <Placeholder label={sub.placeholder} />}
                    </div>
                    <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px" }}>
                      {sub.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 05. AI INTEGRATION */}
        <section id="intelligence" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>05. AI Integration</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
                Intelligence Built In
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "72px" }}>
                The original scope had AI everywhere, on every page and every action. We cut it down
                to three moments where it saves real time and stays invisible everywhere else. Every
                feature that did not survive that cut was removed because it added decisions for the
                owner rather than removing them.
              </p>
            </ScrollReveal>

            <div className="space-y-24">
              {AI_SUBSECTIONS.map((sub, i) => (
                <ScrollReveal key={sub.title} delay={0.05}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "8px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h4 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px" }}>
                      {sub.title}
                    </h4>
                    <div style={{ marginBottom: "24px" }}>
                      {sub.video
                        ? <AutoplayVideo src={sub.video} />
                        : <Placeholder label={sub.placeholder} />}
                    </div>
                    <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px" }}>
                      {sub.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>



        {/* 07. REFLECTION */}
        <section id="reflection" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal><SectionLabel>06. Reflection</SectionLabel></ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h3 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "24px", maxWidth: "680px" }}>
                What I Learned
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "28px" }}>
                Building Cove taught me that the hardest product decisions are not about features.
                They are about what to leave out. The original scope from the brief was enormous.
                Getting to a focused and coherent product meant constantly asking which screen matters
                most and which interaction does the most work. The AI integration was the sharpest
                version of that question. Every AI touchpoint in the final product survived because it
                removed a real decision for the owner, not because it was technically possible.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl p-8 md:p-10" style={{ background: DARK }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: ACCENT_SOFT, marginBottom: "16px" }}>
                  What I would do next
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.85, color: "rgba(244,244,245,0.78)", maxWidth: "600px" }}>
                  A mobile companion app for employees in the field, a client facing booking portal,
                  and a live Supabase backend replacing the seed data.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <CaseStudyBottomNav
          isOverlay={isOverlay}
          onClose={onClose}
          nextHref="/writingprocess"
          nextLabel="Writing Process Redesign"
        />
    </>
  );

  if (isOverlay) return <div className="cs-body">{body}</div>;

  return (
    <>
      <Nav sections={COVE_SECTIONS} accentColor={ACCENT} />
      <CaseStudyNav sections={COVE_SECTIONS} accentColor={ACCENT} card />
      <main className="pt-[72px] cs-body">{body}</main>
      <Footer />
    </>
  );
}
