import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { trackEvent } from "../../lib/analytics";

const lineVariants = {
  hidden: { y: "110%" },
  visible: (i) => ({
    y: "0%",
    transition: { duration: 1, delay: 0.5 + i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const Hero = ({ t, bg }) => {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section id="top" ref={ref} className="relative min-h-screen bg-[#0B1F3A] overflow-hidden grain-overlay" data-testid="hero-section">
      <motion.div style={{ y: reduceMotion ? 0 : bgY }} className="absolute inset-0 will-change-transform">
        <img
          src={bg}
          alt="Blueprint peta Indonesia"
          fetchPriority="high"
          decoding="async"
          className="w-full h-[120%] object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3A]/70 via-[#0B1F3A]/40 to-[#0B1F3A]" />
      </motion.div>

      <motion.div style={{ y: reduceMotion ? 0 : textY }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-40 pb-24 flex flex-col min-h-screen justify-center will-change-transform">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="inline-flex items-center gap-3 mb-10"
        >
          <span className="h-px w-12 bg-[#D4AF37]" />
          <span className="text-[#D4AF37] text-xs sm:text-sm uppercase tracking-[0.3em]" data-testid="hero-badge">{t.hero.badge}</span>
        </motion.div>

        <h1 className="font-serif-display text-white text-5xl sm:text-6xl lg:text-8xl leading-[1.02] tracking-tight max-w-5xl" data-testid="hero-title">
          {t.hero.lines.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-1">
              <motion.span
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
                className={`block ${i === 1 ? "italic text-emerald-300" : ""} ${i === 3 ? "text-[#D4AF37]" : ""}`}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          className="mt-10 text-white/70 text-base md:text-lg max-w-xl font-light leading-relaxed"
          data-testid="hero-subtitle"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <a
            href="#join"
            onClick={() => trackEvent("join_click")}
            data-testid="hero-cta-primary"
            className="px-8 py-4 rounded-full bg-emerald-500 text-white text-sm uppercase tracking-[0.15em] font-medium hover:bg-emerald-400 hover:scale-[1.03] transition-[background-color,transform] duration-300"
          >
            {t.hero.cta1}
          </a>
          <a
            href="#problem"
            data-testid="hero-cta-secondary"
            className="px-8 py-4 rounded-full border border-white/30 text-white text-sm uppercase tracking-[0.15em] hover:border-emerald-300 hover:text-emerald-300 transition-colors duration-300"
          >
            {t.hero.cta2}
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.9 }}
          className="mt-10 inline-flex items-center gap-2.5 self-start px-5 py-2.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-xs sm:text-sm tracking-[0.15em] uppercase"
          data-testid="hero-launch-badge"
        >
          <Sparkles size={14} />
          {t.hero.launch}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10 left-6 lg:left-10 flex items-center gap-3 text-white/50 text-xs uppercase tracking-[0.2em]"
          data-testid="hero-scroll-hint"
        >
          <ArrowDown size={14} className="animate-bounce" />
          {t.hero.scroll}
        </motion.div>
      </motion.div>
    </section>
  );
};
