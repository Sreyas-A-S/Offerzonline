import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // 1. Delete all orphaned analytics logs where ad_id is not in ads
      const orphanResult = await client.query(`
        DELETE FROM analytics_logs
        WHERE ad_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM ads WHERE ads.id = analytics_logs.ad_id
          )
        RETURNING id;
      `);

      const deletedCount = orphanResult.rowCount || 0;

      // 2. Ensure FOREIGN KEY constraint with ON DELETE CASCADE is active
      await client.query(`
        DO $$
        BEGIN
          -- Drop existing constraint if it doesn't have ON DELETE CASCADE
          IF EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'analytics_logs_ad_id_fkey'
          ) THEN
            ALTER TABLE analytics_logs DROP CONSTRAINT analytics_logs_ad_id_fkey;
          END IF;

          -- Re-add with ON DELETE CASCADE
          ALTER TABLE analytics_logs 
          ADD CONSTRAINT analytics_logs_ad_id_fkey 
          FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END $$;
      `);

      return NextResponse.json({
        success: true,
        message: `Successfully cleaned up ${deletedCount} orphaned analytics logs.`,
        deletedCount,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
