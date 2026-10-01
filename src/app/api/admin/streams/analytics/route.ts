import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { isAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const streamId = searchParams.get("stream_id");

  try {
    const client = await pool.connect();
    try {
      // 1. Overall stats
      const whereClause = streamId ? `WHERE stream_id = ${parseInt(streamId, 10)}` : "";

      const statsRes = await client.query(`
        SELECT 
          COUNT(CASE WHEN event_type = 'load' THEN 1 END)::int as total_loads,
          COUNT(CASE WHEN event_type = 'play' THEN 1 END)::int as total_plays,
          COUNT(CASE WHEN event_type = 'progress_25' THEN 1 END)::int as reaches_25,
          COUNT(CASE WHEN event_type = 'progress_50' THEN 1 END)::int as reaches_50,
          COUNT(CASE WHEN event_type = 'progress_75' THEN 1 END)::int as reaches_75,
          COUNT(CASE WHEN event_type = 'complete' THEN 1 END)::int as total_completes,
          COUNT(CASE WHEN event_type = 'click_cta' THEN 1 END)::int as cta_clicks,
          COUNT(CASE WHEN event_type = 'click_whatsapp' THEN 1 END)::int as whatsapp_clicks,
          COALESCE(SUM(watch_time_seconds), 0)::numeric as total_watch_time_seconds,
          COUNT(DISTINCT visitor_id)::int as unique_viewers
        FROM stream_analytics
        ${whereClause}
      `);

      // 2. Daily timeline (last 14 days)
      const timelineRes = await client.query(`
        SELECT 
          TO_CHAR(timestamp, 'YYYY-MM-DD') as date,
          COUNT(CASE WHEN event_type = 'play' THEN 1 END)::int as plays,
          COUNT(CASE WHEN event_type = 'complete' THEN 1 END)::int as completes,
          COUNT(CASE WHEN event_type IN ('click_cta', 'click_whatsapp') THEN 1 END)::int as clicks
        FROM stream_analytics
        ${whereClause ? whereClause + " AND" : "WHERE"} timestamp >= NOW() - INTERVAL '14 days'
        GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
        ORDER BY date ASC
      `);

      // 3. Device breakdown
      const devicesRes = await client.query(`
        SELECT 
          COALESCE(device_type, 'desktop') as device,
          COUNT(*)::int as count
        FROM stream_analytics
        ${whereClause ? whereClause + " AND" : "WHERE"} event_type = 'play'
        GROUP BY device_type
        ORDER BY count DESC
      `);

      // 4. Top Referrers
      const referrersRes = await client.query(`
        SELECT 
          COALESCE(NULLIF(referrer_domain, ''), 'Direct / Native') as domain,
          COUNT(*)::int as count
        FROM stream_analytics
        ${whereClause ? whereClause + " AND" : "WHERE"} event_type = 'play'
        GROUP BY domain
        ORDER BY count DESC
        LIMIT 6
      `);

      // 5. Top Locations
      const locationsRes = await client.query(`
        SELECT 
          COALESCE(NULLIF(user_location_name, ''), 'Unknown') as location,
          COUNT(*)::int as count
        FROM stream_analytics
        ${whereClause ? whereClause + " AND" : "WHERE"} event_type = 'play'
        GROUP BY location
        ORDER BY count DESC
        LIMIT 6
      `);

      // 6. Recent event logs
      const recentLogs = await client.query(`
        SELECT 
          sa.*,
          s.title as stream_title
        FROM stream_analytics sa
        LEFT JOIN streams s ON sa.stream_id = s.id
        ${whereClause}
        ORDER BY sa.timestamp DESC
        LIMIT 30
      `);

      return NextResponse.json({
        stats: statsRes.rows[0],
        timeline: timelineRes.rows,
        devices: devicesRes.rows,
        referrers: referrersRes.rows,
        locations: locationsRes.rows,
        recentLogs: recentLogs.rows,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Stream analytics GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
