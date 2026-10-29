"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  MessageCircle,
  Truck,
  ShieldCheck,
  Save,
  X,
  Upload,
  LogOut,
  Mail,
  Key,
  ExternalLink,
  Eye,
  Download,
  BarChart3,
  Users,
  Star,
  Building2,
} from "lucide-react";
import {
  Order,
  OrderStatus,
  Product,
  ProductSize,
  PaymentStatus,
  ProductReview,
  WholesaleInquiry,
} from "@/lib/types";
import {
  getLocalOrders,
  getLocalProducts,
  saveLocalProducts,
  updateLocalOrderStatus,
  getLocalReviews,
  getLocalWholesaleInquiries,
} from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { BRAND } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Auth form
  const [emailInput, setEmailInput] = useState("abhishekkumarnandsiya@gmail.com");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tab & Data State
  const [activeTab, setActiveTab] = useState<
    "orders" | "products" | "sales" | "customers" | "reviews" | "wholesale"
  >("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [wholesaleInquiries, setWholesaleInquiries] = useState<WholesaleInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOrder, setSearchOrder] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [salesPeriod, setSalesPeriod] = useState<"today" | "7days" | "30days">("today");
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // View Order Details Modal
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Edit / Add Product State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form Fields
  const [prodName, setProdName] = useState("");
  const [prodSubtitle, setProdSubtitle] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodFlavour, setProdFlavour] = useState("Classic Masala");
  const [prodIngredients, setProdIngredients] = useState(
    "Fresh Mushrooms, Mustard Oil, Salt, Whole Spices"
  );
  const [prodShelfLife, setProdShelfLife] = useState(
    "12 Months (Store in a cool, dry place. Keep submerged in mustard oil)"
  );
  const [prodSpice, setProdSpice] = useState<"Mild" | "Medium" | "Hot">("Medium");
  const [prodPrice250, setProdPrice250] = useState(299);
  const [prodPrice500, setProdPrice500] = useState(549);
  const [prodPrice1kg, setProdPrice1kg] = useState(999);
  const [prodStock, setProdStock] = useState(50);
  const [prodImage, setProdImage] = useState("/images/hero-pickle.jpg");

  // Check existing session on server
  useEffect(() => {
    fetchWithTimeout("/api/admin/me", { cache: "no-store" }, 3500)
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setIsAuthenticated(true);
          setAdminUser("Master Administrator");
        }
      })
      .catch((err) => {
        console.warn("Session check error:", err);
      });
  }, []);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const resOrders = await fetchWithTimeout("/api/orders", { cache: "no-store" }, 4000);
      const ordersData = await resOrders.json();
      if (ordersData?.orders && Array.isArray(ordersData.orders) && ordersData.orders.length > 0) {
        setOrders(ordersData.orders);
      } else {
        setOrders(getLocalOrders());
      }

      // 2. Fetch Products
      const resProducts = await fetchWithTimeout("/api/products", { cache: "no-store" }, 4000);
      const productsData = await resProducts.json();
      if (
        productsData?.products &&
        Array.isArray(productsData.products) &&
        productsData.products.length > 0
      ) {
        setProducts(productsData.products);
      } else {
        const local = getLocalProducts();
        setProducts(local.length ? local : INITIAL_PRODUCTS);
      }

      // 3. Fetch Reviews
      try {
        const resReviews = await fetchWithTimeout("/api/admin/reviews", { cache: "no-store" }, 4000);
        const revData = await resReviews.json();
        if (revData?.reviews && Array.isArray(revData.reviews)) {
          setReviews(revData.reviews);
        } else {
          setReviews(getLocalReviews());
        }
      } catch {
        setReviews(getLocalReviews());
      }

      // 4. Fetch Wholesale Inquiries
      try {
        const resWholesale = await fetchWithTimeout("/api/wholesale", { cache: "no-store" }, 4000);
        const wData = await resWholesale.json();
        if (wData?.inquiries && Array.isArray(wData.inquiries)) {
          setWholesaleInquiries(wData.inquiries);
        } else {
          setWholesaleInquiries(getLocalWholesaleInquiries());
        }
      } catch {
        setWholesaleInquiries(getLocalWholesaleInquiries());
      }
    } catch (e) {
      console.error("Load data error:", e);
      setOrders(getLocalOrders());
      setProducts(getLocalProducts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Login via Server-side Verification & httpOnly Cookie Session
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Authentication failed. Check your password.");
        setAuthLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAdminUser(emailInput.trim() || "Master Administrator");
      setPasswordInput("");
      setFeedbackMsg("Welcome to Akhil Foods Admin Portal");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setAuthError(err?.message || "Server connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setPasswordInput("");
  };

  // Pre-filled WhatsApp Customer Message Generator
  const getWhatsAppCustomerMessage = (order: Order): string => {
    const itemsText = order.items
      ?.map((i) => `* ${i.name} (${i.size}) x${i.quantity}`)
      .join("\n");

    const appUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "");
    const trackingText = order.trackingNumber
      ? `\n\nCourier Dispatch Details:\n- Logistics Partner: ${order.courierName || "Courier"}\n- Tracking Number: ${order.trackingNumber}\n- Track Order: ${appUrl}/track-order?q=${order.orderNumber}`
      : `\n\nStatus: Preparing your Mushroom Mela pickle order in Village Nandsiya, Moth, Jhansi.`;

    return `Hi ${order.customerName}, greetings from Akhil Foods.

Thank you for your order *#${order.orderNumber}*.

Items in your parcel:
${itemsText}

Total Amount: Rs ${order.total} (${order.paymentMethod})
Shipping Destination: ${order.address}, ${order.city} - ${order.pincode}
Current Status: ${order.orderStatus}${trackingText}

If you have any questions, reply here.
- Akhil Foods, Village Nandsiya, Moth, Jhansi`;
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProdImage(reader.result);
        setFeedbackMsg("Image uploaded & attached!");
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Status Change for Orders
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      updateLocalOrderStatus(orderId, newStatus);
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      setFeedbackMsg(`Order #${orderId} marked as ${newStatus}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Mark Payment as Paid
  const handleMarkAsPaid = async (orderId: string) => {
    try {
      updateLocalOrderStatus(orderId, undefined, undefined, undefined, "Paid");
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: "Paid" }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "Paid" } : o))
      );

      setSelectedOrderForView((prev) =>
        prev && prev.id === orderId ? { ...prev, paymentStatus: "Paid" } : prev
      );

      setFeedbackMsg(`Order #${orderId} payment marked as Paid!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to mark order payment as paid", err);
    }
  };

  // Update Tracking for Orders
  const handleUpdateTracking = async (
    orderId: string,
    trackingNumber: string,
    courierName: string
  ) => {
    try {
      updateLocalOrderStatus(orderId, "Shipped", trackingNumber, courierName);
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: "Shipped",
          trackingNumber,
          courierName,
        }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "Shipped", trackingNumber, courierName }
            : o
        )
      );

      setFeedbackMsg(`Consignment tracking updated for order #${orderId}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update tracking", err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveLocalProducts(updated);
      setFeedbackMsg("Product removed from catalog");
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Add / Edit Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const ingredientsArray = prodIngredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodName.trim(),
      slug:
        editingProduct?.slug ||
        prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle:
        prodSubtitle.trim() || "Oyster Mushroom Pickle",
      description:
        prodDescription.trim() ||
        "Authentic oyster mushroom pickle by AKHIL FOODS, prepared in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
      flavour: prodFlavour,
      rating: editingProduct?.rating || 0,
      reviewsCount: editingProduct?.reviewsCount || 0,
      image: prodImage || "/images/products/mushroom-mela-front.jpg",
      gallery: [prodImage || "/images/products/mushroom-mela-front.jpg"],
      ingredients:
        ingredientsArray.length > 0
          ? ingredientsArray
          : ["Mushroom", "Mustard Oil", "Vinegar", "Spices"],
      shelfLife: prodShelfLife,
      spiceLevel: prodSpice,
      isFeatured: true,
      stockCount: Number(prodStock),
      sizes: [
        {
          size: "250g",
          price: Number(prodPrice250),
          originalPrice: Math.round(Number(prodPrice250) * 1.2),
          inStock: true,
        },
        {
          size: "500g",
          price: Number(prodPrice500),
          originalPrice: Math.round(Number(prodPrice500) * 1.2),
          inStock: true,
        },
        {
          size: "1kg",
          price: Number(prodPrice1kg),
          originalPrice: Math.round(Number(prodPrice1kg) * 1.2),
          inStock: true,
        },
      ],
      badges: editingProduct?.badges || ["Fresh Harvest"],
    };

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });
    } catch (err) {
      console.warn("API sync error:", err);
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? productPayload : p
      );
      setProducts(updated);
      saveLocalProducts(updated);
      setFeedbackMsg("Product pricing and details updated!");
    } else {
      const updated = [productPayload, ...products];
      setProducts(updated);
      saveLocalProducts(updated);
      setFeedbackMsg("New pickle variety added to storefront!");
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdSubtitle(p.subtitle);
    setProdDescription(p.description);
    setProdFlavour(p.flavour);
    setProdIngredients(
      Array.isArray(p.ingredients) ? p.ingredients.join(", ") : ""
    );
    setProdShelfLife(p.shelfLife);
    setProdSpice(p.spiceLevel as "Mild" | "Medium" | "Hot");
    setProdPrice250(p.sizes.find((s) => s.size === "250g")?.price || 299);
    setProdPrice500(p.sizes.find((s) => s.size === "500g")?.price || 549);
    setProdPrice1kg(p.sizes.find((s) => s.size === "1kg")?.price || 999);
    setProdStock(p.stockCount);
    setProdImage(p.image);
    setShowProductModal(true);
  };

  // Quick Edit Stock
  const handleUpdateStock = async (productId: string, newStock: number) => {
    const qty = Math.max(0, Number(newStock) || 0);
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stockCount: qty }),
      });
      const data = await res.json();
      if (data?.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockCount: qty } : p))
        );
        const local = getLocalProducts().map((p) =>
          p.id === productId ? { ...p, stockCount: qty } : p
        );
        saveLocalProducts(local);
        setFeedbackMsg(`Stock updated to ${qty} jars`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  // Review Status Change (Approve / Reject)
  const handleReviewStatus = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, status }),
      });
      const data = await res.json();
      if (data?.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
        );
        setFeedbackMsg(`Review marked as ${status}`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update review", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setFeedbackMsg("Review deleted");
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  // CSV Export for Orders
  const exportOrdersCSV = () => {
    const headers = [
      "order number",
      "date",
      "name",
      "phone",
      "city",
      "pincode",
      "items",
      "total",
      "payment status",
      "order status"
    ];

    const rows = orders.map((o) => {
      const itemsFormatted = (o.items || [])
        .map((it) => `${it.name} (${it.size}) x${it.quantity}`)
        .join("; ");
      return [
        `"${(o.orderNumber || "").replace(/"/g, '""')}"`,
        `"${o.createdAt ? new Date(o.createdAt).toISOString() : ""}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${(o.phone || "").replace(/"/g, '""')}"`,
        `"${(o.city || "").replace(/"/g, '""')}"`,
        `"${(o.pincode || "").replace(/"/g, '""')}"`,
        `"${itemsFormatted.replace(/"/g, '""')}"`,
        o.total || 0,
        `"${(o.paymentStatus || "").replace(/"/g, '""')}"`,
        `"${(o.orderStatus || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Customers
  const exportCustomersCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Number of Orders",
      "Total Spent (INR)",
      "Last Order Date"
    ];

    const rows = customerList.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      c.orderCount,
      c.totalSpent,
      `"${c.lastOrderDate ? new Date(c.lastOrderDate).toISOString() : ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Customer List Aggregation
  const customerList = useMemo(() => {
    const map: Record<
      string,
      { name: string; phone: string; orderCount: number; totalSpent: number; lastOrderDate: string }
    > = {};

    for (const o of orders) {
      const cleanPhone = (o.phone || "").replace(/\D/g, "");
      const key = cleanPhone || (o.customerName || "Customer").toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: o.customerName || "Customer",
          phone: o.phone || "-",
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: o.createdAt,
        };
      }
      map[key].orderCount += 1;
      map[key].totalSpent += (o.total || 0);
      if (new Date(o.createdAt).getTime() >= new Date(map[key].lastOrderDate).getTime()) {
        map[key].lastOrderDate = o.createdAt;
        if (o.customerName) map[key].name = o.customerName;
      }
    }

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Sales Statistics Calculation for Today, 7 Days, 30 Days
  const salesStats = useMemo(() => {
    const emptyStats = { count: 0, revenue: 0, bestSellers: [] };
    if (!currentTime) {
      return { today: emptyStats, "7days": emptyStats, "30days": emptyStats };
    }

    const startOfToday = new Date(currentTime);
    startOfToday.setHours(0, 0, 0, 0);

    const calcForOrders = (list: Order[]) => {
      const count = list.length;
      const revenue = list.reduce((sum, o) => sum + (o.total || 0), 0);
      const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
      for (const order of list) {
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            const label = item.name + (item.size ? ` (${item.size})` : "");
            if (!itemMap[label]) {
              itemMap[label] = { name: label, quantity: 0, revenue: 0 };
            }
            itemMap[label].quantity += (item.quantity || 1);
            itemMap[label].revenue += (item.price || 0) * (item.quantity || 1);
          }
        }
      }
      const bestSellers = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);
      return { count, revenue, bestSellers };
    };

    const ordersToday = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= startOfToday.getTime();
    });

    const orders7Days = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= currentTime - 7 * 86400000;
    });

    const orders30Days = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= currentTime - 30 * 86400000;
    });

    return {
      today: calcForOrders(ordersToday),
      "7days": calcForOrders(orders7Days),
      "30days": calcForOrders(orders30Days),
    };
  }, [orders, currentTime]);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "New" || o.orderStatus === "Packed"
  ).length;

  // 1. Password Protected Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAF6EE]">
        <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-[6px] border border-[#E8DEC8] shadow-sm max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 rounded-[6px] bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-[#C89B3C]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FAF6EE] bg-[#1C130E] border border-[#C89B3C]/30 px-3 py-1 rounded-[4px]">
              Restricted Area
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612] pt-2">
              Staff & Admin Portal
            </h1>
            <p className="text-xs text-[#3D2C24]/70 font-sans">
              Sign in with Supabase Authentication or staff passkey to manage products, pricing, and orders.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-[6px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#211612] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A87B28]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="abhishekkumarnandsiya@gmail.com"
                className="w-full px-4 py-3 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-xs text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#211612] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#A87B28]" />
                <span>Password / Passkey</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter password or passkey"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-xs text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4 text-[#C89B3C]" />
              <span>{authLoading ? "Authenticating..." : "Unlock Store Admin"}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#E8DEC8] space-y-1 text-[11px] text-[#3D2C24]/60 text-center">
            <p>
              Authorized personnel only. Enter your administrator password to proceed.
            </p>
            <p className="text-[10px] text-stone-400">
              {isSupabaseConfigured
                ? "Supabase Auth is enabled"
                : "Operating in secured local-mode"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.phone?.includes(searchOrder) ||
      o.orderStatus?.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.flavour?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header with Signed-in Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DEC8] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-emerald-600"></span>
              <span className="text-xs font-bold text-[#A87B28] uppercase tracking-wider">
                Store Operations • {adminUser}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211612]">
              Store Management Portal
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px] font-mono text-[#211612]">
              <span className="bg-[#FAF6EE] px-2.5 py-0.5 rounded-[4px] border border-[#E8DEC8] shadow-xs">
                FSSAI: <strong>{BRAND.fssaiNumber}</strong> (till {BRAND.fssaiValidity})
              </span>
              <span className="bg-[#FAF6EE] px-2.5 py-0.5 rounded-[4px] border border-[#E8DEC8] shadow-xs">
                GSTIN: <strong>{BRAND.gstNumber}</strong>
              </span>
              <span className="bg-[#FAF6EE] px-2.5 py-0.5 rounded-[4px] border border-[#E8DEC8] shadow-xs">
                Udyam: <strong>{BRAND.udyamNumber}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2.5 rounded-[6px] bg-[#FDFBF7] border border-[#E8DEC8] text-xs font-semibold text-[#211612] hover:bg-[#FAF6EE] flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-[6px] bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-semibold uppercase">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612]">
              ₹{totalRevenue}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Gross order book</p>
          </div>

          <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-semibold uppercase">Total Orders</span>
              <Package className="w-4 h-4 text-[#A87B28]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612]">
              {orders.length}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Recorded orders</p>
          </div>

          <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-semibold uppercase">Pending Dispatch</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-700">
              {pendingOrders}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">New & Packed orders</p>
          </div>

          <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-semibold uppercase">Active Catalog</span>
              <ShoppingBag className="w-4 h-4 text-[#A87B28]" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612]">
              {products.length}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Pickle varieties</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-6 border-b border-[#E8DEC8]">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "orders" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Orders ({orders.length})</span>
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "products" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Products & Stock ({products.length})</span>
            {activeTab === "products" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("sales")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "sales" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Sales Report</span>
            {activeTab === "sales" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "customers" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Customers ({customerList.length})</span>
            {activeTab === "customers" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "reviews" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Reviews ({reviews.length})</span>
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("wholesale")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "wholesale" ? "text-[#211612]" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <span>Wholesale ({wholesaleInquiries.length})</span>
            {activeTab === "wholesale" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
            )}
          </button>
        </div>

        {/* TAB 1: ORDERS WITH DIRECT WHATSAPP BUTTON & STATUS UPDATES */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter by Order #, Customer, Phone..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500">
                  Showing {filteredOrders.length} orders
                </span>
                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  className="px-3.5 py-2 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>Download orders CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-[#FDFBF7] rounded-[32px] border border-[#E8DEC8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#211612] font-bold border-b border-[#E8DEC8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status Pipeline</th>
                      <th className="p-4 text-right">Customer WhatsApp & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8]/50">
                    {filteredOrders.map((order) => {
                      const cleanPhone = order.phone?.replace(/\D/g, "") || "";
                      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                        getWhatsAppCustomerMessage(order)
                      )}`;

                      return (
                        <tr key={order.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#211612]">
                            <button
                              onClick={() => setSelectedOrderForView(order)}
                              className="hover:underline flex items-center gap-1 text-[#211612]"
                            >
                              <span>{order.orderNumber}</span>
                              <Eye className="w-3 h-3 text-stone-400" />
                            </button>
                            <div className="text-[10px] text-stone-400 font-normal">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-[#211612]">{order.customerName}</div>
                            <div className="text-stone-500 text-[11px] font-mono">{order.phone}</div>
                            <div className="text-stone-400 text-[10px] truncate max-w-[150px]">
                              {order.city}, {order.pincode}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              {order.items?.map((item, i) => (
                                <div key={i} className="text-[#3D2C24]">
                                  <span className="font-medium">{item.name}</span>{" "}
                                  <span className="text-[10px] text-[#211612] bg-[#FAF6EE] px-1.5 py-0.5 rounded font-bold border border-[#E8DEC8]">
                                    {item.size} × {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-serif font-bold text-sm text-[#211612]">
                              ₹{order.total}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold ${
                                order.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : order.paymentStatus === "Awaiting verification" || order.paymentStatus === "Payment pending verification"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : order.paymentMethod.includes("Cash")
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-stone-100 text-stone-700 border border-stone-200"
                              }`}
                            >
                              {order.paymentMethod.includes("Cash")
                                ? "COD"
                                : order.paymentMethod.includes("UPI")
                                ? "UPI"
                                : "Online"}{" "}
                              ({order.paymentStatus})
                            </span>
                            {order.utr && (
                              <div className="text-[10px] font-mono text-[#A87B28] font-bold mt-1">
                                UTR: {order.utr}
                              </div>
                            )}
                          </td>

                          {/* Order Status Select (New, Packed, Shipped, Delivered) */}
                          <td className="p-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="px-3 py-1.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-xs font-semibold text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
                            >
                              <option value="New">New</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>

                          {/* Direct WhatsApp Button & Action tools */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Mark as Paid button for orders not yet paid */}
                              {order.paymentStatus !== "Paid" && (
                                <button
                                  onClick={() => handleMarkAsPaid(order.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                                  title="Mark Payment as Paid"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark as Paid</span>
                                </button>
                              )}

                              {/* Prominent WhatsApp Customer Button */}
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                                title="Open WhatsApp chat with pre-filled order receipt & dispatch updates"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                <span>WhatsApp Customer</span>
                              </a>

                              {/* Tracking Updater */}
                              <button
                                onClick={() => {
                                  const trk = prompt(
                                    "Enter Courier AWB / Tracking Code:",
                                    order.trackingNumber || ""
                                  );
                                  if (trk !== null) {
                                    const cour = prompt(
                                      "Enter Courier Name (BlueDart, Delhivery, etc.):",
                                      order.courierName || "BlueDart Express"
                                    );
                                    handleUpdateTracking(order.id, trk, cour || "BlueDart Express");
                                  }
                                }}
                                className="p-2 rounded-[6px] bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                                title="Add/Edit Courier Tracking"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS, PRICING, STOCK & IMAGE UPLOAD */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Pickle Catalog & Stock
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Update unit prices, modify stock inventory, and upload new bottle images.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProdName("");
                    setProdSubtitle("");
                    setProdDescription("");
                    setProdPrice250(299);
                    setProdPrice500(549);
                    setProdPrice1kg(999);
                    setProdStock(50);
                    setProdImage("/images/products/mushroom-mela-front.jpg");
                    setShowProductModal(true);
                  }}
                  className="px-5 py-2.5 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>Add New Pickle</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square bg-[#FAF6EE]">
                      <Image
                        src={p.image || "/images/products/mushroom-mela-front.jpg"}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                      />
                      <span className="absolute top-3 left-3 bg-[#1C130E] text-[#FAF6EE] text-[10px] font-bold px-2.5 py-1 rounded-[4px] shadow-sm border border-[#C89B3C]/40">
                        Stock: {p.stockCount} jars
                      </span>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <span className="text-[10px] font-bold text-[#C89B3C] bg-[#1C130E] px-2.5 py-0.5 rounded-[4px] border border-[#C89B3C]/30">
                        {p.flavour}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#211612] line-clamp-1 leading-snug">
                        {p.name}
                      </h4>

                      {/* Prices for sizes */}
                      <div className="space-y-1 pt-1 text-xs text-[#3D2C24]/80 bg-[#FAF6EE] p-3 rounded-[6px] border border-[#E8DEC8]">
                        {p.sizes?.map((s) => (
                          <div key={s.size} className="flex justify-between items-center">
                            <span className="font-medium">{s.size}:</span>
                            <span className="font-serif font-extrabold text-[#211612]">
                              ₹{s.price}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Quick stock inventory editor */}
                      <div className="flex items-center justify-between bg-[#FAF6EE] p-2.5 rounded-[6px] border border-[#E8DEC8] text-xs">
                        <span className="font-bold text-[#211612]">Stock Inventory:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            defaultValue={p.stockCount}
                            onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs border border-[#E8DEC8] rounded bg-white font-mono font-bold text-[#211612] text-center"
                          />
                          <span className="text-[10px] text-stone-500 font-medium">jars</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-[#E8DEC8] pt-3">
                    <button
                      onClick={() => openEditModal(p)}
                      className="py-2.5 rounded-[6px] bg-[#FAF6EE] hover:bg-[#E8DEC8] text-[#211612] text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-[#E8DEC8]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit & Stock</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="py-2.5 rounded-[6px] bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SALES REPORT (TODAY, 7 DAYS, 30 DAYS) */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Sales & Revenue Report
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Performance metrics and best-selling item tracking across operational periods.
                </p>
              </div>

              {/* Period Switcher */}
              <div className="flex bg-[#FDFBF7] p-1 rounded-[6px] border border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setSalesPeriod("today")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    salesPeriod === "today"
                      ? "bg-[#211612] text-[#FAF6EE]"
                      : "text-stone-500 hover:text-[#211612]"
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setSalesPeriod("7days")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    salesPeriod === "7days"
                      ? "bg-[#211612] text-[#FAF6EE]"
                      : "text-stone-500 hover:text-[#211612]"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setSalesPeriod("30days")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    salesPeriod === "30days"
                      ? "bg-[#211612] text-[#FAF6EE]"
                      : "text-stone-500 hover:text-[#211612]"
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* 3 Summary Cards for Today, 7 Days, 30 Days */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setSalesPeriod("today")}
                className={`p-5 rounded-[6px] border cursor-pointer transition-all ${
                  salesPeriod === "today"
                    ? "bg-[#FDFBF7] border-[#211612] shadow-sm"
                    : "bg-[#FDFBF7] border-[#E8DEC8] hover:border-stone-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87B28] block">
                  Today
                </span>
                <div className="font-serif text-2xl font-extrabold text-[#211612] mt-1">
                  Rs {salesStats.today.revenue}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {salesStats.today.count} {salesStats.today.count === 1 ? "order" : "orders"} placed
                </div>
              </div>

              <div
                onClick={() => setSalesPeriod("7days")}
                className={`p-5 rounded-[6px] border cursor-pointer transition-all ${
                  salesPeriod === "7days"
                    ? "bg-[#FDFBF7] border-[#211612] shadow-sm"
                    : "bg-[#FDFBF7] border-[#E8DEC8] hover:border-stone-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87B28] block">
                  Last 7 Days
                </span>
                <div className="font-serif text-2xl font-extrabold text-[#211612] mt-1">
                  Rs {salesStats["7days"].revenue}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {salesStats["7days"].count} orders placed
                </div>
              </div>

              <div
                onClick={() => setSalesPeriod("30days")}
                className={`p-5 rounded-[6px] border cursor-pointer transition-all ${
                  salesPeriod === "30days"
                    ? "bg-[#FDFBF7] border-[#211612] shadow-sm"
                    : "bg-[#FDFBF7] border-[#E8DEC8] hover:border-stone-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87B28] block">
                  Last 30 Days
                </span>
                <div className="font-serif text-2xl font-extrabold text-[#211612] mt-1">
                  Rs {salesStats["30days"].revenue}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {salesStats["30days"].count} orders placed
                </div>
              </div>
            </div>

            {/* Best Selling Items Plain Table */}
            <div className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm overflow-hidden space-y-3 p-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
                <h4 className="font-serif text-base font-bold text-[#211612]">
                  Best Selling Items ({salesPeriod === "today" ? "Today" : salesPeriod === "7days" ? "Last 7 Days" : "Last 30 Days"})
                </h4>
                <span className="text-xs text-stone-500">
                  {salesStats[salesPeriod].bestSellers.length} products with sales
                </span>
              </div>

              {salesStats[salesPeriod].bestSellers.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No orders or sales recorded for this period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF6EE] text-[#211612] font-bold border-b border-[#E8DEC8] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Product Name & Size</th>
                        <th className="p-3 text-center">Quantity Sold</th>
                        <th className="p-3 text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DEC8]/60">
                      {salesStats[salesPeriod].bestSellers.map((item, idx) => (
                        <tr key={item.name} className="hover:bg-[#FAF6EE]/50">
                          <td className="p-3 font-mono font-bold text-[#A87B28]">#{idx + 1}</td>
                          <td className="p-3 font-medium text-[#211612]">{item.name}</td>
                          <td className="p-3 text-center font-bold text-[#211612]">
                            {item.quantity} jars
                          </td>
                          <td className="p-3 text-right font-serif font-bold text-[#211612]">
                            Rs {item.revenue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS LIST & CSV EXPORT */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Customer Directory
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Aggregated buyer profiles with order history and spend statistics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportCustomersCSV}
                  className="px-3.5 py-2 rounded-[6px] bg-[#FAF6EE] hover:bg-[#E8DEC8] text-[#211612] border border-[#E8DEC8] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#A87B28]" />
                  <span>Export Customers (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  className="px-3.5 py-2 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>Download orders CSV</span>
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none"
              />
            </div>

            <div className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#211612] font-bold border-b border-[#E8DEC8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4 text-center">Orders Count</th>
                      <th className="p-4">Total Spent</th>
                      <th className="p-4">Last Order Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8]/60">
                    {customerList
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                          c.phone.includes(searchCustomer)
                      )
                      .map((cust, i) => (
                        <tr key={i} className="hover:bg-[#FAF6EE]/50">
                          <td className="p-4 font-bold text-[#211612]">{cust.name}</td>
                          <td className="p-4 font-mono text-stone-600">{cust.phone}</td>
                          <td className="p-4 text-center font-bold text-[#211612]">
                            <span className="bg-[#FAF6EE] px-2.5 py-0.5 rounded-[4px] border border-[#E8DEC8]">
                              {cust.orderCount}
                            </span>
                          </td>
                          <td className="p-4 font-serif font-bold text-[#211612]">
                            Rs {cust.totalSpent}
                          </td>
                          <td className="p-4 text-stone-500 font-mono text-[11px]">
                            {cust.lastOrderDate
                              ? new Date(cust.lastOrderDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REAL REVIEWS APPROVAL */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Verified Customer Reviews
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Reviews submitted with verified Order # and phone number. Approve to show on product page.
                </p>
              </div>

              <div className="flex bg-[#FDFBF7] p-1 rounded-[6px] border border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    reviewFilter === "all"
                      ? "bg-[#211612] text-[#FAF6EE]"
                      : "text-stone-500 hover:text-[#211612]"
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("pending")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    reviewFilter === "pending"
                      ? "bg-amber-600 text-white"
                      : "text-amber-700 hover:text-amber-900"
                  }`}
                >
                  Pending ({reviews.filter((r) => r.status === "pending").length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter("approved")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    reviewFilter === "approved"
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-700 hover:text-emerald-900"
                  }`}
                >
                  Approved ({reviews.filter((r) => r.status === "approved").length})
                </button>
              </div>
            </div>

            <div className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#211612] font-bold border-b border-[#E8DEC8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Customer & Order</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Review Content</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8]/60">
                    {reviews
                      .filter((r) => reviewFilter === "all" || r.status === reviewFilter)
                      .map((rev) => (
                        <tr key={rev.id} className="hover:bg-[#FAF6EE]/50">
                          <td className="p-4 space-y-1">
                            <div className="font-bold text-[#211612]">{rev.customerName}</div>
                            <div className="text-[11px] font-mono text-stone-500">
                              Order #{rev.orderNumber}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {rev.phone}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1 text-[#A87B28] font-bold">
                              <span>{"★".repeat(rev.rating)}</span>
                              <span className="text-stone-400 font-normal">({rev.rating}/5)</span>
                            </div>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                            </div>
                          </td>

                          <td className="p-4 max-w-sm">
                            <p className="text-[#3D2C24] leading-relaxed line-clamp-3">
                              {rev.comment}
                            </p>
                            {rev.photoUrl && (
                              <a
                                href={rev.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#A87B28] hover:underline mt-1"
                              >
                                <span>View attached photo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border ${
                                rev.status === "approved"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : rev.status === "rejected"
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {rev.status}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {rev.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewStatus(rev.id, "approved")}
                                  className="px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {rev.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewStatus(rev.id, "rejected")}
                                  className="px-3 py-1.5 rounded-[4px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                className="p-1.5 rounded-[4px] text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-stone-400">
                          No customer reviews submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WHOLESALE INQUIRIES */}
        {activeTab === "wholesale" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Wholesale & Bulk Supply Inquiries
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Direct commercial inquiries submitted via the Contact / Wholesale portal.
                </p>
              </div>
              <span className="text-xs text-stone-500">
                {wholesaleInquiries.length} total inquiries
              </span>
            </div>

            <div className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#211612] font-bold border-b border-[#E8DEC8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Business & City</th>
                      <th className="p-4">Contact Person</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Quantity Needed</th>
                      <th className="p-4">Message / Requirements</th>
                      <th className="p-4">Received Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8]/60">
                    {wholesaleInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-4">
                          <div className="font-bold text-[#211612]">{inq.businessName}</div>
                          <div className="text-[11px] text-stone-500">{inq.city}</div>
                        </td>

                        <td className="p-4 font-medium text-[#211612]">
                          {inq.contactPerson}
                        </td>

                        <td className="p-4">
                          <a
                            href={`https://wa.me/91${inq.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#A87B28] font-bold hover:underline flex items-center gap-1"
                          >
                            <span>{inq.phone}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        <td className="p-4 font-bold text-[#211612]">
                          <span className="bg-[#FAF6EE] px-2.5 py-1 rounded-[4px] border border-[#E8DEC8]">
                            {inq.quantityNeeded}
                          </span>
                        </td>

                        <td className="p-4 max-w-sm">
                          <p className="text-[#3D2C24] leading-relaxed">
                            {inq.message || "-"}
                          </p>
                        </td>

                        <td className="p-4 text-stone-500 font-mono text-[11px]">
                          {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                    {wholesaleInquiries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-stone-400">
                          No wholesale inquiries received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW ORDER DETAILS WITH WHATSAPP DISPATCH */}
        {selectedOrderForView && (
          <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FDFBF7] rounded-[6px] max-w-xl w-full p-6 sm:p-8 space-y-6 border border-[#E8DEC8] shadow-2xl relative my-8">
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
                <div>
                  <span className="text-xs font-bold text-[#A87B28] uppercase tracking-wider font-mono">
                    Order Reference
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#211612]">
                    #{selectedOrderForView.orderNumber}
                  </h3>
                </div>
                <span className="text-xs font-bold bg-[#FAF6EE] text-[#211612] px-3 py-1 rounded-[4px] border border-[#E8DEC8]">
                  {selectedOrderForView.orderStatus}
                </span>
              </div>

              {/* Customer summary */}
              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E8DEC8] text-xs space-y-1.5">
                <p>
                  <strong>Customer:</strong> {selectedOrderForView.customerName}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrderForView.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrderForView.email}
                </p>
                <p>
                  <strong>Address:</strong> {selectedOrderForView.address},{" "}
                  {selectedOrderForView.city} - {selectedOrderForView.pincode}
                </p>
                <p>
                  <strong>Payment:</strong> {selectedOrderForView.paymentMethod} (
                  {selectedOrderForView.paymentStatus})
                </p>
                {selectedOrderForView.utr && (
                  <p className="font-mono text-[#A87B28] font-bold">
                    <strong>Transaction UTR:</strong> {selectedOrderForView.utr}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#211612] uppercase tracking-wider">
                  Ordered Jars:
                </h4>
                <div className="space-y-2">
                  {selectedOrderForView.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]"
                    >
                      <div>
                        <span className="font-bold text-[#211612]">{item.name}</span>
                        <span className="text-[#3D2C24]/60 block text-[11px]">
                          Weight: {item.size} • Quantity: {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-[#211612]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mark as Paid Action if not yet Paid */}
              {selectedOrderForView.paymentStatus !== "Paid" && (
                <div className="pt-2">
                  <button
                    onClick={() => handleMarkAsPaid(selectedOrderForView.id)}
                    className="w-full py-3 px-6 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Mark Payment as Paid</span>
                  </button>
                </div>
              )}

              {/* Pre-filled WhatsApp button */}
              <div className="pt-1">
                <a
                  href={`https://wa.me/91${selectedOrderForView.phone.replace(
                    /\D/g,
                    ""
                  )}?text=${encodeURIComponent(
                    getWhatsAppCustomerMessage(selectedOrderForView)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-[6px] bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Open WhatsApp with Pre-filled Order Update</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT WITH IMAGE UPLOAD */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#FDFBF7] rounded-[6px] max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#E8DEC8] shadow-2xl relative my-8">
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#211612]">
                  {editingProduct ? "Edit Pickle & Adjust Pricing" : "Add New Pickle Variety"}
                </h3>
                <p className="text-xs text-[#3D2C24]/60 mt-1">
                  Changes save to Supabase / local storage and reflect on the storefront instantly.
                </p>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Image Upload & Preview Section */}
                <div className="space-y-2 p-3.5 rounded-[6px] bg-[#FAF6EE] border border-[#E8DEC8]">
                  <label className="font-bold text-[#211612] block">
                    Product Image & Visual
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-[6px] overflow-hidden bg-white border border-[#E8DEC8] shrink-0">
                      <Image
                        src={prodImage}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] border border-[#211612] text-xs font-semibold hover:bg-[#1C130E] shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-[#C89B3C]" />
                        <span>Upload New Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-[#3D2C24]/60">
                        Select a JPEG/PNG photo from your computer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kashmiri Morel Morchella Mushroom Pickle"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">Short Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Infused with wild mountain spices and raw mustard oil"
                    value={prodSubtitle}
                    onChange={(e) => setProdSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#211612]">Flavour</label>
                    <select
                      value={prodFlavour}
                      onChange={(e) => setProdFlavour(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E8DEC8] focus:outline-none bg-[#FAF6EE] text-[#211612]"
                    >
                      <option value="Classic Masala">Classic Masala</option>
                      <option value="Garlic">Garlic</option>
                      <option value="Mustard Oil">Mustard Oil</option>
                      <option value="Spicy Red Chilli">Spicy Red Chilli</option>
                      <option value="Wild Herbal">Wild Herbal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#211612]">Spice Level</label>
                    <select
                      value={prodSpice}
                      onChange={(e) =>
                        setProdSpice(e.target.value as "Mild" | "Medium" | "Hot")
                      }
                      className="w-full px-3 py-2 rounded-[6px] border border-[#E8DEC8] focus:outline-none bg-[#FAF6EE] text-[#211612]"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Hot">Hot</option>
                    </select>
                  </div>
                </div>

                {/* Price by Size with Instant Edit */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-[#211612]">
                    Price by Jar Weight (₹):
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-[10px] text-[#3D2C24]/60 font-semibold block mb-0.5">
                        250g Jar Price
                      </span>
                      <input
                        type="number"
                        required
                        value={prodPrice250}
                        onChange={(e) => setProdPrice250(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] font-bold font-serif text-[#211612]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#3D2C24]/60 font-semibold block mb-0.5">
                        500g Jar Price
                      </span>
                      <input
                        type="number"
                        required
                        value={prodPrice500}
                        onChange={(e) => setProdPrice500(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] font-bold font-serif text-[#211612]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#3D2C24]/60 font-semibold block mb-0.5">
                        1kg Jar Price
                      </span>
                      <input
                        type="number"
                        required
                        value={prodPrice1kg}
                        onChange={(e) => setProdPrice1kg(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] font-bold font-serif text-[#211612]"
                      />
                    </div>
                  </div>
                </div>

                {/* Available Inventory (Stock) */}
                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">
                    Inventory Count (Available Jars)
                  </label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2.5 border-t border-[#E8DEC8]">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] text-stone-600 font-bold hover:bg-[#FAF6EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] font-bold shadow-sm transition-colors"
                  >
                    Save Pickle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
