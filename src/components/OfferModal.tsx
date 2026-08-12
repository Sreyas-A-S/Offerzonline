"use client";

import { X, MapPin, ExternalLink, ShieldCheck, Tag, Clock, Layers, Award } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-white rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full border border-slate-100 shadow-sm transition z-10"
        >
          <X size={16} />
        </button>

        {/* Media Header */}
        <div className="relative aspect-video bg-purple-50 rounded-t-[2.5rem] overflow-hidden">
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
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600 uppercase tracking-wider">
            <ShieldCheck size={14} /> Verified Business Promotion
          </div>

          <h2 className="text-2xl font-black text-slate-900 leading-tight">{ad.title}</h2>

          {/* Specs Row Grid matching the Mockup recipe spec chips */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-pink-100/70 p-2.5 rounded-2xl border border-pink-200/80">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Radius</span>
              <span className="text-xs font-black text-slate-900">{ad.radius_km || 10} km</span>
            </div>

            <div className="bg-sky-100/70 p-2.5 rounded-2xl border border-sky-200/80">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Format</span>
              <span className="text-xs font-black text-slate-900 truncate block">{ad.ad_format || "Card"}</span>
            </div>

            <div className="bg-emerald-100/70 p-2.5 rounded-2xl border border-emerald-200/80">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Priority</span>
              <span className="text-xs font-black text-slate-900">P{ad.weight_priority || 1}</span>
            </div>

            <div className="bg-amber-100/70 p-2.5 rounded-2xl border border-amber-200/80">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Status</span>
              <span className="text-xs font-black text-slate-900">Verified</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            {ad.category_name && (
              <span className="bg-slate-100 px-3 py-1 rounded-full font-semibold text-slate-700">
                Category: {ad.category_name}
              </span>
            )}
            {ad.distance_km !== undefined && (
              <span className="flex items-center gap-1 text-purple-600 font-bold">
                <MapPin size={12} /> {ad.distance_km} km away
              </span>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Close
            </button>
            <a
              href={`/api/track/click?ad_id=${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 hover:from-sky-500 hover:to-purple-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              Claim / View Deal <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
