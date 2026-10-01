import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { getAuthenticatedStreamer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const streamer = getAuthenticatedStreamer(req);
  if (!streamer) {
    return NextResponse.json({ error: "Unauthorized. Please log in as a streamer." }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           s.*,
           c.name as category_name,
           COALESCE(stats.plays, 0)::int as plays,
           COALESCE(stats.completions, 0)::int as completions,
           COALESCE(stats.cta_clicks, 0)::int as cta_clicks,
           COALESCE(stats.total_watch_time, 0)::numeric as total_watch_time,
           CASE 
             WHEN COALESCE(stats.plays, 0) > 0 
             THEN ROUND((COALESCE(stats.cta_clicks, 0)::numeric / stats.plays::numeric) * 100, 2)
             ELSE 0 
           END as ctr,
           CASE 
             WHEN COALESCE(stats.plays, 0) > 0 
             THEN ROUND((COALESCE(stats.completions, 0)::numeric / stats.plays::numeric) * 100, 2)
             ELSE 0 
           END as completion_rate
         FROM streams s
         LEFT JOIN categories c ON s.category_id = c.id
         LEFT JOIN (
           SELECT 
             stream_id,
             COUNT(CASE WHEN event_type = 'play' THEN 1 END) as plays,
             COUNT(CASE WHEN event_type = 'complete' THEN 1 END) as completions,
             COUNT(CASE WHEN event_type IN ('click_cta', 'click_whatsapp') THEN 1 END) as cta_clicks,
             SUM(COALESCE(watch_time_seconds, 0)) as total_watch_time
           FROM stream_analytics
           GROUP BY stream_id
         ) stats ON s.id = stats.stream_id
         WHERE s.is_active = true
         ORDER BY s.created_at DESC`
      );

      return NextResponse.json({ streams: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Streamer streams GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const streamer = getAuthenticatedStreamer(req);
  if (!streamer) {
    return NextResponse.json({ error: "Unauthorized. Please log in as a streamer." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      mediaUrl,
      mediaType,
      thumbnailUrl,
      durationSeconds,
      targetUrl,
      ctaText,
      storeName,
      storeLogo,
      storePhone,
      storeAddress,
      originalPrice,
      promoPrice,
      discountValue,
      terms,
      categoryId,
      aspectRatio,
      autoplay,
      mutedDefault,
    } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: "Title and Media URL are required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO streams (
           user_id, title, description, media_url, media_type, thumbnail_url,
           duration_seconds, target_url, cta_text, store_name, store_logo,
           store_phone, store_address, original_price, promo_price,
           discount_value, terms, category_id, aspect_ratio,
           autoplay, loop, muted_default, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, FALSE, $21, TRUE)
         RETURNING *`,
        [
          streamer.id,
          title,
          description || null,
          mediaUrl,
          mediaType || "video",
          thumbnailUrl || null,
          durationSeconds || 0,
          targetUrl || null,
          ctaText || "Learn More",
          storeName || null,
          storeLogo || null,
          storePhone || null,
          storeAddress || null,
          originalPrice || null,
          promoPrice || null,
          discountValue || null,
          terms || null,
          categoryId || null,
          aspectRatio || "16:9",
          autoplay !== undefined ? autoplay : true,
          mutedDefault !== undefined ? mutedDefault : false,
        ]
      );

      return NextResponse.json({ success: true, stream: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Streamer create stream error:", error);
    return NextResponse.json({ error: error.message || "Failed to create stream." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const streamer = getAuthenticatedStreamer(req);
  if (!streamer) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("id");
  if (!streamId) {
    return NextResponse.json({ error: "Stream ID is required." }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`DELETE FROM streams WHERE id = $1 AND user_id = $2 RETURNING id`, [
        parseInt(streamId, 10),
        streamer.id,
      ]);

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Stream not found or unauthorized." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Stream deleted." });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
