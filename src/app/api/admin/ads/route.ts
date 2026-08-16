import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

const MOCK_CATEGORIES = [
  { id: 1, name: "Retail & Shopping", slug: "retail-shopping" },
  { id: 2, name: "Food & Dining", slug: "food-dining" },
  { id: 3, name: "Services & Repair", slug: "services-repair" },
  { id: 4, name: "Entertainment & Events", slug: "entertainment-events" },
  { id: 5, name: "Health & Fitness", slug: "health-fitness" },
  { id: 6, name: "Electronics & Tech", slug: "electronics-tech" },
];

let MOCK_STORED_ADS: any[] = [
  {
    id: 1,
    title: "50% Off Gourmet Pizza & Pasta Combo",
    category_name: "Food & Dining",
    category_id: 2,
    media_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    ad_format: "300x250",
    target_url: "https://offerzonline.com/deals/pizza",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 10,
    weight_priority: 5,
    distance_km: 1.2,
    views: 142,
    clicks: 18,
    ctr: 12.68,
    is_active: true,
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Free Premium Gym Membership",
    category_name: "Health & Fitness",
    category_id: 5,
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    ad_format: "responsive",
    target_url: "https://offerzonline.com/deals/fitness",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 15,
    weight_priority: 4,
    distance_km: 3.4,
    views: 98,
    clicks: 11,
    ctr: 11.22,
    is_active: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          a.*,
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
            (SELECT COUNT(*)::int FROM analytics_logs WHERE ad_id = a.id AND event_type = 'click') as clicks
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
    console.warn("PostgreSQL connection fallback triggered in /api/admin/ads:", error.message);
    return NextResponse.json({ ads: MOCK_STORED_ADS, categories: MOCK_CATEGORIES }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
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
      // Mock creation fallback
      const catObj = MOCK_CATEGORIES.find((c) => c.id === parseInt(categoryId, 10));
      const newMockAd = {
        id: Date.now(),
        title,
        category_id: categoryId,
        category_name: catObj ? catObj.name : "General",
        media_url: mediaUrl,
        media_type: mediaType,
        ad_format: adFormat,
        target_url: targetUrl,
        latitude,
        longitude,
        radius_km: radiusKm,
        weight_priority: weightPriority || 1,
        description: description || null,
        expires_at: expiresAt || null,
        store_name: storeName || null,
        store_logo: storeLogo || null,
        store_phone: storePhone || null,
        store_address: storeAddress || null,
        original_price: originalPrice || null,
        promo_price: promoPrice || null,
        discount_value: discountValue || null,
        terms: terms || null,
        distance_km: 0.5,
        views: 0,
        clicks: 0,
        ctr: "0.00",
        is_active: true,
      };
      MOCK_STORED_ADS.unshift(newMockAd);
      return NextResponse.json({ success: true, ad: newMockAd });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
              latitude = $7, 
              longitude = $8, 
              radius_km = $9, 
              location = ST_SetSRID(ST_MakePoint($8, $7), 4326)::geography, 
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
              latitude,
              longitude,
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
              latitude = $7, 
              longitude = $8, 
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
              latitude,
              longitude,
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
      MOCK_STORED_ADS = MOCK_STORED_ADS.map((a) =>
        a.id.toString() === id.toString()
          ? {
              ...a,
              title,
              category_id: categoryId,
              media_url: mediaUrl,
              media_type: mediaType,
              ad_format: adFormat,
              target_url: targetUrl,
              latitude,
              longitude,
              radius_km: radiusKm,
              weight_priority: weightPriority,
              description,
              expires_at: expiresAt,
              store_name: storeName || null,
              store_logo: storeLogo || null,
              store_phone: storePhone || null,
              store_address: storeAddress || null,
              original_price: originalPrice || null,
              promo_price: promoPrice || null,
              discount_value: discountValue || null,
              terms: terms || null,
              is_active: isActive !== undefined ? isActive : a.is_active,
            }
          : a
      );
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ad ID required" }, { status: 400 });
    }

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE ads SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [id]
        );
        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    } catch (dbErr) {
      MOCK_STORED_ADS = MOCK_STORED_ADS.map((a) => (a.id.toString() === id.toString() ? { ...a, is_active: false } : a));
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
