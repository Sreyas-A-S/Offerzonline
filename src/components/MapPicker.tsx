"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

interface MapPickerProps {
  lat: number;
  lng: number;
  radiusKm: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker({ lat, lng, radiusKm, onChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix leaflet default marker icons in Next.js
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!mounted) return <div className="h-64 bg-slate-900 rounded-xl animate-pulse" />;

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-700">
      <MapContainer
        center={[lat || 28.6139, lng || 77.209]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat || 28.6139, lng || 77.209]} />
        <Circle
          center={[lat || 28.6139, lng || 77.209]}
          radius={(radiusKm || 5) * 1000}
          pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.2 }}
        />
      </MapContainer>
    </div>
  );
}
