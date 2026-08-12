"use client";

import { useEffect, useRef } from "react";
import { MapPin, ExternalLink, Heart } from "lucide-react";

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

function getVibrantCategoryBadge(categoryName?: string) {
  if (!categoryName) return "bg-slate-100 text-slate-800 border-slate-200";
  const name = categoryName.toLowerCase();
  
  if (name.includes("food") || name.includes("restaurant") || name.includes("dining")) {
    return "bg-amber-100 text-amber-900 border-amber-300";
  }
  if (name.includes("electro") || name.includes("tech") || name.includes("gadget")) {
    return "bg-sky-100 text-sky-900 border-sky-300";
  }
  if (name.includes("fashion") || name.includes("clothing") || name.includes("retail")) {
    return "bg-pink-100 text-pink-900 border-pink-300";
  }
  if (name.includes("health") || name.includes("fit") || name.includes("wellness")) {
    return "bg-rose-100 text-rose-900 border-rose-300";
  }
  if (name.includes("service") || name.includes("repair")) {
    return "bg-emerald-100 text-emerald-900 border-emerald-300";
  }

  return "bg-indigo-100 text-indigo-900 border-indigo-300";
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

  const badgeStyle = getVibrantCategoryBadge(ad.category_name);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(ad)}
      className="group relative bg-white border border-slate-200/90 rounded-[2rem] p-3.5 sm:p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Header Media */}
        <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-3 shadow-inner">
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
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-600 hover:text-pink-500 transition z-10 border border-slate-100"
          >
            <Heart size={14} className={isSaved ? "fill-pink-500 text-pink-500" : ""} />
          </button>

          {/* Distance Badge */}
          {ad.distance_km !== undefined && (
            <div className="absolute bottom-2.5 left-2.5 bg-white/95 text-slate-900 font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-100">
              <MapPin size={10} className="text-indigo-600" />
              {ad.distance_km} km away
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1 space-y-1.5 mb-3">
          {ad.category_name && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${badgeStyle}`}>
              {ad.category_name}
            </span>
          )}
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
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
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs shadow-sm hover:shadow-md"
        >
          View Offer <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
