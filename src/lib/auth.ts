import { NextRequest } from "next/server";
import crypto from "crypto";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "offerzonline_super_secret_jwt_key_2026";
const COOKIE_NAME = "offerz_admin_token";

/**
 * Creates a signed JWT-like token for admin authentication
 */
export function generateAdminToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      user: username,
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiry
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verifies a JWT token and returns validity
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return false; // Token expired
    }
    return data.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Checks authentication for an incoming Next.js API Request
 * Looks at Authorization header (Bearer <token>) OR HttpOnly Cookie (offerz_admin_token)
 */
export function isAuthenticatedAdmin(req: NextRequest): boolean {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  // 2. Check Cookie
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken && verifyAdminToken(cookieToken)) {
    return true;
  }

  return false;
}

export { COOKIE_NAME };
