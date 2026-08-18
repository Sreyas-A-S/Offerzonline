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
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const client = await pool.connect();
    try {
      // 1. Direct single ad lookup (by numeric ID or UUID)
      if (adId) {
        const isNumeric = /^\d+$/.test(adId);
        const result = await client.query(
          `SELECT a.*, c.name as category_name 
           FROM ads a 
           LEFT JOIN categories c ON a.category_id = c.id 
           WHERE ${isNumeric ? "a.id = $1" : "a.uuid = $1"}`,
          [isNumeric ? parseInt(adId, 10) : adId]
        );
        return NextResponse.json(
          { ads: result.rows },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          }
        );
      }

      // 2. Fetch all active campaigns with optional category and format filter
      let sql = `
        SELECT 
          a.*,
          c.name as category_name,
          COALESCE(
            CASE 
              WHEN $1::float != 0 AND $2::float != 0 AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL THEN
                ROUND((6371 * acos(LEAST(1.0, GREATEST(-1.0, 
                  cos(radians($2::float)) * cos(radians(a.latitude)) * 
                  cos(radians(a.longitude) - radians($1::float)) + 
                  sin(radians($2::float)) * sin(radians(a.latitude))
                ))))::numeric, 2)
              ELSE 0
            END, 0
          ) as distance_km
        FROM ads a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE (a.is_active IS NULL OR a.is_active = TRUE)
      `;

      const params: any[] = [lng, lat];
      let paramIdx = 3;

      if (categoryId && categoryId !== "all") {
        const isNumeric = /^\d+$/.test(categoryId);
        if (isNumeric) {
          sql += ` AND a.category_id = $${paramIdx++}`;
          params.push(parseInt(categoryId, 10));
        } else {
          sql += ` AND (c.name ILIKE $${paramIdx} OR c.slug ILIKE $${paramIdx})`;
          params.push(`%${categoryId}%`);
          paramIdx++;
        }
      }

      if (format) {
        sql += ` AND a.ad_format = $${paramIdx++}`;
        params.push(format);
      }

      sql += ` ORDER BY a.weight_priority DESC, a.created_at DESC LIMIT $${paramIdx++}`;
      params.push(limit);

      const result = await client.query(sql, params);

      return NextResponse.json(
        { ads: result.rows },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Ads serve query error:", error);
    return NextResponse.json({ ads: [] }, { status: 200 });
  }
}
