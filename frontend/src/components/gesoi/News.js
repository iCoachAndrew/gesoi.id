import { motion } from "framer-motion";
import { SectionHeader, fadeUp } from "./SectionHeader";

const Card = ({ item, i, large }) => {
  const Wrapper = item.link ? "a" : "div";
  return (
    <motion.div
      variants={fadeUp}
      custom={i * 0.5}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={large ? "md:col-span-2 md:row-span-2" : ""}
      data-testid={`news-card-${i}`}
    >
      <Wrapper
        {...(item.link ? { href: item.link, target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`group relative block w-full overflow-hidden rounded-2xl ${large ? "h-80 md:h-full md:min-h-[420px]" : "h-72"}`}
      >
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-10 bg-white rounded-xl p-4 shadow-lg">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-1.5">
            <span className="w-2 h-2 bg-[#D4AF37]" /> {item.category}
          </p>
          <h3 className={`text-[#0B1F3A] font-medium leading-snug ${large ? "text-base md:text-lg" : "text-sm"}`}>{item.title}</h3>
        </div>
      </Wrapper>
    </motion.div>
  );
};

export const News = ({ t }) => (
  <section id="news" className="py-24 lg:py-36 bg-[#F9F9F7]" data-testid="news-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <SectionHeader kicker={t.kicker} title={t.title} testId="news-header" />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 md:auto-rows-fr">
        {t.items.map((item, i) => (
          <Card key={i} item={item} i={i} large={i === 0} />
        ))}
      </div>
    </div>
  </section>
);
