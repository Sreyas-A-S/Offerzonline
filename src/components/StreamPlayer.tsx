"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  RotateCcw, ExternalLink, MessageCircle, Share2, Sparkles, 
  Settings, Check, Eye, Clock, Store, Tag, Compass
} from "lucide-react";

export interface StreamData {
  id: number;
  uuid: string;
  title: string;
  description?: string | null;
  media_url: string;
  media_type: "video" | "gif" | "image";
  thumbnail_url?: string | null;
  duration_seconds?: number | string | null;
  target_url?: string | null;
  cta_text?: string | null;
  store_name?: string | null;
  store_logo?: string | null;
  store_phone?: string | null;
  store_address?: string | null;
  original_price?: string | null;
  promo_price?: string | null;
  discount_value?: string | null;
  terms?: string | null;
  category_name?: string | null;
  aspect_ratio?: string | null;
  autoplay?: boolean;
  loop?: boolean;
  muted_default?: boolean;
  views_count?: number | string | null;
}

interface StreamPlayerProps {
  stream: StreamData;
  autoPlay?: boolean;
  isEmbedded?: boolean;
  onCtaClick?: () => void;
  className?: string;
}

export function StreamPlayer({
  stream,
  autoPlay = true,
  isEmbedded = false,
  onCtaClick,
  className = "",
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(stream.muted_default ?? false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);

  // Tracking milestones (25%, 50%, 75%, 100%)
  const trackedMilestones = useRef<{ [key: string]: boolean }>({});
  const totalWatchTimeRef = useRef<number>(0);
  const lastWatchTimeTick = useRef<number>(Date.now());

  // Generate or retrieve persistent visitor ID
  const getVisitorId = useCallback(() => {
    if (typeof window === "undefined") return "";
    let vid = localStorage.getItem("offerz_visitor_id");
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
      localStorage.setItem("offerz_visitor_id", vid);
    }
    return vid;
  }, []);

  // Send analytics event helper
  const trackEvent = useCallback((eventType: string, extraData: { watchTime?: number } = {}) => {
    if (!stream?.id) return;
    try {
      fetch("/api/track/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: stream.id,
          eventType,
          watchTimeSeconds: extraData.watchTime || totalWatchTimeRef.current,
          visitorId: getVisitorId(),
        }),
      }).catch((e) => console.debug("Track error:", e));
    } catch (e) {
      // ignore
    }
  }, [stream?.id, getVisitorId]);

  // Initial load tracking
  useEffect(() => {
    trackEvent("load");
  }, [trackEvent]);

  // Track watch time ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      lastWatchTimeTick.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSec = (now - lastWatchTimeTick.current) / 1000;
        totalWatchTimeRef.current += deltaSec;
        lastWatchTimeTick.current = now;
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Flush watch time on unmount or pause
  useEffect(() => {
    const handleUnload = () => {
      if (totalWatchTimeRef.current > 0) {
        trackEvent("watch_time", { watchTime: totalWatchTimeRef.current });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [trackEvent]);

  // Autoplay handler
  useEffect(() => {
    if (autoPlay && videoRef.current && stream.media_type === "video") {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        trackEvent("play");
      }).catch(() => {
        // Autoplay with sound often blocked by browser policy -> try muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            trackEvent("play");
          }).catch(() => {});
        }
      });
    }
  }, [autoPlay, stream.media_type, trackEvent]);

  // Image / GIF simulated timer
  useEffect(() => {
    if (stream.media_type !== "video" && isPlaying) {
      const targetDuration = Number(stream.duration_seconds) > 0 ? Number(stream.duration_seconds) : 8;
      setDuration(targetDuration);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(Math.min(elapsed, targetDuration));
        setImageProgress((elapsed / targetDuration) * 100);
        if (elapsed >= targetDuration) {
          setIsPlaying(false);
          setIsEnded(true);
          trackEvent("complete");
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stream.media_type, stream.duration_seconds, isPlaying, trackEvent]);

  // Controls auto-hide timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    setHasInteracted(true);
    if (stream.media_type === "video") {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (isEnded) {
          videoRef.current.currentTime = 0;
          setIsEnded(false);
          trackedMilestones.current = {};
        }
        videoRef.current.play();
        setIsPlaying(true);
        trackEvent("play");
      }
    } else {
      if (isEnded) {
        setIsEnded(false);
        setCurrentTime(0);
        setImageProgress(0);
      }
      setIsPlaying(!isPlaying);
      if (!isPlaying) trackEvent("play");
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(total);

    // Buffer calculation
    if (videoRef.current.buffered.length > 0) {
      setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }

    if (total > 0) {
      const pct = (current / total) * 100;
      if (pct >= 25 && !trackedMilestones.current["25"]) {
        trackedMilestones.current["25"] = true;
        trackEvent("progress_25");
      }
      if (pct >= 50 && !trackedMilestones.current["50"]) {
        trackedMilestones.current["50"] = true;
        trackEvent("progress_50");
      }
      if (pct >= 75 && !trackedMilestones.current["75"]) {
        trackedMilestones.current["75"] = true;
        trackEvent("progress_75");
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    trackEvent("complete");
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current && stream.media_type === "video") {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCtaClickInternal = () => {
    trackEvent("click_cta");
    if (onCtaClick) onCtaClick();
    if (stream.target_url) {
      window.open(stream.target_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent("click_whatsapp");
    if (stream.store_phone) {
      const cleanPhone = stream.store_phone.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(`Hi! I saw your stream "${stream.title}" on Offerzonline and would like more details.`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyM") {
        toggleMute();
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      } else if (e.code === "ArrowRight" && videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
      } else if (e.code === "ArrowLeft" && videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const aspectRatioClass = 
    stream.aspect_ratio === "9:16" 
      ? "aspect-[9/16] max-w-sm mx-auto" 
      : stream.aspect_ratio === "1:1" 
      ? "aspect-square max-w-lg mx-auto" 
      : stream.aspect_ratio === "4:3" 
      ? "aspect-[4/3] max-w-2xl mx-auto" 
      : "aspect-video w-full";

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative group bg-black rounded-3xl overflow-hidden shadow-2xl select-none font-sans flex flex-col justify-center items-center ${aspectRatioClass} ${className}`}
    >
      {/* 1. Media Rendering */}
      {stream.media_type === "video" ? (
        <video
          ref={videoRef}
          src={stream.media_url}
          poster={stream.thumbnail_url || undefined}
          preload="metadata"
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />
      ) : (
        <div 
          onClick={togglePlay}
          className="w-full h-full flex items-center justify-center cursor-pointer bg-slate-950 relative overflow-hidden"
        >
          <img
            src={stream.media_url}
            alt={stream.title}
            className="w-full h-full object-contain max-h-full"
          />
          {/* Animated progress bar for images */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-100 ease-linear"
              style={{ width: `${imageProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Top Stream Branding / Store Header Banner */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          {stream.store_logo ? (
            <img 
              src={stream.store_logo} 
              alt={stream.store_name || "Store"} 
              className="w-9 h-9 rounded-full object-cover border-2 border-white/20 shadow-md bg-white/10" 
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20">
              <Store size={16} />
            </div>
          )}
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight drop-shadow-md line-clamp-1">
              {stream.store_name || stream.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              {stream.category_name && (
                <span className="bg-white/15 backdrop-blur-xs px-2 py-0.5 rounded-full font-medium">
                  {stream.category_name}
                </span>
              )}
              {stream.discount_value && (
                <span className="bg-rose-500/80 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Tag size={10} /> {stream.discount_value}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live / Sponsored Stream Pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 backdrop-blur-md border border-indigo-400/40 text-indigo-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-inner">
            <Sparkles size={11} className="text-indigo-400 animate-pulse" />
            STREAM AD
          </span>
        </div>
      </div>

      {/* 3. Center Big Play / Replay Ripple Button */}
      {(!isPlaying || isEnded) && (
        <button
          onClick={togglePlay}
          aria-label={isEnded ? "Replay stream" : "Play stream"}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center hover:scale-110 hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-2xl backdrop-blur-xs z-30 cursor-pointer border border-white/30"
        >
          {isEnded ? (
            <RotateCcw size={32} className="animate-in spin-in-180" />
          ) : (
            <Play size={34} className="translate-x-0.5 fill-white" />
          )}
        </button>
      )}

      {/* 4. Interactive Floating CTA Card (Slide-up overlay during play or end) */}
      {(stream.target_url || stream.store_phone) && (
        <div 
          className={`absolute bottom-16 left-4 right-4 z-20 transition-all duration-300 ${
            showControls || isEnded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/30 shrink-0">
                <Store size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-xs sm:text-sm truncate">
                  {stream.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {stream.promo_price && (
                    <span className="text-emerald-400 font-extrabold text-xs">
                      {stream.promo_price}
                    </span>
                  )}
                  {stream.original_price && (
                    <span className="text-slate-400 line-through text-[11px]">
                      {stream.original_price}
                    </span>
                  )}
                  {stream.store_address && (
                    <span className="text-slate-400 text-[11px] truncate hidden md:inline">
                      • {stream.store_address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              {stream.store_phone && (
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              )}
              {stream.target_url && (
                <button
                  type="button"
                  onClick={handleCtaClickInternal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <span>{stream.cta_text || "Visit Store"}</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Video Controller Bar (YouTube style) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          {/* Buffer Bar */}
          {duration > 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-full h-1 my-auto pointer-events-none"
              style={{ width: `${(bufferedEnd / duration) * 100}%` }}
            />
          )}
          {/* Active Played Bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full h-1 my-auto pointer-events-none transition-all group-hover/scrubber:h-1.5"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : imageProgress}%` }}
          />
          {/* Interactive Range Input */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 group-hover/scrubber:h-1.5 opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Buttons and Time Display */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-indigo-400 active:scale-90 transition cursor-pointer"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
            </button>

            {/* Volume / Mute */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-indigo-400 transition cursor-pointer"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 accent-indigo-500 rounded-lg cursor-pointer hidden group-hover/vol:inline-block transition-all"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[11px] font-medium text-slate-300 font-mono tracking-tight">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 relative">
            {/* Speed Controller */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl p-1 z-50 text-xs w-24">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        playbackSpeed === s ? "bg-indigo-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-indigo-400 active:scale-90 transition cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
