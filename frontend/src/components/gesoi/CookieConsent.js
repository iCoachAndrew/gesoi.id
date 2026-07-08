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
          className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-[60] rounded-2xl bg-[#0B1F3A] border border-white/15 p-6 shadow-2xl grain-overlay overflow-hidden"
          data-testid="cookie-banner"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-[#D4AF37]">
              <Cookie size={16} />
              <span className="text-[10px] uppercase tracking-[0.25em]">Cookies</span>
            </div>
            <p className="text-white/80 text-sm font-light leading-relaxed mb-4" data-testid="cookie-banner-text">{t.banner}</p>
            <button
              onClick={() => setShowPolicy(true)}
              data-testid="cookie-policy-link"
              className="text-emerald-300 text-xs underline underline-offset-4 hover:text-emerald-200 mb-4 block"
            >
              {t.policyLink}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => choose("accepted")}
                data-testid="cookie-accept-btn"
                className="flex-1 py-2.5 rounded-full bg-emerald-500 text-white text-xs uppercase tracking-wider font-semibold hover:bg-emerald-400 transition-colors duration-300"
              >
                {t.accept}
              </button>
              <button
                onClick={() => choose("declined")}
                data-testid="cookie-decline-btn"
                className="flex-1 py-2.5 rounded-full border border-white/25 text-white/70 text-xs uppercase tracking-wider hover:border-white transition-colors duration-300"
              >
                {t.decline}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPolicy && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-10" data-testid="privacy-modal">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowPolicy(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#0B1F3A]/10">
              <h3 className="font-serif-display text-2xl text-[#0B1F3A]" data-testid="privacy-modal-title">{t.policyTitle}</h3>
              <button onClick={() => setShowPolicy(false)} data-testid="privacy-close-btn" className="text-[#6B7280] hover:text-[#0B1F3A]" aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-[#4B5563] font-light leading-relaxed whitespace-pre-line" data-testid="privacy-policy-text">
              {t.policyText}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
