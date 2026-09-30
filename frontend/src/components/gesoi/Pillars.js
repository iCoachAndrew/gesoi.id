import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

const PillarRow = ({ item, i }) => (
  <motion.div
    variants={fadeUp}
    custom={i * 0.5}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    className="group grid grid-cols-12 gap-4 items-baseline py-10 lg:py-14 border-b border-slate-200"
    data-testid={`pillar-item-${item.num}`}
  >
    <span className="col-span-2 lg:col-span-1 font-serif-display italic text-2xl lg:text-3xl text-[var(--g-gold)]">{item.num}</span>
    <div className="col-span-10 lg:col-span-4 flex items-start gap-4">
      {item.image && (
        <img src={item.image} alt={item.title} loading="lazy" className="w-14 h-14 rounded-full object-cover shrink-0" />
      )}
      <h3 className="font-serif-display font-light text-3xl lg:text-4xl text-[var(--g-navy)] group-hover:text-emerald-700 transition-colors duration-300">
        {item.title}
      </h3>
    </div>
    <p className="col-span-10 col-start-3 lg:col-span-6 lg:col-start-7 text-slate-500 font-light leading-relaxed">
      {item.desc}
    </p>
  </motion.div>
);

const PillarCard = ({ item, i }) => (
  <motion.div
    variants={fadeUp}
    custom={i * 0.5}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    className="group bg-white border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgba(10,25,47,0.06)] transition-shadow duration-500"
    data-testid={`pillar-card-${item.num}`}
  >
    {item.image ? (
      <div className="h-48 overflow-hidden">
        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
    ) : (
      <div className="h-48 bg-[#FAFAFA] border-b border-slate-100 flex items-center justify-center">
        <span className="font-serif-display italic text-6xl text-[#B45309]/40">{item.num}</span>
      </div>
    )}
    <div className="p-7">
      <span className="font-serif-display italic text-lg text-[var(--g-gold)]">{item.num}</span>
      <h3 className="font-serif-display text-2xl text-[var(--g-navy)] mt-1 mb-3 group-hover:text-emerald-700 transition-colors duration-300">{item.title}</h3>
      <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
    </div>
  </motion.div>
);

export const Pillars = ({ t }) => (
  <section id="pillars" className="py-24 lg:py-32 bg-white" data-testid="pillars-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} testId="pillars-header" />

      {t.layout === "cards" ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => (
            <PillarCard key={item.num} item={item} i={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 border-t border-slate-200">
          {t.items.map((item, i) => (
            <PillarRow key={item.num} item={item} i={i} />
          ))}
        </div>
      )}
    </div>
  </section>
);
