import type { OverlayRegistry } from "@/components/BentoOverlay";
import ArchiveProjectPage from "@/components/ArchiveProjectPage";
import { ARCHIVE_PROJECTS } from "@/lib/archiveProjectsData";
import { CaseStudySidePanel } from "@/components/CaseStudyShell";
import No2Content, { NO2_SECTIONS, ACCENT as NO2_ACCENT } from "@/app/no2/No2Content";
import CoveContent, { COVE_SECTIONS, ACCENT as COVE_ACCENT } from "@/app/cove/CoveContent";
import WritingProcessContent, { WP_SECTIONS, ACCENT as WP_ACCENT } from "@/app/writingprocess/WritingProcessContent";
import WritingPost from "@/components/WritingPost";
import WritingIndex from "@/components/WritingIndex";
import { POSTS } from "@/content/posts";

// Driveway Auto Spa is now a featured case study alongside No.2/Cove/Writing
// Process, so it gets the same wide shell + section nav treatment instead of
// the plainer "card" variant every other archive project uses.
const DRIVEWAY_SLUG = "sales-dashboard";
const DRIVEWAY_ACCENT = "#FD8973";
const DRIVEWAY_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "what-i-made", label: "What I Made" },
  { id: "live", label: "Live" },
];

/** Everything on the home page that opens into an overlay and deserves its
 *  own URL. Defined once at module scope so the provider's identity checks
 *  stay stable, and so a deep link (?p=cove) can rebuild the right content
 *  on first load without the component that normally opens it being involved.
 *
 *  Ephemeral things — dome posters, experience cards — deliberately stay out
 *  of here: they open through `open()` and leave the URL untouched. */
export const OVERLAY_REGISTRY: OverlayRegistry = {
  no2: {
    variant: "wide",
    route: "/no2",
    render: ({ close }) => <No2Content variant="overlay" onClose={close} />,
    sidePanel: ({ fullscreen }) => <CaseStudySidePanel sections={NO2_SECTIONS} accentColor={NO2_ACCENT} fullscreen={fullscreen} />,
  },
  cove: {
    variant: "wide",
    route: "/cove",
    render: ({ close }) => <CoveContent variant="overlay" onClose={close} />,
    sidePanel: ({ fullscreen }) => <CaseStudySidePanel sections={COVE_SECTIONS} accentColor={COVE_ACCENT} fullscreen={fullscreen} />,
  },
  "writing-process": {
    variant: "wide",
    route: "/writingprocess",
    render: ({ close }) => <WritingProcessContent variant="overlay" onClose={close} />,
    sidePanel: ({ fullscreen }) => <CaseStudySidePanel sections={WP_SECTIONS} accentColor={WP_ACCENT} fullscreen={fullscreen} />,
  },
  ...Object.fromEntries(
    ARCHIVE_PROJECTS.map((project) => [
      project.slug,
      {
        variant: "card" as const,
        render: ({ close }: { close: () => void }) => (
          <ArchiveProjectPage project={project} variant="overlay" onClose={close} />
        ),
      },
    ])
  ),
  // Overrides the generic "card" entry the spread above just generated for
  // this same slug — object literals keep the last value for a repeated key.
  [DRIVEWAY_SLUG]: {
    variant: "wide",
    render: ({ close }) => (
      <ArchiveProjectPage
        project={ARCHIVE_PROJECTS.find((p) => p.slug === DRIVEWAY_SLUG)!}
        variant="overlay"
        onClose={close}
      />
    ),
    sidePanel: ({ fullscreen }) => <CaseStudySidePanel sections={DRIVEWAY_SECTIONS} accentColor={DRIVEWAY_ACCENT} fullscreen={fullscreen} />,
  },
  writing: {
    variant: "card",
    sound: "flip",
    render: () => <WritingIndex />,
  },
  // Namespaced so a post can never collide with a project slug, and given
  // the "page" cue so opening something to read sounds different from
  // opening something to look at.
  ...Object.fromEntries(
    POSTS.map((post) => [
      `writing/${post.slug}`,
      {
        variant: "card" as const,
        sound: "flip" as const,
        render: ({ close }: { close: () => void }) => <WritingPost post={post} onClose={close} />,
      },
    ])
  ),
};
