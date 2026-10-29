import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Order, OrderStatus, Product } from "@/lib/types";
import { getLocalOrders, addLocalOrder, updateLocalOrderStatus, getLocalProducts, saveLocalProducts, saveLocalOrders } from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { sendOrderNotificationEmail, sendOrderStatusEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";
import { verifyAdminSession } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp, escapeAndTrim } from "@/lib/rate-limit";

// Helper: re-read product directly from the Supabase products table by product id
async function getProductById(productId: string): Promise<Product | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          subtitle: data.subtitle || "",
          description: data.description || "",
          flavour: data.flavour || "Classic",
          rating: Number(data.rating) || 5.0,
          reviewsCount: Number(data.reviews_count) || 1,
          image: data.image_url || data.image || "/images/hero-pickle.jpg",
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
          shelfLife: data.shelf_life || "12 Months",
          spiceLevel: data.spice_level || "Medium",
          isFeatured: Boolean(data.is_featured),
          stockCount: Number(data.stock_count ?? data.stock ?? 50),
          sizes: Array.isArray(data.sizes) ? data.sizes : [
            { size: "250g", price: 299, originalPrice: 350, inStock: true },
            { size: "500g", price: 549, originalPrice: 650, inStock: true },
            { size: "1kg", price: 999, originalPrice: 1200, inStock: true },
          ],
          badges: Array.isArray(data.badges) ? data.badges : [],
        };
      }
      if (error) {
        console.error("[CRITICAL] Supabase product lookup error:", error);
      }
    } catch (err) {
      console.error("[CRITICAL] Supabase product lookup exception:", err);
    }
  }

  // In production, strictly NEVER fall back to in-memory or mock data
  if (process.env.NODE_ENV === "production") {
    console.error(`[CRITICAL] In-memory store fallback blocked for product "${productId}". In production, Supabase is mandatory.`);
    return null;
  }

  // Fallback to local store / initial seed catalog in development only
  const localProducts = getLocalProducts();
  const allProducts = localProducts.length > 0 ? localProducts : INITIAL_PRODUCTS;
  return allProducts.find((p) => p.id === productId || p.slug === productId) || null;
}

