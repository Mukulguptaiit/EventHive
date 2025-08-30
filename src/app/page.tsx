import { Navbar } from "@/components/home/Navbar";
import Home from "@/components/home/home";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Home />
    </main>
  );
}
