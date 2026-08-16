import { db } from "./index";
import { categories, ads } from "./schema";
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

  // 2. High-Quality Ads Seed Data with Multi-City Coordinates & Wide Coverage
  const sampleAds = [
    {
      title: "🍕 50% OFF Artisanal Woodfired Pizza & Craft Pasta",
      categoryId: catMap.get("food-dining"),
      mediaUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85,https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=85,https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/gourmet-pizza",
      latitude: "28.6139000",
      longitude: "77.2090000",
      radiusKm: 5000, // 5000 km radius ensures deals show up worldwide/nationwide for testing
      weightPriority: 10,
      isActive: true,
      description: "Enjoy handcrafted sourdough Neapolitan pizzas baked fresh in woodfired stone ovens. Comes with complimentary garlic knots and craft soda for orders above $25. Valid for dine-in and takeaway!",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "🏋️ Buy 1 Year, Get 6 Months FREE Premium Gym Membership",
      categoryId: catMap.get("health-fitness"),
      mediaUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85,https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/fitzone-premium",
      latitude: "19.0760000", // Mumbai coordinates
      longitude: "72.8777000",
      radiusKm: 5000,
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
      latitude: "12.9716000", // Bengaluru coordinates
      longitude: "77.5946000",
      radiusKm: 5000,
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
      latitude: "9.9312000", // Kochi coordinates
      longitude: "76.2673000",
      radiusKm: 5000,
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
      latitude: "28.4595000", // Gurugram NCR
      longitude: "77.0266000",
      radiusKm: 5000,
      weightPriority: 6,
      isActive: true,
      description: "Upgrade your wardrobe with premium sustainable cotton apparel, luxury accessories, footwear, and designer streetwear collections.",
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
    {
      title: "☕ Buy 1 Get 1 Free Specialty Cold Brew & Fresh Croissants",
      categoryId: catMap.get("food-dining"),
      mediaUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://offerzonline.com/deals/artisan-coffee",
      latitude: "19.0596000", // Bandra Mumbai
      longitude: "72.8295000",
      radiusKm: 5000,
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
      latitude: "12.9352000", // Koramangala Bengaluru
      longitude: "77.6245000",
      radiusKm: 5000,
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
      latitude: "28.5708000", // Noida NCR
      longitude: "77.3261000",
      radiusKm: 5000,
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
      latitude: "9.9816000", // Ernakulam Kochi
      longitude: "76.2999000",
      radiusKm: 5000,
      weightPriority: 6,
      isActive: true,
      description: "Upgrade your living room entertainment with 65-inch OLED HDR display, 120Hz gaming refresh rate, wireless subwoofer, and free wall-mount installation.",
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: "👟 Onam Special: Up to ₹250 OFF Deep Cleaning & 20% OFF Restoration",
      categoryId: catMap.get("services-repair"),
      mediaUrl: "/uploads/ads/WhatsApp Image 2026-08-15 at 6.54.04 PM.jpeg",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "https://instagram.com/theshoeclinic2024",
      latitude: "8.5680160",
      longitude: "76.8737370",
      radiusKm: 5000,
      weightPriority: 10,
      isActive: true,
      description: "Special Onam Offer at The Shoe Clinic Kazhakkottam! Get up to ₹250 OFF on deep shoe cleaning (3 pairs - ₹100 off, 4 pairs - ₹150 off, 5+ pairs - ₹250 off) and flat 20% OFF on all restoration and recoloring services. Free pickup & delivery within 10 km radius!",
      expiresAt: new Date("2026-08-22T23:59:59Z"),
      storeName: "The Shoe Clinic",
      storePhone: "73569 29855",
      storeAddress: "Kazhakkottam, Kerala",
      promoPrice: "Flat 20% OFF",
      discountValue: "Up to ₹250 OFF",
      terms: "1. 3 Pairs - Get ₹100 OFF\n2. 4 Pairs - Get ₹150 OFF\n3. 5 Pairs or More - Get ₹250 OFF\n4. Flat 20% OFF on all Restoration & Recoloring Services.\n5. Limited Period Offer valid from Aug 3rd to 22nd.\n6. Free pickup and delivery within 10 KM radius.",
    },
    {
      title: "🌸 Vastra Boutique Onam Special: Ladies Wear, Jewells, Gifts & Photostat",
      categoryId: catMap.get("retail-shopping"),
      mediaUrl: "/uploads/ads/vasthra.jpeg",
      mediaType: "image",
      adFormat: "responsive",
      targetUrl: "tel:+919495528933",
      latitude: "8.5680160",
      longitude: "76.8737370",
      radiusKm: 5000,
      weightPriority: 9,
      isActive: true,
      description: "ഈ ഓണം വസ്ത്രയോടൊപ്പം! Celebrate Onam in Style with Vastra Boutique Kazhakuttom near Jyothis Kindergarten. Explore our exclusive festive collections in Ladies Wear, beautiful Jewelry, and curated Gifts. We also provide photostat and copying services on-site.",
      expiresAt: new Date("2026-09-15T23:59:59Z"),
      storeName: "Vastra Boutique",
      storePhone: "+91 94955 28933",
      storeAddress: "Near Jyothis Kindergarten, Kazhakuttom, Kerala",
      promoPrice: "Onam Special",
      discountValue: "Exclusive Collections",
      terms: "1. Offers valid on ladies wear, jewells, and gift items.\n2. Store located near Jyothis Kindergarten, Kazhakuttom.\n3. Photostat copying services available in-store.\n4. Call +91 94955 28933 for custom sizes and booking.",
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
