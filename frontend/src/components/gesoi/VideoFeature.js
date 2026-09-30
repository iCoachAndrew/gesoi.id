import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import { fadeUp } from "./SectionHeader";

export const VideoFeature = ({ t }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) {
          el.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const watch = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    setMuted(false);
    el.play().then(() => setPlaying(true)).catch(() => {});
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  return (
    <section id="video" className="py-24 lg:py-32 bg-white overflow-hidden" data-testid="video-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-10"
        >
          {t.kicker}
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-8"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-[var(--g-navy)] shadow-[0_16px_48px_rgba(10,25,47,0.12)]">
              <video
                ref={videoRef}
                src={t.url}
                poster={t.poster || undefined}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
                data-testid="feature-video"
              />
              <button
                onClick={toggleMute}
                data-testid="video-mute-btn"
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/35 transition-colors duration-300"
                aria-label="Toggle sound"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-4"
          >
            <div className="border-l-2 border-[var(--g-gold)] pl-8">
              <p className="font-serif-display italic font-light text-[var(--g-navy)] text-2xl lg:text-3xl leading-relaxed" data-testid="video-quote">
                “{t.quote}”
              </p>
              <p className="mt-6 text-[var(--g-navy)] font-medium text-sm">{t.author}</p>
              <p className="text-slate-500 text-xs font-light mt-1">{t.role}</p>
              <button
                onClick={watch}
                data-testid="video-watch-btn"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-300"
              >
                {t.watchLabel} <Play size={13} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
