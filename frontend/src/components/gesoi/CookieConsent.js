import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

export const CookieConsent = ({ t }) => {
  const [visible, setVisible] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("gesoi_cookie_consent")) setVisible(true);
  }, []);

  const choose = (value) => {
    localStorage.setItem("gesoi_cookie_consent", value);
    setVisible(false);
    if (value === "accepted") window.dispatchEvent(new Event("gesoi-consent-accepted"));
  };

  return (
    <>
      {visible && (
        <div
          className="fixed bottom-4 inset-x-4 sm:left-6 sm:right-auto sm:max-w-sm z-[60] rounded-2xl bg-white border border-slate-200 p-6 shadow-[0_16px_48px_rgba(10,25,47,0.16)]"
          data-testid="cookie-banner"
        >
          <div className="flex items-center gap-2 mb-3 text-[var(--g-gold)]">
            <Cookie size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Cookies</span>
          </div>
          <p className="text-slate-600 text-sm font-light leading-relaxed mb-4" data-testid="cookie-banner-text">{t.banner}</p>
          <button
            onClick={() => setShowPolicy(true)}
            data-testid="cookie-policy-link"
            className="text-emerald-700 text-xs underline underline-offset-4 hover:text-emerald-800 mb-4 block"
          >
            {t.policyLink}
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => choose("accepted")}
              data-testid="cookie-accept-btn"
              className="flex-1 py-2.5 rounded-full bg-[var(--g-emerald)] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#047857] transition-colors duration-300"
            >
              {t.accept}
            </button>
            <button
              onClick={() => choose("declined")}
              data-testid="cookie-decline-btn"
              className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-500 text-xs uppercase tracking-wider hover:border-slate-400 hover:text-[var(--g-navy)] transition-colors duration-300"
            >
              {t.decline}
            </button>
          </div>
        </div>
      )}

      {showPolicy && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-10" data-testid="privacy-modal">
          <div className="absolute inset-0 bg-[#0A192F]/40 backdrop-blur-sm" onClick={() => setShowPolicy(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-serif-display text-2xl text-[var(--g-navy)]" data-testid="privacy-modal-title">{t.policyTitle}</h3>
              <button onClick={() => setShowPolicy(false)} data-testid="privacy-close-btn" className="text-slate-400 hover:text-[var(--g-navy)]" aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-600 font-light leading-relaxed whitespace-pre-line" data-testid="privacy-policy-text">
              {t.policyText}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
