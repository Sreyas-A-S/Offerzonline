"use client";

import { X, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200 scrollbar-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 bg-white/95 hover:bg-white text-slate-700 p-2 sm:p-2.5 rounded-full border border-slate-200 shadow-md transition z-10"
        >
          <X size={16} />
        </button>

        {/* Media Header */}
        <div className="relative aspect-video bg-slate-100 rounded-t-[2rem] sm:rounded-t-[2.5rem] overflow-hidden">
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
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Business Promotion
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{ad.title}</h2>

          {/* Specs Row Grid matching the Mockup recipe spec chips - Vibrant Colors */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-rose-100/90 p-2 sm:p-2.5 rounded-2xl border border-rose-300">
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-900 block uppercase">Radius</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">{ad.radius_km || 10} km</span>
            </div>

            <div className="bg-sky-100/90 p-2 sm:p-2.5 rounded-2xl border border-sky-300">
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-900 block uppercase">Format</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">{ad.ad_format || "Card"}</span>
            </div>

            <div className="bg-emerald-100/90 p-2 sm:p-2.5 rounded-2xl border border-emerald-300">
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-900 block uppercase">Priority</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">P{ad.weight_priority || 1}</span>
            </div>

            <div className="bg-amber-100/90 p-2 sm:p-2.5 rounded-2xl border border-amber-300">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 block uppercase">Status</span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Active</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
            {ad.category_name && (
              <span className="bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-700 border border-slate-200">
                Category: {ad.category_name}
              </span>
            )}
            {ad.distance_km !== undefined && (
              <span className="flex items-center gap-1 text-indigo-600 font-bold">
                <MapPin size={12} /> {ad.distance_km} km away
              </span>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Close
            </button>
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              Claim / View Deal <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
