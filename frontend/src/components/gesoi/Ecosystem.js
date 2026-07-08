import { motion } from "framer-motion";
import { FlaskConical, Megaphone, Cpu, Network, ArrowDown } from "lucide-react";
import { SectionHeader, fadeUp } from "./SectionHeader";

const icons = [FlaskConical, Megaphone, Cpu, Network];

export const Ecosystem = ({ t }) => (
  <section id="ecosystem" className="py-24 lg:py-36 bg-[#0B1F3A] relative overflow-hidden grain-overlay" data-testid="ecosystem-section">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
      <SectionHeader kicker={t.kicker} title={t.title} body={t.body} dark testId="ecosystem-header" />

      {t.cooperation && (
        <div className="mt-10 flex flex-wrap items-center gap-3" data-testid="cooperation-pillars">
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.25em] mr-2">{t.coopLabel}</span>
          {t.cooperation.map((c) => (
            <span key={c} className="px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-xs uppercase tracking-wider">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {t.nodes.map((node, i) => {
          const Icon = icons[i];
          const featured = node.name === "GESOI";
          return (
            <motion.div
              key={node.name}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className={`relative rounded-2xl p-8 backdrop-blur-xl border transition-transform duration-500 hover:-translate-y-2 ${
                featured
                  ? "bg-emerald-500/15 border-[#D4AF37]/50 lg:-mt-6 lg:mb-6"
                  : "bg-white/5 border-white/10"
              }`}
              data-testid={`ecosystem-node-${node.name.toLowerCase()}`}
            >
              {i < t.nodes.length - 1 && (
                <span className="hidden lg:flex absolute top-1/2 -right-5 z-20 w-10 items-center justify-center text-emerald-400/70">
                  <ArrowDown size={18} className="-rotate-90" />
                </span>
              )}
              <span className={`inline-flex w-12 h-12 rounded-full items-center justify-center border mb-6 ${featured ? "bg-[#D4AF37]/20 border-[#D4AF37]/50" : "bg-emerald-500/10 border-emerald-400/30"}`}>
                <Icon size={20} className={featured ? "text-[#D4AF37]" : "text-emerald-300"} />
              </span>
              <p className={`text-[10px] uppercase tracking-[0.25em] mb-2 ${featured ? "text-[#D4AF37]" : "text-emerald-300/80"}`}>{node.role}</p>
              <h3 className="font-serif-display text-white text-3xl mb-3">{node.name}</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">{node.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
