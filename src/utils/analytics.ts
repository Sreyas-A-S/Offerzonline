// Helper utilities for visitor tracking, rich device fingerprinting, GeoIP, and QR / referrer attribution

// In-memory cache for resolved IP locations to avoid redundant lookups
const ipGeoCache = new Map<string, string>();

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let visitorId = localStorage.getItem("offerz_visitor_id");

    if (!visitorId) {
      // Check cookies as backup
      const match = document.cookie.match(/(?:^|; )offerz_visitor_id=([^;]*)/);
      if (match && match[1]) {
        visitorId = decodeURIComponent(match[1]);
      }
    }

    if (!visitorId) {
      // Generate secure unique visitor ID
      const randomSegment = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID().replace(/-/g, "").substring(0, 16)
        : Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      
      visitorId = `vid_${Date.now().toString(36)}_${randomSegment}`;
    }

    // Persist in localStorage
    localStorage.setItem("offerz_visitor_id", visitorId);

    // Persist in cookie (1 year lifespan, Lax SameSite)
    document.cookie = `offerz_visitor_id=${encodeURIComponent(visitorId)}; path=/; max-age=31536000; SameSite=Lax`;

    return visitorId;
  } catch {
    return `vid_${Date.now().toString(36)}`;
  }
}

/**
 * Detects traffic source including URL campaigns (e.g. QR codes, UTMs, referral tags)
 */
export function getTrafficSource(): string {
  if (typeof window === "undefined") return "Direct";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmCampaign = urlParams.get("utm_campaign");
    const refParam = urlParams.get("ref");
    const qrParam = urlParams.get("qr") || urlParams.get("qrcode");
    const srcParam = urlParams.get("src");

    // QR Code parameter detection
    if (qrParam || (refParam && refParam.toLowerCase().includes("qr")) || (utmSource && utmSource.toLowerCase().includes("qr"))) {
      const qrTag = qrParam || refParam || utmCampaign || utmSource || "Poster";
      const cleanTag = qrTag.replace(/^qr_?|^qrcode_?/i, "").replace(/_/g, " ").trim();
      const formatted = cleanTag ? `QR Code: ${cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1)}` : "QR Code (Poster)";
      
      // Save campaign attribution in session
      sessionStorage.setItem("offerz_traffic_source", formatted);
      return formatted;
    }

    // UTM Campaign attribution
    if (utmSource) {
      const srcName = utmCampaign ? `${utmSource} (${utmCampaign})` : utmSource;
      sessionStorage.setItem("offerz_traffic_source", srcName);
      return srcName;
    }

    if (refParam || srcParam) {
      const tag = (refParam || srcParam)!.replace(/_/g, " ");
      sessionStorage.setItem("offerz_traffic_source", tag);
      return tag;
    }

    // Check stored session source
    const stored = sessionStorage.getItem("offerz_traffic_source");
    if (stored) return stored;

    // Fall back to document.referrer
    return cleanReferrer(document.referrer);
  } catch {
    return cleanReferrer(document.referrer);
  }
}

