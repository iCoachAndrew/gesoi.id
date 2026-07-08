import { motion } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Problem = ({ t }) => (
  <section id="problem" className="py-24 lg:py-36 bg-[#F9F9F7]" data-testid="problem-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="problem-header" />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className={`rounded-2xl p-10 border border-[#0A2E20]/10 ${i === 2 ? "bg-[#0A2E20] text-white" : "bg-white"} shadow-[0_8px_32px_rgba(0,0,0,0.06)]`}
            data-testid={`problem-stat-${i}`}
          >
            <p className={`font-serif-display text-6xl lg:text-7xl ${i === 2 ? "text-[#D4AF37]" : "text-emerald-700"}`}>{s.value}</p>
            <p className={`mt-4 text-sm font-light ${i === 2 ? "text-white/70" : "text-[#4B5563]"}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="rounded-2xl border border-[#0A2E20]/10 bg-white/60 p-10"
          data-testid="paradigm-old"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center"><X size={14} className="text-red-500" /></span>
            <h3 className="text-lg text-[#0A2E20] font-medium">{t.paradigmOld.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {t.paradigmOld.steps.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="px-5 py-2.5 rounded-full bg-[#F1F1EC] text-[#4B5563] text-sm line-through decoration-red-400/60">{step}</span>
                {i < t.paradigmOld.steps.length - 1 && <ArrowRight size={14} className="text-[#9CA3AF]" />}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="rounded-2xl bg-[#0A2E20] p-10 relative overflow-hidden grain-overlay"
          data-testid="paradigm-new"
        >
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center"><Check size={14} className="text-emerald-300" /></span>
            <h3 className="text-lg text-white font-medium">{t.paradigmNew.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            {t.paradigmNew.steps.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-sm">{step}</span>
                {i < t.paradigmNew.steps.length - 1 && <ArrowRight size={14} className="text-emerald-400/60" />}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
