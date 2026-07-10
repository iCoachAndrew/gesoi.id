import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { SectionHeader, fadeUp } from "./SectionHeader";
import { trackEvent } from "../../lib/analytics";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const JoinCTA = ({ t, bg }) => {
  const [form, setForm] = useState({ name: "", email: "", organization: "", interest: "volunteer", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/contact`, {
        ...form,
        organization: form.organization || null,
        message: form.message || null,
      });
      toast.success(t.form.success);
      trackEvent("form_submit");
      setForm({ name: "", email: "", organization: "", interest: "volunteer", message: "" });
    } catch {
      toast.error(t.form.error);
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full border-b border-slate-200 bg-transparent px-1 py-3.5 text-[#0A192F] placeholder:text-slate-400 text-sm font-light focus:outline-none focus:border-emerald-600 transition-colors duration-300";

  return (
    <section id="join" className="py-24 lg:py-32 bg-white relative overflow-hidden" data-testid="join-section">
      <div className="absolute inset-0 opacity-[0.05]">
        <img src={bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/60" />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="join-header" />
        </div>

        <motion.form
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          onSubmit={submit}
          className="bg-white border border-slate-200 p-8 lg:p-12 space-y-6 shadow-[0_8px_30px_rgba(10,25,47,0.04)]"
          data-testid="join-form"
        >
          <input required value={form.name} onChange={set("name")} placeholder={t.form.name} className={inputCls} data-testid="join-input-name" />
          <input required type="email" value={form.email} onChange={set("email")} placeholder={t.form.email} className={inputCls} data-testid="join-input-email" />
          <input value={form.organization} onChange={set("organization")} placeholder={t.form.organization} className={inputCls} data-testid="join-input-organization" />
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">{t.form.interest}</label>
            <div className="flex flex-wrap gap-2">
              {t.form.interests.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm({ ...form, interest: opt.value })}
                  data-testid={`join-interest-${opt.value}`}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-300 ${
                    form.interest === opt.value
                      ? "bg-[#059669] border-[#059669] text-white"
                      : "border-slate-200 text-slate-500 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <textarea rows={4} value={form.message} onChange={set("message")} placeholder={t.form.message} className={inputCls} data-testid="join-input-message" />
          <button
            type="submit"
            disabled={sending}
            data-testid="join-submit-btn"
            className="w-full py-4 rounded-full bg-[#0A192F] text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-[#059669] transition-colors duration-300 disabled:opacity-60"
          >
            {sending ? t.form.sending : t.form.submit}
          </button>
        </motion.form>
      </div>
    </section>
  );
};
