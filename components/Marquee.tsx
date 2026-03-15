// Skills marquee — slow, elegant pill strip.
// Two-span / translateX(-50%) seamless loop, 60s speed.

const SYMBOLS = ["✦", "○", "◆", "▸"] as const;

const SKILLS = [
  "UX Design",
  "Product Design",
  "Interaction Design",
  "Prototyping",
  "User Research",
  "Figma",
  "Wireframing",
  "Visual Design",
  "Branding",
  "Typography",
  "Design Thinking",
  "Mobile Design",
  "Web Design",
  "Claude Code",
];

// Build the pill items with symbol prefix and style variant
const PILLS = SKILLS.map((skill, i) => ({
  label: skill,
  symbol: SYMBOLS[i % SYMBOLS.length],
  // Every 3rd item (0-indexed: 2, 5, 8, 11) gets coral accent
  coral: i % 3 === 2,
}));

// Repeat 3 times per span so the span is always wider than the viewport
const SEGMENT = [...PILLS, ...PILLS, ...PILLS];

function Pill({ label, symbol, coral }: typeof PILLS[0]) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        flexShrink: 0,
        whiteSpace: "nowrap",
        padding: "8px 20px",
        borderRadius: "40px",
        border: coral
          ? "1px solid rgba(253,137,115,0.3)"
          : "1px solid rgba(19,24,27,0.1)",
        background: coral
          ? "rgba(253,137,115,0.1)"
          : "rgba(19,24,27,0.06)",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: coral ? "#FD8973" : "#13181B",
      }}
    >
      <span style={{ fontSize: "10px", opacity: 0.7 }}>{symbol}</span>
      {label}
    </span>
  );
}

// Gap between pills: 12px. Trailing paddingRight: 12px for seamless span join.
const spanStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  paddingRight: "12px",
  flexShrink: 0,
  alignItems: "center",
};

export default function Marquee() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#F7F5F0",
        padding: "28px 0",
        borderTop: "1px solid #E5E0D8",
        borderBottom: "1px solid #E5E0D8",
      }}
    >
      <div
        className="flex marquee-track"
        style={{ animation: "var(--marquee-duration, 90s) marquee linear infinite", width: "max-content", alignItems: "center" }}
      >
        <span style={spanStyle}>
          {SEGMENT.map((pill, i) => (
            <Pill key={i} {...pill} />
          ))}
        </span>
        <span style={spanStyle} aria-hidden="true">
          {SEGMENT.map((pill, i) => (
            <Pill key={i} {...pill} />
          ))}
        </span>
      </div>
    </div>
  );
}
