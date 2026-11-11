import { NextRequest, NextResponse } from "next/server";
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";
import { getLocalOrders, saveLocalOrders, updateLocalOrderStatus } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { sendOrderStatusEmail } from "@/lib/email";
import { verifyAdminSession } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

function extractUtrFromNotes(notes?: string | null): string | undefined {
  if (!notes || typeof notes !== "string") return undefined;
  const match = notes.match(/\bUTR\s*:\s*([A-Za-z0-9\-_]+)/i);
  return match ? match[1].trim() : undefined;
}

function normalizeAdminOrderRow(row: Record<string, unknown>): Order {
  let rawItems: unknown[] = [];
  if (Array.isArray(row.items)) {
    rawItems = row.items;
  } else if (typeof row.items === "string") {
    try {
      const parsed = JSON.parse(row.items);
      if (Array.isArray(parsed)) rawItems = parsed;
    } catch {
      rawItems = [];
    }
  }

  const items = rawItems.map((it) => {
    const item = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
    return {
      productId: String(item.productId ?? item.product_id ?? ""),
      name: String(item.name ?? "Item"),
      size: String(item.size ?? "-"),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: String(item.image ?? "/images/products/mushroom-mela-front.jpg"),
    };
  });

  const notesStr = row.notes ? String(row.notes) : undefined;
  const rawUtr = row.utr ?? row.UTR ?? extractUtrFromNotes(notesStr);

  return {
    id: String(row.id ?? `ord-${Date.now()}`),
    orderNumber: String(row.order_number ?? row.orderNumber ?? "AF-ORDER"),
    customerName: String(row.customer_name ?? row.customerName ?? "Customer"),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    address: String(row.address ?? ""),
    landmark: row.landmark ? String(row.landmark) : undefined,
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    pincode: String(row.pincode ?? ""),
    items,
    subtotal: Number(row.subtotal) || 0,
    shipping: Number(row.shipping) || 0,
    discount: Number(row.discount) || 0,
    couponCode:
      row.coupon_code || row.couponCode
        ? String(row.coupon_code ?? row.couponCode)
        : undefined,
    total: Number(row.total) || 0,
    paymentMethod: String(row.payment_method ?? row.paymentMethod ?? "UPI"),
    paymentStatus: String(
      row.payment_status ?? row.paymentStatus ?? "Pending"
    ) as PaymentStatus,
    orderStatus: String(
      row.order_status ?? row.orderStatus ?? "New"
    ) as OrderStatus,
    notes: notesStr,
    utr: rawUtr ? String(rawUtr) : undefined,
    trackingNumber:
      row.tracking_number || row.trackingNumber
        ? String(row.tracking_number ?? row.trackingNumber)
        : undefined,
    courierName:
      row.courier_name || row.courierName
        ? String(row.courier_name ?? row.courierName)
        : undefined,
    userId:
      row.user_id || row.userId ? String(row.user_id ?? row.userId) : undefined,
    createdAt: String(
      row.created_at ?? row.createdAt ?? new Date().toISOString()
    ),
  };
}

/**
 * GET /api/admin/orders
 * Admin-only: fetches live orders fresh from Supabase with no-store caching.
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (isSupabaseConfigured && supabase) {
      let req = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (query) {
        req = req.or(
          `order_number.ilike.%${query}%,customer_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`
        );
      }

      const { data, error } = await req;
      if (!error && Array.isArray(data)) {
        const orders = data.map((row) =>
          normalizeAdminOrderRow(row as Record<string, unknown>)
        );
        return NextResponse.json(
          { success: true, orders, source: "supabase" },
          { headers: NO_STORE_HEADERS }
        );
      }

      if (error) {
        console.error("[CRITICAL] Admin orders Supabase fetch error:", error.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            {
              success: false,
              error: `Database error loading orders: ${error.message}`,
            },
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

    const local = getLocalOrders().map((o) =>
      normalizeAdminOrderRow(o as unknown as Record<string, unknown>)
    );
    const filtered = !query
      ? local
      : local.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
            o.customerName.toLowerCase().includes(query.toLowerCase()) ||
            o.phone.includes(query) ||
            o.email.toLowerCase().includes(query.toLowerCase())
        );

    return NextResponse.json(
      { success: true, orders: filtered, source: "local" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live orders." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Admin-only: updates orderStatus, trackingNumber, courierName, or paymentStatus.
 */
