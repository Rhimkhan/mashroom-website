import { Product, Order, OrderStatus, PaymentStatus } from "./types";
import { INITIAL_PRODUCTS } from "./data";

const LOCAL_STORAGE_PRODUCTS_KEY = "akhil_foods_products_v2";
const LOCAL_STORAGE_ORDERS_KEY = "akhil_foods_orders_v2";

// Helper for initial seed orders so Admin has realistic live data to view and update
const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "AF-8921",
    customerName: "Rohan Malhotra",
    email: "rohan.m@gmail.com",
    phone: "9810123456",
    address: "B-42, Gulmohar Enclave, Near Market",
    landmark: "Behind Central Park",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110049",
    items: [
      {
        productId: "prod-mushroom-mela",
        name: "Mushroom Mela Oyster Mushroom Pickle",
        size: "400 g",
        price: 399,
        quantity: 2,
        image: "/images/products/mushroom-mela-front.jpg",
      },
    ],
    subtotal: 798,
    shipping: 0,
    discount: 50,
    couponCode: "AKHIL10",
    total: 748,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    orderStatus: "Packed",
    trackingNumber: "BD982736451IN",
    courierName: "BlueDart Express",
    createdAt: "2026-10-16T12:00:00.000Z",
  },
  {
    id: "ord-1002",
    orderNumber: "AF-8922",
    customerName: "Ananya Sharma",
    email: "ananya.s@outlook.com",
    phone: "9988776655",
    address: "Flat 402, Civil Lines",
    city: "Jhansi",
    state: "Uttar Pradesh",
    pincode: "284001",
    items: [
      {
        productId: "prod-mushroom-mela",
        name: "Mushroom Mela Oyster Mushroom Pickle",
        size: "400 g",
        price: 399,
        quantity: 1,
        image: "/images/products/mushroom-mela-front.jpg",
      },
    ],
    subtotal: 399,
    shipping: 60,
    discount: 0,
    total: 459,
    paymentMethod: "Razorpay Online (UPI / Cards / Netbanking)",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    trackingNumber: "DEL77889901IN",
    courierName: "Delhivery Air",
    createdAt: "2026-10-15T15:30:00.000Z",
  },
];

// Server-side in-memory persistence when window is undefined
let serverMemoryOrders: Order[] = [...INITIAL_ORDERS];
let serverMemoryProducts: Product[] = [...INITIAL_PRODUCTS];

/**
 * Retrieves the catalog of products from browser localStorage or server memory fallback.
 *
 * @returns Array of active products with sizes, pricing, and inventory
 */
export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return serverMemoryProducts;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local products:", err);
    return serverMemoryProducts;
  }
}

/**
 * Persists updated product catalog data to localStorage or server memory fallback.
 *
 * @param products - Complete array of updated product records
 */
export function saveLocalProducts(products: Product[]): void {
  if (typeof window === "undefined") {
    serverMemoryProducts = products;
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error("Error saving local products:", err);
  }
}

/**
 * Normalizes an order from Supabase (snake_case) or legacy local store (camelCase)
 * to a strictly-typed, defensive Order object where all required fields are guaranteed non-null.
 */
export function normalizeOrderRow(row: any): Order {
  if (!row || typeof row !== "object") {
    return {
      id: `ord-${Date.now()}`,
      orderNumber: "AF-UNKNOWN",
      customerName: "Customer",
      email: "",
      phone: "",
      address: "",
      landmark: undefined,
      city: "",
      state: "",
      pincode: "",
      items: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      couponCode: undefined,
      total: 0,
      paymentMethod: "UPI",
      paymentStatus: "Pending",
      orderStatus: "New",
      notes: undefined,
      utr: undefined,
      trackingNumber: undefined,
      courierName: undefined,
      userId: undefined,
      createdAt: new Date().toISOString(),
    };
  }

  let items: any[] = [];
  if (Array.isArray(row.items)) {
    items = row.items;
  } else if (typeof row.items === "string") {
    try {
      const parsed = JSON.parse(row.items);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
  }

  const rawPaymentMethod = row.paymentMethod || row.payment_method || "UPI";
  const rawPaymentStatus = row.paymentStatus || row.payment_status || "Pending";
  const rawOrderStatus = row.orderStatus || row.order_status || "New";

  return {
    id: String(row.id || `ord-${Date.now()}`),
    orderNumber: String(row.orderNumber || row.order_number || "AF-ORDER"),
    customerName: String(row.customerName || row.customer_name || "Customer"),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    address: String(row.address || ""),
    landmark: row.landmark ? String(row.landmark) : undefined,
    city: String(row.city || ""),
    state: String(row.state || ""),
    pincode: String(row.pincode || ""),
    items,
    subtotal: Number(row.subtotal) || 0,
    shipping: Number(row.shipping) || 0,
    discount: Number(row.discount) || 0,
    couponCode: row.couponCode || row.coupon_code || undefined,
    total: Number(row.total) || 0,
    paymentMethod: String(rawPaymentMethod),
    paymentStatus: rawPaymentStatus as PaymentStatus,
    orderStatus: rawOrderStatus as OrderStatus,
    notes: row.notes ? String(row.notes) : undefined,
    utr: row.utr ? String(row.utr) : undefined,
    trackingNumber: row.trackingNumber || row.tracking_number || undefined,
    courierName: row.courierName || row.courier_name || undefined,
    userId: row.userId || row.user_id || undefined,
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

/**
 * Retrieves all stored customer orders from browser localStorage or server memory fallback.
 *
 * @returns Array of customer orders sorted chronologically
 */
export function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return serverMemoryOrders.map(normalizeOrderRow);
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS.map(normalizeOrderRow);
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOrderRow) : INITIAL_ORDERS.map(normalizeOrderRow);
  } catch (err) {
    console.error("Error reading local orders:", err);
    return serverMemoryOrders.map(normalizeOrderRow);
  }
}

