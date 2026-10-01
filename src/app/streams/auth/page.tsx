"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Tv, Sparkles, Store, Lock, Mail, User, Phone, ArrowRight, 
  CheckCircle, ArrowLeft, ShieldCheck, AlertCircle, RefreshCw 
} from "lucide-react";

export default function StreamerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");

  // Check if already authenticated
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/streamer/login");
        const data = await res.json();
        if (data.authenticated) {
          router.push("/streams/studio");
        }
      } catch (e) {
        // Continue
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/streamer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          router.push("/streams/studio");
        } else {
          setError(data.error || "Login failed. Please check your credentials.");
        }
      } else {
        const res = await fetch("/api/streamer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, storeName, phone }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg("Account created successfully! Redirecting to your Studio...");
          setTimeout(() => {
            router.push("/streams/studio");
          }, 1000);
        } else {
          setError(data.error || "Registration failed.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={14} /> Back to Offerzonline
        </Link>
        <Link
          href="/streams/studio"
          className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
        >
          <Tv size={14} /> Creator Studio
        </Link>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2 shadow-inner">
            <Tv size={28} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === "login" ? "User Sign In" : "Register Account"}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Access your dashboard to manage interactive live streams & analytics."
              : "Create an account to broadcast live interactive streams & store promotions."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#0b0f19] p-1 rounded-2xl border border-[#1e293b]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === "register"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Store / Brand Name
                  </label>
                  <div className="relative">
                    <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Urban Kicks"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="streamer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            {mode === "register" && (
              <span className="text-[10px] text-slate-500 mt-1 block">At least 6 characters</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>{mode === "login" ? "Authenticating..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Studio" : "Register & Start Streaming"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-[#1e293b]">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Verified Merchant Streaming Gateway</span>
        </div>
      </div>
    </div>
  );
}
