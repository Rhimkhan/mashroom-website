export type ProductSize = "400g" | "250g" | "500g" | "1kg" | string;

export interface ProductPriceOption {
  size: ProductSize;
  price: number;
  originalPrice: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  flavour: "Classic Masala" | "Garlic" | "Mustard Oil" | "Spicy Red Chilli" | string;
  rating: number;
  reviewsCount: number;
  image: string;
  gallery?: string[];
  ingredients: string[];
  shelfLife: string;
  spiceLevel: "Mild" | "Medium" | "Hot" | "Extra Spicy";
  isFeatured: boolean;
  stockCount: number;
  sizes: ProductPriceOption[];
  badges: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: ProductSize;
  price: number;
  quantity: number;
}

export type OrderStatus = "New" | "Packed" | "Shipped" | "Delivered";
export type PaymentMethod = "Cash on Delivery" | "Pay by UPI" | "Pay by UPI QR" | "Razorpay Online (UPI / Cards / Netbanking)" | string;
export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Awaiting verification" | "Payment pending verification" | string;

export interface OrderItem {
  productId: string;
  name: string;
  size: ProductSize;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  utr?: string;
  userId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  verified: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface WholesaleInquiry {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  quantityNeeded: string;
  message: string;
  createdAt: string;
}
