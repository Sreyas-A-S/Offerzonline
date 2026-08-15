import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT key, value FROM site_settings");
      const settingsMap: Record<string, string> = {
        logo: "/logo.png",
      };
      result.rows.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
      return NextResponse.json({ settings: settingsMap });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ settings: { logo: "/logo.png" } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;
    if (!key || !value) {
      return NextResponse.json({ success: false, error: "Key and value are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Ensure site_settings table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(
        `INSERT INTO site_settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
      return NextResponse.json({ success: true, key, value });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
