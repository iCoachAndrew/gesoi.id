import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

const initials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const gradients = [
  "from-[#0B1F3A] to-[#1B3A63]",
  "from-[#123024] to-[#1E5C42]",
  "from-[#2A2413] to-[#5C4E1E]",
];

export const Governance = ({ t, people, lang }) => (
  <section id="governance" className="py-24 lg:py-36 bg-white" data-testid="governance-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="governance-header" />
    </div>

    <div className="mt-16 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]" data-testid="people-carousel">
        {people.map((p, i) => (
          <motion.div
            key={p.name}
            variants={fadeUp}
            custom={Math.min(i, 5) * 0.4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="snap-start shrink-0 w-60 sm:w-64"
            data-testid={`person-card-${i}`}
          >
            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              {p.photo ? (
                <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradients[i % 3]}`}>
                  <span className="font-serif-display text-6xl text-[#D4AF37]/80">{initials(p.name)}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 m-3 rounded-xl bg-white p-4 shadow-lg">
                <p className="font-medium text-[#0B1F3A] text-sm leading-snug">{p.name}</p>
                <p className="text-xs text-[#4B5563] mt-1 font-light">{lang === "id" ? p.role_id : p.role_en}</p>
              </div>
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
          className="mt-8 text-sm text-[#4B5563] font-light flex items-center gap-3"
          data-testid="governance-note"
        >
          <span className="w-8 h-px bg-[#D4AF37]" />
          {t.note}
        </motion.p>
      )}
    </div>
  </section>
);
