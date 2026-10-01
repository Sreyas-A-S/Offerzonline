import { pool } from "./index";

export async function migrateStreams() {
  const client = await pool.connect();
  try {
    console.log("Creating streamer_users, streams and stream_analytics tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS streamer_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        store_name VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS streams (
        id SERIAL PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::text,
        user_id INTEGER REFERENCES streamer_users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        media_url TEXT NOT NULL,
        media_type VARCHAR(50) NOT NULL DEFAULT 'video',
        thumbnail_url TEXT,
        duration_seconds NUMERIC DEFAULT 0,
        target_url TEXT,
        cta_text VARCHAR(100) DEFAULT 'Learn More',
        store_name TEXT,
        store_logo TEXT,
        store_phone VARCHAR(50),
        store_address TEXT,
        original_price VARCHAR(50),
        promo_price VARCHAR(50),
        discount_value VARCHAR(100),
        terms TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        aspect_ratio VARCHAR(20) DEFAULT '16:9',
        autoplay BOOLEAN DEFAULT TRUE,
        loop BOOLEAN DEFAULT FALSE,
        muted_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        views_count INTEGER DEFAULT 0,
        clicks_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure user_id column exists if table was created previously
      ALTER TABLE streams ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES streamer_users(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS stream_analytics (
        id SERIAL PRIMARY KEY,
        stream_id INTEGER REFERENCES streams(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        watch_time_seconds NUMERIC DEFAULT 0,
        visitor_id VARCHAR(100),
        user_ip VARCHAR(100),
        user_agent TEXT,
        device_type VARCHAR(50),
        user_location_name VARCHAR(255),
        referrer_domain VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_stream_analytics_stream_id ON stream_analytics(stream_id);
      CREATE INDEX IF NOT EXISTS idx_stream_analytics_event ON stream_analytics(event_type);
      CREATE INDEX IF NOT EXISTS idx_stream_analytics_timestamp ON stream_analytics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id);
    `);
    console.log("✅ Streams & Streamer Users database schema successfully applied!");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateStreams()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
