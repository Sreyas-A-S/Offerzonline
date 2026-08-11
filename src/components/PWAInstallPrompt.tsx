"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

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

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-slate-900 border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold text-sm">Install Offerzonline App</h4>
        <p className="text-xs text-slate-400">Get instant local offer alerts offline & on home screen</p>
      </div>
      <button
        onClick={handleInstallClick}
        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-1 shrink-0 transition"
      >
        <Download size={14} /> Install
      </button>
    </div>
  );
}
