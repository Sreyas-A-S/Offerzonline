import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";
import { isAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized. Admin authentication required." }, { status: 401 });
  }
  try {
    const client = await pool.connect();
    try {
      // 1. Ensure categories table exists and seed if empty
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          icon VARCHAR(100)
        );
      `);

      const catCheck = await client.query(`SELECT COUNT(*)::int as count FROM categories`);
      if (catCheck.rows[0].count === 0) {
        await client.query(`
          INSERT INTO categories (id, name, slug, icon) VALUES
          (1, 'Retail & Shopping', 'retail-shopping', 'shopping-bag'),
          (2, 'Food & Dining', 'food-dining', 'utensils'),
          (3, 'Services & Repair', 'services-repair', 'wrench'),
          (4, 'Entertainment & Events', 'entertainment-events', 'ticket'),
          (5, 'Health & Fitness', 'health-fitness', 'heart-pulse'),
          (6, 'Electronics & Tech', 'electronics-tech', 'laptop')
          ON CONFLICT (id) DO NOTHING;
        `);
        await client.query(`SELECT setval('categories_id_seq', 6, true);`);
      }

      // 2. Ensure ads table exists and seed if empty
      await client.query(`
        CREATE TABLE IF NOT EXISTS ads (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          media_url TEXT NOT NULL,
          media_type VARCHAR(20) NOT NULL DEFAULT 'image',
          ad_format VARCHAR(50) NOT NULL DEFAULT 'responsive',
          target_url TEXT NOT NULL,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          radius_km DOUBLE PRECISION DEFAULT 10,
          weight_priority INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          description TEXT,
          expires_at TIMESTAMP,
          store_name VARCHAR(255),
          store_logo TEXT,
          store_phone VARCHAR(50),
          store_address TEXT,
          original_price VARCHAR(50),
          promo_price VARCHAR(50),
          discount_value VARCHAR(50),
          terms TEXT,
          is_onload_popup BOOLEAN DEFAULT FALSE,
          is_recommended BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const adCheck = await client.query(`SELECT COUNT(*)::int as count FROM ads`);
      if (adCheck.rows[0].count === 0) {
        await client.query(`
          INSERT INTO ads (
            id, title, category_id, media_url, media_type, ad_format, target_url, 
            latitude, longitude, radius_km, weight_priority, is_active, description,
            store_name, store_phone, store_address, original_price, promo_price, discount_value
          ) VALUES
          (1, '50% Off Gourmet Pizza & Pasta Combo', 2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', 'image', '300x250', 'https://offerzonline.com/deals/pizza', 28.6139, 77.209, 10, 5, true, 'Enjoy our signature wood-fired gourmet pizza with fresh mozzarella and pasta.', 'Luigis Gourmet Pizzeria', '+1 (555) 123-4567', '456 Pizza Plaza, Food District', '$30.00', '$15.00', '50% OFF'),
          (2, 'Buy 1 Get 1 Free Premium Gym Membership', 5, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80', 'image', 'responsive', 'https://offerzonline.com/deals/fitness', 28.6139, 77.209, 15, 4, true, 'Unlimited access to strength training zone, cardio deck, and sauna.', 'Iron Temple Fitness', '+1 (555) 987-6543', '789 Power Ave, Muscle Beach', '$99/mo', '$49/mo', 'Buy 1 Get 1 Free'),
          (3, 'Electronics Clearance - Up to 40% Off Laptops', 6, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', 'image', '728x90', 'https://offerzonline.com/deals/laptops', 28.6139, 77.209, 25, 3, true, 'High-speed SSDs and dual-channel memory laptops on clearance sale.', 'TechVantage Computers', '+1 (555) 321-7654', '101 Silicon Valley Road', '$899', '$599', '40% OFF')
          ON CONFLICT (id) DO NOTHING;
        `);
        await client.query(`SELECT setval('ads_id_seq', 3, true);`);
      }

      // 3. Ensure analytics_logs table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics_logs (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
          event_type VARCHAR(50) NOT NULL,
          page_path VARCHAR(255),
          visitor_id VARCHAR(100),
          referrer_domain VARCHAR(255),
          user_ip VARCHAR(100),
          user_agent TEXT,
          user_location_name VARCHAR(255),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const totalAds = (await client.query(`SELECT COUNT(*)::int as count FROM ads`)).rows[0].count;
      const totalLogs = (await client.query(`SELECT COUNT(*)::int as count FROM analytics_logs`)).rows[0].count;

      return NextResponse.json({
        success: true,
        message: "Database synchronized and restored successfully.",
        stats: { totalAds, totalLogs },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
