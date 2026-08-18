import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ads, categories } from "@/db/schema";
import { getAdSlug } from "@/utils/adSlug";

type Props = { params: Promise<{ slug: string }> };

async function getAd(slug: string) {
  const id = Number(slug.match(/-(\d+)$/)?.[1]);
  if (!Number.isInteger(id)) return null;
  const rows = await db
    .select({ ad: ads, categoryName: categories.name })
    .from(ads)
    .leftJoin(categories, eq(ads.categoryId, categories.id))
    .where(and(eq(ads.id, id), eq(ads.isActive, true)))
    .limit(1);
  const row = rows[0];
  return row && getAdSlug(row.ad.title, row.ad.id) === slug ? row : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await getAd(slug);
  if (!row) return { title: "Offer not found | Offerzonline" };
  return {
    title: `${row.ad.title} | Offerzonline`,
    description: row.ad.description || `Discover ${row.ad.title} on Offerzonline.`,
    alternates: { canonical: `/offers/${slug}` },
    openGraph: { title: row.ad.title, description: row.ad.description || undefined, images: row.ad.mediaUrl.split(",")[0] ? [row.ad.mediaUrl.split(",")[0]] : undefined },
  };
}

export default async function OfferPage({ params }: Props) {
  const { slug } = await params;
  const row = await getAd(slug);
  if (!row) notFound();
  const ad = row.ad;
  const image = ad.mediaUrl.split(",")[0];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img src={image} alt={ad.title} className="max-h-[520px] w-full object-cover" />
        <div className="p-6 sm:p-10">
          {row.categoryName && <p className="mb-3 text-sm font-bold uppercase tracking-wide text-indigo-600">{row.categoryName}</p>}
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{ad.title}</h1>
          {ad.description && <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">{ad.description}</p>}
          {ad.targetUrl && <a href={ad.targetUrl} className="mt-8 inline-flex rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white">View offer</a>}
        </div>
      </article>
    </main>
  );
}
