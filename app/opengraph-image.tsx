import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Generated at build time. Node runtime so we can read the logo from /public.
export const runtime = "nodejs";

export const alt = "Noah Hadley — Product Designer & Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load a subset of Poppins (the &text param makes Google serve TTF, which Satori
// can use). Returns null on failure so the build never breaks over a font fetch.
async function loadFont(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Poppins:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const name = "Noah Hadley";
  const role = "PRODUCT DESIGNER & BUILDER";

  const [f500, f600] = await Promise.all([loadFont(500, name), loadFont(600, role)]);
  const fonts = [
    f500 && { name: "Poppins", data: f500, weight: 500 as const, style: "normal" as const },
    f600 && { name: "Poppins", data: f600, weight: 600 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 500 | 600; style: "normal" }[];
  const fontFamily = fonts.length ? "Poppins" : undefined;

  let logoSrc = "";
  try {
    const buf = readFileSync(join(process.cwd(), "public", "logo.png"));
    logoSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // logo optional
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          background: "#f4f4f5",
          padding: "80px",
          fontFamily,
        }}
      >
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} width={52} height={52} style={{ borderRadius: 12, marginBottom: 30 }} alt="" />
        ) : null}
        <div style={{ fontSize: 92, fontWeight: 500, color: "#111827", letterSpacing: "-2px", lineHeight: 1 }}>
          {name}
        </div>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#9CA3AF", letterSpacing: "3.4px", marginTop: 22 }}>
          {role}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
