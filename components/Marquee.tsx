const ITEMS = [
  "UX Design",
  "Product Design",
  "User Research",
  "Interaction Design",
  "Wireframing",
  "Prototyping",
  "Visual Design",
  "Design Systems",
  "Usability Testing",
  "Information Architecture",
];

// \u00A0 = non-breaking space — guaranteed not to collapse in the browser.
// Three on each side of · gives generous breathing room between items.
const SEP = "\u00A0\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0\u00A0";
const SEGMENT = ITEMS.join(SEP) + SEP;

// 3 repeats per span — each span is wider than any viewport.
// Two identical spans fill the track; animation shifts -50% (one span) for a seamless loop.
const CONTENT = SEGMENT.repeat(3);

export default function Marquee() {
  return (
    <div className="border-t border-b border-[#DDD8D1] py-7 overflow-hidden">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 75s linear infinite" }}
      >
        <span
          className="text-[#13181B]"
          style={{ fontSize: "1.1rem", fontWeight: 600 }}
        >
          {CONTENT}
        </span>
        <span
          className="text-[#13181B]"
          style={{ fontSize: "1.1rem", fontWeight: 600 }}
          aria-hidden="true"
        >
          {CONTENT}
        </span>
      </div>
    </div>
  );
}
