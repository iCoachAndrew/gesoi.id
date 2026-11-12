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
      className="relative aspect-video bg-[#0A192F] overflow-hidden"
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

      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-[#0A192F]/15 to-transparent" />

      {/* Center Play Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isActive
              ? "bg-emerald-600 text-white scale-105"
              : "bg-white/25 backdrop-blur-md text-white group-hover:bg-emerald-600 group-hover:scale-110"
          }`}
        >
          <Play size={18} fill="currentColor" className="ml-0.5" />
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left 8 Cols: Active Video Player + Quick Bar + Info */}
              <div className="lg:col-span-8">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-[var(--g-navy)] shadow-[0_16px_40px_rgba(10,25,47,0.14)] group">
                  {activeYtEmbed ? (
                    <iframe
                      src={activeYtEmbed}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
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
                        className="w-full h-full object-contain bg-[#0A192F]"
                        data-testid="education-active-video"
                      />

                      {/* Floating Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm">
                            {t.freeBadge || "Gratis"}
                          </span>
                          {activeVideo.category && (
                            <span className="px-3 py-1 rounded-full bg-[#0A192F]/75 backdrop-blur-md text-white/95 border border-white/15 text-[10px] uppercase tracking-[0.15em]">
                              {activeVideo.category}
                            </span>
                          )}
                        </div>
                        {getItemDuration(activeVideo, safeActiveIdx) && (
                          <span className="px-2.5 py-1 rounded-full bg-[#0A192F]/75 backdrop-blur-md text-white/90 text-[11px] font-medium flex items-center gap-1">
                            <Clock size={11} />
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
                          aria-label={t.watchNowLabel || "Putar Video"}
                          className="absolute inset-0 flex items-center justify-center bg-[#0A192F]/20 hover:bg-[#0A192F]/10 transition-colors duration-300 cursor-pointer"
                        >
                          <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-[var(--g-navy)] hover:bg-emerald-600 hover:text-white flex items-center justify-center shadow-[0_12px_32px_rgba(10,25,47,0.3)] hover:scale-105 transition-all duration-300">
                            <Play size={26} fill="currentColor" className="ml-1" />
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Low-Click Quick Control Strip */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
                  <div className="flex flex-wrap items-center gap-2">
                    {!activeYtEmbed && (
                      <button
                        type="button"
                        onClick={togglePlay}
                        data-testid="education-play-toggle-btn"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.12em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-200"
                      >
                        {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                        {playing ? (lang === "en" ? "Pause" : "Jeda") : t.watchNowLabel || "Putar Video"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={goPrev}
                      data-testid="education-prev-btn"
                      title={lang === "en" ? "Previous Video" : "Video Sebelumnya"}
                      className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
                    >
                      <SkipBack size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      data-testid="education-next-btn"
                      title={lang === "en" ? "Next Video" : "Video Selanjutnya"}
                      className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
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
                          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[var(--g-navy)] hover:text-[var(--g-navy)] flex items-center justify-center transition-colors duration-200"
                        >
                          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* 1-Click Playback Speed Pills */}
                        <div
                          className="hidden sm:inline-flex items-center rounded-full bg-white border border-slate-200 p-0.5 text-[11px]"
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

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Auto-Play Next Toggle */}
                    <button
                      type="button"
                      onClick={() => setAutoPlayNext(!autoPlayNext)}
                      data-testid="education-autoplay-toggle"
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs border transition-colors duration-200 ${
                        autoPlayNext
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                          : "bg-white border-slate-200 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          autoPlayNext ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      />
                      {t.autoPlayLabel || "Lanjut Otomatis"}
                    </button>

                    {/* 1-Click Share to WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${activeVideo.title} - Edukasi Sehat Otak GESOI\n\n${shareUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("edu_share_whatsapp")}
                      data-testid="education-share-whatsapp"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-emerald-800 hover:bg-[#25D366] hover:text-white text-xs font-medium transition-colors duration-200"
                    >
                      <WhatsAppIcon size={13} />
                      <span>{t.shareLabel || "Bagikan ke WhatsApp"}</span>
                    </a>
                  </div>
                </div>

                {/* Active Video Title, Speaker, and Description */}
                <div className="pt-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-[0.18em] mb-2">
                    <span>
                      {String(safeActiveIdx + 1).padStart(2, "0")} / {String(allVideos.length).padStart(2, "0")}
                    </span>
                    {activeVideo.category && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span>{activeVideo.category}</span>
                      </>
                    )}
                  </div>

                  <h3
                    className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-[var(--g-navy)] leading-snug"
                    data-testid="education-active-title"
                  >
                    {activeVideo.title}
                  </h3>

                  {activeVideo.desc && (
                    <p
                      className="mt-3 text-slate-600 text-sm sm:text-base font-light leading-relaxed"
                      data-testid="education-active-desc"
                    >
                      {activeVideo.desc}
                    </p>
                  )}

                  {(activeVideo.speaker || activeVideo.role) && (
                    <div className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80">
                      <span className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                        <User size={15} />
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
                </div>
              </div>

              {/* Right 4 Cols: Interactive Playlist Queue (1-Click Switch) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[560px]">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#FFFFFF]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--g-navy)]">
                      {t.upNextLabel || "Daftar Video Edukasi"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-light mt-0.5">
                      {lang === "en"
                        ? "Click any video to play immediately"
                        : "Klik langsung pada daftar untuk memutar"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {allVideos.length} Video
                  </span>
                </div>

                <div
                  className="divide-y divide-slate-100 overflow-y-auto flex-1"
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
                        className={`w-full text-left p-3.5 flex items-start gap-3.5 transition-colors duration-200 ${
                          isCurrent
                            ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                            : "hover:bg-slate-50/90"
                        }`}
                      >
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-[var(--g-navy)] shrink-0">
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
                              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isCurrent
                                  ? "bg-emerald-600 text-white"
                                  : "bg-white/80 text-[var(--g-navy)]"
                              }`}
                            >
                              <Play size={11} fill="currentColor" className="ml-0.5" />
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              {isCurrent
                                ? t.nowPlayingLabel || "Sedang Diputar"
                                : `#${String(idx + 1).padStart(2, "0")}`}
                            </span>
                            {dur && (
                              <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                                {dur}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs leading-snug line-clamp-2 ${
                              isCurrent
                                ? "font-semibold text-[var(--g-navy)]"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.speaker && (
                            <p className="text-[10px] text-slate-400 font-light truncate mt-1">
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

        {/* Video Cards Bento Grid */}
        {filteredVideos.length === 0 ? (
          <div
            className="rounded-2xl bg-[#FAFAFA] border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-light"
            data-testid="education-empty-filter"
          >
            {t.emptyFilterText || "Belum ada video pada kategori atau kata kunci ini."}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  custom={i * 0.25}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  onClick={() => selectAndPlay(gIdx, true)}
                  data-testid={`education-card-${gIdx}`}
                  className={`group cursor-pointer rounded-2xl bg-white border overflow-hidden flex flex-col transition-all duration-300 ${
                    isCurrent
                      ? "border-emerald-600 ring-2 ring-emerald-600/15 shadow-[0_12px_36px_rgba(5,150,105,0.1)]"
                      : "border-slate-200/90 hover:border-emerald-600/40 hover:shadow-[0_12px_36px_rgba(10,25,47,0.07)] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative">
                    <VideoCardThumbnail
                      item={item}
                      isActive={isCurrent}
                      onDurationDetected={(d) => recordDuration(gIdx, d)}
                    />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[var(--g-navy)] text-[10px] font-semibold uppercase tracking-[0.14em]">
                        {item.category || (lang === "en" ? "Education" : "Edukasi")}
                      </span>
                      {dur && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white text-[10px] font-medium">
                          {dur}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        {isCurrent
                          ? t.nowPlayingLabel || "Sedang Diputar"
                          : t.freeBadge || "Gratis"}
                      </span>
                      {item.speaker && (
                        <span className="text-[11px] text-slate-400 font-light truncate">
                          {item.speaker}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-display text-xl text-[var(--g-navy)] leading-snug mb-2 group-hover:text-emerald-800 transition-colors duration-200">
                      {item.title}
                    </h3>

                    {item.desc && (
                      <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2 mb-5">
                        {item.desc}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--g-navy)] group-hover:text-emerald-700 transition-colors duration-200">
                        <Play size={12} fill="currentColor" />
                        {isCurrent
                          ? t.nowPlayingLabel || "Sedang Diputar"
                          : t.watchNowLabel || "Putar Video"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-light">
                        #{String(gIdx + 1).padStart(2, "0")}
                      </span>
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
