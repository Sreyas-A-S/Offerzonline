import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adIdFilter = searchParams.get("ad_id");

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

      // Top Referrers Breakdown
      const topReferrersRes = await client.query(`
        SELECT 
          COALESCE(NULLIF(referrer_domain, ''), 'Direct / Bookmark') as referrer, 
          COUNT(*)::int as count 
        FROM analytics_logs 
        GROUP BY referrer 
        ORDER BY count DESC 
        LIMIT 10
      `);

      // 4. Ad-Level Detailed Reports Query
      const adReportsQuery = adIdFilter
        ? `SELECT 
             l.id,
             l.ad_id,
             l.event_type,
             l.user_ip,
             l.user_agent,
             l.user_location_name,
             l.referrer_domain,
             l.timestamp,
             a.title as ad_title
           FROM analytics_logs l
           JOIN ads a ON l.ad_id = a.id
           WHERE l.ad_id = $1
           ORDER BY l.timestamp DESC
           LIMIT 100`
        : `SELECT 
             l.id,
             l.ad_id,
             l.event_type,
             l.user_ip,
             l.user_agent,
             l.user_location_name,
             l.referrer_domain,
             l.timestamp,
             a.title as ad_title
           FROM analytics_logs l
           LEFT JOIN ads a ON l.ad_id = a.id
           ORDER BY l.timestamp DESC
           LIMIT 50`;

      const recentLogsRes = await client.query(
        adReportsQuery,
        adIdFilter ? [parseInt(adIdFilter, 10)] : []
      );

      // 5. Per Ad Analytics Breakdown Table
      const adBreakdownRes = await client.query(`
        SELECT 
          a.id as ad_id,
          a.title,
          a.is_active,
          c.name as category_name,
          (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression') as impressions,
          (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click') as clicks,
          (SELECT COUNT(DISTINCT COALESCE(visitor_id, user_ip))::int FROM analytics_logs WHERE ad_id = a.id) as unique_users,
          CASE 
            WHEN (SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression') > 0 
            THEN ROUND(((SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click')::numeric / (SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression')::numeric) * 100, 2)
            ELSE 0 
          END as ctr
        FROM ads a
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY impressions DESC
      `);

      return NextResponse.json({
        summary: {
          totalPageViews,
          totalUniqueVisitors,
          totalAdImpressions,
          totalAdClicks,
        },
        topReferrers: topReferrersRes.rows,
        recentLogs: recentLogsRes.rows,
        adBreakdowns: adBreakdownRes.rows,
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
