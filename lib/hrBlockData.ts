/* H&R Block: not a single case study but a library of the work.
 *
 * Structured so the page fills in as Noah supplies details. Anything still
 * unknown is left as `null` (or a `draft: true` item) and the page renders
 * it as an intentional "coming soon" state instead of guessing.
 *
 * TODO(Noah): fill in each `null`, then flip `draft` off as items get real
 * copy and screens. Practices and projects can be added, removed, or
 * reordered freely; projects link to practices by id. */

export interface HrbPractice {
  id: string;
  title: string;
  /** One or two sentences in Noah's words on how he does this at H&R Block. */
  body: string | null;
}

export interface HrbPartner {
  role: string;
  /** What working together looks like. */
  body: string | null;
  /** Optional names, if Noah wants to credit people. */
  people?: string[];
}

export interface HrbProject {
  title: string;
  /** Practice ids this project shows off; drives the library filter. */
  practices: string[];
  summary: string | null;
  /** Screenshot or video for the card. */
  media?: { type: "image" | "video"; src: string };
  /** Year or quarter, e.g. "2026". */
  when?: string;
  draft?: boolean;
}

export const HRB_ACCENT = "#00B85C";

export const HRB = {
  slug: "hr-block",
  title: "H&R Block",
  oneLiner: "What I do as a product designer at H&R Block, who I do it with, and a library of the work.",
  meta: [
    { label: "Role", value: "Product Designer" },
    { label: "Team", value: null as string | null }, // TODO(Noah): team / product area
    { label: "Since", value: null as string | null }, // TODO(Noah): start date
    { label: "Focus", value: null as string | null }, // TODO(Noah): e.g. "Web and mobile tax filing"
  ],
  /** TODO(Noah): a short intro to the role, the product, and the team. */
  intro: [] as string[],
  practices: [
    { id: "ux", title: "UX and interaction design", body: null },
    { id: "library", title: "Component library", body: null },
    { id: "ab", title: "A/B testing", body: null },
    { id: "lockdown", title: "File lockdowns and handoff", body: null },
    { id: "authors", title: "Working with content authors", body: null },
    { id: "pm", title: "Partnering with product managers", body: null },
  ] as HrbPractice[],
  partners: [
    { role: "Product managers", body: null },
    { role: "Content authors", body: null },
    { role: "Engineers", body: null },
    { role: "Design system team", body: null },
  ] as HrbPartner[],
  projects: [
    { title: "Project title", practices: ["ux", "ab"], summary: null, draft: true },
    { title: "Project title", practices: ["library"], summary: null, draft: true },
    { title: "Project title", practices: ["ux", "authors"], summary: null, draft: true },
    { title: "Project title", practices: ["lockdown", "pm"], summary: null, draft: true },
    { title: "Project title", practices: ["ab", "pm"], summary: null, draft: true },
    { title: "Project title", practices: ["library", "lockdown"], summary: null, draft: true },
  ] as HrbProject[],
};

export const HRB_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "What I do" },
  { id: "people", label: "Who I work with" },
  { id: "library", label: "Library" },
];
