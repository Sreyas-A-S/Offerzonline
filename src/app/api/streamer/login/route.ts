import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import crypto from "crypto";
import { generateStreamerToken, STREAMER_COOKIE_NAME, getAuthenticatedStreamer } from "@/lib/auth";

export const dynamic = "force-dynamic";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_offerz_salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, name, email, password_hash, store_name, phone, status
         FROM streamer_users 
         WHERE LOWER(email) = LOWER($1)`,
        [email.trim()]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const user = res.rows[0];

      if (user.status === "pending") {
        return NextResponse.json({ error: "Your account is inactive and pending activation by an administrator." }, { status: 403 });
      }

      if (user.status === "suspended") {
        return NextResponse.json({ error: "Your streamer account is suspended. Please contact administrator." }, { status: 403 });
      }

      const expectedHash = hashPassword(password);
      if (user.password_hash !== expectedHash) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const token = generateStreamerToken({ id: user.id, email: user.email, name: user.name });

      const response = NextResponse.json({
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          store_name: user.store_name,
          phone: user.phone,
          status: user.status,
        },
        token,
      });

      response.cookies.set(STREAMER_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Streamer login error:", error);
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const streamer = getAuthenticatedStreamer(req);
    if (!streamer) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, name, email, store_name, phone, status, created_at 
         FROM streamer_users 
         WHERE id = $1`,
        [streamer.id]
      );

      if (res.rows.length === 0 || res.rows[0].status === "suspended" || res.rows[0].status === "pending") {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }

      return NextResponse.json({ authenticated: true, user: res.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
