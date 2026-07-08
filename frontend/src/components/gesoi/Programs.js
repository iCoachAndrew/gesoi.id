import { motion } from "framer-motion";
import { SectionIcon } from "../../lib/icons";
import { SectionHeader, fadeUp } from "./SectionHeader";

export const Programs = ({ t, image }) => (
  <section id="programs" className="py-24 lg:py-36 bg-white" data-testid="programs-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="programs-header" />
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
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
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i * 0.5}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="rounded-2xl border border-[#0B1F3A]/10 bg-[#F9F9F7] p-8 hover:bg-[#0B1F3A] group transition-colors duration-500"
                data-testid={`program-card-${i}`}
              >
                <span className="inline-flex w-11 h-11 rounded-full bg-emerald-100 group-hover:bg-emerald-500/20 items-center justify-center mb-5 transition-colors duration-500">
                  <SectionIcon icon={item.icon} size={18} className="text-emerald-700 group-hover:text-emerald-300 transition-colors duration-500" />
                </span>
                <h3 className="text-lg font-medium text-[#0B1F3A] group-hover:text-white transition-colors duration-500 mb-2">{item.title}</h3>
                <p className="text-sm text-[#4B5563] group-hover:text-white/60 font-light leading-relaxed transition-colors duration-500">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
