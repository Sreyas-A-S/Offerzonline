import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToR2 } from "@/lib/cloudflare";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const fileExt = path.extname(file.name).toLowerCase();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    let finalBuffer: Buffer = buffer;
    let finalFileName = "";
    let finalContentType = mimeType;
    let mediaType: "image" | "gif" | "video" = "image";

    // 1. Image Optimization Pipeline (Convert JPG/PNG to WebP @ 82% quality)
    if (mimeType.startsWith("image/") && !mimeType.includes("gif")) {
      mediaType = "image";
      finalContentType = "image/webp";
      finalFileName = `ads/${uniqueId}.webp`;

      finalBuffer = await sharp(buffer)
        .webp({ quality: 82 })
        .toBuffer();
    } 
    // 2. GIF / Video Handling Pipeline
    else if (mimeType.includes("gif")) {
      mediaType = "gif";
      finalContentType = "image/gif";
      finalFileName = `ads/${uniqueId}.gif`;
      finalBuffer = buffer;
    } else if (mimeType.startsWith("video/")) {
      mediaType = "video";
      finalContentType = "video/mp4";
      finalFileName = `ads/${uniqueId}.mp4`;
      finalBuffer = buffer;
    } else {
      finalFileName = `ads/${uniqueId}${fileExt}`;
    }

    // 3. Save locally in public/uploads if R2 is not connected, or upload to R2 directly
    const publicUrl = await uploadToR2(finalBuffer, finalFileName, finalContentType);

    // If local path returned, ensure uploads folder exists and write file
    if (publicUrl.startsWith("/uploads/")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(process.cwd(), "public", publicUrl);
      await fs.writeFile(localFilePath, finalBuffer);
    }

    // Convert /uploads/ paths to /api/uploads/ for dynamic serving in production
    const servedUrl = publicUrl.startsWith("/uploads/") 
      ? `/api${publicUrl}` 
      : publicUrl;

    return NextResponse.json({
      success: true,
      url: servedUrl,
      mediaType,
      size: finalBuffer.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
