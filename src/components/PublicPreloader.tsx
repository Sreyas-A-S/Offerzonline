"use client";

import { Sparkles } from "lucide-react";

interface PublicPreloaderProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  theme?: "light" | "dark";
  logo?: string;
}

export function PublicPreloader({
  label = "Offerzonline",
  sublabel = "Finding verified local offers near you...",
  fullScreen = false,
  theme = "light",
  logo,
}: PublicPreloaderProps) {
  const isDark = theme === "dark";

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none relative animate-in fade-in zoom-in-95 duration-500">
      {/* Ambient Pulsing Glow Orbs */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer subtle glow rings */}
        <div className="absolute w-32 h-32 rounded-full bg-indigo-500/20 animate-ping opacity-50 pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 blur-2xl pointer-events-none" />

        {/* Outer Rotating Gradient Border Ring */}
        <div className="relative w-24 h-24 rounded-3xl p-[2.5px] bg-gradient-to-tr from-indigo-600 via-purple-500 via-pink-500 to-amber-400 shadow-2xl shadow-indigo-500/30 animate-spin [animation-duration:3s]">
          <div className={`w-full h-full rounded-[21px] ${isDark ? "bg-[#0b0f19]" : "bg-white"}`} />
        </div>

        {/* Center Floating Brand Icon / Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-2xl ${isDark ? "bg-[#0f172a]" : "bg-white"} border ${isDark ? "border-slate-800" : "border-slate-100"} p-2.5 shadow-xl shadow-indigo-600/20 flex items-center justify-center transform transition-transform hover:scale-105 overflow-hidden`}>
            {logo ? (
              <img
                src={logo}
                alt="Offerzonline Brand"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Sparkles size={24} className="animate-pulse text-amber-200" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-1.5 max-w-xs">
        <h3
          className={`text-base font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {label}
        </h3>
        {sublabel && (
          <p
            className={`text-xs font-medium ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {sublabel}
          </p>
        )}
      </div>

      {/* Modern Shimmer Progress Line */}
      <div className="w-40 h-1.5 bg-slate-200/60 dark:bg-slate-800 rounded-full mt-5 overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent w-full animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl ${
          isDark ? "bg-[#020617]/95" : "bg-white/95"
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-3xl border p-6 flex items-center justify-center ${
        isDark
          ? "bg-[#0f172a]/60 border-[#1e293b]"
          : "bg-white/80 border-slate-200/80 shadow-xs"
      }`}
    >
      {content}
    </div>
  );
}

export function OfferGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-3.5 shadow-xs overflow-hidden relative"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Media placeholder */}
          <div className="w-full h-48 bg-gradient-to-tr from-slate-100 to-slate-200/70 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-200/60" />
          </div>

          {/* Brand header placeholder */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
              <div className="h-2.5 bg-slate-200/60 rounded-md w-1/2 animate-pulse" />
            </div>
          </div>

          {/* Body lines */}
          <div className="space-y-2 pt-1">
            <div className="h-3 bg-slate-200/70 rounded-md w-full animate-pulse" />
            <div className="h-3 bg-slate-200/50 rounded-md w-4/5 animate-pulse" />
          </div>

          {/* Footer badge & action button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="h-6 w-20 bg-indigo-50 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-indigo-600/20 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
