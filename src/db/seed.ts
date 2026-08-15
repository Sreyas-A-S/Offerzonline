import { db } from "./src/db";
import { categories, ads } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Categories and High-Quality Sample Ads...");

  // 1. Seed Categories
  const categoryData = [
    { name: "Food & Dining", slug: "food-dining", icon: "Utensils" },
    { name: "Retail & Shopping", slug: "retail-shopping", icon: "ShoppingBag" },
    { name: "Electronics & Tech", slug: "electronics-tech", icon: "Smartphone" },
    { name: "Health & Fitness", slug: "health-fitness", icon: "Dumbbell" },
    { name: "Services & Repair", slug: "services-repair", icon: "Store" },
    { name: "Entertainment & Events", slug: "entertainment-events", icon: "Sparkles" },
  ];

  for (const cat of categoryData) {
    const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
    }
  }

  const allCategories = await db.select().from(categories);
  const catMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  // 2. High-Quality Ads Seed Data
  const sampleAds = [
    {
      title: "🍕 50% OFF Artisanal Woodfired Pizza & Craft Pasta",
      categoryId: catMap.get("food-dining"),
      mediaUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/gourmet-pizza",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 10,
      isActive: true,
      description: "Enjoy handcrafted sourdough Neapolitan pizzas baked fresh in woodfired stone ovens. Comes with complimentary garlic knots and craft soda for orders above $25. Valid for dine-in and takeaway!",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      title: "🏋️ Buy 1 Year, Get 6 Months FREE Premium Gym Membership",
      categoryId: catMap.get("health-fitness"),
      mediaUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/fitzone-premium",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 9,
      isActive: true,
      description: "Transform your fitness journey with 24/7 access to state-of-the-art strength gear, sauna, Olympic swimming pool, and free personal trainer consultations for all new signups!",
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
      title: "🎧 Flat $100 OFF Wireless Noise-Canceling Headphones",
      categoryId: catMap.get("electronics-tech"),
      mediaUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/audiopro-headphones",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 8,
      isActive: true,
      description: "Immerse in pure acoustics with active noise cancellation, 40-hour continuous battery life, ultra-plush memory foam earcups, and dual multi-device Bluetooth pairing.",
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      title: "✨ Luxury Spa & Wellness Treatment - 40% OFF Weekend Package",
      categoryId: catMap.get("services-repair"),
      mediaUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/luxury-spa",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 7,
      isActive: true,
      description: "Revitalize your body & soul with Swedish full-body massages, organic hot stone therapy, herbal steam baths, and rejuvenating facial treatments.",
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: "🛍️ Exclusive Designer Summer Collection - Up to 60% OFF",
      categoryId: catMap.get("retail-shopping"),
      mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/summer-fashion",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 6,
      isActive: true,
      description: "Upgrade your wardrobe with premium sustainable cotton apparel, luxury accessories, footwear, and designer streetwear collections.",
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    {
      title: "☕ Buy 1 Get 1 Free Specialty Cold Brew & Fresh Croissants",
      categoryId: catMap.get("food-dining"),
      mediaUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/artisan-coffee",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 9,
      isActive: true,
      description: "Kickstart your day with single-origin nitro cold brews paired with freshly baked butter croissants and artisan pastries at local boutique cafes.",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "🎬 2-for-1 VIP Cinema Tickets & Free Large Popcorn Combo",
      categoryId: catMap.get("entertainment-events"),
      mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/vip-cinema",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 8,
      isActive: true,
      description: "Watch the latest blockbuster movies in recliner luxury with Dolby Atmos immersive sound. Includes complimentary double butter popcorn & soft drinks!",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "🚗 Full Car Detailing, Polish & Ceramic Coating - 35% OFF",
      categoryId: catMap.get("services-repair"),
      mediaUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/auto-detail",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 7,
      isActive: true,
      description: "Give your car a showroom shine with hydrophobic ceramic paint protection, deep interior steam sanitization, wheel alignment, and engine bay wash.",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "📱 4K Smart TV & Home Theater Soundbar Super Sale",
      categoryId: catMap.get("electronics-tech"),
      mediaUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/home-theater",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 50,
      weightPriority: 6,
      isActive: true,
      description: "Upgrade your living room entertainment with 65-inch OLED HDR display, 120Hz gaming refresh rate, wireless subwoofer, and free wall-mount installation.",
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const adData of sampleAds) {
    const existing = await db.select().from(ads).where(eq(ads.title, adData.title));
    if (existing.length === 0) {
      await db.insert(ads).values(adData as any);
      console.log(`✅ Inserted: ${adData.title}`);
    }
  }

  console.log("🎉 Seeding complete successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
