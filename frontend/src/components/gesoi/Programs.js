import { motion } from "framer-motion";
import { SectionIcon } from "../../lib/icons";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Programs = ({ t, image }) => (
  <section id="programs" className="py-24 lg:py-32 bg-[#FAFAFA]" data-testid="programs-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="programs-header" />
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-12 overflow-hidden"
            >
              <img
                src={image}
                alt="Indonesian community"
                className="w-full h-72 object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.items.map((item, i) => {
            const showImage = t.layout === "media" && item.image;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i * 0.5}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="bg-white border border-slate-200 overflow-hidden group hover:shadow-[0_8px_30px_rgba(10,25,47,0.06)] hover:border-emerald-600/30 transition-[box-shadow,border-color] duration-500"
                data-testid={`program-card-${i}`}
              >
                {showImage && (
                  <div className="h-36 overflow-hidden">
                    <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-8">
                  {!showImage && (
                    <span className="inline-flex w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 items-center justify-center mb-5">
                      <SectionIcon icon={item.icon} size={18} className="text-emerald-700" />
                    </span>
                  )}
                  <h3 className="text-lg font-medium text-[var(--g-navy)] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
