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
    <section id="video" className="py-24 lg:py-36 bg-white overflow-hidden" data-testid="video-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-10"
        >
          {t.kicker}
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-8 relative z-0"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(11,31,58,0.25)] aspect-video bg-[#0B1F3A]">
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
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#0B1F3A]/70 backdrop-blur flex items-center justify-center text-white hover:bg-[#0B1F3A] transition-colors duration-300"
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
            className="lg:col-span-4 relative z-10 lg:-ml-12 mt-[-3rem] lg:mt-0 mx-4 lg:mx-0"
          >
            <div className="bg-emerald-700 rounded-2xl p-8 lg:p-10 shadow-[0_16px_48px_rgba(4,120,87,0.35)] grain-overlay relative overflow-hidden">
              <div className="relative z-10">
                <p className="font-serif-display text-white text-xl lg:text-2xl leading-relaxed" data-testid="video-quote">
                  <span className="text-[#D4AF37] text-3xl leading-none mr-1">“</span>
                  {t.quote}
                  <span className="text-[#D4AF37] text-3xl leading-none ml-1">”</span>
                </p>
                <p className="mt-6 text-white font-medium text-sm">{t.author}</p>
                <p className="text-white/70 text-xs font-light mt-1">{t.role}</p>
                <button
                  onClick={watch}
                  data-testid="video-watch-btn"
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#0B1F3A] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#e5c657] hover:scale-[1.03] transition-[background-color,transform] duration-300"
                >
                  {t.watchLabel} <Play size={14} fill="#0B1F3A" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
