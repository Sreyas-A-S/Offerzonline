"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { 
  Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Radio, 
  Share2, Check, ExternalLink, Sparkles, Store, Tag, Compass
} from "lucide-react";
import { PublicPreloader } from "@/components/PublicPreloader";

export default function ChannelStreamFullscreenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls/overlays after mouse inactivity
  const handleMouseMove = () => {
    setShowOverlays(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 3500);
  };

  useEffect(() => {
    async function fetchChannel() {
      try {
        setLoading(true);
        const res = await fetch(`/api/streams/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStream(data.stream);
        }
      } catch (err) {
        console.error("Failed to load channel stream:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChannel();
  }, [id]);

  // Handle Fullscreen Toggle
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
      console.warn("Fullscreen toggle error:", e);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Send periodic stream play ping
  useEffect(() => {
    if (!stream?.id) return;
    try {
      fetch("/api/track/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId: stream.id,
          eventType: "play",
          watchTimeSeconds: 5,
        }),
      }).catch(() => {});
    } catch (e) {}
  }, [stream?.id]);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <PublicPreloader
        label="Connecting to Live Broadcast Channel"
        sublabel="Buffering continuous stream loop..."
        fullScreen={true}
        theme="dark"
      />
    );
  }

  if (!stream) {
    return (
      <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Radio size={32} />
        </div>
        <h1 className="text-2xl font-black mb-2">Channel Broadcast Unavailable</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          This broadcast stream is currently inactive or has been updated by the administrator.
        </p>
        <Link
          href="/streams/studio"
          className="px-6 py-3 rounded-2xl bg-[#0052cc] hover:bg-[#0045b0] text-white font-bold text-sm transition flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Stream Studio
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
      {/* 24/7 Continuous Loop Video Media (No pause/resume allowed) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {stream.media_type === "video" ? (
          <video
            ref={videoRef}
            src={stream.media_url}
            className="w-full h-full object-cover sm:object-contain bg-black pointer-events-none"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
        ) : (
          <img
            src={stream.media_url}
            alt={stream.title}
            className="w-full h-full object-cover sm:object-contain bg-black"
          />
        )}
      </div>

      {/* Top Overlay Banner (Fades out when idle) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <Link
            href="/streams/studio"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer border border-white/10 text-white"
          >
            <ArrowLeft size={14} /> Back to Studio
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-rose-500/30 animate-pulse">
              <Radio size={12} /> LIVE BROADCAST
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              Channel #{stream.id} • Continuous Loop
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="p-2.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 border border-white/10 transition cursor-pointer"
            title="Share Channel URL"
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

      {/* Bottom Floating Channel Info Card */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-30 ${
          showOverlays ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-4xl flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {stream.category_name && (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {stream.category_name}
                </span>
              )}
              {stream.discount_value && (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Tag size={10} /> {stream.discount_value}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              {stream.title}
            </h1>

            {stream.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2 drop-shadow">
                {stream.description}
              </p>
            )}
          </div>

          {stream.target_url && (
            <div className="shrink-0">
              <a
                href={stream.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer"
              >
                <span>{stream.cta_text || "Check Deal & Offer"}</span>
                <ExternalLink size={15} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
