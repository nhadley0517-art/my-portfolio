/* H&R Block: not a single case study but a picture of the job. What I do,
 * how a project moves from kickoff to a live page, and four recent projects
 * as evidence.
 *
 * Kept deliberately general: no internal numbers, test results, unapproved
 * claims, file names or unreleased detail. Each project is described by the
 * problem and the design move, with a diagram instead of screenshots. */

export const HRB_ACCENT = "#00B85C";

export const HRB = {
  slug: "hr-block",
  title: "H&R Block",
  oneLiner: "I lead design on pages across hrblock.com, from the kickoff brief to a locked file in AEM, and stay with them after they ship.",
  meta: [
    { label: "Role", value: "Product Designer" },
    { label: "Works with", value: "Senior designer, UX manager, content writers, PMs, AEM authors" },
    { label: "Tools", value: "Figma, the H&R Block component library, AEM" },
    { label: "Recent work", value: "Four pages led and shipped" },
  ],
  intro: [
    "Most of my work is modernizing pages that already do real business: a small business hub, product pages, campaign launches, and new ways for people to reach H&R Block. The job is to make each one clearer and more useful, and to keep it easy to update through tax season and the rest of the year.",
    "I take a project from kickoff and lead the design. I work inside the company's component library, and I know when to step outside it: sometimes I detach a component to get a layout right, while keeping everything buildable by the authors who assemble pages in AEM.",
  ],
};

export interface HrbStep {
  title: string;
  body: string;
  with: string[];
}

/** How a project moves. "Me" is highlighted in the diagram. */
export const HRB_PROCESS: HrbStep[] = [
  { title: "Kickoff", body: "The PM brings the brief: the goal, the audience, and the search and business context behind the page.", with: ["PM"] },
  { title: "Design", body: "I lead the design in Figma, built from the component library, detaching only where the layout needs it.", with: ["Me"] },
  { title: "Review", body: "I tag my senior designer and UX manager in the file and explain the reasoning behind each decision, then refine on their feedback.", with: ["Senior designer", "UX manager"] },
  { title: "Content and sign-off", body: "A content writer owns the copy. The PM takes the page through stakeholders and legal, and I fold their changes back in.", with: ["Content writer", "PM", "Legal"] },
  { title: "Lockdown", body: "I lock the file, load every creative asset into AEM, and let the authors know it's ready to build.", with: ["Me", "Authors"] },
  { title: "Build and beyond", body: "Authors build the page and I stay on call for anything they need. Once it's live, testing tells us what to change next.", with: ["Authors", "PM"] },
];

export interface HrbPractice {
  id: string;
  title: string;
  body: string;
}

export const HRB_PRACTICES: HrbPractice[] = [
  { id: "ux", title: "UX and interaction design", body: "Hierarchy, flows and calls to action set by what people actually do on a page, not by what's loudest." },
  { id: "library", title: "Component library", body: "I design inside H&R Block's library and detach a component only when a layout calls for it, always within what authors can build." },
  { id: "ab", title: "Designing for testing", body: "Pages built with a steady structure and swappable pieces, so variants can run cleanly and the winner can become the default." },
  { id: "lockdown", title: "File lockdowns and handoff", body: "Clean, locked files with every asset in AEM and the authors told it's ready, then I stay on call while they build." },
  { id: "authors", title: "Writers and authors", body: "Copy comes from a content writer and pages are built by authors, so I design for both: room for real copy, and modules authors can assemble." },
  { id: "pm", title: "PMs, stakeholders, legal", body: "PMs carry the work to stakeholders and legal. I give them the reasoning behind every decision, so the design holds up in those rooms." },
];

export type HrbDiagram = "seasons" | "hierarchy" | "assistant" | "campaign";

export interface HrbProject {
  title: string;
  kind: string;
  /** The one-line idea of the project. */
  headline: string;
  body: string;
  practices: string[];
  diagram: HrbDiagram;
  status: string;
}

/** Strongest first. */
export const HRB_PROJECTS: HrbProject[] = [
  {
    title: "Small business hub",
    kind: "Hero system",
    headline: "One page, two jobs",
    body: "The small business services page had to win seasonal tax intent and also show everything H&R Block does for a business all year. I designed a hero system instead of a single hero: a library of seasonal heroes on a shared message framework, so the page leads with the right thing in January and in July. The rest of the page stays steady, which keeps it strong for search and clean for testing.",
    practices: ["ux", "library", "ab"],
    diagram: "seasons",
    status: "Shipped",
  },
  {
    title: "Product page refresh",
    kind: "Live page redesign",
    headline: "Let behavior set the hierarchy",
    body: "A protection product's page had its most-used action sitting below the hero, while the buttons in the hero went mostly untouched, and people kept digging for answers in the FAQs. I moved that action into the hero, brought answers up the page, and added clear, legal-approved pricing language, designed equally for mobile and desktop.",
    practices: ["ux", "pm"],
    diagram: "hierarchy",
    status: "Live",
  },
  {
    title: "A new front door",
    kind: "AI assistants",
    headline: "Meeting people where they start",
    body: "More people now start a tax question inside an AI assistant instead of on a website. I designed landing experiences for that path, so people can get help, find a pro, or move toward filing in a few steps, without ever needing to start from the homepage.",
    practices: ["ux", "pm"],
    diagram: "assistant",
    status: "Shipped",
  },
  {
    title: "Grant winners",
    kind: "Campaign update",
    headline: "Celebrate the winners, keep the page working",
    body: "For a small business grant program, I announced this year's winners: a refreshed hero, a new winners section, and a reordered page, plus a new recipient component built so future classes drop straight in.",
    practices: ["library", "authors", "lockdown"],
    diagram: "campaign",
    status: "Shipped",
  },
];

export const HRB_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "process", label: "How a project moves" },
  { id: "practice", label: "What I do" },
  { id: "work", label: "Recent work" },
];
