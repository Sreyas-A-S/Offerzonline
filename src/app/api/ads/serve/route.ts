import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

// Fallback mock categories and ads if PostgreSQL credentials are not yet configured in local .env
const MOCK_CATEGORIES = [
  { id: 1, name: "Retail & Shopping", slug: "retail-shopping" },
  { id: 2, name: "Food & Dining", slug: "food-dining" },
  { id: 3, name: "Services & Repair", slug: "services-repair" },
  { id: 4, name: "Entertainment & Events", slug: "entertainment-events" },
  { id: 5, name: "Health & Fitness", slug: "health-fitness" },
  { id: 6, name: "Electronics & Tech", slug: "electronics-tech" },
];

const MOCK_ADS = [
  {
    id: 1,
    title: "50% Off Gourmet Pizza & Pasta Combo",
    category_name: "Food & Dining",
    category_id: 2,
    media_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    ad_format: "300x250",
    target_url: "https://offerzonline.com/deals/pizza",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 10,
    weight_priority: 5,
    distance_km: 1.2,
    views: 0,
    clicks: 0,
    ctr: 0,
    is_active: true,
    description: "Enjoy our signature wood-fired gourmet pizza with fresh mozzarella, premium basil, and house sauce, served with a choice of hand-rolled pasta.",
    store_name: "Luigi's Gourmet Pizzeria",
    store_logo: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=100&auto=format&fit=crop&q=80",
    store_phone: "+1 (555) 123-4567",
    store_address: "456 Pizza Plaza, Food District",
    original_price: "$30.00",
    promo_price: "$15.00",
    discount_value: "50% OFF",
    terms: "Valid for dine-in and takeaway only. Cannot be combined with other offers. One coupon per table."
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Free Premium Gym Membership",
    category_name: "Health & Fitness",
    category_id: 5,
    media_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    ad_format: "responsive",
    target_url: "https://offerzonline.com/deals/fitness",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 15,
    weight_priority: 4,
    distance_km: 3.4,
    views: 0,
    clicks: 0,
    ctr: 0,
    is_active: true,
    description: "Unlock unlimited access to our state-of-the-art strength training zone, cardio deck, group classes, and sauna facilities.",
    store_name: "Iron Temple Fitness",
    store_logo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100&auto=format&fit=crop&q=80",
    store_phone: "+1 (555) 987-6543",
    store_address: "789 Power Ave, Muscle Beach",
    original_price: "$99/mo",
    promo_price: "$49/mo",
    discount_value: "Buy 1 Get 1 Free",
    terms: "New members only. Minimum 3-month commitment required. Bring a friend to redeem the second membership."
  },
  {
    id: 3,
    title: "Electronics Clearance - Up to 40% Off Laptops",
    category_name: "Electronics & Tech",
    category_id: 6,
    media_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    ad_format: "728x90",
    target_url: "https://offerzonline.com/deals/laptops",
    latitude: 28.6139,
    longitude: 77.209,
    radius_km: 25,
    weight_priority: 3,
    distance_km: 5.8,
    views: 0,
    clicks: 0,
    ctr: 0,
    is_active: true,
    description: "Upgrade your workstation with the latest Intel Core i7 and AMD Ryzen laptops. High-speed SSDs and dual-channel memory included.",
    store_name: "TechVantage Computers",
    store_logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100&auto=format&fit=crop&q=80",
    store_phone: "+1 (555) 456-7890",
    store_address: "101 Silicon Valley St, Tech Hub",
    original_price: "$1,299",
    promo_price: "$779",
    discount_value: "Up to 40% OFF",
    terms: "Available while stocks last. Warranty included. Excludes custom configurations."
  }
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const adId = searchParams.get("id");
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const categoryId = searchParams.get("category");
  const format = searchParams.get("format");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const client = await pool.connect();
    try {
      // Direct ad fetch by ID or UUID for shared link opening
      if (adId) {
        const isNumeric = /^\d+$/.test(adId);
        const result = await client.query(`
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE ${isNumeric ? "a.id = $1" : "a.uuid = $1"}
        `, [isNumeric ? parseInt(adId, 10) : adId]);
        return NextResponse.json({ ads: result.rows });
      }

      let query = "";
      const queryParams: any[] = [];

      // Check if location column exists
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='ads' AND column_name='location'
      `);
      const hasLocationCol = colCheck.rows.length > 0;

      if (hasLocationCol) {
        query = `
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms,
            ROUND(
              (ST_Distance(
                a.location,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
              ) / 1000)::numeric, 2
            ) as distance_km
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE a.is_active = TRUE
        `;
        queryParams.push(lng, lat);
        let paramCounter = 3;

        if (lat !== 0 || lng !== 0) {
          query += ` AND ST_DWithin(a.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, a.radius_km * 1000)`;
        }

        if (categoryId && categoryId !== "all") {
          query += ` AND a.category_id = $${paramCounter}`;
          queryParams.push(parseInt(categoryId, 10));
          paramCounter++;
        }

        if (format) {
          query += ` AND a.ad_format = $${paramCounter}`;
          queryParams.push(format);
          paramCounter++;
        }

        query += ` ORDER BY a.weight_priority DESC, distance_km ASC LIMIT $${paramCounter}`;
        queryParams.push(limit);
      } else {
        // Fallback to standard Haversine distance query for PostGIS-less PostgreSQL setup
        query = `
          SELECT 
            a.id,
            a.uuid,
            a.title,
            a.category_id,
            c.name as category_name,
            a.media_url,
            a.media_type,
            a.ad_format,
            a.target_url,
            a.latitude,
            a.longitude,
            a.radius_km,
            a.weight_priority,
            a.description,
            a.expires_at,
            a.store_name,
            a.store_logo,
            a.store_phone,
            a.store_address,
            a.original_price,
            a.promo_price,
            a.discount_value,
            a.terms,
            ROUND(
              (6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                  cos(radians($2)) * cos(radians(a.latitude)) *
                  cos(radians(a.longitude) - radians($1)) +
                  sin(radians($2)) * sin(radians(a.latitude))
                ))
              ))::numeric, 2
            ) as distance_km
          FROM ads a
          LEFT JOIN categories c ON a.category_id = c.id
          WHERE a.is_active = TRUE
        `;
        queryParams.push(lng, lat);
        let paramCounter = 3;

        if (lat !== 0 && lng !== 0) {
          query += ` AND (6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians($2)) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians($1)) + sin(radians($2)) * sin(radians(a.latitude)))))) <= a.radius_km`;
        }

        if (categoryId && categoryId !== "all") {
          query += ` AND a.category_id = $${paramCounter}`;
          queryParams.push(parseInt(categoryId, 10));
          paramCounter++;
        }

        if (format) {
          query += ` AND a.ad_format = $${paramCounter}`;
          queryParams.push(format);
          paramCounter++;
        }

        query += ` ORDER BY a.weight_priority DESC, distance_km ASC LIMIT $${paramCounter}`;
        queryParams.push(limit);
      }

      const result = await client.query(query, queryParams);

      return NextResponse.json(
        { ads: result.rows },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.warn("PostgreSQL connection fallback triggered in /api/ads/serve:", error.message);
    
    // Smooth fallback to mock ads so frontend/UI never breaks while DB credentials are being set up
    if (adId) {
      const match = MOCK_ADS.find((a) => a.id === parseInt(adId, 10));
      return NextResponse.json({ ads: match ? [match] : [] }, { status: 200 });
    }

    let filteredMockAds = MOCK_ADS;
    if (categoryId && categoryId !== "all") {
      filteredMockAds = filteredMockAds.filter((a) => a.category_id === parseInt(categoryId, 10));
    }

    return NextResponse.json({ ads: filteredMockAds }, { status: 200 });
  }
}
