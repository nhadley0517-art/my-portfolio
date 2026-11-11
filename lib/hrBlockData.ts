/* H&R Block: not a traditional case study but a look into the role. What I
 * own, who I work with, what I've done there in my own words, and how
 * a project moves.
 *
 * Built from the project kickoff decks, kept to what's safe to show: no
 * internal metrics, test results, audience sizes, file names or unreleased
 * detail. Research is described in words, never in numbers. */

/** The green of the logo itself. */
export const HRB_ACCENT = "#14AA40";

export const HRB = {
  slug: "hr-block",
  title: "H&R Block",
  role: "UX Designer",
  statement: "UX design across hrblock.com.",
  intro:
    "I take pages from the kickoff brief to a locked file in AEM: the small business front door, product pages, campaign launches, and a new way to reach H&R Block from inside AI assistants. Every page has to hold up through tax season and the rest of the year.",
  columns: [
    {
      label: "What I own",
      items: ["Page design, kickoff to handoff", "Marquee systems", "Component library work", "Designing for A/B tests", "File lockdown and AEM handoff", "Mobile and desktop"],
    },
    {
      label: "Who I work with",
      items: ["Product managers", "Senior designer", "UX manager", "Content writers", "AEM authors"],
    },
    {
      label: "Tools",
      items: ["Figma", "H&R Block's component library", "AEM", "Analytics and heatmaps"],
    },
  ],
  shipped: [
    "Small business services marquee library",
    "Tax Identity Shield page refresh",
    "ChatGPT and Gemini landing pages",
    "Fund Her Future winners announcement",
  ],
};

/** What I've done there, written as experience rather than as projects:
 *  each paragraph is a way I work, with the page that shows it. */
export const HRB_STORY: { lead: string; body: string }[] = [
  {
    lead: "Pages that change with the tax year.",
    body: "Small business owners need different things in January than in July. On the small business services page, H&R Block's front door for business owners, I mapped the year into five moments, each with its own deadline, audience, and message, and designed a library of marquees so the page always leads with the right one. Everything under the marquee stays put, which keeps the page strong for search and clean for testing.",
  },
  {
    lead: "Hierarchy set by behavior.",
    body: "Before I move anything, I look at how a page is actually used. On the page for Tax Identity Shield, H&R Block's identity protection service, the action people used most sat below the marquee while the marquee's own buttons went untouched. I moved it up, brought answers out of the FAQs and onto the page, and added clear pricing in wording legal approved.",
  },
  {
    lead: "Built to be reused.",
    body: "Writers own the copy and authors assemble pages in AEM, so I design inside the component library and add to it when a page needs something new. For Fund Her Future, H&R Block's grant program for women-owned businesses, I announced this year's winners on a new recipient component, built so next year's class drops straight in.",
  },
  {
    lead: "Explaining new things plainly.",
    body: "H&R Block now answers inside ChatGPT and Gemini through an MCP server, a way for AI assistants to use its tools. Almost nobody knows what that is, so I designed the landing pages that explain it in plain language and walk people through connecting, step by step.",
  },
];

export interface HrbStep {
  title: string;
  body: string;
  /** Who else is in the room. Empty when it's mine alone. */
  with: string;
  /** Steps I lead, which the flow diagram fills in. */
  lead: boolean;
}

export const HRB_PROCESS: HrbStep[] = [
  { title: "Kickoff", body: "The PM brings the brief: the goal, the audience, and the search and business context. I turn it into what the page has to do.", with: "PM", lead: false },
  { title: "Design", body: "I lead the design in Figma from the component library, detaching a component only where the layout needs it.", with: "", lead: true },
  { title: "Review", body: "I walk my senior designer and UX manager through the reasoning behind each decision, then refine.", with: "Senior designer, UX manager", lead: false },
  { title: "Sign-off", body: "A writer owns the copy and the PM takes the page through stakeholders and legal. I fold their changes back in.", with: "Writer, PM, legal", lead: false },
  { title: "Lockdown", body: "I lock the file, load every asset into AEM, and tell the authors it's ready to build.", with: "", lead: true },
  { title: "Build and test", body: "Authors build while I stay on call. Once it's live, testing decides what changes next.", with: "Authors, PM", lead: false },
];

export const HRB_SECTIONS = [
  { id: "role", label: "Role" },
  { id: "the-work", label: "The work" },
  { id: "process", label: "Process" },
];
