import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { SectionHeader, fadeUp } from "./SectionHeader";

const initials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const PersonCard = ({ p, i, lang }) => (
  <div className="shrink-0 w-52 sm:w-60 mr-6" data-testid={`person-card-${i}`}>
    <div className="relative h-64 sm:h-80 overflow-hidden bg-white border border-slate-200">
      {p.photo ? (
        <img src={p.photo} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#F1F5F9]">
          <span className="font-serif-display text-6xl text-[#0A192F]/25">{initials(p.name)}</span>
        </div>
      )}
    </div>
    <div className="pt-4 pb-1">
      <p className="font-medium text-[var(--g-navy)] text-sm leading-snug whitespace-normal">{p.name}</p>
      <p className="text-xs text-slate-500 mt-1 font-light whitespace-normal">{lang === "id" ? p.role_id : p.role_en}</p>
    </div>
  </div>
);

export const Governance = ({ t, people, lang }) => (
  <section id="governance" className="py-24 lg:py-32 bg-[#FAFAFA]" data-testid="governance-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="governance-header" />
    </div>

    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-16"
      data-testid="people-carousel"
    >
      <Marquee speed={35} pauseOnHover gradient={false} autoFill>
        {people.map((p, i) => (
          <PersonCard key={p.name} p={p} i={i} lang={lang} />
        ))}
      </Marquee>
    </motion.div>

    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      {t.note && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 text-sm text-slate-500 font-light flex items-center gap-3"
          data-testid="governance-note"
        >
          <span className="w-8 h-px bg-[var(--g-gold)]" />
          {t.note}
        </motion.p>
      )}
    </div>
  </section>
);
