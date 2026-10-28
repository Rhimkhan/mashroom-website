import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalOrders } from "@/lib/store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes("YourTestKeyIdHere") &&
    !keySecret.includes("YourRazorpaySecretKeyHere") &&
    keyId.trim() !== "" &&
    keySecret.trim() !== ""
  );

  return NextResponse.json({
    configured: isConfigured,
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`razorpay_create_order:${ip}`, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many payment order requests. Please wait 1 minute." },
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

    const orderRef = typeof body.orderId === "string" ? body.orderId.trim().slice(0, 100) : (typeof body.receipt === "string" ? body.receipt.trim().slice(0, 100) : "");
    let verifiedAmountRupees = 0;

    // Verify order total from server persistence (ignore any arbitrary amount sent by browser)
    if (orderRef) {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: dbOrder } = await supabase
            .from("orders")
            .select("total")
            .or(`id.eq.${orderRef},order_number.eq.${orderRef}`)
            .maybeSingle();
          if (dbOrder && typeof dbOrder.total === "number" && dbOrder.total > 0) {
            verifiedAmountRupees = dbOrder.total;
          }
        } catch (err) {
          console.warn("Supabase order lookup error for Razorpay order:", err);
        }
      }

      if (!verifiedAmountRupees) {
        const local = getLocalOrders();
        const found = local.find((o) => o.id === orderRef || o.orderNumber === orderRef);
        if (found && found.total > 0) {
          verifiedAmountRupees = found.total;
        }
      }
    }

    const finalAmountRupees = verifiedAmountRupees > 0 ? verifiedAmountRupees : (Number(body.amount) || 0);
    if (finalAmountRupees <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount. Order must have a valid positive total calculated by the server." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(finalAmountRupees * 100);
    const receipt = body.receipt || `rcpt_${Date.now()}`;
    const currency = body.currency || "INR";

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if real Razorpay API keys are configured
    if (
      !keyId ||
      !keySecret ||
      keyId.includes("YourTestKeyIdHere") ||
      keySecret.includes("YourRazorpaySecretKeyHere") ||
      keyId.trim() === "" ||
      keySecret.trim() === ""
    ) {
      return NextResponse.json(
        { success: false, error: "Razorpay payment gateway keys are not configured" },
        { status: 400 }
      );
    }

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency,
        receipt: receipt,
        payment_capture: 1,
        notes: {
          store: "Akhil Foods",
          receipt: receipt,
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data?.id) {
      return NextResponse.json({
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: keyId,
      });
    }

    return NextResponse.json(
      { success: false, error: data?.error?.description || "Razorpay rejected order creation" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create Razorpay payment order" },
      { status: 500 }
    );
  }
}
