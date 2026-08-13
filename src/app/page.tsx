"use client";

import { useState, useEffect, useRef } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { LocationModal } from "@/components/LocationModal";
import { LottieAnimation } from "@/components/LottieAnimation";
import { 
  MapPin, Navigation, Sparkles, Store, Search, Mic, Bell, 
  Heart, ArrowUpRight, Tag, Bookmark, Layers, Percent, Clock, Compass, User, Star, ShoppingBag,
  Utensils, Car, Plane, Smartphone, Dumbbell, ShieldCheck, ChevronDown, ArrowUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

// Category Visual Metadata inspired by the reference design with 3D cutouts & sub-tags
const CATEGORY_CUTOUT_CARDS: Record<string, { 
  bg: string; 
  titleColor: string; 
  subPillBg: string;
  subPillText: string;
  image: string; 
  align: "right" | "left";
  blendMode?: string;
  subTags: { label: string; icon: any }[];
}> = {
  "Food & Dining": {
    bg: "bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a]", // Soft Golden Cream Gradient
    titleColor: "text-slate-900",
    subPillBg: "bg-white/80 border border-amber-200/80 shadow-2xs",
    subPillText: "text-amber-950 font-extrabold",
    image: "/images/categories/food.png",
    align: "right",
    blendMode: "mix-blend-multiply",
    subTags: [
      { label: "Restaurants", icon: Utensils },
      { label: "Takeout", icon: ShoppingBag },
      { label: "Cafes", icon: Sparkles }
    ]
  },
  "Services & Repair": {
    bg: "bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#0f172a]", // Dark Charcoal Gradient
    titleColor: "text-white",
    subPillBg: "bg-white/15 border border-white/15 backdrop-blur-md",
    subPillText: "text-slate-100 font-extrabold",
    image: "/images/categories/repair.png",
    align: "right",
    blendMode: "mix-blend-lighten",
    subTags: [
      { label: "Auto", icon: Car },
      { label: "Services", icon: ShieldCheck },
      { label: "Repairs", icon: Store }
    ]
  },
  "Entertainment & Events": {
    bg: "bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]", // Soft Sky Cyan Gradient
    titleColor: "text-slate-950",
    subPillBg: "bg-white/80 border border-sky-200/80 shadow-2xs",
    subPillText: "text-sky-950 font-extrabold",
    image: "/images/categories/travel.png",
    align: "left",
    blendMode: "mix-blend-multiply",
    subTags: [
      { label: "Hotels", icon: Store },
      { label: "Flights", icon: Plane },
      { label: "Events", icon: Sparkles }
    ]
  },
  "Retail & Shopping": {
    bg: "bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4c1d95]", // Deep Royal Violet Gradient
    titleColor: "text-white",
    subPillBg: "bg-white/20 border border-white/20 backdrop-blur-md",
    subPillText: "text-white font-extrabold",
    image: "/images/categories/shopping.png",
    align: "right",
    blendMode: "mix-blend-screen",
    subTags: [
      { label: "Fashion", icon: ShoppingBag },
      { label: "Footwear", icon: Tag },
      { label: "Deals", icon: Percent }
    ]
  },
  "Electronics & Tech": {
    bg: "bg-gradient-to-br from-[#fef9c3] via-[#fef08a] to-[#fde047]", // Golden Yellow Gradient
    titleColor: "text-slate-950",
    subPillBg: "bg-white/80 border border-yellow-300/80 shadow-2xs",
    subPillText: "text-slate-900 font-extrabold",
    image: "/images/categories/tech.png",
    align: "right",
    blendMode: "mix-blend-multiply",
    subTags: [
      { label: "Gadgets", icon: Smartphone },
      { label: "Audio", icon: Sparkles },
      { label: "Tech", icon: Store }
    ]
  },
  "Health & Fitness": {
    bg: "bg-gradient-to-br from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]", // Fresh Mint Gradient
    titleColor: "text-emerald-950",
    subPillBg: "bg-white/80 border border-emerald-300/80 shadow-2xs",
    subPillText: "text-emerald-950 font-extrabold",
    image: "/images/categories/fitness.png",
    align: "right",
    blendMode: "mix-blend-multiply",
    subTags: [
      { label: "Gyms", icon: Dumbbell },
      { label: "Wellness", icon: Sparkles },
      { label: "Sports", icon: Tag }
    ]
  }
};

const DEFAULT_CUTOUT_CARD = {
  bg: "bg-[#e2e8f0]",
  titleColor: "text-slate-900",
  subPillBg: "bg-white/80 border border-slate-200",
  subPillText: "text-slate-800",
  image: "/images/categories/shopping.png",
  align: "right" as const,
  subTags: [
    { label: "Offers", icon: Tag },
    { label: "Deals", icon: Percent },
    { label: "Local", icon: MapPin }
  ]
};

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

const INITIAL_CATEGORIES = [
  { id: 1, name: "Food & Dining" },
  { id: 2, name: "Retail & Shopping" },
  { id: 3, name: "Electronics & Tech" },
  { id: 4, name: "Health & Fitness" },
  { id: 5, name: "Services & Repair" },
  { id: 6, name: "Entertainment & Events" },
];

export default function PublicDiscoveryPage() {
  const [showPreloader, setShowPreloader] = useState(false);
  const [ads, setAds] = useState<any[]>(DEFAULT_INITIAL_ADS);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [savedAdIds, setSavedAdIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "sparkle" | "deals" | "saved">("home");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Preloader Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top button visibility listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Auto-open shared ad from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shareAdId = params.get("ad");
      if (shareAdId) {
        const found = ads.find((a) => a.id.toString() === shareAdId);
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

  if (showPreloader) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/logo.png"
            alt="Offerzonline Logo"
            className="w-20 h-20 object-contain rounded-full shadow-lg p-1 border border-slate-100 bg-white animate-bounce"
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Offerzonline</h2>
          <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full animate-[pulse_1s_infinite] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-32 pt-3 px-3 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Soft Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header / Navbar */}
        <header ref={headerRef} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1 animate-header bg-white/80 backdrop-blur-md border border-slate-100 p-4 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Offerzonline Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full shadow-md shrink-0 bg-white p-0.5 border border-slate-100"
              />
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Offerzonline
              </h1>
            </div>

            {/* Mobile Location & Bell */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer group"
              >
                <MapPin size={12} className="text-slate-500 group-hover:text-slate-900 transition" />
                <span className="max-w-[70px] truncate text-slate-900">{locationName}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shrink-0">
                <Bell size={14} />
              </button>
            </div>
          </div>

          {/* Search Bar Input in Navbar */}
          <div className="relative flex-1 max-w-xl mx-0 md:mx-6">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Search deals, stores, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:bg-white transition-all shadow-2xs"
            />
            <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition">
              <Mic size={15} />
            </button>
          </div>

          {/* Desktop Location Selector & Bell */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer group shadow-2xs"
            >
              <MapPin size={13} className="text-indigo-650 group-hover:scale-105 transition" />
              <span className="max-w-[120px] truncate text-slate-900 font-extrabold">{locationName}</span>
              <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-655 transition" />
            </button>

            <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-650 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 shadow-2xs">
              <Bell size={15} />
            </button>
          </div>
        </header>

        {/* Explore Categories Section - Cutout 3D Card Style matching Reference Screenshot */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Shop By Category</h2>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Reset Filter ↺
              </button>
            )}
          </div>

          {/* Mobile-Style Category Row - Horizontal Scroll, shown on Desktop too when active filter is chosen */}
          <div className={`${selectedCategory !== "all" ? "flex md:justify-center animate-switch-mode" : "md:hidden flex"} flex-row overflow-x-auto scrollbar-none gap-3 md:gap-6 pt-3 pb-4 overflow-y-visible`}>
            {categories.map((cat) => {
              const visual = CATEGORY_CUTOUT_CARDS[cat.name] || DEFAULT_CUTOUT_CARD;
              const isSelected = selectedCategory === cat.id.toString();

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id.toString())}
                  className="w-[22%] md:w-28 shrink-0 cursor-pointer group relative pt-2"
                >
                  {/* Category Pastel Base Tile */}
                  <div
                    className={`aspect-square w-full md:w-28 md:h-28 ${visual.bg} rounded-[1.6rem] relative shadow-md border ${
                      isSelected ? "border-indigo-600 ring-3 ring-indigo-400/50 scale-105" : "border-white/70"
                    } transition-all group-hover:scale-105 flex items-center justify-center p-0 overflow-visible`}
                  >
                    {/* 3D Cutout filling and bursting 125% past tile edges */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <Image
                        src={visual.image}
                        alt={cat.name}
                        width={96}
                        height={96}
                        priority={true}
                        unoptimized={true}
                        className="w-[125%] h-[125%] max-w-none object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110 -translate-y-1"
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white z-20" />
                    )}
                  </div>

                  {/* Category Name & Arrow underneath */}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-extrabold text-slate-900 leading-tight block truncate">
                      {cat.name.split(" ")[0]} <span className="text-slate-400 font-normal">›</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Banner Grid (md:grid) - Hidden when active filter is chosen */}
          <div className={`${selectedCategory !== "all" ? "hidden" : "hidden md:grid animate-switch-mode"} md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6`}>
            {categories.map((cat) => {
              const visual = CATEGORY_CUTOUT_CARDS[cat.name] || DEFAULT_CUTOUT_CARD;
              const isSelected = selectedCategory === cat.id.toString();

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id.toString())}
                  className={`group relative ${visual.bg} rounded-[2.2rem] p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-visible min-h-[175px] sm:min-h-[190px] flex flex-col justify-between border ${
                    isSelected ? "border-indigo-600 ring-4 ring-indigo-400/50 scale-[1.02]" : "border-white/60"
                  }`}
                >
                  {/* Left Column Content */}
                  <div className={`z-10 space-y-3 ${visual.align === "left" ? "pl-32 sm:pl-36" : "pr-32 sm:pr-36"}`}>
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${visual.titleColor} drop-shadow-2xs`}>
                      {cat.name}
                    </h3>

                    {/* Sub-Tag Pills matching reference design */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {visual.subTags.map((sub, idx) => {
                        const Icon = sub.icon;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-extrabold ${visual.subPillBg} ${visual.subPillText} shadow-xs hover:scale-105 transition-transform`}
                          >
                            <Icon size={12} />
                            <span>{sub.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3D Cutout Image - OVERFLOWING OUT OF CARD BOUNDARIES */}
                  <div
                    className={`absolute -bottom-3 sm:-bottom-5 ${
                      visual.align === "left" ? "-left-5 sm:-left-8" : "-right-5 sm:-right-8"
                    } w-44 sm:w-52 h-44 sm:h-52 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 pointer-events-none z-20`}
                  >
                    <Image
                      src={visual.image}
                      alt={cat.name}
                      width={208}
                      height={208}
                      priority={true}
                      unoptimized={true}
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]"
                    />
                  </div>

                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-20 bg-indigo-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md animate-pulse">
                      Active Filter
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Hero Card ("Recommended for You") */}
        {featuredAd && selectedCategory === "all" && (
          <section ref={heroRef} className="space-y-3 animate-hero-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Recommended for You</h2>
              <Link href="/offers" className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </Link>
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
                <Image 
                  src={featuredAd.media_url} 
                  alt={featuredAd.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority={true}
                  unoptimized={true}
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
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors">
                  {featuredAd.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="bg-indigo-150 text-indigo-850 text-[11px] font-bold px-3 py-1 rounded-full border border-indigo-200">
                    ⚡ Verified Deal
                  </span>
                  <span className="bg-emerald-150 text-emerald-850 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
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
            <Link href="/offers" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-100 rounded-3xl h-64 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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


      {/* Scroll to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-24 right-5 sm:right-8 z-40 bg-white/95 hover:bg-white text-indigo-600 border border-slate-200/90 shadow-xl p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in zoom-in"
          title="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}

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
        }}
        onDetectGPS={detectLocation}
      />
    </div>
  );
}
