"use client";

import { useState, useEffect, useRef } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { LottieAnimation } from "@/components/LottieAnimation";
import { 
  MapPin, Navigation, Sparkles, Store, Search, Mic, Bell, 
  Heart, ArrowUpRight, Tag, Bookmark, Layers, Percent, Clock, Compass, User, Star, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

// Visual metadata for category cards matching the reference design
const CATEGORY_VISUALS: Record<string, { bg: string; border: string; text: string; image: string; rating: string; count: string }> = {
  "Retail & Shopping": {
    bg: "bg-[#fef3c7]", // Pastel Yellow/Peach
    border: "border-amber-300",
    text: "text-amber-950",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80",
    rating: "4.9",
    count: "12 Deals"
  },
  "Food & Dining": {
    bg: "bg-[#ffedd5]", // Soft Coral / Peach
    border: "border-orange-300",
    text: "text-orange-950",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80",
    rating: "4.8",
    count: "18 Deals"
  },
  "Electronics & Tech": {
    bg: "bg-[#dbeafe]", // Baby Blue
    border: "border-blue-300",
    text: "text-blue-950",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    rating: "4.9",
    count: "15 Deals"
  },
  "Health & Fitness": {
    bg: "bg-[#dcfce7]", // Mint Green
    border: "border-emerald-300",
    text: "text-emerald-950",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
    rating: "4.7",
    count: "9 Deals"
  },
  "Services & Repair": {
    bg: "bg-[#fce7f3]", // Soft Pink
    border: "border-pink-300",
    text: "text-pink-950",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop&q=80",
    rating: "4.6",
    count: "7 Deals"
  },
  "Entertainment & Events": {
    bg: "bg-[#f3e8ff]", // Soft Lavender / Violet
    border: "border-purple-300",
    text: "text-purple-950",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80",
    rating: "4.8",
    count: "11 Deals"
  }
};

const DEFAULT_VISUAL = {
  bg: "bg-[#e0e7ff]",
  border: "border-indigo-300",
  text: "text-indigo-950",
  image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80",
  rating: "4.8",
  count: "10 Deals"
};

export default function PublicDiscoveryPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "sparkle" | "deals" | "profile">("home");

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // User location state
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 });
  const [locationName, setLocationName] = useState("Detecting location...");
  const [geoError, setLocationError] = useState<string | null>(null);

  // Location Auto-Detection
  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setLocationName(`${coords.lat.toFixed(3)}°, ${coords.lng.toFixed(3)}°`);
          setLocationError(null);
        },
        (err) => {
          setLocationError("Geolocation access denied. Showing default location.");
          setLocationName("New Delhi (Default)");
        }
      );
    } else {
      setLocationName("New Delhi (Default)");
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch Ads based on coordinates and selected category
  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          category: selectedCategory,
        });

        const res = await fetch(`/api/ads/serve?${query.toString()}`);
        const data = await res.json();
        setAds(data.ads || []);
      } catch (err) {
        console.error("Error loading ads:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, [location, selectedCategory]);

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/ads");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Categories fetch fail:", err);
      }
    }
    fetchCategories();
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".animate-header", {
        y: -25,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
      });

      // Stat Cards Stagger Animation
      gsap.from(".animate-stat-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        stagger: 0.1,
        ease: "back.out(1.4)",
      });

      // Hero Card Spring Animation
      gsap.from(".animate-hero-card", {
        scale: 0.94,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const toggleSaveAd = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAdIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Local Search Filter
  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredAd = filteredAds.length > 0 ? filteredAds[0] : null;

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-32 pt-3 px-3 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Soft Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header Bar */}
        <header ref={headerRef} className="flex items-center justify-between pt-1 animate-header">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-base sm:text-lg">
                O
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Offerzonline Genius
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectLocation}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 shadow-sm text-slate-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <LottieAnimation type="pulse" className="w-4 h-4 shrink-0" />
              <span className="max-w-[85px] sm:max-w-[120px] truncate">{locationName}</span>
            </button>

            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition shrink-0">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Search Bar Input */}
        <div className="relative animate-header">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 flex items-center">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            placeholder="Search deals, stores, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-11 py-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white shadow-sm transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition">
            <Mic size={18} />
          </button>
        </div>



        {/* Explore Categories Section - PLACED ABOVE RECOMMENDED FOR YOU */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Shop By Category</h2>
            <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">See All ↗</span>
          </div>

          {/* Dedicated Category Cards Grid - Strictly 16:9 Outer Aspect Ratio (3x2 Grid on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const visual = CATEGORY_VISUALS[cat.name] || DEFAULT_VISUAL;
              const isSelected = selectedCategory === cat.id.toString();

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id.toString())}
                  className={`group relative aspect-[16/9] w-full ${visual.bg} border ${
                    isSelected ? "border-indigo-600 ring-2 ring-indigo-400 scale-[1.02]" : visual.border
                  } rounded-[2rem] p-3.5 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
                >
                  {/* Top Bar: Title & Rating Tag */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                      {cat.name}
                    </span>
                    <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200/80 text-[10px] sm:text-xs font-bold text-slate-800 flex items-center gap-1 shadow-2xs shrink-0">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {visual.rating}
                    </div>
                  </div>

                  {/* Center Image Frame */}
                  <div className="relative h-20 sm:h-24 w-full rounded-xl sm:rounded-2xl overflow-hidden my-1 bg-white/60 shadow-inner">
                    <img
                      src={visual.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                        Selected
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Specs & Action Button */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                      {visual.count}
                    </span>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white flex items-center justify-center group-hover:scale-110 transition-all shrink-0 shadow-2xs">
                      <ShoppingBag size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Hero Card ("Recommended for You") */}
        {featuredAd && (
          <section ref={heroRef} className="space-y-3 animate-hero-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Recommended for You</h2>
              <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
            </div>

            <div 
              onClick={() => setSelectedAd(featuredAd)}
              className="group relative bg-white border border-slate-200/90 rounded-[2rem] sm:rounded-[2.2rem] p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 z-10 relative">
                <button 
                  onClick={(e) => toggleSaveAd(featuredAd.id, e)}
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-pink-500 transition"
                >
                  <Heart size={16} className={savedAdIds.includes(featuredAd.id) ? "fill-pink-500 text-pink-500" : ""} />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Media Container */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-inner">
                <img 
                  src={featuredAd.media_url} 
                  alt={featuredAd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {featuredAd.distance_km !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-white/95 text-slate-900 font-bold text-[11px] sm:text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-slate-200">
                    <MapPin size={12} className="text-indigo-600" />
                    {featuredAd.distance_km} km away
                  </div>
                )}
              </div>

              {/* Title & Tags */}
              <div className="text-center space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {featuredAd.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-200">
                    ⚡ Verified Deal
                  </span>
                  {featuredAd.category_name && (
                    <span className="bg-pink-100 text-pink-700 text-[11px] font-bold px-3 py-1 rounded-full border border-pink-200">
                      {featuredAd.category_name}
                    </span>
                  )}
                  <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                    Nearby
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Popular Offers Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Popular Offers</h2>
            <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-100 rounded-3xl h-64 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocationName={locationName}
                  onSelect={(selected) => setSelectedAd(selected)}
                  isSaved={savedAdIds.includes(ad.id)}
                  onToggleSave={(e) => toggleSaveAd(ad.id, e)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <LottieAnimation type="radar" className="w-20 h-20 mb-2" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Offers Found</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                No active deals matched your location radius or selected filter.
              </p>
            </div>
          )}
        </section>

        {/* Simple Professional Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/80 pb-6 text-slate-500 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                O
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">Offerzonline</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-600">
              <a href="#" className="hover:text-indigo-600 transition">About Us</a>
              <a href="#" className="hover:text-indigo-600 transition">Verified Deals</a>
              <a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition">Terms of Service</a>
              <Link href="/admin" className="hover:text-indigo-600 transition font-bold text-indigo-600">Admin Portal</Link>
            </div>

            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Offerzonline. All rights reserved.
            </p>
          </div>
        </footer>

      </div>

      {/* Floating Pill Bottom Navigation for Light Mode */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xs sm:max-w-md w-full px-4">
        <nav className="floating-nav px-4 py-2.5 rounded-full flex items-center justify-between shadow-xl">
          <button 
            onClick={() => setActiveTab("home")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "home" ? "bg-indigo-50 text-indigo-600 font-bold shadow-2xs" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Compass size={18} />
          </button>
          
          <button 
            onClick={() => setActiveTab("categories")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "categories" ? "bg-indigo-50 text-indigo-600 font-bold shadow-2xs" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Layers size={18} />
          </button>

          {/* Central Active Button */}
          <button 
            onClick={() => setActiveTab("sparkle")}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 scale-105 hover:scale-110 transition-transform"
          >
            <Sparkles size={20} />
          </button>

          <button 
            onClick={() => setActiveTab("deals")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "deals" ? "bg-indigo-50 text-indigo-600 font-bold shadow-2xs" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Tag size={18} />
          </button>

          <Link 
            href="/admin"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all"
          >
            <User size={18} />
          </Link>
        </nav>
      </div>

      {/* Offer Detail Modal */}
      <OfferModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
