import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import crypto from "crypto";
import { generateStreamerToken, STREAMER_COOKIE_NAME } from "@/lib/auth";

import { verifyCaptchaToken } from "@/lib/captcha";

export const dynamic = "force-dynamic";

// In-memory rate limiting map for brute force & spam prevention (5 attempts per IP per 10 minutes)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_offerz_salt").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again in 10 minutes." }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, password, storeName, phone, captchaAnswer, captchaToken } = body;

    // 1. Mandatory Field Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    // 2. Security Captcha Spam Verification
    const captchaResult = verifyCaptchaToken(captchaAnswer, captchaToken);
    if (!captchaResult.valid) {
      return NextResponse.json({ error: captchaResult.reason || "Invalid captcha response." }, { status: 400 });
    }

    // 3. Email Format & Input Sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 6 and 128 characters long." }, { status: 400 });
    }

    if (name.trim().length > 100 || (storeName && storeName.trim().length > 100)) {
      return NextResponse.json({ error: "Name and Store Name must not exceed 100 characters." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // 4. Parameterized SQL Query (Prevents SQL Injection)
      const existing = await client.query(`SELECT id FROM streamer_users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      const passwordHash = hashPassword(password);

      // 5. Safe Insertion with Status 'pending' by default
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
