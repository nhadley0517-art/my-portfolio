interface Internship {
  id: string;
  company: string;
  logo: string;
  role: string;
  dates: string;
  points: string[];
}

// NOTE: draft copy pulled from earlier placeholder blurbs — Noah, please correct/expand these.
const INTERNSHIPS: Internship[] = [
  {
    id: "gce",
    company: "Grand Canyon Education",
    logo: "/gce-logo.svg",
    role: "Product Design Intern",
    dates: "Oct 2024 – Apr 2026",
    points: [
      "Designed for a student platform used by tens of thousands of learners.",
      "Led the redesign of GCU's writing resource, taking it from a single dense page to an 8-stage guided experience.",
      "Collaborated daily with developers and PMs to ship features end-to-end, from wireframe to release.",
      "Worked within GCU's UI and accessibility standards across every deliverable.",
    ],
  },
  {
    id: "canyon-creative",
    company: "Canyon Creative",
    logo: "/canyon-creative-logo.svg",
    role: "Product Design Intern",
    dates: "Dec 2025 – Apr 2026",
    points: [
      "Designed web and product experiences for a student-run agency serving national clients.",
      "Collaborated with PMs, social, graphic design, and motion teams from concept to delivery.",
      "Built and maintained design systems used across a growing set of projects.",
      "Worked directly with clients to turn loose briefs into shipped interfaces.",
    ],
  },
];

/** Minimal internship cards — logo top-left, role/dates, every bullet point
 *  shown directly on the card. Not interactive: this is all the info, no
 *  click-through needed. */
export default function ExperienceCards() {
  return (
    <div className="exp-cards">
      {INTERNSHIPS.map((i) => (
        <div key={i.id} className="exp-mini-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="exp-mini-logo" src={i.logo} alt={i.company} />
          <p className="exp-mini-role">{i.role}</p>
          <h3 className="exp-mini-company">{i.company}</h3>
          <p className="exp-mini-dates">{i.dates}</p>
          <ul className="exp-mini-points">
            {i.points.map((p) => (
              <li key={p}>
                <span className="exp-mini-dot" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <style>{`
        /* Allowed to run wider than the text column above it — more room per
           card means less wrapping, especially for the longer Canyon
           Creative bullets. */
        .exp-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: calc(100% + 200px);
        }
        @media (max-width: 1300px) {
          .exp-cards { width: 100%; }
        }
        .exp-mini-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 18px 28px 28px;
          border-radius: 4px;
          background: #FAFAFA;
        }
        .exp-mini-logo {
          width: 84px;
          height: 84px;
          object-fit: contain;
          margin-bottom: 12px;
          border-radius: 4px;
        }
        .exp-mini-role {
          font-size: 13px;
          font-weight: 400;
          color: #6B7280;
          margin: 0 0 6px;
        }
        .exp-mini-company {
          font-size: 17px;
          font-weight: 500;
          color: #13181B;
          letter-spacing: -0.01em;
          margin: 0 0 4px;
        }
        .exp-mini-dates {
          font-size: 12px;
          font-weight: 300;
          color: #A8ABB2;
          margin: 0 0 16px;
        }
        .exp-mini-points {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .exp-mini-points li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 14px;
          font-weight: 300;
          color: #6B7280;
          line-height: 1.55;
        }
        .exp-mini-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 7px;
          flex-shrink: 0;
          background: #9CA3AF;
        }
        @media (max-width: 700px) {
          .exp-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
