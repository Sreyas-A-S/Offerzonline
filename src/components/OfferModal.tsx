"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, X, Share2, Check, Phone, Map, ChevronDown, ChevronUp, Store } from "lucide-react";

interface OfferModalProps {
  ad: any;
  onClose: () => void;
}

export function OfferModal({ ad, onClose }: OfferModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fullscreenMediaOpen, setFullscreenMediaOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const mediaUrls = ad && ad.media_url ? ad.media_url.split(",") : [];

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const getOptimizedUrl = (url: string) => {
    if (url.includes("images.unsplash.com") && !url.includes("w=")) {
      return `${url}${url.includes("?") ? "&" : "?"}auto=format&fit=crop&w=1200&q=85`;
    }
    return url;
  };

  const hasValidCoords = Boolean(
    ad &&
    ad.latitude !== null &&
    ad.longitude !== null &&
    ad.latitude !== undefined &&
    ad.longitude !== undefined &&
    String(ad.latitude).trim() !== "" &&
    String(ad.longitude).trim() !== "" &&
    !isNaN(parseFloat(ad.latitude)) &&
    !isNaN(parseFloat(ad.longitude)) &&
    parseFloat(ad.latitude) !== 0 &&
    parseFloat(ad.longitude) !== 0
  );

  // Load user coordinates from localStorage on mount
  useEffect(() => {
    if (!ad || !hasValidCoords) {
      setMapLoading(false);
      return;
    }
    setMapLoading(true);
    const saved = localStorage.getItem("offerz_user_location");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat !== undefined && parsed.lng !== undefined) {
          setUserCoords({ lat: parsed.lat, lng: parsed.lng });
        }
      } catch (e) {
        console.error("Error reading location for route:", e);
      }
    }
  }, [ad, hasValidCoords]);

  const getMapEmbedUrl = () => {
    if (!hasValidCoords) return "";
    const adLat = parseFloat(ad.latitude);
    const adLng = parseFloat(ad.longitude);
    if (userCoords && userCoords.lat && userCoords.lng) {
      return `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${adLat},${adLng}&output=embed`;
    }
    return `https://maps.google.com/maps?q=${adLat},${adLng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  // Lock/unlock body scroll when modal status changes
  useEffect(() => {
    if (ad) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [ad]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!ad) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreenMediaOpen) {
          setFullscreenMediaOpen(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ad, fullscreenMediaOpen]);

  if (!ad) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleShare = async () => {
    const shareId = ad.uuid || ad.id;
    const shareUrl = `${window.location.origin}/?ad=${shareId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Check out this offer on Offerzonline: ${ad.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  // Click outside to close handler (backdrop areas)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 bg-slate-955/75 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        ref={modalContentRef}
        className={`bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100 transition-all duration-300 flex flex-col justify-between ${
          isClosing ? "scale-95 translate-y-4 opacity-0" : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Top Control Bar Floating Buttons */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
            title="Share Offer"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95"
            title="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Toast Popup */}
        {showCopiedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-2xl border border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Check size={14} className="text-emerald-400" />
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Two Column Layout Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[82vh] overflow-y-auto scrollbar-none">
          {/* Left Column: Visuals & Map */}
          <div className="flex flex-col border-r border-slate-100 md:max-h-[82vh] md:overflow-y-auto scrollbar-none">
            {/* Hero Banner Container - Full natural size display */}
            <div className="relative w-full min-h-[300px] max-h-[550px] bg-slate-950/90 overflow-hidden group flex items-center justify-center p-2">
              {mediaUrls.length > 0 && (() => {
                const currentUrl = mediaUrls[activeMediaIndex];
                const isVideo = currentUrl.split("?")[0].split(".").pop()?.toLowerCase() === "mp4" || (ad.media_type === "video" && !currentUrl.includes("."));
                return isVideo ? (
                  <video
                    key={currentUrl}
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onClick={() => setFullscreenMediaOpen(true)}
                    className="w-full h-auto max-h-[520px] object-contain cursor-pointer rounded-xl"
                  >
                    <source src={currentUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    key={currentUrl}
                    src={getOptimizedUrl(currentUrl)}
                    alt={ad.title}
                    onClick={() => setFullscreenMediaOpen(true)}
                    className="w-full h-auto max-h-[520px] object-contain group-hover:scale-[1.01] transition-transform duration-500 cursor-pointer rounded-xl"
                  />
                );
              })()}

              {/* Subtle Gradient Overlay for Title Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

              {/* Navigation Arrows for Multiple Media Items */}
              {mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-md cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center text-lg font-black shadow-md cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                  >
                    ›
                  </button>
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 right-4 z-20 flex gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {mediaUrls.map((_: string, idx: number) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activeMediaIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Google Maps Embed Route Map (Rendered ONLY if ad has valid GPS coordinates) */}
            {hasValidCoords && (
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Map size={12} className="text-indigo-500" /> Route & Location Pin
                  </h4>
                  <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Google Maps
                  </span>
                </div>
                <div className="h-48 w-full rounded-xl overflow-hidden shadow-md border border-slate-150 relative z-0">
                  {mapLoading && (
                    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-2 z-10">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest animate-pulse">Loading Map Route...</span>
                    </div>
                  )}
                  <iframe
                    title="Google Maps Route"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    onLoad={() => setMapLoading(false)}
                    src={getMapEmbedUrl()}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details & Action */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between md:max-h-[82vh] md:overflow-y-auto scrollbar-none bg-[#fafbfe]/30">
            <div className="space-y-6">
              {/* Category / Badge Pills */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
                  {ad.category_name || "Featured Offer"}
                </span>
                {hasValidCoords && ad.distance_km !== undefined && (
                  <span className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <MapPin size={10} className="text-indigo-400" />
                    {ad.distance_km} km away
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                {ad.title}
              </h2>

              {/* Pricing & Discounts callout */}
              {(ad.original_price || ad.originalPrice || ad.promo_price || ad.promoPrice || ad.discount_value || ad.discountValue) && (
                <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-455 uppercase tracking-wider block">Special Promo Offer</span>
                    <div className="flex items-baseline gap-2">
                      {(ad.promo_price || ad.promoPrice) && (
                        <span className="text-2xl font-black text-indigo-650">
                          {ad.promo_price || ad.promoPrice}
                        </span>
                      )}
                      {(ad.original_price || ad.originalPrice) && (
                        <span className="text-xs sm:text-sm font-bold text-slate-400 line-through">
                          {ad.original_price || ad.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  {(ad.discount_value || ad.discountValue) && (
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-black uppercase px-3 py-2 rounded-2xl shadow-md border border-white/10 animate-pulse-subtle">
                      {ad.discount_value || ad.discountValue}
                    </span>
                  )}
                </div>
              )}

              {/* Description Details */}
              {ad.description && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Offer Details</h4>
                  <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
                    {ad.description}
                  </p>
                </div>
              )}

              {/* Merchant Details */}
              {(ad.store_name || ad.storeName || ad.store_address || ad.storeAddress || ad.store_phone || ad.storePhone) && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5 shadow-xs">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">About the Merchant</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {(ad.store_logo || ad.storeLogo) ? (
                        <img src={ad.store_logo || ad.storeLogo} alt={ad.store_name || ad.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <Store size={20} className="text-indigo-500" />
                      )}
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <span className="font-extrabold text-slate-900 text-sm block truncate">
                        {ad.store_name || ad.storeName || "Partner Store"}
                      </span>
                      
                      {(ad.store_address || ad.storeAddress) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ad.store_address || ad.storeAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-650 hover:text-indigo-750 hover:underline flex items-start gap-1 font-semibold"
                        >
                          <MapPin size={13} className="shrink-0 mt-0.5 text-indigo-500" />
                          <span className="leading-tight">{ad.store_address || ad.storeAddress}</span>
                        </a>
                      )}

                      {(ad.store_phone || ad.storePhone) && (
                        <a
                          href={`tel:${ad.store_phone || ad.storePhone}`}
                          className="text-xs text-slate-600 hover:text-indigo-655 flex items-center gap-1 font-semibold"
                        >
                          <Phone size={13} className="text-indigo-400 shrink-0" />
                          <span>{ad.store_phone || ad.storePhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Expiration Details */}
              {ad.expires_at && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-2.5">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    ⏳ Valid Until: {new Date(ad.expires_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Terms & Conditions Accordion */}
              {(ad.terms || ad.terms) && (
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition cursor-pointer select-none"
                  >
                    <span>Offer Terms & Fine Print</span>
                    {showTerms ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>
                  {showTerms && (
                    <div className="px-4 pb-4 pt-1.5 text-xs text-slate-500 leading-relaxed font-medium border-t border-slate-50 bg-slate-50/50">
                      {ad.terms || ad.terms}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Sticky Bottom Bar */}
            <div className="pt-4 border-t border-slate-100 bg-white md:bg-transparent">
              <a
                href={`/api/track/click?ad_id=${ad.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
              >
                <span>Claim & View Offer</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Media Lightbox Modal */}
      {fullscreenMediaOpen && (
        <div
          onClick={() => setFullscreenMediaOpen(false)}
          className="fixed inset-0 z-55 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            onClick={() => setFullscreenMediaOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition shadow-md border border-white/10 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div 
            className="relative max-w-5xl w-full h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaUrls.length > 0 && (() => {
              const currentUrl = mediaUrls[activeMediaIndex];
              const isVideo = currentUrl.split("?")[0].split(".").pop()?.toLowerCase() === "mp4" || (ad.media_type === "video" && !currentUrl.includes("."));
              return isVideo ? (
                <video
                  key={currentUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
                >
                  <source src={currentUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  key={currentUrl}
                  src={getOptimizedUrl(currentUrl)}
                  alt={ad.title}
                  className="max-w-full max-h-full rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
                />
              );
            })()}

            {/* Lightbox Navigation Arrows */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl font-black shadow-lg cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl font-black shadow-lg cursor-pointer transition select-none backdrop-blur-md border border-white/10"
                >
                  ›
                </button>
                {/* Dots indicator */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {mediaUrls.map((_: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === activeMediaIndex ? "bg-white w-6" : "bg-white/40 w-2"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
