import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { extractClientIp, resolveLocationFromHeadersAndIp, cleanReferrer, parseUserAgentDetails } from "@/utils/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamId, eventType, watchTimeSeconds, visitorId } = body;

    if (!streamId || !eventType) {
      return NextResponse.json({ error: "streamId and eventType are required" }, { status: 400 });
    }

    const ip = extractClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = cleanReferrer(req.headers.get("referer") || "Direct");
    const uaInfo = parseUserAgentDetails(userAgent);
    const deviceType = uaInfo.deviceType || "desktop";

    // Auto-resolve geo location
    const geoLoc = await resolveLocationFromHeadersAndIp(req.headers, ip);

    const client = await pool.connect();
    try {
      // 1. Check if stream exists, is active, and whether it is marked as demo
      const streamRes = await client.query(
        `SELECT id, is_active, COALESCE(is_demo, false) as is_demo FROM streams WHERE id = $1`,
        [parseInt(streamId, 10)]
      );

      if (streamRes.rows.length === 0) {
        return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      }

      const streamInfo = streamRes.rows[0];

      // If marked as Demo stream by admin, do NOT record stats or watch time
      if (streamInfo.is_demo) {
        return NextResponse.json({ success: true, ignored: true, message: "Demo stream stats ignored." });
      }

      // 2. Prevent spam: Deduplicate 'play' events for same visitor/IP within 1 minute
      if (eventType === "play") {
        const dup = await client.query(
          `SELECT id FROM stream_analytics 
           WHERE stream_id = $1 AND event_type = 'play' 
             AND (visitor_id = $2 OR (visitor_id IS NULL AND user_ip = $3))
             AND timestamp >= NOW() - INTERVAL '1 minute'
           LIMIT 1`,
          [streamId, visitorId || null, ip]
        );

        if (dup.rows.length === 0) {
          await client.query(
            `INSERT INTO stream_analytics (stream_id, event_type, watch_time_seconds, visitor_id, user_ip, user_agent, device_type, user_location_name, referrer_domain)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [streamId, eventType, watchTimeSeconds || 0, visitorId || null, ip, userAgent, deviceType, geoLoc, referrer]
          );

          // Increment stream views_count
          await client.query(
            `UPDATE streams SET views_count = views_count + 1 WHERE id = $1`,
            [streamId]
          );
        }
      } else {
        // Record event (progress, completion, clicks)
        await client.query(
          `INSERT INTO stream_analytics (stream_id, event_type, watch_time_seconds, visitor_id, user_ip, user_agent, device_type, user_location_name, referrer_domain)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [streamId, eventType, watchTimeSeconds || 0, visitorId || null, ip, userAgent, deviceType, geoLoc, referrer]
        );

        if (eventType === "click_cta" || eventType === "click_whatsapp") {
          await client.query(
            `UPDATE streams SET clicks_count = clicks_count + 1 WHERE id = $1`,
            [streamId]
          );
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Stream tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
