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
      className={`fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md overflow-y-auto scroll-smooth transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        ref={modalContentRef}
        className={`bg-white min-h-screen w-full overflow-y-auto scroll-smooth relative scrollbar-none transition-all duration-300 flex flex-col justify-between ${
          isClosing ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Floating Share & Close Buttons */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/10 cursor-pointer"
            title="Share Offer"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/10 cursor-pointer"
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Toast Popup */}
        {showCopiedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-800 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
            <Check size={14} className="text-emerald-450" />
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Modal Inner Wrapper */}
        <div className="flex-1">
          {/* Media Header Banner */}
          <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-950 overflow-hidden shadow-md">
            {ad.media_type === "video" ? (
              <video
                controls
                autoPlay
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
              >
                <source src={ad.media_url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={ad.media_url}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Modal Body Centered Content */}
          <div className="max-w-3xl mx-auto p-5 sm:p-8 md:p-12 space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {ad.title}
              </h2>

              {ad.distance_km !== undefined && (
                <div className="flex items-center gap-1 text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                  <MapPin size={13} className="text-indigo-650" />
                  {ad.distance_km} km away
                </div>
              )}
            </div>

            {/* Description / Expiry Dates */}
            {(ad.description || ad.expires_at) && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {ad.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About This Offer</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {ad.description}
                    </p>
                  </div>
                )}
                {ad.expires_at && (
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex items-center gap-2">
                    <span className="text-[11px] font-black text-amber-850 uppercase tracking-wider">
                      📅 Valid Until: {new Date(ad.expires_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Sticky Footer */}
        <div className="border-t border-slate-100 py-4 px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
            >
              Claim & View Offer <ExternalLink size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
