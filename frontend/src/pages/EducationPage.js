import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { Brain, Heart, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { content, sharedDefaults } from "../i18n";
import { deepMerge } from "../lib/merge";
import { trackPageview, trackEvent } from "../lib/analytics";
import { Navbar } from "../components/gesoi/Navbar";
import { Education } from "../components/gesoi/Education";
import { Footer } from "../components/gesoi/Footer";
import { CookieConsent } from "../components/gesoi/CookieConsent";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const defaults = { ...content, shared: sharedDefaults };

const PILLARS_SUMMARY = {
  id: [
    {
      icon: Brain,
      badge: "01 · Sadari",
      title: "Kenali Sinyal Kelelahan Otak",
      desc: "Sulit fokus, mudah terdistraksi, dan kualitas tidur yang menurun bukanlah kelemahan karakter, melainkan sinyal bahwa cadangan energi otak membutuhkan perhatian.",
    },
    {
      icon: Heart,
      badge: "02 · Rawat",
      title: "Praktikkan Neuro-Hygiene Harian",
      desc: "Istirahat terjadwal dari layar gawai, olahraga teratur, hidrasi cukup, serta tidur berkualitas membantu memulihkan keseimbangan kimiawi dan sirkuit emosi di otak.",
    },
    {
      icon: Sparkles,
      badge: "03 · Optimalkan",
      title: "Bangun Brain Energy Bersama",
      desc: "Kesehatan mental dan otak tumbuh paling kuat di dalam keluarga, sekolah, dan lingkungan kerja yang saling mendukung serta bebas dari stigma.",
    },
  ],
  en: [
    {
      icon: Brain,
      badge: "01 · Recognize",
      title: "Listen to Brain Fatigue Signals",
      desc: "Difficulty focusing, constant distraction, and poor sleep are not character flaws, they are biological signals that your brain energy reserves need care.",
    },
    {
      icon: Heart,
      badge: "02 · Nurture",
      title: "Practice Daily Neuro-Hygiene",
      desc: "Scheduled screen breaks, regular movement, proper hydration, and deep sleep restore neurochemical balance and emotional regulation circuits.",
    },
    {
      icon: Sparkles,
      badge: "03 · Optimize",
      title: "Build Brain Energy Together",
      desc: "Brain and mental health thrive best within supportive, stigma-free families, schools, and workplaces.",
    },
  ],
};

export default function EducationPage() {
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState("id");
  const [overrides, setOverrides] = useState(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const initialVideoIdx = useMemo(() => {
    const raw = parseInt(searchParams.get("v") || "0", 10);
    return Number.isNaN(raw) || raw < 0 ? 0 : raw;
  }, [searchParams]);

  useEffect(() => {
    axios
      .get(`${API}/content`)
      .then((r) => setOverrides(r.data || {}))
      .catch(() => setOverrides({}));
    window.scrollTo(0, 0);
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
    if (t?.education?.title) {
      document.title = `${t.education.title} | GESOI`;
    }
    return () => {
      document.title = defaults[lang].seo.title;
    };
  }, [t, lang]);

  useEffect(() => {
    const th = shared.theme || {};
    const root = document.documentElement;
    if (th.navy) root.style.setProperty("--g-navy", th.navy);
    if (th.emerald) root.style.setProperty("--g-emerald", th.emerald);
    if (th.gold) root.style.setProperty("--g-gold", th.gold);
  }, [shared]);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  const guides = PILLARS_SUMMARY[lang] || PILLARS_SUMMARY.id;

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col" data-testid="education-page">
      <Navbar t={t} lang={lang} setLang={changeLang} logo={shared.logo} activePage="education" />

      <main className="flex-1">
        {/* Top Breadcrumb / Quick Back Bar */}
        <div className="pt-20 bg-[#FAFAFA] border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/"
              data-testid="education-back-home"
              className="inline-flex items-center gap-2 hover:text-[var(--g-navy)] transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={13} />
              {t.education?.backHomeLabel || "Kembali ke Beranda"}
            </Link>
            <span className="uppercase tracking-[0.2em] text-[10px] text-emerald-700 font-semibold">
              {t.nav?.programs} · {t.nav?.education} · {t.nav?.roadmap}
            </span>
          </div>
        </div>

        {/* Interactive Video Education Hub */}
        <Education
          t={{ ...t.education, kicker: t.education?.kicker || "Edukasi Publik · Akses Gratis" }}
          lang={lang}
          isFullPage={true}
          initialVideoIndex={initialVideoIdx}
        />

        {/* Practical Daily Brain Health Principles */}
        <section className="py-20 bg-[#FAFAFA] border-t border-slate-200/80" data-testid="education-principles-section">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.map((g, i) => {
                const Icon = g.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_4px_24px_rgba(10,25,47,0.03)]"
                    data-testid={`education-principle-${i}`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <Icon size={18} className="text-emerald-700" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--g-gold)]">
                        {g.badge}
                      </span>
                    </div>
                    <h3 className="font-serif-display text-2xl text-[var(--g-navy)] mb-2.5">
                      {g.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Call to Action Banner */}
            <div className="mt-12 rounded-3xl bg-[var(--g-navy)] text-white p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-2">
                  {t.join?.kicker || "Bergabung Bersama GESOI"}
                </p>
                <h3 className="font-serif-display text-3xl sm:text-4xl font-light leading-tight">
                  {t.join?.title || "Jadilah Arsitek Brain Energy Indonesia"}
                </h3>
                <p className="text-sm sm:text-base text-white/75 font-light mt-2 leading-relaxed">
                  {t.join?.body}
                </p>
              </div>
              <Link
                to="/#join"
                onClick={() => trackEvent("join_click")}
                data-testid="education-join-cta"
                className="shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-[0.15em] font-semibold transition-colors duration-300"
              >
                {t.nav?.join || "Bergabung"}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer t={t} logo={shared.logo} />
      <CookieConsent t={t.privacy} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
