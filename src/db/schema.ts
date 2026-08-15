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
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(), // 'image' | 'gif' | 'video'
  adFormat: varchar("ad_format", { length: 50 }).notNull(), // '300x250' | '728x90' | '1080x1920' | 'responsive'
  targetUrl: text("target_url").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  radiusKm: integer("radius_km").notNull().default(5),
  weightPriority: integer("weight_priority").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsLogs = pgTable("analytics_logs", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").references(() => ads.id, { onDelete: "cascade" }).notNull(),
  eventType: varchar("event_type", { length: 20 }).notNull(), // 'impression' | 'click'
  referrerDomain: varchar("referrer_domain", { length: 255 }),
  userIp: varchar("user_ip", { length: 100 }),
  userLocationName: varchar("user_location_name", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
