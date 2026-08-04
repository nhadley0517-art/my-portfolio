"use client";

import ProjectList from "@/components/ProjectList";
import SelectedWork from "@/components/SelectedWork";
import { OTHER_WORK } from "@/lib/workData";

export default function Projects() {
  return (
    <section id="work" className="site-section">
      <div className="site-container" style={{ display: "flex", flexDirection: "column", gap: "108px" }}>
        <SelectedWork />
        <ProjectList label="Other projects" rows={OTHER_WORK} />
      </div>
    </section>
  );
}
