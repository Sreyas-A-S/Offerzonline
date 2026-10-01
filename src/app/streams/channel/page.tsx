"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Radio, 
  Share2, Check, ExternalLink, Tag
} from "lucide-react";
import { PublicPreloader } from "@/components/PublicPreloader";

export default function SingleChannelBroadcastPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  // References for active & preloaded video elements
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preloading cache refs to store pre-rendered video nodes in browser memory
  const preloadedVideosRef = useRef<{ [url: string]: HTMLVideoElement }>({});
  const preloadedImagesRef = useRef<{ [url: string]: HTMLImageElement }>({});

  // Auto-hide controls and overlays when mouse is idle
  const handleMouseMove = () => {
    setShowOverlays(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 3500);
  };

  // Verify Streamer Session & Fetch Active Playlist
  useEffect(() => {
    async function loadSessionAndPlaylist() {
      try {
        setLoading(true);

        // Authenticate streamer user session
        const authRes = await fetch("/api/streamer/login");
        const authData = await authRes.json();

        if (!authData.authenticated || !authData.user) {
          router.push("/auth");
          return;
        }

        setUser(authData.user);

        // Fetch continuous media broadcast playlist
        const res = await fetch("/api/streamer/streams");
        if (res.ok) {
          const data = await res.json();
          const list = (data.streams || []).filter((s: any) => s.media_url);
          setStreams(list);
        }
      } catch (err) {
        console.error("Failed to load channel broadcast:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSessionAndPlaylist();
  }, [router]);

  // Progressive pre-buffering: preloads only the upcoming item in background
  useEffect(() => {
    if (streams.length < 2) return;

    const nextIdx = (currentIndex + 1) % streams.length;
    const nextItem = streams[nextIdx];
    if (!nextItem || !nextItem.media_url) return;

    if (nextItem.media_type === "video") {
      if (!preloadedVideosRef.current[nextItem.media_url]) {
        const vid = document.createElement("video");
        vid.src = nextItem.media_url;
        vid.preload = "auto";
        vid.muted = true;
        vid.playsInline = true;
        vid.load();
        preloadedVideosRef.current[nextItem.media_url] = vid;
      }
    } else {
      if (!preloadedImagesRef.current[nextItem.media_url]) {
        const img = new Image();
        img.src = nextItem.media_url;
        preloadedImagesRef.current[nextItem.media_url] = img;
      }
    }
  }, [currentIndex, streams.length]);

  const currentMedia = streams[currentIndex] || null;

  // Seamless zero-flicker transition to next item in continuous loop
  const handleNextMedia = useCallback(() => {
    if (streams.length === 0) return;
    setProgressPercent(0);
    setCurrentIndex((prev) => (prev + 1) % streams.length);
  }, [streams.length]);

  // Handle video end -> jump immediately to next media
  const handleVideoEnded = () => {
    handleNextMedia();
  };

  // Handle image or banner duration timer (8s default)
  useEffect(() => {
    if (imageTimerRef.current) clearInterval(imageTimerRef.current);
    if (!currentMedia) return;

    if (currentMedia.media_type !== "video") {
      const durationSeconds = Number(currentMedia.duration_seconds) || 8;
      const stepMs = 50;
      const totalSteps = (durationSeconds * 1000) / stepMs;
      let currentStep = 0;

      imageTimerRef.current = setInterval(() => {
        currentStep++;
        setProgressPercent(Math.min((currentStep / totalSteps) * 100, 100));
        if (currentStep >= totalSteps) {
          clearInterval(imageTimerRef.current!);
          handleNextMedia();
        }
      }, stepMs);

      return () => {
        if (imageTimerRef.current) clearInterval(imageTimerRef.current);
      };
    }
  }, [currentIndex, currentMedia, handleNextMedia]);

  // Handle video playback timeupdate & smooth recovery if stalled
  const handleTimeUpdate = () => {
    if (activeVideoRef.current && activeVideoRef.current.duration) {
      const current = activeVideoRef.current.currentTime;
      const total = activeVideoRef.current.duration;
      setProgressPercent((current / total) * 100);
    }
  };

  // Ensure active video auto-plays smoothly without getting stuck
  useEffect(() => {
    if (activeVideoRef.current && currentMedia?.media_type === "video") {
      activeVideoRef.current.play().catch(() => {
        // Autoplay handled silently according to browser media policy
      });
    }
  }, [currentIndex, currentMedia]);

  // Attempt automatic fullscreen request on load or initial interaction
  useEffect(() => {
    if (!loading && containerRef.current) {
      const enterFs = async () => {
        try {
          if (!document.fullscreenElement && containerRef.current) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
          }
        } catch (err) {
          // Handled silently: Browser requires initial user gesture to enter fullscreen
        }
      };

      const handleFirstInteraction = () => {
        enterFs();
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
      };

      window.addEventListener("click", handleFirstInteraction);
      window.addEventListener("touchstart", handleFirstInteraction);

      return () => {
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("touchstart", handleFirstInteraction);
      };
    }
  }, [loading]);

  // Fullscreen Toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen toggle:", e);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Track playback metric
  useEffect(() => {
    if (!currentMedia?.id) return;
    try {
      fetch("/api/track/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: currentMedia.id,
          eventType: "play",
          watchTimeSeconds: 5,
        }),
      }).catch(() => {});
    } catch (e) {}
  }, [currentMedia?.id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <PublicPreloader
        label="Offerzonline Live Channel"
        sublabel="Preparing latest broadcasts and local offers..."
        fullScreen={true}
        theme="dark"
      />
    );
  }

  if (streams.length === 0 || !currentMedia) {
    return (
      <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Radio size={32} />
        </div>
        <h1 className="text-2xl font-black mb-2">No Active Media Broadcasts</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          The channel has no active stream media. Once admin uploads media, it will automatically play here continuously.
        </p>
        <Link
          href="/streams/studio"
          className="px-6 py-3 rounded-2xl bg-[#0052cc] hover:bg-[#0045b0] text-white font-bold text-sm transition flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Studio Stats
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-screen h-screen bg-black text-white overflow-hidden select-none cursor-default"
    >
      {/* 24/7 Zero-Flicker Dynamic Media Surface */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
        {currentMedia && (
          currentMedia.media_type === "video" ? (
            <video
              key={`active-vid-${currentMedia.id}`}
              ref={activeVideoRef}
              src={currentMedia.media_url}
              preload="auto"
              playsInline
              autoPlay
              muted={isMuted}
              onCanPlay={() => {
                activeVideoRef.current?.play().catch(() => {});
              }}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
              onError={handleNextMedia}
              className="w-full h-full object-cover sm:object-contain bg-black"
            />
          ) : (
            <img
              key={`active-img-${currentMedia.id}`}
              src={currentMedia.media_url}
              alt={currentMedia.title}
              className="w-full h-full object-cover sm:object-contain bg-black"
            />
          )
        )}
      </div>

      {/* Official Channel Watermark Logo (Bottom Right - Favicon Logo) */}
      <div className="absolute bottom-6 right-6 z-50 pointer-events-none drop-shadow-2xl">
        <img
          src="/api/logo"
          alt="Offerzonline Logo Watermark"
          className="w-10 h-10 object-contain drop-shadow-lg opacity-85"
        />
      </div>

      {/* Bottom Media Progress Indicator Bar (Hidden in Fullscreen Mode) */}
      {!isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-40">
          <div 
            className="h-full bg-[#0052cc] transition-all duration-75 ease-linear shadow-[0_0_10px_#0052cc]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Top Channel Overlay (Fades out when mouse is idle) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <Link
            href="/streams/studio"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer border border-white/10 text-white"
          >
            <ArrowLeft size={14} /> Back to Studio Stats
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-rose-500/30 animate-pulse">
              <Radio size={12} /> LIVE CHANNEL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="p-2.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 border border-white/10 transition cursor-pointer"
            title="Share Channel Broadcast Link"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 border border-white/10 transition cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 border border-white/10 transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Info Card for Currently Playing Media */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-30 ${
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-4xl flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentMedia.category_name || "Offerz Live"}
              </span>
              {currentMedia.discount_value && (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Tag size={10} /> {currentMedia.discount_value}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              {currentMedia.title}
            </h1>

            {currentMedia.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 drop-shadow">
                {currentMedia.description}
              </p>
            )}
          </div>

          {currentMedia.target_url && (
            <div className="shrink-0">
              <a
                href={currentMedia.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer"
              >
                <span>{currentMedia.cta_text || "Check Deal & Offer"}</span>
                <ExternalLink size={15} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
