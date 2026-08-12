"use client";

import { useState, useEffect } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { MapPin, Navigation, Sparkles, Store, Search } from "lucide-react";
import Link from "next/link";

export default function PublicDiscoveryPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAd, setSelectedAd] = useState<any>(null);

  // User location state
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 }); // Default New Delhi
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

  // Local Search Filter
  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/60 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              O
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Offerz<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">online</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={detectLocation}
              className="bg-white/80 hover:bg-slate-100/90 text-slate-700 border border-slate-200 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all duration-300"
            >
              <Navigation size={14} className="text-indigo-600" />
              <span>{locationName}</span>
            </button>

            <Link
              href="/admin"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-5 py-2 rounded-2xl text-xs sm:text-sm shadow-md transition-all duration-300 flex items-center gap-1.5"
            >
              <Store size={14} /> Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        {/* Banner Section */}
        <section className="mb-10 p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-white to-indigo-50/50 border border-indigo-100 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-85 h-85 bg-gradient-to-bl from-indigo-300/10 to-purple-350/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
              <Sparkles size={13} className="text-indigo-600" /> PostGIS Hyper-Local Targeting Active
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Discover verified deals & offers near you
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mb-8 leading-relaxed">
              Browse real-time local promotions dynamically targeted within your exact geographic radius.
            </p>
          </div>
        </section>

        {/* Search & Categories Panel */}
        <section className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search offers or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 shadow-sm"
              />
            </div>

            {/* Title / Info */}
            <div className="text-sm text-slate-500 hidden md:block font-medium">
              Showing offers within your region
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat.id.toString()
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Ad Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-100 rounded-[2rem] h-80 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocationName={locationName}
                  onSelect={(selected) => setSelectedAd(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-250/60 shadow-sm">
              <MapPin size={48} className="mx-auto text-indigo-400 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Active Offers Nearby</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                {searchQuery 
                  ? "We couldn't find any offers matching your search query. Try another keyword!"
                  : "There are no active local campaigns matching your current geographic radius or selected category."}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Offer Detail Modal */}
      <OfferModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
