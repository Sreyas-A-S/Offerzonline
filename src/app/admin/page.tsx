"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Eye, EyeOff, MousePointerClick, TrendingUp, Upload, 
  MapPin, CheckCircle, RefreshCw, Store, Lock, LogOut, ShieldCheck,
  Menu, X, Layers, BarChart2, Code, Copy, Check, Globe, Filter, Calendar,
  RotateCcw, SlidersHorizontal, Search, ChevronDown, Clock, Flame
} from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import Cropper from "react-easy-crop";
import { parseUserAgentDetails, formatLocationName } from "@/utils/analytics";
import { TrafficHeatmap } from "@/components/TrafficHeatmap";

function SearchableSelect({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder = "Search...",
  allLabel = "All",
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; subLabel?: string }[];
  placeholder?: string;
  allLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value.toString() === value.toString());
  const displayLabel = value === "all" ? allLabel : (selectedOption?.label || value);

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      (o.subLabel && o.subLabel.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
        {icon} {label}
      </label>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setQuery("");
        }}
        className="w-full bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 hover:border-indigo-500/50 transition cursor-pointer text-left shadow-sm"
      >
        <span className="truncate block font-medium">{displayLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 max-h-64 flex flex-col">
          <div className="p-2 border-b border-[#1e293b] bg-[#0b0f19]">
            <div className="flex items-center gap-2 bg-[#131b2e] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs text-white">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full bg-transparent focus:outline-none text-xs text-white placeholder:text-slate-500 font-medium"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48 divide-y divide-transparent">
            <button
              type="button"
              onClick={() => {
                onChange("all");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                value === "all" ? "bg-indigo-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{allLabel}</span>
              {value === "all" && <Check size={13} />}
            </button>

            {filteredOptions.map((opt) => {
              const isSelected = value.toString() === opt.value.toString();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                    isSelected ? "bg-indigo-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate font-medium">{opt.label}</span>
                    {opt.subLabel && <span className="text-[10px] text-slate-400 block truncate">{opt.subLabel}</span>}
                  </div>
                  {isSelected && <Check size={13} className="shrink-0" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500 font-medium">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined allowed resolutions configuration
const RESOLUTIONS = [
  { name: "300x250", label: "300x250 Medium Rectangle", aspect: 300 / 250 },
  { name: "728x90", label: "728x90 Leaderboard", aspect: 728 / 90 },
  { name: "1080x1920", label: "1080x1920 Mobile Story", aspect: 1080 / 1920 },
  { name: "responsive", label: "Responsive (Flexible)", aspect: undefined },
];

// Helper to crop image using HTML5 Canvas
const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No 2d context"));
        return;
      }
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.95);
    };
    image.onerror = (err) => reject(err);
  });
};

const formatIST = (timestamp: any) => {
  if (!timestamp) return "-";
  try {
    const formatted = new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${formatted} IST`;
  } catch (e) {
    return String(timestamp);
  }
};

const formatDateIST = (date: any) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return String(date);
  }
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "categories" | "settings">("overview");
  const [siteLogo, setSiteLogo] = useState<string>("/api/logo");
  const [logoUploading, setLogoUploading] = useState(false);
  const [adsPage, setAdsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [showOnlyActiveAds, setShowOnlyActiveAds] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string } | null>(null);
  const [embedAd, setEmbedAd] = useState<any>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "1",
    adFormat: "responsive",
    targetUrl: "",
    mediaUrl: "",
    mediaType: "image",
    latitude: null as number | null,
    longitude: null as number | null,
    radiusKm: 10,
    weightPriority: 5,
    description: "",
    expiresAt: "",
    storeName: "",
    storeLogo: "",
    storePhone: "",
    storeAddress: "",
    originalPrice: "",
    promoPrice: "",
    discountValue: "",
    terms: "",
    isOnloadPopup: false,
    isRecommended: false,
  });

  // Cropper states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(300/250);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);
  const [cropResName, setCropResName] = useState<string>("300x250");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Category CRUD state helpers
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [catUploading, setCatUploading] = useState(false);

  // Auto-hide messages after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Listen for Escape key to close media preview and crop modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewMedia(null);
        setCropModalOpen(false);
        setCropperImage(null);
        setSelectedFile(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("admin_authenticated", "true");
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "Invalid Admin Username or Password");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication error");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the admin panel?")) {
      sessionStorage.removeItem("admin_authenticated");
      setIsAuthenticated(false);
      setIsSidebarOpen(false);
    }
  };

  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalAdImpressions: 0,
    totalAdClicks: 0,
  });
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [hourlyStats, setHourlyStats] = useState<any[]>([]);
  const [peakHour, setPeakHour] = useState<any | null>(null);
  const [geoHeatmapPoints, setGeoHeatmapPoints] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<any[]>([]);
  const [adBreakdowns, setAdBreakdowns] = useState<any[]>([]);
  const [selectedAdReport, setSelectedAdReport] = useState<any | null>(null);
  const [adReportLogs, setAdReportLogs] = useState<any[]>([]);
  const [adReportLoading, setAdReportLoading] = useState(false);

  // Multi-Filter States for Analytics (defaults to Today / 24h)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("24h");
  const [analyticsStartDate, setAnalyticsStartDate] = useState("");
  const [analyticsEndDate, setAnalyticsEndDate] = useState("");
  const [analyticsCategory, setAnalyticsCategory] = useState("all");
  const [analyticsAd, setAnalyticsAd] = useState("all");
  const [analyticsReferrer, setAnalyticsReferrer] = useState("all");
  const [availableReferrers, setAvailableReferrers] = useState<string[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchFilteredAnalytics = async (
    timeframe = analyticsTimeframe,
    startDate = analyticsStartDate,
    endDate = analyticsEndDate,
    category = analyticsCategory,
    ad = analyticsAd,
    referrer = analyticsReferrer
  ) => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeframe && timeframe !== "all") params.append("timeframe", timeframe);
      if (timeframe === "custom") {
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
      }
      if (category && category !== "all") params.append("category_id", category);
      if (ad && ad !== "all") params.append("ad_id", ad);
      if (referrer && referrer !== "all") params.append("referrer", referrer);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      const data = await res.json();
      if (data.summary) setAnalyticsSummary(data.summary);
      if (data.hourlyStats) setHourlyStats(data.hourlyStats);
      if (data.peakHour !== undefined) setPeakHour(data.peakHour);
      if (data.geoHeatmapPoints) setGeoHeatmapPoints(data.geoHeatmapPoints);
      if (data.topLocations) setTopLocations(data.topLocations);
      if (data.topReferrers) setTopReferrers(data.topReferrers);
      if (data.recentLogs) setRecentAuditLogs(data.recentLogs);
      if (data.adBreakdowns) setAdBreakdowns(data.adBreakdowns);
      if (data.availableReferrers) setAvailableReferrers(data.availableReferrers);
    } catch (err) {
      console.error("Filtered analytics error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const resetAnalyticsFilters = () => {
    setAnalyticsTimeframe("24h");
    setAnalyticsStartDate("");
    setAnalyticsEndDate("");
    setAnalyticsCategory("all");
    setAnalyticsAd("all");
    setAnalyticsReferrer("all");
    fetchFilteredAnalytics("24h", "", "", "all", "all", "all");
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const adsRes = await fetch("/api/admin/ads");
      const adsData = await adsRes.json();
      if (adsData.ads) {
        setAds(adsData.ads);
      }

      const catsRes = await fetch("/api/admin/categories");
      const catsData = await catsRes.json();
      if (catsData.categories) {
        setCategories(catsData.categories);
      }

      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.settings?.logo) {
        setSiteLogo(settingsData.settings.logo);
      }

      await fetchFilteredAnalytics(
        analyticsTimeframe,
        analyticsStartDate,
        analyticsEndDate,
        analyticsCategory,
        analyticsAd,
        analyticsReferrer
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdReportModal = async (ad: any) => {
    setSelectedAdReport(ad);
    setAdReportLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?ad_id=${ad.id || ad.ad_id}`);
      const data = await res.json();
      setAdReportLogs(data.recentLogs || []);
    } catch (err) {
      console.error("Failed to load ad report:", err);
    } finally {
      setAdReportLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: data });
      const uploadResult = await uploadRes.json();

      if (uploadResult.success) {
        const logoUrl = uploadResult.url;
        const setRes = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "logo", value: logoUrl }),
        });
        const setResult = await setRes.json();
        if (setResult.success) {
          setSiteLogo(logoUrl);
          setMessage({ type: "success", text: "Brand logo updated successfully!" });
        } else {
          setMessage({ type: "error", text: "Failed to save logo setting" });
        }
      } else {
        setMessage({ type: "error", text: uploadResult.error || "Logo upload failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Logo upload error" });
    } finally {
      setLogoUploading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Handle File Selection & Option Parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      // Videos bypass crop flow
      setUploading(true);
      const data = new FormData();
      data.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.success) {
          setFormData((prev) => {
            const currentUrls = prev.mediaUrl ? prev.mediaUrl.split(",") : [];
            currentUrls.push(result.url);
            return {
              ...prev,
              mediaUrl: currentUrls.join(","),
              mediaType: "video",
              adFormat: "responsive",
            };
          });
          setMessage({ type: "success", text: "Video uploaded and compressed successfully!" });
        } else {
          setMessage({ type: "error", text: result.error || "Upload failed" });
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Upload exception" });
      } finally {
        setUploading(false);
      }
    } else {
      // Images load in the interactive cropper
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const resultSrc = reader.result as string;
        setCropperImage(resultSrc);
        
        // Calculate original aspect ratio for "Free Crop / Original Ratio"
        const img = new Image();
        img.src = resultSrc;
        img.onload = () => {
          const aspect = img.width / img.height;
          setOriginalAspect(aspect);
        };

        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropAndUpload = async () => {
    if (!cropperImage || !croppedAreaPixels || !selectedFile) return;

    setUploading(true);
    setCropModalOpen(false);

    try {
      const croppedBlob = await getCroppedImg(cropperImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: selectedFile.type,
      });

      const data = new FormData();
      data.append("file", croppedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => {
          const currentUrls = prev.mediaUrl ? prev.mediaUrl.split(",") : [];
          currentUrls.push(result.url);
          return {
            ...prev,
            mediaUrl: currentUrls.join(","),
            mediaType: "image",
            adFormat: cropResName,
          };
        });
        setMessage({ type: "success", text: "Image cropped and uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Upload failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Crop & upload error" });
    } finally {
      setUploading(false);
      setCropperImage(null);
      setSelectedFile(null);
    }
  };

  const handleUploadOriginal = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setCropModalOpen(false);

    try {
      const data = new FormData();
      data.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => {
          const currentUrls = prev.mediaUrl ? prev.mediaUrl.split(",") : [];
          currentUrls.push(result.url);
          return {
            ...prev,
            mediaUrl: currentUrls.join(","),
            mediaType: "image",
            adFormat: "responsive",
          };
        });
        setMessage({ type: "success", text: "Original image uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Upload failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload error" });
    } finally {
      setUploading(false);
      setCropperImage(null);
      setSelectedFile(null);
    }
  };

  // Save Ad (Create or Update)
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl) {
      setMessage({ type: "error", text: "Please upload media file first!" });
      return;
    }

    try {
      const isEditing = Boolean(editingAd);
      const res = await fetch("/api/admin/ads", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: editingAd ? editingAd.id : undefined,
          categoryId: parseInt(formData.categoryId, 10),
          radiusKm: parseInt(formData.radiusKm.toString(), 10),
          weightPriority: parseInt(formData.weightPriority.toString(), 10),
          expiresAt: formData.expiresAt || null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: isEditing ? "Ad campaign updated successfully!" : "Ad created successfully!" });
        setEditingAd(null);
        setFormData({
          title: "",
          categoryId: "1",
          adFormat: "responsive",
          targetUrl: "",
          mediaUrl: "",
          mediaType: "image",
          latitude: null,
          longitude: null,
          radiusKm: 10,
          weightPriority: 5,
          description: "",
          expiresAt: "",
          storeName: "",
          storeLogo: "",
          storePhone: "",
          storeAddress: "",
          originalPrice: "",
          promoPrice: "",
          discountValue: "",
          terms: "",
          isOnloadPopup: false,
          isRecommended: false,
        });
        fetchDashboardData();
        setShowCreateForm(false);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save ad campaign" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Submit exception" });
    }
  };

  const openEditAdForm = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      categoryId: (ad.category_id || ad.categoryId || "1").toString(),
      adFormat: ad.ad_format || ad.adFormat || "responsive",
      targetUrl: ad.target_url || ad.targetUrl || "",
      mediaUrl: ad.media_url || ad.mediaUrl || "",
      mediaType: ad.media_type || ad.mediaType || "image",
      latitude: ad.latitude !== null && ad.latitude !== undefined ? parseFloat(ad.latitude) : null,
      longitude: ad.longitude !== null && ad.longitude !== undefined ? parseFloat(ad.longitude) : null,
      radiusKm: parseInt((ad.radius_km || ad.radiusKm || 10).toString(), 10),
      weightPriority: parseInt((ad.weight_priority || ad.weightPriority || 5).toString(), 10),
      description: ad.description || "",
      expiresAt: ad.expires_at ? new Date(ad.expires_at).toISOString().split("T")[0] : "",
      storeName: ad.store_name || ad.storeName || "",
      storeLogo: ad.store_logo || ad.storeLogo || "",
      storePhone: ad.store_phone || ad.storePhone || "",
      storeAddress: ad.store_address || ad.storeAddress || "",
      originalPrice: ad.original_price || ad.originalPrice || "",
      promoPrice: ad.promo_price || ad.promoPrice || "",
      discountValue: ad.discount_value || ad.discountValue || "",
      terms: ad.terms || ad.terms || "",
      isOnloadPopup: ad.is_onload_popup || ad.isOnloadPopup || false,
      isRecommended: ad.is_recommended || ad.isRecommended || false,
    });
    setShowCreateForm(true);
  };

  // Permanent Delete Ad
  const handleDeleteAd = async (id: number, title?: string) => {
    const name = title ? `"${title}"` : "this campaign";
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: `Ad ${name} deleted successfully!` });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: result.error || "Delete failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Delete request error" });
    }
  };

  // Toggle Hide / Deactivate Ad
  const handleToggleHideAd = async (ad: any) => {
    try {
      const nextActive = !ad.is_active;
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ad.id,
          title: ad.title,
          categoryId: parseInt(ad.category_id || ad.categoryId, 10),
          mediaUrl: ad.media_url || ad.mediaUrl,
          mediaType: ad.media_type || ad.mediaType,
          adFormat: ad.ad_format || ad.adFormat,
          targetUrl: ad.target_url || ad.targetUrl,
          latitude: ad.latitude !== null && ad.latitude !== undefined ? parseFloat(ad.latitude) : null,
          longitude: ad.longitude !== null && ad.longitude !== undefined ? parseFloat(ad.longitude) : null,
          radiusKm: parseInt((ad.radius_km || ad.radiusKm || 10).toString(), 10),
          weightPriority: parseInt((ad.weight_priority || ad.weightPriority || 5).toString(), 10),
          description: ad.description || null,
          expiresAt: ad.expires_at || null,
          isActive: nextActive,
          storeName: ad.store_name || ad.storeName || null,
          storeLogo: ad.store_logo || ad.storeLogo || null,
          storePhone: ad.store_phone || ad.storePhone || null,
          storeAddress: ad.store_address || ad.storeAddress || null,
          originalPrice: ad.original_price || ad.originalPrice || null,
          promoPrice: ad.promo_price || ad.promoPrice || null,
          discountValue: ad.discount_value || ad.discountValue || null,
          terms: ad.terms || null,
          isOnloadPopup: ad.is_onload_popup || false,
          isRecommended: ad.is_recommended || false,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({
          type: "success",
          text: nextActive ? `Campaign "${ad.title}" activated!` : `Campaign "${ad.title}" hidden / deactivated!`,
        });
        fetchDashboardData();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update campaign state" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Action failed" });
    }
  };

  // Calculate Aggregates for Analytics
  const totalViews = ads.reduce((acc, curr) => acc + parseInt(curr.views || 0, 10), 0);
  const totalClicks = ads.reduce((acc, curr) => acc + parseInt(curr.clicks || 0, 10), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  // Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 border border-indigo-100 shadow-sm">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Authentication</h2>
            <p className="text-xs text-slate-500">Sign in with master credentials to access management hub</p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Master Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} /> Unlock Admin Dashboard
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            {/* Default credentials: <span className="font-mono text-slate-600 font-bold">admin</span> / <span className="font-mono text-slate-600 font-bold">offerz2026</span> */}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row relative font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background: #090d16 !important;
          background-color: #090d16 !important;
          background-image: none !important;
        }
      `}} />
      
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between bg-[#020617] text-white px-5 py-4 border-b border-[#1e293b] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img
            src={siteLogo}
            alt="Offerzonline Logo"
            className="w-8 h-8 object-contain rounded-lg bg-slate-900 p-0.5 border border-slate-800"
          />
          <span className="font-black text-sm tracking-tight text-white">Offerzonline Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition border border-slate-800"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#020617] text-slate-200 flex flex-col justify-between border-r border-[#1e293b] transform md:transform-none md:relative transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Header */}
          <div className="px-6 py-6 border-b border-[#1e293b] flex items-center gap-3">
            <img
              src={siteLogo}
              alt="Offerzonline Logo"
              className="w-9 h-9 object-contain rounded-xl bg-slate-900 p-0.5 border border-slate-850"
            />
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight">Offerzonline</h2>
              <span className="text-[10px] text-slate-400 font-bold block">Ad Server Control Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <BarChart2 size={16} />
              <span>Analytics Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("ads");
                setShowCreateForm(false);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "ads"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <Store size={16} />
              <span>Ads ({ads.filter((a) => a.is_active).length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("categories");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "categories"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <Layers size={16} />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <Upload size={16} />
              <span>Site Logo & Branding</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 font-black text-xs border border-slate-800">
              AD
            </div>
            <div>
              <span className="text-xs font-extrabold text-white block">Administrator</span>
              <span className="text-[10px] text-slate-400 font-medium block">Active Session</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 rounded-xl transition border border-slate-800 hover:border-rose-900/40"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        
        {/* Desktop Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-[#020617] border-b border-[#1e293b]">
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight capitalize">
              {activeTab === "overview" 
                ? "Analytics Overview" 
                : activeTab === "categories" 
                ? "Categories" 
                : showCreateForm 
                ? "Create Ad" 
                : "Ads"}
            </h1>
            <p className="text-[11px] text-slate-400">Manage localized targets, media conversion, and edge cached deliveries</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm transition-all duration-300 ${
              message.type === "success"
                ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-300 shadow-sm shadow-emerald-900/5"
                : "bg-rose-955/40 border-rose-900/60 text-rose-300 shadow-sm shadow-rose-900/5"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] p-8 max-w-2xl mx-auto shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-xl text-white tracking-tight">Site Logo & Preloader Branding</h3>
              <p className="text-xs text-slate-400 mt-1">Upload a custom logo to dynamically update the preloader, navbar, and PWA brand iconography across all public pages.</p>
            </div>

            <div className="p-6 bg-[#0b0f19] border border-[#1e293b] rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 p-2 shadow-lg flex items-center justify-center overflow-hidden">
                <img src={siteLogo} alt="Current Brand Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-white block">Active Brand Logo</span>
                <span className="text-[11px] font-mono text-indigo-400 block truncate max-w-xs">{siteLogo}</span>
              </div>

              <div className="pt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload-input"
                />
                <label
                  htmlFor="logo-upload-input"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Upload size={14} />
                  <span>{logoUploading ? "Uploading & Saving Logo..." : "Upload New Brand Logo"}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Interactive Multi-Filter Control Toolbar */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-5 sm:p-6 rounded-[2.5rem] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                      Filter-Wise Statistics
                      {analyticsLoading && <RefreshCw size={13} className="animate-spin text-indigo-400" />}
                    </h3>
                    <p className="text-[11px] text-slate-400">Filter metrics, charts, performance reports & audit logs across multiple dimensions</p>
                  </div>
                </div>

                {/* Reset / Quick status */}
                {(analyticsTimeframe !== "24h" || analyticsStartDate || analyticsEndDate || analyticsCategory !== "all" || analyticsAd !== "all" || analyticsReferrer !== "all") && (
                  <button
                    onClick={resetAnalyticsFilters}
                    className="self-start md:self-auto text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <RotateCcw size={12} /> Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {/* 1. Timeframe Filter with Custom Date Range */}
                <div className="bg-[#0b0f19]/60 border border-[#1e293b] p-3 rounded-2xl space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar size={11} className="text-indigo-400" /> Timeframe
                  </label>
                  <select
                    value={analyticsTimeframe}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnalyticsTimeframe(val);
                      fetchFilteredAnalytics(val, analyticsStartDate, analyticsEndDate, analyticsCategory, analyticsAd, analyticsReferrer);
                    }}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="24h">Today (Last 24 Hours)</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                    <option value="custom">📅 Custom Date Range</option>
                  </select>

                  {/* Custom Date Range Inputs */}
                  {analyticsTimeframe === "custom" && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e293b] animate-in fade-in zoom-in-95">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From</label>
                        <input
                          type="date"
                          value={analyticsStartDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAnalyticsStartDate(val);
                            fetchFilteredAnalytics("custom", val, analyticsEndDate, analyticsCategory, analyticsAd, analyticsReferrer);
                          }}
                          className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To</label>
                        <input
                          type="date"
                          value={analyticsEndDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAnalyticsEndDate(val);
                            fetchFilteredAnalytics("custom", analyticsStartDate, val, analyticsCategory, analyticsAd, analyticsReferrer);
                          }}
                          className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Category Filter */}
                <div className="bg-[#0b0f19]/60 border border-[#1e293b] p-3 rounded-2xl space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Layers size={11} className="text-indigo-400" /> Category
                  </label>
                  <select
                    value={analyticsCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnalyticsCategory(val);
                      fetchFilteredAnalytics(analyticsTimeframe, analyticsStartDate, analyticsEndDate, val, analyticsAd, analyticsReferrer);
                    }}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Searchable Campaign Select */}
                <div className="bg-[#0b0f19]/60 border border-[#1e293b] p-3 rounded-2xl">
                  <SearchableSelect
                    label="Campaign"
                    icon={<Store size={11} className="text-indigo-400" />}
                    value={analyticsAd}
                    allLabel="All Campaigns"
                    placeholder="Type to search campaign..."
                    options={ads.map((ad) => ({
                      value: ad.id.toString(),
                      label: ad.title,
                      subLabel: ad.category_name || "Uncategorized",
                    }))}
                    onChange={(val) => {
                      setAnalyticsAd(val);
                      fetchFilteredAnalytics(analyticsTimeframe, analyticsStartDate, analyticsEndDate, analyticsCategory, val, analyticsReferrer);
                    }}
                  />
                </div>

                {/* 4. Searchable Traffic Source / Referrer Select */}
                <div className="bg-[#0b0f19]/60 border border-[#1e293b] p-3 rounded-2xl">
                  <SearchableSelect
                    label="Traffic Source"
                    icon={<Globe size={11} className="text-indigo-400" />}
                    value={analyticsReferrer}
                    allLabel="All Traffic Sources"
                    placeholder="Type to search source..."
                    options={[
                      { value: "Direct", label: "Direct / Bookmark" },
                      ...availableReferrers
                        .filter((r) => r !== "Direct" && r !== "Direct / Bookmark")
                        .map((ref) => ({ value: ref, label: ref })),
                    ]}
                    onChange={(val) => {
                      setAnalyticsReferrer(val);
                      fetchFilteredAnalytics(analyticsTimeframe, analyticsStartDate, analyticsEndDate, analyticsCategory, analyticsAd, val);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Public Page Hits</span>
                  <BarChart2 size={18} className="text-sky-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{analyticsSummary.totalPageViews}</h3>
              </div>

              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Unique Visitors</span>
                  <ShieldCheck size={18} className="text-purple-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{analyticsSummary.totalUniqueVisitors}</h3>
              </div>

              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Ad Impressions</span>
                  <Eye size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{analyticsSummary.totalAdImpressions}</h3>
              </div>

              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>
                    Ad Clicks (CTR {analyticsSummary.totalAdImpressions > 0 ? ((analyticsSummary.totalAdClicks / analyticsSummary.totalAdImpressions) * 100).toFixed(2) : "0.00"}%)
                  </span>
                  <MousePointerClick size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{analyticsSummary.totalAdClicks}</h3>
              </div>
            </div>

            {/* Hourly Traffic Breakdown / Peak Activity Hours Chart */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                      Hourly Traffic & Peak Activity Hours
                    </h3>
                    <p className="text-xs text-slate-400">Analyze traffic volume across the 24 hours of the day (Indian Standard Time)</p>
                  </div>
                </div>

                {/* Peak Hour Indicator */}
                {peakHour && peakHour.hits > 0 ? (
                  <div className="bg-amber-950/40 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs text-amber-300">
                    <Flame size={14} className="text-amber-400 animate-pulse" />
                    <span className="font-medium">Peak Hour:</span>
                    <span className="font-black text-white bg-amber-500/20 px-2 py-0.5 rounded-lg font-mono">
                      {peakHour.label} ({peakHour.hits} hits)
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock size={13} /> 24-Hour Timeline
                  </div>
                )}
              </div>

              {/* Stacked Hourly Bar Chart */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyStats} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0b0f19", 
                        borderColor: "rgba(255,255,255,0.12)", 
                        borderRadius: "16px", 
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)", 
                        color: "#fff",
                        fontSize: "12px"
                      }} 
                      labelFormatter={(label) => `Time: ${label} (IST)`}
                    />
                    <Bar dataKey="pageViews" fill="#38bdf8" name="Page Views" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="impressions" fill="#6366f1" name="Ad Impressions" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="clicks" fill="#10b981" name="Ad Clicks" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & quick summary footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-[#1e293b]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#38bdf8]" />
                    <span className="text-slate-300 text-[11px] font-medium">Page Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#6366f1]" />
                    <span className="text-slate-300 text-[11px] font-medium">Ad Impressions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#10b981]" />
                    <span className="text-slate-300 text-[11px] font-medium">Ad Clicks</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Total Timeline Hits: <strong className="text-white">{hourlyStats.reduce((a, c) => a + (c.hits || 0), 0)}</strong>
                </span>
              </div>
            </div>

            {/* Geographic Traffic Heatmap */}
            <TrafficHeatmap points={geoHeatmapPoints} topLocations={topLocations} />

            {/* Performance Chart & Traffic Sources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="font-bold text-lg text-white mb-6 tracking-tight">Ad Performance Comparison</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adBreakdowns.length > 0 ? adBreakdowns.map(a => ({ title: a.title, views: a.impressions, clicks: a.clicks })) : ads}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="title" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.08)", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", color: "#fff" }} 
                        labelStyle={{ fontWeight: "bold", color: "#fff" }}
                      />
                      <Bar dataKey="views" fill="#4f46e5" name="Impressions" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="clicks" fill="#9333ea" name="Clicks" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic Sources / Referrers */}
              <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white tracking-tight">Traffic Sources</h3>
                      <p className="text-xs text-slate-400">Referrer domains & sources</p>
                    </div>
                    <Globe size={20} className="text-indigo-400" />
                  </div>

                  <div className="space-y-3 mt-4">
                    {topReferrers.length > 0 ? (
                      topReferrers.slice(0, 5).map((item, idx) => {
                        const totalHits = topReferrers.reduce((acc, curr) => acc + (curr.count || 0), 0);
                        const pct = totalHits > 0 ? Math.round((item.count / totalHits) * 100) : 0;
                        return (
                          <div key={idx} className="bg-[#0b0f19] border border-[#1e293b] p-3 rounded-2xl flex items-center justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="text-xs font-bold text-white block truncate" title={item.referrer}>
                                {item.referrer}
                              </span>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" 
                                  style={{ width: `${pct}%` }} 
                                />
                              </div>
                            </div>
                            <div className="text-right pl-2">
                              <span className="text-xs font-extrabold text-indigo-400 block">{item.count}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{pct}%</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                        No referrer logs recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

                {/* Campaign / Ad-Level Performance Report Table */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white tracking-tight">Ad-Level Performance Report</h3>
                  <p className="text-xs text-slate-400">Detailed metric breakdown per individual offer campaign</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0b0f19]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131b2e] text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3.5">Campaign Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Impressions</th>
                      <th className="p-3.5 text-center">Clicks</th>
                      <th className="p-3.5 text-center">Unique Users</th>
                      <th className="p-3.5 text-center">CTR %</th>
                      <th className="p-3.5 text-center">Top Referrer</th>
                      <th className="p-3.5 text-right">Detailed Log Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300 font-medium">
                    {(() => {
                      const reportsPerPage = 5;
                      const indexOfLastReport = reportsPage * reportsPerPage;
                      const indexOfFirstReport = indexOfLastReport - reportsPerPage;
                      const currentReports = adBreakdowns.slice(indexOfFirstReport, indexOfLastReport);

                      if (currentReports.length > 0) {
                        return (
                          <>
                            {currentReports.map((report) => (
                              <tr key={report.ad_id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-3.5">
                                  <span className="font-extrabold text-white block">{report.title}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">ID: #{report.ad_id}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {report.category_name || "General"}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center font-bold text-indigo-300">{report.impressions}</td>
                                <td className="p-3.5 text-center font-bold text-purple-300">{report.clicks}</td>
                                <td className="p-3.5 text-center font-bold text-emerald-300">{report.unique_users}</td>
                                <td className="p-3.5 text-center font-black text-amber-400">{report.ctr}%</td>
                                <td className="p-3.5 text-center font-mono text-[11px]">
                                  <span className="bg-purple-950/40 border border-purple-800/40 text-purple-300 px-2.5 py-1 rounded-full max-w-[130px] truncate inline-block" title={report.top_referrer || "Direct"}>
                                    {report.top_referrer || "Direct"}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => openAdReportModal(report)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                                  >
                                    View Full Log
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </>
                        );
                      } else {
                        return (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                              No ad campaign breakdown data available yet.
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Performance Report Pagination Controls */}
              {(() => {
                const reportsPerPage = 5;
                const totalReportsPages = Math.ceil(adBreakdowns.length / reportsPerPage);
                const indexOfLastReport = reportsPage * reportsPerPage;
                const indexOfFirstReport = indexOfLastReport - reportsPerPage;

                if (totalReportsPages > 1) {
                  return (
                    <div className="p-4 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/20 rounded-2xl">
                      <span className="text-xs text-slate-400 font-medium">
                        Showing <span className="text-white font-bold">{indexOfFirstReport + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastReport, adBreakdowns.length)}</span> of <span className="text-white font-bold">{adBreakdowns.length}</span> Campaigns
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={reportsPage === 1}
                          onClick={() => setReportsPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Prev
                        </button>
                        {Array.from({ length: totalReportsPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setReportsPage(pageNum)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                              reportsPage === pageNum
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                                : "bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          disabled={reportsPage === totalReportsPages}
                          onClick={() => setReportsPage((prev) => Math.min(prev + 1, totalReportsPages))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Detailed Visitors Audit Log */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white tracking-tight">Real-Time Traffic Audit Log</h3>
                  <p className="text-xs text-slate-400">Detailed records of IP addresses, user agents, detected locations, and events</p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0b0f19]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131b2e] text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3.5">Event</th>
                      <th className="p-3.5">Referrer</th>
                      <th className="p-3.5">User IP / Visitor</th>
                      <th className="p-3.5">User Location</th>
                      <th className="p-3.5">Device & Browser</th>
                      <th className="p-3.5">Timestamp (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300 font-medium">
                    {(() => {
                      const logsPerPage = 10;
                      const indexOfLastLog = logsPage * logsPerPage;
                      const indexOfFirstLog = indexOfLastLog - logsPerPage;
                      const currentLogs = recentAuditLogs.slice(indexOfFirstLog, indexOfLastLog);

                      if (currentLogs.length > 0) {
                        return (
                          <>
                            {currentLogs.map((log) => {
                              const uaInfo = parseUserAgentDetails(log.user_agent);
                              const isIpv6 = log.user_ip && log.user_ip.includes(":");
                              return (
                                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                                        log.event_type === "click"
                                          ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                                          : log.event_type === "page_view"
                                          ? "bg-sky-950 border border-sky-800 text-sky-300"
                                          : "bg-indigo-950 border border-indigo-800 text-indigo-300"
                                      }`}
                                    >
                                      {log.event_type}
                                    </span>
                                    {log.ad_title && <span className="block text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">{log.ad_title}</span>}
                                  </td>
                                  <td className="p-3.5 font-mono text-[11px]">
                                    <span 
                                      className={`px-2 py-0.5 rounded max-w-[140px] truncate block ${
                                        log.referrer_domain && log.referrer_domain.toLowerCase().includes("qr")
                                          ? "text-amber-300 bg-amber-950/40 border border-amber-800/40 font-bold"
                                          : "text-purple-300 bg-purple-950/40 border border-purple-800/40"
                                      }`} 
                                      title={log.referrer_domain || "Direct"}
                                    >
                                      {log.referrer_domain || "Direct"}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-mono text-indigo-300 font-bold text-xs max-w-[160px] truncate" title={log.user_ip}>
                                        {log.user_ip}
                                      </span>
                                      {isIpv6 && (
                                        <span className="text-[9px] bg-indigo-950 border border-indigo-700 text-indigo-300 px-1 py-0.2 rounded font-mono font-extrabold">
                                          IPv6
                                        </span>
                                      )}
                                    </div>
                                    {log.visitor_id && (
                                      <span className="text-[9px] text-slate-500 font-mono tracking-wider block truncate max-w-[140px]" title={`Visitor ID: ${log.visitor_id}`}>
                                        ID: {log.visitor_id.substring(0, 12)}…
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5">
                                    {(() => {
                                      const cleanLoc = formatLocationName(log.user_location_name);
                                      return (
                                        <div className="flex items-center gap-1 text-xs text-slate-200 font-medium max-w-[180px]">
                                          <MapPin size={12} className="text-rose-400 shrink-0" />
                                          <span className="truncate" title={cleanLoc}>
                                            {cleanLoc}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-3.5">
                                    <div className="space-y-0.5">
                                      <span className="bg-slate-900 border border-[#1e293b] text-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold inline-block" title={log.user_agent}>
                                        {uaInfo.device} • {uaInfo.browser}
                                      </span>
                                      <span className="text-[10px] text-slate-500 block">
                                        {uaInfo.os}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                                    {formatIST(log.timestamp)}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      } else {
                        return (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                              No traffic logs recorded yet. Visit the public page to see real-time hits!
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Traffic Audit Log Pagination Controls */}
              {(() => {
                const logsPerPage = 10;
                const totalLogsPages = Math.ceil(recentAuditLogs.length / logsPerPage);
                const indexOfLastLog = logsPage * logsPerPage;
                const indexOfFirstLog = indexOfLastLog - logsPerPage;

                if (totalLogsPages > 1) {
                  return (
                    <div className="p-4 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/20 rounded-2xl">
                      <span className="text-xs text-slate-400 font-medium">
                        Showing <span className="text-white font-bold">{indexOfFirstLog + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastLog, recentAuditLogs.length)}</span> of <span className="text-white font-bold">{recentAuditLogs.length}</span> Records
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={logsPage === 1}
                          onClick={() => setLogsPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Prev
                        </button>
                        {Array.from({ length: totalLogsPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setLogsPage(pageNum)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                              logsPage === pageNum
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                                : "bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          disabled={logsPage === totalLogsPages}
                          onClick={() => setLogsPage((prev) => Math.min(prev + 1, totalLogsPages))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {activeTab === "ads" && (() => {
          const adsPerPage = 5;
          const filteredAdsList = showOnlyActiveAds ? ads.filter(ad => ad.is_active) : ads;
          const indexOfLastAd = adsPage * adsPerPage;
          const indexOfFirstAd = indexOfLastAd - adsPerPage;
          const currentAds = filteredAdsList.slice(indexOfFirstAd, indexOfLastAd);
          const totalPages = Math.ceil(filteredAdsList.length / adsPerPage);

          return showCreateForm ? (
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] p-8 max-w-5xl mx-auto shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-white tracking-tight">
                  {editingAd ? "Edit Ad Campaign" : "Create Ad"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAd(null);
                  }}
                  className="text-slate-350 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900 border border-[#1e293b] text-xs font-bold transition"
                >
                  ← Back to Ads
                </button>
              </div>

              <form onSubmit={handleSaveAd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Media First & Geolocation */}
                <div className="space-y-6">
                  {/* Media File Upload */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Upload Media (Image / GIF / Video)
                      </label>
                    </div>
                    <div className="flex flex-col gap-4 bg-[#0b0f19] p-4 border border-[#1e293b] rounded-2xl">
                      {/* Upload action row */}
                      <div className="flex flex-wrap items-center gap-4">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="media-upload"
                        />
                        <label
                          htmlFor="media-upload"
                          className="bg-slate-900 hover:bg-slate-800 border border-[#1e293b] px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition text-slate-200 shadow-sm animate-pulse-subtle"
                        >
                          <Upload size={14} /> {uploading ? "Uploading..." : "Choose File"}
                        </label>
                        
                        {/* Accepted formats pills */}
                        <div className="flex flex-wrap gap-1">
                          {["PNG", "JPG", "JPEG", "GIF", "MP4", "WEBM"].map((fmt) => (
                            <span key={fmt} className="text-[9px] font-extrabold bg-[#131b2e] border border-slate-850 text-slate-400 px-2 py-0.5 rounded-md">
                              .{fmt}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Uploaded filenames list */}
                      {formData.mediaUrl && (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {formData.mediaUrl.split(",").map((url, idx) => (
                            <span key={idx} className="text-[10px] text-indigo-400 font-mono truncate max-w-[80px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded block">
                              {url.split("/").pop()}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Live Preview Container to utilize space - Multi-Grid Slider previews */}
                      {formData.mediaUrl ? (
                        <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-slate-950/40 border border-[#1e293b] rounded-2xl min-h-[140px]">
                          {formData.mediaUrl.split(",").map((url, index) => {
                            const isVideo = url.split("?")[0].split(".").pop()?.toLowerCase() === "mp4" || formData.mediaType === "video" && !url.includes(".");
                            return (
                              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-[#1e293b] bg-slate-950 flex items-center justify-center group/preview">
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover" muted playsInline preload="none" />
                                ) : (
                                  <img src={url} alt={`Upload preview ${index + 1}`} className="w-full h-full object-cover" />
                                )}
                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = formData.mediaUrl.split(",");
                                    const filtered = list.filter((_, idx) => idx !== index);
                                    setFormData((prev) => ({
                                      ...prev,
                                      mediaUrl: filtered.join(",")
                                    }));
                                  }}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-650 hover:bg-red-700 text-white shadow-md transition cursor-pointer z-10 opacity-0 group-hover/preview:opacity-100"
                                  title="Remove file"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-48 rounded-xl border border-dashed border-[#1e293b] bg-slate-950/25 flex flex-col items-center justify-center text-slate-500 gap-2">
                          <div className="p-3 rounded-full bg-[#131b2e] border border-[#1e293b] text-slate-400">
                            <Upload size={18} />
                          </div>
                          <span className="text-xs font-semibold">No media uploaded yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Geolocation Pin Selector (Optional) */}
                  <div className="bg-[#0b0f19] p-6 border border-[#1e293b] rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                          Pin Target Geolocation (Optional)
                        </label>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formData.latitude !== null && formData.longitude !== null
                            ? "Ad target is bound to custom GPS radius."
                            : "Global Ad (No geo-restriction - shown to all visitors)."
                          }
                        </span>
                      </div>

                      {formData.latitude !== null && formData.longitude !== null ? (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, latitude: null, longitude: null })}
                          className="bg-rose-955/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-300 text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          ✕ Remove Location Pin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, latitude: 8.5680, longitude: 76.8737 })}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          + Add Location Pin
                        </button>
                      )}
                    </div>

                    {formData.latitude !== null && formData.longitude !== null ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-indigo-400 font-mono font-bold">
                            Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="rounded-[1.5rem] overflow-hidden border border-[#1e293b] shadow-inner">
                          <MapPicker
                            lat={formData.latitude}
                            lng={formData.longitude}
                            radiusKm={formData.radiusKm}
                            onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-[#1e293b] rounded-2xl bg-slate-950/40 text-center">
                        <span className="text-xs text-slate-400 font-semibold block">
                          No Geolocation Pin active. This ad will serve globally across all locations.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Metadata Details & Launch Action */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ad Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. 50% Off Gourmet Pizza Deals"
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] focus:ring-2 focus:ring-indigo-955 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all duration-300"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#0f172a]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Landing URL</label>
                      <input
                        type="url"
                        required
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] focus:ring-2 focus:ring-indigo-950 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Campaign Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Exclusive weekend deal for pizza lovers..."
                        rows={3}
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] focus:ring-2 focus:ring-indigo-950 transition-all duration-300 resize-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        style={{ colorScheme: "dark" }}
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] focus:ring-2 focus:ring-indigo-950 transition-all duration-300 font-medium"
                      />
                    </div>

                    {/* Merchant & Store Profile */}
                    <div className="bg-[#0b0f19] p-5 border border-[#1e293b] rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Merchant Profile</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Store Name</label>
                          <input
                            type="text"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            placeholder="e.g. Luigi's Pizza"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Store Logo URL</label>
                          <input
                            type="url"
                            value={formData.storeLogo}
                            onChange={(e) => setFormData({ ...formData, storeLogo: e.target.value })}
                            placeholder="e.g. https://.../logo.png"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Store Phone</label>
                          <input
                            type="text"
                            value={formData.storePhone}
                            onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                            placeholder="e.g. +1 (555) 000-0000"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Store Address</label>
                          <input
                            type="text"
                            value={formData.storeAddress}
                            onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                            placeholder="e.g. 123 Main St"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Discounts */}
                    <div className="bg-[#0b0f19] p-5 border border-[#1e293b] rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Pricing & Discounts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Original Price</label>
                          <input
                            type="text"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            placeholder="e.g. $49.99"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Promo Price</label>
                          <input
                            type="text"
                            value={formData.promoPrice}
                            onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                            placeholder="e.g. $19.99"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Discount Value</label>
                          <input
                            type="text"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                            placeholder="e.g. 60% OFF"
                            className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pinning & Display Toggles */}
                    <div className="bg-[#0b0f19] p-5 border border-[#1e293b] rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Pinning & Priority Options</h4>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Ad Serving Priority (Weight)
                        </label>
                        <select
                          value={formData.weightPriority}
                          onChange={(e) => setFormData({ ...formData, weightPriority: parseInt(e.target.value, 10) })}
                          className="w-full bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                        >
                          <option value={10}>P10 (Highest Priority - Super Sponsor)</option>
                          <option value={9}>P9 (Very High Priority)</option>
                          <option value={8}>P8 (High Priority)</option>
                          <option value={7}>P7 (Above Average)</option>
                          <option value={6}>P6 (Standard High)</option>
                          <option value={5}>P5 (Medium Standard Priority)</option>
                          <option value={4}>P4 (Below Average)</option>
                          <option value={3}>P3 (Low Priority)</option>
                          <option value={2}>P2 (Very Low Priority)</option>
                          <option value={1}>P1 (Lowest Priority)</option>
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-[#1e293b]/60">
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-350 text-xs font-bold select-none">
                          <input
                            type="checkbox"
                            checked={formData.isOnloadPopup}
                            onChange={(e) => setFormData({ ...formData, isOnloadPopup: e.target.checked })}
                            className="w-4 h-4 rounded bg-[#131b2e] border-[#1e293b] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Pin as Load-Time Popup</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-350 text-xs font-bold select-none">
                          <input
                            type="checkbox"
                            checked={formData.isRecommended}
                            onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                            className="w-4 h-4 rounded bg-[#131b2e] border-[#1e293b] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>Pin as Recommended Offer</span>
                        </label>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Terms & Conditions</label>
                      <textarea
                        value={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                        placeholder="e.g. Valid for dine-in only. One coupon per table..."
                        rows={2}
                        className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:bg-[#070a10] focus:ring-2 focus:ring-indigo-950 transition-all duration-300 resize-none font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 mt-6 md:mt-0"
                  >
                    <CheckCircle size={18} /> {editingAd ? "Update Ad Campaign" : "Launch Geo-Targeted Ad"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="font-bold text-lg text-white tracking-tight">All Ads</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showOnlyActiveAds}
                      onChange={(e) => {
                        setShowOnlyActiveAds(e.target.checked);
                        setAdsPage(1);
                      }}
                      className="rounded bg-[#0b0f19] border-[#1e293b] text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    Hide Deactivated Ads
                  </label>
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setAdsPage(1);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus size={14} /> Create Ad
                  </button>
                  <button onClick={fetchDashboardData} className="text-slate-355 hover:text-white p-2.5 rounded-xl bg-slate-900 border border-[#1e293b] transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-350">
                  <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-[#1e293b]">
                    <tr>
                      <th className="px-6 py-4">Media</th>
                      <th className="px-6 py-4">Ad Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Radius (km)</th>
                      <th className="px-6 py-4">Impressions</th>
                      <th className="px-6 py-4">Clicks</th>
                      <th className="px-6 py-4">CTR</th>
                      <th className="px-6 py-4">Top Referrer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 sticky right-0 bg-[#0f172a] shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.7)] z-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {currentAds.map((ad) => (
                      <tr key={ad.id} className="group hover:bg-slate-900/30 transition">
                        <td className="px-6 py-4">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setPreviewMedia({ url: ad.media_url, type: ad.media_type });
                            }}
                            className="block w-28 h-20 rounded-lg overflow-hidden border border-[#1e293b] bg-[#0b0f19] flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer" 
                            title="Preview Media"
                          >
                            {ad.media_type === "video" ? (
                              <video src={ad.media_url} className="w-full h-full object-cover" muted playsInline preload="none" />
                            ) : (
                              <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{ad.title}</div>
                          {ad.uuid && (
                            <div className="text-[10px] text-indigo-400/80 font-mono tracking-wider mt-0.5" title="Ad UUID">
                              UUID: {ad.uuid}
                            </div>
                          )}
                          {ad.description && (
                            <div className="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title={ad.description}>
                              {ad.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-900 border border-[#1e293b] px-2.5 py-1 rounded-full text-xs font-medium text-slate-300">
                            {ad.category_name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{ad.ad_format}</td>
                        <td className="px-6 py-4">
                          <select
                            value={ad.weight_priority || 1}
                            onChange={async (e) => {
                              const newPriority = parseInt(e.target.value, 10);
                              try {
                                const res = await fetch("/api/admin/ads", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    id: ad.id,
                                    title: ad.title,
                                    categoryId: parseInt(ad.category_id || ad.categoryId, 10),
                                    mediaUrl: ad.media_url || ad.mediaUrl,
                                    mediaType: ad.media_type || ad.mediaType,
                                    adFormat: ad.ad_format || ad.adFormat,
                                    targetUrl: ad.target_url || ad.targetUrl,
                                    latitude: ad.latitude !== null && ad.latitude !== undefined ? parseFloat(ad.latitude) : null,
                                    longitude: ad.longitude !== null && ad.longitude !== undefined ? parseFloat(ad.longitude) : null,
                                    radiusKm: parseInt((ad.radius_km || ad.radiusKm || 10).toString(), 10),
                                    weightPriority: newPriority,
                                    description: ad.description || null,
                                    expiresAt: ad.expires_at || null,
                                    isActive: ad.is_active !== undefined ? ad.is_active : true,
                                    storeName: ad.store_name || ad.storeName || null,
                                    storeLogo: ad.store_logo || ad.storeLogo || null,
                                    storePhone: ad.store_phone || ad.storePhone || null,
                                    storeAddress: ad.store_address || ad.storeAddress || null,
                                    originalPrice: ad.original_price || ad.originalPrice || null,
                                    promoPrice: ad.promo_price || ad.promoPrice || null,
                                    discountValue: ad.discount_value || ad.discountValue || null,
                                    terms: ad.terms || null,
                                    isOnloadPopup: ad.is_onload_popup || false,
                                    isRecommended: ad.is_recommended || false,
                                  }),
                                });
                                const result = await res.json();
                                if (result.success) {
                                  setMessage({ type: "success", text: `Priority updated to ${newPriority} for "${ad.title}"` });
                                  fetchDashboardData();
                                } else {
                                  setMessage({ type: "error", text: result.error || "Failed to update priority" });
                                }
                              } catch (err: any) {
                                setMessage({ type: "error", text: err.message || "Update error" });
                              }
                            }}
                            className="bg-[#0b0f19] border border-[#1e293b] text-indigo-400 font-extrabold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            title="Set Ad Serving Weight Priority"
                          >
                            <option value={10}>P10 (Highest)</option>
                            <option value={9}>P9</option>
                            <option value={8}>P8</option>
                            <option value={7}>P7</option>
                            <option value={6}>P6</option>
                            <option value={5}>P5 (Medium)</option>
                            <option value={4}>P4</option>
                            <option value={3}>P3</option>
                            <option value={2}>P2</option>
                            <option value={1}>P1 (Lowest)</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-200 font-semibold">
                          {ad.latitude !== null && ad.longitude !== null && ad.latitude !== undefined && ad.longitude !== undefined ? (
                            `${ad.radius_km} km`
                          ) : (
                            <span className="bg-sky-950/60 border border-sky-800/60 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Global (No Pin)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{ad.views}</td>
                        <td className="px-6 py-4 text-slate-300">{ad.clicks}</td>
                        <td className="px-6 py-4 font-bold text-indigo-400">{ad.ctr}%</td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-950/50 border border-purple-800/60 text-purple-300 text-xs px-2.5 py-1 rounded-full font-mono font-medium max-w-[130px] truncate block" title={ad.top_referrer || "Direct"}>
                            {ad.top_referrer || "Direct"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            {ad.is_active ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="bg-rose-500/10 text-rose-455 border border-rose-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                                Deactivated
                              </span>
                            )}
                            {ad.expires_at && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Exp: {formatDateIST(ad.expires_at)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-[#0f172a] group-hover:bg-[#162038] transition-colors shadow-[-12px_0_15px_-4px_rgba(0,0,0,0.7)] z-10">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAdForm(ad)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl transition text-xs font-bold shadow-sm active:scale-95"
                              title="Edit Ad Campaign Details"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openAdReportModal(ad)}
                              className="bg-purple-950/90 hover:bg-purple-900 text-purple-300 px-2.5 py-1.5 rounded-xl transition border border-purple-800/80 flex items-center gap-1 text-xs font-bold cursor-pointer shadow-sm active:scale-95"
                              title="View Ad Performance Report"
                            >
                              <BarChart2 size={13} /> Report
                            </button>
                            <button
                              onClick={() => setEmbedAd(ad)}
                              className="bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 px-2 py-1.5 rounded-xl transition border border-[#1e293b] cursor-pointer shadow-sm active:scale-95"
                              title="Get embed tag script code"
                            >
                              <Code size={13} />
                            </button>

                            {/* Grouped Hide/Show and Delete Controls */}
                            <div className="flex items-center bg-[#0b0f19] border border-[#1e293b] rounded-xl p-0.5 divide-x divide-[#1e293b] shadow-sm">
                              {ad.is_active ? (
                                <button
                                  onClick={() => handleToggleHideAd(ad)}
                                  className="px-2.5 py-1 rounded-l-lg hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                  title="Hide / Deactivate Campaign"
                                >
                                  <EyeOff size={13} /> Hide
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleHideAd(ad)}
                                  className="px-2.5 py-1 rounded-l-lg hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                  title="Show / Reactivate Campaign"
                                >
                                  <Eye size={13} /> Show
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAd(ad.id, ad.title)}
                                className="px-2.5 py-1 rounded-r-lg hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                title="Delete Ad Campaign Permanently"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const adsPerPage = 5;
                const totalPages = Math.ceil(filteredAdsList.length / adsPerPage);
                const indexOfLastAd = adsPage * adsPerPage;
                const indexOfFirstAd = indexOfLastAd - adsPerPage;
                
                return totalPages > 1 && (
                  <div className="p-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/20 rounded-2xl">
                    <span className="text-xs text-slate-400 font-medium">
                      Showing <span className="text-white font-bold">{indexOfFirstAd + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastAd, ads.length)}</span> of <span className="text-white font-bold">{ads.length}</span> Ads
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={adsPage === 1}
                        onClick={() => setAdsPage((prev) => Math.max(prev - 1, 1))}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Prev
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setAdsPage(pageNum)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                            adsPage === pageNum
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                              : "bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        disabled={adsPage === totalPages}
                        onClick={() => setAdsPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-8">
            {/* Create Category Card */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm max-w-2xl">
              <h3 className="font-bold text-lg text-white mb-4 tracking-tight">Add New Backend Category</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newCategoryName.trim()) {
                  setMessage({ type: "error", text: "Category name is required" });
                  return;
                }

                try {
                  const res = await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      name: newCategoryName.trim(),
                      icon: newCategoryIcon || null 
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setMessage({ type: "success", text: `Category "${newCategoryName}" created successfully!` });
                    setNewCategoryName("");
                    setNewCategoryIcon("");
                    fetchDashboardData();
                  } else {
                    setMessage({ type: "error", text: data.error || "Failed to create category" });
                  }
                } catch (err: any) {
                  setMessage({ type: "error", text: err.message });
                }
              }} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Beauty & Spa"
                      className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category Image / Icon</label>
                    <div className="flex items-center gap-3 bg-[#0b0f19] p-2 border border-[#1e293b] rounded-xl">
                      <input
                        type="file"
                        accept="image/*"
                        id="cat-image-upload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setCatUploading(true);
                          const data = new FormData();
                          data.append("file", file);
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: data });
                            const result = await res.json();
                            if (result.success) {
                              setNewCategoryIcon(result.url);
                              setMessage({ type: "success", text: "Category image uploaded!" });
                            } else {
                              setMessage({ type: "error", text: result.error || "Upload failed" });
                            }
                          } catch (err: any) {
                            setMessage({ type: "error", text: err.message });
                          } finally {
                            setCatUploading(false);
                          }
                        }}
                      />
                      <label
                        htmlFor="cat-image-upload"
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-805 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-200 cursor-pointer transition shrink-0"
                      >
                        {catUploading ? "Uploading..." : "Upload Image"}
                      </label>
                      {newCategoryIcon && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#1e293b] shrink-0 bg-slate-950">
                          <img src={newCategoryIcon} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition w-full"
                >
                  <Plus size={14} /> Add Category
                </button>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-white mb-6 tracking-tight">All Active Backend Categories</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const categoriesPerPage = 6;
                  const indexOfLastCategory = categoriesPage * categoriesPerPage;
                  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
                  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

                  return currentCategories.map((cat) => (
                    <div key={cat.id} className="p-4 bg-slate-900/40 border border-[#1e293b] rounded-2xl flex items-center justify-between font-medium hover:border-slate-800 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#1e293b] bg-[#0b0f19] flex items-center justify-center shrink-0">
                          {cat.icon ? (
                            <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store size={18} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">slug: {cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          ID #{cat.id}
                        </span>
                        
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
                              try {
                                const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: "DELETE" });
                                const result = await res.json();
                                if (result.success) {
                                  setMessage({ type: "success", text: `Category "${cat.name}" deleted successfully!` });
                                  fetchDashboardData();
                                } else {
                                  setMessage({ type: "error", text: result.error || "Failed to delete category" });
                                }
                              } catch (err: any) {
                                setMessage({ type: "error", text: err.message });
                              }
                            }
                          }}
                          className="text-rose-455 hover:text-rose-355 p-2 rounded-lg hover:bg-rose-955/20 transition border border-transparent hover:border-rose-900/40"
                          title="Delete Category"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Categories Pagination Controls */}
              {(() => {
                const categoriesPerPage = 6;
                const totalCategoriesPages = Math.ceil(categories.length / categoriesPerPage);
                const indexOfLastCategory = categoriesPage * categoriesPerPage;
                const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;

                if (totalCategoriesPages > 1) {
                  return (
                    <div className="p-4 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/20 rounded-2xl mt-4">
                      <span className="text-xs text-slate-400 font-medium">
                        Showing <span className="text-white font-bold">{indexOfFirstCategory + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastCategory, categories.length)}</span> of <span className="text-white font-bold">{categories.length}</span> Categories
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={categoriesPage === 1}
                          onClick={() => setCategoriesPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Prev
                        </button>
                        {Array.from({ length: totalCategoriesPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCategoriesPage(pageNum)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                              categoriesPage === pageNum
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                                : "bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:text-white"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          disabled={categoriesPage === totalCategoriesPages}
                          onClick={() => setCategoriesPage((prev) => Math.min(prev + 1, totalCategoriesPages))}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}
        </main>

        {/* Footer */}
        <footer className="py-5 px-6 sm:px-8 border-t border-[#1e293b] bg-[#020617] text-slate-400 text-[11px] font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src={siteLogo}
              alt="Offerzonline Logo"
              className="w-6 h-6 object-contain rounded-md bg-slate-900 p-0.5 border border-slate-800"
            />
            <span className="font-bold text-white">Offerzonline Admin</span>
          </div>
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} Offerzonline. Built with Next.js & Cloudflare.
          </p>
        </footer>
      </div>

      {/* Media Preview Modal Overlay */}
      {/* Media Preview Modal Overlay */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all duration-300"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#131b2e] border border-[#1e293b] rounded-[2rem] overflow-hidden shadow-2xl p-2 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 border border-[#1e293b] text-slate-300 hover:text-white hover:bg-slate-900 transition"
              title="Close Preview"
            >
              <X size={18} />
            </button>

            {/* Content body */}
            <div className="flex items-center justify-center min-h-[300px] max-h-[80vh] overflow-hidden rounded-[1.7rem] bg-[#0b0f19]">
              {previewMedia.type === "video" ? (
                <video 
                  src={previewMedia.url} 
                  className="max-w-full max-h-[78vh] object-contain rounded-lg" 
                  controls 
                  autoPlay 
                  muted
                  playsInline
                  preload="metadata"
                  loop
                />
              ) : (
                <img 
                  src={previewMedia.url} 
                  alt="Ad Media Preview" 
                  className="max-w-full max-h-[78vh] object-contain rounded-lg" 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal Overlay */}
      {cropModalOpen && cropperImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          onClick={() => {
            setCropModalOpen(false);
            setCropperImage(null);
            setSelectedFile(null);
          }}
        >
          <div 
            className="relative max-w-2xl w-full bg-[#131b2e] border border-[#1e293b] rounded-[2rem] shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-white tracking-tight">Crop Your Ad Media</h3>
                <p className="text-[11px] text-slate-400">Select target resolution to adjust crop boundaries</p>
              </div>
              <button 
                onClick={() => {
                  setCropModalOpen(false);
                  setCropperImage(null);
                  setSelectedFile(null);
                }}
                className="p-2 rounded-full hover:bg-slate-900 border border-transparent hover:border-[#1e293b] text-slate-355 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Predefined Resolution Selector Pills */}
            <div className="flex flex-wrap gap-2 mb-4 bg-[#0b0f19] p-2.5 border border-[#1e293b] rounded-2xl">
              {RESOLUTIONS.map((res) => {
                let rectStyle = {};
                if (res.name === "300x250") {
                  rectStyle = { width: "22px", height: "18px" };
                } else if (res.name === "728x90") {
                  rectStyle = { width: "36px", height: "5px" };
                } else if (res.name === "1080x1920") {
                  rectStyle = { width: "10px", height: "22px" };
                } else {
                  rectStyle = { width: "20px", height: "16px", borderStyle: "dashed" };
                }

                return (
                  <button
                    key={res.name}
                    type="button"
                    onClick={() => {
                      setCropAspect(res.name === "responsive" ? originalAspect : res.aspect);
                      setCropResName(res.name);
                    }}
                    className={`px-4 py-3.5 rounded-2xl text-xs font-bold transition border flex items-center gap-3 ${
                      cropResName === res.name
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                        : "bg-[#131b2e] border-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div 
                      style={rectStyle}
                      className={`shrink-0 rounded bg-current opacity-40 border border-current ${
                        res.name === "responsive" ? "bg-transparent opacity-50" : ""
                      }`}
                    />
                    <span>{res.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cropper Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 h-64 sm:h-72">
              <Cropper
                image={cropperImage}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            {/* Zoom Slider */}
            <div className="my-4 flex items-center gap-3 bg-[#0b0f19] p-3 rounded-xl border border-[#1e293b]">
              <span className="text-xs text-slate-400 font-bold">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-550 h-1 bg-[#131b2e] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-[#1e293b] pt-4">
              <button
                type="button"
                onClick={() => {
                  setCropModalOpen(false);
                  setCropperImage(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#1e293b] bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
               <button
                type="button"
                onClick={handleUploadOriginal}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                Use Original (No Crop)
              </button>
              <button
                type="button"
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle size={14} /> Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Integration Modal */}
      {embedAd && (() => {
        const host = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const scriptCode = `<script src="${host}/ad.js" data-placement="${embedAd.ad_format || "responsive"}" data-ad-id="${embedAd.id}"></script>`;
        const iframeCode = `<iframe src="${host}/embed/frame?format=${embedAd.ad_format || "responsive"}&id=${embedAd.id}" width="${embedAd.ad_format === "300x250" ? "300" : embedAd.ad_format === "728x90" ? "728" : "100%"}" height="${embedAd.ad_format === "728x90" ? "90" : "250"}" frameborder="0" scrolling="no"></iframe>`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
              <button
                onClick={() => setEmbedAd(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 hover:bg-slate-900 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">Get Embed Code</h3>
                <p className="text-xs text-slate-405">
                  Embed sponsor placements for <span className="text-indigo-400 font-bold">"{embedAd.title}"</span> on other websites.
                </p>
              </div>

              {/* Code Option 1: Dynamic JS Tag */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Method A: JS Script Tag (Recommended)</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(scriptCode);
                      setCopiedType("script");
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/20 border border-indigo-900/30 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    {copiedType === "script" ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-xl text-[10px] text-slate-300 font-mono overflow-x-auto select-all whitespace-pre-wrap break-all">
                  {scriptCode}
                </pre>
              </div>

              {/* Code Option 2: Standalone Iframe */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Method B: Direct Iframe Embed</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(iframeCode);
                      setCopiedType("iframe");
                      setTimeout(() => setCopiedType(null), 2000);
                    }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-305 flex items-center gap-1 bg-indigo-950/20 border border-indigo-900/30 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    {copiedType === "iframe" ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-xl text-[10px] text-slate-300 font-mono overflow-x-auto select-all whitespace-pre-wrap break-all">
                  {iframeCode}
                </pre>
              </div>

              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl text-[10px] text-slate-400 leading-normal">
                💡 **Integrations Guide:** The script tag automatically requests browser GPS permissions from the visitor to fetch nearest local geo-targeted ad campaigns dynamically.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Ad-Level Detailed Analytics Modal */}
      {selectedAdReport && (
        <div
          onClick={() => setSelectedAdReport(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#131b2e] border border-[#1e293b] w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl relative animate-in zoom-in-95"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Ad Performance Audit Report</span>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{selectedAdReport.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAdReport(null)}
                className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Impressions</span>
                <span className="text-2xl font-black text-white">{selectedAdReport.impressions || selectedAdReport.views || 0}</span>
              </div>
              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Clicks</span>
                <span className="text-2xl font-black text-white">{selectedAdReport.clicks || 0}</span>
              </div>
              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Unique Users</span>
                <span className="text-2xl font-black text-emerald-400">{selectedAdReport.unique_users || 0}</span>
              </div>
              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">CTR %</span>
                <span className="text-2xl font-black text-amber-400">{selectedAdReport.ctr}%</span>
              </div>
              <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Top Referrer</span>
                <span className="text-xs font-black text-purple-400 truncate block mt-2 font-mono" title={selectedAdReport.top_referrer || "Direct"}>
                  {selectedAdReport.top_referrer || "Direct"}
                </span>
              </div>
            </div>

            {/* Ad Event Activity Log Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ad Interaction Log (Referrer, IP, Location, User Agent)</h4>
              <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0b0f19]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#131b2e] text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#1e293b]">
                    <tr>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Referrer / Source</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">User Agent / Device</th>
                      <th className="p-3">Timestamp (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300 font-medium">
                    {adReportLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">Loading ad activity records...</td>
                      </tr>
                    ) : adReportLogs.length > 0 ? (
                      adReportLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                log.event_type === "click"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                              }`}
                            >
                              {log.event_type}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px]">
                            <span className="text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded max-w-[140px] truncate block" title={log.referrer_domain || "Direct"}>
                              {log.referrer_domain || "Direct"}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-indigo-300">{log.user_ip}</td>
                          <td className="p-3">{log.user_location_name || "Unknown"}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-400 max-w-xs truncate" title={log.user_agent}>
                            {log.user_agent}
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-[10px] whitespace-nowrap">
                            {formatIST(log.timestamp)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">
                          No direct interaction logs recorded for this campaign yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
