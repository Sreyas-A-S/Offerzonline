import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

// Dynamic file server for uploaded media with byte-range (HTTP 206) streaming support
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

    // Security: prevent path traversal
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(process.cwd(), "public", "uploads"));
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fileStat = await stat(resolvedPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 404 });
    }

    const fileSize = fileStat.size;
    const ext = path.extname(resolvedPath).toLowerCase();

    const mimeMap: Record<string, string> = {
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".svg": "image/svg+xml",
      ".mp3": "audio/mpeg",
      ".ogg": "audio/ogg",
      ".wav": "audio/wav",
    };

    const contentType = mimeMap[ext] || "application/octet-stream";
    const rangeHeader = req.headers.get("range");

    // Handle HTTP Byte-Range requests (Video / Audio streaming & scrubbing)
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (isNaN(start) || start >= fileSize || (parts[1] && end >= fileSize) || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const nodeStream = fs.createReadStream(resolvedPath, { start, end });
      const webStream = Readable.toWeb(nodeStream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Standard 200 response with stream and range capability declared
    const nodeStream = fs.createReadStream(resolvedPath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("Uploads GET stream error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
