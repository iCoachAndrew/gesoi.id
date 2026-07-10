import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Problem = ({ t }) => (
  <section id="problem" className="py-24 lg:py-32 bg-white" data-testid="problem-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="problem-header" />

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 md:divide-x md:divide-slate-200">
        {t.stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="md:px-12 first:md:pl-0 last:md:pr-0"
            data-testid={`problem-stat-${i}`}
          >
            <p className="font-serif-display font-light text-6xl lg:text-7xl text-[#0A192F]">{s.value}</p>
            <span className="block w-10 h-px bg-[#B45309] my-5" />
            <p className="text-sm font-light text-slate-500 leading-relaxed">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-24 border border-slate-200 bg-[#FAFAFA] p-10 lg:p-16"
        data-testid="paradigm-shift"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.3fr] gap-12 lg:gap-16 items-center">
          <div data-testid="paradigm-old">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">{t.paradigmOld.title}</p>
            {t.paradigmOld.steps.map((step, i) => (
              <motion.p
                key={step}
                variants={fadeUp}
                custom={i * 0.6}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-serif-display italic text-3xl lg:text-4xl text-slate-300 line-through decoration-slate-300 decoration-1 mb-4"
                style={{ marginLeft: `${i * 20}px` }}
              >
                {step}
              </motion.p>
            ))}
          </div>

          <div className="flex lg:flex-col items-center gap-4 text-[#B45309]" data-testid="paradigm-shift-label">
            <span className="hidden lg:block h-20 w-px bg-gradient-to-b from-transparent via-[#B45309]/50 to-transparent" />
            <span className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-[#B45309]/50 to-transparent" />
            <MoveRight size={20} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">{t.shiftLabel}</span>
            <span className="hidden lg:block h-20 w-px bg-gradient-to-b from-transparent via-[#B45309]/50 to-transparent" />
            <span className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-[#B45309]/50 to-transparent" />
          </div>

          <div data-testid="paradigm-new">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700 mb-8">{t.paradigmNew.title}</p>
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
                <span className="font-serif-display italic text-[#B45309] text-lg shrink-0 w-8">0{i + 1}</span>
                <div className="flex-1">
                  <p className="font-serif-display font-light text-3xl lg:text-5xl text-[#0A192F] group-hover:text-emerald-700 transition-colors duration-500">{step}</p>
                  {i < t.paradigmNew.steps.length - 1 && (
                    <span className="block mt-5 h-px w-full bg-slate-200" />
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
