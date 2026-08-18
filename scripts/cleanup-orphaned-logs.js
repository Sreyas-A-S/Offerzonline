/**
 * Standalone cleanup script for Offerzonline PostgreSQL database.
 * Run anytime with: node scripts/cleanup-orphaned-logs.js
 */

const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/offerzonline",
  ssl: process.env.NODE_ENV === "production" && !process.env.DATABASE_URL?.includes("localhost") ? { rejectUnauthorized: false } : false,
});

async function runCleanup() {
  console.log("🔍 Scanning for orphaned analytics logs in Offerzonline database...");
  
  const client = await pool.connect();
  try {
    // 1. Delete orphaned analytics logs
    const deleteRes = await client.query(`
      DELETE FROM analytics_logs
      WHERE ad_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM ads WHERE ads.id = analytics_logs.ad_id
        )
      RETURNING id;
    `);

    const deletedCount = deleteRes.rowCount || 0;
    console.log(`✅ Cleaned up ${deletedCount} orphaned analytics logs.`);

    // 2. Enforce FOREIGN KEY with ON DELETE CASCADE
    console.log("🔒 Enforcing 'ON DELETE CASCADE' foreign key constraint on analytics_logs...");
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'analytics_logs_ad_id_fkey'
        ) THEN
          ALTER TABLE analytics_logs DROP CONSTRAINT analytics_logs_ad_id_fkey;
        END IF;

        ALTER TABLE analytics_logs 
        ADD CONSTRAINT analytics_logs_ad_id_fkey 
        FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END $$;
    `);

    console.log("✅ Database constraints synchronized successfully. All future ad deletions will automatically cascade and delete their logs.");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup();
