"use client";

import { useState, useEffect, useRef } from "react";
import { AdCard } from "@/components/AdCard";
import { OfferModal } from "@/components/OfferModal";
import { LocationModal } from "@/components/LocationModal";
import { LottieAnimation } from "@/components/LottieAnimation";
import { 
  MapPin, Navigation, Sparkles, Store, Search, Mic, Bell, 
  Heart, ArrowUpRight, Tag, Bookmark, Layers, Percent, Clock, Compass, User, Star, ShoppingBag,
  Utensils, Car, Plane, Smartphone, Dumbbell, ShieldCheck, ChevronDown, ArrowUp, Download
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
  const [showPreloader, setShowPreloader] = useState(true);
  const [siteLogo, setSiteLogo] = useState<string>("/api/logo");
  const [ads, setAds] = useState<any[]>(DEFAULT_INITIAL_ADS);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);

  useEffect(() => {
    const collapseTimer = setTimeout(() => {
      setCategoriesCollapsed(true);
    }, 4500);
    return () => clearTimeout(collapseTimer);
  }, []);

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "sparkle" | "deals" | "saved">("home");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic brand logo, track page view, and hide preloader smoothly after 1.5s
  useEffect(() => {
    async function loadBrandLogo() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings?.logo) {
          setSiteLogo(data.settings.logo);
        }
      } catch (err) {
        console.error("Logo fetch error:", err);
      }
    }
    loadBrandLogo();

    // Persistent visitorId generation
    let visitorId = localStorage.getItem("offerz_visitor_id");
    if (!visitorId) {
      visitorId = "vid_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("offerz_visitor_id", visitorId);
    }

    // Log public pageview asynchronously
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        pagePath: window.location.pathname,
        visitorId,
      }),
    }).catch((e) => console.error("Pageview log error:", e));

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1500);
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

  // Location Auto-Detection with High Accuracy & Fallback
  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationName("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setLocationError(null);

          try {
            // Primary reverse geocoder (BigDataCloud free client API)
            const bdcRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
            );
            const bdcData = await bdcRes.json();
            const primaryName =
              bdcData.locality ||
              bdcData.city ||
              bdcData.principalSubdivision ||
              bdcData.localityInfo?.administrative?.[2]?.name;

            if (primaryName) {
              setLocationName(primaryName);
              localStorage.setItem("offerz_user_location", JSON.stringify({ name: primaryName, lat: coords.lat, lng: coords.lng }));
              return;
            }

            // Fallback reverse geocoder (OpenStreetMap Nominatim)
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
            );
            const data = await res.json();
            const address = data.address || {};
            const cityOrArea =
              address.suburb ||
              address.neighbourhood ||
              address.residential ||
              address.city ||
              address.town ||
              address.village ||
              address.district ||
              address.county ||
              "Current Location";
            setLocationName(cityOrArea);
            localStorage.setItem("offerz_user_location", JSON.stringify({ name: cityOrArea, lat: coords.lat, lng: coords.lng }));
          } catch {
            setLocationName("Current Location");
            localStorage.setItem("offerz_user_location", JSON.stringify({ name: "Current Location", lat: coords.lat, lng: coords.lng }));
          }
        },
        async (err) => {
          console.warn("GPS error, falling back to IP Geolocation:", err);
          // Fallback to free IP geolocation API if GPS is blocked or times out
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data.latitude && data.longitude) {
              setLocation({ lat: data.latitude, lng: data.longitude });
              const name = data.city || data.region || "Nearby Deals";
              setLocationName(name);
              setLocationError(null);
              localStorage.setItem("offerz_user_location", JSON.stringify({ name, lat: data.latitude, lng: data.longitude }));
              return;
            }
          } catch (ipErr) {
            console.error("IP geocode error:", ipErr);
          }
          setLocationError("Geolocation access denied. Showing default location.");
          setLocationName("Nearby Deals");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationName("Nearby Deals");
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

  // Track whether auto-popup on initial load has triggered
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isAutoPopup, setIsAutoPopup] = useState(false);

  // Auto-open top prioritized ad as a popup modal on page load
  useEffect(() => {
    if (typeof window !== "undefined" && !hasAutoOpened && ads.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const shareAdId = params.get("ad");
      
      // If a specific ad ID or UUID is in the URL, prioritize that (bypasses snooze)
      if (shareAdId) {
        const found = ads.find((a) => a.uuid === shareAdId || a.id.toString() === shareAdId);
        if (found) {
          setSelectedAd(found);
          setHasAutoOpened(true);
          return;
        }
      }

      // Check if auto-popup snooze is active
      const snoozeStr = localStorage.getItem("offerz_auto_popup_snooze");
      if (snoozeStr) {
        const snoozeTime = parseInt(snoozeStr, 10);
        if (Date.now() < snoozeTime) {
          setHasAutoOpened(true);
          return;
        }
      }

      // Automatically popup the designated onload popup ad, fallback to top weight priority
      const popupAd = ads.find((a) => a.is_onload_popup || a.isOnloadPopup) || ads[0];
      setSelectedAd(popupAd);
      setIsAutoPopup(true);
      setHasAutoOpened(true);
    }
  }, [ads, hasAutoOpened]);

  // GSAP Entrance Animations (runs safely once preloader unmounts)
  useEffect(() => {
    if (showPreloader) return;

    const ctx = gsap.context(() => {
      if (document.querySelector(".animate-header")) {
        gsap.from(".animate-header", {
          y: -25,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        });
      }

      if (document.querySelector(".animate-hero-card")) {
        gsap.from(".animate-hero-card", {
          scale: 0.94,
          opacity: 0,
          duration: 0.7,
          delay: 0.4,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, [showPreloader]);

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

  // Local Search Filter & Saved Filter
  const searchedAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAds = activeTab === "saved"
    ? searchedAds.filter((ad) => savedAdIds.includes(ad.id))
    : searchedAds;

  const featuredAd = filteredAds.find((a) => a.is_recommended || a.isRecommended) || (filteredAds.length > 0 ? filteredAds[0] : null);

  if (showPreloader) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 p-3 shadow-xl flex items-center justify-center animate-pulse">
            <img
              src={siteLogo}
              alt="Offerzonline Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Offerzonline</h2>
          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-[pulse_1s_infinite] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-32 pt-2 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Soft Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Full-Width Main Header Navbar */}
      <header ref={headerRef} className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-header bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 shadow-xs sticky top-0 z-40">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src={siteLogo}
              alt="Offerzonline Logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0 transition-all"
            />
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight hidden sm:block">
              Offerzonline
            </h1>
          </div>

            {/* Mobile Location */}
            <div className="flex items-center gap-2 md:hidden flex-1 justify-end">
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

            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const event = new CustomEvent("trigger-pwa-install");
                  window.dispatchEvent(event);
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Install Offerzonline App"
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
          </div>
        </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Explore Categories Section - Cutout 3D Card Style matching Reference Screenshot */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Shop By Category</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCategoriesCollapsed(!categoriesCollapsed)}
                className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-850 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition shadow-2xs cursor-pointer select-none"
              >
                {categoriesCollapsed ? "Expand Categories ⤢" : "Collapse View ⤡"}
              </button>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Reset Filter ↺
                </button>
              )}
            </div>
          </div>

          {categoriesCollapsed ? (
            /* Collapsed Pills Mode with small images */
            <div className="flex flex-row overflow-x-auto scrollbar-none gap-2 pt-1 pb-1 overflow-y-visible animate-collapse-pills">
              {categories.map((cat, idx) => {
                const visual = CATEGORY_CUTOUT_CARDS[cat.name] || DEFAULT_CUTOUT_CARD;
                const isSelected = selectedCategory === cat.id.toString();

                return (
                  <button
                    key={cat.id}
                    type="button"
                    style={{ animationDelay: `${idx * 20}ms` }}
                    onClick={() => setSelectedCategory(isSelected ? "all" : cat.id.toString())}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer border ${
                      isSelected 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102" 
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/85 hover:scale-102"
                    }`}
                  >
                    <img
                      src={visual.image}
                      alt={cat.name}
                      className="w-5 h-5 object-contain transition-transform group-hover:scale-110"
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="animate-expand-cards space-y-4">
              {/* Mobile-Style Category Row - Horizontal Scroll */}
              <div className={`${selectedCategory !== "all" ? "flex md:justify-center animate-switch-mode" : "md:hidden flex"} flex-row overflow-x-auto scrollbar-none gap-3 md:gap-6 pt-1.5 pb-2 overflow-y-visible`}>
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

              {/* Desktop Banner Grid (md:grid) */}
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

                      {/* 3D Cutout Image */}
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
            </div>
          )}
        </section>

        {/* Featured Hero Card ("Recommended for You") */}
        {featuredAd && selectedCategory === "all" && (
          <section ref={heroRef} className="space-y-3 animate-hero-card flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-full">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ca824] animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Recommended for You</h2>
              </div>
              <Link href="/offers" className="text-xs font-bold text-[#47a01b] hover:text-[#52b32c] hover:underline transition">
                View All
              </Link>
            </div>

            <div 
              onClick={() => setSelectedAd(featuredAd)}
              className="group relative bg-white border border-slate-200/80 rounded-[2rem] sm:rounded-[2.2rem] p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center w-fit max-w-full mx-auto"
            >
              {/* Media Container - Shrink-wrapping around image width for perfect symmetry */}
              <div className="relative inline-flex items-center justify-center max-w-full rounded-2xl overflow-hidden mb-4 bg-transparent border border-slate-100/80 shadow-inner">
                {/* Save Heart Button (Top Left Overlay) */}
                <button 
                  onClick={(e) => toggleSaveAd(featuredAd.id, e)}
                  className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:text-pink-500 transition cursor-pointer"
                  title="Save Offer"
                >
                  <Heart size={16} className={savedAdIds.includes(featuredAd.id) ? "fill-pink-500 text-pink-500" : ""} />
                </button>

                {/* Arrow Expand Icon (Top Right Overlay) */}
                <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#47a01b] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#52b32c] transition-all">
                  <ArrowUpRight size={16} />
                </div>

                {featuredAd.media_type === "video" ? (
                  <video 
                    src={featuredAd.media_url} 
                    className="w-auto h-auto max-h-[480px] max-w-full object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 shrink-0" 
                    controls 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                ) : (
                  <img 
                    src={featuredAd.media_url} 
                    alt={featuredAd.title}
                    className="w-auto h-auto max-h-[480px] max-w-full object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 shrink-0" 
                  />
                )}
                {featuredAd.distance_km !== undefined && (
                  <div className="absolute bottom-3 left-3 bg-white/95 text-slate-900 font-bold text-[11px] sm:text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-slate-200">
                    <MapPin size={12} className="text-[#47a01b]" />
                    {featuredAd.distance_km} km away
                  </div>
                )}
              </div>

              {/* Title & Tags */}
              <div className="text-center space-y-2 max-w-md mx-auto w-full">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-[#47a01b] transition-colors">
                  {featuredAd.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="bg-[#4ca824]/10 text-[#3b851c] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#4ca824]/30 shadow-2xs">
                    ⚡ Verified Deal
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
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
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 [column-fill:balance] overflow-visible">
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
      <OfferModal 
        ad={selectedAd} 
        onClose={() => {
          setSelectedAd(null);
          if (isAutoPopup) {
            const snoozeTime = Date.now() + 3 * 60 * 60 * 1000; // 3 hours
            localStorage.setItem("offerz_auto_popup_snooze", snoozeTime.toString());
            setIsAutoPopup(false);
          }
        }} 
      />

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
