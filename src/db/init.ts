import { pool } from "./index";

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    let hasPostGIS = false;
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
      hasPostGIS = true;
      console.log("PostGIS extension enabled.");
    } catch (err: any) {
      console.warn("PostGIS extension not available on this PostgreSQL instance. Falling back to standard lat/lng columns:", err.message);
    }

    // 2. Create Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Ads table
    if (hasPostGIS) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ads (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          media_url TEXT NOT NULL,
          media_type VARCHAR(50) NOT NULL,
          ad_format VARCHAR(50) NOT NULL,
          target_url TEXT NOT NULL,
          latitude DECIMAL(10, 7) NOT NULL,
          longitude DECIMAL(10, 7) NOT NULL,
          radius_km INTEGER NOT NULL DEFAULT 5,
          location GEOGRAPHY(Point, 4326),
          weight_priority INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          description TEXT,
          expires_at TIMESTAMP,
          store_name TEXT,
          store_logo TEXT,
          store_phone VARCHAR(50),
          store_address TEXT,
          original_price VARCHAR(50),
          promo_price VARCHAR(50),
          discount_value VARCHAR(100),
          terms TEXT,
          is_onload_popup BOOLEAN DEFAULT FALSE,
          is_recommended BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_ads_location_gist 
        ON ads USING GIST (location);
      `);
    } else {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ads (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          media_url TEXT NOT NULL,
          media_type VARCHAR(50) NOT NULL,
          ad_format VARCHAR(50) NOT NULL,
          target_url TEXT NOT NULL,
          latitude DECIMAL(10, 7) NOT NULL,
          longitude DECIMAL(10, 7) NOT NULL,
          radius_km INTEGER NOT NULL DEFAULT 5,
          weight_priority INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          description TEXT,
          expires_at TIMESTAMP,
          store_name TEXT,
          store_logo TEXT,
          store_phone VARCHAR(50),
          store_address TEXT,
          original_price VARCHAR(50),
          promo_price VARCHAR(50),
          discount_value VARCHAR(100),
          terms TEXT,
          is_onload_popup BOOLEAN DEFAULT FALSE,
          is_recommended BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // 4. Create Analytics Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_logs (
        id SERIAL PRIMARY KEY,
        ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
        event_type VARCHAR(20) NOT NULL,
        referrer_domain VARCHAR(255),
        user_ip VARCHAR(100),
        user_location_name VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Seed initial categories if empty
    const catCheck = await client.query(`SELECT COUNT(*) FROM categories;`);
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO categories (id, name, slug, icon) VALUES
        (1, 'Retail & Shopping', 'retail-shopping', 'shopping-bag'),
        (2, 'Food & Dining', 'food-dining', 'utensils'),
        (3, 'Services & Repair', 'services-repair', 'wrench'),
        (4, 'Entertainment & Events', 'entertainment-events', 'ticket'),
        (5, 'Health & Fitness', 'health-fitness', 'heart-pulse'),
        (6, 'Electronics & Tech', 'electronics-tech', 'laptop');
      `);
      await client.query(`SELECT setval('categories_id_seq', 6, true);`);
    }

    // 6. Seed initial ads if empty
    const adCheck = await client.query(`SELECT COUNT(*) FROM ads;`);
    if (parseInt(adCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO ads (id, title, category_id, media_url, media_type, ad_format, target_url, latitude, longitude, radius_km, weight_priority, is_active) VALUES
        (1, '50% Off Gourmet Pizza & Pasta Combo', 2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', 'image', '300x250', 'https://offerzonline.com/deals/pizza', 28.6139, 77.209, 10, 5, true),
        (2, 'Buy 1 Get 1 Free Premium Gym Membership', 5, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80', 'image', 'responsive', 'https://offerzonline.com/deals/fitness', 28.6139, 77.209, 15, 4, true),
        (3, 'Electronics Clearance - Up to 40% Off Laptops', 6, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', 'image', '728x90', 'https://offerzonline.com/deals/laptops', 28.6139, 77.209, 25, 3, true);
      `);
      await client.query(`SELECT setval('ads_id_seq', 3, true);`);
    }

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    client.release();
  }
}
