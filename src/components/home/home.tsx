"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import Hero from "./hero";
import EventCategories from "./EventCategories";
import EventsSection from "./EventsSection";

export default function Home() {
  const [location, setLocation] = useState("Ahmedabad");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navbar />
      <Hero location={location} setLocation={setLocation} />
      <EventsSection location={location} />
      <EventCategories />
      <Footer />
    </div>
  );
}
