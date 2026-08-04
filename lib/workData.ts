import type { ProjectRow } from "@/components/ProjectList";

/** The three long-form case studies. Years come from the case studies
 *  themselves, so they're safe to show. */
export const SELECTED_WORK: ProjectRow[] = [
  {
    slug: "no2",
    year: "2026",
    title: "No. 2",
    category: "iOS app",
    thumb: { type: "iframe", src: "/no2-thumb.html" },
  },
  {
    slug: "cove",
    year: "2026",
    title: "Cove",
    category: "field service CRM",
    thumb: { type: "video", src: "/dashboard-demo.mp4" },
  },
  {
    slug: "writing-process",
    year: "2025",
    title: "Writing Process Redesign",
    category: "UX redesign",
    thumb: { type: "image", src: "/wp_thumb.png" },
  },
];

/** Shorter pieces. Deliberately no `year` — the underlying data records
 *  durations ("3 days", "February–April") but not the years they happened,
 *  and a guessed date on a résumé-adjacent list is worse than none. */
export const OTHER_WORK: ProjectRow[] = [
  {
    slug: "sales-dashboard",
    title: "Driveway Auto Spa",
    category: "sales dashboard",
    thumb: { type: "video", src: "/dwautospademo.mp4" },
    live: true,
  },
  {
    slug: "miah-families",
    title: "Miah Families",
    category: "client build",
    thumb: { type: "image", src: "/miah-hero.png" },
    live: true,
  },
  {
    slug: "actively-ai",
    title: "Actively AI",
    category: "launch sprint",
    thumb: { type: "image", src: "/actively-hero.png" },
    live: true,
  },
  {
    slug: "real",
    title: "Real",
    category: "cold outreach",
    thumb: { type: "image", src: "/real-thumb.jpg" },
  },
  {
    slug: "univo",
    title: "Univo",
    category: "concept",
    thumb: { type: "image", src: "/univo_thumb.png" },
  },
];
