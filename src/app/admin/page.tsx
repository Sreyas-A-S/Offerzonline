"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Eye, MousePointerClick, TrendingUp, Upload, 
  MapPin, CheckCircle, RefreshCw, Store
} from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const [ads, setAds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "create">("overview");

  // Form State for New Ad
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "1",
    mediaUrl: "",
    mediaType: "image",
    adFormat: "300x250",
    targetUrl: "https://",
    latitude: 28.6139,
    longitude: 77.209,
    radiusKm: 5,
    weightPriority: 1,
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    fetchDashboardData();
  }, []);

  // Handle File Upload to /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          mediaType: result.mediaType,
        }));
        setMessage({ type: "success", text: "Media uploaded & compressed successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Upload failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload exception" });
    } finally {
      setUploading(false);
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
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Ad created successfully!" });
        fetchDashboardData();
        setActiveTab("ads");
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-200/60 bg-white/60 backdrop-blur-xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            O
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">Offerzonline Admin</h1>
            <p className="text-xs text-slate-500">Single-Admin Ad Server & Geo-Targeting Hub</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`px-4 py-2.5 rounded-xl transition-all duration-300 ${
              activeTab === "ads"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Campaigns ({ads.filter((a) => a.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1 ${
              activeTab === "create"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Plus size={14} /> Create Campaign
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 relative z-10">
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm transition-all duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800 shadow-sm"
                : "bg-rose-50 border-rose-105 text-rose-800 shadow-sm"
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
              <div className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Total Impressions</span>
                  <Eye size={18} className="text-indigo-600" />
                </div>
                <h3 className="text-4xl font-extrabold text-slate-950">{totalViews}</h3>
              </div>

              <div className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Total Clicks</span>
                  <MousePointerClick size={18} className="text-purple-600" />
                </div>
                <h3 className="text-4xl font-extrabold text-slate-950">{totalClicks}</h3>
              </div>

              <div className="bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>Average CTR</span>
                  <TrendingUp size={18} className="text-pink-600" />
                </div>
                <h3 className="text-4xl font-extrabold text-slate-950">{avgCtr}%</h3>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6 tracking-tight">Campaign Performance Comparison</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                    <XAxis dataKey="title" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "rgba(0,0,0,0.08)", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} 
                      labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                    />
                    <Bar dataKey="views" fill="#4f46e5" name="Impressions" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="clicks" fill="#9333ea" name="Clicks" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ads" && (
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 tracking-tight">All Ad Campaigns</h3>
              <button onClick={fetchDashboardData} className="text-slate-600 hover:text-slate-950 p-2.5 rounded-xl bg-slate-50 border border-slate-200 transition-all">
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/60">
                  <tr>
                    <th className="px-6 py-4">Campaign Title</th>
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
                <tbody className="divide-y divide-slate-100">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{ad.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600">
                          {ad.category_name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{ad.ad_format}</td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">{ad.radius_km} km</td>
                      <td className="px-6 py-4 text-slate-600">{ad.views}</td>
                      <td className="px-6 py-4 text-slate-600">{ad.clicks}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{ad.ctr}%</td>
                      <td className="px-6 py-4">
                        {ad.is_active ? (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2.5 py-1 rounded-full font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-rose-55 text-rose-700 border border-rose-100 text-xs px-2.5 py-1 rounded-full font-bold">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ad.is_active && (
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-rose-600 hover:text-rose-700 p-2.5 rounded-xl hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
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
          </div>
        )}

        {activeTab === "create" && (
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 max-w-3xl mx-auto shadow-sm">
            <h3 className="font-bold text-xl text-slate-900 mb-6 tracking-tight">Create Geo-Targeted Ad Campaign</h3>

            <form onSubmit={handleCreateAd} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 50% Off Gourmet Pizza Deals"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-300"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ad Format</label>
                  <select
                    value={formData.adFormat}
                    onChange={(e) => setFormData({ ...formData, adFormat: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-300"
                  >
                    <option value="300x250" className="bg-white">300x250 Medium Rectangle</option>
                    <option value="728x90" className="bg-white">728x90 Leaderboard</option>
                    <option value="1080x1920" className="bg-white">1080x1920 Mobile Story</option>
                    <option value="responsive" className="bg-white">Responsive Container</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Landing URL</label>
                <input
                  type="url"
                  required
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all duration-300"
                />
              </div>

              {/* Media File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Upload Media (Image / GIF / Video)
                </label>
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition text-slate-700 shadow-sm"
                  >
                    <Upload size={14} /> {uploading ? "Compressing & Uploading..." : "Choose File"}
                  </label>
                  {formData.mediaUrl && (
                    <span className="text-xs text-indigo-650 font-mono truncate max-w-xs block">
                      Uploaded: {formData.mediaUrl.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>

              {/* Geolocation Pin Selector */}
              <div className="bg-slate-50 p-6 border border-slate-200 rounded-[2rem] space-y-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Geolocation & Coverage Radius ({formData.radiusKm} km)
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-2">Target Radius: {formData.radiusKm} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={formData.radiusKm}
                    onChange={(e) => setFormData({ ...formData, radiusKm: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-650"
                  />
                </div>

                <div className="rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-inner">
                  <MapPicker
                    lat={formData.latitude}
                    lng={formData.longitude}
                    radiusKm={formData.radiusKm}
                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15"
              >
                <CheckCircle size={18} /> Launch Geo-Targeted Campaign
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
