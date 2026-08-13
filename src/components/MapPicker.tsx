"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import the entire Leaflet map component to prevent SSR "window is not defined" issues
const InnerMap = dynamic(
  () => import("./InnerMap"),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-slate-900 rounded-xl animate-pulse" />
  }
);

interface MapPickerProps {
  lat: number;
  lng: number;
  radiusKm: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker(props: MapPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-64 bg-slate-900 rounded-xl animate-pulse" />;

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-700 relative z-0">
      <InnerMap {...props} />
    </div>
  );
}
