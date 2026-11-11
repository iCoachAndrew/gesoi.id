import { MapPin, Mail } from "lucide-react";

const DEFAULT_LOGO = "/logo.png";

export const Footer = ({ t, logo }) => (
  <footer className="bg-[#FAFAFA] border-t border-slate-200 pt-20 pb-10" data-testid="main-footer">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-200">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo || DEFAULT_LOGO} alt="Gerakan Sehat Otak Indonesia" className="h-10 w-auto" />
          </div>
          <p className="font-serif-display italic font-light text-2xl lg:text-3xl text-[#0A192F]/80 max-w-md leading-snug" data-testid="footer-tagline">
            {t.footer.tagline}
          </p>
        </div>
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-6">{t.footer.nav}</h4>
          <ul className="space-y-3 text-sm text-slate-500 font-light">
            {[
              ["#problem", t.nav.problem],
              ["#ecosystem", t.nav.ecosystem],
              ["#pillars", t.nav.pillars],
              ["#programs", t.nav.programs],
              ["#roadmap", t.nav.roadmap],
              ["#join", t.nav.join],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-[var(--g-navy)] transition-colors duration-300" data-testid={`footer-link-${href.slice(1)}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-6">{t.footer.contact}</h4>
          <ul className="space-y-4 text-sm text-slate-500 font-light">
            <li className="flex items-start gap-3" data-testid="footer-address">
              <MapPin size={16} className="text-[var(--g-gold)] mt-0.5 shrink-0" />
              {t.footer.address}
            </li>
            <li className="flex items-start gap-3" data-testid="footer-email">
              <Mail size={16} className="text-[var(--g-gold)] mt-0.5 shrink-0" />
              {t.footer.email || "info@gesoi.or.id"}
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-400 font-light">
        <p data-testid="footer-copyright">
          © {new Date().getFullYear()} {t.footer.rights}
          <a
            href="/admin/login"
            data-testid="footer-admin-link"
            className="ml-3 underline decoration-slate-300 underline-offset-4 hover:text-[var(--g-gold)] transition-colors duration-300"
          >
            {t.footer.adminLabel || "Portal Admin"}
          </a>
        </p>
        <p className="tracking-[0.15em] uppercase">{t.footer.closing || "Salam Sehat Otak, Indonesia Cerdas"}</p>
      </div>
    </div>
  </footer>
);
