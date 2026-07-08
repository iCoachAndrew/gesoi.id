import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar } from "lucide-react";
import { content, sharedDefaults } from "../i18n";
import { deepMerge } from "../lib/merge";
import { newsUrl, newsIndexFromSlug } from "../lib/slug";
import { trackPageview } from "../lib/analytics";
import { Footer } from "../components/gesoi/Footer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";
const defaults = { ...content, shared: sharedDefaults };

const isImgLine = (l) => /^https?:\/\/\S+\.(png|jpe?g|webp|gif)(\?\S*)?$/i.test(l.trim());

const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[#0B1F3A]">{part.slice(2, -2)}</strong> : part
  );

const ArticleBody = ({ body }) => (
  <div className="space-y-6" data-testid="news-detail-body">
    {body.split(/\n\s*\n/).map((block, i) => {
      const b = block.trim();
      if (!b) return null;
      if (b.startsWith("## "))
        return <h2 key={i} className="font-serif-display text-2xl lg:text-3xl text-[#0B1F3A] pt-2">{b.slice(3)}</h2>;
      if (isImgLine(b))
        return <img key={i} src={b} alt="" loading="lazy" className="w-full rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]" />;
      return <p key={i} className="text-[#4B5563] font-light leading-relaxed text-base md:text-lg">{renderInline(b)}</p>;
    })}
  </div>
);

export default function NewsDetail() {
  const { slug } = useParams();
  const [lang, setLang] = useState("id");
  const [overrides, setOverrides] = useState(null);

  useEffect(() => {
    axios.get(`${API}/content`).then((r) => setOverrides(r.data || {})).catch(() => setOverrides({}));
    window.scrollTo(0, 0);
    trackPageview("id");
  }, [slug]);

  const merged = useMemo(() => deepMerge(defaults, overrides || {}), [overrides]);
  const t = merged[lang];
  const idx = newsIndexFromSlug(slug);
  const item = t.news.items[idx];
  const others = t.news.items.map((it, i) => ({ ...it, _i: i })).filter((it) => it._i !== idx && !it.link).slice(0, 3);

  useEffect(() => {
    if (item) document.title = `${item.title} — GESOI`;
    return () => { document.title = "GESOI — Gerakan Otak Sehat Indonesia"; };
  }, [item]);

  if (!overrides) return <div className="min-h-screen bg-[#F9F9F7]" data-testid="news-detail-loading" />;

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col" data-testid="news-detail-page">
      <header className="bg-[#0B1F3A] px-6 lg:px-10 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="bg-white rounded-lg px-2.5 py-1.5 inline-flex items-center" data-testid="news-detail-logo-link">
          <img src={LOGO} alt="GESOI" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-white/25 overflow-hidden text-xs">
            {["id", "en"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                data-testid={`news-detail-lang-${l}`}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors duration-300 ${
                  lang === l ? "bg-emerald-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link
            to="/#news"
            data-testid="news-detail-back"
            className="flex items-center gap-2 text-white/70 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors duration-300"
          >
            <ArrowLeft size={14} /> {t.news.backLabel}
          </Link>
        </div>
      </header>

      {!item ? (
        <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center" data-testid="news-detail-notfound">
          <p className="font-serif-display text-3xl text-[#0B1F3A] mb-6">{t.news.notFound}</p>
          <Link to="/#news" className="px-6 py-3 rounded-full bg-[#0B1F3A] text-white text-xs uppercase tracking-wider hover:bg-[#1B3A63] transition-colors duration-300">
            {t.news.backLabel}
          </Link>
        </main>
      ) : (
        <main className="flex-1">
          <div className="relative h-[38vh] min-h-[280px] lg:h-[48vh] bg-[#0B1F3A] overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/30 to-transparent" />
          </div>

          <article className="max-w-3xl mx-auto px-6 lg:px-0 -mt-24 relative z-10 pb-20">
            <div className="bg-white rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.1)] p-8 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-[0.2em] font-semibold" data-testid="news-detail-category">
                  <span className="w-2 h-2 bg-[#D4AF37]" /> {item.category}
                </span>
                {item.date && (
                  <span className="inline-flex items-center gap-2 text-[#9CA3AF] text-xs" data-testid="news-detail-date">
                    <Calendar size={13} className="text-[#D4AF37]" /> {item.date}
                  </span>
                )}
              </div>
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[#0B1F3A] mb-8" data-testid="news-detail-title">
                {item.title}
              </h1>
              <span className="block w-16 h-px bg-[#D4AF37] mb-8" />
              <ArticleBody body={item.body || ""} />
            </div>

            {others.length > 0 && (
              <div className="mt-16" data-testid="news-detail-more">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-6">{t.news.moreLabel}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {others.map((it) => (
                    <Link key={it._i} to={newsUrl(it, it._i)} className="group block rounded-2xl bg-white overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform duration-300" data-testid={`news-more-card-${it._i}`}>
                      <div className="h-32 overflow-hidden">
                        <img src={it.image} alt={it.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-1">{it.category}</p>
                        <h3 className="text-sm text-[#0B1F3A] font-medium leading-snug">{it.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
      )}

      <Footer t={t} />
    </div>
  );
}
