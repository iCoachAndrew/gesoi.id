import { motion } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const SectionHeader = ({ kicker, title, body, dark = false, testId }) => (
  <div className="max-w-3xl" data-testid={testId}>
    <motion.p
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`text-xs font-bold uppercase tracking-[0.25em] mb-6 ${dark ? "text-emerald-300" : "text-emerald-700"}`}
    >
      {kicker}
    </motion.p>
    <motion.h2
      variants={fadeUp}
      custom={1}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`font-serif-display font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight ${dark ? "text-white" : "text-[var(--g-navy)]"}`}
    >
      {title}
    </motion.h2>
    {body && (
      <motion.p
        variants={fadeUp}
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className={`mt-6 text-base md:text-lg font-light leading-relaxed ${dark ? "text-white/70" : "text-slate-600"}`}
      >
        {body}
      </motion.p>
    )}
  </div>
);
