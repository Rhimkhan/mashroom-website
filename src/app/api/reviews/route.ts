import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp, escapeAndTrim } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalOrders, getLocalReviews, addLocalReview } from "@/lib/store";
import { ProductReview } from "@/lib/types";

/**
 * GET /api/reviews
 * Returns approved reviews for a given product (or all approved reviews).
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`reviews_get:${ip}`, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("reviews")
        .select("id, product_id, order_number, customer_name, rating, comment, photo_url, status, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const reviews: ProductReview[] = data.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          orderNumber: r.order_number,
          customerName: r.customer_name,
          phone: "", // Mask phone for public read
          rating: Number(r.rating) || 5,
          comment: r.comment,
          photoUrl: r.photo_url || undefined,
          status: "approved",
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, reviews });
      }
    }

    // Local in-memory fallback (development)
    const all = getLocalReviews();
    const approved = all.filter(
      (r) => r.status === "approved" && (!productId || r.productId === productId)
    );
    return NextResponse.json({ success: true, reviews: approved });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load reviews" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Allows customers to submit a review only with a valid order number and phone number.
 * Reviews stay hidden ('pending') until admin approves them.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`reviews_post:${ip}`, 5, 60 * 60 * 1000); // 5 per hour per IP
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Review submission limit reached. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Honeypot check
    if (body.website_url || body.company_fax || body.honeypot) {
      return NextResponse.json(
        { success: false, error: "Bot activity detected. Submission rejected." },
        { status: 400 }
      );
    }

    // 2. Input validation
    const rawOrderNumber = (body.orderNumber || "").trim().toUpperCase();
    if (!rawOrderNumber || rawOrderNumber.length < 3 || rawOrderNumber.length > 50) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid order number." },
        { status: 400 }
      );
    }

    const cleanPhone = (body.phone || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter the 10-digit mobile number used for this order." },
        { status: 400 }
      );
    }

    const rawName = (body.customerName || body.name || "").trim();
    if (rawName.length < 2 || rawName.length > 60) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (between 2 and 60 characters)." },
        { status: 400 }
      );
    }

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a whole number between 1 and 5." },
        { status: 400 }
      );
    }

    const rawComment = (body.comment || body.text || "").trim();
    if (rawComment.length < 5 || rawComment.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Please write a review between 5 and 1000 characters." },
        { status: 400 }
      );
    }

    let photoUrl = "";
    if (body.photoUrl && typeof body.photoUrl === "string") {
      const trimmedUrl = body.photoUrl.trim();
      if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
        photoUrl = escapeAndTrim(trimmedUrl).slice(0, 500);
      }
    }

    const productId = (body.productId || "prod-mushroom-mela").trim();

    // 3. Verify order exists with matching order number and phone
    let orderMatched = false;

    if (isSupabaseConfigured && supabase) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, order_number, phone")
        .or(`order_number.eq.${rawOrderNumber},id.eq.${rawOrderNumber}`)
        .maybeSingle();

      if (orderData) {
        const dbPhone = String(orderData.phone || "").replace(/\D/g, "");
        if (dbPhone.endsWith(cleanPhone) || cleanPhone.endsWith(dbPhone)) {
          orderMatched = true;
        }
      }
    }

    if (!orderMatched) {
      // Local fallback verification in dev
      const localOrders = getLocalOrders();
      const matched = localOrders.find((o) => {
        const numMatch = o.orderNumber.toUpperCase() === rawOrderNumber || o.id.toUpperCase() === rawOrderNumber;
        const phoneMatch = o.phone.replace(/\D/g, "").endsWith(cleanPhone);
        return numMatch && phoneMatch;
      });
      if (matched) {
        orderMatched = true;
      }
    }

    if (!orderMatched) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching order found for this order number and phone number. Please verify your order receipt.",
        },
        { status: 400 }
      );
    }

    // 4. Check if a review was already submitted for this order
    if (isSupabaseConfigured && supabase) {
      const { data: existingRev } = await supabase
        .from("reviews")
        .select("id")
        .eq("order_number", rawOrderNumber)
        .maybeSingle();

      if (existingRev) {
        return NextResponse.json(
          { success: false, error: "A review has already been submitted for this order." },
          { status: 400 }
        );
      }
    } else {
      const localRevs = getLocalReviews();
      if (localRevs.some((r) => r.orderNumber.toUpperCase() === rawOrderNumber)) {
        return NextResponse.json(
          { success: false, error: "A review has already been submitted for this order." },
          { status: 400 }
        );
      }
    }

    // 5. Create new pending review
    const newReview: ProductReview = {
      id: `rev_${crypto.randomUUID()}`,
      productId,
      orderNumber: rawOrderNumber,
      customerName: escapeAndTrim(rawName),
      phone: cleanPhone,
      rating,
      comment: escapeAndTrim(rawComment),
      photoUrl: photoUrl || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error: insertErr } = await supabase.from("reviews").insert([
        {
          id: newReview.id,
          product_id: newReview.productId,
          order_number: newReview.orderNumber,
          customer_name: newReview.customerName,
          phone: newReview.phone,
          rating: newReview.rating,
          comment: newReview.comment,
          photo_url: newReview.photoUrl || null,
          status: "pending",
          created_at: newReview.createdAt,
        },
      ]);

      if (insertErr) {
        console.error("Supabase review insert error:", insertErr);
        return NextResponse.json(
          { success: false, error: "Failed to record review. Please try again." },
          { status: 500 }
        );
      }
    }

    if (process.env.NODE_ENV !== "production") {
      addLocalReview(newReview);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your review has been submitted and will appear once verified by our team.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
