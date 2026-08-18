import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "offerz2026";

    if (username === expectedUsername && password === expectedPassword) {
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

    return NextResponse.json(
      { success: false, error: "Invalid Admin Username or Password" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
