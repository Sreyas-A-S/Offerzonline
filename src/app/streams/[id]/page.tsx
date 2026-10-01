"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  Share2, Eye, Store, MessageCircle, ExternalLink, ArrowLeft, 
  Sparkles, Tag, MapPin, Copy, Check, Tv, Play, ChevronRight 
} from "lucide-react";
import { StreamPlayer, StreamData } from "@/components/StreamPlayer";
import { PublicPreloader } from "@/components/PublicPreloader";

export default function StreamWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stream, setStream] = useState<StreamData | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchStream() {
      try {
        setLoading(true);
        const res = await fetch(`/api/streams/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStream(data.stream);
          setRelated(data.related || []);
        }
      } catch (err) {
        console.error("Failed to fetch stream:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStream();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyEmbed = () => {
    if (typeof window !== "undefined" && stream) {
      const embedCode = `<iframe src="${window.location.origin}/embed/stream/${stream.id}" width="100%" height="500" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
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

  if (!stream) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Tv size={32} />
        </div>
        <h1 className="text-2xl font-black mb-2">Stream Not Found</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          This stream may have expired or been removed by the publisher.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <ArrowLeft size={16} /> Explore Other Offers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-md border-b border-[#1e293b] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discovery</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Offerz Streams
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
        >
          <Share2 size={14} />
          <span>Share</span>
        </button>
      </header>

      {/* Main Stream Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center 2 Columns: Video Player & Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Video Player */}
            <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80">
              <StreamPlayer stream={stream} autoPlay={true} />
            </div>

            {/* 2. Title & Stats Bar */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {stream.category_name && (
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
                      {stream.category_name}
                    </span>
                  )}
                  {stream.discount_value && (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs flex items-center gap-1">
                      <Tag size={12} /> {stream.discount_value}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} className="text-slate-500" />
                    <span>{stream.views_count || 0} Views</span>
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {stream.title}
              </h1>

              {/* Store Identity & CTAs */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {stream.store_logo ? (
                    <img
                      src={stream.store_logo}
                      alt={stream.store_name || "Store"}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 bg-white/10 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg border border-indigo-500 shadow-md">
                      <Store size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                      {stream.store_name || "Featured Store"}
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    </h3>
                    {stream.store_address && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate max-w-xs">{stream.store_address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {stream.store_phone && (
                    <a
                      href={`https://wa.me/${stream.store_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi! I'm watching your stream "${stream.title}" on Offerzonline.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  )}
                  {stream.target_url && (
                    <a
                      href={stream.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 active:scale-95"
                    >
                      <span>{stream.cta_text || "Visit Store"}</span>
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>

              {/* Description & Terms */}
              {stream.description && (
                <div className="pt-4 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-2xl">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    About this Offer & Stream
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {stream.description}
                  </p>
                </div>
              )}

              {stream.terms && (
                <div className="text-[11px] text-slate-500 italic">
                  * Terms & Conditions: {stream.terms}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Up Next / More Streams */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-400" /> More Streams
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  {related.length} available
                </span>
              </div>

              <div className="space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/streams/${item.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/60 hover:border-indigo-500/30 transition group"
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-800 flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : item.media_type === "video" ? (
                        <video
                          src={item.media_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition">
                        <Play size={16} className="text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-md uppercase">
                        {item.media_type}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 truncate mt-1">
                        {item.store_name || "Offerz Store"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.views_count || 0} views
                      </p>
                    </div>
                  </Link>
                ))}

                {related.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No other active streams at the moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Share this Stream</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Direct Link Copy */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Direct Stream URL
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="bg-transparent text-xs text-slate-300 w-full focus:outline-none font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Embed Code Copy */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Embed Video Player (iFrame)
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `<iframe src="${window.location.origin}/embed/stream/${stream.id}" width="100%" height="500" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : ""}
                  className="bg-transparent text-xs text-slate-300 w-full focus:outline-none font-mono truncate"
                />
                <button
                  onClick={handleCopyEmbed}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 transition"
                >
                  {copiedEmbed ? "Copied" : "Copy iFrame"}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const text = encodeURIComponent(`Watch "${stream.title}" on Offerzonline Streams!`);
                    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(window.location.href)}`, "_blank");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle size={15} /> WhatsApp
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const text = encodeURIComponent(`Check out "${stream.title}" on Offerzonline!`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                Twitter / X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
