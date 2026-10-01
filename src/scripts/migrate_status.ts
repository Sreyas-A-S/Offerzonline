import { pool } from "../db";

async function run() {
  try {
    await pool.query("ALTER TABLE streamer_users ALTER COLUMN status SET DEFAULT 'pending';");
    console.log("Migration successful: streamer_users default status set to pending");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
