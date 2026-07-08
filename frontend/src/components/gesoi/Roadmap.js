import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Roadmap = ({ t }) => (
  <section id="roadmap" className="py-24 lg:py-36 bg-[#0B1F3A] relative overflow-hidden grain-overlay" data-testid="roadmap-section">
    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
      <SectionHeader kicker={t.kicker} title={t.title} dark testId="roadmap-header" />

      <div className="mt-20 relative">
        <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/60 via-emerald-400/20 to-[#D4AF37]/60" />
        {t.items.map((item, i) => (
          <motion.div
            key={item.year}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 pb-16 last:pb-0"
            data-testid={`roadmap-item-${i}`}
          >
            <span className="absolute left-6 lg:left-1/2 -translate-x-1/2 top-2 w-4 h-4 rounded-full bg-[#0B1F3A] border-2 border-emerald-400" />
            <div className={`pl-16 lg:pl-0 ${i % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16"}`}>
              <p className="font-serif-display italic text-[#D4AF37] text-4xl lg:text-5xl mb-3">{item.year}</p>
              <h3 className="text-white text-xl font-medium mb-3">{item.title}</h3>
              <p className="text-white/60 font-light leading-relaxed max-w-md inline-block">{item.desc}</p>
            </div>
            {t.layout === "photos" && item.image && (
              <div className={`pl-16 lg:pl-0 ${i % 2 === 0 ? "lg:col-start-2 lg:pl-16" : "lg:col-start-1 lg:row-start-1 lg:pr-16 lg:text-right"}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="inline-block w-full max-w-md h-52 object-cover rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                  data-testid={`roadmap-image-${i}`}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
