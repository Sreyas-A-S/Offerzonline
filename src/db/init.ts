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
        INSERT INTO categories (name, slug, icon) VALUES
        ('Retail & Shopping', 'retail-shopping', 'shopping-bag'),
        ('Food & Dining', 'food-dining', 'utensils'),
        ('Services & Repair', 'services-repair', 'wrench'),
        ('Entertainment & Events', 'entertainment-events', 'ticket'),
        ('Health & Fitness', 'health-fitness', 'heart-pulse'),
        ('Electronics & Tech', 'electronics-tech', 'laptop');
      `);
    }

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    client.release();
  }
}
