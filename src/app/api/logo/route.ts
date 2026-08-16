import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    let logoUrl = "/logo.png";

    try {
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT value FROM site_settings WHERE key = 'logo' LIMIT 1");
        if (result.rows.length > 0 && result.rows[0].value) {
          logoUrl = result.rows[0].value;
        }
      } finally {
        client.release();
      }
    } catch (dbErr) {
      console.warn("DB lookup for site logo failed, using fallback:", dbErr);
    }

    // If logo URL is local /uploads/ or /api/uploads/
    if (logoUrl.startsWith("/uploads/") || logoUrl.startsWith("/api/uploads/")) {
      const relativePath = logoUrl.replace(/^\/api\/uploads\//, "").replace(/^\/uploads\//, "");
      const filePath = path.join(process.cwd(), "public", "uploads", relativePath);
      try {
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap: Record<string, string> = {
          ".webp": "image/webp",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
        };
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeMap[ext] || "image/png",
            "Cache-Control": "public, max-age=300",
          },
        });
      } catch (err) {
        // Fallback to static /logo.png
      }
    }

    // If external URL, redirect
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      return NextResponse.redirect(logoUrl);
    }

    // Default static fallback
    const fallbackPath = path.join(process.cwd(), "public", "logo.png");
    const fallbackBuffer = await fs.readFile(fallbackPath);
    return new NextResponse(fallbackBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
