export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ background: "#f4f4f5", borderTop: "1px solid rgba(0,0,0,0.07)" }}
      className="px-6 md:px-10 lg:px-16 py-10"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p style={{ fontWeight: 500, color: "#111827", fontSize: "14px", letterSpacing: "-0.02em" }}>
            Noah Hadley
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
            © {year} — Designed &amp; built by me!
          </p>
        </div>

        <p style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic" }}>
          Open to full-time roles — let&apos;s make something great.
        </p>
      </div>
    </footer>
  );
}
