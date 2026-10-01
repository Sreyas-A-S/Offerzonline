import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  const captcha = generateCaptchaChallenge();
  return NextResponse.json(captcha);
}
