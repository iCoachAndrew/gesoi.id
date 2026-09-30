import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Roadmap = ({ t }) => (
  <section id="roadmap" className="py-24 lg:py-32 bg-white" data-testid="roadmap-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} testId="roadmap-header" />

      <div className="mt-20 relative">
        <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-slate-200" />
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
            <span className="absolute left-6 lg:left-1/2 -translate-x-1/2 top-2.5 w-3 h-3 rounded-full bg-white border-2 border-[var(--g-gold)]" />
            <div className={`pl-16 lg:pl-0 ${i % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16"}`}>
              <p className="font-serif-display italic text-[var(--g-gold)] text-4xl lg:text-5xl mb-3">{item.year}</p>
              <h3 className="text-[var(--g-navy)] text-xl font-medium mb-3">{item.title}</h3>
              <p className="text-slate-500 font-light leading-relaxed max-w-md inline-block">{item.desc}</p>
            </div>
            {t.layout === "photos" && item.image && (
              <div className={`pl-16 lg:pl-0 ${i % 2 === 0 ? "lg:col-start-2 lg:pl-16" : "lg:col-start-1 lg:row-start-1 lg:pr-16 lg:text-right"}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="inline-block w-full max-w-md h-52 object-cover border border-slate-200"
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
