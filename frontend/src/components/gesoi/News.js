import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SectionHeader, fadeUp } from "./SectionHeader";
import { newsUrl } from "../../lib/slug";

const CardInner = ({ item, large }) => (
  <>
    <img
      src={item.image}
      alt={item.title}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/25 to-transparent" />
    <div className="absolute bottom-4 left-4 right-10 bg-white p-4 shadow-lg">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-1.5">
        <span className="w-2 h-2 bg-[#B45309]" /> {item.category}
        {item.date && <span className="text-slate-400 normal-case tracking-normal font-light ml-auto">{item.date}</span>}
      </p>
      <h3 className={`text-[#0A192F] font-medium leading-snug ${large ? "text-base md:text-lg" : "text-sm"}`}>{item.title}</h3>
    </div>
  </>
);

const Card = ({ item, i, large }) => {
  const cls = `group relative block w-full overflow-hidden rounded-2xl ${large ? "h-80 md:h-full md:min-h-[420px]" : "h-72"}`;
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
      {item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className={cls}>
          <CardInner item={item} large={large} />
        </a>
      ) : (
        <Link to={newsUrl(item, i)} className={cls} data-testid={`news-card-link-${i}`}>
          <CardInner item={item} large={large} />
        </Link>
      )}
    </motion.div>
  );
};

export const News = ({ t }) => (
  <section id="news" className="py-24 lg:py-32 bg-white" data-testid="news-section">
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
