import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

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

      // Log click event asynchronously
      const referrer = req.headers.get("referer") || "direct";
      const ip = req.headers.get("x-forwarded-for") || "unknown";

      client.query(
        `INSERT INTO analytics_logs (ad_id, event_type, referrer_domain, user_ip) VALUES ($1, 'click', $2, $3)`,
        [adId, referrer, ip]
      ).catch((e) => console.error("Click log error:", e));

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
