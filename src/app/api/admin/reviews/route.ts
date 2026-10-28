import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyAdminSession } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalReviews, updateLocalReviewStatus, saveLocalReviews } from "@/lib/store";
import { ProductReview } from "@/lib/types";

/**
 * GET /api/admin/reviews
 * Admin-only: list all reviews (pending, approved, rejected)
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_reviews_get:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const reviews: ProductReview[] = data.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          orderNumber: r.order_number,
          customerName: r.customer_name,
          phone: r.phone,
          rating: Number(r.rating) || 5,
          comment: r.comment,
          photoUrl: r.photo_url || undefined,
          status: r.status,
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, reviews });
      }
    }

    const local = getLocalReviews();
    return NextResponse.json({ success: true, reviews: local });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID required" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("reviews").delete().eq("id", id);
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalReviews();
      saveLocalReviews(current.filter((r) => r.id !== id));
    }

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Admin reviews DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}
