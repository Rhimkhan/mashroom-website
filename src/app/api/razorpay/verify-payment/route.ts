import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getLocalOrders, saveLocalOrders } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`razorpay_verify_payment:${ip}`, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many payment verification attempts. Please wait 1 minute." },
        { status: 429 }
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
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const {
      orderId, // internal order ID or orderNumber
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !orderId || typeof orderId !== "string" ||
      !razorpay_order_id || typeof razorpay_order_id !== "string" ||
      !razorpay_payment_id || typeof razorpay_payment_id !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification details" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes("YourRazorpaySecretKeyHere") || keySecret.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Razorpay key secret is not configured on server" },
        { status: 500 }
      );
    }

    if (!razorpay_signature || typeof razorpay_signature !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing razorpay_signature for cryptographic verification" },
        { status: 400 }
      );
    }

    // Cryptographic HMAC SHA256 Signature Verification (constant-time)
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature);
    const sigBuf = Buffer.from(razorpay_signature);
    const isValidSignature =
      genBuf.length === sigBuf.length &&
      crypto.timingSafeEqual(genBuf, sigBuf);

    if (!isValidSignature) {
      console.warn(`[RAZORPAY SIGNATURE MISMATCH] Payment signature verification failed`);
      return NextResponse.json(
        { success: false, error: "Cryptographic payment signature verification failed" },
        { status: 400 }
      );
    }

    // 3. Mark the Order as "Paid" in Supabase & Local Store
    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      console.error("[CRITICAL] Payment verification failed: Supabase is offline in production");
      return NextResponse.json(
        { success: false, error: "Database offline. Unable to record payment in production." },
        { status: 500 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "Paid",
            notes: `Razorpay Payment Verified: ${razorpay_payment_id} (Order: ${razorpay_order_id})`,
          })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`);

        if (updateError) {
          console.error("[CRITICAL] Supabase payment update failed in production:", updateError);
          if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
              { success: false, error: "Database error: unable to update payment status" },
              { status: 500 }
            );
          }
        }
      } catch (err) {
        console.error("[CRITICAL] Supabase payment update error:", err);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Database error: unable to update payment status" },
            { status: 500 }
          );
        }
      }
    }

    // Update Local Store (development only)
    if (process.env.NODE_ENV !== "production") {
      const local = getLocalOrders();
      const index = local.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (index !== -1) {
        local[index] = {
          ...local[index],
          paymentStatus: "Paid",
          notes: `Razorpay Payment Verified: ${razorpay_payment_id} (Order: ${razorpay_order_id})`,
        };
        saveLocalOrders(local);
      }
    }

    console.log(`[PAYMENT VERIFIED SUCCESS] Order: ${orderId} | Payment ID: ${razorpay_payment_id}`);

    return NextResponse.json({
      success: true,
      message: "Razorpay signature verified on server. Order marked as Paid.",
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification server error:", error);
    return NextResponse.json(
      { success: false, error: "Server error during payment verification" },
      { status: 500 }
    );
  }
}
