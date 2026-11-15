import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowLeft,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Maximize2,
  Film,
  User,
  Clock,
} from "lucide-react";
import { fadeUp } from "./SectionHeader";
import { trackEvent } from "../../lib/analytics";
import {
  buildEducationVideoList,
  formatDuration,
  fuzzyMatchVideo,
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
  const [isGridExpanded, setIsGridExpanded] = useState(false);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [detectedDurations, setDetectedDurations] = useState({});

  // YouTube Shorts gesture visual feedback
  const [seekRipple, setSeekRipple] = useState(null); // { side: 'left' | 'right', label: '-10s' | '+10s', id: number }
  const [swipeFeedback, setSwipeFeedback] = useState(null); // { dir: 'next' | 'prev', label: string, id: number }
  const [slideDirection, setSlideDirection] = useState(0); // 1 for next, -1 for prev

  const videoRef = useRef(null);
  const playerFrameRef = useRef(null);
  const stageRef = useRef(null);
  const shouldAutoStartRef = useRef(Boolean(isFullPage));
  const touchStartRef = useRef(null);
  const wheelCooldownRef = useRef(0);
  const rightTapTimerRef = useRef(null);
  const lastRightTapRef = useRef(0);

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

  // Clean body text to ensure no legacy "Turag" or "Andrew Tani" strings appear even if cached in DB overrides
  const cleanBody = useMemo(() => {
    const raw = String(t?.body || "");
    if (/turag|andrew\s*tani/i.test(raw)) {
      return lang === "en"
        ? "A curated series of concise vertical educational shorts (9:16) by Karya GESOI, designed for easy mobile and desktop viewing to cultivate daily brain and mental health awareness."
        : "Koleksi video edukasi ringkas berformat vertikal (Shorts 9:16) Karya GESOI, dirancang praktis untuk ditonton di ponsel maupun desktop demi membangun kesadaran sehat otak dan mental setiap hari.";
    }
    return raw;
  }, [t?.body, lang]);

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

  // Fuzzy search + category filtering
  const filteredVideos = useMemo(() => {
    return allVideos
      .map((item, idx) => ({ ...item, _globalIdx: idx }))
      .filter((item) => {
        const matchCat =
          activeCategory === "ALL" ||
          (item.category || "").toLowerCase() === activeCategory.toLowerCase();
        if (!matchCat) return false;
        return fuzzyMatchVideo(item, searchQuery, item._globalIdx);
      });
  }, [allVideos, activeCategory, searchQuery]);

  // Show up to 5 videos by default when collapsed
  const visibleVideos = useMemo(
    () => (isGridExpanded ? filteredVideos : filteredVideos.slice(0, 5)),
    [filteredVideos, isGridExpanded]
  );

  const safeActiveIdx = activeIdx < allVideos.length ? activeIdx : 0;
  const activeVideo = allVideos[safeActiveIdx] || allVideos[0] || null;
  const activeYtEmbed = activeVideo ? getYoutubeEmbedUrl(activeVideo.url) : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setCurrentTime(0);
    setDurationSec(0);
    el.playbackRate = playbackRate;
    el.volume = volume;
    el.muted = muted;

    if (shouldAutoStartRef.current) {
      shouldAutoStartRef.current = false;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Fallback to muted autoplay if browser blocks unmuted autoplay on initial page entry
          el.muted = true;
          setMuted(true);
          el.play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        });
    } else {
      setPlaying(false);
    }
  }, [safeActiveIdx, activeVideo?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAndPlay = useCallback(
    (idx, scrollStage = false, dir = 0) => {
      if (!allVideos.length) return;
      const target = ((idx % allVideos.length) + allVideos.length) % allVideos.length;
      setSlideDirection(dir);
      shouldAutoStartRef.current = true;
      setActiveIdx(target);
      trackEvent("edu_video_select", String(target));
      if (scrollStage && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        if (rect.top < -80 || rect.top > window.innerHeight * 0.45) {
          stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [allVideos.length]
  );

  const triggerSwipeBadge = useCallback((dir, label) => {
    const id = Date.now();
    setSwipeFeedback({ dir, label, id });
    setTimeout(() => {
      setSwipeFeedback((curr) => (curr?.id === id ? null : curr));
    }, 650);
  }, []);

  const goPrev = useCallback(() => {
    if (!allVideos.length) return;
    const prev = (safeActiveIdx - 1 + allVideos.length) % allVideos.length;
    triggerSwipeBadge("prev", lang === "en" ? "↑ Previous Short" : "↑ Video Sebelumnya");
    selectAndPlay(prev, false, -1);
  }, [allVideos.length, safeActiveIdx, lang, selectAndPlay, triggerSwipeBadge]);

  const goNext = useCallback(() => {
    if (!allVideos.length) return;
    const next = (safeActiveIdx + 1) % allVideos.length;
    triggerSwipeBadge("next", lang === "en" ? "↓ Next Short" : "↓ Video Selanjutnya");
    selectAndPlay(next, false, 1);
  }, [allVideos.length, safeActiveIdx, lang, selectAndPlay, triggerSwipeBadge]);

  const togglePlay = useCallback(() => {
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
  }, []);

  const seekBy = useCallback(
    (deltaSeconds) => {
      const el = videoRef.current;
      if (!el) return;
      const maxDur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 9999;
      const nextTime = Math.max(0, Math.min(maxDur, (el.currentTime || 0) + deltaSeconds));
      el.currentTime = nextTime;
      setCurrentTime(nextTime);

      const id = Date.now();
      const side = deltaSeconds < 0 ? "left" : "right";
      const label =
        deltaSeconds < 0
          ? lang === "en"
            ? "« -10s"
            : "« -10 detik"
          : lang === "en"
          ? "+10s »"
          : "+10 detik »";
      setSeekRipple({ side, label, id });
      setTimeout(() => {
        setSeekRipple((curr) => (curr?.id === id ? null : curr));
      }, 650);
    },
    [lang]
  );

  const handleTimelineScrub = (e) => {
    const val = parseFloat(e.target.value);
    const el = videoRef.current;
    if (!el || Number.isNaN(val)) return;
    el.currentTime = val;
    setCurrentTime(val);
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const el = videoRef.current;
    if (Number.isNaN(val)) return;
    setVolume(val);
    if (el) {
      el.volume = val;
      el.muted = val === 0;
    }
    setMuted(val === 0);
  };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    const target = playerFrameRef.current || videoRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      target.requestFullscreen?.().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    if (autoPlayNext && allVideos.length > 1) {
      goNext();
    }
  };

  // YouTube Shorts touch / pointer swipe handlers (Swipe Down -> Next, Swipe Up -> Before)
  const onPointerDownStage = (e) => {
    touchStartRef.current = {
      x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      time: Date.now(),
    };
  };

  const onPointerUpStage = (e) => {
    if (!touchStartRef.current) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? touchStartRef.current.x;
    const endY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? touchStartRef.current.y;
    const dy = endY - touchStartRef.current.y;
    const dx = endX - touchStartRef.current.x;
    const elapsed = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Vertical swipe gesture (swipe down -> next, swipe up -> before)
    if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx) * 1.2 && elapsed < 900) {
      if (dy > 0) {
        goNext();
      } else {
        goPrev();
      }
      return;
    }

    // Ignore if it was a drag rather than a click/tap
    if (Math.abs(dy) > 12 || Math.abs(dx) > 12) return;

    // Horizontal zone detection on the 9:16 video surface:
    // - Left zone (0..35%): single click rewinds 10 seconds (-10s)
    // - Right zone (65..100%): double click/tap forwards 10 seconds (+10s)
    // - Center zone (35..65%): single click toggles Play / Pause
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = rect.width > 0 ? (endX - rect.left) / rect.width : 0.5;

    if (relX < 0.35) {
      seekBy(-10);
    } else if (relX > 0.65) {
      const now = Date.now();
      if (now - lastRightTapRef.current < 320) {
        if (rightTapTimerRef.current) {
          clearTimeout(rightTapTimerRef.current);
          rightTapTimerRef.current = null;
        }
        lastRightTapRef.current = 0;
        seekBy(10);
      } else {
        lastRightTapRef.current = now;
        rightTapTimerRef.current = setTimeout(() => {
          togglePlay();
          rightTapTimerRef.current = null;
        }, 250);
      }
    } else {
      togglePlay();
    }
  };

  // Wheel scroll over the 9:16 Shorts frame to switch videos like YouTube Shorts
  const onWheelStage = (e) => {
    if (Math.abs(e.deltaY) < 32) return;
    const now = Date.now();
    if (now - wheelCooldownRef.current < 550) return;
    wheelCooldownRef.current = now;
    if (e.deltaY > 0) {
      goNext();
    } else {
      goPrev();
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

  const formattedCurrent = formatDuration(currentTime) || "00:00";
  const formattedTotal =
    (durationSec > 0 && formatDuration(durationSec)) ||
    getItemDuration(activeVideo, safeActiveIdx) ||
    "00:00";
  const progressPercent =
    durationSec > 0 ? Math.min(100, Math.max(0, (currentTime / durationSec) * 100)) : 0;

  return (
    <section
      id="education"
      className={`${
        isFullPage ? "pt-20 pb-20 lg:pt-24 lg:pb-24" : "py-24 lg:py-32"
      } bg-[#FFFFFF] border-t border-slate-100`}
      data-testid="education-section"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Compact Immersive Top Bar on /edukasi vs Editorial Section Header on Homepage */}
        {isFullPage ? (
          <div
            className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3.5 border-b border-slate-100"
            data-testid="education-immersive-topbar"
          >
            <Link
              to="/"
              data-testid="education-back-home"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[var(--g-navy)] transition-colors"
            >
              <ArrowLeft size={14} />
              {t.backHomeLabel || (lang === "en" ? "Back to Home" : "Kembali ke Beranda")}
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <Sparkles size={11} className="text-emerald-600" />
                {lang === "en" ? "GESOI Shorts · Karya GESOI" : "Shorts Edukasi · Karya GESOI"}
              </span>
            </div>
          </div>
        ) : (
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

              {cleanBody && (
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mt-5 text-base md:text-lg font-light leading-relaxed text-slate-600"
                >
                  {cleanBody}
                </motion.p>
              )}
            </div>

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
                {t.ctaPageLabel || "Buka Ruang Shorts Lengkap"}
                <ArrowUpRight size={15} />
              </Link>
            </motion.div>
          </div>
        )}

        {/* Immersive YouTube Shorts Stage + YouTube Control Tab (No Playlist Clutter) */}
        {activeVideo && (
          <motion.div
            ref={stageRef}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                goNext();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                goPrev();
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                seekBy(-10);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                seekBy(10);
              } else if (e.key === " ") {
                e.preventDefault();
                togglePlay();
              }
            }}
            className="scroll-mt-20 rounded-3xl bg-[#FAFAFA] border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-[0_16px_48px_rgba(10,25,47,0.05)] mb-14 focus:outline-none"
            data-testid="education-stage"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: 9:16 Vertical YouTube Shorts Player + Vertical Swipe Navigation */}
              <div className="lg:col-span-5 flex items-center justify-center gap-3">
                <div
                  ref={playerFrameRef}
                  onWheel={onWheelStage}
                  className="relative w-full max-w-[330px] sm:max-w-[355px] aspect-[9/16] rounded-3xl overflow-hidden bg-[#0A192F] shadow-[0_24px_60px_rgba(10,25,47,0.24)] border-2 border-slate-800/20 select-none group"
                >
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
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeVideo.url}
                        initial={{
                          opacity: 0.4,
                          y: slideDirection > 0 ? 48 : slideDirection < 0 ? -48 : 0,
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0.4 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="relative w-full h-full"
                      >
                        <video
                          ref={videoRef}
                          src={activeVideo.url}
                          poster={activeVideo.poster || undefined}
                          playsInline
                          preload="metadata"
                          muted={muted}
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                          onEnded={handleVideoEnded}
                          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
                          onLoadedMetadata={(e) => {
                            e.currentTarget.playbackRate = playbackRate;
                            const dur = e.currentTarget.duration;
                            if (Number.isFinite(dur) && dur > 0) {
                              setDurationSec(dur);
                              const d = formatDuration(dur);
                              if (d) recordDuration(safeActiveIdx, d);
                            }
                          }}
                          className="w-full h-full object-cover bg-[#0A192F]"
                          data-testid="education-active-video"
                        />

                        {/* Interactive YouTube Shorts Gesture Surface:
                            - Swipe Down -> Next video
                            - Swipe Up -> Previous video
                            - Left click -> Rewind 10s (-10s)
                            - Right double-click -> Forward 10s (+10s)
                            - Center click -> Play / Pause */}
                        <div
                          onMouseDown={onPointerDownStage}
                          onMouseUp={onPointerUpStage}
                          onTouchStart={onPointerDownStage}
                          onTouchEnd={onPointerUpStage}
                          data-testid="education-shorts-gesture-layer"
                          className="absolute inset-0 z-10 cursor-pointer touch-pan-x"
                        />

                        {/* Floating Top Badges inside 9:16 Shorts frame */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-20">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm">
                              {t.freeBadge || "Gratis"}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white text-[10px] font-medium tracking-wide">
                              Shorts #{String(safeActiveIdx + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-md text-white/95 text-[10px] font-medium flex items-center gap-1 tabular-nums">
                            <Clock size={10} />
                            {formattedCurrent} / {formattedTotal}
                          </span>
                        </div>

                        {/* Unmute Pill if browser started in muted autoplay */}
                        {muted && playing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMute();
                            }}
                            data-testid="education-stage-unmute-pill"
                            className="absolute top-14 left-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[var(--g-navy)] text-[11px] font-semibold shadow-lg hover:bg-emerald-600 hover:text-white transition-colors"
                          >
                            <VolumeX size={13} />
                            {lang === "en" ? "Tap to Unmute" : "Ketuk untuk Suara"}
                          </button>
                        )}

                        {/* Left / Right -10s / +10s YouTube Ripple Feedback */}
                        <AnimatePresence>
                          {seekRipple && (
                            <motion.div
                              key={seekRipple.id}
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.08 }}
                              transition={{ duration: 0.2 }}
                              className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none px-4 py-3 rounded-2xl bg-[#0A192F]/85 backdrop-blur-md text-white text-xs font-bold tracking-wider flex flex-col items-center gap-1 shadow-xl border border-white/15 ${
                                seekRipple.side === "left" ? "left-4" : "right-4"
                              }`}
                              data-testid={`education-seek-ripple-${seekRipple.side}`}
                            >
                              {seekRipple.side === "left" ? (
                                <RotateCcw size={18} className="text-emerald-400" />
                              ) : (
                                <RotateCw size={18} className="text-emerald-400" />
                              )}
                              <span>{seekRipple.label}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Swipe Up / Down Feedback Pill */}
                        <AnimatePresence>
                          {swipeFeedback && (
                            <motion.div
                              key={swipeFeedback.id}
                              initial={{ opacity: 0, y: swipeFeedback.dir === "next" ? 16 : -16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white text-[11px] font-semibold tracking-wide shadow-lg whitespace-nowrap"
                            >
                              {swipeFeedback.label}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Center Play Overlay when Paused */}
                        {!playing && (
                          <div
                            className="absolute inset-0 z-15 flex items-center justify-center bg-[#0A192F]/20 pointer-events-none"
                            data-testid="education-stage-play-overlay"
                          >
                            <span className="w-16 h-16 rounded-full bg-white/95 text-[var(--g-navy)] flex items-center justify-center shadow-[0_12px_32px_rgba(10,25,47,0.35)]">
                              <Play size={26} fill="currentColor" className="ml-1" />
                            </span>
                          </div>
                        )}

                        {/* Bottom YouTube Shorts Overlay Caption + Thin Red/Emerald Progress Line */}
                        <div className="absolute bottom-0 inset-x-0 z-20 pt-12 pb-3 px-4 bg-gradient-to-t from-[#0A192F]/95 via-[#0A192F]/55 to-transparent pointer-events-none">
                          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                            Karya GESOI
                          </p>
                          <p className="text-white text-sm font-serif-display line-clamp-1">
                            {activeVideo.title}
                          </p>
                          <div className="mt-2.5 h-1 w-full rounded-full bg-white/25 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-150"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {/* YouTube Shorts Desktop Vertical Navigation Buttons (Up / Down) */}
                <div className="hidden sm:flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    data-testid="education-shorts-up-btn"
                    title={lang === "en" ? "Swipe Up / Previous Video" : "Swipe Atas / Video Sebelumnya"}
                    className="w-11 h-11 rounded-full bg-white border border-slate-200 text-[var(--g-navy)] hover:bg-[var(--g-navy)] hover:text-white hover:border-[var(--g-navy)] shadow-sm flex items-center justify-center transition-all duration-200"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 tabular-nums">
                    {String(safeActiveIdx + 1).padStart(2, "0")}/{String(allVideos.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    data-testid="education-shorts-down-btn"
                    title={lang === "en" ? "Swipe Down / Next Video" : "Swipe Bawah / Video Selanjutnya"}
                    className="w-11 h-11 rounded-full bg-white border border-slate-200 text-[var(--g-navy)] hover:bg-[var(--g-navy)] hover:text-white hover:border-[var(--g-navy)] shadow-sm flex items-center justify-center transition-all duration-200"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              {/* Right: Active Shorts Info + YouTube-Style Control Tab (No Playlist Box) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {/* Index & Category Header */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-[0.18em] mb-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
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
                  className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[var(--g-navy)] leading-tight mb-3"
                  data-testid="education-active-title"
                >
                  {activeVideo.title}
                </h3>

                {/* Unified Creator Attribution Chip: Karya GESOI */}
                <div className="mb-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm w-fit">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                    <User size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--g-navy)]" data-testid="education-active-speaker">
                      {activeVideo.speaker || "Karya GESOI"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {activeVideo.desc && (
                  <p
                    className="text-slate-600 text-sm sm:text-base font-light leading-relaxed mb-6"
                    data-testid="education-active-desc"
                  >
                    {activeVideo.desc}
                  </p>
                )}

                {/* YouTube-Style Control Tab (Ctrl tab) */}
                <div
                  className="rounded-2xl bg-[#0F172A] text-white p-4 sm:p-5 shadow-[0_14px_34px_rgba(10,25,47,0.18)] border border-slate-800"
                  data-testid="education-youtube-control-tab"
                >
                  {/* 1. Interactive YouTube Scrubber Timeline Bar */}
                  {!activeYtEmbed && (
                    <div className="mb-3.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono tabular-nums mb-1.5">
                        <span>{formattedCurrent}</span>
                        <span className="text-emerald-400 font-sans text-[10px] uppercase tracking-wider font-semibold">
                          {playing
                            ? t.nowPlayingLabel || (lang === "en" ? "Now Playing" : "Sedang Diputar")
                            : lang === "en"
                            ? "Paused"
                            : "Dijeda"}
                        </span>
                        <span>{formattedTotal}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={durationSec > 0 ? durationSec : 100}
                        step={0.1}
                        value={durationSec > 0 ? currentTime : 0}
                        onChange={handleTimelineScrub}
                        aria-label="Video progress timeline"
                        data-testid="education-timeline-scrubber"
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2 transition-all"
                      />
                    </div>
                  )}

                  {/* 2. YouTube Primary Transport & Right Controls Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left Transport Cluster: Play/Pause, Prev, Next, -10s, +10s, Volume */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {!activeYtEmbed && (
                        <button
                          type="button"
                          onClick={togglePlay}
                          data-testid="education-play-toggle-btn"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold tracking-wide transition-colors shadow-sm"
                        >
                          {playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                          <span>
                            {playing
                              ? lang === "en"
                                ? "Pause"
                                : "Jeda"
                              : t.watchNowLabel || (lang === "en" ? "Play" : "Putar")}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={goPrev}
                        data-testid="education-prev-btn"
                        title={lang === "en" ? "Previous Video (Swipe Up)" : "Video Sebelumnya (Swipe Atas)"}
                        className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                      >
                        <SkipBack size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={goNext}
                        data-testid="education-next-btn"
                        title={lang === "en" ? "Next Video (Swipe Down)" : "Video Selanjutnya (Swipe Bawah)"}
                        className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                      >
                        <SkipForward size={15} />
                      </button>

                      {!activeYtEmbed && (
                        <>
                          {/* Rewind 10s button */}
                          <button
                            type="button"
                            onClick={() => seekBy(-10)}
                            data-testid="education-rewind-10-btn"
                            title={lang === "en" ? "Rewind 10 seconds (Left Click)" : "Mundur 10 detik (Klik Kiri)"}
                            className="inline-flex items-center gap-1 px-2.5 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            <RotateCcw size={13} />
                            <span>-10s</span>
                          </button>

                          {/* Forward 10s button */}
                          <button
                            type="button"
                            onClick={() => seekBy(10)}
                            data-testid="education-forward-10-btn"
                            title={lang === "en" ? "Forward 10 seconds (Double-Click Right)" : "Maju 10 detik (2x Klik Kanan)"}
                            className="inline-flex items-center gap-1 px-2.5 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            <span>+10s</span>
                            <RotateCw size={13} />
                          </button>

                          {/* Volume Mute + YouTube Volume Slider */}
                          <div className="inline-flex items-center gap-1.5 bg-slate-800/90 rounded-full px-2.5 h-9">
                            <button
                              type="button"
                              onClick={toggleMute}
                              data-testid="education-mute-btn"
                              title={muted ? "Unmute" : "Mute"}
                              className="text-slate-200 hover:text-white flex items-center justify-center"
                            >
                              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            </button>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={muted ? 0 : volume}
                              onChange={handleVolumeChange}
                              aria-label="Volume"
                              className="hidden sm:block w-14 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Cluster: YouTube Autoplay Switch, Speed, Share, Fullscreen */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* YouTube-style Autoplay Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setAutoPlayNext(!autoPlayNext)}
                        data-testid="education-autoplay-toggle"
                        title={t.autoPlayLabel || "Lanjut Otomatis"}
                        className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                      >
                        <span
                          className={`relative w-7 h-4 rounded-full transition-colors ${
                            autoPlayNext ? "bg-emerald-500" : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center transition-transform ${
                              autoPlayNext ? "translate-x-3.5" : "translate-x-0.5"
                            }`}
                          >
                            <Play size={6} fill="#0F172A" className="text-[#0F172A]" />
                          </span>
                        </span>
                        <span className="text-[11px] font-medium">
                          {t.autoPlayLabel || "Lanjut Otomatis"}
                        </span>
                      </button>

                      {/* Playback Speed Pills */}
                      {!activeYtEmbed && (
                        <div
                          className="inline-flex items-center rounded-full bg-slate-800/90 p-0.5 text-[11px]"
                          data-testid="education-speed-controls"
                        >
                          {[1, 1.25, 1.5].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => changeSpeed(rate)}
                              data-testid={`education-speed-${rate}`}
                              className={`px-2 py-1 rounded-full font-medium transition-colors ${
                                playbackRate === rate
                                  ? "bg-white text-[#0F172A]"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Share to WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `${activeVideo.title} - Karya GESOI\n\n${shareUrl}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("edu_share_whatsapp")}
                        data-testid="education-share-whatsapp"
                        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-emerald-300 hover:bg-[#25D366] hover:text-white text-xs font-medium transition-colors"
                      >
                        <WhatsAppIcon size={13} />
                        <span className="hidden sm:inline">{t.shareLabel || "Bagikan"}</span>
                      </a>

                      {/* Fullscreen Button */}
                      {!activeYtEmbed && (
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          data-testid="education-fullscreen-btn"
                          title="Fullscreen"
                          className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Maximize2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. YouTube Shorts Gesture Guide Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/90 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {lang === "en"
                        ? "Swipe Down: Next · Swipe Up: Previous"
                        : "Swipe Bawah: Lanjut · Swipe Atas: Sebelumnya"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {lang === "en" ? "Click Left: -10s" : "Klik Kiri Video: Mundur 10 dtk"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {lang === "en" ? "Double-Click Right: +10s" : "2x Klik Kanan Video: Maju 10 dtk"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Semua Video Section Header + Fuzzy Search + Collapse/Expand Toggle */}
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
              {t.allCategoriesLabel || (lang === "en" ? "All Videos" : "Semua Video")} ({allVideos.length})
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Fuzzy Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  t.searchPlaceholder ||
                  (lang === "en" ? "Search topics or video number..." : "Cari topik atau nomor video...")
                }
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

            {/* Quick Expand / Collapse Pill in Filter Row */}
            {filteredVideos.length > 5 && (
              <button
                type="button"
                onClick={() => setIsGridExpanded((prev) => !prev)}
                data-testid="education-grid-toggle-top"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-600/30 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors duration-200"
              >
                <span>
                  {isGridExpanded
                    ? t.collapseLabel || (lang === "en" ? "Collapse" : "Tutup")
                    : `${t.viewAllLabel || (lang === "en" ? "View All" : "Lihat Semua")} (${filteredVideos.length})`}
                </span>
                {isGridExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* 9:16 Shorts Video Cards Grid (Showing up to 5 videos by default, expandable) */}
        {filteredVideos.length === 0 ? (
          <div
            className="rounded-2xl bg-[#FAFAFA] border border-slate-200/80 p-12 text-center text-slate-500 text-sm font-light"
            data-testid="education-empty-filter"
          >
            {t.emptyFilterText || "Belum ada video pada kategori atau kata kunci ini."}
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5"
              data-testid="education-video-grid"
            >
              {visibleVideos.map((item, i) => {
                const gIdx = item._globalIdx;
                const isCurrent = gIdx === safeActiveIdx;
                const dur = getItemDuration(item, gIdx);
                return (
                  <motion.div
                    key={`${gIdx}-${item.title}`}
                    variants={fadeUp}
                    custom={Math.min(i, 5) * 0.08}
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

                    {/* Floating Bottom Bar: Active Status, Title, Karya GESOI, Action */}
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

                      <p className="text-[11px] text-white/75 font-light truncate flex items-center gap-1 mb-2">
                        <User size={11} className="text-emerald-400 shrink-0" />
                        <span>{item.speaker || "Karya GESOI"}</span>
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Play size={10} fill="currentColor" />
                          {isCurrent
                            ? t.nowPlayingLabel || "Sedang Diputar"
                            : t.watchNowLabel || "Putar Video"}
                        </span>
                        <span className="text-[10px] text-white/40">9:16</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom View All / Collapse Button */}
            {filteredVideos.length > 5 && (
              <div className="mt-8 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsGridExpanded((prev) => !prev)}
                  data-testid="education-grid-toggle-bottom"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--g-navy)] hover:bg-emerald-600 text-white text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 shadow-md"
                >
                  <span>
                    {isGridExpanded
                      ? t.collapseLabel || (lang === "en" ? "Collapse" : "Tutup")
                      : `${
                          t.viewAllLabel || (lang === "en" ? "View All Videos" : "Lihat Semua Video")
                        } (${filteredVideos.length})`}
                  </span>
                  {isGridExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {!isGridExpanded && (
                  <p className="mt-2 text-xs text-slate-400 font-light">
                    {lang === "en"
                      ? `Showing 5 of ${filteredVideos.length} videos`
                      : `Menampilkan 5 dari ${filteredVideos.length} video`}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
