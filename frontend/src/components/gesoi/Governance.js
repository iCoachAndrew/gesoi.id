import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

const initials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const Governance = ({ t, people, lang }) => (
  <section id="governance" className="py-24 lg:py-32 bg-[#FAFAFA]" data-testid="governance-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="governance-header" />
    </div>

    <div className="mt-16 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]" data-testid="people-carousel">
        {people.map((p, i) => (
          <motion.div
            key={p.name}
            variants={fadeUp}
            custom={Math.min(i, 5) * 0.4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="snap-start shrink-0 w-56 sm:w-60"
            data-testid={`person-card-${i}`}
          >
            <div className="relative h-72 sm:h-80 overflow-hidden bg-white border border-slate-200">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F1F5F9]">
                  <span className="font-serif-display text-6xl text-[#0A192F]/25">{initials(p.name)}</span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <p className="font-medium text-[#0A192F] text-sm leading-snug">{p.name}</p>
              <p className="text-xs text-slate-500 mt-1 font-light">{lang === "id" ? p.role_id : p.role_en}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {t.note && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 text-sm text-slate-500 font-light flex items-center gap-3"
          data-testid="governance-note"
        >
          <span className="w-8 h-px bg-[#B45309]" />
          {t.note}
        </motion.p>
      )}
    </div>
  </section>
);
