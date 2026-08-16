"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Navigation, Search, Check, Sparkles } from "lucide-react";
import { LottieAnimation } from "./LottieAnimation";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName: string;
  onSelectLocation: (name: string, lat: number, lng: number) => void;
  onDetectGPS: () => void;
}

const POPULAR_LOCATIONS = [
  { name: "All Locations (Show All Deals)", lat: 0, lng: 0 },
  { name: "Kazhakkoottam, Thiruvananthapuram", lat: 8.568016, lng: 76.873737 },
  { name: "Kochi, Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Ernakulam, Kochi", lat: 9.9816, lng: 76.2999 },
  { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "South Delhi, New Delhi", lat: 28.5494, lng: 77.2001 },
  { name: "Gurugram, NCR", lat: 28.4595, lng: 77.0266 },
  { name: "Noida Sector 18, NCR", lat: 28.5708, lng: 77.3261 },
  { name: "Bandra West, Mumbai", lat: 19.0596, lng: 72.8295 },
  { name: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408 },
  { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
  { name: "Cyber City, Gurugram", lat: 28.495, lng: 77.0895 }
];

export function LocationModal({
  isOpen,
  onClose,
  currentLocationName,
  onSelectLocation,
  onDetectGPS,
}: LocationModalProps) {
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and listen for Escape key when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const filteredLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto scroll-smooth animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-white border border-slate-200 rounded-[2.2rem] max-w-md w-full p-6 shadow-2xl relative scrollbar-none animate-in zoom-in-95 duration-200 my-auto space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Select Location</h3>
              <p className="text-[11px] text-slate-500">Discover nearby deals within your reach</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={() => {
            onDetectGPS();
            onClose();
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md text-xs transition-all"
        >
          <Navigation size={14} className="animate-pulse" />
          <span>Detect Current GPS Location</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search city or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
          />
        </div>

        {/* Popular Locations List */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
            Popular Areas & Cities
          </span>

          <div className="max-h-60 overflow-y-auto scroll-smooth space-y-1.5 pr-1 scrollbar-none">
            {filteredLocations.map((loc) => {
              const isCurrent = currentLocationName.includes(loc.name.split(",")[0]);

              return (
                <div
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation(loc.name, loc.lat, loc.lng);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs cursor-pointer border transition-all ${
                    isCurrent
                      ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold"
                      : "bg-slate-50/60 hover:bg-slate-100 border-slate-200/80 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className={isCurrent ? "text-indigo-600" : "text-slate-400"} />
                    <span>{loc.name}</span>
                  </div>

                  {isCurrent && <Check size={14} className="text-indigo-600 font-bold" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