export function cleanReferrer(rawReferrer?: string): string {
  if (!rawReferrer || typeof rawReferrer !== "string") return "Direct";
  const trimmed = rawReferrer.trim();
  if (!trimmed || trimmed === "Direct" || trimmed === "Direct / Bookmark") return "Direct";

  // Handle android-app:// and app package referrers
  if (trimmed.startsWith("android-app://") || trimmed.includes("com.google.android") || trimmed.includes("android.")) {
    const pkg = trimmed.replace("android-app://", "").replace(/\/.*$/, "").toLowerCase();
    
    if (pkg.includes("googlequicksearchbox")) return "Google App (Android)";
    if (pkg.includes("chrome")) return "Google Chrome (Android)";
    if (pkg.includes("gm") || pkg.includes("gmail")) return "Gmail App";
    if (pkg.includes("instagram")) return "Instagram App";
    if (pkg.includes("facebook") || pkg.includes("katana")) return "Facebook App";
    if (pkg.includes("orca")) return "Messenger App";
    if (pkg.includes("whatsapp")) return "WhatsApp App";
    if (pkg.includes("twitter") || pkg.includes("x.com")) return "X (Twitter) App";
    if (pkg.includes("telegram")) return "Telegram App";
    if (pkg.includes("linkedin")) return "LinkedIn App";
    if (pkg.includes("reddit")) return "Reddit App";
    if (pkg.includes("pinterest")) return "Pinterest App";
    if (pkg.includes("snapchat")) return "Snapchat App";
    if (pkg.includes("sbrowser") || pkg.includes("sec.android")) return "Samsung Internet App";
    if (pkg.includes("bing")) return "Bing Search App";
    if (pkg.includes("duckduckgo")) return "DuckDuckGo App";

    // Extract last segment of package name as fallback readable name
    const parts = pkg.split(".");
    const appName = parts[parts.length - 1];
    return appName ? `${appName.charAt(0).toUpperCase() + appName.slice(1)} App (Android)` : "Android App";
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    let host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host.includes("google.")) return "Google";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("facebook.") || host.includes("fb.me") || host.includes("m.facebook.")) return "Facebook";
    if (host.includes("twitter.") || host.includes("t.co") || host.includes("x.com")) return "X (Twitter)";
    if (host.includes("youtube.") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("pinterest.")) return "Pinterest";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("reddit.")) return "Reddit";
    if (host.includes("tiktok.")) return "TikTok";
    if (host.includes("whatsapp.") || host.includes("wa.me")) return "WhatsApp";

    return host || "Direct";
  } catch {
    return trimmed.length > 50 ? trimmed.substring(0, 50) : trimmed;
  }
}

/**
 * Parses user agent string to extract detailed Device Brand/Model, OS, and Browser (including In-App)
 */
export function parseUserAgentDetails(ua: string): { 
  device: string; 
  browser: string; 
  os: string;
  isMobile: boolean;
  rawDevice: string;
} {
  if (!ua) {
    return { device: "Desktop", browser: "Unknown Browser", os: "Unknown OS", isMobile: false, rawDevice: "Generic Device" };
  }

  const isTablet = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const isMobile = !isTablet && /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);
  
  // OS & Device Model Detection
  let os = "Desktop OS";
  let deviceName = isTablet ? "Tablet" : isMobile ? "Mobile Device" : "Desktop PC";

  if (/iphone/i.test(ua)) {
    os = "iOS";
    deviceName = "Apple iPhone";
  } else if (/ipad/i.test(ua)) {
    os = "iPadOS";
    deviceName = "Apple iPad";
  } else if (/android/i.test(ua)) {
    os = "Android";
    if (/samsung|sm-[a-z0-9]+/i.test(ua)) deviceName = "Samsung Galaxy";
    else if (/redmi|xiaomi|mi [a-z0-9]+/i.test(ua)) deviceName = "Xiaomi / Redmi";
    else if (/oneplus/i.test(ua)) deviceName = "OnePlus";
    else if (/pixel/i.test(ua)) deviceName = "Google Pixel";
    else if (/vivo/i.test(ua)) deviceName = "Vivo";
    else if (/oppo|cph[0-9]+/i.test(ua)) deviceName = "Oppo";
    else if (/realme/i.test(ua)) deviceName = "Realme";
    else deviceName = "Android Device";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
    deviceName = "Apple Mac";
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows 10/11";
    deviceName = "Windows PC";
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
    deviceName = "Windows PC";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
    deviceName = "Linux PC";
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS";
    deviceName = "Chromebook";
  }

  // Browser Detection (including In-App Browsers)
  let browser = "Browser";
  if (/instagram/i.test(ua)) browser = "Instagram App";
  else if (/fban|fbav/i.test(ua)) browser = "Facebook App";
  else if (/musical_ly|bytedanceweb/i.test(ua)) browser = "TikTok App";
  else if (/micromessenger/i.test(ua)) browser = "WeChat";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/ucbrowser/i.test(ua)) browser = "UC Browser";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  return {
    device: deviceName,
    browser,
    os,
    isMobile: isMobile || isTablet,
    rawDevice: `${deviceName} • ${browser} (${os})`,
  };
}

