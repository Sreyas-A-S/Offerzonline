"use client";

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink, Tag, Heart } from "lucide-react";

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
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

export function AdCard({ ad, userLocationName, onSelect, isSaved, onToggleSave }: AdCardProps) {
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
      className="group relative bg-white/80 border border-white/90 rounded-[2rem] p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer backdrop-blur-md flex flex-col justify-between"
    >
      <div>
        {/* Card Header Media */}
        <div className="relative aspect-[4/3] bg-purple-50/50 rounded-2xl overflow-hidden mb-3">
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

          {/* Heart Bookmark Icon */}
          <button
            onClick={(e) => onToggleSave && onToggleSave(e)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-600 hover:text-pink-500 transition z-10"
          >
            <Heart size={14} className={isSaved ? "fill-pink-500 text-pink-500" : ""} />
          </button>

          {/* Distance Badge */}
          {ad.distance_km !== undefined && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <MapPin size={10} className="text-purple-600" />
              {ad.distance_km} km away
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1 space-y-1 mb-3">
          {ad.category_name && (
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
              {ad.category_name}
            </span>
          )}
          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
            {ad.title}
          </h3>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <a
          href={`/api/track/click?ad_id=${ad.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-slate-900 hover:bg-purple-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs shadow-sm"
        >
          View Offer <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
