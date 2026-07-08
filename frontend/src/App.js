import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { content } from "@/i18n";
import { Navbar } from "@/components/gesoi/Navbar";
import { Hero } from "@/components/gesoi/Hero";
import { MarqueeStrip } from "@/components/gesoi/MarqueeStrip";
import { Problem } from "@/components/gesoi/Problem";
import { Ecosystem } from "@/components/gesoi/Ecosystem";
import { Pillars } from "@/components/gesoi/Pillars";
import { Programs } from "@/components/gesoi/Programs";
import { Roadmap } from "@/components/gesoi/Roadmap";
import { Governance } from "@/components/gesoi/Governance";
import { JoinCTA } from "@/components/gesoi/JoinCTA";
import { Footer } from "@/components/gesoi/Footer";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const Landing = () => {
  const [lang, setLang] = useState("id");
  const t = content[lang];

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="App bg-[#F9F9F7]">
      <Navbar t={t} lang={lang} setLang={setLang} />
      <Hero t={t} />
      <MarqueeStrip items={t.marquee} />
      <Problem t={t.problem} />
      <Ecosystem t={t.ecosystem} />
      <Pillars t={t.pillars} />
      <Programs t={t.programs} />
      <Roadmap t={t.roadmap} />
      <Governance t={t.governance} />
      <JoinCTA t={t.join} />
      <Footer t={t} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
