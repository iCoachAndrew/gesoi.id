import { Brain, MapPin, Mail } from "lucide-react";

export const Footer = ({ t }) => (
  <footer className="bg-[#071F16] text-white pt-20 pb-10 relative overflow-hidden" data-testid="main-footer">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Brain size={18} className="text-emerald-300" />
            </span>
            <span className="font-medium tracking-[0.2em]">GESOI</span>
          </div>
          <p className="font-serif-display italic text-2xl lg:text-3xl text-white/80 max-w-md leading-snug" data-testid="footer-tagline">
            {t.footer.tagline}
          </p>
        </div>
        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-6">{t.footer.nav}</h4>
          <ul className="space-y-3 text-sm text-white/60 font-light">
            {[
              ["#problem", t.nav.problem],
              ["#ecosystem", t.nav.ecosystem],
              ["#pillars", t.nav.pillars],
              ["#programs", t.nav.programs],
              ["#roadmap", t.nav.roadmap],
              ["#join", t.nav.join],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-white transition-colors duration-300" data-testid={`footer-link-${href.slice(1)}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-6">{t.footer.contact}</h4>
          <ul className="space-y-4 text-sm text-white/60 font-light">
            <li className="flex items-start gap-3" data-testid="footer-address">
              <MapPin size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
              {t.footer.address}
            </li>
            <li className="flex items-start gap-3" data-testid="footer-email">
              <Mail size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
              info@gesoi.or.id
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/40 font-light">
        <p data-testid="footer-copyright">© {new Date().getFullYear()} {t.footer.rights}</p>
        <p className="tracking-[0.2em] uppercase">Brain Energy · Indonesia Emas 2045</p>
      </div>
    </div>
  </footer>
);
