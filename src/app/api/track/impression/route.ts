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

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip, user_location_name) VALUES ($1, 'impression', $2, $3, $4)`,
        [adId, referrer || "direct", ip, userLocation || "Unknown"]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Impression logging error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
