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
        size: "400g",
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
        size: "400g",
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

export function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return serverMemoryOrders;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local orders:", err);
    return serverMemoryOrders;
  }
}

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

export function addLocalOrder(newOrder: Order): Order {
  const current = getLocalOrders();
  const updated = [newOrder, ...current];
  saveLocalOrders(updated);
  return newOrder;
}

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

export function findOrderByNumberOrPhone(query: string): Order[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const orders = getLocalOrders();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase() === q ||
      o.id.toLowerCase() === q ||
      o.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
      o.email.toLowerCase() === q
  );
}

// In-memory reviews store
const LOCAL_STORAGE_REVIEWS_KEY = "akhil_foods_reviews_v1";
let serverMemoryReviews: import("./types").ProductReview[] = [];

export function getLocalReviews(): import("./types").ProductReview[] {
  if (typeof window === "undefined") return serverMemoryReviews;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : serverMemoryReviews;
  } catch {
    return serverMemoryReviews;
  }
}

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

export function addLocalReview(rev: import("./types").ProductReview): import("./types").ProductReview {
  const list = getLocalReviews();
  const updated = [rev, ...list];
  saveLocalReviews(updated);
  return rev;
}

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

export function getLocalWholesaleInquiries(): import("./types").WholesaleInquiry[] {
  if (typeof window === "undefined") return serverMemoryWholesale;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WHOLESALE_KEY);
    return raw ? JSON.parse(raw) : serverMemoryWholesale;
  } catch {
    return serverMemoryWholesale;
  }
}

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

export function addLocalWholesaleInquiry(inq: import("./types").WholesaleInquiry): import("./types").WholesaleInquiry {
  const list = getLocalWholesaleInquiries();
  const updated = [inq, ...list];
  saveLocalWholesaleInquiries(updated);
  return inq;
}
