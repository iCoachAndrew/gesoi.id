import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { trackEvent } from "../../lib/analytics";

const DEFAULT_LOGO = "/logo.png";

const links = (t, isSubpage = false) => [
  { key: "problem", href: isSubpage ? "/#problem" : "#problem", label: t.nav.problem },
  { key: "ecosystem", href: isSubpage ? "/#ecosystem" : "#ecosystem", label: t.nav.ecosystem },
  { key: "pillars", href: isSubpage ? "/#pillars" : "#pillars", label: t.nav.pillars },
  { key: "programs", href: isSubpage ? "/#programs" : "#programs", label: t.nav.programs },
  { key: "education", href: "/edukasi", label: t.nav.education || "Edukasi", isRoute: true },
  { key: "roadmap", href: isSubpage ? "/#roadmap" : "#roadmap", label: t.nav.roadmap },
  { key: "news", href: isSubpage ? "/#news" : "#news", label: t.nav.news },
];

export const Navbar = ({ t, lang, setLang, logo, activePage = "" }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isSubpage = Boolean(activePage);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 border-b border-slate-100 ${
        scrolled ? "bg-white/90 shadow-[0_1px_20px_rgba(10,25,47,0.05)]" : "bg-white/70"
      }`}
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href={isSubpage ? "/" : "#top"} className="flex items-center gap-2.5" data-testid="navbar-logo">
          <img src={logo || DEFAULT_LOGO} alt="Gerakan Sehat Otak Indonesia" className="h-8 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {links(t, isSubpage).map((l) => {
            const isActive = activePage === l.key;
            const cls = `text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
              isActive
                ? "text-emerald-700 font-semibold"
                : "text-slate-500 hover:text-[var(--g-navy)]"
            }`;
            return l.isRoute ? (
              <Link
                key={l.key}
                to={l.href}
                data-testid={`nav-link-${l.key}`}
                className={cls}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.key}
                href={l.href}
                data-testid={`nav-link-${l.key}`}
                className={cls}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-slate-200 overflow-hidden text-xs" data-testid="language-toggle">
            {["id", "en"].map((l) => (
              <button
                key={l}
                data-testid={`lang-btn-${l}`}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors duration-300 ${
                  lang === l ? "bg-[var(--g-navy)] text-white" : "text-slate-400 hover:text-[var(--g-navy)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <a
            href={isSubpage ? "/#join" : "#join"}
            onClick={() => trackEvent("join_click")}
            data-testid="navbar-join-btn"
            className="hidden sm:inline-flex px-5 py-2 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-300"
          >
            {t.nav.join}
          </a>
          <button
            data-testid="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--g-navy)]"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-6 flex flex-col gap-5" data-testid="mobile-menu">
          {links(t, isSubpage).map((l) =>
            l.isRoute ? (
              <Link
                key={l.key}
                to={l.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-link-${l.key}`}
                className={`text-sm uppercase tracking-[0.15em] ${
                  activePage === l.key ? "text-emerald-700 font-semibold" : "text-slate-600"
                }`}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-link-${l.key}`}
                className="text-slate-600 text-sm uppercase tracking-[0.15em]"
              >
                {l.label}
              </a>
            )
          )}
          <a href={isSubpage ? "/#join" : "#join"} onClick={() => { setOpen(false); trackEvent("join_click"); }} data-testid="mobile-menu-join" className="text-emerald-700 font-semibold text-sm uppercase tracking-[0.15em]">
            {t.nav.join}
          </a>
        </nav>
      )}
    </motion.header>
  );
};
