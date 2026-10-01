"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Tv, Plus, Trash2, Edit3, Eye, MousePointerClick, TrendingUp, 
  Upload, CheckCircle, RefreshCw, Store, Play, Share2, Copy, 
  Check, ExternalLink, MessageCircle, Clock, Film, Sparkles, 
  Filter, Search, ChevronDown, X, BarChart2, Laptop, Smartphone,
  RotateCcw, Tag, Compass, AlertCircle, Settings
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StreamPlayer, StreamData } from "@/components/StreamPlayer";

interface StreamsTabProps {
  categories: { id: number; name: string }[];
}

export function StreamsTab({ categories }: StreamsTabProps) {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [formActiveTab, setFormActiveTab] = useState<"media" | "details" | "store" | "cta" | "settings">("media");
  const [editingStream, setEditingStream] = useState<any | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "video" as "video" | "gif" | "image",
    thumbnailUrl: "",
    durationSeconds: 0,
    targetUrl: "",
    ctaText: "Learn More",
    storeName: "",
    storeLogo: "",
    storePhone: "",
    storeAddress: "",
    originalPrice: "",
    promoPrice: "",
    discountValue: "",
    terms: "",
    categoryId: "",
    aspectRatio: "16:9",
    autoplay: true,
    loop: false,
    mutedDefault: false,
    isActive: true,
    isDemo: false,
  });

  // Modal Views
  const [previewStream, setPreviewStream] = useState<StreamData | null>(null);
  const [shareStream, setShareStream] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Analytics Modal State
  const [analyticsStream, setAnalyticsStream] = useState<any | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStreams = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/streams");
      if (res.ok) {
        const data = await res.json();
        setStreams(data.streams || []);
      } else {
        showToast("error", "Failed to load streams");
      }
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const openCreateModal = () => {
    setEditingStream(null);
    setFormActiveTab("media");
    setUploadProgress(0);
    setFormData({
      title: "",
      description: "",
      mediaUrl: "",
      mediaType: "video",
      thumbnailUrl: "",
      durationSeconds: 0,
      targetUrl: "",
      ctaText: "Learn More",
      storeName: "",
      storeLogo: "",
      storePhone: "",
      storeAddress: "",
      originalPrice: "",
      promoPrice: "",
      discountValue: "",
      terms: "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
      aspectRatio: "16:9",
      autoplay: true,
      loop: false,
      mutedDefault: false,
      isActive: true,
      isDemo: false,
    });
    setShowFormModal(true);
  };

  const openEditModal = (stream: any) => {
    setEditingStream(stream);
    setFormActiveTab("media");
    setUploadProgress(0);
    setFormData({
      title: stream.title || "",
      description: stream.description || "",
      mediaUrl: stream.media_url || "",
      mediaType: stream.media_type || "video",
      thumbnailUrl: stream.thumbnail_url || "",
      durationSeconds: stream.duration_seconds ? Number(stream.duration_seconds) : 0,
      targetUrl: stream.target_url || "",
      ctaText: stream.cta_text || "Learn More",
      storeName: stream.store_name || "",
      storeLogo: stream.store_logo || "",
      storePhone: stream.store_phone || "",
      storeAddress: stream.store_address || "",
      originalPrice: stream.original_price || "",
      promoPrice: stream.promo_price || "",
      discountValue: stream.discount_value || "",
      terms: stream.terms || "",
      categoryId: stream.category_id ? String(stream.category_id) : "",
      aspectRatio: stream.aspect_ratio || "16:9",
      autoplay: stream.autoplay !== false,
      loop: Boolean(stream.loop),
      mutedDefault: stream.muted_default === true,
      isActive: stream.is_active !== false,
      isDemo: Boolean(stream.is_demo),
    });
    setShowFormModal(true);
  };

  const handleFileUpload = async (file: File, target: "media" | "logo" | "thumb") => {
    if (target === "media") {
      setUploadingMedia(true);
      setUploadProgress(0);
    } else if (target === "logo") setUploadingLogo(true);
    else if (target === "thumb") setUploadingThumb(true);

    try {
      const data = new FormData();
      data.append("file", file);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        if (target === "media") {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && json.url) {
              if (target === "media") {
                setFormData((prev) => ({
                  ...prev,
                  mediaUrl: json.url,
                  mediaType: json.mediaType || (file.type.startsWith("video/") ? "video" : file.type.includes("gif") ? "gif" : "image"),
                }));
              } else if (target === "logo") {
                setFormData((prev) => ({ ...prev, storeLogo: json.url }));
              } else if (target === "thumb") {
                setFormData((prev) => ({ ...prev, thumbnailUrl: json.url }));
              }
              showToast("success", "File uploaded successfully!");
              resolve();
            } else {
              showToast("error", json.error || "Upload failed");
              reject(new Error(json.error || "Upload failed"));
            }
          } catch (e: any) {
            showToast("error", "Invalid server response");
            reject(e);
          }
        };

        xhr.onerror = () => {
          showToast("error", "Network error during upload");
          reject(new Error("Network error"));
        };

        xhr.send(data);
      });
    } catch (e: any) {
      showToast("error", e.message || "Upload error");
    } finally {
      if (target === "media") setUploadingMedia(false);
      else if (target === "logo") setUploadingLogo(false);
      else if (target === "thumb") setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.mediaUrl.trim()) {
      showToast("error", "Stream Title and Media are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      };

      const url = "/api/admin/streams";
      const method = editingStream ? "PUT" : "POST";
      const body = editingStream ? JSON.stringify({ ...payload, id: editingStream.id }) : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", editingStream ? "Stream updated successfully!" : "Stream created successfully!");
        setShowFormModal(false);
        fetchStreams();
      } else {
        showToast("error", data.error || "Operation failed");
      }
    } catch (e: any) {
      showToast("error", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete stream "${title}" and all its analytics?`)) return;

    try {
      const res = await fetch(`/api/admin/streams?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Stream deleted.");
        fetchStreams();
      } else {
        showToast("error", "Failed to delete stream.");
      }
    } catch (e: any) {
      showToast("error", e.message);
    }
  };

  const handleToggleStatus = async (stream: any) => {
    try {
      const res = await fetch("/api/admin/streams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stream.id,
          title: stream.title,
          mediaUrl: stream.media_url,
          mediaType: stream.media_type,
          isActive: !stream.is_active,
        }),
      });
      if (res.ok) {
        showToast("success", `Stream ${!stream.is_active ? "activated" : "paused"}.`);
        fetchStreams();
      }
    } catch (e: any) {
      showToast("error", e.message);
    }
  };

  const openAnalyticsModal = async (stream: any) => {
    setAnalyticsStream(stream);
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/admin/streams/analytics?stream_id=${stream.id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (e: any) {
      showToast("error", "Could not fetch stream analytics");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Filtered list
  const filteredStreams = streams.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.store_name && s.store_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || String(s.category_id) === categoryFilter;
    const matchesMediaType =
      mediaTypeFilter === "all" || s.media_type === mediaTypeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? s.is_active : !s.is_active);

    return matchesSearch && matchesCategory && matchesMediaType && matchesStatus;
  });

  // Calculate High-level Totals
  const totalStreamsCount = streams.length;
  const totalPlaysCount = streams.reduce((acc, s) => acc + (parseInt(s.plays, 10) || 0), 0);
  const totalClicksCount = streams.reduce((acc, s) => acc + (parseInt(s.cta_clicks, 10) || 0), 0);
  const totalWatchTimeSeconds = streams.reduce((acc, s) => acc + (parseFloat(s.total_watch_time) || 0), 0);
  const avgCtr = totalPlaysCount > 0 ? ((totalClicksCount / totalPlaysCount) * 100).toFixed(1) : "0.0";

  const formatWatchTime = (sec: number) => {
    if (sec < 60) return `${Math.round(sec)}s`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    return `${(sec / 3600).toFixed(1)}h`;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white border ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500 shadow-emerald-600/30"
                : "bg-rose-600 border-rose-500 shadow-rose-600/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Streams</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Tv size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">{totalStreamsCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Uploaded videos & GIFs</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Plays</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Play size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400">{totalPlaysCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Video streams started</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Watch Time</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-violet-400">{formatWatchTime(totalWatchTimeSeconds)}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Total time streamed</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">CTA Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <MousePointerClick size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-400">{totalClicksCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Shop & WhatsApp clicks</p>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg Stream CTR</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-400">{avgCtr}%</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">Interaction conversion</p>
        </div>
      </div>

      {/* 2. Toolbar: Search, Filters, and New Stream Button */}
      <div className="bg-[#131b2e] border border-[#1e293b] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search streams or stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Media Type Filter */}
          <select
            value={mediaTypeFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Media</option>
            <option value="video">Videos Only</option>
            <option value="gif">GIFs Only</option>
            <option value="image">Images Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0b0f19] border border-[#1e293b] text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={fetchStreams}
            disabled={refreshing}
            className="p-2.5 bg-[#0b0f19] border border-[#1e293b] hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-indigo-400" : ""} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Create Stream
          </button>
        </div>
      </div>

      {/* 3. Streams Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading streams...</p>
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Tv size={28} />
          </div>
          <h3 className="text-lg font-extrabold text-white">No Streams Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload videos, animated GIFs, or banner ads to start streaming them with YouTube-like player controls and tracking.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Plus size={15} /> Create Your First Stream
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-[#131b2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between group"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                {stream.thumbnail_url ? (
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : stream.media_type === "video" ? (
                  <video
                    src={stream.media_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    muted
                  />
                ) : (
                  <img
                    src={stream.media_url}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}

                {/* Overlay Controls / Play Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <button
                    onClick={() => setPreviewStream(stream)}
                    className="w-12 h-12 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-xl hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs border border-white/20"
                    title="Watch Stream"
                  >
                    <Play size={20} className="translate-x-0.5 fill-white" />
                  </button>
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                        stream.is_active
                          ? "bg-emerald-500/30 border-emerald-400/40 text-emerald-300"
                          : "bg-slate-800/80 border-slate-700 text-slate-400"
                      }`}
                    >
                      {stream.is_active ? "Active" : "Paused"}
                    </span>
                    {stream.is_demo && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/30 border border-amber-400/40 text-amber-300 backdrop-blur-md flex items-center gap-1">
                        <Sparkles size={10} /> Demo
                      </span>
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-white">
                    {stream.media_type}
                  </span>
                </div>

                {/* Bottom Aspect / Category Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg font-semibold truncate max-w-[150px]">
                    {stream.category_name || "General"}
                  </span>
                  {stream.discount_value && (
                    <span className="bg-rose-500/90 text-white font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Tag size={10} /> {stream.discount_value}
                    </span>
                  )}
                </div>
              </div>

              {/* Stream Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-white line-clamp-1 group-hover:text-indigo-400 transition">
                    {stream.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                    <Store size={12} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{stream.store_name || "Offerz Merchant"}</span>
                  </p>
                </div>

                {/* Stream Quick Metrics Bar */}
                <div className="grid grid-cols-4 gap-1.5 bg-[#0b0f19] border border-[#1e293b] p-2.5 rounded-2xl text-center">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Plays</span>
                    <span className="text-xs font-black text-emerald-400">{stream.plays || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Watch</span>
                    <span className="text-xs font-black text-violet-400">
                      {formatWatchTime(parseFloat(stream.total_watch_time) || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">Clicks</span>
                    <span className="text-xs font-black text-amber-400">{stream.cta_clicks || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-500 block">CTR</span>
                    <span className="text-xs font-black text-rose-400">{stream.ctr || 0}%</span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* Preview / Watch */}
                    <button
                      type="button"
                      onClick={() => setPreviewStream(stream)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Watch / Preview Stream"
                    >
                      <Play size={14} />
                    </button>

                    {/* Analytics */}
                    <button
                      type="button"
                      onClick={() => openAnalyticsModal(stream)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                      title="View Detailed Analytics"
                    >
                      <BarChart2 size={14} />
                    </button>

                    {/* Share / Embed */}
                    <button
                      type="button"
                      onClick={() => setShareStream(stream)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      title="Share & Embed Link"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Active / Inactive */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(stream)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        stream.is_active
                          ? "bg-slate-900 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                          : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                      }`}
                    >
                      {stream.is_active ? "Pause" : "Resume"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(stream)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Stream"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(stream.id, stream.title)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Stream"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT STREAM MODAL */}
      {showFormModal && (
        <div 
          onClick={() => setShowFormModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Tv size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingStream ? "Edit Stream" : "Create New Stream"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Upload your video/media, set title, description, and redirect link.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Media Upload */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                  Video or Media Asset *
                </label>
                
                {formData.mediaUrl ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 max-h-56 flex items-center justify-center group">
                    {formData.mediaType === "video" ? (
                      <video src={formData.mediaUrl} className="w-full h-full max-h-52 object-contain" controls />
                    ) : (
                      <img src={formData.mediaUrl} alt="Preview" className="w-full h-full max-h-52 object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mediaUrl: "" }))}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-lg cursor-pointer transition"
                      title="Remove Media"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 bg-[#0b0f19] rounded-2xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer transition relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      {uploadingMedia ? <RefreshCw size={22} className="animate-spin text-indigo-400" /> : <Upload size={22} />}
                    </div>
                    <div className="text-center w-full max-w-xs">
                      <p className="text-xs font-bold text-white">
                        {uploadingMedia ? `Uploading Media (${uploadProgress}%)...` : "Click or drag & drop video/media file"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        MP4, WebM, animated GIF, or Image (up to 100MB)
                      </p>
                      {uploadingMedia && (
                        <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden border border-slate-700">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-150 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      disabled={uploadingMedia}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "media");
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 2. Stream Title */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Stream Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Mega Sale - 50% Off"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. Description */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a short description about this offer or stream..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4. Redirect Link & CTA Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Redirect URL (Target Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/offer"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Button Label (CTA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Learn More / Claim Offer"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 5. Category & Aspect Ratio & Demo Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">None / General</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={formData.aspectRatio}
                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="16:9">16:9 (Landscape / YouTube)</option>
                    <option value="9:16">9:16 (Vertical / Reels & Shorts)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3 (Box)</option>
                  </select>
                </div>
              </div>

              {/* Demo Mode Toggle */}
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-[#1e293b] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" /> Demo Stream Media
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Plays normally in channels but stats & watch time will not be recorded.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDemo}
                    onChange={(e) => setFormData({ ...formData, isDemo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingStream ? "Update Stream" : "Publish Stream"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PLAYER PREVIEW MODAL */}
      {previewStream && (
        <div 
          onClick={() => setPreviewStream(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-black text-sm text-white">{previewStream.title}</h3>
              </div>
              <button
                onClick={() => setPreviewStream(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
              <StreamPlayer stream={previewStream} autoPlay={true} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Aspect Ratio: {previewStream.aspect_ratio || "16:9"}</span>
              <a
                href={`/streams/${previewStream.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>Open Public Watch Page</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ANALYTICS & RETENTION MODAL */}
      {analyticsStream && (
        <div 
          onClick={() => setAnalyticsStream(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 cursor-default"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                  Stream Performance Analytics
                </span>
                <h3 className="text-lg font-black text-white">{analyticsStream.title}</h3>
              </div>
              <button
                onClick={() => setAnalyticsStream(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold">Calculating stream telemetry...</p>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Plays</span>
                    <h4 className="text-xl font-black text-emerald-400 mt-1">
                      {analyticsData.stats?.total_plays || 0}
                    </h4>
                  </div>
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Watch Time</span>
                    <h4 className="text-xl font-black text-violet-400 mt-1">
                      {formatWatchTime(parseFloat(analyticsData.stats?.total_watch_time_seconds) || 0)}
                    </h4>
                  </div>
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">CTA Clicks</span>
                    <h4 className="text-xl font-black text-amber-400 mt-1">
                      {(analyticsData.stats?.cta_clicks || 0) + (analyticsData.stats?.whatsapp_clicks || 0)}
                    </h4>
                  </div>
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Unique Viewers</span>
                    <h4 className="text-xl font-black text-indigo-400 mt-1">
                      {analyticsData.stats?.unique_viewers || 0}
                    </h4>
                  </div>
                </div>

                {/* Video Retention Funnel Curve */}
                <div className="bg-[#0b0f19] border border-[#1e293b] p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-400" /> Audience Retention Funnel
                  </h4>

                  {(() => {
                    const plays = analyticsData.stats?.total_plays || 1;
                    const r25 = analyticsData.stats?.reaches_25 || 0;
                    const r50 = analyticsData.stats?.reaches_50 || 0;
                    const r75 = analyticsData.stats?.reaches_75 || 0;
                    const r100 = analyticsData.stats?.total_completes || 0;

                    const p25 = Math.min(100, Math.round((r25 / plays) * 100));
                    const p50 = Math.min(100, Math.round((r50 / plays) * 100));
                    const p75 = Math.min(100, Math.round((r75 / plays) * 100));
                    const p100 = Math.min(100, Math.round((r100 / plays) * 100));

                    return (
                      <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">25% Watched</span>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p25}%` }} />
                          </div>
                          <span className="text-xs font-extrabold text-white">{p25}%</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">50% Watched</span>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${p50}%` }} />
                          </div>
                          <span className="text-xs font-extrabold text-white">{p50}%</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">75% Watched</span>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p75}%` }} />
                          </div>
                          <span className="text-xs font-extrabold text-white">{p75}%</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">100% Completed</span>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${p100}%` }} />
                          </div>
                          <span className="text-xs font-extrabold text-white">{p100}%</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Device and Location Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Device breakdown */}
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl space-y-3">
                    <h5 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Laptop size={14} className="text-slate-400" /> Device Distribution
                    </h5>
                    <div className="space-y-2">
                      {analyticsData.devices?.map((d: any) => (
                        <div key={d.device} className="flex items-center justify-between text-xs">
                          <span className="capitalize text-slate-300 font-medium">{d.device}</span>
                          <span className="font-extrabold text-white">{d.count} plays</span>
                        </div>
                      ))}
                      {(!analyticsData.devices || analyticsData.devices.length === 0) && (
                        <p className="text-xs text-slate-500">No device telemetry yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl space-y-3">
                    <h5 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Compass size={14} className="text-slate-400" /> Top Viewer Locations
                    </h5>
                    <div className="space-y-2">
                      {analyticsData.locations?.map((l: any) => (
                        <div key={l.location} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate max-w-[200px]">{l.location}</span>
                          <span className="font-extrabold text-white">{l.count} plays</span>
                        </div>
                      ))}
                      {(!analyticsData.locations || analyticsData.locations.length === 0) && (
                        <p className="text-xs text-slate-500">No geo data logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Event Logs */}
                <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-2xl space-y-3">
                  <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Recent Stream Event Logs (Telemetry)
                  </h5>
                  <div className="overflow-x-auto max-h-48 divide-y divide-slate-800/60">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 font-extrabold text-[10px] uppercase">
                          <th className="py-2">Event</th>
                          <th className="py-2">Location</th>
                          <th className="py-2">Device</th>
                          <th className="py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300">
                        {analyticsData.recentLogs?.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-900/50">
                            <td className="py-2 font-bold text-white uppercase text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded-md ${
                                  log.event_type === "play"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : log.event_type.startsWith("click")
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-indigo-500/20 text-indigo-400"
                                }`}
                              >
                                {log.event_type}
                              </span>
                            </td>
                            <td className="py-2">{log.user_location_name || "Unknown"}</td>
                            <td className="py-2 capitalize">{log.device_type || "desktop"}</td>
                            <td className="py-2 text-slate-500 text-[11px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SHARE & EMBED MODAL */}
      {shareStream && (
        <div 
          onClick={() => setShareStream(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 cursor-default"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Share & Embed Stream</h3>
              <button
                onClick={() => setShareStream(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Direct Watch URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Public Watch URL
              </label>
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/streams/${shareStream.id}` : ""}
                  className="bg-transparent text-xs text-slate-300 w-full focus:outline-none font-mono"
                />
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(`${window.location.origin}/streams/${shareStream.id}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition"
                >
                  {copiedLink ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* iFrame Embed Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                iFrame Embed Code (for blogs / sites)
              </label>
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `<iframe src="${window.location.origin}/embed/stream/${shareStream.id}" width="100%" height="500" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
                      : ""
                  }
                  className="bg-transparent text-xs text-slate-300 w-full focus:outline-none font-mono truncate"
                />
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const code = `<iframe src="${window.location.origin}/embed/stream/${shareStream.id}" width="100%" height="500" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                      navigator.clipboard.writeText(code);
                      setCopiedEmbed(true);
                      setTimeout(() => setCopiedEmbed(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 transition"
                >
                  {copiedEmbed ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* WhatsApp Direct Share */}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const url = `${window.location.origin}/streams/${shareStream.id}`;
                  const text = encodeURIComponent(`Watch "${shareStream.title}" on Offerzonline Streams!`);
                  window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, "_blank");
                }
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageCircle size={15} /> Share to WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
