import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, COOKIE_NAME } from "@/lib/auth";
import { extractClientIp } from "@/utils/analytics";

export const dynamic = "force-dynamic";

// In-memory brute-force rate limiter tracker: IP -> { attempts: number, lockUntil: number, lastAttempt: number }
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5; // 5 failed attempts allowed
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes sliding window

// Clean up stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.lockUntil && now - record.lastAttempt > WINDOW_DURATION_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);
    const now = Date.now();

    // 1. Check if IP is currently locked out
    const record = loginAttempts.get(clientIp);
    if (record && now < record.lockUntil) {
      const remainingSecs = Math.ceil((record.lockUntil - now) / 1000);
      const remainingMins = Math.ceil(remainingSecs / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Your IP has been temporarily locked. Please try again in ${remainingMins} minute${remainingMins > 1 ? "s" : ""}.`,
          retryAfter: remainingSecs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": remainingSecs.toString(),
          },
        }
      );
    }

    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "offerz2026";

    // 2. Validate Credentials
    if (username === expectedUsername && password === expectedPassword) {
      // Clear failed attempts upon successful login
      loginAttempts.delete(clientIp);

      const token = generateAdminToken(username);

      const response = NextResponse.json({
        success: true,
        token,
        message: "Admin authenticated successfully.",
      });

      // Set secure HttpOnly cookie for 7 days
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 3. Failed Attempt Tracking & Progressive Lockout
    const currentAttempts = record && now - record.lastAttempt < WINDOW_DURATION_MS ? record.attempts + 1 : 1;
    const isLocked = currentAttempts >= MAX_ATTEMPTS;
    const lockUntil = isLocked ? now + LOCKOUT_DURATION_MS : 0;

    loginAttempts.set(clientIp, {
      attempts: currentAttempts,
      lockUntil,
      lastAttempt: now,
    });

    if (isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum login attempts exceeded. Your IP has been locked for 15 minutes for security.",
          retryAfter: 900,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "900",
          },
        }
      );
    }

    const remainingAttempts = MAX_ATTEMPTS - currentAttempts;

    return NextResponse.json(
      {
        success: false,
        error: `Invalid Admin Username or Password. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining before temporary lockout)`,
      },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
