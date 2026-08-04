import type { Metadata } from "next";
import WritingProcessContent from "./WritingProcessContent";

export const metadata: Metadata = {
  title: "Writing Process Redesign — Noah Hadley",
  description:
    "UX case study: redesigning GCU's student writing resource from a single overwhelming page into a guided, step-by-step learning experience.",
};

export default function WritingProcessPage() {
  return <WritingProcessContent />;
}
