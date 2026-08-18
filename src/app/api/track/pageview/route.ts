import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { extractClientIp, resolveLocationFromHeadersAndIp } from "@/utils/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventType = "page_view", pagePath = "/", locationName, visitorId, adId } = body;

    const userIp = extractClientIp(req.headers);
    const userAgent = req.headers.get("user-agent") || "";
    const referrerDomain = body.referrer || body.referrerDomain || req.headers.get("referer") || "Direct";
    const resolvedLocation = await resolveLocationFromHeadersAndIp(req.headers, userIp, locationName);

    const client = await pool.connect();
    try {
      // Ensure analytics_logs table supports nullable ad_id and new fields
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics_logs (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
          event_type VARCHAR(50) NOT NULL,
          page_path VARCHAR(255),
          visitor_id VARCHAR(100),
          referrer_domain VARCHAR(255),
          user_ip VARCHAR(100),
          user_agent TEXT,
          user_location_name VARCHAR(255),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE analytics_logs ALTER COLUMN ad_id DROP NOT NULL;
        ALTER TABLE analytics_logs ADD COLUMN IF NOT EXISTS page_path VARCHAR(255);
        ALTER TABLE analytics_logs ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(100);
        ALTER TABLE analytics_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
      `);

      await client.query(
        `INSERT INTO analytics_logs (ad_id, event_type, page_path, visitor_id, referrer_domain, user_ip, user_agent, user_location_name) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          adId ? parseInt(adId, 10) : null,
          eventType,
          pagePath,
          visitorId || null,
          referrerDomain,
          userIp,
          userAgent,
          resolvedLocation,
        ]
      );
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
