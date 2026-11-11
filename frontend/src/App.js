import { useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { content, sharedDefaults } from "@/i18n";
import { deepMerge } from "@/lib/merge";
import { trackPageview, trackEvent } from "@/lib/analytics";
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
import NewsDetail from "@/pages/NewsDetail";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const defaults = { ...content, shared: sharedDefaults };

const Landing = () => {
  const [lang, setLang] = useState("id");
  const [overrides, setOverrides] = useState(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    axios.get(`${API}/content`).then((r) => setOverrides(r.data || {})).catch(() => setOverrides({}));
  }, []);

  useEffect(() => {
    trackPageview(langRef.current);
    const onConsent = () => trackPageview(langRef.current);
    window.addEventListener("gesoi-consent-accepted", onConsent);
    return () => window.removeEventListener("gesoi-consent-accepted", onConsent);
  }, []);

  const changeLang = (l) => {
    setLang(l);
    trackEvent("lang_switch", l);
  };

  const merged = useMemo(() => deepMerge(defaults, overrides || {}), [overrides]);
  const t = merged[lang];
  const shared = merged.shared;

  useEffect(() => {
    if (!overrides) return;
    document.title = t.seo.title;
    const setMeta = (sel, val) => {
      const el = document.querySelector(sel);
      if (el && val) el.setAttribute("content", val);
    };
    setMeta('meta[name="description"]', t.seo.description);
    setMeta('meta[property="og:title"]', t.seo.title);
    setMeta('meta[property="og:description"]', t.seo.description);
    if (shared.ogImage) {
      setMeta('meta[property="og:image"]', shared.ogImage.startsWith("http") ? shared.ogImage : `${window.location.origin}${shared.ogImage}`);
    }
    if (shared.favicon) {
      let icon = document.querySelector('link[rel="icon"]');
      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }
      icon.href = shared.favicon;
    }
  }, [t, shared, overrides]);

  useEffect(() => {
    const th = shared.theme || {};
    const root = document.documentElement;
    if (th.navy) root.style.setProperty("--g-navy", th.navy);
    if (th.emerald) root.style.setProperty("--g-emerald", th.emerald);
    if (th.gold) root.style.setProperty("--g-gold", th.gold);
  }, [shared]);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.location.hash) {
      setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView(), 400);
    }
    return () => lenis.destroy();
  }, []);

  const sectionMap = {
    marquee: <MarqueeStrip items={t.marquee} />,
    problem: <Problem t={t.problem} />,
    ecosystem: <Ecosystem t={t.ecosystem} />,
    pillars: <Pillars t={t.pillars} />,
    programs: <Programs t={t.programs} image={shared.programsImage} />,
    roadmap: <Roadmap t={t.roadmap} />,
    governance: <Governance t={t.governance} people={shared.people} lang={lang} />,
    news: <News t={t.news} />,
    video: <VideoFeature t={t.video} />,
    publications: <Publications t={t.publications} />,
    join: <JoinCTA t={t.join} bg={shared.joinBg} lang={lang} />,
  };
  const order = shared.sections?.length ? shared.sections : sharedDefaults.sections;

  return (
    <div className="App bg-[#F9F9F7]">
      <Navbar t={t} lang={lang} setLang={changeLang} logo={shared.logo} />
      <Hero t={t} bg={shared.heroBg} />
      {order.filter((s) => s.visible !== false && sectionMap[s.key]).map((s) => (
        <div key={s.key}>{sectionMap[s.key]}</div>
      ))}
      <Footer t={t} logo={shared.logo} />
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
        <Route path="/berita/:slug" element={<NewsDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
