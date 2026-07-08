import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

const PillarRow = ({ item, i }) => (
  <motion.div
    variants={fadeUp}
    custom={i * 0.5}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    className="group grid grid-cols-12 gap-4 items-baseline py-10 lg:py-12 border-b border-[#0B1F3A]/10 hover:bg-white transition-colors duration-500 px-4 -mx-4 rounded-lg"
    data-testid={`pillar-item-${item.num}`}
  >
    <span className="col-span-2 lg:col-span-1 font-serif-display italic text-2xl lg:text-3xl text-[#D4AF37]">{item.num}</span>
    <div className="col-span-10 lg:col-span-4 flex items-start gap-4">
      {item.image && (
        <img src={item.image} alt={item.title} loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md" />
      )}
      <h3 className="font-serif-display text-3xl lg:text-4xl text-[#0B1F3A] group-hover:text-emerald-700 transition-colors duration-300">
        {item.title}
      </h3>
    </div>
    <p className="col-span-10 col-start-3 lg:col-span-6 lg:col-start-7 text-[#4B5563] font-light leading-relaxed">
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
    className="group rounded-2xl bg-white border border-[#0B1F3A]/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-transform duration-500"
    data-testid={`pillar-card-${item.num}`}
  >
    {item.image ? (
      <div className="h-44 overflow-hidden">
        <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
    ) : (
      <div className="h-44 bg-[#0B1F3A] flex items-center justify-center grain-overlay relative">
        <span className="font-serif-display italic text-6xl text-[#D4AF37]/70">{item.num}</span>
      </div>
    )}
    <div className="p-7">
      <span className="font-serif-display italic text-lg text-[#D4AF37]">{item.num}</span>
      <h3 className="font-serif-display text-2xl text-[#0B1F3A] mt-1 mb-3 group-hover:text-emerald-700 transition-colors duration-300">{item.title}</h3>
      <p className="text-sm text-[#4B5563] font-light leading-relaxed">{item.desc}</p>
    </div>
  </motion.div>
);

export const Pillars = ({ t }) => (
  <section id="pillars" className="py-24 lg:py-36 bg-[#F9F9F7]" data-testid="pillars-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} testId="pillars-header" />

      {t.layout === "cards" ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => (
            <PillarCard key={item.num} item={item} i={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 border-t border-[#0B1F3A]/10">
          {t.items.map((item, i) => (
            <PillarRow key={item.num} item={item} i={i} />
          ))}
        </div>
      )}
    </div>
  </section>
);
