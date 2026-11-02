/**
 * Typed constants and labels for order and payment fulfillment pipelines.
 */

export const ORDER_STATUSES = ["New", "Packed", "Shipped", "Delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  New: "Order Received",
  Packed: "Packed & Sealed",
  Shipped: "Dispatched & In Transit",
  Delivered: "Delivered Successfully",
};

export const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
  "Awaiting verification",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number] | string;

export const PAYMENT_METHODS = [
  "Cash on Delivery",
  "Pay by UPI",
  "Pay by UPI QR",
  "Razorpay Online (UPI / Cards / Netbanking)",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | string;
