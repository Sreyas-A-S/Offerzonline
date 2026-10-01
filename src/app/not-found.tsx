import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
        <Compass size={32} />
      </div>
      <h1 className="text-3xl font-black mb-2">Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The page or deal you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
      >
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
}
