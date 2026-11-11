import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyAdminSession } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalReviews, updateLocalReviewStatus, saveLocalReviews } from "@/lib/store";
import { ProductReview } from "@/lib/types";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

/**
 * GET /api/admin/reviews
 * Admin-only: list all reviews (pending, approved, rejected)
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_reviews_get:${ip}`, 30, 60 * 1000);
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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const reviews: ProductReview[] = data.map((r: Record<string, unknown>) => ({
          id: String(r.id ?? ""),
          productId: String(r.product_id ?? ""),
          orderNumber: String(r.order_number ?? "-"),
          customerName: String(r.customer_name ?? "Customer"),
          phone: String(r.phone ?? "-"),
          rating: Number(r.rating) || 5,
          comment: String(r.comment ?? ""),
          photoUrl: r.photo_url ? String(r.photo_url) : undefined,
          status: (r.status as "pending" | "approved" | "rejected") || "pending",
          createdAt: String(r.created_at ?? new Date().toISOString()),
        }));
        return NextResponse.json(
          { success: true, reviews },
          { headers: NO_STORE_HEADERS }
        );
      }

      if (error) {
        const tableMissing =
          error.code === "42P01" ||
          /relation .* does not exist/i.test(error.message || "");
        if (tableMissing) {
          return NextResponse.json(
            {
              success: true,
              reviews: [],
              tableMissing: true,
              warning: "Supabase table 'public.reviews' does not exist yet.",
            },
            { headers: NO_STORE_HEADERS }
          );
        }
      }
    }

    const local = getLocalReviews();
    return NextResponse.json(
      { success: true, reviews: local },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * PATCH /api/admin/reviews
 * Admin-only: approve or reject a review
 */
export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_reviews_patch:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body || {};

    if (!id || (status !== "approved" && status !== "rejected" && status !== "pending")) {
      return NextResponse.json({ success: false, error: "Invalid id or status" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error: updateErr } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id);

      if (updateErr) {
        console.error("Supabase review update error:", updateErr);
        return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
      }
    }

    if (process.env.NODE_ENV !== "production") {
      updateLocalReviewStatus(id, status);
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    console.error("Admin reviews PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/reviews
 * Admin-only: delete a review
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_reviews_delete:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = (searchParams.get("id") || "").trim();
    if (!id) {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        if (typeof body?.id === "string") id = body.id.trim();
      } catch {
        // ignore
      }
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Review ID required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      return NextResponse.json(
        { success: false, error: "Database offline. Review cannot be deleted in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    let deletedInDb = false;
    if (isSupabaseConfigured && supabase) {
      const { data, error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .select("id");

      if (deleteError) {
        console.error("Admin reviews DELETE error:", deleteError.message);
        return NextResponse.json(
          { success: false, error: `Failed to delete review: ${deleteError.message}` },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }

      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Review not found or already deleted." },
            { status: 404, headers: NO_STORE_HEADERS }
          );
        }
      } else {
        deletedInDb = true;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalReviews();
      const existsLocally = current.some((r) => r.id === id);
      if (!deletedInDb && !existsLocally) {
        return NextResponse.json(
          { success: false, error: "Review not found or already deleted." },
          { status: 404, headers: NO_STORE_HEADERS }
        );
      }
      if (existsLocally) {
        saveLocalReviews(current.filter((r) => r.id !== id));
      }
    }

    return NextResponse.json(
      { success: true, deletedId: id, message: "Item deleted successfully" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin reviews DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
