"use client";

import { useState, useEffect } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { LottieAnimation } from "@/components/LottieAnimation";
import { 
  ArrowLeft, Search, MapPin, Tag, Sparkles, AlertCircle, Bookmark, Compass
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "1", name: "Retail & Shopping" },
  { id: "2", name: "Food & Dining" },
  { id: "3", name: "Services & Repair" },
  { id: "4", name: "Entertainment & Events" },
  { id: "5", name: "Health & Fitness" },
  { id: "6", name: "Electronics & Tech" }
];

export default function OffersListingPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadAllOffers() {
      setLoading(true);
      try {
        // Query without coordinates to fetch all active ads globally
        const query = new URLSearchParams({
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
  }, [selectedCategory]);

  const toggleSaveAd = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAdIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      
      {/* Background Soft Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation / Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 sm:p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600 hover:text-slate-900 border border-slate-200/60"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                <Compass className="text-indigo-600" size={20} />
                All Verified Offers
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Discover the best local discounts and deals
              </p>
            </div>
          </div>

          {/* Search bar inside Listing Header */}
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search active offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </header>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userLocationName="National"
                  onSelect={(selected) => setSelectedAd(selected)}
                  isSaved={savedAdIds.includes(ad.id)}
                  onToggleSave={(e) => toggleSaveAd(ad.id, e)}
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
      </div>

      {/* Offer Detail Modal */}
      <OfferModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
