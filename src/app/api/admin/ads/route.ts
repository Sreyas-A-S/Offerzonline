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
      const result = await client.query(`
        SELECT 
          a.*,
          a.top_referrer,
          c.name as category_name,
          views,
          clicks,
          CASE 
            WHEN views > 0 THEN ROUND((clicks::numeric / views::numeric) * 100, 2)
            ELSE 0 
          END as ctr
        FROM (
          SELECT 
            a.*,
            (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'impression') as views,
            (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click') as clicks,
            COALESCE((
              SELECT COALESCE(NULLIF(referrer_domain, ''), 'Direct')
              FROM analytics_logs
              WHERE ad_id = a.id
              GROUP BY referrer_domain
              ORDER BY COUNT(*) DESC
              LIMIT 1
            ), 'Direct') as top_referrer
          FROM ads a
        ) a
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.weight_priority DESC, a.created_at DESC
      `);

      const categoriesRes = await client.query(`SELECT * FROM categories ORDER BY name ASC`);

      return NextResponse.json({ ads: result.rows, categories: categoriesRes.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin ads GET query error:", error.message);
    return NextResponse.json({ ads: [], categories: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { title, categoryId, mediaUrl, mediaType, adFormat, targetUrl, latitude, longitude, radiusKm, weightPriority, description, expiresAt, storeName, storeLogo, storePhone, storeAddress, originalPrice, promoPrice, discountValue, terms, isOnloadPopup, isRecommended } = body;

    try {
      const client = await pool.connect();
      try {
        let result;
        try {
          // Attempt standard PostGIS insert
          result = await client.query(
            `
            INSERT INTO ads (
              title, category_id, media_url, media_type, ad_format, target_url, 
              latitude, longitude, radius_km, location, weight_priority, is_active,
              description, expires_at, store_name, store_logo, store_phone, store_address,
              original_price, promo_price, discount_value, terms, is_onload_popup, is_recommended
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography, $10, TRUE, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            RETURNING *
            `,
            [
              title,
              categoryId,
              mediaUrl,
              mediaType,
              adFormat,
              targetUrl,
              latitude,
              longitude,
              radiusKm,
              weightPriority || 1,
              description || null,
              expiresAt || null,
              storeName || null,
              storeLogo || null,
              storePhone || null,
              storeAddress || null,
              originalPrice || null,
              promoPrice || null,
              discountValue || null,
              terms || null,
              isOnloadPopup === true,
              isRecommended === true
            ]
          );
        } catch (postgisErr: any) {
          console.warn("PostGIS insert failed, falling back to standard SQL insert:", postgisErr.message);
          // Fallback SQL insert (no location column or ST_SetSRID)
          result = await client.query(
            `
            INSERT INTO ads (
              title, category_id, media_url, media_type, ad_format, target_url, 
              latitude, longitude, radius_km, weight_priority, is_active,
              description, expires_at, store_name, store_logo, store_phone, store_address,
              original_price, promo_price, discount_value, terms, is_onload_popup, is_recommended
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            RETURNING *
            `,
            [
              title,
              categoryId,
              mediaUrl,
              mediaType,
              adFormat,
              targetUrl,
              latitude,
              longitude,
              radiusKm,
              weightPriority || 1,
              description || null,
              expiresAt || null,
              storeName || null,
              storeLogo || null,
              storePhone || null,
              storeAddress || null,
              originalPrice || null,
              promoPrice || null,
              discountValue || null,
              terms || null,
              isOnloadPopup === true,
              isRecommended === true
            ]
          );
        }

        return NextResponse.json({ success: true, ad: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      console.error("DB insert error:", dbErr.message);
      return NextResponse.json({ error: "Unable to save ad to the database." }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, categoryId, mediaUrl, mediaType, adFormat, targetUrl, latitude, longitude, radiusKm, weightPriority, description, expiresAt, isActive, storeName, storeLogo, storePhone, storeAddress, originalPrice, promoPrice, discountValue, terms, isOnloadPopup, isRecommended } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID required for update" }, { status: 400 });
    }

    try {
      const client = await pool.connect();
      try {
        let result;
        try {
          // Attempt standard PostGIS update
          result = await client.query(
            `
            UPDATE ads 
            SET 
              title = $1, 
              category_id = $2, 
              media_url = $3, 
              media_type = $4, 
              ad_format = $5, 
              target_url = $6, 
              latitude = COALESCE($7, latitude), 
              longitude = COALESCE($8, longitude), 
              radius_km = $9, 
              location = ST_SetSRID(ST_MakePoint(COALESCE($8, longitude), COALESCE($7, latitude)), 4326)::geography, 
              weight_priority = $10, 
              is_active = $11, 
              description = $12, 
              expires_at = $13,
              store_name = $14,
              store_logo = $15,
              store_phone = $16,
              store_address = $17,
              original_price = $18,
              promo_price = $19,
              discount_value = $20,
              terms = $21,
              is_onload_popup = $22,
              is_recommended = $23,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $24
            RETURNING *
            `,
            [
              title,
              categoryId,
              mediaUrl,
              mediaType,
              adFormat,
              targetUrl,
              latitude === "" ? null : latitude,
              longitude === "" ? null : longitude,
              radiusKm,
              weightPriority || 1,
              isActive !== undefined ? isActive : true,
              description || null,
              expiresAt || null,
              storeName || null,
              storeLogo || null,
              storePhone || null,
              storeAddress || null,
              originalPrice || null,
              promoPrice || null,
              discountValue || null,
              terms || null,
              isOnloadPopup === true,
              isRecommended === true,
              id,
            ]
          );
        } catch (postgisErr: any) {
          console.warn("PostGIS update failed, falling back to standard SQL update:", postgisErr.message);
          // Fallback SQL update (no location column or ST_SetSRID)
          result = await client.query(
            `
            UPDATE ads 
            SET 
              title = $1, 
              category_id = $2, 
              media_url = $3, 
              media_type = $4, 
              ad_format = $5, 
              target_url = $6, 
              latitude = COALESCE($7, latitude), 
              longitude = COALESCE($8, longitude), 
              radius_km = $9, 
              weight_priority = $10, 
              is_active = $11, 
              description = $12, 
              expires_at = $13,
              store_name = $14,
              store_logo = $15,
              store_phone = $16,
              store_address = $17,
              original_price = $18,
              promo_price = $19,
              discount_value = $20,
              terms = $21,
              is_onload_popup = $22,
              is_recommended = $23,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $24
            RETURNING *
            `,
            [
              title,
              categoryId,
              mediaUrl,
              mediaType,
              adFormat,
              targetUrl,
              latitude === "" ? null : latitude,
              longitude === "" ? null : longitude,
              radiusKm,
              weightPriority || 1,
              isActive !== undefined ? isActive : true,
              description || null,
              expiresAt || null,
              storeName || null,
              storeLogo || null,
              storePhone || null,
              storeAddress || null,
              originalPrice || null,
              promoPrice || null,
              discountValue || null,
              terms || null,
              isOnloadPopup === true,
              isRecommended === true,
              id,
            ]
          );
        }

        return NextResponse.json({ success: true, ad: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      console.error("DB update error:", dbErr.message);
      return NextResponse.json({ error: "Unable to update ad in the database.", details: dbErr.message }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const soft = searchParams.get("soft") === "true";

    if (!id) {
      return NextResponse.json({ error: "Ad ID required" }, { status: 400 });
    }

    try {
      const client = await pool.connect();
      try {
        if (soft) {
          await client.query(
            `UPDATE ads SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
          );
        } else {
          // Explicitly purge related analytics logs to guarantee zero orphaned logs
          await client.query(`DELETE FROM analytics_logs WHERE ad_id = $1`, [id]);
          await client.query(`DELETE FROM ads WHERE id = $1`, [id]);
        }
        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      console.error("Ads DELETE DB error:", dbErr.message);
      return NextResponse.json({ error: "Unable to delete ad from the database." }, { status: 503 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
