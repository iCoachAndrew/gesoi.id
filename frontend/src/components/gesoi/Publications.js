import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Lock, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, fadeUp } from "./SectionHeader";
import { trackEvent } from "../../lib/analytics";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const emptyBuyer = { name: "", email: "", phone: "", organization: "" };

export const Publications = ({ t }) => {
  const [selected, setSelected] = useState(null);
  const [buyer, setBuyer] = useState(emptyBuyer);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setBuyer({ ...buyer, [k]: e.target.value });

  const close = () => {
    setSelected(null);
    setBuyer(emptyBuyer);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/orders`, {
        publication_title: selected.title,
        price: selected.price,
        ...buyer,
        organization: buyer.organization || null,
      });
      toast.success(t.form.success);
      close();
    } catch {
      toast.error(t.form.error);
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full border-b border-slate-200 bg-transparent px-1 py-3 text-sm text-[#0A192F] placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors duration-200";

  return (
    <section id="publications" className="py-24 lg:py-32 bg-[#FAFAFA]" data-testid="publications-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="publications-header" />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="bg-white border border-slate-200 p-8 flex flex-col hover:shadow-[0_8px_30px_rgba(10,25,47,0.06)] transition-shadow duration-500"
              data-testid={`publication-card-${i}`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="w-11 h-11 rounded-full bg-[#FAFAFA] border border-slate-200 flex items-center justify-center">
                  <FileText size={18} className="text-[#B45309]" />
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                  <Lock size={11} /> {item.year}
                </span>
              </div>
              <h3 className="font-serif-display text-[#0A192F] text-2xl leading-snug mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm font-light mb-6">{item.authors}</p>
              <div className="mt-auto">
                <p className="font-serif-display text-[#0A192F] text-3xl">{item.price}</p>
                <p className="text-slate-400 text-xs font-light mt-1 mb-5">{t.priceNote}</p>
                <button
                  onClick={() => { setSelected(item); trackEvent("buy_click"); }}
                  data-testid={`publication-buy-btn-${i}`}
                  className="w-full py-3 rounded-full bg-[#059669] text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#047857] transition-colors duration-300"
                >
                  {t.buyLabel}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 py-8" data-testid="checkout-modal">
          <div className="absolute inset-0 bg-[#0A192F]/40 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={close} data-testid="checkout-close-btn" className="absolute top-4 right-4 text-slate-400 hover:text-[#0A192F]" aria-label="Tutup">
              <X size={18} />
            </button>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-3">{t.modalTitle}</p>
            <h3 className="font-serif-display text-2xl text-[#0A192F] mb-1">{selected.title}</h3>
            <div className="flex items-baseline justify-between border-t border-b border-slate-100 py-3 my-4">
              <span className="text-sm text-slate-500">{t.priceNote}</span>
              <span className="font-serif-display text-2xl text-[#0A192F]">{selected.price}</span>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5" data-testid="prototype-note">
              {t.prototypeNote}
            </p>
            <form onSubmit={submit} className="space-y-3" data-testid="order-form">
              <input required value={buyer.name} onChange={set("name")} placeholder={t.form.name} className={inputCls} data-testid="order-input-name" />
              <input required type="email" value={buyer.email} onChange={set("email")} placeholder={t.form.email} className={inputCls} data-testid="order-input-email" />
              <input required value={buyer.phone} onChange={set("phone")} placeholder={t.form.phone} className={inputCls} data-testid="order-input-phone" />
              <input value={buyer.organization} onChange={set("organization")} placeholder={t.form.organization} className={inputCls} data-testid="order-input-organization" />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={close}
                  data-testid="checkout-cancel-btn"
                  className="flex-1 py-3 rounded-full border border-slate-200 text-slate-500 text-xs uppercase tracking-wider hover:border-[#0A192F] hover:text-[#0A192F] transition-colors duration-300"
                >
                  {t.cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="order-submit-btn"
                  className="flex-1 py-3 rounded-full bg-[#0A192F] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#059669] transition-colors duration-300 disabled:opacity-60"
                >
                  {sending ? t.form.sending : t.form.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
