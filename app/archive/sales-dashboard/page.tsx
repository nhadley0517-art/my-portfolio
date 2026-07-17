import type { Metadata } from "next";
import ArchiveProjectPage from "@/components/ArchiveProjectPage";
import { getArchiveProject } from "@/lib/archiveProjectsData";

const project = getArchiveProject("sales-dashboard")!;

export const metadata: Metadata = {
  title: `${project.title} — Noah Hadley`,
  description: project.oneLiner,
};

export default function SalesDashboardPage() {
  return <ArchiveProjectPage project={project} />;
}
