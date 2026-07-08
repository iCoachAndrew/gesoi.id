import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Pillars = ({ t }) => (
  <section id="pillars" className="py-24 lg:py-36 bg-[#F9F9F7]" data-testid="pillars-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} testId="pillars-header" />

      <div className="mt-16 border-t border-[#0B1F3A]/10">
        {t.items.map((item, i) => (
          <motion.div
            key={item.num}
            variants={fadeUp}
            custom={i * 0.5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="group grid grid-cols-12 gap-4 items-baseline py-10 lg:py-12 border-b border-[#0B1F3A]/10 hover:bg-white transition-colors duration-500 px-4 -mx-4 rounded-lg"
            data-testid={`pillar-item-${item.num}`}
          >
            <span className="col-span-2 lg:col-span-1 font-serif-display italic text-2xl lg:text-3xl text-[#D4AF37]">{item.num}</span>
            <h3 className="col-span-10 lg:col-span-4 font-serif-display text-3xl lg:text-4xl text-[#0B1F3A] group-hover:text-emerald-700 transition-colors duration-300">
              {item.title}
            </h3>
            <p className="col-span-10 col-start-3 lg:col-span-6 lg:col-start-7 text-[#4B5563] font-light leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
