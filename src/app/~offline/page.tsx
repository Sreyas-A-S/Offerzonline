import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400">
        <WifiOff size={40} />
      </div>
      <h1 className="text-3xl font-bold mb-3">You are Offline</h1>
      <p className="text-slate-400 max-w-md mb-8">
        It looks like you lost your internet connection. Offerzonline cached local deals are still saved on your device.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-6 py-3 rounded-xl transition"
      >
        <RefreshCw size={18} /> Retry Connection
      </Link>
    </div>
  );
}
