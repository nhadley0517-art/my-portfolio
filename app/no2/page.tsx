import type { Metadata } from "next";
import No2Content from "./No2Content";

export const metadata: Metadata = {
  title: "No. 2 — Noah Hadley",
  description:
    "A gut health tracking app built solo in two weeks — design, code, backend, and brand.",
};

export default function No2Page() {
  return <No2Content />;
}
