import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { content, sharedDefaults } from "@/i18n";
import { deepMerge } from "@/lib/merge";
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
import { News } from "@/components/gesoi/News";
import { VideoFeature } from "@/components/gesoi/VideoFeature";
import { Publications } from "@/components/gesoi/Publications";
import { CookieConsent } from "@/components/gesoi/CookieConsent";
import { Footer } from "@/components/gesoi/Footer";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const defaults = { ...content, shared: sharedDefaults };

const Landing = () => {
  const [lang, setLang] = useState("id");
  const [overrides, setOverrides] = useState(null);

  useEffect(() => {
    axios.get(`${API}/content`).then((r) => setOverrides(r.data || {})).catch(() => setOverrides({}));
  }, []);

  const merged = useMemo(() => deepMerge(defaults, overrides || {}), [overrides]);
  const t = merged[lang];
  const shared = merged.shared;

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
      <Hero t={t} bg={shared.heroBg} />
      <MarqueeStrip items={t.marquee} />
      <Problem t={t.problem} />
      <Ecosystem t={t.ecosystem} />
      <Pillars t={t.pillars} />
      <Programs t={t.programs} image={shared.programsImage} />
      <Roadmap t={t.roadmap} />
      <Governance t={t.governance} people={shared.people} lang={lang} />
      <News t={t.news} />
      <VideoFeature t={t.video} />
      <Publications t={t.publications} />
      <JoinCTA t={t.join} bg={shared.joinBg} />
      <Footer t={t} />
      <CookieConsent t={t.privacy} />
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
