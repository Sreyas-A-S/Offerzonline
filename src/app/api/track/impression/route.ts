import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId, referrer, userLocation } = body;

    if (!adId) {
      return NextResponse.json({ error: "adId required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    try {
      const client = await pool.connect();
      try {
        // Verify if ad exists in DB to prevent FK violation with mock ads
        const adCheck = await client.query("SELECT id FROM ads WHERE id = $1", [adId]);
        if (adCheck.rows.length > 0) {
          await client.query(
            `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip, user_location_name) VALUES ($1, 'impression', $2, $3, $4)`,
            [adId, referrer || "direct", ip, userLocation || "Unknown"]
          );
        }
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
