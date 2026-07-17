export interface ArchiveProjectDetails {
  role?: string;
  whatIDid?: string;
  team?: string;
  /** Only rendered when present — omit if unknown or not useful. */
  timeline?: string;
  /** Tools/stack used — rendered as its own "Built With" row. */
  builtWith?: string;
  /** e.g. "Live site launched following the project" — rendered as its own row. */
  status?: string;
}

export interface ArchiveProjectHero {
  type: "image" | "video";
  src: string;
  alt?: string;
}

/** One before/after screen comparison within a case study — the real
 *  "what changed and why" detail, not just a summary bullet. */
export interface ArchiveProjectScreen {
  label: string;
  title: string;
  problem: string;
  changes: { title: string; body: string }[];
  /** Static "before" screenshot. */
  beforeSrc?: string;
  /** Interactive "after" mockup, iframed at phone size. */
  afterSrc?: string;
}

export interface ArchiveProjectData {
  slug: string;
  title: string;
  /** One-line description of what it is + the outcome. */
  oneLiner: string;
  /** Existing media if we have it — omit (undefined) to skip the hero visual entirely. */
  hero?: ArchiveProjectHero;
  /** 1–2 short paragraphs. No process/research/reflection writing. */
  overview: string[];
  details: ArchiveProjectDetails;
  /** 3–5 concrete, specific deliverables/decisions — only true, verified ones. */
  whatIMade: string[];
  /** Overrides the "What I Made" heading — e.g. "What I Contributed" for team/contract work. */
  whatIMadeLabel?: string;
  /** Omit entirely (undefined) when there is no valid destination to link to. */
  live?: { url: string; label: string };
  /** Short caveat/context line rendered under the live CTA — e.g. noting the project evolved since launch. */
  closingNote?: string;
  /** Optional stacked gallery of final/finished screens, shown after "What I Made". */
  finalImages?: { src: string; alt?: string }[];
  /** Optional per-screen before/after breakdowns, shown after the overview. */
  screens?: ArchiveProjectScreen[];
}

