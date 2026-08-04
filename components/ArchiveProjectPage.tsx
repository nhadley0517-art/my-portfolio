"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import type { ArchiveProjectData } from "@/lib/archiveProjectsData";

/** Only ever rendered when project.hero is set — projects without real
 *  media just skip the hero visual entirely rather than showing a placeholder. */
function HeroVisual({ project }: { project: ArchiveProjectData & { hero: NonNullable<ArchiveProjectData["hero"]> } }) {
  if (project.hero.type === "video") {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{ width: "100%", borderRadius: "4px", display: "block" }}
      >
        <source src={project.hero.src} />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.hero.src}
      alt={project.hero.alt ?? project.title}
      style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
    />
  );
}

interface ArchiveProjectPageProps {
  project: ArchiveProjectData;
  /** "page" (default): full standalone page with Nav/Footer. "overlay": lean
   *  content only, meant to sit inside a BentoOverlay panel. */
  variant?: "page" | "overlay";
  /** Required when variant="overlay" — closes the bento overlay instead of navigating. */
  onClose?: () => void;
}

export default function ArchiveProjectPage({ project, variant = "page", onClose }: ArchiveProjectPageProps) {
  const isOverlay = variant === "overlay";
  const detailRows: { label: string; value: string }[] = [];
  if (project.details.role) detailRows.push({ label: "Role", value: project.details.role });
  if (project.details.whatIDid) detailRows.push({ label: "What I Did", value: project.details.whatIDid });
  if (project.details.team) detailRows.push({ label: "Team", value: project.details.team });
  if (project.details.timeline) detailRows.push({ label: "Timeline", value: project.details.timeline });
  if (project.details.builtWith) detailRows.push({ label: "Built With", value: project.details.builtWith });
  if (project.details.status) detailRows.push({ label: "Status", value: project.details.status });

  const content = (
    <>
        {/* Mobile only — the sole exit was previously the "Back to the
            archive" link at the very bottom, which on a long project meant
            scrolling all the way down just to leave. Sticky so it stays
            reachable from wherever you've scrolled to. */}
        <div className="archive-back-row">
          {isOverlay ? (
            <button type="button" onClick={onClose} className="archive-back-arrow" aria-label="Back to the archive">←</button>
          ) : (
            <Link href="/#archive" className="archive-back-arrow" aria-label="Back to the archive">←</Link>
          )}
        </div>

        {/* ── Hero ── */}
        <section className={isOverlay ? "pt-10 md:pt-12" : "pt-14 md:pt-20"}>
          <div className="max-w-5xl mx-auto mb-10">
            <ScrollReveal>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9CA3AF",
                  marginBottom: "16px",
                }}
              >
                Archive
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="text-[clamp(34px,5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.08] text-[#0B0F12] mb-5">
                {project.title}
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-lg font-medium max-w-2xl" style={{ color: "#8A8F98" }}>
                {project.oneLiner}
              </p>
            </ScrollReveal>
          </div>

          {project.hero && (
            <ScrollReveal delay={0.1}>
              <div className="max-w-5xl mx-auto">
                <HeroVisual project={{ ...project, hero: project.hero }} />
              </div>
            </ScrollReveal>
          )}
        </section>

        {/* ── Overview ── */}
        <section className="px-6 py-16 md:py-20">
          <div className="max-w-5xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {project.overview.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <p style={{ fontSize: "15px", color: "#8A8F98", lineHeight: 1.85, maxWidth: "640px" }}>{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ── Screens: before/after + why, one block per screen ── */}
        {project.screens && project.screens.length > 0 && (
          <section className="px-6 pb-16 md:pb-20">
            <div className="max-w-5xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
              {project.screens.map((screen, i) => (
                <ScrollReveal key={screen.label} delay={i * 0.05}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "8px" }}>
                      {screen.label}
                    </p>
                    <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0B0F12", letterSpacing: "-0.01em", marginBottom: "20px" }}>
                      {screen.title}
                    </h3>

                    {(screen.beforeSrc || screen.afterSrc) && (
                      <div style={{ display: "flex", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {screen.beforeSrc && (
                          <div style={{ flex: "0 0 auto" }}>
                            <p className="screen-badge">Before</p>
                            <div className="screen-phone">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={screen.beforeSrc} alt={`${screen.title} - before`} />
                            </div>
                          </div>
                        )}
                        {screen.afterSrc && (
                          <div style={{ flex: "0 0 auto" }}>
                            <p className="screen-badge">After</p>
                            <div className="screen-phone">
                              {/* Rendered at the mockup's true 393x852 viewport so its own
                                  layout/type scale correctly, then shrunk to fit the phone
                                  frame via transform — matching /real's own phone previews. */}
                              <iframe src={screen.afterSrc} title={`${screen.title} - after`} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ background: "#F7F7F5", borderRadius: "4px", padding: "18px 20px", marginBottom: "20px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "8px" }}>
                        The problem
                      </p>
                      <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.65, margin: 0 }}>{screen.problem}</p>
                    </div>

                    <ul style={{ display: "flex", flexDirection: "column", gap: "14px", padding: 0, margin: 0, listStyle: "none" }}>
                      {screen.changes.map((c, ci) => (
                        <li key={c.title} style={{ display: "flex", gap: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", flexShrink: 0, width: "18px" }}>{ci + 1}</span>
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B0F12", margin: "0 0 3px" }}>{c.title}</p>
                            <p style={{ fontSize: "13.5px", color: "#8A8F98", lineHeight: 1.6, margin: 0 }}>{c.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Project details ── */}
        {detailRows.length > 0 && (
          <section className="px-6 pb-16 md:pb-20">
            <ScrollReveal>
              <div
                className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4"
                style={{ columnGap: "32px", rowGap: "32px" }}
              >
                {detailRows.map(({ label, value }) => (
                  <div key={label}>
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        marginBottom: "10px",
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#13181B", lineHeight: 1.5 }}>{value}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── What I Made ── */}
        <section className="px-6 pb-16 md:pb-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9CA3AF",
                  marginBottom: "20px",
                }}
              >
                {project.whatIMadeLabel ?? "What I Made"}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "640px" }}>
                {project.whatIMade.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        marginTop: "8px",
                        flexShrink: 0,
                        background: "#111827",
                      }}
                    />
                    <span style={{ fontSize: "15px", color: "#8A8F98", lineHeight: 1.7 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Final screens (only rendered when we have real production shots) ── */}
        {project.finalImages && project.finalImages.length > 0 && (
          <section className="px-6 pb-16 md:pb-20">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    marginBottom: "20px",
                  }}
                >
                  Final Screens
                </p>
              </ScrollReveal>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {project.finalImages.map((img, i) => (
                  <ScrollReveal key={img.src} delay={i * 0.05}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt ?? project.title}
                      style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Live product CTA + closing note (omitted cleanly when there's nothing to show) ── */}
        {(project.live || project.closingNote) && (
          <section className="px-6 pb-16 md:pb-20">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "flex-start" }}>
                {project.live && (
                  <a
                    href={project.live.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-btn"
                    style={{ background: "#111827" }}
                  >
                    {project.live.label} <span aria-hidden>→</span>
                  </a>
                )}
                {project.closingNote && (
                  <p style={{ fontSize: "13px", color: "#B0B4BB", lineHeight: 1.7, maxWidth: "560px" }}>
                    {project.closingNote}
                  </p>
                )}
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── Bottom nav ── */}
        <section className="px-6 py-12 border-t border-[#DDD8D1]">
          <div className="max-w-5xl mx-auto">
            {isOverlay ? (
              <button
                type="button"
                onClick={onClose}
                className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
                style={{ width: "fit-content", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                Back to the archive
              </button>
            ) : (
              <Link
                href="/#archive"
                className="group flex items-center gap-2 text-sm font-semibold text-[#7D8A93] hover:text-[#13181B] transition-colors"
                style={{ width: "fit-content" }}
              >
                <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                Back to the archive
              </Link>
            )}
          </div>
        </section>

      <style>{`
        .archive-back-row { display: none; }
        @media (max-width: 700px) {
          .archive-back-row {
            display: block;
            position: sticky;
            top: 12px;
            z-index: 40;
            padding: 12px 0 0 24px;
          }
          .archive-back-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            margin: -8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.9);
            color: #A8ABB2;
            font-size: 17px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: color 0.15s ease;
          }
          .archive-back-arrow:hover { color: #6B7280; }
        }
        .screen-badge {
          font-size: 11px; font-weight: 600; color: #9CA3AF; margin: 0 0 8px;
        }
        .screen-phone {
          position: relative;
          width: 200px;
          height: 434px;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 10px 30px -8px rgba(0,0,0,0.25);
        }
        .screen-phone img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        /* The "after" mockups are real pages built at a 393x852 viewport
           (see /real/css/tokens.css --screen-w/--screen-h). Rendering the
           iframe at that native size and scaling it down keeps every element
           inside it in correct proportion, instead of reflowing the page to
           a 200px viewport (which is what made everything look oversized). */
        .screen-phone iframe {
          width: 393px;
          height: 852px;
          border: none;
          display: block;
          transform: scale(0.5089);
          transform-origin: top left;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 100px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(0,0,0,0.35);
        }
        .cta-btn span {
          transition: transform 0.2s ease;
        }
        .cta-btn:hover span {
          transform: translateX(3px);
        }
      `}</style>
    </>
  );

  if (isOverlay) {
    return <div className="cs-body">{content}</div>;
  }

  return (
    <>
      <Nav />
      <main className="pt-[72px] cs-body">{content}</main>
      <Footer />
    </>
  );
}
