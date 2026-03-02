import ScrollReveal from "./ScrollReveal";
import ProjectCard from "./ProjectCard";

const projects = [
  {
    slug: "/writingprocess",
    thumbnail: "/wp_thumb.png?v=2",
    title: "Writing Process Redesign",
    year: "2026",
    tags: ["UX Design", "Internship"],
    description:
      "Redesigned GCU's student writing resource from a single overwhelming page into a guided, step-by-step learning experience.",
    mobileThumbnail: "/wp_thumb_mobile.png",
  },
  {
    slug: "/univo",
    thumbnail: "/univo_thumb.png",
    title: "Univo",
    year: "2025",
    tags: ["UX Design", "Mobile", "Student Project"],
    description:
      "A mobile app concept that translates complex medical records into plain-language summaries patients can actually understand.",
  },
  {
    slug: "/relay",
    thumbnail: "/relay_thumb.png",
    title: "Relay",
    year: "2025",
    tags: ["UX Design", "Dashboard", "Student Project"],
    description:
      "A mission coordination dashboard for field teams operating in disaster zones with no connectivity.",
  },
  {
    slug: "/homify",
    thumbnail: "/homify_thumb.png",
    title: "Homify",
    year: "2024",
    tags: ["UX Design", "Student Project"],
    description:
      "A smart home dashboard redesigned from scratch for a cleaner, more intuitive everyday experience.",
  },
];

export default function Projects() {
  return (
    <section id="work" className="px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-semibold text-[#FD8973] uppercase tracking-[0.2em]">
              01 — Work
            </span>
            <div className="h-px flex-1 bg-[#DDD8D1]" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-[clamp(32px,4.5vw,54px)] font-bold tracking-tight leading-[1.05] text-[#13181B] mb-14">
            Selected projects.
          </h2>
        </ScrollReveal>

        {/* Card grid — layout unchanged, cards stagger in via ProjectCard */}
        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} {...project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
