import { motion } from "framer-motion";
import { SectionIcon } from "../../lib/icons";
import { SectionHeader, fadeUp } from "./SectionHeader";

const ORBIT_POS = [
  { left: "6%", top: "38%" },
  { left: "40%", top: "36%", center: true },
  { left: "74%", top: "12%" },
  { left: "72%", top: "62%" },
];

const OrbitNode = ({ node, i, featured }) => {
  const pos = ORBIT_POS[i] || ORBIT_POS[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute group cursor-default"
      style={{ left: pos.left, top: pos.top }}
      data-testid={`ecosystem-node-${node.name.toLowerCase()}`}
    >
      <motion.div
        animate={{ y: [0, featured ? 0 : -10, 0] }}
        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        className={`relative flex flex-col items-center justify-center text-center rounded-full bg-white border transition-all duration-500 group-hover:scale-105 ${
          featured
            ? "w-56 h-56 border-emerald-600/50 shadow-[0_16px_50px_rgba(5,150,105,0.12)]"
            : "w-40 h-40 border-slate-200 shadow-[0_8px_30px_rgba(10,25,47,0.06)] group-hover:border-emerald-500/40"
        }`}
      >
        <span className={`inline-flex w-10 h-10 rounded-full items-center justify-center border mb-2 ${featured ? "bg-emerald-50 border-emerald-200" : "bg-[#FAFAFA] border-slate-200"}`}>
          <SectionIcon icon={node.icon} size={16} className={featured ? "text-emerald-700" : "text-slate-500"} />
        </span>
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 ${featured ? "text-emerald-700" : "text-slate-400"}`}>{node.role}</p>
        <h3 className={`font-serif-display text-[var(--g-navy)] ${featured ? "text-3xl" : "text-xl"}`}>{node.name}</h3>
      </motion.div>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 rounded-lg bg-white border border-slate-200 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 shadow-xl">
        <p className="text-slate-500 text-xs font-light leading-relaxed">{node.desc}</p>
      </div>
    </motion.div>
  );
};

const OrbitLayout = ({ nodes }) => (
  <div className="relative hidden lg:block h-[520px] mt-8" data-testid="ecosystem-orbit">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 520" fill="none" preserveAspectRatio="none">
      <line x1="180" y1="270" x2="470" y2="290" stroke="rgba(5,150,105,0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
      <line x1="560" y1="250" x2="800" y2="130" stroke="rgba(5,150,105,0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
      <line x1="560" y1="310" x2="780" y2="390" stroke="rgba(180,83,9,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
      <circle cx="500" cy="280" r="230" stroke="rgba(10,25,47,0.05)" strokeWidth="1" />
    </svg>
    {nodes.map((node, i) => (
      <OrbitNode key={node.name} node={node} i={i} featured={node.name === "GESOI"} />
    ))}
  </div>
);

const GridCards = ({ nodes, className }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 ${className || ""}`}>
    {nodes.map((node, i) => {
      const featured = node.name === "GESOI";
      return (
        <motion.div
          key={node.name}
          variants={fadeUp}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={`relative bg-white p-8 border transition-[box-shadow,border-color] duration-500 hover:shadow-[0_8px_30px_rgba(10,25,47,0.06)] ${
            featured ? "border-emerald-600/40" : "border-slate-200"
          }`}
          data-testid={`ecosystem-card-${node.name.toLowerCase()}`}
        >
          <span className={`inline-flex w-11 h-11 rounded-full items-center justify-center border mb-5 ${featured ? "bg-emerald-50 border-emerald-200" : "bg-[#FAFAFA] border-slate-200"}`}>
            <SectionIcon icon={node.icon} size={18} className={featured ? "text-emerald-700" : "text-slate-500"} />
          </span>
          <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-2 ${featured ? "text-emerald-700" : "text-slate-400"}`}>{node.role}</p>
          <h3 className="font-serif-display text-[var(--g-navy)] text-2xl mb-3">{node.name}</h3>
          <p className="text-slate-500 text-sm font-light leading-relaxed">{node.desc}</p>
        </motion.div>
      );
    })}
  </div>
);

export const Ecosystem = ({ t }) => (
  <section id="ecosystem" className="py-24 lg:py-32 bg-[#FAFAFA] relative overflow-hidden" data-testid="ecosystem-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} testId="ecosystem-header" />

      {t.cooperation && (
        <div className="mt-10 flex flex-wrap items-center gap-3" data-testid="cooperation-pillars">
          <span className="text-[var(--g-gold)] text-xs font-bold uppercase tracking-[0.25em] mr-2">{t.coopLabel}</span>
          {t.cooperation.map((c) => (
            <span key={c} className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs uppercase tracking-wider hover:border-emerald-600 hover:text-emerald-700 transition-colors duration-300">
              {c}
            </span>
          ))}
        </div>
      )}

      {t.layout === "grid" ? (
        <GridCards nodes={t.nodes} className="mt-16" />
      ) : (
        <>
          <OrbitLayout nodes={t.nodes} />
          <GridCards nodes={t.nodes} className="mt-14 lg:hidden" />
        </>
      )}
    </div>
  </section>
);
