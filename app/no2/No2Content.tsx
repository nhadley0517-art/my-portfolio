"use client";

import React from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyNav from "@/components/CaseStudyNav";
import { CaseStudyBottomNav, SectionLabel, type CaseStudyContentProps } from "@/components/CaseStudyShell";

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

const ACCENT = "#7EB77F";
const DARK = "#1C1C1E";

function AutoplayVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { video.play().catch(() => {}); }
        else { video.pause(); }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <video ref={videoRef} src={src} loop muted playsInline style={style} />;
}

function Callout({ label, heading, body, delay = 0 }: { label: string; heading: string; body: string; delay?: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div style={{ paddingBottom: "80px" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginBottom: "18px" }}>{label}</p>
        <p style={{ fontSize: "clamp(19px, 2.1vw, 23px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.38, marginBottom: "20px", maxWidth: "640px" }}>{heading}</p>
        <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.85, maxWidth: "600px" }}>{body}</p>
      </div>
    </ScrollReveal>
  );
}

export default function No2Content({ variant = "page", onClose }: CaseStudyContentProps) {
  const isOverlay = variant === "overlay";
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const body = (
    <>
        <style>{`
          @media (max-width: 768px) {
            /* hero iframe swap */
            .hero-desktop { display: none; }
            .hero-mobile { display: block; }
            /* hero iframe */
            .n2-hero-iframe { height: 280px !important; }
            /* feature video wrapper */
            .n2-feat-vid { max-width: 100% !important; }
            /* first iterations side-by-side */
            .n2-iter-img { max-width: 100% !important; }
          }
          @media (min-width: 769px) {
            .hero-desktop { display: block; }
            .hero-mobile { display: none; }
          }
        `}</style>

        {/* ── HERO ── */}
        <section className="pt-14 md:pt-20">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto pb-10 md:pb-14">
              <iframe src="/no2-hero.html" scrolling="no" className="hero-desktop" style={{ width: "100%", height: "500px", border: "none", borderRadius: "4px" }} />
              <iframe src="/no2-thumb.html" scrolling="no" className="hero-mobile" style={{ width: "100%", height: "300px", border: "none", borderRadius: "4px" }} />
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto mb-12">
            <ScrollReveal>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "4px", background: "#fff", fontSize: "13px", fontWeight: 400, color: "#4B5563" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                Live on the App Store
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <h1 className="text-[clamp(40px,7vw,72px)] font-medium tracking-[-0.02em] leading-[1.1] text-[#13181B] mt-5 mb-5">
                No. 2
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="text-lg font-medium mb-8 max-w-2xl" style={{ color: "#8A8F98" }}>
                A gut health iOS app designed and built solo in two weeks. Live on the App Store.
              </p>
            </ScrollReveal>

          </div>

          {/* ── METADATA ── */}
          <div className="max-w-5xl mx-auto mt-2 md:mt-4 mb-8 md:mb-14">
            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ columnGap: "32px", rowGap: "44px" }}>
                {[
                  { label: "Role", values: ["Designer & Developer"] },
                  { label: "Duration", values: ["2026", "~2 weeks"] },
                  { label: "Scope", values: ["0 to 1 iOS app", "Built with Claude Code"] },
                  { label: "Team", values: ["Solo build"] },
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

        {/* ── 01 — THE PROJECT ── */}
        <section id="overview" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>01 — The Project</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px" }}>
                I built a gut health app from scratch in two weeks. Design, code, backend, brand. All me. No team, no handoffs. Just me, Claude Code, and a problem I thought was worth solving. It is now live on the App Store.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 02 — CONTEXT ── */}
        <section id="context" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>02 — Context</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "24px" }}>
                My own research on colorectal cancer in younger adults made it feel personal — gut issues have been part of my life for a while. The idea of a poop tracker had floated around before, mostly as a joke. But a close friend asked me one day why I hadn&apos;t just built it, and I didn&apos;t have a good answer. So I did. The timing was right too — Claude Code was becoming a real tool, and I wanted something in my portfolio I&apos;d taken from zero to shipped.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "64px" }}>
                Colorectal cancer is now the number 1 cause of cancer death in adults under 50 in the U.S. — up from 5th place. The symptoms show up years before a diagnosis. Most people ignore them because nobody told them it was worth paying attention to.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              {isMobile ? (
                <div style={{background:'#F8F7F4', borderRadius:'12px', padding:'24px', display:'flex', flexDirection:'column', gap:'16px'}}>
                  <div style={{background:'#1C1C1E', borderRadius:'16px', padding:'24px'}}>
                    <div style={{fontSize:'48px', fontWeight:'800', color:'#fff', lineHeight:1}}>#1</div>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginTop:'8px'}}>Cancer killer of adults under 50 in the U.S.</div>
                    <div style={{fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'8px'}}>American Cancer Society, 2026</div>
                  </div>
                  <div style={{background:'#7EB77F', borderRadius:'16px', padding:'24px'}}>
                    <div style={{fontSize:'48px', fontWeight:'800', color:'#fff', lineHeight:1}}>1 in 5</div>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.7)', marginTop:'8px'}}>Colorectal cancer diagnoses are now in adults under 55</div>
                    <div style={{fontSize:'10px', color:'rgba(255,255,255,0.4)', marginTop:'8px'}}>ACS / Yale Medicine</div>
                  </div>
                  <div style={{background:'#fff', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'24px'}}>
                    <div style={{fontSize:'48px', fontWeight:'800', color:'#E05252', lineHeight:1}}>2×</div>
                    <div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>More likely to develop CRC if born in the 1990s vs. 1950s</div>
                    <div style={{fontSize:'10px', color:'#C4C4C4', marginTop:'8px'}}>American College of Surgeons, 2024</div>
                  </div>
                  <div style={{background:'#1C1C1E', borderRadius:'16px', padding:'24px'}}>
                    <div style={{fontSize:'40px', fontWeight:'800', color:'#fff', lineHeight:1}}>15%</div>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginTop:'8px'}}>Increase in diagnoses among 18–50 year olds since 2004</div>
                    <div style={{fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'8px'}}>National Cancer Database</div>
                  </div>
                  <div style={{background:'#1C1C1E', borderRadius:'16px', padding:'24px'}}>
                    <div style={{fontSize:'40px', fontWeight:'800', color:'#fff', lineHeight:1}}>75%</div>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginTop:'8px'}}>Of CRC cases in under-50s are advanced stage at diagnosis</div>
                    <div style={{fontSize:'10px', color:'rgba(255,255,255,0.25)', marginTop:'8px'}}>Late detection = harder to treat</div>
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", overflowX: "hidden" }}>
                  <iframe src="/1-stats.html?v=2" scrolling="no" style={{width:'100%', border:'none', borderRadius:'12px', display:'block', height:'780px'}} />
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>

        {/* ── 03 — KEY INSIGHTS ── */}
        <section id="insights" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>03 — Key Insights</SectionLabel>
            </ScrollReveal>

            <Callout
              label="Insight 01"
              heading="Nobody tracks their gut health until something is already wrong."
              body="There is no habit around this. No baseline. People go years without thinking about it, and then something changes and they have nothing to compare it to. No. 2 is about building that baseline before you need it."
              delay={0.05}
            />
            <Callout
              label="Insight 02"
              heading="The apps that exist are either scary or useless."
              body="They split into two camps. Cold and clinical, like filling out a medical form. Or so soft and vague they had nothing useful to say. Nobody was making something you would actually want to open every day."
              delay={0.1}
            />
            <Callout
              label="Insight 03"
              heading="If it is not fast, people will not do it."
              body="Logging has to be frictionless or it just does not happen. Health tracking apps live and die by whether people actually do it every day. That meant the whole input flow had to be designed around speed first."
              delay={0.15}
            />

            <ScrollReveal>
              {isMobile ? (
                <div style={{background:'#F8F9FA', borderRadius:'12px', padding:'24px'}}>
                  <p style={{fontSize:'11px', fontWeight:'700', color:'#9CA3AF', marginBottom:'16px'}}>Competitor Landscape</p>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    {[
                      {name:'GI Monitor', desc:'Clinical-grade, doctor-facing, complex UI'},
                      {name:'MySymptoms', desc:'Detailed but overwhelming for everyday use'},
                      {name:'Healow', desc:'Healthcare portal, not consumer-friendly'},
                      {name:'Cara Care', desc:'IBS-focused, subscription heavy'},
                      {name:'Bowelle', desc:'Simple logging, no insights'},
                      {name:'Poop Log', desc:'Novelty app, no real health focus'},
                    ].map(c => (
                      <div key={c.name} style={{background:'#fff', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px'}}>
                        <div style={{fontWeight:'700', fontSize:'14px', color:'#1C1C1E'}}>{c.name}</div>
                        <div style={{fontSize:'13px', color:'#6B7280', marginTop:'4px'}}>{c.desc}</div>
                      </div>
                    ))}
                    <div style={{background:'#1C1C1E', borderRadius:'12px', padding:'16px'}}>
                      <div style={{fontWeight:'700', fontSize:'14px', color:'#7EB77F'}}>No. 2</div>
                      <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginTop:'4px'}}>Consumer-friendly, insight-driven, privacy-first</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", overflowX: "hidden" }}>
                  <iframe src="/2-competitor-landscape.html" scrolling="no" style={{width:'100%', border:'none', borderRadius:'12px', display:'block', height:'820px'}} />
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>

        {/* ── 04 — PROCESS ── */}
        <section id="process" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>04 — Process</SectionLabel>
            </ScrollReveal>

            <div className="space-y-20">
              <div>
                <ScrollReveal delay={0.1}>
                  <h3 style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", marginBottom: "24px", lineHeight: 1.3 }}>
                    I had never built a backend before. So I learned one.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "40px" }}>
                    Going into this I was a designer. I knew Figma. I did not know what row-level security was, what a Supabase migration was, or why an API key being exposed in a chat window was a problem. I used Supabase for the backend and spent a serious amount of time researching security standards before writing a single line. Input validation at the database level. Rate limiting on login attempts. No sensitive data in the app bundle. It was one of the harder parts of the project. But it made me a better product thinker because I now understand what I am actually asking engineers to build when I spec something out.
                  </p>
                </ScrollReveal>
              </div>

              <div>
                <ScrollReveal delay={0.1}>
                  <h3 style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", marginBottom: "24px", lineHeight: 1.3 }}>
                    I started with AI insights. Then I did the math.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "40px" }}>
                    The original plan was to run every log through an AI model. At $0.003 per call, once a day per user, that is $1.10 per user per year. At 10,000 users that is $11,000 a year before a single dollar of revenue. So I built a rule-based engine instead. Runs on the device, costs nothing. AI becomes a Phase 2 premium feature when there is actually money to pay for it.
                  </p>
                </ScrollReveal>
                <ScrollReveal>
                  {isMobile ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                      <div style={{background:'#1C1C1E', borderRadius:'16px', padding:'24px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                          <div style={{fontWeight:'700', fontSize:'15px', color:'rgba(255,255,255,0.5)'}}>AI Insight API</div>
                          <div style={{background:'rgba(224,82,82,0.15)', color:'#E05252', fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', letterSpacing:'0.1em'}}>REJECTED</div>
                        </div>
                        {['📱 User logs entry','☁️ API call — Claude Haiku','📡 Health data leaves device','💬 AI generates insight','💸 $0.003 per call · scales with users'].map((s,i) => (
                          <div key={i} style={{background: i===0 ? 'rgba(255,255,255,0.05)' : 'rgba(224,82,82,0.08)', border: i===0 ? 'none' : '1px solid rgba(224,82,82,0.15)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color: i===0 ? 'rgba(255,255,255,0.6)' : 'rgba(224,82,82,0.75)', marginBottom:'6px'}}>{s}</div>
                        ))}
                        <div style={{background:'rgba(224,82,82,0.07)', border:'1px solid rgba(224,82,82,0.15)', borderRadius:'14px', padding:'20px', marginTop:'8px', display:'flex', alignItems:'center', gap:'14px'}}>
                          <div style={{fontSize:'32px', fontWeight:'800', color:'#E05252'}}>$11k</div>
                          <div style={{fontSize:'12px', color:'rgba(255,255,255,0.35)', lineHeight:1.5}}>per year at 10k users<br/>before any revenue</div>
                        </div>
                      </div>
                      <div style={{background:'#1C1C1E', borderRadius:'16px', padding:'24px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                          <div style={{fontWeight:'700', fontSize:'15px', color:'#fff'}}>Rule-Based Engine</div>
                          <div style={{background:'rgba(126,183,127,0.2)', color:'#7EB77F', fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', letterSpacing:'0.1em'}}>CHOSEN</div>
                        </div>
                        {['📱 User logs entry','⚙️ Local rule engine processes log','🔒 Data never leaves the device','💡 Pattern insight generated','🚀 AI unlocked as Phase 2 premium'].map((s,i) => (
                          <div key={i} style={{background: i===0 ? 'rgba(255,255,255,0.05)' : i===4 ? 'rgba(126,183,127,0.15)' : 'rgba(126,183,127,0.08)', border: i===0 ? 'none' : i===4 ? '1px solid rgba(126,183,127,0.3)' : '1px solid rgba(126,183,127,0.15)', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color: i===0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.8)', marginBottom:'6px'}}>{s}</div>
                        ))}
                        <div style={{background:'rgba(126,183,127,0.07)', border:'1px solid rgba(126,183,127,0.2)', borderRadius:'14px', padding:'20px', marginTop:'8px', display:'flex', alignItems:'center', gap:'14px'}}>
                          <div style={{fontSize:'32px', fontWeight:'800', color:'#7EB77F'}}>$0</div>
                          <div style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.5}}>per user per year<br/>at any scale</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", overflowX: "hidden" }}>
                      <iframe src="/3-architecture-decision.html?v=2" scrolling="no" style={{width:'100%', border:'none', borderRadius:'12px', display:'block', height:'690px'}} />
                    </div>
                  )}
                </ScrollReveal>
              </div>

              <div>
                <ScrollReveal delay={0.1}>
                  <h3 style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", marginBottom: "24px", lineHeight: 1.3 }}>
                    The UI went through a lot of versions.
                  </h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "40px" }}>
                    I did not land on the final design on the first try. Not even close. The home screen alone went through five or six distinct directions before it felt right. A lot of the process was me describing a very specific feeling to Claude Code. Not just &quot;make it look clean&quot; but things like &quot;the card should feel like it has weight, the spacing needs to breathe more, the green should feel calm not medical.&quot; It was a different kind of design process than Figma but the eye for detail was the same.
                  </p>
                </ScrollReveal>
                <ScrollReveal>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "16px" }}>First iterations</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="n2-iter-img" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/home-screen-first-iteration.png" alt="Home screen first iteration" style={{ width: "100%", borderRadius: "4px", display: "block" }} />
                    </div>
                    <div className="n2-iter-img" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/calendar-screen-first-iteration.png" alt="Calendar screen first iteration" style={{ width: "100%", borderRadius: "4px", display: "block" }} />
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 — FEATURES ── */}
        <section id="features" className="px-6 py-28 md:py-36">
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
                      <h3 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.3 }}>
                        {feature.heading}
                      </h3>
                      <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85 }}>
                        {feature.body}
                      </p>
                    </div>
                    <div className="n2-feat-vid" style={{ maxWidth: "280px", margin: "0 auto" }}>
                      {feature.videoSrc ? (
                        <AutoplayVideo src={feature.videoSrc} style={{ width: "100%", borderRadius: "4px", display: "block" }} />
                      ) : (
                        <>
                          {isMobile ? (
                            <div style={{background:'#F8F9FA', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'32px', textAlign:'center'}}>
                              <div style={{fontSize:'40px', marginBottom:'16px'}}>📄</div>
                              <div style={{fontWeight:'700', fontSize:'16px', color:'#1C1C1E', marginBottom:'8px'}}>Doctor Export PDF</div>
                              <div style={{fontSize:'13px', color:'#6B7280', marginBottom:'20px', lineHeight:1.6}}>A clean summary of your gut health data, generated on-device and ready to share with your doctor.</div>
                              <a href="/doctor-pdf.pdf" target="_blank" style={{display:'inline-block', background:'#1C1C1E', color:'#fff', fontWeight:'600', fontSize:'14px', padding:'12px 24px', borderRadius:'10px', textDecoration:'none'}}>View PDF →</a>
                            </div>
                          ) : (
                            <div style={{ borderRadius: "4px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "420px", margin: "0 auto" }}>
                              <iframe src="/doctor-pdf.pdf" style={{ width: "100%", height: "600px", border: "none", display: "block" }} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 06 — DESIGN DECISIONS ── */}
        <section id="decisions" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>06 — Design Decisions</SectionLabel>
            </ScrollReveal>

            <div className="space-y-16">
              <ScrollReveal delay={0.1}>
                <div style={{ paddingBottom: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "16px" }}>Design Decision</p>
                  <h3 style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 500, color: "#13181B", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "20px", maxWidth: "680px" }}>
                    The carousel slowed people down. The list didn&apos;t.
                  </h3>
                  <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "16px" }}>
                    The first logging flow showed Bristol types in a scrolling carousel. Users had to swipe through options without seeing them all at once — which meant extra decisions, extra time. Switching to a full list view, with illustrated icons for each type, changed everything. Users could immediately spot their type and tap it. No scrolling required.
                  </p>
                  <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "600px", marginBottom: "40px" }}>
                    The icons weren&apos;t just aesthetic. &ldquo;Mushy&rdquo; or &ldquo;watery&rdquo; means different things to different people — a small illustration anchors the meaning instantly. The result: average logging time dropped from around a minute to under 20 seconds.
                  </p>
                  {/* Weight, not hue, carries the before/after contrast here —
                      the improved number is the dark one. */}
                  <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 600, color: "#C4C4C4", lineHeight: 1, letterSpacing: "-0.02em" }}>~1 min</p>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginTop: "10px" }}>Carousel</p>
                    </div>
                    <div style={{ width: "1px", background: "#EAEAED", alignSelf: "stretch", margin: "4px 0" }} />
                    <div>
                      <p style={{ fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 600, color: "#13181B", lineHeight: 1, letterSpacing: "-0.02em" }}>~20 sec</p>
                      <p style={{ fontSize: "11px", fontWeight: 500, color: "#9CA3AF", marginTop: "10px" }}>List view</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl p-8 md:p-10" style={{ background: DARK }}>
                  <h3 style={{ fontSize: "clamp(22px, 2.8vw, 28px)", fontWeight: 500, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: "24px", lineHeight: 1.3 }}>
                    The name is the whole brand strategy.
                  </h3>
                  <p style={{ fontSize: "15px", lineHeight: 1.85, marginBottom: "40px", color: "rgba(244,244,245,0.75)", maxWidth: "600px" }}>
                    No. 2. Everyone knows what it means. Slightly funny, immediately clear, owns the subject instead of tiptoeing around it. The tagline was obvious: The No. 1 app for your No. 2. The logo dot is a colon. The punctuation mark and the organ. Two meanings, one mark.
                  </p>
                  {isMobile ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'24px', alignItems:'center'}}>
                      <div style={{background:'#1C1C1E', borderRadius:'24px', padding:'48px', display:'flex', alignItems:'center', justifyContent:'center', width:'100%'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246 246" style={{width:'200px', height:'200px'}}>
                          <rect width="246" height="246" rx="43.88" ry="43.88" fill="#1c1c1d"/>
                          <circle cx="47.78" cy="164.32" r="11.44" fill="#7eb880"/>
                          <path fill="#fff" d="M185.66,93.37h0c0-12.77-8.71-23.12-19.46-23.12h-92.25c-1.69,0-3.05,1.45-3.05,3.23v38.2c0,1.78,1.37,3.23,3.05,3.23h43.14c3.67,0,4.22,5.61.62,6.39l-31.14,6.82c-9.08,1.99-15.67,11.4-15.67,22.37h0c0,13.91,10.65,25.18,23.78,25.18h87.93c1.69,0,3.05-1.45,3.05-3.23v-38.2c0-1.78-1.37-3.23-3.05-3.23h-30.49c-10.65,0-19.28,13.59-19.28,24.52v-20.64c0-1.28.71-2.43,1.81-2.95l38.54-18.12c.64-.25,1.26-.55,1.87-.88l.25-.12h-.05c6.14-3.45,10.39-10.85,10.39-19.45Z"/>
                        </svg>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-sketch.jpeg" style={{width:'100%', borderRadius:'16px', display:'block'}} alt="Logo sketches" />
                    </div>
                  ) : (
                    <div style={{ width: "100%", overflowX: "hidden" }}>
                      <iframe src="/6-brand-identity.html" scrolling="no" style={{width:'100%', border:'none', borderRadius:'12px', display:'block', height:'720px'}} />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── 07 — ROADMAP ── */}
        <section id="roadmap" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>07 — Roadmap</SectionLabel>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85, maxWidth: "640px", marginBottom: "64px" }}>
                Phase 1 is just getting it out the door. Ship it, prove the core experience works, build a user base. Phase 2 is where it gets smarter with AI. Phase 3 is where it starts to matter at a clinical level.
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div style={{ width: "100%", overflowX: "hidden" }}>
                <iframe src="/5-roadmap.html" scrolling="no" style={{ width: "100%", border: "none", borderRadius: "4px", display: "block", height: isMobile ? "1175px" : "580px" }} />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── 08 — KEY LEARNINGS ── */}
        <section id="learnings" className="px-6 py-28 md:py-36">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <SectionLabel>08 — Key Learnings</SectionLabel>
            </ScrollReveal>

            <Callout
              label="Learning 01"
              heading="Learning backend as a designer changed how I think about specs."
              body="I used to write specs without really understanding what I was asking for. Now I understand how RLS works, how auth sessions are managed, and what actually happens when data gets stored. It made me a better collaborator and a better product thinker."
              delay={0.05}
            />
            <Callout
              label="Learning 02"
              heading="The UI only got good because I refused to let it be fine."
              body="There were a lot of moments where something was almost right. I kept going anyway. The gap between almost right and actually right is where most of the hours went."
              delay={0.1}
            />
            <Callout
              label="Learning 03"
              heading="The AI cost thing was a product decision, not a technical one."
              body="Cutting AI from Phase 1 was not a compromise. It made the product cheaper, faster to ship, and more honest about what it actually is right now."
              delay={0.15}
            />
            <Callout
              label="Learning 04"
              heading="Two weeks is enough to ship something real."
              body="Since launch with no marketing, No. 2 has had a dozen-plus downloads — friends, family, and strangers who scanned a QR code at my senior showcase. Every person who's used it has found it genuinely helpful. The 5-star review from the friend who first pushed me to build it was a good way for that story to end."
              delay={0.2}
            />
          </div>
        </section>

        <CaseStudyBottomNav
          isOverlay={isOverlay}
          onClose={onClose}
          nextHref="/cove"
          nextLabel="Cove"
        />
    </>
  );

  if (isOverlay) return <div className="cs-body">{body}</div>;

  return (
    <>
      <Nav sections={NO2_SECTIONS} accentColor={ACCENT} />
      <CaseStudyNav sections={NO2_SECTIONS} accentColor={ACCENT} card />
      <main className="pt-[72px] cs-body">{body}</main>
      <Footer />
    </>
  );
}
