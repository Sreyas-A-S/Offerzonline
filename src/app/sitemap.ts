import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { getAdSlug } from "@/utils/adSlug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://offerzonline.in";
  const activeAds = await db.select({ id: ads.id, title: ads.title, updatedAt: ads.updatedAt }).from(ads).where(eq(ads.isActive, true));
  return [
    { url: baseUrl, lastModified: new Date() },
    ...activeAds.map((ad) => ({ url: `${baseUrl}/offers/${getAdSlug(ad.title, ad.id)}`, lastModified: ad.updatedAt || new Date() })),
  ];
}
