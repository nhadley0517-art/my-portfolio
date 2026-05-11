import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ background: "#f4f4f5" }}>
        <Hero />
        <Projects />
        <About />
      </main>
      <Footer />
    </>
  );
}
