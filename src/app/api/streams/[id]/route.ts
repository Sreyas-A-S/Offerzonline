import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const client = await pool.connect();
    try {
      // Find stream by ID or UUID
      const isNumeric = /^\d+$/.test(id);
      const streamRes = await client.query(
        `SELECT 
           s.*,
           c.name as category_name,
           c.slug as category_slug
         FROM streams s
         LEFT JOIN categories c ON s.category_id = c.id
         WHERE ${isNumeric ? "s.id = $1" : "s.uuid = $1"}`,
        [isNumeric ? parseInt(id, 10) : id]
      );

      if (streamRes.rows.length === 0) {
        return NextResponse.json({ error: "Stream not found" }, { status: 404 });
      }

      const stream = streamRes.rows[0];

      // Fetch other active streams (up to 6) for recommendations / Up Next
      const relatedRes = await client.query(
        `SELECT id, uuid, title, media_url, media_type, thumbnail_url, store_name, store_logo, duration_seconds, views_count
         FROM streams 
         WHERE id != $1 AND is_active = TRUE
         ORDER BY created_at DESC 
         LIMIT 6`,
        [stream.id]
      );

      return NextResponse.json(
        {
          stream,
          related: relatedRes.rows,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
          },
        }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Public stream GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
