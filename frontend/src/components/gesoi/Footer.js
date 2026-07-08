import { MapPin, Mail } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";

export const Footer = ({ t }) => (
  <footer className="bg-[#07142A] text-white pt-20 pb-10 relative overflow-hidden" data-testid="main-footer">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-white rounded-lg px-3 py-2 inline-flex items-center">
              <img src={LOGO} alt="Gerakan Sehat Otak Indonesia" className="h-9 w-auto" />
            </span>
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
        <p className="tracking-[0.15em] uppercase">Salam Otak Sehat, Indonesia Cerdas</p>
      </div>
    </div>
  </footer>
);
