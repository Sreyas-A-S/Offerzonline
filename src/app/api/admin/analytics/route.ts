import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { cleanReferrer, formatLocationName } from "@/utils/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adIdFilter = searchParams.get("ad_id");
    const timeframe = searchParams.get("timeframe") || "24h"; // default to 24h (Today / Current Date)
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const categoryId = searchParams.get("category_id");
    const referrerFilter = searchParams.get("referrer");

    const client = await pool.connect();
    try {
      // Build dynamic WHERE clauses for analytics_logs
      const logConditions: string[] = [];
      const logParams: any[] = [];
      let paramIdx = 1;

      if (timeframe === "24h") {
        logConditions.push(`l.timestamp >= NOW() - INTERVAL '24 hours'`);
      } else if (timeframe === "7d") {
        logConditions.push(`l.timestamp >= NOW() - INTERVAL '7 days'`);
      } else if (timeframe === "30d") {
        logConditions.push(`l.timestamp >= NOW() - INTERVAL '30 days'`);
      } else if (timeframe === "custom") {
        if (startDate) {
          logConditions.push(`l.timestamp >= $${paramIdx++}::timestamp`);
          logParams.push(`${startDate} 00:00:00`);
        }
        if (endDate) {
          logConditions.push(`l.timestamp <= $${paramIdx++}::timestamp`);
          logParams.push(`${endDate} 23:59:59`);
        }
      }

      if (adIdFilter && adIdFilter !== "all") {
        logConditions.push(`l.ad_id = $${paramIdx++}`);
        logParams.push(parseInt(adIdFilter, 10));
      }

      if (categoryId && categoryId !== "all") {
        logConditions.push(`EXISTS (SELECT 1 FROM ads a_cat WHERE a_cat.id = l.ad_id AND a_cat.category_id = $${paramIdx++})`);
        logParams.push(parseInt(categoryId, 10));
      }

      if (referrerFilter && referrerFilter !== "all") {
        if (referrerFilter === "Direct" || referrerFilter === "Direct / Bookmark") {
          logConditions.push(`(l.referrer_domain IS NULL OR l.referrer_domain = '' OR l.referrer_domain ILIKE '%direct%')`);
        } else {
          logConditions.push(`l.referrer_domain ILIKE $${paramIdx++}`);
          logParams.push(`%${referrerFilter}%`);
        }
      }

      const logWhereSql = logConditions.length > 0 ? `WHERE ${logConditions.join(" AND ")}` : "";

      // 1. Total Public Page Views
      const pageViewsConds = [...logConditions.filter(c => !c.includes("event_type")), `l.event_type = 'page_view'`];
      const pageViewsRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs l ${pageViewsConds.length > 0 ? `WHERE ${pageViewsConds.join(" AND ")}` : ""}`,
        logParams
      );
      const totalPageViews = pageViewsRes.rows[0]?.count || 0;

      // 2. Total Unique Visitors
      const uniqueVisitorsRes = await client.query(
        `SELECT COUNT(DISTINCT COALESCE(l.visitor_id, l.user_ip))::int as count FROM analytics_logs l ${logWhereSql}`,
        logParams
      );
      const totalUniqueVisitors = uniqueVisitorsRes.rows[0]?.count || 0;

      // 3. Ad Impressions & Clicks Total
      const impressionsConds = [...logConditions.filter(c => !c.includes("event_type")), `l.event_type = 'impression'`];
      const adImpressionsRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs l ${impressionsConds.length > 0 ? `WHERE ${impressionsConds.join(" AND ")}` : ""}`,
        logParams
      );
      const totalAdImpressions = adImpressionsRes.rows[0]?.count || 0;

      const clicksConds = [...logConditions.filter(c => !c.includes("event_type")), `l.event_type = 'click'`];
      const adClicksRes = await client.query(
        `SELECT COUNT(*)::int as count FROM analytics_logs l ${clicksConds.length > 0 ? `WHERE ${clicksConds.join(" AND ")}` : ""}`,
        logParams
      );
      const totalAdClicks = adClicksRes.rows[0]?.count || 0;

      // Top Referrers Breakdown
      const topReferrersRes = await client.query(
        `SELECT 
           COALESCE(NULLIF(l.referrer_domain, ''), 'Direct / Bookmark') as referrer, 
           COUNT(*)::int as count 
         FROM analytics_logs l 
         ${logWhereSql}
         GROUP BY referrer 
         ORDER BY count DESC 
         LIMIT 10`,
        logParams
      );

      // 4. Audit Log Query
      const recentLogsRes = await client.query(
        `SELECT 
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
         ${logWhereSql}
         ORDER BY l.timestamp DESC
         LIMIT 100`,
        logParams
      );

      // 5. Per Ad Analytics Breakdown Table (Filtered by Category if set)
      let adBreakdownWhere = "";
      const adBreakdownParams: any[] = [];
      let adParamIdx = 1;

      if (categoryId && categoryId !== "all") {
        adBreakdownWhere = `WHERE a.category_id = $${adParamIdx++}`;
        adBreakdownParams.push(parseInt(categoryId, 10));
      }

      // Time condition snippet for ad breakdown subqueries
      let timeSnippet = "";
      if (timeframe === "24h") {
        timeSnippet = "AND timestamp >= NOW() - INTERVAL '24 hours'";
      } else if (timeframe === "7d") {
        timeSnippet = "AND timestamp >= NOW() - INTERVAL '7 days'";
      } else if (timeframe === "30d") {
        timeSnippet = "AND timestamp >= NOW() - INTERVAL '30 days'";
      } else if (timeframe === "custom") {
        if (startDate && endDate) {
          timeSnippet = `AND timestamp >= '${startDate} 00:00:00' AND timestamp <= '${endDate} 23:59:59'`;
        } else if (startDate) {
          timeSnippet = `AND timestamp >= '${startDate} 00:00:00'`;
        } else if (endDate) {
          timeSnippet = `AND timestamp <= '${endDate} 23:59:59'`;
        }
      }

      const adBreakdownRes = await client.query(
        `SELECT 
           a.id as ad_id,
           a.title,
           a.is_active,
           c.name as category_name,
           (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression' ${timeSnippet}) as impressions,
           (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click' ${timeSnippet}) as clicks,
           (SELECT COUNT(DISTINCT COALESCE(visitor_id, user_ip))::int FROM analytics_logs WHERE ad_id = a.id ${timeSnippet}) as unique_users,
           COALESCE((
             SELECT COALESCE(NULLIF(referrer_domain, ''), 'Direct')
             FROM analytics_logs
             WHERE ad_id = a.id ${timeSnippet}
             GROUP BY referrer_domain
             ORDER BY COUNT(*) DESC
             LIMIT 1
           ), 'Direct') as top_referrer,
           CASE 
             WHEN (SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression' ${timeSnippet}) > 0 
             THEN ROUND(((SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click' ${timeSnippet})::numeric / (SELECT COUNT(*) FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression' ${timeSnippet})::numeric) * 100, 2)
             ELSE 0 
           END as ctr
         FROM ads a
         LEFT JOIN categories c ON a.category_id = c.id
         ${adBreakdownWhere}
         ORDER BY impressions DESC`,
        adBreakdownParams
      );

      // Available Referrers for dropdown
      const allReferrersRes = await client.query(`
        SELECT DISTINCT COALESCE(NULLIF(referrer_domain, ''), 'Direct') as referrer
        FROM analytics_logs
        ORDER BY referrer ASC
      `);

      return NextResponse.json({
        summary: {
          totalPageViews,
          totalUniqueVisitors,
          totalAdImpressions,
          totalAdClicks,
        },
        topReferrers: topReferrersRes.rows.map((r) => ({
          ...r,
          referrer: cleanReferrer(r.referrer),
        })),
        recentLogs: recentLogsRes.rows.map((l) => ({
          ...l,
          referrer_domain: cleanReferrer(l.referrer_domain),
          user_location_name: formatLocationName(l.user_location_name),
        })),
        adBreakdowns: adBreakdownRes.rows.map((b) => ({
          ...b,
          top_referrer: cleanReferrer(b.top_referrer),
        })),
        availableReferrers: Array.from(new Set(allReferrersRes.rows.map((r) => cleanReferrer(r.referrer)))),
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
      adBreakdowns: [],
      availableReferrers: [],
    });
  }
}