/**
 * GET /api/orders
 * SECURITY HARDENING:
 * 1. Must NEVER return a list of orders or any personal data publicly.
 * 2. Order tracking requires BOTH order number AND phone number, returns only status, items and total (no address, no email),
 *    and is rate-limited (max 10 per minute per IP). Returns generic "not found" on any mismatch.
 * 3. Full order listing requires a verified administrator session.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get("orderNumber") || searchParams.get("order_number") || "").trim();
    const phone = (searchParams.get("phone") || "").trim();

    // Secure Order Tracking Lookup (Publicly accessible ONLY with both orderNumber AND phone)
    if (orderNumber || phone) {
      const ip = getClientIp(request);
      const rateLimit = checkRateLimit(`order_track_get:${ip}`, 10, 60 * 1000); // max 10 per minute per IP
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, error: "Too many tracking lookups. Please wait 1 minute before trying again." },
          { status: 429 }
        );
      }

      const cleanPhone = phone.replace(/\D/g, "");
      // Tracking MUST require BOTH the order number and the phone number used at checkout
      if (!orderNumber || cleanPhone.length < 10) {
        return NextResponse.json(
          { success: false, error: "Order not found. Please verify your order number and phone number." },
          { status: 404 }
        );
      }

      const last10Phone = cleanPhone.slice(-10);
      let matchedOrder: any = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("order_number, order_status, total, items, phone, tracking_number, courier_name, created_at")
            .ilike("order_number", orderNumber);

          if (!error && data && data.length > 0) {
            const found = data.find((row) => {
              const rowPhone = (row.phone || "").replace(/\D/g, "");
              return rowPhone.slice(-10) === last10Phone;
            });
            if (found) {
              matchedOrder = found;
            }
          }
        } catch (err) {
          console.warn("Supabase tracking lookup error:", err);
        }
      }

      if (!matchedOrder && process.env.NODE_ENV !== "production") {
        const local = getLocalOrders();
        const found = local.find((o) => {
          const matchNumber = o.orderNumber?.toLowerCase() === orderNumber.toLowerCase();
          const matchPhone = (o.phone || "").replace(/\D/g, "").slice(-10) === last10Phone;
          return matchNumber && matchPhone;
        });
        if (found) {
          matchedOrder = found;
        }
      }

      // Generic "not found" message for any mismatch
      if (!matchedOrder) {
        return NextResponse.json(
          { success: false, error: "Order not found. Please verify your order number and phone number." },
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
    }

    // Listing orders: MUST NEVER return a list of orders or any personal data publicly
    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access. Order listing is strictly reserved for authenticated administrators.",
        },
        { status: 401 }
      );
    }

    const query = searchParams.get("q") || "";

    if (isSupabaseConfigured && supabase) {
      let req = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (query) {
        req = req.or(`order_number.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`);
      }
      const { data, error } = await req;
      if (!error && data) {
        return NextResponse.json({ success: true, orders: data });
      }
      if (error) {
        console.error("[CRITICAL] Supabase orders list error:", error);
      }
    }

    // In production, strictly NEVER fall back to in-memory store
    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL] Supabase is unreachable for order listing in production.");
      return NextResponse.json(
        { success: false, error: "Database error: unable to load orders from Supabase" },
        { status: 500 }
      );
    }

    const local = getLocalOrders();
    if (!query) {
      return NextResponse.json({ success: true, orders: local });
    }

    const q = query.toLowerCase();
    const filtered = local.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.email.toLowerCase().includes(q)
    );
    return NextResponse.json({ success: true, orders: filtered });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * SECURITY HARDENING:
 * 1. Rate-limited by IP (max 5 orders per 15 mins).
 * 2. Honeypot detection.
 * 3. Server-side validation (phone 10 digits, pincode 6 digits, lengths).
 * 4. Compute all prices, shipping, and coupon discounts on the server from the product catalog.
 *    Completely ignores any totals sent by the browser.
 * 5. Unguessable cryptographically random order IDs and order numbers.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limiting (max 5 orders per hour per IP)
    const rateLimit = checkRateLimit(`order_create:${ip}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Order limit reached (maximum 5 orders per hour per IP). Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Hidden honeypot field check (rejects bots)
    if (body.website_url || body.honeypot || body.company_fax) {
      console.warn(`[SECURITY] Honeypot triggered from IP ${ip}`);
      return NextResponse.json(
        { success: false, error: "Bot activity detected. Submission rejected." },
        { status: 400 }
      );
    }

    // 3. Server-side validation
    // Name: 2 to 60 characters
    const rawCustomerName = (body.customerName || body.name || "").trim();
    if (rawCustomerName.length < 2 || rawCustomerName.length > 60) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (between 2 and 60 characters)." },
        { status: 400 }
      );
    }
    const customerName = escapeAndTrim(rawCustomerName);

    // Phone: exactly 10 digits starting with 6 to 9
    const cleanPhone = (body.phone || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9." },
        { status: 400 }
      );
    }

    // Pincode: 6 digits
    const cleanPincode = (body.pincode || "").replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 6-digit postal pincode." },
        { status: 400 }
      );
    }

    // Address: 10 to 250 characters
    const rawAddress = (body.address || "").trim();
    if (rawAddress.length < 10 || rawAddress.length > 250) {
      return NextResponse.json(
        { success: false, error: "Please provide your complete delivery street address (between 10 and 250 characters)." },
        { status: 400 }
      );
    }
    const address = escapeAndTrim(rawAddress);

    // Email format validation
    const rawEmail = (body.email || "").trim();
    if (rawEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (rawEmail.length > 100 || !emailRegex.test(rawEmail)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email address (e.g. yourname@example.com)." },
          { status: 400 }
        );
      }
    }
    const email = rawEmail ? escapeAndTrim(rawEmail) : `${cleanPhone}@akhilfoods.customer`;

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json(
        { success: false, error: "Basket must contain at least 1 item and no more than 50 items." },
        { status: 400 }
      );
    }

    // 4. Server-Side Price & Discount Computation (IGNORE ALL BROWSER TOTALS, PRICES, SHIPPING & DISCOUNTS)
    const verifiedItems: Order["items"] = [];

    for (const item of rawItems) {
      if (!item || !item.productId) {
        return NextResponse.json(
          { success: false, error: "Each basket item must specify a valid productId." },
          { status: 400 }
        );
      }

      // Validate quantity (strictly integer between 1 and 20)
      const qtyNum = Number(item.quantity);
      if (!Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 20) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid quantity for item "${item.name || item.productId}". Quantity must be an integer between 1 and 20.`,
          },
          { status: 400 }
        );
      }
      const quantity = qtyNum;

      // Re-read product from the Supabase products table by product id
      const product = await getProductById(item.productId);

      // Reject orders for unknown products
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown product: "${item.productId}". Order rejected.`,
          },
          { status: 400 }
        );
      }

      // Reject orders for out-of-stock products
      if (typeof product.stockCount === "number" && product.stockCount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${product.name}" is out of stock.`,
          },
          { status: 400 }
        );
      }

      if (typeof product.stockCount === "number" && quantity > product.stockCount) {
        return NextResponse.json(
          {
            success: false,
            error: `Requested quantity for "${product.name}" exceeds available stock (${product.stockCount} available).`,
          },
          { status: 400 }
        );
      }

      // Re-read price by exact size
      const requestedSize = (item.size || "250g").trim();
      const matchedSize = product.sizes?.find(
        (s) => s.size.toLowerCase() === requestedSize.toLowerCase()
      );

      if (!matchedSize) {
        return NextResponse.json(
          {
            success: false,
            error: `Size "${requestedSize}" is not available for product "${product.name}".`,
          },
          { status: 400 }
        );
      }

      // Reject if size is marked out of stock
      if (matchedSize.inStock === false) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${product.name}" (${matchedSize.size}) is out of stock.`,
          },
          { status: 400 }
        );
      }

      const verifiedUnitPrice = Number(matchedSize.price);
      if (isNaN(verifiedUnitPrice) || verifiedUnitPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid product price configured for "${product.name}".`,
          },
          { status: 400 }
        );
      }

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        size: matchedSize.size,
        price: verifiedUnitPrice,
        quantity: quantity,
        image: product.image || "/images/hero-pickle.jpg",
      });
    }

    // Recalculate subtotal on the server
    const serverSubtotal = verifiedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    // Validate coupon codes on the server
    const rawCoupon = (body.couponCode || "").trim().toUpperCase();
    let serverDiscount = 0;
    let verifiedCouponCode: string | undefined = undefined;

    if (rawCoupon) {
      if (rawCoupon === "AKHIL10") {
        serverDiscount = Math.round((serverSubtotal * 10) / 100);
        verifiedCouponCode = "AKHIL10";
      } else if (rawCoupon === "FREESHIP") {
        verifiedCouponCode = "FREESHIP";
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid coupon code: "${rawCoupon}". Order rejected.`,
          },
          { status: 400 }
        );
      }
    }

    // Recalculate shipping on the server
    let serverShipping = BRAND.defaultShippingCost;
    if (serverSubtotal >= BRAND.freeShippingThreshold || verifiedCouponCode === "FREESHIP") {
      serverShipping = 0;
    }

    // Recalculate total on the server
    const serverTotal = Math.max(0, serverSubtotal - serverDiscount + serverShipping);

    // 5. Generate cryptographically unguessable order IDs
    const orderId = `ord_${crypto.randomUUID()}`;
    const orderNumber = `AF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Payment validation
    const paymentMethod = body.paymentMethod || "Cash on Delivery";
    let paymentStatus: Order["paymentStatus"] = "Pending";
    let utrClean: string | undefined = undefined;

    if (paymentMethod === "Pay by UPI" || paymentMethod === "Pay by UPI QR") {
      paymentStatus = "Payment pending verification";
      const rawUtr = (body.utr || "").replace(/\D/g, "");
      if (rawUtr.length === 12) {
        utrClean = rawUtr;
      }
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNumber,
      customerName: customerName,
      email: email,
      phone: cleanPhone,
      address: address,
      landmark: escapeAndTrim(body.landmark).slice(0, 100),
      city: escapeAndTrim(body.city).slice(0, 50) || "Delivery City",
      state: escapeAndTrim(body.state || "Delhi").slice(0, 50),
      pincode: cleanPincode,
      items: verifiedItems,
      subtotal: serverSubtotal,
      shipping: serverShipping,
      discount: serverDiscount,
      couponCode: verifiedCouponCode,
      total: serverTotal,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: "New",
      utr: utrClean,
      notes: utrClean
        ? (body.notes ? `${escapeAndTrim(body.notes).slice(0, 150)} | UTR: ${utrClean}` : `UTR: ${utrClean}`)
        : escapeAndTrim(body.notes).slice(0, 200),
      userId: body.userId || undefined,
      createdAt: new Date().toISOString(),
    };

    // 6. Save to Supabase (Strictly mandatory in production)
    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      console.error("[CRITICAL] Order rejected: Supabase database is not configured in production environment!");
      return NextResponse.json(
        {
          success: false,
          error: "We could not place your order, please try again or order on WhatsApp",
        },
        { status: 500 }
      );
    }

    let supabaseInserted = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: insertError } = await supabase.from("orders").insert([
          {
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            customer_name: newOrder.customerName,
            email: newOrder.email,
            phone: newOrder.phone,
            address: newOrder.address,
            landmark: newOrder.landmark,
            city: newOrder.city,
            state: newOrder.state,
            pincode: newOrder.pincode,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            shipping: newOrder.shipping,
            discount: newOrder.discount,
            coupon_code: newOrder.couponCode,
            total: newOrder.total,
            payment_method: newOrder.paymentMethod,
            payment_status: newOrder.paymentStatus,
            order_status: newOrder.orderStatus,
            notes: newOrder.notes,
            user_id: newOrder.userId || null,
            created_at: newOrder.createdAt,
          },
        ]);

        if (insertError) {
          console.error("[CRITICAL] Supabase order insert failed in production:", insertError);
          if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
              {
                success: false,
                error: "We could not place your order, please try again or order on WhatsApp",
              },
              { status: 500 }
            );
          }
        } else {
          supabaseInserted = true;
        }
      } catch (err) {
        console.error("[CRITICAL] Supabase order insert exception in production:", err);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            {
              success: false,
              error: "We could not place your order, please try again or order on WhatsApp",
            },
            { status: 500 }
          );
        }
      }
    }

    if (process.env.NODE_ENV === "production" && !supabaseInserted) {
      console.error("[CRITICAL] Order was not recorded into Supabase. Aborting order response.");
      return NextResponse.json(
        {
          success: false,
          error: "We could not place your order, please try again or order on WhatsApp",
        },
        { status: 500 }
      );
    }

    // 7. Save to local persistence (development fallback only)
    if (process.env.NODE_ENV !== "production") {
      addLocalOrder(newOrder);
    }

    // 8. Reduce product stock on the server
    for (const it of verifiedItems) {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: pRow } = await supabase
            .from("products")
            .select("stock_count, stock")
            .eq("id", it.productId)
            .maybeSingle();

          if (pRow) {
            const currentStock = Number(pRow.stock_count ?? pRow.stock ?? 50);
            const nextStock = Math.max(0, currentStock - it.quantity);
            await supabase
              .from("products")
              .update({ stock_count: nextStock, stock: nextStock })
              .eq("id", it.productId);
          }
        } catch (stockErr) {
          console.warn(`Failed to update stock for ${it.productId}:`, stockErr);
        }
      }

      if (process.env.NODE_ENV !== "production") {
        const localProds = getLocalProducts();
        const pIdx = localProds.findIndex((p) => p.id === it.productId || p.slug === it.productId);
        if (pIdx !== -1) {
          localProds[pIdx].stockCount = Math.max(0, (localProds[pIdx].stockCount ?? 50) - it.quantity);
          saveLocalProducts(localProds);
        }
      }
    }

    // 9. Dispatch notification email
    const emailResult = await sendOrderNotificationEmail(newOrder);

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        emailNotification: emailResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { success: false, error: "We could not place your order, please try again or order on WhatsApp" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders
 * SECURITY HARDENING:
 * Modifying order status, consignment tracking or payment status requires a verified admin session.
 */
