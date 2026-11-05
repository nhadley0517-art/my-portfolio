import type { Metadata } from "next";
import HRBlockContent from "@/components/HRBlockContent";
import { OverlayRedirect } from "@/components/CaseStudyShell";

export const metadata: Metadata = {
  title: "H&R Block — Noah Hadley",
  description: "What I do as a product designer at H&R Block, who I do it with, and a library of the work.",
};

export default function HRBlockPage() {
  return (
    <>
      <OverlayRedirect slug="hr-block" />
      <HRBlockContent />
    </>
  );
}
