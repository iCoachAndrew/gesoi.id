import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Lock, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, fadeUp } from "./SectionHeader";

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
    "w-full rounded-xl border border-[#0B1F3A]/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors duration-200";

  return (
    <section id="publications" className="py-24 lg:py-36 bg-[#0B1F3A] relative overflow-hidden grain-overlay" data-testid="publications-section">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeader kicker={t.kicker} title={t.title} body={t.body} dark testId="publications-header" />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.items.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 flex flex-col hover:-translate-y-1.5 transition-transform duration-500"
              data-testid={`publication-card-${i}`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="w-11 h-11 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                  <FileText size={18} className="text-[#D4AF37]" />
                </span>
                <span className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-[0.2em]">
                  <Lock size={11} /> {item.year}
                </span>
              </div>
              <h3 className="font-serif-display text-white text-2xl leading-snug mb-3">{item.title}</h3>
              <p className="text-white/50 text-sm font-light mb-6">{item.authors}</p>
              <div className="mt-auto">
                <p className="font-serif-display text-[#D4AF37] text-3xl">{item.price}</p>
                <p className="text-white/40 text-xs font-light mt-1 mb-5">{t.priceNote}</p>
                <button
                  onClick={() => setSelected(item)}
                  data-testid={`publication-buy-btn-${i}`}
                  className="w-full py-3 rounded-full bg-emerald-500 text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-emerald-400 transition-colors duration-300"
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
          <div className="absolute inset-0 bg-black/70" onClick={close} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={close} data-testid="checkout-close-btn" className="absolute top-4 right-4 text-[#6B7280] hover:text-[#0B1F3A]" aria-label="Tutup">
              <X size={18} />
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 mb-3">{t.modalTitle}</p>
            <h3 className="font-serif-display text-2xl text-[#0B1F3A] mb-1">{selected.title}</h3>
            <div className="flex items-baseline justify-between border-t border-b border-[#0B1F3A]/10 py-3 my-4">
              <span className="text-sm text-[#4B5563]">{t.priceNote}</span>
              <span className="font-serif-display text-2xl text-[#0B1F3A]">{selected.price}</span>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5" data-testid="prototype-note">
              {t.prototypeNote}
            </p>
            <form onSubmit={submit} className="space-y-3" data-testid="order-form">
              <input required value={buyer.name} onChange={set("name")} placeholder={t.form.name} className={inputCls} data-testid="order-input-name" />
              <input required type="email" value={buyer.email} onChange={set("email")} placeholder={t.form.email} className={inputCls} data-testid="order-input-email" />
              <input required value={buyer.phone} onChange={set("phone")} placeholder={t.form.phone} className={inputCls} data-testid="order-input-phone" />
              <input value={buyer.organization} onChange={set("organization")} placeholder={t.form.organization} className={inputCls} data-testid="order-input-organization" />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  data-testid="checkout-cancel-btn"
                  className="flex-1 py-3 rounded-full border border-[#0B1F3A]/20 text-[#4B5563] text-xs uppercase tracking-wider hover:border-[#0B1F3A] transition-colors duration-300"
                >
                  {t.cancelLabel}
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="order-submit-btn"
                  className="flex-1 py-3 rounded-full bg-[#D4AF37] text-[#0B1F3A] text-xs uppercase tracking-wider font-semibold hover:bg-[#e5c657] transition-colors duration-300 disabled:opacity-60"
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
