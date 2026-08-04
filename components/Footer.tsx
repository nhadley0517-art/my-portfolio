import FooterArt from "@/components/FooterArt";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#f4f4f5" }} className="footer-inset pt-3">
      {/* One consolidated pill instead of a spread-out row — everything the
          footer needs to say, sitting directly on the art itself rather
          than as a separate "section" stacked under it. */}
      <FooterArt>
        <div className="footer-pill">
          <span className="footer-pill-name">Noah Hadley</span>
          <span className="footer-pill-copy">© {year} Designed &amp; built by me!</span>
          <span className="footer-pill-roles">Open to full-time roles.</span>
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
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 18px;
          row-gap: 8px;
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
        .footer-pill-copy,
        .footer-pill-roles {
          font-size: 12px;
          color: #9CA3AF;
        }
        .footer-pill-contact {
          font-size: 12px;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-pill-contact:hover { color: #111827; }
      `}</style>
    </footer>
  );
}
