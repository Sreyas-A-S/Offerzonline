"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW Registered:", reg.scope))
        .catch((err) => console.error("SW Registration failed:", err));
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();

      // Check if user dismissed prompt within last 24 hours
      const dismissedUntil = localStorage.getItem("pwa_prompt_dismissed_until");
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }

      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in ms
    localStorage.setItem("pwa_prompt_dismissed_until", tomorrow.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-5 right-5 left-auto max-w-[calc(100vw-2.5rem)] sm:max-w-md md:max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800 p-4 rounded-2xl shadow-2xl z-[9999] flex items-center justify-between gap-4 relative pr-10">
      <div>
        <h4 className="font-extrabold text-slate-950 text-sm">Install Offerzonline App</h4>
        <p className="text-xs text-slate-600">Get instant local offer alerts offline & on home screen</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
        >
          <Download size={14} /> Install
        </button>
      </div>
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
        title="Dismiss for 24 hours"
      >
        <X size={14} />
      </button>
    </div>
  );
}
