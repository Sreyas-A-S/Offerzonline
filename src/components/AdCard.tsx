"use client";

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink, Tag } from "lucide-react";

interface AdCardProps {
  ad: {
    id: number;
    title: string;
    category_name?: string;
    media_url: string;
    media_type: string;
    ad_format: string;
    target_url: string;
    distance_km?: number;
  };
  userLocationName?: string;
  onSelect: (ad: any) => void;
}

export function AdCard({ ad, userLocationName, onSelect }: AdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    // Real-time impression tracking via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            fetch("/api/track/impression", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                adId: ad.id,
                referrer: document.referrer,
                userLocation: userLocationName || "Unknown",
              }),
            }).catch((err) => console.error("Impression error:", err));
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [ad.id, userLocationName]);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(ad)}
      className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-video bg-slate-950 overflow-hidden">
          {ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <img
              src={ad.media_url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {ad.distance_km !== undefined && (
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/50 text-emerald-400 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin size={12} />
              {ad.distance_km} km away
            </div>
          )}

          {ad.category_name && (
            <div className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 font-bold text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <Tag size={12} />
              {ad.category_name}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-slate-100 text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">
            {ad.title}
          </h3>
        </div>
      </div>

      <div className="px-4 pb-4 pt-0">
        <a
          href={`/api/track/click?ad_id=${ad.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
        >
          View Offer <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
