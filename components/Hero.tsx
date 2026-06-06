"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion } from "framer-motion";

const STATEMENT = "Designing products that\nfeel good to use.";
const LINES = STATEMENT.split("\n");
const TYPE_SPEED = 40;
const TYPE_JITTER = 16;
const TYPE_DELAY = 320;
const LINE2_DELAY = 450; // after line 1 types out, before tags + chat fade in (line 2 slides in during this)

// Apple-ish settle: soft, decelerating, never bouncy
const charEase = [0.16, 1, 0.3, 1] as const;

const TAGS = ["Product Design", "Prototyping", "Design Systems"];

const QUICK_PROMPTS = [
  "Recent work",
  "What I'm looking for",
  "My stack",
  "Get in touch",
];

const linkStyle = { color: "#FD8973", textDecoration: "none", borderBottom: "1px solid #FD8973" } as const;
const Email = () => <a href="mailto:nhadley0517@gmail.com" style={linkStyle}>nhadley0517@gmail.com</a>;
const LinkedIn = () => <a href="https://www.linkedin.com/in/noah-hadley/" target="_blank" rel="noopener noreferrer" style={linkStyle}>LinkedIn</a>;
const WorkLink = () => <a href="#work" style={linkStyle}>the work ↓</a>;

function getResponse(q: string): ReactNode {
  const l = q.toLowerCase().trim();
  const words = l.split(/[^a-z0-9']+/).filter(Boolean);
  // word-boundary match — for short tokens like "hi" that would false-match inside "this"
  const word = (...ws: string[]) => ws.some(w => words.includes(w));
  // substring match — for distinctive phrases/longer terms
  const has = (...ss: string[]) => ss.some(s => l.includes(s));

  // ── Small talk ───────────────────────────────
  if (word("hi", "hey", "yo", "hello", "hiya", "howdy", "sup", "hii", "heya") ||
      has("what's up", "whats up", "wassup", "good morning", "good afternoon", "good evening")) {
    return "Hey! 👋 I'm Noah — well, the part of my site that answers questions. Ask me about my work, my background, what I'm looking for, my stack, or what I get up to outside of design.";
  }
  if (has("how are you", "how are u", "how's it going", "hows it going", "how you doing", "you doing", "you good")) {
    return "Doing great — building things and looking for the right team. How about you? Feel free to ask me anything about my work or background.";
  }
  if (word("thanks", "thank", "thx", "ty", "tysm", "cheers") || has("thank you", "appreciate")) {
    return "Anytime! 🙏 If you want to keep going, you can email me or connect on LinkedIn — links are under \"Get in touch.\"";
  }
  if (word("bye", "goodbye", "cya", "later") || has("see you", "see ya", "take care")) {
    return (<>Take care! 👋 If anything stuck with you, I&apos;m at <Email /> or on <LinkedIn />.</>);
  }

  // ── Is this real? ────────────────────────────
  if (has("are you ai", "are you a bot", "are you real", "is this ai", "is this real", "chatgpt", "real person", "actually noah", "talking to a", "are you human")) {
    return "Ha — not real AI. This is a little hand-built responder Noah coded into the page (a fun way to show he designs and builds). The answers are all his, though. Want the real Noah? Hit \"Get in touch.\"";
  }
  if (has("build this", "built this", "make this", "made this", "build the site", "build your site", "this site", "this website", "how was this", "who made this", "did you build")) {
    return "Yep — I designed and built this whole site myself: Next.js, React, TypeScript, and Framer Motion. Including this little chat. I like proving the design-and-build combo rather than just claiming it.";
  }

  // ── Working together / hiring ────────────────
  if (has("work with you", "work together", "work with me", "collaborate", "freelance", "hire you", "project together")) {
    return (<>I&apos;d love to. The fastest way is to reach out directly — <Email /> or <LinkedIn /> — and tell me a bit about what you&apos;re working on.</>);
  }
  if (word("looking", "hiring", "hire", "job", "role", "open", "available", "opportunity", "recruit", "recruiting", "employ", "position") ||
      has("full-time", "full time", "open to work")) {
    return "Actively looking for a full-time product design role — somewhere the problems are real and the team cares about craft. Open to in-person or remote, and happy to relocate for the right team. If that sounds like your team, let's talk.";
  }

  // ── Resume / contact ─────────────────────────
  if (word("resume", "cv") || has("curriculum vitae")) {
    return (<>Happy to send my resume over — just email me at <Email /> or reach out on <LinkedIn /> and I&apos;ll get it right to you.</>);
  }
  if (word("contact", "email", "reach", "linkedin", "connect", "message") || has("get in touch", "reach out", "get a hold", "how do i contact")) {
    return (<>Easiest ways to reach me: <Email /> or <LinkedIn />. I read everything.</>);
  }

  // ── Background ───────────────────────────────
  if (word("experience", "worked", "internship", "intern", "companies", "company", "career") ||
      has("where have you worked", "canyon creative", "grand canyon education", "work history")) {
    return "Two product design internships: Grand Canyon Education (Oct 2024–Apr 2026), shipping to a student platform used by tens of thousands, and Canyon Creative (Dec 2025–Apr 2026), designing features end-to-end across client products and building design systems.";
  }
  if (word("school", "study", "studied", "degree", "college", "university", "gcu", "graduate", "graduated", "education", "major") ||
      has("grand canyon university", "where did you go")) {
    return "I just finished my degree at Grand Canyon University (GCU). A lot of what I know, though, came from building real things and learning by doing.";
  }
  if (word("location", "based", "live", "living", "reno", "nevada", "nv", "relocate", "remote") ||
      has("where are you", "where do you live", "where are you based", "willing to move")) {
    return "Based in Reno, NV — but I'm open to roles in person or fully remote, and happy to relocate for the right team.";
  }

  // ── Craft ────────────────────────────────────
  if (word("stack", "tools", "tool", "tech", "code", "coding", "figma", "framework", "languages") ||
      has("do you code", "do you build", "how do you build", "what do you use", "tech stack")) {
    return "Figma for design and prototyping. React, Next.js, TypeScript, and Framer Motion for building — this site is proof. I'm not an engineer, but I prototype fast in code and can hand off (or collaborate) with engineers without a translator in between.";
  }
  if (word("work", "projects", "project", "shipped", "ship", "portfolio", "built", "case") || has("case study", "case studies", "show me")) {
    return (<>I&apos;ve got a few case studies below — <strong>Cove</strong> (a field-service CRM I designed from zero as founding designer), <strong>No. 2</strong> (a gut-health app I designed and built solo in two weeks), and a redesign of GCU&apos;s writing resource. Take a look at <WorkLink /></>);
  }
  if (has("favorite project", "favourite project", "best project", "best work", "proudest", "most proud", "favorite work")) {
    return (<>Probably <strong>No. 2</strong> — I designed, branded, coded, and shipped it solo in two weeks. It&apos;s the clearest proof of the design-and-build thing I keep talking about. It&apos;s in <WorkLink /></>);
  }
  if (word("process", "philosophy", "approach", "method", "principles", "principle") ||
      has("how do you work", "how do you design", "your process", "design philosophy")) {
    return "I start with the problem. Before I open Figma I want to understand what's actually broken and why. To me, good design is when something works so well nobody notices it — that's the bar. And I'll go wide to get there: research, design, a bit of code, whatever the problem needs.";
  }
  if (has("why design", "why product", "got into", "get into design", "why ux", "what got you", "why do you design")) {
    return "I care about how things feel to use, not just how they look. Design is where problem-solving, psychology, and craft all meet — and you actually get to ship the thing. That mix is what hooked me.";
  }
  if (word("strength", "strengths", "superpower", "skills", "skill") || has("good at", "best at", "stand out")) {
    return "My edge is the design-and-build combo: I can research and design a product, then prototype it in real code. That means tighter loops, fewer things lost in handoff, and ideas you can actually click instead of imagine.";
  }

  // ── Personal ─────────────────────────────────
  if (word("dog", "dogs", "pet", "pets") ) {
    return "I've got dogs and I bother them constantly. 🐶 Easily one of the best parts of my day.";
  }
  if (word("hobby", "hobbies", "fun", "outside", "hobbies", "interests", "weekend", "passion", "passions") ||
      has("for fun", "free time", "outside of work", "outside of design", "do for fun", "when you're not", "spare time")) {
    return "Outside of design I'm usually at the gym, spending time outdoors, or bothering my dogs. 🏋️🌲🐶";
  }
  if (word("age", "old") || has("how old")) {
    return "Old enough to have strong opinions about empty states and loading spinners. Let's keep it about the work. 😄";
  }
  if (word("salary", "pay", "rate", "compensation", "comp", "money") || has("how much", "expected salary", "pay range")) {
    return (<>Happy to talk specifics directly rather than here — reach out at <Email /> and we&apos;ll figure out if it&apos;s a fit.</>);
  }
  if (has("joke", "make me laugh", "funny", "tell me something funny")) {
    return "Why did the designer get kicked out of the museum? They kept trying to align the paintings to an 8-point grid. 🎨";
  }
  if (has("marry me", "love you", "are you single", "date you", "your number")) {
    return "Flattered. 😄 But the only commitment I'm after right now is a great product team. Speaking of — ask me what I'm looking for.";
  }

  // ── About (broad catch) ──────────────────────
  if (word("who", "about", "yourself", "noah", "you", "intro", "introduce", "name", "bio") ||
      has("tell me about", "your name", "who are you")) {
    return (<>I&apos;m <strong>Noah Hadley</strong> — a product designer who also builds. I just finished at GCU, interned at Grand Canyon Education and Canyon Creative, and I care about how products <em>feel</em> to use, not just how they look. Ask me about my work, my stack, or what I&apos;m looking for.</>);
  }

  // ── Fallback ─────────────────────────────────
  return "Good question — I might not have a canned answer for that one. Try asking about my work, my background, what I'm looking for, my stack, where I'm based, or what I do for fun. Or just reach out directly under \"Get in touch.\"";
}

type Msg = { role: "user" | "assistant"; content: ReactNode };

export default function Hero() {
  const [progress, setProgress]         = useState(0); // characters revealed in line 1
  const [showLine2, setShowLine2]       = useState(false);
  const [showMeta, setShowMeta]         = useState(false);
  const [msgs, setMsgs]                 = useState<Msg[]>([]);
  const [input, setInput]               = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the conversation scrolled to the newest message — scoped to the chat
  // window only (sets the container's scrollTop, never the page's).
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [msgs]);

  // Keep the page pinned to the hero on load (don't let the browser restore
  // a previous scroll position or jump to an anchor).
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Typewriter
  useEffect(() => {
    let idx = 0;
    let t: ReturnType<typeof setTimeout>;

    const tick = () => {
      idx++;
      setProgress(idx);
      if (idx < LINES[0].length) {
        t = setTimeout(tick, TYPE_SPEED + (Math.random() * TYPE_JITTER * 2 - TYPE_JITTER));
      } else {
        // line 1 done — slide line 2 in as a block, then reveal tags + chat
        setShowLine2(true);
        setTimeout(() => setShowMeta(true), LINE2_DELAY);
      }
    };

    const init = setTimeout(tick, TYPE_DELAY);
    return () => { clearTimeout(init); clearTimeout(t); };
  }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs(p => [
      ...p,
      { role: "user",      content: text },
      { role: "assistant", content: getResponse(text) },
    ]);
    setInput("");
  };


  return (
    <section
      className="px-6 md:px-10 lg:px-16"
      style={{
        background: "#f4f4f5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "120px",
        paddingBottom: "80px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div className="max-w-5xl mx-auto w-full">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "clamp(20px, 3vw, 32px)" }}
        >
          <span className="nh-label">Noah Hadley</span>
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#D1D5DB" }} />
          <span className="nh-label" style={{ color: "#9CA3AF" }}>Product Designer &amp; Builder</span>
        </motion.div>

        {/* Statement — typewriter with per-character depth.
            A hidden copy of the full statement reserves the exact height + width
            so the title types in place without ever reflowing the layout. */}
        <h1 className="nh-statement" style={{ position: "relative" }}>
          <span aria-hidden style={{ visibility: "hidden" }}>
            {STATEMENT.split("\n").map((ln, i) => (
              <span key={i} style={{ display: "block" }}>{ln}</span>
            ))}
          </span>
          <span style={{ position: "absolute", inset: 0 }}>
            {/* Line 1 — types out character by character */}
            <span style={{ display: "block" }}>
              {[...LINES[0]].slice(0, progress).map((ch, ci) => (
                <motion.span
                  key={ci}
                  initial={{ opacity: 0, y: "0.4em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: charEase }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {ch}
                </motion.span>
              ))}
              {/* cursor trails line 1 while it types */}
              {!showLine2 && <span className="nh-cursor">|</span>}
            </span>

            {/* Line 2 — slides in as a whole block once line 1 finishes */}
            <span style={{ display: "block" }}>
              {showLine2 && (
                <motion.span
                  initial={{ opacity: 0, y: "0.5em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.55, ease: charEase }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {LINES[1]}
                </motion.span>
              )}
            </span>
          </span>
        </h1>

        {/* Discipline tags — always present (reserves space), fades in place */}
        <motion.div
          animate={{ opacity: showMeta ? 1 : 0, y: showMeta ? 0 : 6 }}
          transition={{ duration: 0.55, ease: charEase }}
          aria-hidden={!showMeta}
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: "clamp(20px, 3vw, 28px)" }}
        >
          {TAGS.map((tag, i) => (
            <span key={tag} style={{ display: "flex", alignItems: "center" }}>
              <span className="nh-tag">{tag}</span>
              {i < TAGS.length - 1 && (
                <span style={{ margin: "0 14px", color: "#D1D5DB", fontSize: "11px" }}>/</span>
              )}
            </span>
          ))}
        </motion.div>

        {/* Chat — always present (reserves space), fades in place as one cohesive search element */}
        <motion.div
          animate={{ opacity: showMeta ? 1 : 0, y: showMeta ? 0 : 10 }}
          transition={{ duration: 0.6, ease: charEase }}
          aria-hidden={!showMeta}
          style={{ marginTop: "clamp(36px, 5vw, 52px)", maxWidth: "560px", pointerEvents: showMeta ? "auto" : "none" }}
        >
              {/* Quick prompts — persistent, sit just above the input so they stay available mid-chat */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {QUICK_PROMPTS.map(p => (
                  <motion.button
                    key={p}
                    onClick={() => send(p)}
                    whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}
                    whileTap={{ scale: 0.97 }}
                    className="nh-prompt-btn"
                    tabIndex={showMeta ? 0 : -1}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>

              {/* Search input */}
              <form
                onSubmit={e => { e.preventDefault(); send(input); }}
                className="nh-search"
              >
                <svg className="nh-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything…"
                  className="nh-input"
                  tabIndex={showMeta ? 0 : -1}
                />
                <button
                  type="submit"
                  className="nh-send-btn"
                  aria-label="Send"
                  tabIndex={showMeta ? 0 : -1}
                  style={{ background: input.trim() ? "#111827" : "transparent", color: input.trim() ? "#fff" : "#C4C7CC" }}
                >
                  ↑
                </button>
              </form>

              {/* Answers — a fixed-height context window. The page grows once when
                  the first message appears; after that, the conversation scrolls
                  inside this box instead of growing the page. */}
              {msgs.length > 0 && (
                <div ref={logRef} className="nh-chatlog" style={{ height: "260px", overflowY: "auto", marginTop: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "100%", justifyContent: "flex-end", paddingRight: "4px" }}>
                    {msgs.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: charEase }}
                        style={{
                          alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                          maxWidth: "92%",
                          flexShrink: 0,
                          padding: "12px 16px",
                          borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: m.role === "user" ? "#111827" : "#fff",
                          color: m.role === "user" ? "#fff" : "#1F2937",
                          fontSize: "14px",
                          lineHeight: 1.65,
                          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                        }}
                      >
                        {m.content}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
        </motion.div>
      </div>

      {/* Scroll cue — fills the empty bottom of the centered hero and hints at what's below.
          Absolutely positioned so it never affects the centered content. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showMeta ? 1 : 0 }}
        transition={{ duration: 0.6, delay: showMeta ? 0.35 : 0, ease: charEase }}
        aria-hidden={!showMeta}
        className="nh-cue-wrap px-6 md:px-10 lg:px-16"
        style={{ position: "absolute", left: 0, right: 0, bottom: "32px", pointerEvents: showMeta ? "auto" : "none" }}
      >
        <div
          className="max-w-5xl mx-auto"
          style={{
            borderTop: "1px solid rgba(0,0,0,0.09)",
            paddingTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <span className="nh-label" style={{ color: "#9CA3AF" }}>Open to full-time roles</span>
          <button
            type="button"
            onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
            className="nh-scrollcue"
            tabIndex={showMeta ? 0 : -1}
          >
            Selected Work
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              ↓
            </motion.span>
          </button>
        </div>
      </motion.div>

      <style>{`
        .nh-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #111827;
        }
        .nh-statement {
          font-size: clamp(30px, 4.2vw, 50px);
          font-weight: 500;
          color: #111827;
          line-height: 1.34;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .nh-tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #9CA3AF;
        }
        .nh-scrollcue {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #111827;
          transition: color 0.15s ease;
        }
        .nh-scrollcue:hover { color: #FD8973; }
        .nh-chatlog {
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.18) transparent;
        }
        .nh-chatlog::-webkit-scrollbar { width: 6px; }
        .nh-chatlog::-webkit-scrollbar-track { background: transparent; }
        .nh-chatlog::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.18);
          border-radius: 999px;
        }
        /* Hide the cue when the viewport is too short to fit it below the centered content */
        @media (max-height: 720px), (max-width: 640px) {
          .nh-cue-wrap { display: none !important; }
        }
        .nh-cursor {
          display: inline-block;
          color: #FD8973;
          font-weight: 300;
          margin-left: 2px;
          transform: translateY(-0.02em);
          animation: nh-blink 0.8s steps(1) infinite;
        }
        @keyframes nh-blink {
          0%, 50%   { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .nh-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 6px 6px 6px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .nh-search:focus-within {
          border-color: rgba(0,0,0,0.16);
          box-shadow: 0 4px 18px rgba(0,0,0,0.07);
        }
        .nh-search-icon { color: #9CA3AF; flex-shrink: 0; }
        .nh-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          color: #111827;
          outline: none;
          padding: 9px 0;
          font-family: inherit;
        }
        .nh-input::placeholder { color: #9CA3AF; }
        .nh-send-btn {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: none;
          font-size: 17px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, color 0.2s;
        }
        .nh-prompt-btn {
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.10);
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          font-family: inherit;
          transition: box-shadow 0.15s;
        }
      `}</style>
    </section>
  );
}
