"use client";

import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Sandbox from "@/components/Sandbox";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import { BentoOverlayProvider } from "@/components/BentoOverlay";
import { OVERLAY_REGISTRY } from "@/lib/overlayRegistry";

export default function Home() {
  return (
    <BentoOverlayProvider registry={OVERLAY_REGISTRY}>
      <div className="page-row">
        <SideNav />
        <main className="site-main" style={{ background: "#f4f4f5" }}>
          <Hero />
          <Projects />
          <Experience />
          <Sandbox />
        </main>
      </div>
      <Footer />
    </BentoOverlayProvider>
  );
}
