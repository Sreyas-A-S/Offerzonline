"use client";

import { useState, useEffect } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { MapPin, Navigation, Tag, Sparkles, Filter, Store } from "lucide-react";
import Link from "next/link";

export default function PublicDiscoveryPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-emerald-500/20">
              O
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Offerz<span className="text-emerald-400">online</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={detectLocation}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition"
            >
              <Navigation size={14} className="text-emerald-400" />
              <span>{locationName}</span>
            </button>

            <Link
              href="/admin"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-1.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-1"
            >
              <Store size={14} /> Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner Section */}
        <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/20 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
              <Sparkles size={14} /> PostGIS Hyper-Local Targeting Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Discover verified deals & offers near you
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mb-6">
              Browse real-time local promotions dynamically targeted within your exact geographic radius.
            </p>
          </div>
        </section>

        {/* Category Pills */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id.toString()
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-900 rounded-2xl h-72 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocationName={locationName}
                  onSelect={(selected) => setSelectedAd(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800/80">
              <MapPin size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-200 mb-2">No Active Offers Nearby</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                There are no active local campaigns matching your current geographic radius or selected category.
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
