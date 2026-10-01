import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { isAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.store_name,
          u.phone,
          u.status,
          u.created_at,
          COUNT(s.id)::int as total_streams,
          COALESCE(SUM(stats.plays), 0)::int as total_plays,
          COALESCE(SUM(stats.cta_clicks), 0)::int as total_clicks
        FROM streamer_users u
        LEFT JOIN streams s ON u.id = s.user_id
        LEFT JOIN (
          SELECT 
            stream_id,
            COUNT(CASE WHEN event_type = 'play' THEN 1 END) as plays,
            COUNT(CASE WHEN event_type IN ('click_cta', 'click_whatsapp') THEN 1 END) as cta_clicks
          FROM stream_analytics
          GROUP BY stream_id
        ) stats ON s.id = stats.stream_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);

      return NextResponse.json({ streamers: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Admin streamers GET error:", error);
    return NextResponse.json({ error: error.message, streamers: [] }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, name, storeName, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "Streamer ID is required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE streamer_users
         SET 
           status = COALESCE($1, status),
           name = COALESCE($2, name),
           store_name = COALESCE($3, store_name),
           phone = COALESCE($4, phone),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, name, email, store_name, phone, status, updated_at`,
        [status, name, storeName, phone, id]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Streamer user not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, streamer: res.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Streamer user ID is required." }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM streamer_users WHERE id = $1`, [parseInt(id, 10)]);
      return NextResponse.json({ success: true, message: "Streamer user deleted successfully." });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
