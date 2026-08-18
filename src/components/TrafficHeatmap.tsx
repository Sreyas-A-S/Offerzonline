"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Flame, Eye, MousePointerClick, Layers, Globe, Sparkles, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface HeatmapPoint {
  locationName: string;
  lat: number;
  lng: number;
  count: number;
  weight: number;
  pageViews?: number;
  impressions?: number;
  clicks?: number;
}

interface TopLocation {
  locationName: string;
  count: number;
  pageViews?: number;
  impressions?: number;
  clicks?: number;
}

interface TrafficHeatmapProps {
  points: HeatmapPoint[];
  topLocations?: TopLocation[];
}

// Inner Leaflet Map Component (CSR only)
function InnerLeafletHeatmap({ points, selectedPoint, onSelectPoint }: { 
  points: HeatmapPoint[]; 
  selectedPoint: HeatmapPoint | null;
  onSelectPoint: (pt: HeatmapPoint) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current && isMounted) {
        // Calculate center based on points or default to Kerala/India center
        const defaultCenter: [number, number] = points.length > 0 
          ? [points[0].lat, points[0].lng] 
          : [9.9312, 76.2673];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: points.length > 0 ? 8 : 6,
          zoomControl: false,
        });

        // Dark Matter tiles for ultra-premium dashboard aesthetic
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);
        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      }

      // Render glowing thermal density circles
      if (mapInstanceRef.current && layerGroupRef.current && isMounted) {
        layerGroupRef.current.clearLayers();
        const maxHits = Math.max(...points.map((p) => p.count), 1);

        points.forEach((pt) => {
          const intensity = pt.count / maxHits;
          const radiusMeters = Math.min(Math.max(pt.count * 8000, 15000), 75000);

          // 1. Outer Heat Gradient Glow
          const outerGlow = L.circle([pt.lat, pt.lng], {
            radius: radiusMeters * 1.5,
            fillColor: intensity > 0.6 ? "#ef4444" : intensity > 0.3 ? "#f59e0b" : "#6366f1",
            fillOpacity: 0.18,
            stroke: false,
          });

          // 2. Inner Intense Core
          const innerCore = L.circle([pt.lat, pt.lng], {
            radius: radiusMeters * 0.7,
            fillColor: intensity > 0.6 ? "#dc2626" : intensity > 0.3 ? "#d97706" : "#4f46e5",
            fillOpacity: 0.45,
            color: intensity > 0.6 ? "#f87171" : intensity > 0.3 ? "#fbbf24" : "#818cf8",
            weight: 2,
          });

          // 3. Pulse Center Marker
          const markerIcon = L.divIcon({
            className: "custom-heat-pin",
            html: `
              <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${intensity > 0.6 ? 'rgba(239,68,68,0.6)' : 'rgba(99,102,241,0.6)'}; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="position:relative; width:18px; height:18px; border-radius:50%; background:${intensity > 0.6 ? '#ef4444' : '#6366f1'}; border:2px solid #ffffff; box-shadow:0 0 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:900;">
                  ${pt.count}
                </div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const pinMarker = L.marker([pt.lat, pt.lng], { icon: markerIcon });

          pinMarker.bindPopup(`
            <div style="color:#0f172a; font-family:sans-serif; min-width:160px; padding:4px;">
              <div style="font-weight:bold; font-size:13px; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
                📍 ${pt.locationName}
              </div>
              <div style="background:#f1f5f9; padding:6px 8px; border-radius:8px; font-size:11px; margin-bottom:6px;">
                <strong>${pt.count} Total Hits</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569;">
                <span>Page Views: <strong>${pt.pageViews || 0}</strong></span>
                <span>Clicks: <strong>${pt.clicks || 0}</strong></span>
              </div>
            </div>
          `);

          pinMarker.on("click", () => onSelectPoint(pt));

          outerGlow.addTo(layerGroupRef.current);
          innerCore.addTo(layerGroupRef.current);
          pinMarker.addTo(layerGroupRef.current);
        });

        // Fit map bounds if multiple points exist
        if (points.length > 1) {
          const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [points]);

  // Recenter map when selectedPoint changes
  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 11, {
        duration: 1.2,
      });
    }
  }, [selectedPoint]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[380px] rounded-2xl relative z-0" />;
}

// Dynamically import InnerLeafletHeatmap to prevent SSR errors
const LeafletHeatmap = dynamic(() => Promise.resolve(InnerLeafletHeatmap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 animate-pulse text-xs font-semibold">
      Loading Traffic Heatmap...
    </div>
  ),
});

export function TrafficHeatmap({ points = [], topLocations = [] }: TrafficHeatmapProps) {
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null);
  const totalHits = points.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="bg-[#131b2e] border border-[#1e293b] p-6 sm:p-8 rounded-[2.5rem] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              Geographic Traffic Heatmap
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono">
                Live Thermal View
              </span>
            </h3>
            <p className="text-xs text-slate-400">Visual density of where your website visitors and ad interactions originate</p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0b0f19] border border-[#1e293b] px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
            <Globe size={14} className="text-indigo-400" />
            <span className="text-slate-400 font-medium">Mapped Locations:</span>
            <span className="font-extrabold text-white">{points.length}</span>
          </div>
          <div className="bg-rose-950/30 border border-rose-800/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
            <Flame size={14} className="text-rose-400" />
            <span className="text-rose-300 font-medium">Total Geo Hits:</span>
            <span className="font-black text-rose-200 font-mono">{totalHits}</span>
          </div>
        </div>
      </div>

      {/* Map & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Interactive Heatmap Canvas */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#1e293b] bg-[#0b0f19] relative min-h-[380px] shadow-inner">
          <LeafletHeatmap 
            points={points} 
            selectedPoint={selectedPoint} 
            onSelectPoint={(pt) => setSelectedPoint(pt)} 
          />

          {/* Map Overlay Heat Indicator */}
          <div className="absolute top-3 left-3 bg-[#0b0f19]/90 backdrop-blur-md border border-[#1e293b] px-3 py-1.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none z-[1000] shadow-md">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
              <span className="text-[10px] text-slate-400">Low</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span className="text-[10px] text-slate-400">Moderate</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse"></span>
              <span className="text-[10px] font-bold text-rose-300">High Density</span>
            </div>
          </div>
        </div>

        {/* Top Locations Leaderboard */}
        <div className="bg-[#0b0f19] border border-[#1e293b] p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin size={14} className="text-rose-400" />
                Top Origin Cities
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {topLocations.length} Locations
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {topLocations.length > 0 ? (
                topLocations.map((loc, idx) => {
                  const pct = totalHits > 0 ? Math.round((loc.count / totalHits) * 100) : 0;
                  const matchedPoint = points.find((p) => p.locationName.toLowerCase() === loc.locationName.toLowerCase());

                  return (
                    <div
                      key={idx}
                      onClick={() => matchedPoint && setSelectedPoint(matchedPoint)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        selectedPoint?.locationName.toLowerCase() === loc.locationName.toLowerCase()
                          ? "bg-rose-950/30 border-rose-500/50 shadow-sm"
                          : "bg-[#131b2e] border-[#1e293b] hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white truncate flex items-center gap-1.5" title={loc.locationName}>
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {loc.locationName}
                        </span>
                        <span className="text-xs font-black text-rose-400 font-mono shrink-0">
                          {loc.count} <span className="text-[10px] text-slate-500 font-normal">hits ({pct}%)</span>
                        </span>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>

                      {/* Mini Metric tags */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye size={10} className="text-sky-400" /> {loc.pageViews || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick size={10} className="text-emerald-400" /> {loc.clicks || 0} clicks
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-medium space-y-1">
                  <MapPin size={24} className="mx-auto opacity-30 text-slate-400" />
                  <p>No location data recorded for this timeframe</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-[#1e293b] pt-3 flex items-center justify-between">
            <span>Click any location to zoom & center map</span>
            <Navigation size={12} className="text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
