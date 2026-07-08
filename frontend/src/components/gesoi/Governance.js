import { motion } from "framer-motion";
import { Shield, Users, Landmark } from "lucide-react";
import { SectionHeader, fadeUp } from "./SectionHeader";

const icons = [Shield, Users, Landmark];

export const Governance = ({ t }) => (
  <section id="governance" className="py-24 lg:py-36 bg-[#F9F9F7]" data-testid="governance-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="governance-header" />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <motion.div
              key={item.role}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-transform duration-500"
              data-testid={`governance-card-${i}`}
            >
              <span className="inline-flex w-12 h-12 rounded-full bg-[#0B1F3A] items-center justify-center mb-6">
                <Icon size={20} className="text-[#D4AF37]" />
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 mb-2">{item.role}</p>
              <h3 className="font-serif-display text-3xl text-[#0B1F3A] mb-2">{item.name}</h3>
              <p className="text-sm text-[#4B5563] font-light">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {t.council && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-12 rounded-2xl bg-[#0B1F3A] p-8 lg:p-10 grain-overlay relative overflow-hidden"
          data-testid="advisory-council"
        >
          <div className="relative z-10">
            <h3 className="font-serif-display text-white text-2xl lg:text-3xl mb-2">{t.councilTitle}</h3>
            <p className="text-white/60 text-sm font-light mb-6">{t.councilBody}</p>
            <div className="flex flex-wrap gap-2.5">
              {t.council.map((name) => (
                <span key={name} className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white/80 text-xs sm:text-sm font-light">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  </section>
);
