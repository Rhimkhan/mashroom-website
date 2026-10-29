import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalOrders, saveLocalOrders } from "@/lib/store";


export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === "") {
    console.warn("RAZORPAY_WEBHOOK_SECRET is missing, returning 503");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
  }

  // Cryptographic HMAC SHA256 Signature Verification using crypto.timingSafeEqual
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret.trim())
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    console.warn("[RAZORPAY WEBHOOK] Invalid signature match");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let eventData: any;
  try {
    eventData = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = eventData?.event;
  const paymentEntity = eventData?.payload?.payment?.entity;

  if (!paymentEntity) {
    return NextResponse.json({ received: true });
  }

  const razorpayPaymentId = paymentEntity.id;
  const razorpayOrderId = paymentEntity.order_id;
  const orderRef =
    paymentEntity.notes?.orderId ||
    paymentEntity.notes?.receipt ||
    paymentEntity.description ||
    paymentEntity.receipt;

  if (eventType === "payment.captured") {
    // Idempotent: mark order paid
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("orders").update({
          payment_status: "Paid",
          notes: `Razorpay Payment Captured: ${razorpayPaymentId} (Order: ${razorpayOrderId || ""})`,
        });

        if (orderRef) {
          query = query.or(`id.eq.${orderRef},order_number.eq.${orderRef}`);
        } else if (razorpayOrderId) {
          query = query.ilike("notes", `%${razorpayOrderId}%`);
        }

        await query;
      } catch (err) {
        console.error("Supabase payment.captured update error:", err);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const locals = getLocalOrders();
      const idx = locals.findIndex(
        (o) =>
          (orderRef && (o.id === orderRef || o.orderNumber === orderRef)) ||
          (razorpayOrderId && o.notes?.includes(razorpayOrderId))
      );
      if (idx !== -1) {
        locals[idx] = {
          ...locals[idx],
          paymentStatus: "Paid",
          notes: `Razorpay Payment Captured: ${razorpayPaymentId} (Order: ${razorpayOrderId || ""})`,
        };
        saveLocalOrders(locals);
      }
    }

    console.log(`[RAZORPAY WEBHOOK] Payment captured for ${orderRef || razorpayOrderId}`);
    return NextResponse.json({ status: "ok", event: "payment.captured" });
  }

  if (eventType === "payment.failed") {
    // Idempotent: mark payment failed only if not already paid
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("orders")
          .update({
            payment_status: "Failed",
            notes: `Razorpay Payment Failed: ${razorpayPaymentId} - ${paymentEntity.error_description || "Declined"}`,
          })
          .neq("payment_status", "Paid");

        if (orderRef) {
          query = query.or(`id.eq.${orderRef},order_number.eq.${orderRef}`);
        } else if (razorpayOrderId) {
          query = query.ilike("notes", `%${razorpayOrderId}%`);
        }

        await query;
      } catch (err) {
        console.error("Supabase payment.failed update error:", err);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const locals = getLocalOrders();
      const idx = locals.findIndex(
        (o) =>
          (orderRef && (o.id === orderRef || o.orderNumber === orderRef)) ||
          (razorpayOrderId && o.notes?.includes(razorpayOrderId))
      );
      if (idx !== -1 && locals[idx].paymentStatus !== "Paid") {
        locals[idx] = {
          ...locals[idx],
          paymentStatus: "Failed",
          notes: `Razorpay Payment Failed: ${razorpayPaymentId}`,
        };
        saveLocalOrders(locals);
      }
    }

    console.log(`[RAZORPAY WEBHOOK] Payment failed for ${orderRef || razorpayOrderId}`);
    return NextResponse.json({ status: "ok", event: "payment.failed" });
  }

  return NextResponse.json({ received: true });
}
