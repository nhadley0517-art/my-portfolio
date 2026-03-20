import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Noah Hadley — Product Designer",
  description:
    "Product designer and builder. New grad. Open to full-time roles May 2026.",
  openGraph: {
    images: [{ url: "/univo_thumb.png", width: 1200, height: 630 }],
    title: "Noah Hadley — Product Designer",
    description: "Product designer and builder. New grad. Open to full-time roles May 2026.",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/univo_thumb.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