/**
 * Formats any raw location string or serialized JSON into a clean human-readable city/area name
 */
export function formatLocationName(rawLocation?: string | null): string {
  if (!rawLocation || typeof rawLocation !== "string") return "Unknown Location";
  const trimmed = rawLocation.trim();
  if (!trimmed || trimmed === "Unknown" || trimmed === "Unknown Location" || trimmed === "null" || trimmed === "undefined") {
    return "Unknown Location";
  }

  // Handle JSON serialized location objects (e.g. {"name":"Kanayannur","lat":9.97,"lng":76.28})
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        const loc = parsed.name || parsed.city || parsed.area || parsed.location || parsed.address;
        if (loc && typeof loc === "string" && loc.trim() !== "" && loc !== "Current Location") {
          return loc.trim();
        }
      }
    } catch {
      // Fallback
    }
  }

  // Strip extraneous quotes or brackets
  const cleaned = trimmed.replace(/^["']|["']$/g, "").trim();
  return cleaned || "Unknown Location";
}

/**
 * Gets clean user location from localStorage on the client
 */
export function getStoredLocationName(): string {
  if (typeof window === "undefined") return "Unknown";
  try {
    const raw = localStorage.getItem("offerz_user_location");
    if (!raw) return "Unknown";
    const formatted = formatLocationName(raw);
    return formatted === "Unknown Location" ? "Unknown" : formatted;
  } catch {
    return "Unknown";
  }
}

/**
 * Extracts and sanitizes clean client IP (handles IPv4, IPv6, and stripped prefixes)
 */
export function extractClientIp(headers: Headers): string {
  const raw =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("true-client-ip") ||
    "127.0.0.1";

  // Clean IPv4-mapped IPv6 (e.g. ::ffff:157.51.240.205 -> 157.51.240.205)
  if (raw.startsWith("::ffff:")) {
    return raw.substring(7);
  }

  return raw.trim();
}

/**
 * Server-side location resolver using Cloudflare/Vercel headers or fast IP Geo lookup
 */
export async function resolveLocationFromHeadersAndIp(
  headers: Headers, 
  ip: string, 
  clientProvidedLocation?: string
): Promise<string> {
  // If client GPS reverse geocoded location is already provided, format and use it
  if (clientProvidedLocation) {
    const cleanClientLoc = formatLocationName(clientProvidedLocation);
    if (cleanClientLoc !== "Unknown Location") {
      return cleanClientLoc;
    }
  }

  // 1. Cloudflare CDN Geo headers
  const cfCity = headers.get("cf-ipcity");
  const cfRegion = headers.get("cf-region") || headers.get("cf-region-code");
  const cfCountry = headers.get("cf-ipcountry");
  if (cfCity && cfCountry) {
    return cfRegion ? `${cfCity}, ${cfRegion}, ${cfCountry}` : `${cfCity}, ${cfCountry}`;
  }
  if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
    return cfCountry;
  }

  // 2. Vercel Geo headers
  const vercelCity = headers.get("x-vercel-ip-city");
  const vercelRegion = headers.get("x-vercel-ip-country-region");
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCity && vercelCountry) {
    return vercelRegion ? `${vercelCity}, ${vercelRegion}, ${vercelCountry}` : `${vercelCity}, ${vercelCountry}`;
  }

  // 3. Check memory cache
  if (ipGeoCache.has(ip)) {
    return ipGeoCache.get(ip)!;
  }

  // 4. Fallback GeoIP lookup for public IPs (skipping localhost/private)
  const isPrivateIp = 
    !ip || 
    ip === "127.0.0.1" || 
    ip === "::1" || 
    ip === "unknown" || 
    ip.startsWith("192.168.") || 
    ip.startsWith("10.") || 
    ip.startsWith("172.16.");

  if (!isPrivateIp) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s fast timeout

      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,countryCode`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data && data.status === "success") {
        const parts = [data.city, data.regionName, data.countryCode].filter(Boolean);
        const resolved = parts.join(", ");
        if (resolved) {
          ipGeoCache.set(ip, resolved);
          return resolved;
        }
      }
    } catch {
      // Graceful fallback on network timeout
    }
  }

  return "Unknown Location";
}

/**
 * Pre-mapped high-precision coordinates for common locations & cities
 */
export const KNOWN_LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Kerala Cities & Districts
  "kanayannur": { lat: 9.9700, lng: 76.3200 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "ernakulam": { lat: 9.9816, lng: 76.2999 },
  "kakkanad": { lat: 10.0159, lng: 76.3419 },
  "aluva": { lat: 10.1076, lng: 76.3516 },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "trivandrum": { lat: 8.5241, lng: 76.9366 },
  "kozhikode": { lat: 11.2588, lng: 75.7804 },
  "calicut": { lat: 11.2588, lng: 75.7804 },
  "thrissur": { lat: 10.5276, lng: 76.2144 },
  "malappuram": { lat: 11.0510, lng: 76.0711 },
  "kannur": { lat: 11.8745, lng: 75.3704 },
  "kollam": { lat: 8.8932, lng: 76.6141 },
  "palakkad": { lat: 10.7867, lng: 76.6548 },
  "kottayam": { lat: 9.5916, lng: 76.5222 },
  "alappuzha": { lat: 9.4981, lng: 76.3388 },
  "alleppey": { lat: 9.4981, lng: 76.3388 },
  "kasaragod": { lat: 12.4996, lng: 74.9869 },
  "wayanad": { lat: 11.6854, lng: 76.1320 },
  "idukki": { lat: 9.8494, lng: 76.9734 },
  "pathanamthitta": { lat: 9.2648, lng: 76.7870 },
  "kerala": { lat: 10.8505, lng: 76.2711 },

  // Major Indian Cities
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "goa": { lat: 15.2993, lng: 74.1240 },
  "panaji": { lat: 15.4909, lng: 73.8278 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "madurai": { lat: 9.9252, lng: 78.1198 },
  "mangalore": { lat: 12.9141, lng: 74.8560 },
  "mysuru": { lat: 12.2958, lng: 76.6394 },
  "india": { lat: 20.5937, lng: 78.9629 },

  // International Hubs
  "dubai": { lat: 25.2048, lng: 55.2708 },
  "abu dhabi": { lat: 24.4539, lng: 54.3773 },
  "sharjah": { lat: 25.3463, lng: 55.4209 },
  "doha": { lat: 25.2854, lng: 51.5310 },
  "riyadh": { lat: 24.7136, lng: 46.6753 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.0060 },
};

/**
 * Returns accurate { lat, lng } coordinates for a given location string
 */
export function getCoordinatesForLocation(locationName?: string | null): { lat: number; lng: number } {
  if (!locationName || typeof locationName !== "string") {
    return { lat: 9.9312, lng: 76.2673 }; // Default Kochi center
  }

  // Handle JSON serialized object with lat/lng
  if (locationName.includes('"lat"') && locationName.includes('"lng"')) {
    try {
      const parsed = JSON.parse(locationName);
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return { lat: parsed.lat, lng: parsed.lng };
      }
    } catch {}
  }

  const normalized = locationName.toLowerCase();
  for (const [cityKey, coords] of Object.entries(KNOWN_LOCATION_COORDINATES)) {
    if (normalized.includes(cityKey)) {
      return coords;
    }
  }

  // Default central Kerala / Kochi coordinates
  return { lat: 9.9312, lng: 76.2673 };
}

