import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section id="contact" className="px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-semibold text-[#FD8973] uppercase tracking-[0.2em]">
              03 — Contact
            </span>
            <div className="h-px flex-1 bg-[#DDD8D1]" />
          </div>
        </ScrollReveal>

        <div className="max-w-2xl">
          <ScrollReveal delay={0.1}>
            <h2 className="text-[clamp(40px,6.5vw,80px)] font-bold tracking-tight leading-[0.95] text-[#13181B] mb-8 contact-heading">
              Let&apos;s work<br />
              <span className="italic font-extrabold text-[#FD8973]">together.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-[#2D3436] text-lg leading-relaxed font-light mb-12">
              I&apos;m currently looking for full-time opportunities. My inbox is
              always open — whether you have a question, a project in mind, or
              just want to say hello.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:nhadley0517@gmail.com"
                className="group inline-flex items-center gap-3 bg-[#FD8973] text-white text-sm font-semibold px-7 py-4 rounded-full hover:bg-[#13181B] transition-colors"
              >
                Say hello
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </a>

              <a
                href="https://www.linkedin.com/in/noah-hadley/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 border border-[#13181B] text-[#13181B] text-sm font-semibold px-7 py-4 rounded-full hover:bg-[#13181B] hover:text-[#F4F4F5] transition-colors"
              >
                LinkedIn
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  ↗
                </span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
