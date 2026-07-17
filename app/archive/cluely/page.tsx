import type { Metadata } from "next";
import ArchiveProjectPage from "@/components/ArchiveProjectPage";
import { getArchiveProject } from "@/lib/archiveProjectsData";

const project = getArchiveProject("cluely")!;

export const metadata: Metadata = {
  title: `${project.title} — Noah Hadley`,
  description: project.oneLiner,
};

export default function CluelyPage() {
  return <ArchiveProjectPage project={project} />;
}
