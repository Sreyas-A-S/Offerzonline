"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

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
    }, 200);
  };

  // Click outside to close handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto scroll-smooth transition-opacity duration-200 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        ref={modalContentRef}
        className={`bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scroll-smooth shadow-2xl relative scrollbar-none my-auto transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Media Header */}
        <div className="relative aspect-video bg-slate-100 rounded-t-2xl overflow-hidden">
          {ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={ad.media_url}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{ad.title}</h2>

          {ad.distance_km !== undefined && (
            <div className="flex items-center justify-start text-[11px] text-slate-500 font-semibold pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-450" /> {ad.distance_km} km away
              </span>
            </div>
          )}

          {/* Action Footer - Solid Premium Dark Slate Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              View Offer <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
