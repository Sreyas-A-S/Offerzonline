"use client";

import { X, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-800 text-slate-300 p-2 rounded-full border border-slate-700 transition z-10"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-video bg-slate-950">
          {ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={ad.media_url}
              alt={ad.title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Local Business Offer
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{ad.title}</h2>

          <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
            {ad.category_name && (
              <span className="bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                {ad.category_name}
              </span>
            )}
            {ad.distance_km !== undefined && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <MapPin size={14} /> {ad.distance_km} km away from your location
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Close
            </button>
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center gap-2 transition"
            >
              Claim / View Deal <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
