import type { Metadata } from "next";
import CoveContent from "./CoveContent";

export const metadata: Metadata = {
  title: "Cove — Noah Hadley",
  description:
    "A field service CRM built from zero for service businesses — scheduling, payments, client management, and embedded AI. Designed and built as the founding product designer.",
};

export default function CovePage() {
  return <CoveContent />;
}
