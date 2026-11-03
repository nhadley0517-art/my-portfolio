"use client";

import CraftHome from "@/components/craft/CraftHome";
import { BentoOverlayProvider } from "@/components/BentoOverlay";
import { OVERLAY_REGISTRY } from "@/lib/overlayRegistry";

export default function Home() {
  return (
    <BentoOverlayProvider registry={OVERLAY_REGISTRY}>
      <CraftHome />
    </BentoOverlayProvider>
  );
}
