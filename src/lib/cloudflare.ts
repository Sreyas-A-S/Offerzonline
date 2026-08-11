import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure AWS S3 Client wrapper for Cloudflare R2
const r2AccountKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

export const r2Client = (r2AccountKey && r2SecretKey && accountId) 
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccountKey,
        secretAccessKey: r2SecretKey,
      },
    })
  : null;

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET || "offerzonline-media";
  const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (r2Client) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    if (publicUrlBase) {
      return `${publicUrlBase.replace(/\/$/, "")}/${fileName}`;
    }
  }

  // Fallback to local public uploads if R2 credentials are not configured yet
  return `/uploads/${fileName}`;
}

export async function purgeCloudflareCache(urls: string[]) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken || urls.length === 0) {
    console.log("Cloudflare Purge skipped: Zone ID or API Token missing.");
    return { success: false, reason: "Missing credentials" };
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ files: urls }),
      }
    );

    const data = await res.json();
    console.log("Cloudflare cache purge result:", data);
    return data;
  } catch (error) {
    console.error("Failed to purge Cloudflare cache:", error);
    return { success: false, error };
  }
}
