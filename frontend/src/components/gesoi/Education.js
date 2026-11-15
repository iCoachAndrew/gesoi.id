import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Sparkles,
  Search,
  X,
  ArrowUpRight,
  CheckCircle2,
  Film,
  User,
  Clock,
} from "lucide-react";
import { fadeUp } from "./SectionHeader";
import { trackEvent } from "../../lib/analytics";
import {
  buildEducationVideoList,
  formatDuration,
  getYoutubeEmbedUrl,
} from "../../lib/educationVideos";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const WhatsAppIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const VideoCardThumbnail = ({ item, isActive, onDurationDetected }) => {
  const hoverVideoRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const onEnter = () => {
    setHovering(true);
    const el = hoverVideoRef.current;
    if (el) {
      el.currentTime = 0.5;
      el.play().catch(() => {});
    }
  };

  const onLeave = () => {
    setHovering(false);
    const el = hoverVideoRef.current;
    if (el) {
      el.pause();
    }
  };

  const isYt = Boolean(getYoutubeEmbedUrl(item.url));

  return (
    <div
      className="relative aspect-[9/16] w-full bg-[#0A192F] overflow-hidden"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {item.poster ? (
        <>
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              hovering && !isYt ? "opacity-0" : "opacity-95"
            }`}
          />
          {!isYt && item.url && hovering && (
            <video
              ref={hoverVideoRef}
              src={item.url}
              muted
              autoPlay
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const d = formatDuration(e.currentTarget.duration);
                if (d && onDurationDetected) onDurationDetected(d);
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </>
      ) : !isYt && item.url ? (
        <video
          ref={hoverVideoRef}
          src={`${item.url}#t=0.5`}
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = formatDuration(e.currentTarget.duration);
            if (d && onDurationDetected) onDurationDetected(d);
          }}
          className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A192F] to-[#112A46]">
          <Film size={32} className="text-emerald-400/60" />
        </div>
      )}

      {/* Top & Bottom Vignette Overlays for 9:16 Shorts */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/70 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/65 to-transparent pointer-events-none" />

      {/* Center Play Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isActive
              ? "bg-emerald-600 text-white scale-110 ring-4 ring-emerald-500/30"
              : "bg-white/30 backdrop-blur-md text-white group-hover:bg-emerald-600"
          }`}
        >
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </span>
      </div>
    </div>
  );
};

export const Education = ({
  t,
  lang = "id",
  isFullPage = false,
  initialVideoIndex = 0,
}) => {
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(initialVideoIndex || 0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [detectedDurations, setDetectedDurations] = useState({});

  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const shouldAutoStartRef = useRef(false);

  useEffect(() => {
    axios
      .get(`${API}/videos`)
      .then((r) => {
        if (Array.isArray(r.data)) setGalleryVideos(r.data);
      })
      .catch(() => {});
  }, []);

  const allVideos = useMemo(
    () => buildEducationVideoList(t?.items || [], galleryVideos, lang),
    [t?.items, galleryVideos, lang]
  );

  useEffect(() => {
    if (initialVideoIndex >= 0 && initialVideoIndex < allVideos.length) {
      setActiveIdx(initialVideoIndex);
    }
  }, [initialVideoIndex, allVideos.length]);

  const categories = useMemo(() => {
    const counts = {};
    for (const v of allVideos) {
      const cat = (v.category || "").trim();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts);
  }, [allVideos]);

  const filteredVideos = useMemo(() => {
    return allVideos
      .map((item, idx) => ({ ...item, _globalIdx: idx }))
      .filter((item) => {
        const matchCat =
          activeCategory === "ALL" ||
          (item.category || "").toLowerCase() === activeCategory.toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return matchCat;
        const hay = `${item.title || ""} ${item.desc || ""} ${item.speaker || ""} ${item.category || ""}`.toLowerCase();
        return matchCat && hay.includes(q);
      });
  }, [allVideos, activeCategory, searchQuery]);

  const safeActiveIdx = activeIdx < allVideos.length ? activeIdx : 0;
  const activeVideo = allVideos[safeActiveIdx] || allVideos[0] || null;
  const activeYtEmbed = activeVideo ? getYoutubeEmbedUrl(activeVideo.url) : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
    if (shouldAutoStartRef.current) {
      shouldAutoStartRef.current = false;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(false);
    }
  }, [safeActiveIdx, activeVideo?.url, playbackRate]);

  const selectAndPlay = (idx, scrollStage = false) => {
    shouldAutoStartRef.current = true;
    setActiveIdx(idx);
    trackEvent("edu_video_select", String(idx));
    if (scrollStage && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      if (rect.top < -80 || rect.top > window.innerHeight * 0.5) {
        stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const goPrev = () => {
    if (!allVideos.length) return;
    const prev = (safeActiveIdx - 1 + allVideos.length) % allVideos.length;
    selectAndPlay(prev, false);
  };

  const goNext = () => {
    if (!allVideos.length) return;
    const next = (safeActiveIdx + 1) % allVideos.length;
    selectAndPlay(next, false);
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    if (autoPlayNext && allVideos.length > 1) {
      const next = (safeActiveIdx + 1) % allVideos.length;
      selectAndPlay(next, false);
    }
  };

  const recordDuration = (idx, durStr) => {
    if (!durStr) return;
    setDetectedDurations((prev) => (prev[idx] === durStr ? prev : { ...prev, [idx]: durStr }));
  };

  const getItemDuration = (item, idx) => item?.duration || detectedDurations[idx] || "";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/edukasi?v=${safeActiveIdx}`;
  }, [safeActiveIdx]);

  if (!t) return null;

  return (
    <section
      id="education"
      className={`${isFullPage ? "pt-28 pb-24 lg:pt-32 lg:pb-32" : "py-24 lg:py-32"} bg-[#FFFFFF] border-t border-slate-100`}
      data-testid="education-section"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-3xl" data-testid="education-header">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap items-center gap-3 mb-5"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                {t.kicker}
              </span>
              {t.badge && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium tracking-wide">
                  <Sparkles size={12} className="text-emerald-600" />
                  {t.badge}
                </span>
              )}
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="font-serif-display font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-[var(--g-navy)]"
            >
              {t.title}
            </motion.h2>

            {t.body && (
              <motion.p
                variants={fadeUp}
                custom={2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-5 text-base md:text-lg font-light leading-relaxed text-slate-600"
              >
                {t.body}
              </motion.p>
            )}
          </div>

          {!isFullPage && (
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="shrink-0"
            >
              <Link
                to="/edukasi"
                data-testid="education-open-page-btn"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-300 shadow-sm"
              >
                {t.ctaPageLabel || "Buka Ruang Edukasi Lengkap"}
                <ArrowUpRight size={15} />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Main Cinema Stage + Interactive Playlist (Zero-Modal, 1-Click Play) */}
        {activeVideo && (
          <motion.div
            ref={stageRef}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="scroll-mt-24 rounded-3xl bg-[#FAFAFA] border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-[0_16px_48px_rgba(10,25,47,0.05)] mb-14"
            data-testid="education-stage"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: 9:16 Vertical Smartphone-style Player */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#0A192F] shadow-[0_24px_60px_rgba(10,25,47,0.22)] border-2 border-slate-800/20 group">
                  {activeYtEmbed ? (
                    <iframe
                      src={activeYtEmbed}
                      title={activeVideo.title}
                      className="w-full h-full border-0 aspect-[9/16]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid="education-active-iframe"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        key={activeVideo.url}
                        src={activeVideo.url}
                        poster={activeVideo.poster || undefined}
                        controls
                        playsInline
                        preload="metadata"
                        muted={muted}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={handleVideoEnded}
                        onLoadedMetadata={(e) => {
                          e.currentTarget.playbackRate = playbackRate;
                          const d = formatDuration(e.currentTarget.duration);
                          if (d) recordDuration(safeActiveIdx, d);
                        }}
                        className="w-full h-full object-cover bg-[#0A192F]"
                        data-testid="education-active-video"
                      />

                      {/* Floating Top Badges inside 9:16 player frame */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                            {t.freeBadge || "Gratis"}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                            Shorts 9:16
                          </span>
                        </div>
                        {getItemDuration(activeVideo, safeActiveIdx) && (
                          <span className="px-2 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white/95 text-[10px] font-medium flex items-center gap-1">
                            <Clock size={10} />
                            {getItemDuration(activeVideo, safeActiveIdx)}
                          </span>
                        )}
                      </div>

                      {/* Big 1-Click Center Play Button Overlay when paused */}
                      {!playing && (
                        <button
                          type="button"
                          onClick={togglePlay}
                          data-testid="education-stage-play-overlay"
                          aria-label={t.watchNowLabel || "Putar Shorts"}
                          className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A192F]/25 hover:bg-[#0A192F]/15 transition-colors duration-300 cursor-pointer"
                        >
                          <span className="w-16 h-16 rounded-full bg-white/95 text-[var(--g-navy)] hover:bg-emerald-600 hover:text-white flex items-center justify-center shadow-[0_12px_32px_rgba(10,25,47,0.35)] hover:scale-105 transition-all duration-300">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right: Active Shorts Info + Low-Click Controls + Up Next Playlist */}
              <div className="lg:col-span-7 flex flex-col h-full justify-between">
                <div>
                  {/* Index & Category Header */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-[0.18em] mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                      Shorts #{String(safeActiveIdx + 1).padStart(2, "0")} / {String(allVideos.length).padStart(2, "0")}
                    </span>
                    {activeVideo.category && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600">{activeVideo.category}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-[var(--g-navy)] leading-snug mb-3"
                    data-testid="education-active-title"
                  >
                    {activeVideo.title}
                  </h3>

                  {/* Description */}
                  {activeVideo.desc && (
                    <p
                      className="text-slate-600 text-sm sm:text-base font-light leading-relaxed mb-5"
                      data-testid="education-active-desc"
                    >
                      {activeVideo.desc}
                    </p>
                  )}

                  {/* Speaker Profile Chip */}
                  {(activeVideo.speaker || activeVideo.role) && (
                    <div className="mb-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                      <span className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                        <User size={16} />
                      </span>
                      <div>
                        {activeVideo.speaker && (
                          <p className="text-xs font-semibold text-[var(--g-navy)]" data-testid="education-active-speaker">
                            {activeVideo.speaker}
                          </p>
                        )}
                        {activeVideo.role && (
                          <p className="text-[11px] text-slate-500 font-light">{activeVideo.role}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {!activeYtEmbed && (
                        <button
                          type="button"
                          onClick={togglePlay}
                          data-testid="education-play-toggle-btn"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.12em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-200"
                        >
                          {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                          {playing ? (lang === "en" ? "Pause" : "Jeda") : t.watchNowLabel || "Putar Shorts"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={goPrev}
                        data-testid="education-prev-btn"
                        title={lang === "en" ? "Previous Shorts" : "Shorts Sebelumnya"}
                        className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
                      >
                        <SkipBack size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        data-testid="education-next-btn"
                        title={lang === "en" ? "Next Shorts" : "Shorts Selanjutnya"}
                        className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
                      >
                        <SkipForward size={14} />
                      </button>

                      {!activeYtEmbed && (
                        <>
                          <button
                            type="button"
                            onClick={toggleMute}
                            data-testid="education-mute-btn"
                            title={muted ? "Unmute" : "Mute"}
                            className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
                          >
                            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>

                          <div
                            className="hidden sm:inline-flex items-center rounded-full bg-slate-50 border border-slate-200 p-0.5 text-[11px]"
                            data-testid="education-speed-controls"
                          >
                            {[1, 1.25, 1.5].map((rate) => (
                              <button
                                key={rate}
                                type="button"
                                onClick={() => changeSpeed(rate)}
                                data-testid={`education-speed-${rate}`}
                                className={`px-2.5 py-1 rounded-full font-medium transition-colors duration-200 ${
                                  playbackRate === rate
                                    ? "bg-[var(--g-navy)] text-white"
                                    : "text-slate-500 hover:text-[var(--g-navy)]"
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Auto-Play Next */}
                      <button
                        type="button"
                        onClick={() => setAutoPlayNext(!autoPlayNext)}
                        data-testid="education-autoplay-toggle"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors duration-200 ${
                          autoPlayNext
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            autoPlayNext ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        />
                        {t.autoPlayLabel || "Lanjut Otomatis"}
                      </button>

                      {/* Share to WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `${activeVideo.title} - Shorts Edukasi Sehat Otak GESOI\n\n${shareUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("edu_share_whatsapp")}
                        data-testid="education-share-whatsapp"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-emerald-800 hover:bg-[#25D366] hover:text-white text-xs font-medium transition-colors duration-200"
                      >
                        <WhatsAppIcon size={13} />
                        <span className="hidden sm:inline">{t.shareLabel || "Bagikan"}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Up Next Shorts Playlist Box */}
                <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--g-navy)]">
                      {t.upNextLabel || "Daftar Shorts Edukasi"}
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {allVideos.length} Shorts
                    </span>
                  </div>

                  <div
                    className="divide-y divide-slate-100 overflow-y-auto max-h-[220px]"
                    data-testid="education-playlist"
                  >
                    {allVideos.map((item, idx) => {
                      const isCurrent = idx === safeActiveIdx;
                      const dur = getItemDuration(item, idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectAndPlay(idx, false)}
                          data-testid={`education-playlist-item-${idx}`}
                          className={`w-full text-left p-3 flex items-center gap-3 transition-colors duration-200 ${
                            isCurrent
                              ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                              : "hover:bg-slate-50/90"
                          }`}
                        >
                          {/* Vertical 9:16 Playlist Thumbnail */}
                          <div className="relative w-12 aspect-[9/16] rounded-lg overflow-hidden bg-[#0A192F] shrink-0 border border-slate-200/80">
                            {item.poster ? (
                              <img
                                src={item.poster}
                                alt={item.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={`${item.url}#t=0.5`}
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                  const d = formatDuration(e.currentTarget.duration);
                                  if (d) recordDuration(idx, d);
                                }}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-[#0A192F]/30 flex items-center justify-center">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isCurrent
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white/80 text-[var(--g-navy)]"
                                }`}
                              >
                                <Play size={10} fill="currentColor" className="ml-0.5" />
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                {isCurrent
                                  ? t.nowPlayingLabel || "Sedang Diputar"
                                  : `Shorts #${String(idx + 1).padStart(2, "0")}`}
                              </span>
                              {dur && (
                                <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                                  {dur}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs leading-snug line-clamp-1 ${
                                isCurrent
                                  ? "font-semibold text-[var(--g-navy)]"
                                  : "font-medium text-slate-700"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.speaker && (
                              <p className="text-[10px] text-slate-400 font-light truncate mt-0.5">
                                {item.speaker}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instant Filter Pills + Search Bar */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          data-testid="education-filters"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("ALL")}
              data-testid="education-cat-all"
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                activeCategory === "ALL"
                  ? "bg-[var(--g-navy)] border-[var(--g-navy)] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-700"
              }`}
            >
              {t.allCategoriesLabel || "Semua Topik"} ({allVideos.length})
            </button>
            {categories.map(([cat, count]) => {
              const active = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  data-testid={`education-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                    active
                      ? "bg-[var(--g-navy)] border-[var(--g-navy)] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || "Cari topik atau judul video..."}
              data-testid="education-search-input"
              className="w-full rounded-full border border-slate-200 bg-[#FAFAFA] pl-9 pr-8 py-2 text-xs text-[var(--g-navy)] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                data-testid="education-search-clear"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--g-navy)]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 9:16 Shorts Video Cards Grid */}
        {filteredVideos.length === 0 ? (
          <div
            className="rounded-2xl bg-[#FAFAFA] border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-light"
            data-testid="education-empty-filter"
          >
            {t.emptyFilterText || "Belum ada video pada kategori atau kata kunci ini."}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
            data-testid="education-video-grid"
          >
            {filteredVideos.map((item, i) => {
              const gIdx = item._globalIdx;
              const isCurrent = gIdx === safeActiveIdx;
              const dur = getItemDuration(item, gIdx);
              return (
                <motion.div
                  key={`${gIdx}-${item.title}`}
                  variants={fadeUp}
                  custom={i * 0.15}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  onClick={() => selectAndPlay(gIdx, true)}
                  data-testid={`education-card-${gIdx}`}
                  className={`group cursor-pointer rounded-2xl bg-[#0A192F] border overflow-hidden relative aspect-[9/16] transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? "border-emerald-500 ring-2 ring-emerald-500/25 shadow-[0_16px_40px_rgba(5,150,105,0.25)] scale-[1.02]"
                      : "border-slate-800/20 hover:border-emerald-500/50 hover:shadow-[0_16px_40px_rgba(10,25,47,0.18)] hover:-translate-y-1"
                  }`}
                >
                  {/* 9:16 Video Thumbnail with Hover Snippet */}
                  <VideoCardThumbnail
                    item={item}
                    isActive={isCurrent}
                    onDurationDetected={(d) => recordDuration(gIdx, d)}
                  />

                  {/* Floating Top Bar: Category Pill & Duration Badge */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2 py-0.5 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white/95 text-[10px] font-semibold uppercase tracking-wider border border-white/10 shadow-sm truncate max-w-[120px]">
                      {item.category || (lang === "en" ? "Shorts" : "Edukasi")}
                    </span>
                    {dur && (
                      <span className="px-2 py-0.5 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white text-[10px] font-medium shrink-0 shadow-sm">
                        {dur}
                      </span>
                    )}
                  </div>

                  {/* Floating Bottom Bar: Active Status, Title, Speaker, Action */}
                  <div className="relative z-10 mt-auto pt-16 pb-3.5 px-3.5 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/80 to-transparent flex flex-col pointer-events-none">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-semibold tracking-wide mb-1 w-fit shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {t.nowPlayingLabel || "Sedang Diputar"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1 block">
                        Shorts #{String(gIdx + 1).padStart(2, "0")}
                      </span>
                    )}

                    <h3 className="font-serif-display text-white text-sm sm:text-base font-normal leading-snug line-clamp-2 mb-1 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>

                    {item.speaker && (
                      <p className="text-[11px] text-white/70 font-light truncate flex items-center gap-1 mb-2">
                        <User size={11} className="text-emerald-400 shrink-0" />
                        <span>{item.speaker}</span>
                      </p>
                    )}

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Play size={10} fill="currentColor" />
                        {isCurrent
                          ? t.nowPlayingLabel || "Sedang Diputar"
                          : t.watchNowLabel || "Putar Shorts"}
                      </span>
                      <span className="text-[10px] text-white/40">9:16</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
