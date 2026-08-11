"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Eye, MousePointerClick, TrendingUp, Upload, 
  MapPin, CheckCircle, RefreshCw, BarChart2, Layers, AlertTriangle 
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-bold text-lg">
            O
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Offerzonline Admin</h1>
            <p className="text-xs text-slate-400">Single-Admin Ad Server & Geo-Targeting Hub</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "overview"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === "ads"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Campaigns ({ads.filter((a) => a.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1 ${
              activeTab === "create"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Plus size={14} /> Create Campaign
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                  <span>Total Impressions</span>
                  <Eye size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">{totalViews}</h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                  <span>Total Clicks</span>
                  <MousePointerClick size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">{totalClicks}</h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                  <span>Average CTR</span>
                  <TrendingUp size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">{avgCtr}%</h3>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="font-bold text-lg text-white mb-6">Campaign Performance Comparison</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="title" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }} />
                    <Bar dataKey="views" fill="#22c55e" name="Impressions" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ads" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">All Ad Campaigns</h3>
              <button onClick={fetchDashboardData} className="text-slate-400 hover:text-white p-2">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
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
                <tbody className="divide-y divide-slate-800">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-semibold text-white">{ad.title}</td>
                      <td className="px-6 py-4">{ad.category_name || "Uncategorized"}</td>
                      <td className="px-6 py-4 font-mono text-xs">{ad.ad_format}</td>
                      <td className="px-6 py-4">{ad.radius_km} km</td>
                      <td className="px-6 py-4">{ad.views}</td>
                      <td className="px-6 py-4">{ad.clicks}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">{ad.ctr}%</td>
                      <td className="px-6 py-4">
                        {ad.is_active ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
                            Soft Deleted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ad.is_active && (
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition"
                            title="Soft delete & Purge Cloudflare Cache"
                          >
                            <Trash2 size={16} />
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto">
            <h3 className="font-bold text-xl text-white mb-6">Create Geo-Targeted Ad Campaign</h3>

            <form onSubmit={handleCreateAd} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 50% Off Gourmet Pizza Deals"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Ad Format</label>
                  <select
                    value={formData.adFormat}
                    onChange={(e) => setFormData({ ...formData, adFormat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="300x250">300x250 Medium Rectangle</option>
                    <option value="728x90">728x90 Leaderboard</option>
                    <option value="1080x1920">1080x1920 Mobile Story</option>
                    <option value="responsive">Responsive Container</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Target Landing URL</label>
                <input
                  type="url"
                  required
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Media File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Upload Media (Image / GIF / Video)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition text-slate-200"
                  >
                    <Upload size={16} /> {uploading ? "Compressing & Uploading..." : "Choose File"}
                  </label>
                  {formData.mediaUrl && (
                    <span className="text-xs text-emerald-400 font-mono truncate max-w-xs">
                      Uploaded: {formData.mediaUrl}
                    </span>
                  )}
                </div>
              </div>

              {/* Geolocation Pin Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                  Target Geolocation & Coverage Radius ({formData.radiusKm} km)
                </label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-slate-400">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-slate-400 block mb-1">Target Radius: {formData.radiusKm} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={formData.radiusKm}
                    onChange={(e) => setFormData({ ...formData, radiusKm: parseInt(e.target.value, 10) })}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <MapPicker
                  lat={formData.latitude}
                  lng={formData.longitude}
                  radiusKm={formData.radiusKm}
                  onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
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
