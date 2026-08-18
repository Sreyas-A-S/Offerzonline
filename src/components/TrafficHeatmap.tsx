"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Flame, Eye, MousePointerClick, Globe, Navigation, Layers, ZoomIn, ZoomOut } from "lucide-react";
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

/**
 * Creates a pre-rendered 256x1 gradient palette image data array for thermal color mapping
 */
function createGradientPalette(): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;

  // Smooth Thermal Gradient: Transparent Blue -> Cyan -> Emerald -> Yellow -> Orange -> Crimson
  const grad = ctx.createLinearGradient(0, 0, 256, 1);
  grad.addColorStop(0.0, "rgba(0, 0, 255, 0)");
  grad.addColorStop(0.2, "rgba(0, 180, 255, 0.4)");
  grad.addColorStop(0.4, "rgba(0, 255, 200, 0.7)");
  grad.addColorStop(0.6, "rgba(74, 222, 128, 0.85)");
  grad.addColorStop(0.75, "rgba(250, 204, 21, 0.95)");
  grad.addColorStop(0.9, "rgba(249, 115, 22, 1)");
  grad.addColorStop(1.0, "rgba(239, 68, 68, 1)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

/**
 * Generates an offscreen radial brush with Gaussian alpha falloff
 */
function createBrush(radius: number, blur: number): HTMLCanvasElement {
  const brush = document.createElement("canvas");
  const r = radius + blur;
  brush.width = r * 2;
  brush.height = r * 2;
  const ctx = brush.getContext("2d")!;

  ctx.shadowOffsetX = r * 2;
  ctx.shadowOffsetY = r * 2;
  ctx.shadowBlur = blur;
  ctx.shadowColor = "black";

  ctx.beginPath();
  ctx.arc(-r, -r, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  return brush;
}

// Inner Leaflet Map with Canvas Thermal Blending Engine
function InnerLeafletHeatmap({ points, selectedPoint, onSelectPoint }: { 
  points: HeatmapPoint[]; 
  selectedPoint: HeatmapPoint | null;
  onSelectPoint: (pt: HeatmapPoint) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const paletteRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current && isMounted) {
        const defaultCenter: [number, number] = points.length > 0 
          ? [points[0].lat, points[0].lng] 
          : [9.9312, 76.2673];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: points.length > 0 ? 8 : 6,
          zoomControl: false,
          fadeAnimation: true,
        });

        // Dark Matter map tiles for high-contrast thermal glow
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Marker layer for crisp interactive pins
        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        if (!paletteRef.current) {
          paletteRef.current = createGradientPalette();
        }
      }

      // Draw the true continuous thermal canvas heatmap
      function redrawHeatmap() {
        const map = mapInstanceRef.current;
        const canvas = canvasRef.current;
        if (!map || !canvas || !paletteRef.current) return;

        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (points.length === 0) return;

        // Dynamic brush radius scaled to zoom level
        const zoom = map.getZoom();
        const baseRadius = Math.max(Math.min(zoom * 6, 65), 25);
        const blur = Math.max(baseRadius * 0.7, 15);
        const brush = createBrush(baseRadius, blur);

        const maxHits = Math.max(...points.map((p) => p.count), 1);

        // 1. Draw grayscale alpha masks for all hit points
        points.forEach((pt) => {
          const containerPt = map.latLngToContainerPoint([pt.lat, pt.lng]);
          // Clip off-screen points
          if (
            containerPt.x < -baseRadius * 2 ||
            containerPt.y < -baseRadius * 2 ||
            containerPt.x > canvas.width + baseRadius * 2 ||
            containerPt.y > canvas.height + baseRadius * 2
          ) {
            return;
          }

          // Non-linear intensity scaling so lower numbers are visible and hot spots peak
          const normalized = Math.min(Math.max(pt.count / maxHits, 0.25), 1.0);
          ctx.globalAlpha = Math.min(0.2 + normalized * 0.7, 0.95);

          const drawX = containerPt.x - (baseRadius + blur);
          const drawY = containerPt.y - (baseRadius + blur);
          ctx.drawImage(brush, drawX, drawY);
        });

        // 2. Colorize alpha channel using gradient palette lookup
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = image.data;
        const palette = paletteRef.current;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 0) {
            const paletteIndex = alpha * 4;
            data[i] = palette[paletteIndex];         // R
            data[i + 1] = palette[paletteIndex + 1]; // G
            data[i + 2] = palette[paletteIndex + 2]; // B
            data[i + 3] = Math.min(alpha * 1.35, 230); // Smooth transparency
          }
        }

        ctx.putImageData(image, 0, 0);
      }

      // Update interactive pins overlay
      function updateMarkers() {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        if (!map || !markersLayer) return;

        markersLayer.clearLayers();

        points.forEach((pt) => {
          const markerIcon = L.divIcon({
            className: "proper-heat-pin",
            html: `
              <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(255,255,255,0.4); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="width:12px; height:12px; border-radius:50%; background:#ffffff; border:2.5px solid #0f172a; box-shadow:0 0 12px rgba(255,255,255,0.8);"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const pinMarker = L.marker([pt.lat, pt.lng], { icon: markerIcon });

          pinMarker.bindPopup(`
            <div style="color:#0f172a; font-family:sans-serif; min-width:170px; padding:6px 2px;">
              <div style="font-weight:800; font-size:13px; margin-bottom:4px; display:flex; align-items:center; gap:5px;">
                📍 ${pt.locationName}
              </div>
              <div style="background:#f1f5f9; padding:6px 8px; border-radius:8px; font-size:11px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#475569;">Total Activity:</span>
                <strong style="color:#0f172a; font-size:12px;">${pt.count} hits</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b;">
                <span>Page Views: <strong>${pt.pageViews || 0}</strong></span>
                <span>Clicks: <strong>${pt.clicks || 0}</strong></span>
              </div>
            </div>
          `);

          pinMarker.on("click", () => onSelectPoint(pt));
          pinMarker.addTo(markersLayer);
        });

        if (points.length > 1) {
          const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
        }
      }

      const map = mapInstanceRef.current;
      if (map) {
        map.on("move", redrawHeatmap);
        map.on("zoom", redrawHeatmap);
        map.on("resize", redrawHeatmap);
        map.on("viewreset", redrawHeatmap);
        redrawHeatmap();
        updateMarkers();
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off("move");
        mapInstanceRef.current.off("zoom");
        mapInstanceRef.current.off("resize");
        mapInstanceRef.current.off("viewreset");
      }
    };
  }, [points]);

  // Recenter map on selected location
  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 11, {
        duration: 1.2,
      });
    }
  }, [selectedPoint]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-2xl relative z-0" />
      {/* Thermal Canvas Overlay Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[400] rounded-2xl"
      />
    </div>
  );
}

// Dynamically import to protect Next.js SSR
const LeafletHeatmap = dynamic(() => Promise.resolve(InnerLeafletHeatmap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 animate-pulse text-xs font-semibold">
      Loading Thermal Heatmap...
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
              <span className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono">
                Continuous Thermal Blur
              </span>
            </h3>
            <p className="text-xs text-slate-400">Continuous heat density representation of visitor hits and ad engagement</p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#0b0f19] border border-[#1e293b] px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
            <Globe size={14} className="text-indigo-400" />
            <span className="text-slate-400 font-medium">Active Clusters:</span>
            <span className="font-extrabold text-white">{points.length}</span>
          </div>
          <div className="bg-rose-950/30 border border-rose-800/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
            <Flame size={14} className="text-rose-400 animate-pulse" />
            <span className="text-rose-300 font-medium">Mapped Hits:</span>
            <span className="font-black text-rose-200 font-mono">{totalHits}</span>
          </div>
        </div>
      </div>

      {/* Map & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Continuous Canvas Heatmap Canvas */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#1e293b] bg-[#0b0f19] relative min-h-[400px] shadow-inner">
          <LeafletHeatmap 
            points={points} 
            selectedPoint={selectedPoint} 
            onSelectPoint={(pt) => setSelectedPoint(pt)} 
          />

          {/* Smooth Continuous Gradient Spectrum Key */}
          <div className="absolute top-3 left-3 bg-[#0b0f19]/90 backdrop-blur-md border border-[#1e293b] px-3.5 py-2 rounded-xl text-[11px] text-slate-300 z-[1000] shadow-xl pointer-events-none space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Low Density</span>
              <span className="text-rose-400 font-black">Peak Hotspot</span>
            </div>
            <div className="w-48 h-2 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-yellow-400 to-red-500 shadow-sm" />
          </div>
        </div>

        {/* Top Locations Leaderboard */}
        <div className="bg-[#0b0f19] border border-[#1e293b] p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin size={14} className="text-rose-400" />
                Top Geographic Origins
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {topLocations.length} Regions
              </span>
            </div>

            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
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

                      {/* Heat Density Gradient Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-emerald-400 via-yellow-400 to-red-500 h-full rounded-full transition-all duration-500"
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
            <span>Click any city to focus thermal view</span>
            <Navigation size={12} className="text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
