import ScrollReveal from "./ScrollReveal";

const bentoCells = [
  { src: "/aboutme-1.JPG",  className: "row-span-2" },
  { src: "/aboutme-2.jpeg", className: "" },
  { src: "/aboutme-4.jpeg", className: "" },
  { src: "/aboutme-3.jpeg", className: "col-span-2" },
];

export default function About() {
  return (
    <section id="about" className="px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-semibold text-[#FD8973] uppercase tracking-[0.2em]">
              02 — About
            </span>
            <div className="h-px flex-1 bg-[#DDD8D1]" />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Left: bio + LinkedIn */}
          <ScrollReveal delay={0.1} className="flex flex-col gap-8">
            <div>
              <h2 className="text-[clamp(32px,4.5vw,54px)] font-bold tracking-tight leading-[1.05] text-[#13181B] mb-8">
                A designer driven by<br />
                <span className="italic font-light text-[#7D8A93]">curiosity &amp; care.</span>
              </h2>
              <p className="text-[#7D8A93] text-lg leading-relaxed font-light">
                I&apos;m Noah — a product and UX/UI designer about to graduate and
                actively looking for my first full-time role. My work is driven by
                research and iteration, not just aesthetics. When I&apos;m not in
                Figma, I&apos;m usually at the gym, hiking, or with my two dogs.
              </p>
            </div>

            <a
              href="https://www.linkedin.com/in/noah-hadley/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-[#13181B] text-[#13181B] text-sm font-semibold px-6 py-4 rounded-full hover:bg-[#13181B] hover:text-[#F0EEEB] transition-colors w-fit"
            >
              Connect on LinkedIn
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
          </ScrollReveal>

          {/* Right: bento grid */}
          <ScrollReveal delay={0.22}>
            <div className="grid grid-cols-2 grid-rows-[144px_144px_160px] gap-3">
              {bentoCells.map((cell) => (
                <div
                  key={cell.src}
                  className={`rounded-2xl overflow-hidden ${cell.className}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cell.src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
