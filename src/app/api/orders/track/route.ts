import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getLocalOrders } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limiting on tracking lookups (max 10 per minute per IP)
    const rateLimit = checkRateLimit(`order_track:${ip}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many tracking lookups. Please wait 1 minute before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const orderNumber = (body?.orderNumber || "").trim();
    const rawPhone = (body?.phone || "").trim();
    const cleanPhone = rawPhone.replace(/\D/g, "");

    // Order tracking must require BOTH the order number and the phone number used at checkout
    if (!orderNumber || cleanPhone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found. Please verify your order number and phone number.",
        },
        { status: 404 }
      );
    }

    const last10Phone = cleanPhone.slice(-10);
    let matchedOrder: any = null;

    // Search in Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("order_number, order_status, total, items, phone, tracking_number, courier_name, created_at")
          .ilike("order_number", orderNumber);

        if (!error && data && data.length > 0) {
          const found = data.find((row) => {
            const dbPhoneClean = (row.phone || "").replace(/\D/g, "");
            return dbPhoneClean.slice(-10) === last10Phone;
          });

          if (found) {
            matchedOrder = found;
          }
        }
      } catch (err) {
        console.warn("Supabase tracking lookup error:", err);
      }
    }

    // Search local store fallback in development only
    if (!matchedOrder && process.env.NODE_ENV !== "production") {
      const local = getLocalOrders();
      const found = local.find((o) => {
        const matchNumber = o.orderNumber?.toLowerCase() === orderNumber.toLowerCase();
        const oPhoneClean = (o.phone || "").replace(/\D/g, "");
        const matchPhone = oPhoneClean.slice(-10) === last10Phone;
        return matchNumber && matchPhone;
      });

      if (found) {
        matchedOrder = found;
      }
    }

    // Generic "not found" message for any mismatch
    if (!matchedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found. Please verify your order number and phone number.",
        },
        { status: 404 }
      );
    }

    // Return ONLY order status, items and total (NO address, NO email)
    return NextResponse.json({
      success: true,
      order: {
        orderNumber: matchedOrder.order_number || matchedOrder.orderNumber,
        orderStatus: matchedOrder.order_status || matchedOrder.orderStatus || "New",
        total: Number(matchedOrder.total) || 0,
        items: Array.isArray(matchedOrder.items)
          ? matchedOrder.items.map((i: any) => ({
              name: i.name,
              size: i.size,
              quantity: i.quantity,
            }))
          : [],
        trackingNumber: matchedOrder.tracking_number || matchedOrder.trackingNumber || null,
        courierName: matchedOrder.courier_name || matchedOrder.courierName || null,
        createdAt: matchedOrder.created_at || matchedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process tracking request" },
      { status: 500 }
    );
  }
}
