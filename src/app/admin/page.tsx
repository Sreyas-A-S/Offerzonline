"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Eye, MousePointerClick, TrendingUp, Upload, 
  MapPin, CheckCircle, RefreshCw, Store, Lock, LogOut, ShieldCheck,
  Menu, X, Layers, BarChart2
} from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Cropper from "react-easy-crop";

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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "categories">("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "1",
    adFormat: "responsive",
    targetUrl: "",
    mediaUrl: "",
    mediaType: "image",
    latitude: 28.6139,
    longitude: 77.2090,
    radiusKm: 10,
    weightPriority: 5,
    description: "",
    expiresAt: "",
  });

  // Cropper states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(300/250);
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
    } catch (err) {
      setAuthError("Failed to authenticate with server. Please try again.");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the admin panel?")) {
      sessionStorage.removeItem("admin_authenticated");
      setIsAuthenticated(false);
      setIsSidebarOpen(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      setAds(data.ads || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
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
          setFormData((prev) => ({
            ...prev,
            mediaUrl: result.url,
            mediaType: "video",
            adFormat: "responsive",
          }));
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
        setCropperImage(reader.result as string);
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
        setFormData((prev) => ({
          ...prev,
          mediaUrl: result.url,
          mediaType: "image",
          adFormat: cropResName,
        }));
        setMessage({ type: "success", text: "Media cropped, compressed & uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Upload failed" });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Error cropping or uploading image" });
    } finally {
      setUploading(false);
      setCropperImage(null);
      setSelectedFile(null);
    }
  };

  // Create Ad
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl) {
      setMessage({ type: "error", text: "Please upload media file first!" });
      return;
    }

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId, 10),
          radiusKm: parseInt(formData.radiusKm.toString(), 10),
          weightPriority: parseInt(formData.weightPriority.toString(), 10),
          expiresAt: formData.expiresAt || null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Ad created successfully!" });
        setFormData({
          title: "",
          categoryId: "1",
          adFormat: "responsive",
          targetUrl: "",
          mediaUrl: "",
          mediaType: "image",
          latitude: 28.6139,
          longitude: 77.2090,
          radiusKm: 10,
          weightPriority: 5,
          description: "",
          expiresAt: "",
        });
        fetchDashboardData();
        setShowCreateForm(false);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to create ad" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Submit exception" });
    }
  };

  // Soft Delete Ad (Triggers Cloudflare purge)
  const handleDeleteAd = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate and soft-delete this campaign?")) return;

    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Ad deactivated & Cloudflare cache purged!" });
        fetchDashboardData();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Delete failed" });
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
            src="/logo.png"
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
              src="/logo.png"
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

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Total Impressions</span>
                  <Eye size={18} className="text-indigo-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{totalViews}</h3>
              </div>

              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Total Clicks</span>
                  <MousePointerClick size={18} className="text-purple-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{totalClicks}</h3>
              </div>

              <div className="bg-[#131b2e] border border-[#1e293b] p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Average CTR</span>
                  <TrendingUp size={18} className="text-pink-400" />
                </div>
                <h3 className="text-4xl font-extrabold text-white">{avgCtr}%</h3>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="font-bold text-lg text-white mb-6 tracking-tight">Ad Performance Comparison</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ads}>
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
          </div>
        )}

        {activeTab === "ads" && (() => {
          const adsPerPage = 5;
          const indexOfLastAd = currentPage * adsPerPage;
          const indexOfFirstAd = indexOfLastAd - adsPerPage;
          const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
          const totalPages = Math.ceil(ads.length / adsPerPage);

          return showCreateForm ? (
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] p-8 max-w-5xl mx-auto shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-white tracking-tight">Create Ad</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-350 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900 border border-[#1e293b] text-xs font-bold transition"
                >
                  ← Back to Ads
                </button>
              </div>

              <form onSubmit={handleCreateAd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                        {formData.mediaUrl && (
                          <span className="text-xs text-indigo-400 font-mono truncate max-w-xs block">
                            Uploaded: {formData.mediaUrl.split("/").pop()}
                          </span>
                        )}
                      </div>
                      
                      {/* Live Preview Container to utilize space */}
                      {formData.mediaUrl ? (
                        <div className="w-full h-48 rounded-xl overflow-hidden border border-[#1e293b] bg-slate-950 flex items-center justify-center relative">
                          {formData.mediaType === "video" ? (
                            <video src={formData.mediaUrl} className="w-full h-full object-contain" controls muted autoPlay loop playsInline preload="metadata" />
                          ) : (
                            <img src={formData.mediaUrl} alt="Upload preview" className="w-full h-full object-contain" />
                          )}
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

                  {/* Geolocation Pin Selector */}
                  <div className="bg-[#0b0f19] p-6 border border-[#1e293b] rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Pin Target Geolocation
                      </label>
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
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 mt-6 md:mt-0"
                  >
                    <CheckCircle size={18} /> Launch Geo-Targeted Ad
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
                <h3 className="font-bold text-lg text-white tracking-tight">All Ads</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setCurrentPage(1);
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
                      <th className="px-6 py-4">Radius (km)</th>
                      <th className="px-6 py-4">Impressions</th>
                      <th className="px-6 py-4">Clicks</th>
                      <th className="px-6 py-4">CTR</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {currentAds.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-900/30 transition">
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
                        <td className="px-6 py-4 text-slate-200 font-semibold">{ad.radius_km} km</td>
                        <td className="px-6 py-4 text-slate-300">{ad.views}</td>
                        <td className="px-6 py-4 text-slate-300">{ad.clicks}</td>
                        <td className="px-6 py-4 font-bold text-indigo-400">{ad.ctr}%</td>
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
                                Exp: {new Date(ad.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ad.is_active && (
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="text-rose-455 hover:text-rose-355 p-2.5 rounded-xl hover:bg-rose-955/20 transition border border-transparent hover:border-rose-900/40"
                              title="Soft delete & Purge Cloudflare Cache"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/20">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing <span className="text-white font-bold">{indexOfFirstAd + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastAd, ads.length)}</span> of <span className="text-white font-bold">{ads.length}</span> Ads
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                          currentPage === pageNum
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                            : "bg-[#0b0f19] border-[#1e293b] text-slate-300 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0b0f19] border border-[#1e293b] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
            <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="font-bold text-lg text-white mb-6 tracking-tight">All Active Backend Categories</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
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
                ))}
              </div>
            </div>
          </div>
        )}
        </main>

        {/* Footer */}
        <footer className="py-5 px-6 sm:px-8 border-t border-[#1e293b] bg-[#020617] text-slate-400 text-[11px] font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
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
            className="relative max-w-2xl w-full bg-[#131b2e] border border-[#1e293b] rounded-[2rem] overflow-hidden shadow-2xl p-6 flex flex-col h-[85vh]"
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
                className="p-2 rounded-full hover:bg-slate-900 border border-transparent hover:border-[#1e293b] text-slate-350 hover:text-white transition"
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
                      setCropAspect(res.aspect);
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
            <div className="flex-1 relative w-full rounded-2xl overflow-hidden bg-slate-950 min-h-[300px]">
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
    </div>
  );
}
