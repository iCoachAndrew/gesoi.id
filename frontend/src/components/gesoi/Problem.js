import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
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
            className={`rounded-2xl p-10 border border-[#0B1F3A]/10 ${i === 2 ? "bg-[#0B1F3A] text-white" : "bg-white"} shadow-[0_8px_32px_rgba(0,0,0,0.06)]`}
            data-testid={`problem-stat-${i}`}
          >
            <p className={`font-serif-display text-6xl lg:text-7xl ${i === 2 ? "text-[#D4AF37]" : "text-emerald-700"}`}>{s.value}</p>
            <p className={`mt-4 text-sm font-light ${i === 2 ? "text-white/70" : "text-[#4B5563]"}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-16 rounded-3xl bg-[#0B1F3A] relative overflow-hidden grain-overlay p-10 lg:p-16"
        data-testid="paradigm-shift"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.3fr] gap-12 lg:gap-16 items-center relative z-10">
          <div data-testid="paradigm-old">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-8">{t.paradigmOld.title}</p>
            {t.paradigmOld.steps.map((step, i) => (
              <motion.p
                key={step}
                variants={fadeUp}
                custom={i * 0.6}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-serif-display italic text-3xl lg:text-4xl text-white/30 line-through decoration-white/20 decoration-1 mb-4"
                style={{ marginLeft: `${i * 20}px` }}
              >
                {step}
              </motion.p>
            ))}
          </div>

          <div className="flex lg:flex-col items-center gap-4 text-[#D4AF37]" data-testid="paradigm-shift-label">
            <span className="hidden lg:block h-20 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-transparent" />
            <span className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
            <MoveRight size={20} className="shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.3em] whitespace-nowrap">{t.shiftLabel}</span>
            <span className="hidden lg:block h-20 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-transparent" />
            <span className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </div>

          <div data-testid="paradigm-new">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-8">{t.paradigmNew.title}</p>
            {t.paradigmNew.steps.map((step, i) => (
              <motion.div
                key={step}
                variants={fadeUp}
                custom={i * 0.6 + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-baseline gap-5 mb-5 group"
              >
                <span className="font-serif-display italic text-[#D4AF37] text-lg shrink-0 w-8">0{i + 1}</span>
                <div className="flex-1">
                  <p className="font-serif-display text-3xl lg:text-5xl text-white group-hover:text-emerald-300 transition-colors duration-500">{step}</p>
                  {i < t.paradigmNew.steps.length - 1 && (
                    <span className="block mt-5 h-px w-full bg-gradient-to-r from-emerald-400/30 to-transparent" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
