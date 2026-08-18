import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const adId = searchParams.get("id");
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const categoryId = searchParams.get("category");
  const format = searchParams.get("format");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const client = await pool.connect();
    try {
      // Direct ad fetch by ID or UUID for shared link opening
      if (adId) {
        const isNumeric = /^\d+$/.test(adId);
        const result = await client.query(`
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE ${isNumeric ? "a.id = $1" : "a.uuid = $1"}
        `, [isNumeric ? parseInt(adId, 10) : adId]);
        return NextResponse.json({ ads: result.rows });
      }

      let query = "";
      const queryParams: any[] = [];

      // Check if location column exists
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='ads' AND column_name='location'
      `);
      const hasLocationCol = colCheck.rows.length > 0;

      if (hasLocationCol) {
        query = `
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms,
            ROUND(
              (ST_Distance(
                a.location,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
              ) / 1000)::numeric, 2
            ) as distance_km
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE a.is_active = TRUE
        `;
        queryParams.push(lng, lat);
        let paramCounter = 3;

        if (lat !== 0 || lng !== 0) {
          query += ` AND ST_DWithin(a.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, a.radius_km * 1000)`;
        }

        if (categoryId && categoryId !== "all") {
          query += ` AND a.category_id = $${paramCounter}`;
          queryParams.push(parseInt(categoryId, 10));
          paramCounter++;
        }

        if (format) {
          query += ` AND a.ad_format = $${paramCounter}`;
          queryParams.push(format);
          paramCounter++;
        }

        query += ` ORDER BY a.weight_priority DESC, distance_km ASC LIMIT $${paramCounter}`;
        queryParams.push(limit);
      } else {
        // Fallback to standard Haversine distance query for PostGIS-less PostgreSQL setup
        query = `
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms,
            ROUND(
              (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                  cos(radians($2)) * cos(radians(a.latitude)) *
                  cos(radians(a.longitude) - radians($1)) +
                  sin(radians($2)) * sin(radians(a.latitude))
                ))
              ))::numeric, 2
            ) as distance_km
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE a.is_active = TRUE
        `;
        queryParams.push(lng, lat);
        let paramCounter = 3;

        if (lat !== 0 && lng !== 0) {
          query += ` AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians($2)) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians($1)) + sin(radians($2)) * sin(radians(a.latitude)))))) <= a.radius_km`;
        }

        if (categoryId && categoryId !== "all") {
          query += ` AND a.category_id = $${paramCounter}`;
          queryParams.push(parseInt(categoryId, 10));
          paramCounter++;
        }

        if (format) {
          query += ` AND a.ad_format = $${paramCounter}`;
          queryParams.push(format);
          paramCounter++;
        }

        query += ` ORDER BY a.weight_priority DESC, distance_km ASC LIMIT $${paramCounter}`;
        queryParams.push(limit);
      }

      const result = await client.query(query, queryParams);
      let adsToReturn = result.rows;

      // Fallback: If no ads exist strictly inside the user's specific GPS radius, return active ads ordered by priority
      if (adsToReturn.length === 0) {
        const fallbackQuery = `
          SELECT 
            a.id, a.uuid, a.title, a.category_id, c.name as category_name,
            a.media_url, a.media_type, a.ad_format, a.target_url,
            a.latitude, a.longitude, a.radius_km, a.weight_priority,
            a.description, a.expires_at, a.store_name, a.store_logo,
            a.store_phone, a.store_address, a.original_price,
            a.promo_price, a.discount_value, a.terms,
            0 as distance_km
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE a.is_active = TRUE
          ${categoryId && categoryId !== "all" ? `AND a.category_id = ${parseInt(categoryId, 10)}` : ""}
          ORDER BY a.weight_priority DESC, a.created_at DESC
          LIMIT 20
        `;
        const fallbackRes = await client.query(fallbackQuery);
        adsToReturn = fallbackRes.rows;
      }

      return NextResponse.json(
        { ads: adsToReturn },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Ads serve query error:", error.message);
    return NextResponse.json({ ads: [] }, { status: 200 });
  }
}
