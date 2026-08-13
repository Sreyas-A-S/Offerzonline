import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

let MOCK_CATEGORIES = [
  { id: 1, name: "Food & Dining", slug: "food-dining", icon: null },
  { id: 2, name: "Retail & Shopping", slug: "retail-shopping", icon: null },
  { id: 3, name: "Electronics & Tech", slug: "electronics-tech", icon: null },
  { id: 4, name: "Health & Fitness", slug: "health-fitness", icon: null },
  { id: 5, name: "Services & Repair", slug: "services-repair", icon: null },
  { id: 6, name: "Entertainment & Events", slug: "entertainment-events", icon: null },
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
    const { name, slug, icon } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          "INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) RETURNING *",
          [name, catSlug, icon || null]
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
        icon: icon || null,
      };
      MOCK_CATEGORIES.push(newCat);
      return NextResponse.json({ success: true, category: newCat });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    try {
      const client = await pool.connect();
      try {
        // Nullify foreign key references in ads table first
        await client.query("UPDATE ads SET category_id = NULL WHERE category_id = $1", [parseInt(id, 10)]);
        // Delete category
        await client.query("DELETE FROM categories WHERE id = $1", [parseInt(id, 10)]);
        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    } catch (dbErr) {
      // Fallback mock deletion
      MOCK_CATEGORIES = MOCK_CATEGORIES.filter((c) => c.id !== parseInt(id, 10));
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
