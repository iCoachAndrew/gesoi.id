import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  Search,
  X,
  ArrowLeft,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  User,
  Check,
} from "lucide-react";
import { trackEvent } from "../../lib/analytics";
import {
  buildEducationVideoList,
  formatDuration,
  fuzzyMatchVideo,
  getYoutubeEmbedUrl,
  toDirectMediaUrl,
} from "../../lib/educationVideos";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const WhatsAppIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
  </svg>
);

const MessengerIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.302 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.888-3.259-6.559 6.963z" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

/**
 * Lightweight 9:16 Card Thumbnail:
 * Only mounts a preview <video> if the user hovers a card on desktop for >250ms.
 */
const VideoCardThumbnail = memo(({ item, isActive, onDurationDetected }) => {
  const [mountPreview, setMountPreview] = useState(false);
  const hoverTimerRef = useRef(null);

  const onEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setMountPreview(true);
    }, 250);
  };

  const onLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setMountPreview(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const isYt = Boolean(getYoutubeEmbedUrl(item.url));
  const directUrl = toDirectMediaUrl(item.url);

  return (
    <div
      className="relative aspect-[9/16] w-full bg-[#0A192F] overflow-hidden"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {item.poster ? (
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0A192F] via-[#0F2942] to-[#063B32] relative"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.45), transparent 65%)",
            }}
          />
          <span className="font-serif-display text-4xl sm:text-5xl text-white/15 select-none tracking-tight">
            {/^\d+$/.test(item.title) ? `#${item.title.padStart(2, "0")}` : "GESOI"}
          </span>
        </div>
      )}

      {!isYt && directUrl && mountPreview && (
        <video
          src={directUrl}
          muted
          autoPlay
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = formatDuration(e.currentTarget.duration);
            if (d && onDurationDetected) onDurationDetected(d);
            e.currentTarget.currentTime = 0.5;
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-transparent pointer-events-none" />

      {/* Center Play Indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 group-hover:scale-110">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 shadow-xl ${
            isActive
              ? "bg-emerald-600 text-white ring-4 ring-emerald-500/30"
              : "bg-white/25 text-white group-hover:bg-emerald-600"
          }`}
        >
          <Play size={20} fill="currentColor" className="ml-0.5" />
        </span>
      </div>
    </div>
  );
});

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

  // Player state (Sound ON by default: muted = false, volume = 1)
  const [playing, setPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [durationSec, setDurationSec] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [loopVideo, setLoopVideo] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [detectedDurations, setDetectedDurations] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-video control visibility (fading after 5s of untouched playback)
  const [showControls, setShowControls] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Visceral Gesture & Button Visual Feedback
  const [seekRipple, setSeekRipple] = useState(null);
  const [swipeFeedback, setSwipeFeedback] = useState(null);
  const [playPulse, setPlayPulse] = useState(null);

  const videoRef = useRef(null);
  const playerFrameRef = useRef(null);
  const videoBoxRef = useRef(null);
  const playerSlideRef = useRef(null);
  const scrubberRef = useRef(null);
  const currentTimeLabelRef = useRef(null);
  const miniProgressRef = useRef(null);

  const shouldAutoStartRef = useRef(Boolean(isFullPage));
  const userMutedRef = useRef(false);
  const prevVolumeRef = useRef(1);
  const pendingSeekRef = useRef(null);
  const seekAccumRef = useRef({ delta: 0, side: null, timer: null });
  const edgeSingleTapTimerRef = useRef(null);
  const pointerStartRef = useRef(null);
  const wheelCooldownRef = useRef(0);
  const lastLeftTapRef = useRef(0);
  const lastRightTapRef = useRef(0);
  const fadeTimerRef = useRef(null);

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

  const visibleVideos = useMemo(
    () => (isGridExpanded ? filteredVideos : filteredVideos.slice(0, 5)),
    [filteredVideos, isGridExpanded]
  );

  const safeActiveIdx = activeIdx < allVideos.length ? activeIdx : 0;
  const activeVideo = allVideos[safeActiveIdx] || allVideos[0] || null;
  const activeYtEmbed = activeVideo ? getYoutubeEmbedUrl(activeVideo.url) : null;
  const activeDirectUrl = activeVideo ? toDirectMediaUrl(activeVideo.url) : "";

  // Preload next Short
  const nextDirectUrl = useMemo(() => {
    if (allVideos.length < 2) return "";
    const nextItem = allVideos[(safeActiveIdx + 1) % allVideos.length];
    return nextItem && !getYoutubeEmbedUrl(nextItem.url) ? toDirectMediaUrl(nextItem.url) : "";
  }, [allVideos, safeActiveIdx]);

  // DOM scrubber updater (0 React re-renders during playback)
  const syncTimeDom = useCallback((sec, total) => {
    const safeSec = Number.isFinite(sec) && sec >= 0 ? sec : 0;
    const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
    if (scrubberRef.current) {
      scrubberRef.current.value = String(safeSec);
      if (safeTotal > 0) scrubberRef.current.max = String(safeTotal);
    }
    if (currentTimeLabelRef.current) {
      currentTimeLabelRef.current.textContent = formatDuration(safeSec) || "00:00";
    }
    if (miniProgressRef.current) {
      const pct = safeTotal > 0 ? Math.min(100, Math.max(0, (safeSec / safeTotal) * 100)) : 0;
      miniProgressRef.current.style.width = `${pct}%`;
    }
  }, []);

  // Fading control center: fades out after 5 seconds of continuous playback if untouched
  const resetFadeTimer = useCallback(() => {
    setShowControls(true);
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (videoRef.current && !videoRef.current.paused && !showSettingsModal && !showShareModal) {
      fadeTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  }, [showSettingsModal, showShareModal]);

  useEffect(() => {
    if (!playing || showSettingsModal || showShareModal) {
      setShowControls(true);
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    } else {
      resetFadeTimer();
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [playing, showSettingsModal, showShareModal, resetFadeTimer]);

  // Sync native fullscreen change events
  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fsEl) {
        setIsFullscreen((prev) => (prev ? false : prev));
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // Auto-unmute on first user interaction if browser temporarily forced muted autoplay
  useEffect(() => {
    const unlockSound = () => {
      if (userMutedRef.current) return;
      const el = videoRef.current;
      if (el && el.muted) {
        const targetVol = prevVolumeRef.current > 0 ? prevVolumeRef.current : 1;
        el.volume = targetVol;
        el.muted = false;
        setVolume(targetVol);
        setMuted(false);
      }
    };
    window.addEventListener("pointerdown", unlockSound, { once: true, passive: true });
    window.addEventListener("keydown", unlockSound, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeDirectUrl) return;
    pendingSeekRef.current = null;
    syncTimeDom(0, 0);
    setDurationSec(0);
    setIsBuffering(true);

    const wantMuted = userMutedRef.current || volume === 0;
    const activeVol = wantMuted ? 0 : volume > 0 ? volume : 1;
    el.playbackRate = playbackRate;
    el.volume = activeVol;
    el.muted = wantMuted;
    el.loop = loopVideo;
    setMuted(wantMuted);

    if (shouldAutoStartRef.current) {
      shouldAutoStartRef.current = false;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            setPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            // Browser blocked unmuted cold-load autoplay; start temporarily muted until first touch
            el.muted = true;
            setMuted(true);
            el.play()
              .then(() => {
                setPlaying(true);
                setIsBuffering(false);
              })
              .catch(() => {
                setPlaying(false);
                setIsBuffering(false);
              });
          });
      }
    } else {
      setPlaying(false);
      setIsBuffering(false);
    }
  }, [safeActiveIdx, activeDirectUrl, syncTimeDom]); // eslint-disable-line react-hooks/exhaustive-deps

  const animateSlideTransition = useCallback((dir) => {
    const node = playerSlideRef.current;
    if (!node || !dir || typeof node.animate !== "function") return;
    node.style.transform = "translate3d(0, 0, 0)";
    node.animate(
      [
        { transform: `translate3d(0, ${dir > 0 ? 36 : -36}px, 0)`, opacity: 0.7 },
        { transform: "translate3d(0, 0, 0)", opacity: 1 },
      ],
      { duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
  }, []);

  const ensureSoundOnGesture = useCallback(() => {
    if (userMutedRef.current) return;
    const el = videoRef.current;
    if (el && el.muted) {
      const targetVol = prevVolumeRef.current > 0 ? prevVolumeRef.current : 1;
      el.volume = targetVol;
      el.muted = false;
      setVolume(targetVol);
      setMuted(false);
    }
  }, []);

  const selectAndPlay = useCallback(
    (idx, scrollStage = false, dir = 0) => {
      if (!allVideos.length) return;
      ensureSoundOnGesture();
      const target = ((idx % allVideos.length) + allVideos.length) % allVideos.length;
      shouldAutoStartRef.current = true;
      animateSlideTransition(dir);
      setActiveIdx(target);
      setShowSettingsModal(false);
      setShowShareModal(false);
      trackEvent("edu_video_select", String(target));
      if (scrollStage && playerFrameRef.current) {
        playerFrameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [allVideos.length, animateSlideTransition, ensureSoundOnGesture]
  );

  const triggerSwipeBadge = useCallback((label) => {
    const id = Date.now();
    setSwipeFeedback({ label, id });
    setTimeout(() => {
      setSwipeFeedback((curr) => (curr?.id === id ? null : curr));
    }, 550);
  }, []);

  const triggerPlayPulse = useCallback((nextPlaying) => {
    const id = Date.now();
    setPlayPulse({ playing: nextPlaying, id });
    setTimeout(() => {
      setPlayPulse((curr) => (curr?.id === id ? null : curr));
    }, 420);
  }, []);

  /**
   * YouTube Shorts Standard Swipe Navigation:
   * Swipe UP (dragging finger up, wheel down, ArrowDown) -> NEXT video
   * Swipe DOWN (dragging finger down, wheel up, ArrowUp) -> PREVIOUS video
   */
  const goNext = useCallback(() => {
    if (!allVideos.length) return;
    const next = (safeActiveIdx + 1) % allVideos.length;
    triggerSwipeBadge(lang === "en" ? "Next Video" : "Video Selanjutnya");
    selectAndPlay(next, false, 1);
  }, [allVideos.length, safeActiveIdx, lang, selectAndPlay, triggerSwipeBadge]);

  const goPrev = useCallback(() => {
    if (!allVideos.length) return;
    const prev = (safeActiveIdx - 1 + allVideos.length) % allVideos.length;
    triggerSwipeBadge(lang === "en" ? "Previous Video" : "Video Sebelumnya");
    selectAndPlay(prev, false, -1);
  }, [allVideos.length, safeActiveIdx, lang, selectAndPlay, triggerSwipeBadge]);

  // Instant 1-touch Play / Pause toggle with visceral center pulse
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    ensureSoundOnGesture();
    if (el.paused) {
      el.play().catch(() => {});
      setPlaying(true);
      triggerPlayPulse(true);
    } else {
      el.pause();
      setPlaying(false);
      triggerPlayPulse(false);
    }
    resetFadeTimer();
  }, [resetFadeTimer, ensureSoundOnGesture, triggerPlayPulse]);

  // Cumulative, zero-lag seek by seconds (-10s / +10s) with visceral ripple
  const seekBy = useCallback(
    (deltaSeconds) => {
      const el = videoRef.current;
      if (!el) return;
      ensureSoundOnGesture();
      const maxDur =
        Number.isFinite(el.duration) && el.duration > 0
          ? el.duration
          : durationSec > 0
          ? durationSec
          : 9999;
      const baseTime =
        pendingSeekRef.current !== null && Number.isFinite(pendingSeekRef.current)
          ? pendingSeekRef.current
          : el.currentTime || 0;
      const nextTime = Math.max(0, Math.min(maxDur, baseTime + deltaSeconds));
      pendingSeekRef.current = nextTime;
      el.currentTime = nextTime;
      syncTimeDom(nextTime, el.duration || durationSec);

      const side = deltaSeconds < 0 ? "left" : "right";
      const acc = seekAccumRef.current;
      if (acc.timer) clearTimeout(acc.timer);
      const totalDelta = acc.side === side ? acc.delta + deltaSeconds : deltaSeconds;
      const absSec = Math.abs(totalDelta);
      acc.delta = totalDelta;
      acc.side = side;

      const id = Date.now();
      const label =
        deltaSeconds < 0
          ? lang === "en"
            ? `« -${absSec}s`
            : `« -${absSec} detik`
          : lang === "en"
          ? `+${absSec}s »`
          : `+${absSec} detik »`;
      setSeekRipple({ side, label, id });

      acc.timer = setTimeout(() => {
        seekAccumRef.current = { delta: 0, side: null, timer: null };
        pendingSeekRef.current = null;
        setSeekRipple((curr) => (curr?.id === id ? null : curr));
      }, 650);

      resetFadeTimer();
    },
    [lang, durationSec, syncTimeDom, resetFadeTimer, ensureSoundOnGesture]
  );

  const handleTimelineScrub = (e) => {
    const val = parseFloat(e.target.value);
    const el = videoRef.current;
    if (!el || Number.isNaN(val)) return;
    pendingSeekRef.current = val;
    el.currentTime = val;
    syncTimeDom(val, el.duration || durationSec);
    resetFadeTimer();
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (muted || volume === 0) {
      const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 1;
      userMutedRef.current = false;
      setVolume(restored);
      setMuted(false);
      if (el) {
        el.volume = restored;
        el.muted = false;
      }
    } else {
      if (volume > 0) prevVolumeRef.current = volume;
      userMutedRef.current = true;
      setMuted(true);
      if (el) {
        el.muted = true;
      }
    }
    resetFadeTimer();
  };

  const handleVolumeChange = (newVol) => {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(newVol) ? newVol : 0));
    setVolume(clamped);
    const isNowMuted = clamped <= 0.001;
    if (!isNowMuted) {
      prevVolumeRef.current = clamped;
      userMutedRef.current = false;
    } else {
      userMutedRef.current = true;
    }
    setMuted(isNowMuted);
    const el = videoRef.current;
    if (el) {
      el.volume = isNowMuted ? 0 : clamped;
      el.muted = isNowMuted;
    }
    resetFadeTimer();
  };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    resetFadeTimer();
  };

  const toggleFullscreen = () => {
    const box = videoBoxRef.current || playerFrameRef.current;
    const fsActive = Boolean(
      document.fullscreenElement || document.webkitFullscreenElement || isFullscreen
    );
    if (fsActive) {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      setIsFullscreen(true);
      if (box?.requestFullscreen) {
        box.requestFullscreen().catch(() => {});
      } else if (box?.webkitRequestFullscreen) {
        box.webkitRequestFullscreen();
      }
    }
    resetFadeTimer();
  };

  const handleVideoEnded = () => {
    setPlaying(false);
    if (loopVideo) {
      const el = videoRef.current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      return;
    }
    if (autoPlayNext && allVideos.length > 1) {
      goNext();
    }
  };

  /**
   * Unified Pointer Gestures (Zero touch+mouse double-bounce on mobile):
   * - Drag / Swipe UP (dy < 0) -> Next Video
   * - Drag / Swipe DOWN (dy > 0) -> Previous Video
   * - Single Tap Center (28% - 72%) -> Instant 0ms Play / Pause
   * - Double Tap Left (< 28%) -> Rewind 10s (without pausing!)
   * - Double Tap Right (> 72%) -> Forward 10s (without pausing!)
   */
  const onPointerDownStage = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    resetFadeTimer();
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
  };

  const onPointerMoveStage = (e) => {
    if (!pointerStartRef.current || !playerSlideRef.current) return;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.abs(dy) > 10) {
      const damped = Math.max(-55, Math.min(55, dy * 0.35));
      playerSlideRef.current.style.transform = `translate3d(0, ${damped}px, 0)`;
    }
  };

  const onPointerCancelStage = () => {
    pointerStartRef.current = null;
    if (playerSlideRef.current) {
      playerSlideRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  };

  const onPointerUpStage = (e) => {
    resetFadeTimer();
    if (playerSlideRef.current) {
      playerSlideRef.current.style.transform = "translate3d(0, 0, 0)";
    }
    if (!pointerStartRef.current) return;

    const endX = e.clientX ?? pointerStartRef.current.x;
    const endY = e.clientY ?? pointerStartRef.current.y;
    const dy = endY - pointerStartRef.current.y;
    const dx = endX - pointerStartRef.current.x;
    const elapsed = performance.now() - pointerStartRef.current.time;
    pointerStartRef.current = null;

    // Close settings or share modal if open when tapping stage
    if (showSettingsModal || showShareModal) {
      setShowSettingsModal(false);
      setShowShareModal(false);
      return;
    }

    // Vertical swipe gesture
    if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx) * 1.15 && elapsed < 800) {
      if (dy < 0) {
        goNext();
      } else {
        goPrev();
      }
      return;
    }

    // Tap Detection (minimal movement, quick contact)
    if (Math.abs(dy) < 25 && Math.abs(dx) < 25 && elapsed < 450) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = rect.width > 0 ? (endX - rect.left) / rect.width : 0.5;
      const now = performance.now();

      // Left Zone (< 28%): Double-tap seeks -10s without pausing; single-tap toggles play
      if (relX < 0.28) {
        if (now - lastLeftTapRef.current < 300) {
          lastLeftTapRef.current = 0;
          if (edgeSingleTapTimerRef.current) {
            clearTimeout(edgeSingleTapTimerRef.current);
            edgeSingleTapTimerRef.current = null;
          }
          seekBy(-10);
        } else {
          lastLeftTapRef.current = now;
          if (edgeSingleTapTimerRef.current) clearTimeout(edgeSingleTapTimerRef.current);
          edgeSingleTapTimerRef.current = setTimeout(() => {
            edgeSingleTapTimerRef.current = null;
            togglePlay();
          }, 230);
        }
        return;
      }

      // Right Zone (> 72%): Double-tap seeks +10s without pausing; single-tap toggles play
      if (relX > 0.72) {
        if (now - lastRightTapRef.current < 300) {
          lastRightTapRef.current = 0;
          if (edgeSingleTapTimerRef.current) {
            clearTimeout(edgeSingleTapTimerRef.current);
            edgeSingleTapTimerRef.current = null;
          }
          seekBy(10);
        } else {
          lastRightTapRef.current = now;
          if (edgeSingleTapTimerRef.current) clearTimeout(edgeSingleTapTimerRef.current);
          edgeSingleTapTimerRef.current = setTimeout(() => {
            edgeSingleTapTimerRef.current = null;
            togglePlay();
          }, 230);
        }
        return;
      }

      // Center Zone (28% - 72%): Instant 0ms 1x Touch Play / Pause
      if (edgeSingleTapTimerRef.current) {
        clearTimeout(edgeSingleTapTimerRef.current);
        edgeSingleTapTimerRef.current = null;
      }
      togglePlay();
    }
  };

  const onWheelStage = (e) => {
    resetFadeTimer();
    if (Math.abs(e.deltaY) < 28) return;
    const now = performance.now();
    if (now - wheelCooldownRef.current < 420) return;
    wheelCooldownRef.current = now;
    if (e.deltaY > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const recordDuration = useCallback((idx, durStr) => {
    if (!durStr) return;
    setDetectedDurations((prev) => (prev[idx] === durStr ? prev : { ...prev, [idx]: durStr }));
  }, []);

  const getItemDuration = (item, idx) => item?.duration || detectedDurations[idx] || "";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/edukasi?v=${safeActiveIdx}`;
  }, [safeActiveIdx]);

  const shareText = useMemo(() => {
    return `${activeVideo?.title || "Video Edukasi Sehat Otak"} · Karya GESOI`;
  }, [activeVideo?.title]);

  const handleCopyLink = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (err) {}
      document.body.removeChild(ta);
    }
    trackEvent("edu_share_copy_link", String(safeActiveIdx));
  }, [shareUrl, safeActiveIdx]);

  const handleNativeShare = useCallback(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      navigator.share({
        title: shareText,
        text: `${shareText}\n${shareUrl}`,
        url: shareUrl,
      }).then(() => {
        setShowShareModal(false);
        trackEvent("edu_share_native", String(safeActiveIdx));
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  }, [shareText, shareUrl, safeActiveIdx, handleCopyLink]);

  const shareLinks = useMemo(() => {
    const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent || "");
    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    const encodedPayload = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let waHref = `https://wa.me/?text=${encodedPayload}`;
    let tgHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    let fbHref = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`;
    let igHref = "https://instagram.com/direct/inbox/";

    if (isAndroid) {
      waHref = `intent://send?text=${encodedPayload}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(`https://wa.me/?text=${encodedPayload}`)};end`;
      tgHref = `intent://msg_url?url=${encodedUrl}&text=${encodedText}#Intent;scheme=tg;package=org.telegram.messenger;S.browser_fallback_url=${encodeURIComponent(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)};end`;
      fbHref = `intent://share?link=${encodedUrl}#Intent;scheme=fb-messenger;package=com.facebook.orca;S.browser_fallback_url=${encodeURIComponent(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)};end`;
      igHref = `intent://sharesheet?text=${encodedPayload}#Intent;scheme=instagram;package=com.instagram.android;S.browser_fallback_url=https%3A%2F%2Fwww.instagram.com%2Fdirect%2Finbox%2F;end`;
    } else if (isMobile) {
      waHref = `whatsapp://send?text=${encodedPayload}`;
      tgHref = `tg://msg_url?url=${encodedUrl}&text=${encodedText}`;
      fbHref = `fb-messenger://share?link=${encodedUrl}`;
      igHref = `instagram://sharesheet?text=${encodedPayload}`;
    }

    return { waHref, tgHref, fbHref, igHref, isMobile };
  }, [shareText, shareUrl]);

  const handleShareToWhatsApp = useCallback(() => {
    trackEvent("edu_share_whatsapp", String(safeActiveIdx));
  }, [safeActiveIdx]);

  const handleShareToTelegram = useCallback(() => {
    trackEvent("edu_share_telegram", String(safeActiveIdx));
  }, [safeActiveIdx]);

  const handleShareToMessenger = useCallback(() => {
    trackEvent("edu_share_messenger", String(safeActiveIdx));
  }, [safeActiveIdx]);

  const handleShareToInstagram = useCallback(() => {
    trackEvent("edu_share_instagram", String(safeActiveIdx));
    handleCopyLink();
  }, [handleCopyLink, safeActiveIdx]);

  const handleShareToInstagramDM = handleShareToInstagram;

  const scrollToDetails = () => {
    const el = document.getElementById("education-details-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!t) return null;

  const formattedTotal =
    (durationSec > 0 && formatDuration(durationSec)) ||
    getItemDuration(activeVideo, safeActiveIdx) ||
    "00:00";

  return (
    <section
      id="education"
      className={`${
        isFullPage ? "pt-0 pb-16" : "py-24 lg:py-32"
      } bg-[#FFFFFF]`}
      data-testid="education-section"
    >
      {/* Pre-warm next Short when active video is playing */}
      {playing && nextDirectUrl && (
        <link rel="preload" as="video" href={nextDirectUrl} />
      )}

      {/* Editorial Section Header ONLY on Homepage */}
      {!isFullPage && (
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl" data-testid="education-header">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                  {t.kicker}
                </span>
                {t.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium tracking-wide">
                    <Sparkles size={12} className="text-emerald-600" />
                    {t.badge}
                  </span>
                )}
              </div>

              <h2 className="font-serif-display font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-[var(--g-navy)]">
                {t.title}
              </h2>

              {cleanBody && (
                <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-slate-600">
                  {cleanBody}
                </p>
              )}
            </div>

            <div className="shrink-0">
              <Link
                to="/edukasi"
                data-testid="education-open-page-btn"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[var(--g-navy)] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[var(--g-emerald)] transition-colors duration-300 shadow-sm"
              >
                {t.ctaPageLabel || "Buka Ruang Shorts Lengkap"}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Immersive YouTube Shorts Screen (Full viewport height on /edukasi, 0 top padding) */}
      {activeVideo && (
        <div
          ref={playerFrameRef}
          className={`${
            isFullPage
              ? "relative min-h-[100dvh] flex flex-col items-center justify-between bg-[#060D17] py-4 sm:py-6 px-3 sm:px-6 select-none"
              : "max-w-7xl mx-auto px-6 lg:px-10 mb-14"
          }`}
          data-testid="education-stage"
        >
          {/* Main 9:16 Video Player Container */}
          <div
            ref={videoBoxRef}
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
              } else if (e.key === "Escape" && isFullscreen) {
                toggleFullscreen();
              }
            }}
            onWheel={onWheelStage}
            className={`relative w-full ${
              isFullscreen
                ? "fixed inset-0 z-[9999] w-screen h-[100dvh] max-w-none rounded-none border-0 bg-black"
                : isFullPage
                ? "max-w-[400px] h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6rem)] aspect-[9/16] rounded-3xl border border-white/10"
                : "max-w-[360px] aspect-[9/16] mx-auto rounded-3xl border border-white/10 shadow-2xl"
            } overflow-hidden bg-[#0A192F] shadow-[0_24px_60px_rgba(0,0,0,0.45)] group focus:outline-none`}
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
              <div
                ref={playerSlideRef}
                className="relative w-full h-full will-change-transform"
              >
                {/* Persistent single <video> element */}
                <video
                  ref={videoRef}
                  src={activeDirectUrl}
                  poster={activeVideo.poster || undefined}
                  playsInline
                  preload="auto"
                  muted={muted}
                  onPlay={() => {
                    setPlaying(true);
                    setIsBuffering(false);
                  }}
                  onPlaying={() => {
                    setPlaying(true);
                    setIsBuffering(false);
                  }}
                  onPause={() => setPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onCanPlay={() => setIsBuffering(false)}
                  onSeeked={() => {
                    pendingSeekRef.current = null;
                  }}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={(e) => {
                    const el = e.currentTarget;
                    if (pendingSeekRef.current === null) {
                      syncTimeDom(el.currentTime || 0, el.duration || durationSec);
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const el = e.currentTarget;
                    el.playbackRate = playbackRate;
                    const wantMuted = userMutedRef.current || volume === 0;
                    el.volume = wantMuted ? 0 : volume > 0 ? volume : 1;
                    el.muted = wantMuted;
                    const dur = el.duration;
                    if (Number.isFinite(dur) && dur > 0) {
                      setDurationSec(dur);
                      syncTimeDom(el.currentTime || 0, dur);
                      const d = formatDuration(dur);
                      if (d) recordDuration(safeActiveIdx, d);
                    }
                  }}
                  className={`w-full h-full ${
                    isFullscreen ? "object-contain bg-black" : "object-cover bg-[#0A192F]"
                  }`}
                  data-testid="education-active-video"
                />

                {/* Unified Pointer Gesture Surface (Zero mobile touch+mouse double bounce) */}
                <div
                  onPointerDown={onPointerDownStage}
                  onPointerMove={onPointerMoveStage}
                  onPointerUp={onPointerUpStage}
                  onPointerCancel={onPointerCancelStage}
                  onPointerLeave={onPointerCancelStage}
                  data-testid="education-shorts-gesture-layer"
                  className="absolute inset-0 z-10 cursor-pointer touch-none"
                />

                {/* Top-Right Exit Fullscreen Pill when in Fullscreen Mode */}
                {isFullscreen && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    data-testid="education-exit-fullscreen-top"
                    className="absolute top-4 right-4 z-40 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-semibold border border-white/20 backdrop-blur-md shadow-xl active:scale-90 transition-transform touch-manipulation"
                  >
                    <Minimize2 size={15} />
                    <span>{lang === "en" ? "Exit" : "Tutup"}</span>
                  </button>
                )}

                {/* Left / Right Cumulative -10s / +10s Visceral Ripple Feedback */}
                {seekRipple && (
                  <div
                    key={seekRipple.id}
                    className={`absolute top-1/2 -translate-y-1/2 z-25 pointer-events-none px-4 py-3 rounded-2xl bg-black/85 backdrop-blur-md text-white text-xs font-bold tracking-wider flex flex-col items-center gap-1.5 shadow-2xl border border-emerald-400/40 scale-105 transition-transform ${
                      seekRipple.side === "left" ? "left-4" : "right-4"
                    }`}
                    data-testid={`education-seek-ripple-${seekRipple.side}`}
                  >
                    {seekRipple.side === "left" ? (
                      <RotateCcw size={22} className="text-emerald-400 animate-spin" style={{ animationDuration: "0.45s" }} />
                    ) : (
                      <RotateCw size={22} className="text-emerald-400 animate-spin" style={{ animationDuration: "0.45s" }} />
                    )}
                    <span>{seekRipple.label}</span>
                  </div>
                )}

                {/* Visceral Play / Pause Center Pulse Feedback */}
                {playPulse && (
                  <div
                    key={playPulse.id}
                    className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none"
                  >
                    <span className="w-20 h-20 rounded-full bg-black/65 border border-white/25 text-white flex items-center justify-center shadow-2xl scale-110 transition-all duration-300">
                      {playPulse.playing ? (
                        <Play size={32} fill="currentColor" className="ml-1 text-emerald-400" />
                      ) : (
                        <Pause size={32} fill="currentColor" className="text-white" />
                      )}
                    </span>
                  </div>
                )}

                {/* Swipe Up / Down Feedback Badge */}
                {swipeFeedback && (
                  <div
                    key={swipeFeedback.id}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-25 pointer-events-none px-4 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-semibold tracking-wide shadow-xl whitespace-nowrap animate-fade-in"
                  >
                    {swipeFeedback.label}
                  </div>
                )}

                {/* Buffering Spinner */}
                {isBuffering && playing && (
                  <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                    <span className="w-12 h-12 rounded-full border-3 border-white/20 border-t-emerald-400 animate-spin" />
                  </div>
                )}

                {/* Big Center Play Button when Paused (Directly Tappable) */}
                {!playing && (
                  <div
                    className="absolute inset-0 z-15 flex items-center justify-center bg-black/25 pointer-events-none"
                    data-testid="education-stage-play-overlay"
                  >
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      aria-label={lang === "en" ? "Play Video" : "Putar Video"}
                      className="pointer-events-auto w-16 h-16 rounded-full bg-white/95 hover:bg-white text-[var(--g-navy)] flex items-center justify-center shadow-2xl active:scale-90 transition-transform duration-150 touch-manipulation"
                    >
                      <Play size={28} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                )}

                {/* In-Video Settings Modal (YouTube Style, z-40, Mobile Touch Safe) */}
                {showSettingsModal && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-x-3 bottom-36 z-40 p-4 rounded-2xl bg-[#0B1528]/95 backdrop-blur-md border border-white/20 text-white shadow-2xl animate-fade-in pointer-events-auto"
                    data-testid="education-settings-modal"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {lang === "en" ? "Playback Settings" : "Pengaturan Video"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 active:scale-90 transition-transform touch-manipulation"
                        aria-label="Tutup Pengaturan"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Volume Control with Slider & Quick Mute/Level Presets (0% to 100%) */}
                    <div className="mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white/90 font-medium flex items-center gap-1.5">
                          {muted || volume === 0 ? (
                            <VolumeX size={14} className="text-red-400" />
                          ) : volume <= 0.5 ? (
                            <Volume1 size={14} className="text-emerald-400" />
                          ) : (
                            <Volume2 size={14} className="text-emerald-400" />
                          )}
                          {lang === "en" ? "Sound Volume" : "Volume Suara"}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold">
                          {muted || volume === 0
                            ? lang === "en"
                              ? "Muted (0%)"
                              : "Mati (0%)"
                            : `${Math.round(volume * 100)}%`}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={muted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        aria-label="Volume slider"
                        data-testid="education-settings-volume-slider"
                        className="w-full h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-2.5 touch-manipulation"
                      />

                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { label: lang === "en" ? "Mute" : "Mati", val: 0 },
                          { label: "25%", val: 0.25 },
                          { label: "50%", val: 0.5 },
                          { label: "75%", val: 0.75 },
                          { label: "100%", val: 1 },
                        ].map((preset) => {
                          const currentEffective = muted ? 0 : volume;
                          const isSelected = Math.abs(currentEffective - preset.val) < 0.06;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleVolumeChange(preset.val)}
                              className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 touch-manipulation ${
                                isSelected
                                  ? preset.val === 0
                                    ? "bg-red-600 text-white"
                                    : "bg-emerald-600 text-white"
                                  : "bg-white/10 text-white/80 hover:bg-white/20"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Speed options */}
                    <div className="mb-3">
                      <p className="text-[11px] text-white/70 font-medium mb-1.5">
                        {lang === "en" ? "Playback Speed" : "Kecepatan Putar"}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => changeSpeed(rate)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 touch-manipulation ${
                              playbackRate === rate
                                ? "bg-emerald-600 text-white"
                                : "bg-white/10 text-white/80 hover:bg-white/20"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Autoplay Next toggle */}
                    <div className="flex items-center justify-between py-2 border-t border-white/10 text-xs">
                      <span className="text-white/80">
                        {lang === "en" ? "Auto-Play Next Short" : "Putar Otomatis Berikutnya"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAutoPlayNext(!autoPlayNext)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative touch-manipulation ${
                          autoPlayNext ? "bg-emerald-600" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            autoPlayNext ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Loop video toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-white/80">
                        {lang === "en" ? "Loop Current Video" : "Ulangi Video Ini"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLoopVideo(!loopVideo)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative touch-manipulation ${
                          loopVideo ? "bg-emerald-600" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            loopVideo ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* In-Video Multi-Platform Share Modal (WhatsApp, Telegram, Messenger, Instagram DM, Copy Link, Native Share) */}
                {showShareModal && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-x-3 bottom-36 z-40 p-4 rounded-2xl bg-[#0B1528]/95 backdrop-blur-md border border-white/20 text-white shadow-2xl animate-fade-in pointer-events-auto"
                    data-testid="education-share-modal"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
                      <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-emerald-400" />
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {lang === "en" ? "Share Video" : "Bagikan Video"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowShareModal(false)}
                        className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 active:scale-90 transition-transform touch-manipulation"
                        aria-label="Tutup Menu Berbagi"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Platform Grid: WhatsApp, Telegram, Messenger, Instagram */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {/* WhatsApp */}
                      <a
                        href={shareLinks.waHref}
                        onClick={handleShareToWhatsApp}
                        target={shareLinks.isMobile ? undefined : "_blank"}
                        rel={shareLinks.isMobile ? undefined : "noopener noreferrer"}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#25D366]/20 active:scale-95 transition-all touch-manipulation group text-center cursor-pointer no-underline select-none"
                      >
                        <span className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <WhatsAppIcon size={22} />
                        </span>
                        <span className="text-[10px] text-white/90 font-medium">WhatsApp</span>
                      </a>

                      {/* Telegram */}
                      <a
                        href={shareLinks.tgHref}
                        onClick={handleShareToTelegram}
                        target={shareLinks.isMobile ? undefined : "_blank"}
                        rel={shareLinks.isMobile ? undefined : "noopener noreferrer"}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#24A1DE]/20 active:scale-95 transition-all touch-manipulation group text-center cursor-pointer no-underline select-none"
                      >
                        <span className="w-11 h-11 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <TelegramIcon size={22} />
                        </span>
                        <span className="text-[10px] text-white/90 font-medium">Telegram</span>
                      </a>

                      {/* Messenger */}
                      <a
                        href={shareLinks.fbHref}
                        onClick={handleShareToMessenger}
                        target={shareLinks.isMobile ? undefined : "_blank"}
                        rel={shareLinks.isMobile ? undefined : "noopener noreferrer"}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#0084FF]/20 active:scale-95 transition-all touch-manipulation group text-center cursor-pointer no-underline select-none"
                      >
                        <span className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00C6FF] to-[#0078FF] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <MessengerIcon size={22} />
                        </span>
                        <span className="text-[10px] text-white/90 font-medium">Messenger</span>
                      </a>

                      {/* Instagram */}
                      <a
                        href={shareLinks.igHref}
                        onClick={handleShareToInstagram}
                        target={shareLinks.isMobile ? undefined : "_blank"}
                        rel={shareLinks.isMobile ? undefined : "noopener noreferrer"}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-[#E1306C]/20 active:scale-95 transition-all touch-manipulation group text-center cursor-pointer no-underline select-none"
                      >
                        <span className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <InstagramIcon size={22} />
                        </span>
                        <span className="text-[10px] text-white/90 font-medium">Instagram</span>
                      </a>
                    </div>

                    {/* Copy Link & Native Share Actions */}
                    <div className="flex flex-col gap-2 pt-2.5 border-t border-white/10">
                      {/* Copy Link Bar */}
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 pl-3">
                        <span className="text-[11px] text-white/70 font-mono truncate flex-1 select-all">
                          {shareUrl}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation ${
                            copiedLink ? "bg-emerald-600 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                          }`}
                        >
                          {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedLink ? (lang === "en" ? "Copied!" : "Tersalin!") : (lang === "en" ? "Copy" : "Salin")}</span>
                        </button>
                      </div>

                      {/* Native Share Button (More Apps...) */}
                      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                        <button
                          type="button"
                          onClick={handleNativeShare}
                          className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all touch-manipulation"
                        >
                          <ExternalLink size={13} />
                          <span>{lang === "en" ? "More Apps (System Share Sheet)" : "Aplikasi Lainnya (Menu Berbagi HP)"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Right Floating Action Column (z-30, positioned at bottom-36 above bottom bar so zero overlap!) */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={`absolute right-3 bottom-36 sm:bottom-40 z-30 flex flex-col items-center gap-3 transition-opacity duration-500 ${
                    showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                  data-testid="education-right-actions"
                >
                  {/* Permanent Mute / Unmute Toggle */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    data-testid="education-mute-btn"
                    title={
                      muted || volume === 0
                        ? lang === "en"
                          ? "Unmute"
                          : "Nyalakan Suara"
                        : lang === "en"
                        ? "Mute"
                        : "Matikan Suara"
                    }
                    className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-105 active:scale-90 touch-manipulation ${
                      muted || volume === 0
                        ? "bg-red-600 text-white border border-red-400/40"
                        : "bg-black/65 backdrop-blur-md text-white border border-white/20"
                    }`}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX size={19} />
                    ) : volume <= 0.5 ? (
                      <Volume1 size={19} />
                    ) : (
                      <Volume2 size={19} />
                    )}
                  </button>

                  {/* Multi-Platform Share Button (WhatsApp, Telegram, Messenger, Instagram DM, Copy Link, Native Share) */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal((prev) => !prev);
                      setShowSettingsModal(false);
                      resetFadeTimer();
                    }}
                    data-testid="education-share-btn"
                    title={lang === "en" ? "Share Video" : "Bagikan Video"}
                    className={`w-11 h-11 rounded-full backdrop-blur-md text-white border flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-105 active:scale-90 touch-manipulation ${
                      showShareModal
                        ? "bg-emerald-600 border-emerald-400"
                        : "bg-black/65 border-white/20 hover:bg-[#25D366]"
                    }`}
                  >
                    <Share2 size={19} />
                  </button>

                  {/* Settings Gear Button */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettingsModal((prev) => !prev);
                      resetFadeTimer();
                    }}
                    data-testid="education-settings-btn"
                    title={lang === "en" ? "Settings" : "Pengaturan"}
                    className={`w-11 h-11 rounded-full backdrop-blur-md text-white border flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-105 active:scale-90 touch-manipulation ${
                      showSettingsModal
                        ? "bg-emerald-600 border-emerald-400"
                        : "bg-black/65 border-white/20"
                    }`}
                  >
                    <Settings size={19} />
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    data-testid="education-fullscreen-btn"
                    title={
                      isFullscreen
                        ? lang === "en"
                          ? "Exit Fullscreen"
                          : "Keluar Layar Penuh"
                        : lang === "en"
                        ? "Fullscreen"
                        : "Layar Penuh"
                    }
                    className={`w-11 h-11 rounded-full backdrop-blur-md text-white border flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-105 active:scale-90 touch-manipulation ${
                      isFullscreen
                        ? "bg-emerald-600 border-emerald-400"
                        : "bg-black/65 border-white/20"
                    }`}
                  >
                    {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
                  </button>
                </div>

                {/* In-Video Bottom Control Bar (Scrubber timeline, transport, inline volume) - Fading 5s after play */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute inset-x-0 bottom-0 z-20 pt-6 pb-3 px-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-500 ${
                    showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                  data-testid="education-bottom-controls"
                >
                  {/* Video Title info */}
                  <div className="mb-2 pr-12">
                    <p className="text-white text-sm sm:text-base font-serif-display line-clamp-2 leading-snug drop-shadow-md">
                      {activeVideo.title}
                    </p>
                  </div>

                  {/* Interactive Scrubber Timeline */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <input
                      ref={scrubberRef}
                      type="range"
                      min={0}
                      max={durationSec > 0 ? durationSec : 100}
                      step={0.1}
                      defaultValue={0}
                      onChange={handleTimelineScrub}
                      aria-label="Video scrubber timeline"
                      data-testid="education-timeline-scrubber"
                      className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-600 touch-manipulation"
                    />
                    <div className="text-[11px] text-white/90 font-mono tabular-nums whitespace-nowrap shrink-0">
                      <span ref={currentTimeLabelRef}>00:00</span>
                      <span className="text-white/50 mx-1">/</span>
                      <span>{formattedTotal}</span>
                    </div>
                  </div>

                  {/* Visceral Transport Buttons (Play/Pause, -10s, +10s) & Direct Volume Slider */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        data-testid="education-play-btn"
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white text-xs font-semibold shadow-md transition-all duration-100 touch-manipulation"
                      >
                        {playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                        <span>
                          {playing
                            ? lang === "en"
                              ? "Pause"
                              : "Jeda"
                            : lang === "en"
                            ? "Play"
                            : "Putar"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          seekBy(-10);
                        }}
                        data-testid="education-rewind-btn"
                        title="-10 detik"
                        className="inline-flex items-center gap-1 h-9 px-2.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-emerald-600 active:scale-90 text-white text-[11px] font-semibold transition-all duration-100 touch-manipulation"
                      >
                        <RotateCcw size={14} />
                        <span>-10s</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          seekBy(10);
                        }}
                        data-testid="education-forward-btn"
                        title="+10 detik"
                        className="inline-flex items-center gap-1 h-9 px-2.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-emerald-600 active:scale-90 text-white text-[11px] font-semibold transition-all duration-100 touch-manipulation"
                      >
                        <RotateCw size={14} />
                        <span>+10s</span>
                      </button>
                    </div>

                    {/* Inline Volume Control (Speaker Mute Toggle + Slider down to 0%) */}
                    <div
                      className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 h-9 shrink-0"
                      data-testid="education-inline-volume"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                        className="text-white hover:text-emerald-400 active:scale-90 transition-transform touch-manipulation"
                      >
                        {muted || volume === 0 ? (
                          <VolumeX size={15} className="text-red-400" />
                        ) : volume <= 0.5 ? (
                          <Volume1 size={15} />
                        ) : (
                          <Volume2 size={15} />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={muted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        aria-label="Inline volume control"
                        data-testid="education-inline-volume-slider"
                        className="w-14 sm:w-16 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-emerald-400 touch-manipulation"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtle Persistent Progress Line when controls are faded */}
                {!showControls && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15 pointer-events-none">
                    <div
                      ref={miniProgressRef}
                      className="h-full bg-red-600 transition-all duration-100"
                      style={{ width: "0%" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Small Downward Icon Button: "Ke-bawah" to view details and full video list */}
          <div className="mt-3 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={scrollToDetails}
              data-testid="education-scroll-down-btn"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
              aria-label={lang === "en" ? "Scroll down to video details" : "Scroll ke detail dan daftar video"}
            >
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                {activeVideo.category || (lang === "en" ? "Brain Health" : "Kesehatan Otak")} · #{String(safeActiveIdx + 1).padStart(2, "0")}/{String(allVideos.length).padStart(2, "0")}
              </span>
              <ChevronDown size={14} className="text-white group-hover:translate-y-0.5 transition-transform animate-bounce" />
            </button>
          </div>
        </div>
      )}

      {/* Frame Berikutnya: Video Details & Full Video List */}
      <div
        id="education-details-section"
        className="max-w-7xl mx-auto px-6 lg:px-10 pt-12"
      >
        {/* Active Video Metadata Details Card */}
        {activeVideo && (
          <div
            className="mb-12 p-6 sm:p-8 rounded-3xl bg-[#FAFAFA] border border-slate-200/90 shadow-sm"
            data-testid="education-active-details"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 font-semibold uppercase tracking-[0.18em] mb-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] tabular-nums">
                #{String(safeActiveIdx + 1).padStart(2, "0")} / {String(allVideos.length).padStart(2, "0")}
              </span>
              {activeVideo.category && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{activeVideo.category}</span>
                </>
              )}
            </div>

            <h3
              className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-[var(--g-navy)] leading-tight mb-3"
              data-testid="education-active-title"
            >
              {activeVideo.title}
            </h3>

            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-[var(--g-navy)]">
              <User size={13} className="text-emerald-600" />
              <span>{activeVideo.speaker || "Karya GESOI"}</span>
            </div>

            {activeVideo.desc && (
              <p
                className="text-slate-600 text-sm sm:text-base font-light leading-relaxed max-w-3xl"
                data-testid="education-active-desc"
              >
                {activeVideo.desc}
              </p>
            )}
          </div>
        )}

        {/* Semua Video Header, Filter Pills & Fuzzy Search */}
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

            {/* Quick Expand / Collapse Pill */}
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

        {/* 9:16 Video Cards Grid (Up to 5 videos by default, expandable) */}
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
              {visibleVideos.map((item) => {
                const gIdx = item._globalIdx;
                const isCurrent = gIdx === safeActiveIdx;
                const dur = getItemDuration(item, gIdx);
                return (
                  <div
                    key={`${gIdx}-${item.title}`}
                    onClick={() => selectAndPlay(gIdx, true)}
                    data-testid={`education-card-${gIdx}`}
                    className={`group cursor-pointer rounded-2xl bg-[#0A192F] border overflow-hidden relative aspect-[9/16] transition-transform duration-200 flex flex-col justify-between ${
                      isCurrent
                        ? "border-emerald-500 ring-2 ring-emerald-500/25 shadow-[0_14px_32px_rgba(5,150,105,0.22)] scale-[1.01]"
                        : "border-slate-800/20 hover:border-emerald-500/50 hover:-translate-y-1"
                    }`}
                  >
                    <VideoCardThumbnail
                      item={item}
                      isActive={isCurrent}
                      onDurationDetected={(d) => recordDuration(gIdx, d)}
                    />

                    {/* Floating Top Bar: Category Pill & Duration Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                      <span className="px-2 py-0.5 rounded-full bg-[#0A192F]/80 text-white/95 text-[10px] font-semibold uppercase tracking-wider border border-white/10 shadow-sm truncate max-w-[120px]">
                        {item.category || (lang === "en" ? "Education" : "Edukasi")}
                      </span>
                      {dur && (
                        <span className="px-2 py-0.5 rounded-full bg-[#0A192F]/80 text-white text-[10px] font-medium shrink-0 shadow-sm">
                          {dur}
                        </span>
                      )}
                    </div>

                    {/* Floating Bottom Bar: Title & Karya GESOI */}
                    <div className="relative z-10 mt-auto pt-16 pb-3.5 px-3.5 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/80 to-transparent flex flex-col pointer-events-none">
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-semibold tracking-wide mb-1 w-fit shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {t.nowPlayingLabel || "Sedang Diputar"}
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
                  </div>
                );
              })}
            </div>

            {/* Bottom View All / Collapse Button + Back to Home Button */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              {filteredVideos.length > 5 && (
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setIsGridExpanded((prev) => !prev)}
                    data-testid="education-grid-toggle-bottom"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--g-navy)] hover:bg-emerald-600 text-white text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-200 shadow-md"
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

              {/* Back to Home Button at the bottom (when on /edukasi) */}
              {isFullPage && (
                <div className="pt-6">
                  <Link
                    to="/"
                    data-testid="education-back-home"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 bg-white hover:border-[var(--g-navy)] text-xs font-semibold text-slate-700 hover:text-[var(--g-navy)] transition-colors shadow-sm"
                  >
                    <ArrowLeft size={14} />
                    {t.backHomeLabel || (lang === "en" ? "Back to Home" : "Kembali ke Beranda")}
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
