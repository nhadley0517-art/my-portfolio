import ExperienceCards from "@/components/ExperienceCards";

export default function Experience() {
  return (
    <section id="experience" className="site-section">
      <div className="site-container">
        <p className="exp-section-label">Experience</p>
        <ExperienceCards />
      </div>

      <style>{`
        .exp-section-label {
          font-size: 16px;
          font-weight: 300;
          color: #13181B;
          margin: 0 0 28px;
        }
      `}</style>
    </section>
  );
}
