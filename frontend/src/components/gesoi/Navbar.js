import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";

const links = (t) => [
  { href: "#problem", label: t.nav.problem },
  { href: "#ecosystem", label: t.nav.ecosystem },
  { href: "#pillars", label: t.nav.pillars },
  { href: "#programs", label: t.nav.programs },
  { href: "#roadmap", label: t.nav.roadmap },
  { href: "#news", label: t.nav.news },
];

export const Navbar = ({ t, lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-[#0B1F3A]/85 backdrop-blur-xl border-b border-white/10" : "bg-[#0B1F3A]/40 backdrop-blur-md"
      }`}
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" data-testid="navbar-logo">
          <span className="bg-white rounded-lg px-2.5 py-1.5 flex items-center shadow-sm">
            <img src={LOGO} alt="Gerakan Sehat Otak Indonesia" className="h-7 w-auto" />
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links(t).map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.href.slice(1)}`}
              className="text-white/70 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-white/20 overflow-hidden text-xs" data-testid="language-toggle">
            {["id", "en"].map((l) => (
              <button
                key={l}
                data-testid={`lang-btn-${l}`}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 uppercase tracking-wider transition-colors duration-300 ${
                  lang === l ? "bg-emerald-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <a
            href="#join"
            data-testid="navbar-join-btn"
            className="hidden sm:inline-flex px-5 py-2 rounded-full bg-white text-[#0B1F3A] text-xs uppercase tracking-[0.15em] font-medium hover:bg-emerald-300 transition-colors duration-300"
          >
            {t.nav.join}
          </a>
          <button
            data-testid="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden bg-[#0B1F3A]/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-5" data-testid="mobile-menu">
          {links(t).map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-link-${l.href.slice(1)}`}
              className="text-white/80 text-sm uppercase tracking-[0.15em]"
            >
              {l.label}
            </a>
          ))}
          <a href="#join" onClick={() => setOpen(false)} data-testid="mobile-menu-join" className="text-emerald-300 text-sm uppercase tracking-[0.15em]">
            {t.nav.join}
          </a>
        </nav>
      )}
    </motion.header>
  );
};
