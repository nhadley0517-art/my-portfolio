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
    sidePanel: () => <CaseStudySidePanel sections={NO2_SECTIONS} accentColor={NO2_ACCENT} />,
  },
  cove: {
    variant: "wide",
    route: "/cove",
    render: ({ close }) => <CoveContent variant="overlay" onClose={close} />,
    sidePanel: () => <CaseStudySidePanel sections={COVE_SECTIONS} accentColor={COVE_ACCENT} />,
  },
  "writing-process": {
    variant: "wide",
    route: "/writingprocess",
    render: ({ close }) => <WritingProcessContent variant="overlay" onClose={close} />,
    sidePanel: () => <CaseStudySidePanel sections={WP_SECTIONS} accentColor={WP_ACCENT} />,
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
  writing: {
    variant: "card",
    sound: "page",
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
        sound: "page" as const,
        render: ({ close }: { close: () => void }) => <WritingPost post={post} onClose={close} />,
      },
    ])
  ),
};