export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`orders_patch:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many order update requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required to modify orders." },
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

    const { orderId, orderStatus, trackingNumber, courierName, paymentStatus, trackingLink, trackingUrl } = body || {};

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ success: false, error: "Missing required orderId" }, { status: 400 });
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      console.error("[CRITICAL] Order update rejected: Supabase not configured in production");
      return NextResponse.json(
        { success: false, error: "Database offline. Cannot update order in production." },
        { status: 500 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const updatePayload: any = {};
      if (orderStatus) updatePayload.order_status = orderStatus;
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
      if (courierName !== undefined) updatePayload.courier_name = courierName;
      if (paymentStatus) updatePayload.payment_status = paymentStatus;

      const { error: updateError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (updateError) {
        console.error("[CRITICAL] Supabase order update failed in production:", updateError);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Failed to update order in database" },
            { status: 500 }
          );
        }
      }
    }

    let updated = null;
    if (process.env.NODE_ENV !== "production") {
      updated = updateLocalOrderStatus(
        orderId,
        orderStatus as OrderStatus,
        trackingNumber,
        courierName,
        paymentStatus as any
      );
    }

    // Dispatch status update email to customer if status is Packed, Shipped or Delivered
    if (orderStatus === "Packed" || orderStatus === "Shipped" || orderStatus === "Delivered") {
      try {
        let orderForEmail: Order | null = null;
        if (isSupabaseConfigured && supabase) {
          const { data: dbOrder } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
          if (dbOrder) {
            orderForEmail = {
              id: dbOrder.id,
              orderNumber: dbOrder.order_number || dbOrder.id,
              customerName: dbOrder.customer_name,
              email: dbOrder.email,
              phone: dbOrder.phone,
              address: dbOrder.address,
              landmark: dbOrder.landmark,
              city: dbOrder.city,
              state: dbOrder.state,
              pincode: dbOrder.pincode,
              items: Array.isArray(dbOrder.items) ? dbOrder.items : [],
              subtotal: Number(dbOrder.subtotal) || 0,
              shipping: Number(dbOrder.shipping) || 0,
              discount: Number(dbOrder.discount) || 0,
              total: Number(dbOrder.total) || 0,
              paymentMethod: dbOrder.payment_method,
              paymentStatus: dbOrder.payment_status,
              orderStatus: orderStatus,
              trackingNumber: trackingNumber || dbOrder.tracking_number,
              courierName: courierName || dbOrder.courier_name,
              createdAt: dbOrder.created_at,
            };
          }
        }
        if (!orderForEmail && process.env.NODE_ENV !== "production") {
          const locals = getLocalOrders();
          orderForEmail = locals.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
        }

        if (orderForEmail && orderForEmail.email && !orderForEmail.email.includes("@akhilfoods.customer")) {
          sendOrderStatusEmail(
            orderForEmail,
            orderStatus,
            trackingNumber || orderForEmail.trackingNumber,
            courierName || orderForEmail.courierName,
            trackingLink || trackingUrl
          ).catch((err) => {
            console.warn("Failed to send order status email:", err);
          });
        }
      } catch (emailErr) {
        console.warn("Error preparing order status email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Orders PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

/**
 * DELETE /api/orders
 * SECURITY HARDENING:
 * Deleting orders strictly requires a verified administrator session.
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`orders_delete:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many delete requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const isAdmin = verifyAdminSession(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required to delete orders." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || searchParams.get("orderId") || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required for deletion." }, { status: 400 });
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      console.error("[CRITICAL] Order deletion blocked: Supabase is offline in production");
      return NextResponse.json(
        { success: false, error: "Database offline. Cannot delete order in production." },
        { status: 500 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .or(`id.eq.${id},order_number.eq.${id}`);

      if (deleteError) {
        console.error("[CRITICAL] Supabase order delete failed in production:", deleteError);
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Failed to delete order from database" },
            { status: 500 }
          );
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalOrders();
      const updated = current.filter((o) => o.id !== id && o.orderNumber !== id);
      saveLocalOrders(updated);
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Orders DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 });
  }
}
