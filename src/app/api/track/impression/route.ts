import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId, adIds, referrer, userLocation } = body;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const visitorId = body.visitorId || null;
    const idsToLog: number[] = adIds ? adIds : (adId ? [adId] : []);

    if (idsToLog.length === 0) {
      return NextResponse.json({ error: "adId or adIds required" }, { status: 400 });
    }

    // Auto-resolve geo headers if client location is unknown
    const cfCity = req.headers.get("cf-ipcity");
    const cfCountry = req.headers.get("cf-ipcountry");
    const headerLoc = cfCity && cfCountry ? `${cfCity}, ${cfCountry}` : (cfCountry || null);
    const finalLocation = (!userLocation || userLocation === "Unknown") ? (headerLoc || "Unknown") : userLocation;
    const finalReferrer = referrer || req.headers.get("referer") || "Direct";

    try {
      const client = await pool.connect();
      try {
        // Bulk verify and insert analytics logs with deduplication (exclude ads logged in last 3 mins for same visitor/IP)
        await client.query(
          `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip, user_agent, visitor_id, user_location_name)
           SELECT a.id, 'impression', $2, $3, $4, $5, $6
           FROM ads a
           WHERE a.id = ANY($1::int[])
             AND NOT EXISTS (
               SELECT 1 FROM analytics_logs l
               WHERE l.ad_id = a.id AND l.event_type = 'impression'
                 AND (l.visitor_id = $5 OR (l.visitor_id IS NULL AND l.user_ip = $3))
                 AND l.timestamp >= NOW() - INTERVAL '3 minutes'
             )`,
          [idsToLog, finalReferrer, ip, userAgent, visitorId, finalLocation]
        );
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      console.warn("Analytics impression DB warning:", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Impression logging error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