export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_orders_patch:${ip}`, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many update requests. Please wait 1 minute." },
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

    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const orderStatus =
      typeof body?.orderStatus === "string" ? (body.orderStatus as OrderStatus) : undefined;
    const trackingNumber =
      typeof body?.trackingNumber === "string" ? body.trackingNumber : undefined;
    const courierName =
      typeof body?.courierName === "string" ? body.courierName : undefined;
    const paymentStatus =
      typeof body?.paymentStatus === "string" ? (body.paymentStatus as PaymentStatus) : undefined;
    const trackingLink =
      typeof body?.trackingLink === "string" ? body.trackingLink : undefined;
    const trackingUrl =
      typeof body?.trackingUrl === "string" ? body.trackingUrl : undefined;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      return NextResponse.json(
        { success: false, error: "Database offline. Cannot update order in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    let updatedOrder: Order | null = null;

    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, unknown> = {};
      if (orderStatus) updatePayload.order_status = orderStatus;
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
      if (courierName !== undefined) updatePayload.courier_name = courierName;
      if (paymentStatus) updatePayload.payment_status = paymentStatus;

      const { data: updatedRow, error: updateError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select("*")
        .maybeSingle();

      if (updateError) {
        console.error("[CRITICAL] Admin order update failed:", updateError.message);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: `Failed to update order: ${updateError.message}` },
            { status: 500, headers: NO_STORE_HEADERS }
          );
        }
      } else if (updatedRow) {
        updatedOrder = normalizeAdminOrderRow(updatedRow as Record<string, unknown>);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const localUpdated = updateLocalOrderStatus(
        orderId,
        orderStatus,
        trackingNumber,
        courierName,
        paymentStatus
      );
      if (!updatedOrder && localUpdated) {
        updatedOrder = normalizeAdminOrderRow(
          localUpdated as unknown as Record<string, unknown>
        );
      }
    }

    if (
      updatedOrder &&
      (orderStatus === "Packed" || orderStatus === "Shipped" || orderStatus === "Delivered") &&
      updatedOrder.email &&
      !updatedOrder.email.includes("@akhilfoods.customer")
    ) {
      sendOrderStatusEmail(
        updatedOrder,
        orderStatus,
        trackingNumber || updatedOrder.trackingNumber,
        courierName || updatedOrder.courierName,
        trackingLink || trackingUrl
      ).catch((err) => {
        console.warn("Failed to send order status email:", err);
      });
    }

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * DELETE /api/admin/orders
 * Admin-only: permanently deletes an order record by id. Does not cascade to products or auth users.
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_orders_delete:${ip}`, 30, 60 * 1000);
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
    let id = (searchParams.get("id") || searchParams.get("orderId") || "").trim();
    if (!id) {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        if (typeof body?.id === "string") id = body.id.trim();
        else if (typeof body?.orderId === "string") id = body.orderId.trim();
      } catch {
        // ignore missing JSON body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      return NextResponse.json(
        { success: false, error: "Database offline. Order cannot be deleted in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    let deletedInDb = false;
    if (isSupabaseConfigured && supabase) {
      const { data, error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("id", id)
        .select("id");

      if (deleteError) {
        console.error("[CRITICAL] Admin orders DELETE error:", deleteError.message);
        return NextResponse.json(
          { success: false, error: `Failed to delete order: ${deleteError.message}` },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }

      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Order not found or already deleted." },
            { status: 404, headers: NO_STORE_HEADERS }
          );
        }
      } else {
        deletedInDb = true;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalOrders();
      const existsLocally = current.some((o) => o.id === id);
      if (!deletedInDb && !existsLocally) {
        return NextResponse.json(
          { success: false, error: "Order not found or already deleted." },
          { status: 404, headers: NO_STORE_HEADERS }
        );
      }
      if (existsLocally) {
        saveLocalOrders(current.filter((o) => o.id !== id));
      }
    }

    return NextResponse.json(
      { success: true, deletedId: id, message: "Item deleted successfully" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin orders DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
