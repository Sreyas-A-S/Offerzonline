import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           s.*,
           c.name as category_name
         FROM streams s
         LEFT JOIN categories c ON s.category_id = c.id
         LEFT JOIN streamer_users u ON s.user_id = u.id
         WHERE s.is_active = true 
           AND (s.user_id IS NULL OR u.status = 'active')
         ORDER BY s.created_at ASC`
      );

      return NextResponse.json({ streams: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Public active streams error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
