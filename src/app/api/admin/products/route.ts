import { NextRequest, NextResponse } from "next/server";
import { getLocalProducts, saveLocalProducts } from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { Product, ProductPriceOption } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

function normalizeSizes(rawSizes: unknown): ProductPriceOption[] {
  let list: unknown[] = [];
  if (Array.isArray(rawSizes)) {
    list = rawSizes;
  } else if (typeof rawSizes === "string") {
    try {
      const parsed = JSON.parse(rawSizes);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }
  if (list.length === 0) {
    return [{ size: "400 g", price: 399, originalPrice: 399, inStock: true }];
  }
  return list.map((s) => {
    const item = (s && typeof s === "object" ? s : {}) as Record<string, unknown>;
    const price = Number(item.price) || 399;
    return {
      size: String(item.size || "400 g"),
      price,
      originalPrice: Number(item.originalPrice ?? price) || price,
      inStock: item.inStock !== false,
    };
  });
}

function normalizeAdminProductRow(row: Record<string, unknown>): Product {
  const name = String(row.name ?? "Mushroom Mela Pickle");
  const desc = String(row.description ?? "");
  const img = String(row.image_url ?? row.image ?? "/images/products/mushroom-mela-front.jpg");
  return {
    id: String(row.id ?? `prod-${Date.now()}`),
    name,
    slug: String(row.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    subtitle: String(row.subtitle ?? (desc ? `${desc.slice(0, 80)}...` : "")),
    description: desc,
    flavour: String(row.flavour ?? "Oyster Mushroom"),
    rating: Number(row.rating) || 0,
    reviewsCount: Number(row.reviews_count ?? row.reviewsCount) || 0,
    image: img,
    gallery:
      Array.isArray(row.gallery) && row.gallery.length > 0
        ? row.gallery.map(String)
        : [img],
    ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(String) : [],
    shelfLife: String(
      row.shelf_life ??
        row.shelfLife ??
        "Store in a cool, dry place, keep away from direct sunlight, use a clean dry spoon."
    ),
    spiceLevel: (String(row.spice_level ?? row.spiceLevel ?? "Medium") as
      | "Mild"
      | "Medium"
      | "Hot"
      | "Extra Spicy"),
    isFeatured: Boolean(row.is_featured ?? row.isFeatured ?? true),
    stockCount: Number(row.stock_count ?? row.stock ?? row.stockCount ?? 0),
    sizes: normalizeSizes(row.sizes),
    badges: Array.isArray(row.badges) ? row.badges.map(String) : [],
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data)) {
        return NextResponse.json(
          {
            success: true,
            products: data.map((r) => normalizeAdminProductRow(r as Record<string, unknown>)),
            source: "supabase",
          },
          { headers: NO_STORE_HEADERS }
        );
      }

      if (error) {
        console.error("[CRITICAL] Admin products GET error:", error.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: `Unable to load products: ${error.message}` },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }
      }
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Supabase database is not configured in production." },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    const local = getLocalProducts();
    return NextResponse.json(
      {
        success: true,
        products: local.length > 0 ? local : INITIAL_PRODUCTS,
        source: "local",
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load products" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_products_post:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many product update requests. Please wait 1 minute." },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Product name must be at least 2 characters long." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const sizes = normalizeSizes(body.sizes);
    const stockCount = Math.max(0, Number(body.stockCount ?? body.stock ?? 0) || 0);
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : `prod-${Date.now()}`;
    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug.trim()
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const image =
      typeof body.image === "string" && body.image.trim()
        ? body.image.trim()
        : "/images/products/mushroom-mela-front.jpg";

    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        id,
        name,
        slug,
        subtitle: String(body.subtitle ?? ""),
        flavour: String(body.flavour ?? "Oyster Mushroom"),
        description: String(body.description ?? ""),
        ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
        shelf_life: String(body.shelfLife ?? "Store in a cool, dry place."),
        image_url: image,
        image,
        sizes,
        stock: stockCount,
        stock_count: stockCount,
        rating: Number(body.rating ?? 0) || 0,
        reviews_count: Number(body.reviewsCount ?? 0) || 0,
        gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery : [image],
        spice_level: String(body.spiceLevel ?? "Medium"),
        is_featured: Boolean(body.isFeatured ?? true),
        badges: Array.isArray(body.badges) ? body.badges : ["400 g Jar"],
      };

      const { data, error } = await supabase
        .from("products")
        .upsert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json(
          {
            success: true,
            product: normalizeAdminProductRow(data as Record<string, unknown>),
            source: "supabase",
          },
          { headers: NO_STORE_HEADERS }
        );
      }

      if (error) {
        console.error("[CRITICAL] Admin product upsert error:", error.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: `Failed to save product: ${error.message}` },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }
      }
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Database offline. Product cannot be saved in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const current = getLocalProducts();
    const savedProduct: Product = {
      id,
      name,
      slug,
      subtitle: String(body.subtitle ?? "Oyster mushroom pickle in mustard oil and spices"),
      description: String(body.description ?? ""),
      flavour: String(body.flavour ?? "Oyster Mushroom"),
      rating: Number(body.rating ?? 0) || 0,
      reviewsCount: Number(body.reviewsCount ?? 0) || 0,
      image,
      gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery.map(String) : [image],
      ingredients: Array.isArray(body.ingredients) ? body.ingredients.map(String) : ["Mushroom", "Mustard Oil", "Vinegar", "Spices"],
      shelfLife: String(body.shelfLife ?? "Store in a cool, dry place."),
      spiceLevel: String(body.spiceLevel ?? "Medium") as "Mild" | "Medium" | "Hot" | "Extra Spicy",
      isFeatured: Boolean(body.isFeatured ?? true),
      stockCount,
      sizes,
      badges: Array.isArray(body.badges) ? body.badges.map(String) : ["400 g Jar"],
    };

    const idx = current.findIndex((p) => p.id === id);
    const updated =
      idx !== -1
        ? current.map((p, i) => (i === idx ? savedProduct : p))
        : [savedProduct, ...current];
    saveLocalProducts(updated);

    return NextResponse.json(
      { success: true, product: savedProduct, source: "local" },
      { status: idx !== -1 ? 200 : 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin products POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save product" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_products_patch:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const updateFields: Record<string, unknown> = {};
    let newStock: number | undefined;

    if (body.stockCount !== undefined) {
      newStock = Math.max(0, Number(body.stockCount) || 0);
      updateFields.stock_count = newStock;
      updateFields.stock = newStock;
    }

    let updatedSizes: ProductPriceOption[] | undefined;
    if (body.sizes !== undefined) {
      updatedSizes = normalizeSizes(body.sizes);
      updateFields.sizes = updatedSizes;
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("products").update(updateFields).eq("id", id);
      if (error) {
        console.error("[CRITICAL] Admin products PATCH error:", error.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: `Failed to update product: ${error.message}` },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Supabase database is not configured in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalProducts();
      const idx = current.findIndex((p) => p.id === id);
      if (idx !== -1) {
        if (newStock !== undefined) current[idx].stockCount = newStock;
        if (updatedSizes !== undefined) current[idx].sizes = updatedSizes;
        saveLocalProducts(current);
      }
    }

    return NextResponse.json(
      { success: true, id, stockCount: newStock, sizes: updatedSizes },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin products PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_products_delete:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many delete requests. Please wait 1 minute." },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      return NextResponse.json(
        { success: false, error: "Database offline. Product cannot be deleted in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
      if (deleteError) {
        console.error("[CRITICAL] Admin products DELETE error:", deleteError.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Failed to delete product from database" },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalProducts();
      saveLocalProducts(current.filter((p) => p.id !== id));
    }

    return NextResponse.json(
      { success: true, message: "Product deleted" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin products DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
