import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // 1. Total Public Page Views
      const pageViewsRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs WHERE event_type = 'page_view'`
      );
      const totalPageViews = pageViewsRes.rows[0]?.count || 0;

      // 2. Total Unique Visitors (distinct visitor_id or distinct user_ip)
      const uniqueVisitorsRes = await client.query(
        `SELECT COUNT(DISTINCT COALESCE(visitor_id, user_ip))::int as count FROM analytics_logs`
      );
      const totalUniqueVisitors = uniqueVisitorsRes.rows[0]?.count || 0;

      // 3. Ad Impressions & Clicks Total
      const adImpressionsRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs WHERE event_type = 'impression'`
      );
      const totalAdImpressions = adImpressionsRes.rows[0]?.count || 0;

      const adClicksRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs WHERE event_type = 'click'`
      );
      const totalAdClicks = adClicksRes.rows[0]?.count || 0;

      // 4. Recent Detailed Activity Logs (IP, Location, User Agent, Event Type, Timestamp)
      const recentLogsRes = await client.query(
        `SELECT 
           l.id,
           l.event_type,
           l.page_path,
           l.user_ip,
           l.user_agent,
           l.user_location_name,
           l.referrer_domain,
           l.timestamp,
           a.title as ad_title
         FROM analytics_logs l
         LEFT JOIN ads a ON l.ad_id = a.id
         ORDER BY l.timestamp DESC
         LIMIT 50`
      );

      return NextResponse.json({
        summary: {
          totalPageViews,
          totalUniqueVisitors,
          totalAdImpressions,
          totalAdClicks,
        },
        recentLogs: recentLogsRes.rows,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({
      summary: {
        totalPageViews: 0,
        totalUniqueVisitors: 0,
        totalAdImpressions: 0,
        totalAdClicks: 0,
      },
      recentLogs: [],
    });
  }
}
