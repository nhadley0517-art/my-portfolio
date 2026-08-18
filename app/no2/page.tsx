import type { Metadata } from "next";
import No2Content from "./No2Content";
import { DesktopOverlayRedirect } from "@/components/CaseStudyShell";

export const metadata: Metadata = {
  title: "No. 2 — Noah Hadley",
  description:
    "A gut health app, live on the App Store — designed and built solo, from screen to backend.",
};

export default function No2Page() {
  return (
    <>
      <DesktopOverlayRedirect slug="no2" />
      <No2Content />
    </>
  );
}
