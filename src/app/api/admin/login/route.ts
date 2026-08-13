import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "offerz2026";

    if (username === expectedUsername && password === expectedPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid Admin Username or Password" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
