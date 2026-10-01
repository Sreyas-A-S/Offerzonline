"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Tv, Eye, MousePointerClick, TrendingUp, Radio,
  CheckCircle, RefreshCw, Store, Play, Share2, Copy, Check, 
  ExternalLink, Clock, Film, Sparkles, LogOut,
  User, ShieldCheck, Tag, X, ArrowLeft, BarChart3, Activity,
  Users, Layers, ArrowUpRight
} from "lucide-react";
import { PublicPreloader } from "@/components/PublicPreloader";

export default function StreamerStudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Verify Auth Session
  useEffect(() => {
    let isMounted = true;

    async function loadSessionAndData() {
      try {
        const authRes = await fetch("/api/streamer/login", {
          headers: { "Accept": "application/json" },
        }).catch((e) => {
          console.warn("Auth check network error:", e);
          return null;
        });

        if (!authRes || !authRes.ok) {
          if (isMounted) router.push("/auth");
          return;
        }

        const authData = await authRes.json();

        if (!authData.authenticated || !authData.user) {
          if (isMounted) router.push("/auth");
          return;
        }

        if (isMounted) setUser(authData.user);

        // Fetch active streams uploaded by admin
        const streamsRes = await fetch("/api/streamer/streams").catch(() => null);
        if (streamsRes && streamsRes.ok) {
          const sData = await streamsRes.json();
          if (isMounted) setStreams(sData.streams || []);
        }
      } catch (err) {
        console.error("Studio load error:", err);
        if (isMounted) router.push("/auth");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSessionAndData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchStreams = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/streamer/streams");
      if (res.ok) {
        const data = await res.json();
        setStreams(data.streams || []);
        showToast("success", "Channels and statistics updated!");
      }
    } catch (e) {
      showToast("error", "Failed to refresh stream data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/streamer/logout", { method: "POST" });
    } catch (e) {}
    router.push("/auth");
  };

  const handleCopyChannelLink = (streamId: number) => {
    const url = `${window.location.origin}/streams/channel/${streamId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(streamId);
    showToast("success", "Broadcast channel URL copied!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Aggregate Broadcaster Telemetry Stats
  const totalPlays = streams.reduce((acc, s) => acc + (parseInt(s.plays) || 0), 0);
  const totalClicks = streams.reduce((acc, s) => acc + (parseInt(s.cta_clicks) || 0), 0);
  const avgCtr = totalPlays > 0 ? ((totalClicks / totalPlays) * 100).toFixed(1) : "0.0";
  const totalWatchMinutes = Math.round(streams.reduce((acc, s) => acc + (parseFloat(s.total_watch_time) || 0), 0) / 60);

  if (loading) {
    return (
      <PublicPreloader
        label="Loading Streamer Dashboard"
        sublabel="Aggregating performance stats & broadcast channels..."
        fullScreen={true}
        theme="light"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#eaedf2] text-slate-900 font-sans pb-24 selection:bg-blue-100 selection:text-blue-900">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold bg-slate-100 hover:bg-slate-200/70 px-3 py-1.5 rounded-full transition"
          >
            <ArrowLeft size={14} /> Discovery
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0052cc] flex items-center justify-center text-white font-black text-xs shadow-sm">
              <Tv size={16} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Streamer Analytics Hub</h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {user?.store_name || user?.name} • <span className="text-emerald-600 font-semibold">Broadcaster</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStreams}
            disabled={refreshing}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052cc] text-xs font-bold">
                Broadcaster Dashboard
              </span>
              <span className="text-xs text-slate-400">• Welcome back, {user?.name || "Partner"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Performance & Live Broadcast Channels
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Review real-time audience telemetry below and launch any active broadcast channel to start continuous, uninterrupted full-screen streaming.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStreams}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>

        {/* 1. Broadcaster Analytics Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0052cc] flex items-center justify-center shrink-0">
              <Eye size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Stream Plays</span>
              <span className="text-2xl font-black text-slate-900">{totalPlays.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">Continuous audience impressions</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Broadcast Time</span>
              <span className="text-2xl font-black text-slate-900">{totalWatchMinutes} min</span>
              <span className="text-[10px] font-semibold text-purple-600 block mt-0.5">Cumulative watch time</span>
            </div>
          </div>
        </div>

        {/* 2. Single Live Channel Launch Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md animate-pulse">
                <Radio size={12} /> LIVE STREAM CHANNEL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Launch Live Channel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Start streaming live media broadcast offers continuously in full-screen.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/streams/channel"
              className="px-6 py-3 bg-[#0052cc] hover:bg-[#0045b0] text-white text-sm font-extrabold rounded-2xl transition flex items-center gap-2 shadow-xl shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              <Play size={16} className="fill-white" />
              <span>Start Channel Now</span>
            </Link>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 border animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={15} /> : <X size={15} />}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}


