import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar } from "lucide-react";
import { content, sharedDefaults } from "../i18n";
import { deepMerge } from "../lib/merge";
import { newsUrl, newsIndexFromSlug } from "../lib/slug";
import { trackPageview, trackEvent } from "../lib/analytics";
import { Footer } from "../components/gesoi/Footer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DEFAULT_LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";
const defaults = { ...content, shared: sharedDefaults };

const WhatsAppIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const isImgLine = (l) => /^https?:\/\/\S+\.(png|jpe?g|webp|gif)(\?\S*)?$/i.test(l.trim());

const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[var(--g-navy)]">{part.slice(2, -2)}</strong> : part
  );

const ArticleBody = ({ body }) => (
  <div className="space-y-6" data-testid="news-detail-body">
    {body.split(/\n\s*\n/).map((block, i) => {
      const b = block.trim();
      if (!b) return null;
      if (b.startsWith("## "))
        return <h2 key={i} className="font-serif-display text-2xl lg:text-3xl text-[var(--g-navy)] pt-2">{b.slice(3)}</h2>;
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
    if (item) document.title = `${item.title} | GESOI`;
    return () => { document.title = defaults[lang].seo.title; };
  }, [item, lang]);

  useEffect(() => {
    const th = merged.shared.theme || {};
    const root = document.documentElement;
    if (th.navy) root.style.setProperty("--g-navy", th.navy);
    if (th.emerald) root.style.setProperty("--g-emerald", th.emerald);
    if (th.gold) root.style.setProperty("--g-gold", th.gold);
  }, [merged]);

  if (!overrides) return <div className="min-h-screen bg-[#F9F9F7]" data-testid="news-detail-loading" />;

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="news-detail-page">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 lg:px-10 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="inline-flex items-center" data-testid="news-detail-logo-link">
          <img src={merged.shared.logo || DEFAULT_LOGO} alt="GESOI" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-slate-200 overflow-hidden text-xs">
            {["id", "en"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                data-testid={`news-detail-lang-${l}`}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors duration-300 ${
                  lang === l ? "bg-[var(--g-navy)] text-white" : "text-slate-400 hover:text-[var(--g-navy)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link
            to="/#news"
            data-testid="news-detail-back"
            className="flex items-center gap-2 text-slate-500 hover:text-[var(--g-navy)] text-xs uppercase tracking-[0.15em] transition-colors duration-300"
          >
            <ArrowLeft size={14} /> {t.news.backLabel}
          </Link>
        </div>
      </header>

      {!item ? (
        <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center" data-testid="news-detail-notfound">
          <p className="font-serif-display text-3xl text-[var(--g-navy)] mb-6">{t.news.notFound}</p>
          <Link to="/#news" className="px-6 py-3 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-wider hover:bg-[#1B3A63] transition-colors duration-300">
            {t.news.backLabel}
          </Link>
        </main>
      ) : (
        <main className="flex-1">
          <div className="relative h-[38vh] min-h-[280px] lg:h-[48vh] bg-[var(--g-navy)] overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-90" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <article className="max-w-3xl mx-auto px-6 lg:px-0 -mt-24 relative z-10 pb-20">
            <div className="bg-white border border-slate-100 shadow-[0_16px_48px_rgba(10,25,47,0.08)] p-8 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-[0.2em] font-semibold" data-testid="news-detail-category">
                  <span className="w-2 h-2 bg-[var(--g-gold)]" /> {item.category}
                </span>
                {item.date && (
                  <span className="inline-flex items-center gap-2 text-[#9CA3AF] text-xs" data-testid="news-detail-date">
                    <Calendar size={13} className="text-[var(--g-gold)]" /> {item.date}
                  </span>
                )}
              </div>
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[var(--g-navy)] mb-8" data-testid="news-detail-title">
                {item.title}
              </h1>
              <span className="block w-16 h-px bg-[var(--g-gold)] mb-8" />
              <ArticleBody body={item.body || ""} />
              <div className="mt-10 pt-8 border-t border-[#0A192F]/10">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${item.title}\n\n${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("share_click")}
                  data-testid="news-share-whatsapp"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#1ebe5b] hover:scale-[1.02] transition-[background-color,transform] duration-300"
                >
                  <WhatsAppIcon size={16} /> {t.news.shareLabel}
                </a>
              </div>
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
                        <h3 className="text-sm text-[var(--g-navy)] font-medium leading-snug">{it.title}</h3>
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
