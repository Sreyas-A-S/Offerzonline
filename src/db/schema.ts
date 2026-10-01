import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, text, decimal, integer, boolean, timestamp, customType } from "drizzle-orm/pg-core";

// Custom PostGIS point type for Drizzle
const geographyPoint = customType<{ data: { lat: number; lng: number }; driverData: string }>({
  dataType() {
    return "geography(Point, 4362)";
  },
  toDriver(value) {
    return `ST_SetSRID(ST_MakePoint(${value.lng}, ${value.lat}), 4326)`;
  },
  fromDriver(value) {
    // Parsing returned PostGIS point string format or hex
    return { lat: 0, lng: 0 };
  },
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().default(sql`gen_random_uuid()::text`),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // 'image' | 'gif' | 'video'
  adFormat: varchar("ad_format", { length: 50 }).notNull(), // '300x250' | '728x90' | '1080x1920' | 'responsive'
  targetUrl: text("target_url").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  radiusKm: integer("radius_km").notNull().default(5),
  weightPriority: integer("weight_priority").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  isOnloadPopup: boolean("is_onload_popup").default(false),
  isRecommended: boolean("is_recommended").default(false),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  storeName: text("store_name"),
  storeLogo: text("store_logo"),
  storePhone: varchar("store_phone", { length: 50 }),
  storeAddress: text("store_address"),
  originalPrice: varchar("original_price", { length: 50 }),
  promoPrice: varchar("promo_price", { length: 50 }),
  discountValue: varchar("discount_value", { length: 100 }),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsLogs = pgTable("analytics_logs", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").references(() => ads.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'page_view' | 'impression' | 'click'
  pagePath: varchar("page_path", { length: 255 }),
  visitorId: varchar("visitor_id", { length: 100 }), // Persistent anonymous device UUID
  referrerDomain: varchar("referrer_domain", { length: 255 }),
  userIp: varchar("user_ip", { length: 100 }),
  userAgent: text("user_agent"),
  userLocationName: varchar("user_location_name", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streamerUsers = pgTable("streamer_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  storeName: varchar("store_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'active' | 'suspended' | 'pending'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streams = pgTable("streams", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().default(sql`gen_random_uuid()::text`),
  userId: integer("user_id").references(() => streamerUsers.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull().default("video"), // 'video' | 'gif' | 'image'
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: decimal("duration_seconds").default("0"),
  targetUrl: text("target_url"),
  ctaText: varchar("cta_text", { length: 100 }).default("Learn More"),
  storeName: text("store_name"),
  storeLogo: text("store_logo"),
  storePhone: varchar("store_phone", { length: 50 }),
  storeAddress: text("store_address"),
  originalPrice: varchar("original_price", { length: 50 }),
  promoPrice: varchar("promo_price", { length: 50 }),
  discountValue: varchar("discount_value", { length: 100 }),
  terms: text("terms"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  aspectRatio: varchar("aspect_ratio", { length: 20 }).default("16:9"), // '16:9' | '9:16' | '1:1' | '4:3'
  autoplay: boolean("autoplay").default(true),
  loop: boolean("loop").default(false),
  mutedDefault: boolean("muted_default").default(false),
  isActive: boolean("is_active").notNull().default(true),
  isDemo: boolean("is_demo").default(false),
  viewsCount: integer("views_count").default(0),
  clicksCount: integer("clicks_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streamAnalytics = pgTable("stream_analytics", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => streams.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'load' | 'play' | 'progress_25' | 'progress_50' | 'progress_75' | 'complete' | 'click_cta' | 'click_whatsapp'
  watchTimeSeconds: decimal("watch_time_seconds").default("0"),
  visitorId: varchar("visitor_id", { length: 100 }),
  userIp: varchar("user_ip", { length: 100 }),
  userAgent: text("user_agent"),
  deviceType: varchar("device_type", { length: 50 }),
  userLocationName: varchar("user_location_name", { length: 255 }),
  referrerDomain: varchar("referrer_domain", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});
