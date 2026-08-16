import fs from "fs";
import path from "path";
import { Pool } from "pg";

let connectionString = "postgresql://postgres:postgres@localhost:5432/offerzonline";
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/DATABASE_URL=["']?([^"\n\r]+)["']?/);
    if (match && match[1]) {
      connectionString = match[1];
      console.log("Loaded DATABASE_URL from .env.local");
    }
  }
} catch (e) {
  console.warn("Could not read .env.local, using fallback");
}

const localPool = new Pool({ connectionString });

async function runAlterations() {
  const client = await localPool.connect();
  try {
    console.log("Checking columns in ads table...");

    const columnsToAdd = [
      { name: "description", type: "TEXT" },
      { name: "expires_at", type: "TIMESTAMP" },
      { name: "store_name", type: "TEXT" },
      { name: "store_logo", type: "TEXT" },
      { name: "store_phone", type: "VARCHAR(50)" },
      { name: "store_address", type: "TEXT" },
      { name: "original_price", type: "VARCHAR(50)" },
      { name: "promo_price", type: "VARCHAR(50)" },
      { name: "discount_value", type: "VARCHAR(100)" },
      { name: "terms", type: "TEXT" }
    ];

    for (const col of columnsToAdd) {
      const checkRes = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='ads' AND column_name=$1
      `, [col.name]);

      if (checkRes.rows.length === 0) {
        console.log(`Adding column ${col.name} (${col.type}) to ads table...`);
        await client.query(`ALTER TABLE ads ADD COLUMN ${col.name} ${col.type};`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    console.log("Database alteration complete!");
  } catch (error) {
    console.error("Error running alterations:", error);
  } finally {
    client.release();
    process.exit(0);
  }
}

runAlterations();
