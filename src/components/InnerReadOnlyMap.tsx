"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";

interface InnerReadOnlyMapProps {
  lat: number;
  lng: number;
  radiusKm: number;
}

export default function InnerReadOnlyMap({ lat, lng, radiusKm }: InnerReadOnlyMapProps) {
  useEffect(() => {
    // Fix default marker icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  const centerLat = lat || 28.6139;
  const centerLng = lng || 77.209;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[centerLat, centerLng]} />
      <Circle
        center={[centerLat, centerLng]}
        radius={(radiusKm || 5) * 1000}
        pathOptions={{ color: "#4f46e5", fillColor: "#6366f1", fillOpacity: 0.15 }}
      />
    </MapContainer>
  );
}
