"use client";

import { useState, useEffect } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { 
  MapPin, Navigation, Sparkles, Store, Search, Mic, Bell, 
  Heart, ArrowUpRight, Tag, Bookmark, Layers, Percent, Clock, Compass, User
} from "lucide-react";
import Link from "next/link";

export default function PublicDiscoveryPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "sparkle" | "deals" | "profile">("home");

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
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f8] via-[#f3e8ff] to-[#e0f2fe] text-slate-800 pb-28 pt-4 px-4 sm:px-6 lg:px-8 selection:bg-purple-200 selection:text-purple-900">
      
      {/* Container */}
      <div className="max-w-4xl mx-auto space-y-7">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-lg">
                O
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                Hello, Explorer 👋
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Offerzonline Genius
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectLocation}
              className="bg-white/80 hover:bg-white border border-white/90 shadow-sm text-slate-700 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all"
            >
              <Navigation size={13} className="text-purple-600 animate-pulse" />
              <span className="max-w-[110px] truncate">{locationName}</span>
            </button>

            <button className="w-10 h-10 rounded-full bg-white/80 border border-white/90 shadow-sm flex items-center justify-center text-slate-700 hover:text-purple-600 transition">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Search Bar Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 flex items-center gap-1">
            <Sparkles size={16} />
          </div>
          <input
            type="text"
            placeholder="Search deals, stores, or offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 border border-white/90 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white shadow-sm backdrop-blur-md transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition">
            <Mic size={16} />
          </button>
        </div>

        {/* Today at a Glance Summary Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-purple-500" /> Today at a Glance
            </h2>
            <Link href="/admin" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              <Store size={13} /> Admin Portal
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-100/70 border border-white/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-sky-200/80 flex items-center justify-center text-sky-700 mb-2">
                <Percent size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 block">Active Deals</span>
              <span className="text-2xl font-black text-slate-900">{ads.length}</span>
            </div>

            <div className="bg-purple-100/70 border border-white/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-purple-200/80 flex items-center justify-center text-purple-700 mb-2">
                <Layers size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 block">Categories</span>
              <span className="text-2xl font-black text-slate-900">{categories.length}</span>
            </div>

            <div className="bg-emerald-100/70 border border-white/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-200/80 flex items-center justify-center text-emerald-700 mb-2">
                <Bookmark size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-600 block">Saved</span>
              <span className="text-2xl font-black text-slate-900">{savedAdIds.length}</span>
            </div>
          </div>
        </section>

        {/* Featured Hero Card ("Recommended for You") */}
        {featuredAd && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recommended for You</h2>
              <span className="text-xs font-semibold text-purple-600 cursor-pointer">View All</span>
            </div>

            <div 
              onClick={() => setSelectedAd(featuredAd)}
              className="group relative bg-white/80 border border-white rounded-[2.2rem] p-5 shadow-lg backdrop-blur-xl hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 z-10 relative">
                <button 
                  onClick={(e) => toggleSaveAd(featuredAd.id, e)}
                  className="w-9 h-9 rounded-full bg-white/90 border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-pink-500 transition"
                >
                  <Heart size={16} className={savedAdIds.includes(featuredAd.id) ? "fill-pink-500 text-pink-500" : ""} />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Media Container */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 bg-purple-50 shadow-inner">
                <img 
                  src={featuredAd.media_url} 
                  alt={featuredAd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {featuredAd.distance_km !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <MapPin size={12} className="text-purple-600" />
                    {featuredAd.distance_km} km away
                  </div>
                )}
              </div>

              {/* Title & Tags */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {featuredAd.title}
                </h3>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="bg-purple-100/80 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
                    ⚡ Verified Deal
                  </span>
                  {featuredAd.category_name && (
                    <span className="bg-pink-100/80 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full border border-pink-200">
                      {featuredAd.category_name}
                    </span>
                  )}
                  <span className="bg-emerald-100/80 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                    Nearby
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Pill Selector */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Explore Categories</h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white/80 border border-white/90 text-slate-600 hover:bg-white shadow-sm"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat.id.toString()
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white/80 border border-white/90 text-slate-600 hover:bg-white shadow-sm"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Offers Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Popular Offers</h2>
            <span className="text-xs font-semibold text-purple-600">View All</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white/50 rounded-3xl h-64 animate-pulse border border-white" />
              ))}
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="text-center py-16 bg-white/70 rounded-3xl border border-white shadow-sm">
              <MapPin size={40} className="mx-auto text-purple-400 mb-3 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Offers Found</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                No active deals matched your location radius or selected filter.
              </p>
            </div>
          )}
        </section>

      </div>

      {/* Floating Pill Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <nav className="floating-nav px-4 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
          <button 
            onClick={() => setActiveTab("home")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "home" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass size={18} />
          </button>
          
          <button 
            onClick={() => setActiveTab("categories")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "categories" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers size={18} />
          </button>

          {/* Central Active Button */}
          <button 
            onClick={() => setActiveTab("sparkle")}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 scale-105 hover:scale-110 transition-transform"
          >
            <Sparkles size={20} />
          </button>

          <button 
            onClick={() => setActiveTab("deals")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === "deals" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Tag size={18} />
          </button>

          <Link 
            href="/admin"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all"
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
