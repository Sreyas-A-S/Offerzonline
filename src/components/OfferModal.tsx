"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, X, Share2, Check } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaUrls = ad && ad.media_url ? ad.media_url.split(",") : [];

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const getOptimizedUrl = (url: string) => {
    if (url.includes("images.unsplash.com") && !url.includes("w=")) {
      return `${url}${url.includes("?") ? "&" : "?"}auto=format&fit=crop&w=1200&q=85`;
    }
    return url;
  };

  // Lock/unlock body scroll when modal status changes
  useEffect(() => {
    if (ad) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [ad]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!ad) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ad]);

  if (!ad) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?ad=${ad.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Check out this offer on Offerzonline: ${ad.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  // Click outside to close handler (backdrop areas)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        ref={modalContentRef}
        className={`bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100 transition-all duration-300 flex flex-col justify-between ${
          isClosing ? "scale-95 translate-y-4 opacity-0" : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Top Control Bar Floating Buttons */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
            title="Share Offer"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
            title="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Toast Popup */}
        {showCopiedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-2xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Check size={14} className="text-emerald-400" />
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Modal Inner Scroll Area */}
        <div className="max-h-[82vh] overflow-y-auto scrollbar-none">
          {/* Hero Banner Container */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden group">
            {mediaUrls.length > 0 && (() => {
              const currentUrl = mediaUrls[activeMediaIndex];
              const isVideo = currentUrl.split("?")[0].split(".").pop()?.toLowerCase() === "mp4" || (ad.media_type === "video" && !currentUrl.includes("."));
              return isVideo ? (
                <video
                  key={currentUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  <source src={currentUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  key={currentUrl}
                  src={getOptimizedUrl(currentUrl)}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              );
            })()}

            {/* Subtle Gradient Overlay for Title Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

            {/* Category / Badge Pills */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
              <span className="bg-indigo-600/90 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
                {ad.category_name || "Featured Offer"}
              </span>
              {ad.distance_km !== undefined && (
                <span className="bg-slate-900/80 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-md">
                  <MapPin size={11} className="text-indigo-400" />
                  {ad.distance_km} km away
                </span>
              )}
            </div>

            {/* Navigation Arrows for Multiple Media Items */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-md cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-md cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                >
                  ›
                </button>
                {/* Dots indicator */}
                <div className="absolute bottom-4 right-4 z-20 flex gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                  {mediaUrls.map((_: string, idx: number) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeMediaIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Modal Body Content */}
          <div className="p-6 sm:p-8 space-y-5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
              {ad.title}
            </h2>

            {/* Description & Expiry Details */}
            {ad.description && (
              <div className="space-y-2 pt-1">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Offer Details</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {ad.description}
                </p>
              </div>
            )}

            {ad.expires_at && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-center gap-2.5">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  ⏳ Valid Until: {new Date(ad.expires_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Sticky Bottom Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100">
          <a
            href={`/api/track/click?ad_id=${ad.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
          >
            <span>Claim & View Offer</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
