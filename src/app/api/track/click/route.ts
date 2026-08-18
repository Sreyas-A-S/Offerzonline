import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { extractClientIp, resolveLocationFromHeadersAndIp, cleanReferrer } from "@/utils/analytics";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const adIdStr = searchParams.get("ad_id");

    if (!adIdStr) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const adId = parseInt(adIdStr, 10);
    const client = await pool.connect();

    try {
      // Real-time query to check if ad is active
      const result = await client.query(
        `SELECT id, target_url, is_active FROM ads WHERE id = $1`,
        [adId]
      );

      const ad = result.rows[0];

      if (!ad || !ad.is_active) {
        // Redirect to fallback landing page if ad is inactive or deleted
        return NextResponse.redirect(new URL("/?fallback=ad_expired", req.url), 302);
      }

      // Extract client details and clean IP (supports IPv4 & IPv6)
      const rawRef = searchParams.get("referrer") || req.headers.get("referer") || "Direct";
      const cleanRef = cleanReferrer(rawRef);
      const ip = extractClientIp(req.headers);
      const userAgent = req.headers.get("user-agent") || "";
      const visitorId = searchParams.get("visitor_id") || null;
      
      // Auto-resolve full location (city, region, country) via headers or GeoIP
      const geoLoc = await resolveLocationFromHeadersAndIp(req.headers, ip);

      // Anti-Fraud Deduplication: Check if this visitor/IP already clicked this ad within the last 5 minutes
      const dupCheck = await client.query(
        `SELECT id FROM analytics_logs 
         WHERE ad_id = $1 AND event_type = 'click' 
           AND (visitor_id = $2 OR (visitor_id IS NULL AND user_ip = $3))
           AND timestamp >= NOW() - INTERVAL '5 minutes'
         LIMIT 1`,
        [adId, visitorId, ip]
      );

      if (dupCheck.rows.length === 0) {
        // Safe to log new unique click
        await client.query(
          `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip, user_agent, visitor_id, user_location_name) 
           VALUES ($1, 'click', $2, $3, $4, $5, $6)`,
          [adId, cleanRef, ip, userAgent, visitorId, geoLoc]
        );
      }

      // 302 Redirect to target URL
      return NextResponse.redirect(ad.target_url, 302);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