/**
 * Persists an array of customer orders to browser localStorage or server memory fallback.
 *
 * @param orders - Array of order objects to persist
 */
export function saveLocalOrders(orders: Order[]): void {
  if (typeof window === "undefined") {
    serverMemoryOrders = orders;
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Error saving local orders:", err);
  }
}

/**
 * Prepends a newly placed order to local persistence and returns the created order record.
 *
 * @param newOrder - The newly created order entity
 * @returns The persisted order object
 */
export function addLocalOrder(newOrder: Order): Order {
  const current = getLocalOrders();
  const updated = [newOrder, ...current];
  saveLocalOrders(updated);
  return newOrder;
}

/**
 * Updates an existing order's fulfillment status, AWB courier tracking, or payment state.
 *
 * @param orderId - Unique internal ID of the order to update
 * @param status - New OrderStatus value (New, Packed, Shipped, Delivered)
 * @param trackingNumber - Optional courier AWB tracking code
 * @param courierName - Optional logistics partner name (e.g. BlueDart Express)
 * @param paymentStatus - Optional updated payment state (Paid, Pending, Failed)
 * @returns The updated Order entity or null if not found
 */
export function updateLocalOrderStatus(
  orderId: string,
  status?: OrderStatus,
  trackingNumber?: string,
  courierName?: string,
  paymentStatus?: PaymentStatus
): Order | null {
  const current = getLocalOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  const updatedOrder = {
    ...current[index],
    ...(status ? { orderStatus: status } : {}),
    ...(trackingNumber !== undefined ? { trackingNumber } : {}),
    ...(courierName !== undefined ? { courierName } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  };
  current[index] = updatedOrder;
  saveLocalOrders(current);
  return updatedOrder;
}

/**
 * Searches orders by Order ID (AF-XXXX), telephone number, or email address.
 *
 * @param query - Search term matching order number, phone digits, or customer email
 * @returns Filtered array of matching customer orders
 */
export function findOrderByNumberOrPhone(query: string): Order[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const orders = getLocalOrders();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase() === q ||
      o.id.toLowerCase() === q ||
      (o.phone || "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
      o.email.toLowerCase() === q
  );
}

// In-memory reviews store
const LOCAL_STORAGE_REVIEWS_KEY = "akhil_foods_reviews_v1";
let serverMemoryReviews: import("./types").ProductReview[] = [];

/**
 * Retrieves customer review records from localStorage or server memory fallback.
 *
 * @returns Array of product review entities
 */
export function getLocalReviews(): import("./types").ProductReview[] {
  if (typeof window === "undefined") return serverMemoryReviews;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : serverMemoryReviews;
  } catch {
    return serverMemoryReviews;
  }
}

/**
 * Persists product review records to localStorage or server memory fallback.
 *
 * @param reviews - Array of review objects
 */
export function saveLocalReviews(reviews: import("./types").ProductReview[]): void {
  if (typeof window === "undefined") {
    serverMemoryReviews = reviews;
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    serverMemoryReviews = reviews;
  }
}

/**
 * Adds a new pending customer review to local persistence.
 *
 * @param rev - Submitted product review entity
 * @returns The persisted review object
 */
export function addLocalReview(rev: import("./types").ProductReview): import("./types").ProductReview {
  const list = getLocalReviews();
  const updated = [rev, ...list];
  saveLocalReviews(updated);
  return rev;
}

/**
 * Updates moderation approval status of a customer review.
 *
 * @param id - Review identifier
 * @param status - Moderation verdict ('pending', 'approved', 'rejected')
 * @returns True if review was found and updated, false otherwise
 */
export function updateLocalReviewStatus(id: string, status: "pending" | "approved" | "rejected"): boolean {
  const list = getLocalReviews();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  list[idx].status = status;
  saveLocalReviews(list);
  return true;
}

// In-memory wholesale inquiries store
const LOCAL_STORAGE_WHOLESALE_KEY = "akhil_foods_wholesale_v1";
let serverMemoryWholesale: import("./types").WholesaleInquiry[] = [];

/**
 * Retrieves commercial wholesale B2B inquiry records.
 *
 * @returns Array of wholesale inquiry entries
 */
export function getLocalWholesaleInquiries(): import("./types").WholesaleInquiry[] {
  if (typeof window === "undefined") return serverMemoryWholesale;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WHOLESALE_KEY);
    return raw ? JSON.parse(raw) : serverMemoryWholesale;
  } catch {
    return serverMemoryWholesale;
  }
}

/**
 * Persists commercial wholesale B2B inquiries to storage.
 *
 * @param inquiries - Array of wholesale inquiry objects
 */
export function saveLocalWholesaleInquiries(inquiries: import("./types").WholesaleInquiry[]): void {
  if (typeof window === "undefined") {
    serverMemoryWholesale = inquiries;
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_WHOLESALE_KEY, JSON.stringify(inquiries));
  } catch {
    serverMemoryWholesale = inquiries;
  }
}

/**
 * Adds a new commercial wholesale inquiry to local persistence.
 *
 * @param inq - Wholesale inquiry details
 * @returns The persisted inquiry entity
 */
export function addLocalWholesaleInquiry(inq: import("./types").WholesaleInquiry): import("./types").WholesaleInquiry {
  const list = getLocalWholesaleInquiries();
  const updated = [inq, ...list];
  saveLocalWholesaleInquiries(updated);
  return inq;
}
