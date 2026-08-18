import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { cleanReferrer, formatLocationName, getCoordinatesForLocation } from "@/utils/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adIdFilter = searchParams.get("ad_id");
    const timeframe = searchParams.get("timeframe") || "today"; // default to today (Calendar Day in IST)
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

      if (timeframe === "today" || timeframe === "24h") {
        // Today starting from 00:00:00 IST to present moment
        logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`);
      } else if (timeframe === "yesterday") {
        // Yesterday full calendar day in IST
        logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 1`);
      } else if (timeframe === "7d") {
        logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 6`);
      } else if (timeframe === "30d") {
        logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 29`);
      } else if (timeframe === "custom") {
        if (startDate) {
          logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date >= $${paramIdx++}::date`);
          logParams.push(startDate);
        }
        if (endDate) {
          logConditions.push(`(l.timestamp AT TIME ZONE 'Asia/Kolkata')::date <= $${paramIdx++}::date`);
          logParams.push(endDate);
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
           l.page_path,
           l.visitor_id,
           l.user_ip,
           l.user_agent,
           l.user_location_name,
           l.referrer_domain,
           l.timestamp,
           a.title as ad_title,
           a.target_url as ad_target_url,
           c.name as ad_category
         FROM analytics_logs l
         LEFT JOIN ads a ON l.ad_id = a.id
         LEFT JOIN categories c ON a.category_id = c.id
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
      if (timeframe === "today" || timeframe === "24h") {
        timeSnippet = "AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date";
      } else if (timeframe === "yesterday") {
        timeSnippet = "AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 1";
      } else if (timeframe === "7d") {
        timeSnippet = "AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 6";
      } else if (timeframe === "30d") {
        timeSnippet = "AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - 29";
      } else if (timeframe === "custom") {
        if (startDate && endDate) {
          timeSnippet = `AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date >= '${startDate}'::date AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date <= '${endDate}'::date`;
        } else if (startDate) {
          timeSnippet = `AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date >= '${startDate}'::date`;
        } else if (endDate) {
          timeSnippet = `AND (timestamp AT TIME ZONE 'Asia/Kolkata')::date <= '${endDate}'::date`;
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

      // 5. Hourly Hit Distribution (00:00 to 23:00 IST)
      const hourlyRes = await client.query(`
        SELECT 
          EXTRACT(HOUR FROM l.timestamp AT TIME ZONE 'Asia/Kolkata')::int as hour,
          COUNT(*)::int as total_hits,
          COUNT(CASE WHEN l.event_type = 'page_view' THEN 1 END)::int as page_views,
          COUNT(CASE WHEN l.event_type = 'impression' THEN 1 END)::int as impressions,
          COUNT(CASE WHEN l.event_type = 'click' THEN 1 END)::int as clicks
        FROM analytics_logs l
        ${logWhereSql}
        GROUP BY hour
        ORDER BY hour ASC;
      `, logParams);

      const hourlyMap = new Map<number, any>();
      hourlyRes.rows.forEach((r) => hourlyMap.set(r.hour, r));

      const hourlyStats = Array.from({ length: 24 }, (_, h) => {
        const hour12 = h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
        const hour24 = `${h.toString().padStart(2, "0")}:00`;
        const matched = hourlyMap.get(h) || {};
        return {
          hour: h,
          label: hour12,
          time24: hour24,
          hits: matched.total_hits || 0,
          pageViews: matched.page_views || 0,
          impressions: matched.impressions || 0,
          clicks: matched.clicks || 0,
        };
      });

      let peakHour = hourlyStats[0];
      for (const item of hourlyStats) {
        if (item.hits > peakHour.hits) {
          peakHour = item;
        }
      }

      // 6. Geographic Hit Distribution & Heatmap Points
      const locationRes = await client.query(`
        SELECT 
          COALESCE(NULLIF(user_location_name, ''), 'Unknown Location') as location_name,
          COUNT(*)::int as total_hits,
          COUNT(CASE WHEN event_type = 'page_view' THEN 1 END)::int as page_views,
          COUNT(CASE WHEN event_type = 'impression' THEN 1 END)::int as impressions,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END)::int as clicks
        FROM analytics_logs l
        ${logWhereSql}
        GROUP BY location_name
        ORDER BY total_hits DESC
        LIMIT 50;
      `, logParams);

      const geoHeatmapPoints = locationRes.rows.map((row) => {
        const cleanName = formatLocationName(row.location_name);
        const coords = getCoordinatesForLocation(row.location_name);
        return {
          locationName: cleanName,
          lat: coords.lat,
          lng: coords.lng,
          count: row.total_hits,
          weight: Math.min(Math.max(row.total_hits, 1), 100),
          pageViews: row.page_views,
          impressions: row.impressions,
          clicks: row.clicks,
        };
      });

      const topLocations = locationRes.rows.map((row) => ({
        locationName: formatLocationName(row.location_name),
        count: row.total_hits,
        pageViews: row.page_views,
        impressions: row.impressions,
        clicks: row.clicks,
      }));

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
        hourlyStats,
        peakHour: peakHour.hits > 0 ? peakHour : null,
        geoHeatmapPoints,
        topLocations,
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
