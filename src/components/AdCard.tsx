"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import { getOrCreateVisitorId, cleanReferrer } from "@/utils/analytics";

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
    expires_at?: string | Date;
  };
  userLocationName?: string;
  onSelect: (ad: any) => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
  priority?: boolean;
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

export function AdCard({ ad, userLocationName, onSelect, isSaved, onToggleSave, priority = false }: AdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaUrls = ad.media_url ? ad.media_url.split(",") : [];

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const getOptimizedUrl = (url: string) => {
    if (url.includes("images.unsplash.com") && !url.includes("w=")) {
      return `${url}${url.includes("?") ? "&" : "?"}auto=format&fit=crop&w=600&q=80`;
    }
    return url;
  };

  useEffect(() => {
    // Set up global batching structures on mounting
    if (typeof window !== "undefined") {
      const win = window as any;
      win.__impressionQueue = win.__impressionQueue || [];
      
      if (!win.__impressionInterval) {
        win.__impressionInterval = setInterval(() => {
          const queue = win.__impressionQueue || [];
          if (queue.length === 0) return;
          
          const adIds = [...queue];
          win.__impressionQueue = [];
          
          const visitorId = getOrCreateVisitorId();
          const cleanRef = cleanReferrer(typeof document !== "undefined" ? document.referrer : "");

          fetch("/api/track/impression", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adIds,
              visitorId,
              referrer: cleanRef,
              userLocation: userLocationName || "Unknown",
            }),
          }).catch((err) => console.error("Batch impression error:", err));
        }, 1200); // Flush queue every 1.2 seconds
      }
    }

    // Real-time impression tracking via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            
            // Queue impression event
            if (typeof window !== "undefined") {
              const win = window as any;
              win.__impressionQueue = win.__impressionQueue || [];
              if (!win.__impressionQueue.includes(ad.id)) {
                win.__impressionQueue.push(ad.id);
              }
            }
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
      className="group relative transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between break-inside-avoid mb-4 sm:mb-5"
    >
      <div>
        {/* Card Header Media */}
        <div className="relative bg-slate-100 rounded-2xl overflow-hidden mb-3 shadow-inner group/media w-full">
          {mediaUrls.length > 0 && (() => {
            const currentUrl = mediaUrls[activeMediaIndex];
            const isVideo = currentUrl.split("?")[0].split(".").pop()?.toLowerCase() === "mp4" || ad.media_type === "video" && !currentUrl.includes(".");
            return isVideo ? (
              <video
                key={currentUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
              >
                <source src={currentUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                key={currentUrl}
                src={getOptimizedUrl(currentUrl)}
                alt={ad.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
              />
            );
          })()}

          {/* Navigation Arrows for Card Slider */}
          {mediaUrls.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer opacity-0 group-hover/media:opacity-100 transition-opacity select-none"
              >
                ‹
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer opacity-0 group-hover/media:opacity-100 transition-opacity select-none"
              >
                ›
              </button>
              {/* Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                {mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${
                      idx === activeMediaIndex ? "bg-white w-2.5" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Floating Action Arrow redirect icon */}
          <a
            href={`/api/track/click?ad_id=${ad.id}&visitor_id=${typeof window !== "undefined" ? getOrCreateVisitorId() : ""}&referrer=${typeof document !== "undefined" ? encodeURIComponent(cleanReferrer(document.referrer)) : "Direct"}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-md shadow-sm flex items-center justify-center text-white hover:bg-slate-950 hover:scale-105 transition z-10 border border-slate-800"
            title="View Offer"
          >
            <ArrowUpRight size={14} />
          </a>

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

          {/* Expiry Date Badge */}
          {ad.expires_at && (
            <div className="absolute bottom-2.5 right-2.5 bg-amber-500/95 text-white font-extrabold text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-600/10">
              ⏳ {new Date(ad.expires_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "numeric" })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1 space-y-1 mb-3">
          <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 group-hover:text-slate-900 transition-colors leading-snug">
            {ad.title}
          </h3>
        </div>
      </div>

      {/* Bottom padding adjustment */}
      <div className="pt-0" />
    </div>
  );
}
