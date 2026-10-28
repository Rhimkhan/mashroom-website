import { NextRequest, NextResponse } from "next/server";
import { getLocalProducts, saveLocalProducts } from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { Product } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Normalize database row to application Product interface
function normalizeProductRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    subtitle: row.subtitle || row.description?.slice(0, 80) + "...",
    description: row.description || "",
    flavour: row.flavour,
    rating: Number(row.rating) || 5.0,
    reviewsCount: Number(row.reviews_count) || 10,
    image: row.image_url || row.image || "/images/hero-pickle.jpg",
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image_url || row.image || "/images/hero-pickle.jpg"],
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    shelfLife: row.shelf_life || row.shelfLife || "12 Months",
    spiceLevel: row.spice_level || row.spiceLevel || "Medium",
    isFeatured: Boolean(row.is_featured ?? true),
    stockCount: Number(row.stock ?? row.stock_count ?? 50),
    sizes: Array.isArray(row.sizes) ? row.sizes : [
      { size: "250g", price: 299, originalPrice: 350, inStock: true },
      { size: "500g", price: 549, originalPrice: 650, inStock: true },
      { size: "1kg", price: 999, originalPrice: 1200, inStock: true },
    ],
    badges: Array.isArray(row.badges) ? row.badges : ["Fresh Harvest"],
  };
}

export async function GET() {
  try {
    // 1. If Supabase is connected, attempt to fetch from Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        const normalized = data.map(normalizeProductRow);
        return NextResponse.json(
          { success: true, products: normalized, source: "supabase" },
          {
            headers: {
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }

      if (error) {
        console.error("[CRITICAL] Supabase products GET error:", error);
      }
    }

    // In production, strictly NEVER fall back to in-memory store
    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL] Products GET failed: Supabase is unreachable in production.");
      return NextResponse.json(
        { success: false, error: "Unable to load product catalog from database", products: [] },
        { status: 500 }
      );
    }

    // 2. Fallback to local persistent store / seed data (development only)
    const local = getLocalProducts();
    const products = local.length > 0 ? local : INITIAL_PRODUCTS;
    return NextResponse.json(
      { success: true, products, source: "local" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Products GET error:", error);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Database error: unable to load products", products: [] },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: true, products: INITIAL_PRODUCTS, source: "fallback" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`products_post:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many product update requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid product payload" }, { status: 400 });
    }

    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Product name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    // 1. If Supabase is connected, insert/update in Supabase
    if (supabase) {
      const dbPayload = {
        id: body.id || `prod-${Date.now()}`,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        subtitle: body.subtitle || "",
        flavour: body.flavour || "Classic",
        description: body.description || "",
        ingredients: body.ingredients || [],
        shelf_life: body.shelfLife || "12 Months",
        image_url: body.image || body.imageUrl || "/images/hero-pickle.jpg",
        image: body.image || body.imageUrl || "/images/hero-pickle.jpg",
        sizes: body.sizes || [],
        stock: Number(body.stockCount || body.stock || 50),
        stock_count: Number(body.stockCount || body.stock || 50),
        rating: Number(body.rating || 5.0),
        reviews_count: Number(body.reviewsCount || 0),
        gallery: body.gallery || [body.image || "/images/hero-pickle.jpg"],
        spice_level: body.spiceLevel || "Medium",
        is_featured: Boolean(body.isFeatured),
        badges: body.badges || [],
      };

      const { data, error } = await supabase
        .from("products")
        .upsert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, product: normalizeProductRow(data), source: "supabase" });
      }

      if (error) {
        console.error("[CRITICAL] Supabase product upsert error:", error);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Failed to save product to Supabase database" },
            { status: 500 }
          );
        }
      }
    }

    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL] Cannot save product in production: Supabase is offline");
      return NextResponse.json(
        { success: false, error: "Database offline. Product cannot be saved in production." },
        { status: 500 }
      );
    }

    // 2. Local store fallback (development only)
    const current = getLocalProducts();
    if (body.id) {
      const index = current.findIndex((p) => p.id === body.id);
      if (index !== -1) {
        current[index] = { ...current[index], ...body };
        saveLocalProducts(current);
        return NextResponse.json({ success: true, product: current[index], source: "local" });
      }
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle: body.subtitle || "Oyster Mushroom Pickle",
      description: body.description || "",
      flavour: body.flavour || "Special Blend",
      rating: 5.0,
      reviewsCount: 1,
      image: body.image || "/images/hero-pickle.jpg",
      gallery: body.gallery || [body.image || "/images/hero-pickle.jpg"],
      ingredients: body.ingredients || ["Mushroom", "Mustard Oil", "Vinegar", "Indian Spices"],
      shelfLife: body.shelfLife || "12 Months",
      spiceLevel: body.spiceLevel || "Medium",
      isFeatured: Boolean(body.isFeatured),
      stockCount: Number(body.stockCount) || 50,
      sizes: body.sizes || [
        { size: "250g", price: 299, originalPrice: 350, inStock: true },
        { size: "500g", price: 549, originalPrice: 650, inStock: true },
        { size: "1kg", price: 999, originalPrice: 1200, inStock: true },
      ],
      badges: body.badges || ["New Harvest"],
    };

    const updated = [newProduct, ...current];
    saveLocalProducts(updated);
    return NextResponse.json({ success: true, product: newProduct, source: "local" }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`products_patch:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, stockCount } = body || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const newStock = Number(stockCount);
    if (isNaN(newStock) || newStock < 0) {
      return NextResponse.json({ success: false, error: "Invalid stock value" }, { status: 400 });
    }

    if (supabase) {
      await supabase
        .from("products")
        .update({ stock_count: newStock, stock: newStock })
        .eq("id", id);
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalProducts();
      const idx = current.findIndex((p) => p.id === id);
      if (idx !== -1) {
        current[idx].stockCount = newStock;
        saveLocalProducts(current);
      }
    }

    return NextResponse.json({ success: true, id, stockCount: newStock });
  } catch (error) {
    console.error("Products PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`products_delete:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many delete requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      console.error("[CRITICAL] Product deletion blocked: Supabase is offline in production");
      return NextResponse.json(
        { success: false, error: "Database offline. Product cannot be deleted in production." },
        { status: 500 }
      );
    }

    if (supabase) {
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
      if (deleteError) {
        console.error("[CRITICAL] Supabase product delete error:", deleteError);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Failed to delete product from database" },
            { status: 500 }
          );
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalProducts();
      const updated = current.filter((p) => p.id !== id);
      saveLocalProducts(updated);
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Products DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
