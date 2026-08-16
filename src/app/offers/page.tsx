"use client";

import { useState, useEffect } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { LocationModal } from "@/components/LocationModal";
import { LottieAnimation } from "@/components/LottieAnimation";
import { 
  ArrowLeft, Search, MapPin, ChevronDown, Compass
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "1", name: "Food & Dining" },
  { id: "2", name: "Retail & Shopping" },
  { id: "3", name: "Electronics & Tech" },
  { id: "4", name: "Health & Fitness" },
  { id: "5", name: "Services & Repair" },
  { id: "6", name: "Entertainment & Events" }
];

const DEFAULT_INITIAL_ADS = [
  {
    id: 1,
    title: "50% Off Gourmet Pizza & Pasta Combo",
    category_name: "Food & Dining",
    category_id: 2,
    media_url: "/images/categories/food.png",
    media_type: "image",
    ad_format: "300x250",
    target_url: "https://offerzonline.com/deals/pizza",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 10,
    weight_priority: 5,
    distance_km: 1.2,
    views: 142,
    clicks: 18,
    ctr: 12.68,
    is_active: true,
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Free Premium Gym Membership",
    category_name: "Health & Fitness",
    category_id: 5,
    media_url: "/images/categories/fitness.png",
    media_type: "image",
    ad_format: "responsive",
    target_url: "https://offerzonline.com/deals/fitness",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 15,
    weight_priority: 4,
    distance_km: 3.4,
    views: 98,
    clicks: 11,
    ctr: 11.22,
    is_active: true,
  },
];

