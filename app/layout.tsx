import type { Metadata } from "next";
import { Poppins, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.noahhadley.com"),
  title: "Noah Hadley — Product Designer",
  description:
    "Product designer and builder. New grad. Open to full-time roles May 2026.",
  openGraph: {
    type: "website",
    url: "https://www.noahhadley.com",
    siteName: "Noah Hadley",
    title: "Noah Hadley — Product Designer",
    description: "Product designer and builder. New grad. Open to full-time roles May 2026.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noah Hadley — Product Designer",
    description: "Product designer and builder. New grad. Open to full-time roles May 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
    </html>
  );
}
