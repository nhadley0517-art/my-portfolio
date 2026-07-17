import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Bento from "@/components/Bento";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ background: "#f4f4f5" }}>
        <Hero />
        <Projects />
        <Bento />
      </main>
      <Footer />
    </>
  );
}
