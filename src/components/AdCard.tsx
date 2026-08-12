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

// Map categories to beautiful soft light colored themes inspired by the reference images
function getCategoryColor(categoryName?: string) {
  if (!categoryName) return { bg: "bg-white", border: "border-slate-100", text: "text-slate-700", badge: "bg-slate-100 text-slate-650" };
  const name = categoryName.toLowerCase();
  
  if (name.includes("food") || name.includes("restaurant") || name.includes("dining")) {
    return {
      bg: "bg-orange-50/70",
      border: "border-orange-200 group-hover:border-orange-400",
      text: "text-orange-950",
      badge: "bg-orange-100 text-orange-700 border border-orange-200"
    };
  }
  if (name.includes("electro") || name.includes("tech") || name.includes("gadget")) {
    return {
      bg: "bg-sky-50/70",
      border: "border-sky-200 group-hover:border-sky-400",
      text: "text-sky-950",
      badge: "bg-sky-100 text-sky-700 border border-sky-200"
    };
  }
  if (name.includes("fashion") || name.includes("clothing") || name.includes("beauty")) {
    return {
      bg: "bg-pink-50/70",
      border: "border-pink-200 group-hover:border-pink-400",
      text: "text-pink-950",
      badge: "bg-pink-100 text-pink-700 border border-pink-200"
    };
  }
  if (name.includes("grocer") || name.includes("supermarket") || name.includes("fresh")) {
    return {
      bg: "bg-emerald-50/70",
      border: "border-emerald-200 group-hover:border-emerald-400",
      text: "text-emerald-950",
      badge: "bg-emerald-100 text-emerald-700 border border-emerald-200"
    };
  }
  if (name.includes("health") || name.includes("wellness") || name.includes("fit")) {
    return {
      bg: "bg-purple-50/70",
      border: "border-purple-200 group-hover:border-purple-400",
      text: "text-purple-950",
      badge: "bg-purple-100 text-purple-700 border border-purple-200"
    };
  }

  // Default theme
  return {
    bg: "bg-white",
    border: "border-slate-200 group-hover:border-indigo-300",
    text: "text-slate-800",
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-100"
  };
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

  const theme = getCategoryColor(ad.category_name);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(ad)}
      className={`group ${theme.bg} border ${theme.border} rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between`}
    >
      <div>
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden rounded-[2rem] m-2.5 shadow-inner">
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
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-100 text-slate-800 font-semibold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <MapPin size={10} className="text-indigo-600" />
              {ad.distance_km} km away
            </div>
          )}

          {ad.category_name && (
            <div className={`absolute top-3 right-3 font-semibold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${theme.badge}`}>
              <Tag size={10} />
              {ad.category_name}
            </div>
          )}
        </div>

        <div className="px-5 py-3">
          <h3 className={`font-bold text-lg ${theme.text} group-hover:text-indigo-600 transition-colors line-clamp-2`}>
            {ad.title}
          </h3>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <a
          href={`/api/track/click?ad_id=${ad.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow-md"
        >
          View Offer <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
