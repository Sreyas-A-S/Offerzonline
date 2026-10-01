import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import crypto from "crypto";
import { generateStreamerToken, STREAMER_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_offerz_salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, storeName, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Check if email already registered
      const existing = await client.query(`SELECT id FROM streamer_users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      const passwordHash = hashPassword(password);

      const insertRes = await client.query(
        `INSERT INTO streamer_users (name, email, password_hash, store_name, phone, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING id, name, email, store_name, phone, status, created_at`,
        [name.trim(), email.trim().toLowerCase(), passwordHash, storeName?.trim() || null, phone?.trim() || null]
      );

      const user = insertRes.rows[0];

      return NextResponse.json({
        success: true,
        message: "Registration successful! Your account is pending administrator activation.",
        user,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Streamer registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 });
  }
}
