"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const InnerReadOnlyMap = dynamic(
  () => import("./InnerReadOnlyMap"),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 rounded-xl animate-pulse" />
  }
);

interface ReadOnlyMapProps {
  lat: number;
  lng: number;
  radiusKm: number;
}

export function ReadOnlyMap(props: ReadOnlyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-slate-900 rounded-xl animate-pulse" />;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-700 relative z-0">
      <InnerReadOnlyMap {...props} />
    </div>
  );
}