export default function OffersListingPage() {
  const [ads, setAds] = useState<any[]>(DEFAULT_INITIAL_ADS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);

  // Load saved ad IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("offerz_saved_ad_ids");
      if (saved) {
        setSavedAdIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading saved ads:", e);
    }
  }, []);

  // Location State
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 });
  const [locationName, setLocationName] = useState("Detecting location...");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Auto-Detect Location
  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationName("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          try {
            const bdcRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
            );
            const bdcData = await bdcRes.json();
            const primaryName =
              bdcData.locality ||
              bdcData.city ||
              bdcData.principalSubdivision;
            if (primaryName) {
              setLocationName(primaryName);
              localStorage.setItem("offerz_user_location", JSON.stringify({ name: primaryName, lat: coords.lat, lng: coords.lng }));
              return;
            }
          } catch {
            // fallback
          }
          const name = `${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°`;
          setLocationName(name);
          localStorage.setItem("offerz_user_location", JSON.stringify({ name, lat: coords.lat, lng: coords.lng }));
        },
        async () => {
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data.latitude && data.longitude) {
              setLocation({ lat: data.latitude, lng: data.longitude });
              const name = data.city || data.region || "Nearby Deals";
              setLocationName(name);
              localStorage.setItem("offerz_user_location", JSON.stringify({ name, lat: data.latitude, lng: data.longitude }));
              return;
            }
          } catch (ipErr) {
            console.error("IP geocode error:", ipErr);
          }
          setLocationName("New Delhi (Default)");
        }
      );
    } else {
      setLocationName("New Delhi (Default)");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("offerz_user_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat !== undefined && parsed.lng !== undefined && parsed.name) {
          setLocation({ lat: parsed.lat, lng: parsed.lng });
          setLocationName(parsed.name);
          return;
        }
      } catch (e) {
        console.error("Error loading saved location:", e);
      }
    }
    detectLocation();
  }, []);

  // Fetch ads based on chosen category and location coordinates
  useEffect(() => {
    async function loadAllOffers() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          category: selectedCategory,
          limit: "50"
        });
        const res = await fetch(`/api/ads/serve?${query.toString()}`);
        const data = await res.json();
        setAds(data.ads || []);
      } catch (err) {
        console.error("Error loading offers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllOffers();
  }, [selectedCategory, location]);

  // Auto-open shared ad from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shareAdId = params.get("ad");
      if (shareAdId) {
        const found = ads.find((a) => a.uuid === shareAdId || a.id.toString() === shareAdId);
        if (found) {
          setSelectedAd(found);
        } else {
          fetch(`/api/ads/serve?id=${shareAdId}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.ads && data.ads.length > 0) {
                setSelectedAd(data.ads[0]);
              }
            })
            .catch((err) => console.error("Error fetching shared ad:", err));
        }
      }
    }
  }, [ads]);

  const toggleSaveAd = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAdIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("offerz_saved_ad_ids", JSON.stringify(next));
      } catch (err) {
        console.error("Error saving ad IDs to localStorage:", err);
      }
      return next;
    });
  };

  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* Background Soft Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Full-Width Header Navbar */}
      <header className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 shadow-xs sticky top-0 z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link 
              href="/" 
              className="p-2 hover:bg-slate-100 rounded-full transition text-slate-650 hover:text-slate-900 border border-slate-200/60"
            >
              <ArrowLeft size={16} />
            </Link>
            <img
              src="/api/logo"
              alt="Offerzonline Logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0 transition-all"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Offerzonline
              </h1>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">All Verified Offers</span>
            </div>
          </div>

          {/* Mobile Location Selector */}
          <div className="md:hidden flex-1 justify-end flex">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer group max-w-[150px] sm:max-w-[200px]"
            >
              <MapPin size={12} className="text-slate-500 group-hover:text-slate-900 transition shrink-0" />
              <span className="truncate text-slate-900 flex-1 text-left">{locationName}</span>
              <ChevronDown size={11} className="text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 max-w-xl mx-0 md:mx-6">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search active offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:bg-white transition-all shadow-2xs"
          />
        </div>

          {/* Desktop Location Selector */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer group shadow-2xs"
            >
              <MapPin size={13} className="text-indigo-650 group-hover:scale-105 transition" />
              <span className="max-w-[120px] truncate text-slate-900 font-extrabold">{locationName}</span>
              <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-655 transition" />
            </button>
          </div>
        </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-6 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Categories Selector Tabs */}
        <section className="flex flex-row overflow-x-auto scrollbar-none gap-2 pb-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected 
                    ? "bg-slate-950 text-white border-slate-950 shadow-md scale-102" 
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </section>

        {/* Listing Grid */}
        <main className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {loading ? "Searching offers..." : `${filteredAds.length} offers found`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-slate-100 rounded-3xl h-64 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5 [column-fill:balance] overflow-visible">
              {filteredAds.map((ad, idx) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocationName={locationName}
                  onSelect={(selected) => setSelectedAd(selected)}
                  isSaved={savedAdIds.includes(ad.id)}
                  onToggleSave={(e) => toggleSaveAd(ad.id, e)}
                  priority={idx < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col items-center justify-center">
              <LottieAnimation type="radar" className="w-24 h-24 mb-3" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Offers Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto px-4">
                No active deals matched your search query or chosen category. Try resetting the filter!
              </p>
            </div>
          )}
        </main>

        {/* Simple Professional Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/80 pb-6 text-slate-500 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Offerzonline Logo"
                className="w-7 h-7 object-contain rounded-full bg-white p-0.5 border border-slate-100"
              />
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">Offerzonline</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-600">
              <a href="#" className="hover:text-indigo-600 transition">About Us</a>
              <a href="#" className="hover:text-indigo-600 transition">Verified Deals</a>
              <a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition">Terms of Service</a>
            </div>

            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Offerzonline. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Offer Detail Modal */}
      <OfferModal ad={selectedAd} onClose={() => setSelectedAd(null)} />

      {/* Location Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocationName={locationName}
        onSelectLocation={(name, lat, lng) => {
          setLocationName(name);
          setLocation({ lat, lng });
          localStorage.setItem("offerz_user_location", JSON.stringify({ name, lat, lng }));
        }}
        onDetectGPS={detectLocation}
      />
    </div>
  );
}
