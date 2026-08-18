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

    try {
      const client = await pool.connect();
      try {
        // Bulk verify and insert analytics logs in a single query
        await client.query(
          `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip, user_agent, visitor_id, user_location_name)
           SELECT id, 'impression', $2, $3, $4, $5, $6
           FROM ads
           WHERE id = ANY($1::int[])`,
          [idsToLog, referrer || req.headers.get("referer") || "Direct", ip, userAgent, visitorId, userLocation || "Unknown"]
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
