export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-10 border-t border-[#DDD8D1]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#13181B] text-sm tracking-tight">Noah Hadley</p>
          <p className="text-xs text-[#2D3436] mt-1 font-light">
            © {year} — Designed &amp; built with care.
          </p>
        </div>

        <p className="text-xs text-[#2D3436] italic font-light">
          Currently open to full-time roles — let&apos;s make something great.
        </p>
      </div>
    </footer>
  );
}
