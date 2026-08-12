"use client";

import { X, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-white/90 hover:bg-slate-100 text-slate-700 p-2.5 rounded-full border border-slate-200/60 shadow-sm transition z-10"
        >
          <X size={16} />
        </button>

        <div className="relative aspect-video bg-slate-100 rounded-t-[2.5rem] overflow-hidden">
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

        <div className="p-8">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 mb-3 uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Local Business Offer
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight">{ad.title}</h2>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
            {ad.category_name && (
              <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-650">
                {ad.category_name}
              </span>
            )}
            {ad.distance_km !== undefined && (
              <span className="flex items-center gap-1 text-indigo-650 font-bold">
                <MapPin size={14} /> {ad.distance_km} km away from your location
              </span>
            )}
          </div>

          <div className="pt-6 border-t border-slate-150 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              Close
            </button>
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all duration-300"
            >
              Claim / View Deal <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
