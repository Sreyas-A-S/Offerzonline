// Helper utilities for visitor tracking, device fingerprinting, and referrer sanitization

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

export function cleanReferrer(rawReferrer?: string): string {
  if (!rawReferrer || typeof rawReferrer !== "string") return "Direct";
  const trimmed = rawReferrer.trim();
  if (!trimmed || trimmed === "Direct" || trimmed === "Direct / Bookmark") return "Direct";

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    let host = url.hostname.toLowerCase().replace(/^www\./, "");

    // Common search engine and social media normalizations
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

export function parseUserAgentDetails(ua: string): { device: string; browser: string; os: string } {
  if (!ua) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);
  const isTablet = /tablet|ipad/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return { device, browser, os };
}