// Each entry below only states facts already confirmed in conversation with Noah.
// Anywhere a detail is genuinely unknown, the field is left out rather than guessed —
// look for the `// TODO(Noah):` comments for exactly what to fill in.
export const ARCHIVE_PROJECTS: ArchiveProjectData[] = [
  {
    slug: "sales-dashboard",
    title: "Driveway Auto Spa Sales Dashboard",
    oneLiner: "A CRM-connected sales dashboard that gives a detailing business a live view of bookings, ad performance, and team revenue.",
    hero: { type: "video", src: "/dwautospademo.mp4" },
    overview: [
      "Driveway Auto Spa already used GoHighLevel as its CRM, but the sales side of the business still lived across spreadsheets, calendar bookings, and gut feeling. My friend needed one place to answer the questions that actually shape his day: What did we book this month? What is still unrealized? Are ads paying off? Which services and salespeople are driving revenue?",
      "I designed and built a lightweight internal tool around the way he thinks about the business: revenue counts when a customer books, not only when the service is fulfilled. The result is a live operating view he and his salespeople can use from their phones between customers.",
    ],
    details: {
      role: "Product Designer & Developer",
      team: "Solo, working directly with the business owner",
      timeline: "3 days",
      builtWith: "Next.js, Supabase, Vercel, GoHighLevel",
    },
    whatIMade: [
      "A responsive dashboard for booked revenue, realized vs. unrealized revenue, ROAS, conversion rate, customer acquisition cost, average ticket size, and target vs. current pace.",
      "A booking workflow that supports multiple services on one ticket, such as PPF and window tint, so revenue is attributed accurately by service.",
      "Salesperson accounts, owner controls, individual performance views, and protected business data using authentication and row-level security.",
      "A booking calendar that makes monthly revenue patterns visible at a glance.",
      "Recurring ad-spend tracking, so the owner sets a daily budget once instead of manually entering the same amount every day.",
      "GoHighLevel automation: scheduled deals create unrealized bookings, and sold deals update to realized revenue.",
      "A mobile-first experience that can be installed to the home screen and used like an app.",
    ],
    closingNote: "Private product: sign-in required.",
    // TODO(Noah): add the live dashboard URL once you want it linked publicly — `live` omitted for now since it's a private, sign-in-required product.
  },
  {
    slug: "miah-families",
    title: "Miah Families",
    oneLiner: "Turning a bare-bones Google Site into a branded, donation-ready home for an Oregon nonprofit.",
    hero: { type: "image", src: "/miah-hero.png" },
    overview: [
      "Miah Families is an Oregon nonprofit building more connected, intergenerational communities for people of all ages and abilities. Before this project, its website was a basic Google Site that did not reflect the organization's mission, new identity, or growing community.",
      "During my internship at Canyon Creative, I designed and built a completely new website around the agency's newly developed brand system. I worked directly with the client through regular check-ins, translating feedback into changes while advocating for decisions that protected clarity, usability, and the overall experience.",
    ],
    details: {
      role: "Web Designer & Webflow Developer",
      team: "Worked with a Project Manager, Copywriter, and the Canyon Creative brand team",
      timeline: "February–April",
      builtWith: "Figma, Webflow, Mailchimp, BetterWorld",
    },
    whatIMade: [
      "Designed the full responsive website in Figma and built it solo in Webflow.",
      "Turned the new brand system into a complete digital experience, including page structure, layouts, responsive behavior, and reusable site patterns.",
      "Created an on-brand newsletter signup flow through Mailchimp, including custom edits to the embedded form code.",
      "Set up BetterWorld donation campaigns and embedded the donation experience directly into the site, so visitors can complete checkout without being sent away to a third-party page.",
      "Collaborated with the client through weekly feedback sessions, balancing requested changes with thoughtful design pushback when it improved the experience.",
    ],
    live: {
      url: "https://www.miahfamilies.org/",
      label: "Visit Miah Families",
    },
    closingNote: "The site has evolved since launch through ongoing updates from the client's team; the original core structure, site architecture, and initial Webflow build were designed and developed by me.",
  },
  {
    slug: "actively-ai",
    title: "Actively AI",
    oneLiner: "Designing key solution-page experiences for an AI platform helping revenue teams work every account more intelligently.",
    hero: { type: "image", src: "/actively-hero.png" },
    overview: [
      "Actively AI was preparing to launch a new marketing site for its AI-powered revenue platform. During my internship at Canyon Creative, I joined an intensive cross-agency sprint to help bring key parts of the experience across the finish line.",
      "Working directly with Actively's founder, a Canyon Creative Project Manager, and a larger external design team, I designed the solution-page experiences for the people the product serves: Chief Revenue Officers, Account Executives, SDRs, and Internal AI Teams. I also explored early homepage directions that informed the launch work.",
    ],
    details: {
      role: "Product Design Support",
      team: "Collaborated with Actively AI, Canyon Creative, and an external design agency",
      timeline: "One-week launch sprint",
      builtWith: "Figma",
      status: "Live site launched following the project",
    },
    whatIMadeLabel: "What I Contributed",
    whatIMade: [
      "Designed solution-page UI and layout explorations for four core revenue roles: CROs, Account Executives, SDRs, and Internal AI Teams.",
      "Created reusable interface components and supporting visual moments for the site's product storytelling.",
      "Produced homepage mockups that were reviewed directly with Actively's founder.",
      "Participated in daily feedback sessions, iterating quickly within a shared Figma file alongside a multi-designer team.",
      "Helped turn complex AI and go-to-market concepts into clearer, role-specific web experiences.",
    ],
    live: { url: "https://www.actively.ai/", label: "Visit Actively AI" },
    closingNote: "This was a focused contribution to a larger launch effort. The live site has continued to evolve since the initial release; some of the role-based solution experiences and UI contributions from my sprint remain part of the work.",
  },
  {
    slug: "cluely",
    title: "Cluely: Onboarding Redesign",
    oneLiner: "A self-directed redesign of Cluely's onboarding experience, shared directly with their founder.",
    hero: { type: "image", src: "/cluely-hero.png" },
    overview: [
      "Redesigned Cluely's onboarding experience as a self-directed project, then reached out to their founder directly to share the work.",
    ],
    details: {
      role: "Self-directed",
      whatIDid: "Redesigned the onboarding flow end-to-end, unprompted.",
      team: "Solo",
    },
    whatIMade: [
      "Redesigned Cluely's onboarding flow end-to-end.",
      "Reached out directly to the founder to share the work.",
    ],
    live: { url: "https://www.youtube.com/watch?v=sL9K2-Rmf3Y", label: "Watch the full flow on YouTube" },
  },
  {
    slug: "univo",
    title: "Univo",
    oneLiner: "A concept app that translates complex medical records into plain-language summaries patients can actually understand.",
    hero: { type: "video", src: "/univo-hero.webm" },
    overview: [
      "Univo is a mobile app concept built for a student project that helps patients understand their health by turning complex medical records into clear, plain-language summaries, surfacing diagnoses, medications, next steps, recent visits, and insurance details in one place.",
      "The core insight: access wasn't the problem, comprehension was. Medical notes are written for clinicians: dense, jargon-heavy, and structured for documentation, not decision-making. Rather than rewriting clinical language (a real liability and trust risk), I added a summary-first layer on top of it, improving clarity while preserving accuracy.",
      "If brought to market, Univo would launch as a limited pilot, read-only visit summaries within a single provider network, rather than a full hospital-system replacement, proving comprehension gains before attempting full EHR integration. Healthcare design at this level isn't just a usability problem, it's a trust and compliance problem too, and scoping around that mattered as much as the interface itself.",
    ],
    details: {
      role: "UX/UI Designer",
      team: "Solo, student project",
      timeline: "4 weeks",
      builtWith: "Figma, Illustrator",
    },
    whatIMade: [
      "Reviewed anonymized visit summaries and existing patient portals, identifying that comprehension, not access, was the real gap.",
      "Designed a summary-first information architecture surfacing diagnoses, medications, next steps, recent visits, and insurance details up front.",
      "Ran early wireframes through user feedback, then tightened contrast, spacing, and label clarity based on what people said.",
      "Designed a full high-fidelity prototype in Figma balancing plain-language clarity with clinical accuracy and trust.",
      "Scoped the concept around real-world constraints (HIPAA/compliance, liability of altering clinician language, and EHR integration complexity) rather than ignoring them.",
    ],
    finalImages: [
      { src: "https://framerusercontent.com/images/ghJ6svUJ6gHdAOLPeICeZgRVivI.png", alt: "Univo final design: overview screen" },
      { src: "https://framerusercontent.com/images/3knfP3ccjan5Bk5xgQT4u8o.png",     alt: "Univo final design: visit summary" },
      { src: "https://framerusercontent.com/images/Qf1ga3gPk9n8s9KWXh5Se1KSLQ.png",  alt: "Univo final design: diagnoses" },
      { src: "https://framerusercontent.com/images/4ykcvFM32fAHDjNT2ww9jzeIY.png",   alt: "Univo final design: medications" },
      { src: "https://framerusercontent.com/images/QlAYHhmDDPAKHzk8I66wfrX8.png",    alt: "Univo final design: next steps" },
      { src: "https://framerusercontent.com/images/X2Z6xbl9ATopFmJGk8GLsjhqKc.png",  alt: "Univo final design: insurance details" },
    ],
  },
  {
    slug: "real",
    title: "Real: Redesign Case Study",
    oneLiner: "Redesigned the UI of an app I use often, then cold-messaged the founder and landed a meeting he loved before he eventually went quiet.",
    overview: [
      "Real already had a strong design system, so this wasn't a rebrand: it was three small, deliberate UX fixes aimed at one thing, friction while watching a live game. I designed and hand-coded every \"after\" screen as a working mockup, not a flat image, then cold-messaged the founder to share it.",
    ],
    details: {
      role: "Product Designer",
      team: "Solo, self-directed",
      builtWith: "Hand-coded HTML/CSS",
    },
    screens: [
      {
        label: "01 · Scores home",
        title: "Finding your sport and event, faster",
        problem: "The scores you came for sit behind two long rows of text tabs. Switching sports means scrolling plain labels: slow to scan, easy to overshoot. And the World Cup is buried mid-scroll.",
        changes: [
          { title: "Sport selector → icon pills", body: "A recognizable emoji per sport. Scan by shape, not by reading. Shorter than the old text row." },
          { title: "World Cup featured callout", body: "The event people open this screen for, surfaced as a live card. Other leagues stay one tap away." },
          { title: "Players / Countries filter", body: "One toggle switches the ranking between players and national teams. No new screen." },
          { title: "Cleaner match cards", body: "Flag, score, then country name in grey. Live and Final badges sit top-right so names never wrap." },
        ],
        beforeSrc: "/real/assets/originals/scores-before.png",
        afterSrc: "/real/screens/scores.html",
      },
      {
        label: "02 · Play detail",
        title: "The player's night, without leaving the play",
        problem: "The play is here, but the player's stats for the game are not. A big Performance button dominates the screen and still sends you elsewhere for points, rebounds, assists.",
        changes: [
          { title: "Game-stat card under the play", body: "PTS, REB, AST up top. FG, 3PT, BLK, STL, MIN below. The box score in one glance." },
          { title: "Smaller Performance button", body: "Still here for the deep dive, now a compact action inside the card, not a banner." },
          { title: "Tighter hierarchy", body: "The play title leads. Attribution lines shrink. Eye goes play, stats, chart." },
        ],
        beforeSrc: "/real/assets/originals/play-before.png",
        afterSrc: "/real/screens/play.html",
      },
      {
        label: "03 · Comments",
        title: "Chat that still feels like the game",
        problem: "Opening comments feels like leaving the game. Chat takes the full screen, and the exit is a close button stranded bottom-right, where no one looks for back.",
        changes: [
          { title: "Back moved to top-left", body: "The expected spot for exit. The scorebug shrinks into a compact game bar." },
          { title: "Chat as an in-game sheet", body: "A panel with a grab handle sits over the game, not in place of it." },
          { title: "Chat / Plays / Stats tabs", body: "Comments become one tab of the live game, so you never feel moved away." },
          { title: "Send affordance fixed", body: "The composer's ✕ becomes an ↑ send arrow." },
        ],
        beforeSrc: "/real/assets/originals/comments-before.png",
        afterSrc: "/real/screens/comments.html",
      },
    ],
    whatIMade: [
      "Designed and hand-coded three working screen redesigns: Scores home, Play detail, and Comments, each targeting one specific point of friction while watching a live game.",
      "Built every \"after\" as a real, interactive HTML/CSS mockup instead of a flat image, so the redesign could actually be clicked through.",
      "Cold-messaged the founder directly to share the work.",
    ],
    closingNote: "Landed a meeting the founder loved. He eventually went quiet, but the redesigns above are exactly what he saw.",
  },
];

export function getArchiveProject(slug: string): ArchiveProjectData | undefined {
  return ARCHIVE_PROJECTS.find((p) => p.slug === slug);
}
