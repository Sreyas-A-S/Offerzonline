import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

let MOCK_CATEGORIES = [
  { id: 1, name: "Food & Dining", slug: "food-dining" },
  { id: 2, name: "Retail & Shopping", slug: "retail-shopping" },
  { id: 3, name: "Electronics & Tech", slug: "electronics-tech" },
  { id: 4, name: "Health & Fitness", slug: "health-fitness" },
  { id: 5, name: "Services & Repair", slug: "services-repair" },
  { id: 6, name: "Entertainment & Events", slug: "entertainment-events" },
];

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM categories ORDER BY id ASC");
      return NextResponse.json({ categories: res.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ categories: MOCK_CATEGORIES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *",
          [name, catSlug]
        );
        return NextResponse.json({ success: true, category: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (dbErr) {
      // Fallback in-memory insertion
      const newCat = {
        id: MOCK_CATEGORIES.length + 1,
        name,
        slug: catSlug,
      };
      MOCK_CATEGORIES.push(newCat);
      return NextResponse.json({ success: true, category: newCat });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
