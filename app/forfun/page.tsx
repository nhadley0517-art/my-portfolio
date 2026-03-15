import Nav from "@/components/Nav";
import ForFun from "@/components/ForFun";
import Footer from "@/components/Footer";

export const metadata = {
  title: "For Fun — Noah Hadley",
  description: "Posters and layouts made just for fun.",
};

export default function ForFunPage() {
  return (
    <>
      <Nav />
      <main style={{ background: "#0a0a0a" }}>
        <ForFun />
      </main>
      <Footer />
    </>
  );
}
