import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { isAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      // Query streams with real-time aggregated stats
      const result = await client.query(`
        SELECT 
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
        ORDER BY s.created_at DESC
      `);

      const categoriesRes = await client.query(`SELECT * FROM categories ORDER BY name ASC`);

      return NextResponse.json({ streams: result.rows, categories: categoriesRes.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin streams GET error:", error.message);
    return NextResponse.json({ error: error.message, streams: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
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
      loop,
      mutedDefault,
      isActive,
      isDemo,
    } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: "Title and Media URL are required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO streams (
          title, description, media_url, media_type, thumbnail_url,
          duration_seconds, target_url, cta_text, store_name, store_logo,
          store_phone, store_address, original_price, promo_price,
          discount_value, terms, category_id, aspect_ratio,
          autoplay, loop, muted_default, is_active, is_demo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *
        `,
        [
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
          loop !== undefined ? loop : true,
          mutedDefault !== undefined ? mutedDefault : false,
          isActive !== undefined ? isActive : true,
          isDemo !== undefined ? isDemo : false,
        ]
      );

      return NextResponse.json({ success: true, stream: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin streams POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create stream." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
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
      loop,
      mutedDefault,
      isActive,
      isDemo,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Stream ID required for update" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        UPDATE streams 
        SET 
          title = $1,
          description = $2,
          media_url = $3,
          media_type = $4,
          thumbnail_url = $5,
          duration_seconds = $6,
          target_url = $7,
          cta_text = $8,
          store_name = $9,
          store_logo = $10,
          store_phone = $11,
          store_address = $12,
          original_price = $13,
          promo_price = $14,
          discount_value = $15,
          terms = $16,
          category_id = $17,
          aspect_ratio = $18,
          autoplay = $19,
          loop = $20,
          muted_default = $21,
          is_active = $22,
          is_demo = $23,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $24
        RETURNING *
        `,
        [
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
          loop !== undefined ? loop : true,
          mutedDefault !== undefined ? mutedDefault : false,
          isActive !== undefined ? isActive : true,
          isDemo !== undefined ? isDemo : false,
          id,
        ]
      );

      return NextResponse.json({ success: true, stream: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin streams PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update stream." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Stream ID is required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM stream_analytics WHERE stream_id = $1`, [id]);
      await client.query(`DELETE FROM streams WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin streams DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete stream." }, { status: 500 });
  }
}
