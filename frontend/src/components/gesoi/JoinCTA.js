import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { SectionHeader, fadeUp } from "./SectionHeader";

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
      setForm({ name: "", email: "", organization: "", interest: "volunteer", message: "" });
    } catch {
      toast.error(t.form.error);
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/10 border border-white/20 px-5 py-4 text-white placeholder:text-white/40 text-sm font-light focus:outline-none focus:border-emerald-300 transition-colors duration-300";

  return (
    <section id="join" className="py-24 lg:py-36 bg-[#0B1F3A] relative overflow-hidden grain-overlay" data-testid="join-section">
      <div className="absolute inset-0 opacity-15">
        <img src={bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0B1F3A]/80" />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <SectionHeader kicker={t.kicker} title={t.title} body={t.body} dark testId="join-header" />
        </div>

        <motion.form
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          onSubmit={submit}
          className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/15 p-8 lg:p-10 space-y-5"
          data-testid="join-form"
        >
          <input required value={form.name} onChange={set("name")} placeholder={t.form.name} className={inputCls} data-testid="join-input-name" />
          <input required type="email" value={form.email} onChange={set("email")} placeholder={t.form.email} className={inputCls} data-testid="join-input-email" />
          <input value={form.organization} onChange={set("organization")} placeholder={t.form.organization} className={inputCls} data-testid="join-input-organization" />
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-[0.2em] mb-3">{t.form.interest}</label>
            <div className="flex flex-wrap gap-2">
              {t.form.interests.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm({ ...form, interest: opt.value })}
                  data-testid={`join-interest-${opt.value}`}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-300 ${
                    form.interest === opt.value
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-white/25 text-white/60 hover:border-emerald-300 hover:text-white"
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
            className="w-full py-4 rounded-full bg-[#D4AF37] text-[#0B1F3A] text-sm uppercase tracking-[0.2em] font-semibold hover:bg-[#e5c657] hover:scale-[1.01] transition-[background-color,transform] duration-300 disabled:opacity-60"
          >
            {sending ? t.form.sending : t.form.submit}
          </button>
        </motion.form>
      </div>
    </section>
  );
};
