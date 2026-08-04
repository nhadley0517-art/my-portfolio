import FooterArt from "@/components/FooterArt";

export default function Footer() {
  return (
    <footer style={{ background: "#f4f4f5" }} className="footer-inset pt-3">
      {/* Minimal — just enough to say who this is and how to reach him,
          sitting directly on the art itself rather than as a separate
          "section" stacked under it. */}
      <FooterArt>
        <div className="footer-pill">
          <span className="footer-pill-name">Noah Hadley</span>
          <a
            href="mailto:nhadley0517@gmail.com"
            className="footer-pill-contact"
          >
            Get in touch →
          </a>
        </div>
      </FooterArt>

      <style>{`
        .footer-pill {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 14px 22px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .footer-pill-name {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
          letter-spacing: -0.02em;
        }
        .footer-pill-contact {
          font-size: 12px;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-pill-contact:hover { color: #111827; }

        @media (max-width: 700px) {
          .footer-pill { gap: 12px; padding: 8px 14px; }
          .footer-pill-name { font-size: 12px; }
          .footer-pill-contact { font-size: 11px; }
        }
      `}</style>
    </footer>
  );
}
