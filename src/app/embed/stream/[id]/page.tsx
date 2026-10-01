"use client";

import { useEffect, useState, use } from "react";
import { StreamPlayer, StreamData } from "@/components/StreamPlayer";

export default function EmbedStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStream() {
      try {
        const res = await fetch(`/api/streams/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStream(data.stream);
        }
      } catch (err) {
        console.error("Failed to load stream embed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStream();
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center p-4 text-center">
        <p className="text-xs text-slate-400">Stream unavailable</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden m-0 p-0">
      <StreamPlayer 
        stream={stream} 
        autoPlay={true} 
        isEmbedded={true} 
        className="w-full h-full rounded-none aspect-auto" 
      />
    </div>
  );
}
