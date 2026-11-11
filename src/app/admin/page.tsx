"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
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
  X,
  Upload,
  LogOut,
  Mail,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
  Smartphone,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Order,
  OrderStatus,
  Product,
  ProductPriceOption,
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
  normalizeOrderRow,
} from "@/lib/store";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { BRAND } from "@/lib/brand";
import { formatCustomerWhatsAppNumber } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { useAdminPwa, playSoftOrderBeep } from "./AdminPwaHooks";
import {
  OrderDetailModal,
  CourierTrackingModal,
  ConfirmDeleteModal,
} from "./AdminOrderModals";

const DEFAULT_TITLE = "AKHIL FOODS Admin";
const POLL_INTERVAL_MS = 30000;

const safeText = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return "-";
  const str = String(val).trim();
  return str === "" ? "-" : str;
};

export default function AdminPage() {
  const { canInstall, isInstalled, triggerInstall } = useAdminPwa();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Auth form
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // Filters & Search
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [salesPeriod, setSalesPeriod] = useState<"today" | "7days" | "30days">("today");
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Feedback, Missing Table Warnings, Live New Order Notification
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [newOrderNumbers, setNewOrderNumbers] = useState<string[]>([]);

  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedInitialOrdersRef = useRef(false);

  // Modals
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "product" | "review";
    id: string;
    label: string;
  } | null>(null);

  // Quick stock draft per product id so mobile users have an explicit Save button
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  // Edit / Add Product State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodSubtitle, setProdSubtitle] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodFlavour, setProdFlavour] = useState("Oyster Mushroom");
  const [prodIngredients, setProdIngredients] = useState(
    "Mushroom, Mustard Oil, Vinegar, Salt, Whole Spices"
  );
  const [prodShelfLife, setProdShelfLife] = useState(
    "Store in a cool, dry place, keep away from direct sunlight, use a clean dry spoon."
  );
  const [prodSpice, setProdSpice] = useState<"Mild" | "Medium" | "Hot">("Medium");
  const [prodSizes, setProdSizes] = useState<ProductPriceOption[]>([
    { size: "400 g", price: 399, originalPrice: 399, inStock: true },
  ]);
  const [prodStock, setProdStock] = useState(100);
  const [prodImage, setProdImage] = useState("/images/products/mushroom-mela-front.jpg");

  // Update browser tab title on new orders
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (newOrderNumbers.length > 0) {
      const label = newOrderNumbers.length === 1 ? "New order" : "New orders";
      document.title = `(${newOrderNumbers.length}) ${label} | ${DEFAULT_TITLE}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [newOrderNumbers]);

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

  const dismissNewOrderBanner = useCallback(() => {
    setNewOrderNumbers([]);
    setNewOrderIds([]);
  }, []);

  // Fetch Orders (shared between full loadData and 30s live poll)
  const fetchLiveOrders = useCallback(
    async (silentPoll: boolean = false) => {
      try {
        const resOrders = await fetchWithTimeout(
          "/api/admin/orders",
          { cache: "no-store" },
          5000
        );
        const ordersData = await resOrders.json();

        if (resOrders.status === 401) {
          setIsAuthenticated(false);
          return false;
        }

        if (ordersData?.success && Array.isArray(ordersData.orders)) {
          const normalized: Order[] = ordersData.orders.map(normalizeOrderRow);
          setOrders(normalized);

          if (!hasLoadedInitialOrdersRef.current) {
            seenOrderIdsRef.current = new Set(normalized.map((o) => o.id));
            hasLoadedInitialOrdersRef.current = true;
          } else {
            const newlyArrived = normalized.filter(
              (o) => !seenOrderIdsRef.current.has(o.id)
            );
            if (newlyArrived.length > 0) {
              newlyArrived.forEach((o) => seenOrderIdsRef.current.add(o.id));
              setNewOrderIds((prev) => [
                ...new Set([...newlyArrived.map((o) => o.id), ...prev]),
              ]);
              setNewOrderNumbers((prev) => [
                ...new Set([
                  ...newlyArrived.map((o) => o.orderNumber || o.id),
                  ...prev,
                ]),
              ]);
              if (soundEnabled) {
                playSoftOrderBeep();
              }
            }
          }
          return true;
        }

        if (!silentPoll && ordersData?.error) {
          setApiError(String(ordersData.error));
        }
        return false;
      } catch (err) {
        if (!silentPoll) {
          console.warn("Admin live orders fetch failed:", err);
        }
        return false;
      }
    },
    [soundEnabled]
  );

  // Load All Admin Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    const detectedMissing: string[] = [];

    try {
      // 1. Live Orders
      const ordersOk = await fetchLiveOrders(false);
      if (!ordersOk && process.env.NODE_ENV !== "production") {
        const local = getLocalOrders();
        const normalized = (local || []).map(normalizeOrderRow);
        setOrders(normalized);
        if (!hasLoadedInitialOrdersRef.current) {
          seenOrderIdsRef.current = new Set(normalized.map((o) => o.id));
          hasLoadedInitialOrdersRef.current = true;
        }
      }

      // 2. Live Products
      let productsLoaded = false;
      try {
        const resProducts = await fetchWithTimeout(
          "/api/admin/products",
          { cache: "no-store" },
          5000
        );
        const productsData = await resProducts.json();
        if (productsData?.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
          const drafts: Record<string, string> = {};
          productsData.products.forEach((p: Product) => {
            drafts[p.id] = String(p.stockCount ?? 0);
          });
          setStockDrafts(drafts);
          productsLoaded = true;
        }
      } catch (err) {
        console.warn("Admin products fetch failed:", err);
      }

      if (!productsLoaded) {
        const local = getLocalProducts();
        const fallback = local.length ? local : INITIAL_PRODUCTS;
        setProducts(fallback);
        const drafts: Record<string, string> = {};
        fallback.forEach((p) => {
          drafts[p.id] = String(p.stockCount ?? 0);
        });
        setStockDrafts(drafts);
      }

      // 3. Reviews
      try {
        const resReviews = await fetchWithTimeout(
          "/api/admin/reviews",
          { cache: "no-store" },
          4500
        );
        const revData = await resReviews.json();
        if (revData?.tableMissing) {
          detectedMissing.push("reviews");
        }
        if (revData?.success && Array.isArray(revData.reviews)) {
          setReviews(revData.reviews);
        } else {
          setReviews(getLocalReviews());
        }
      } catch {
        setReviews(getLocalReviews());
      }

      // 4. Wholesale Inquiries
      try {
        const resWholesale = await fetchWithTimeout(
          "/api/admin/wholesale",
          { cache: "no-store" },
          4500
        );
        const wData = await resWholesale.json();
        if (wData?.tableMissing) {
          detectedMissing.push("wholesale_inquiries");
        }
        if (wData?.success && Array.isArray(wData.inquiries)) {
          setWholesaleInquiries(wData.inquiries);
        } else {
          setWholesaleInquiries(getLocalWholesaleInquiries());
        }
      } catch {
        setWholesaleInquiries(getLocalWholesaleInquiries());
      }

      setMissingTables(detectedMissing);
    } catch (e) {
      console.error("Load data error:", e);
      setApiError("Unable to reach live database. Please check connection and refresh.");
    } finally {
      setLoading(false);
    }
  }, [fetchLiveOrders]);

  // Initial load on auth + 30s live orders polling while tab is visible
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedInitialOrdersRef.current = false;
      seenOrderIdsRef.current = new Set();
      return;
    }

    loadData();

    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchLiveOrders(true);
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveOrders(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, loadData, fetchLiveOrders]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server connection error. Please try again.";
      setAuthError(msg);
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
    dismissNewOrderBanner();
  };

  // Pre-filled WhatsApp Customer Message Generator
  const getWhatsAppCustomerMessage = (order: Order): string => {
    const itemsText = (order.items || [])
      .map((i) => `* ${safeText(i.name)} (${safeText(i.size)}) x${i.quantity ?? 1}`)
      .join("\n");

    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "";
    const trackingText = order.trackingNumber
      ? `\n\nCourier Dispatch Details:\n- Logistics Partner: ${order.courierName || "Courier"}\n- Tracking Number: ${order.trackingNumber}\n- Track Order: ${appUrl}/track-order?q=${order.orderNumber}`
      : `\n\nStatus: Preparing your Mushroom Mela pickle order in Village Nandsiya, Moth, Jhansi.`;

    return `Hi ${safeText(order.customerName)}, greetings from Akhil Foods.

Thank you for your order *#${safeText(order.orderNumber)}*.

Items in your parcel:
${itemsText || "-"}

Total Amount: Rs ${order.total ?? 0} (${safeText(order.paymentMethod)})
Shipping Destination: ${safeText(order.address)}, ${safeText(order.city)} - ${safeText(order.pincode)}
Current Status: ${safeText(order.orderStatus)}${trackingText}

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
      if (process.env.NODE_ENV !== "production") {
        updateLocalOrderStatus(orderId, newStatus);
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setApiError(data?.error || "Failed to update order status");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      setSelectedOrderForView((prev) =>
        prev && prev.id === orderId ? { ...prev, orderStatus: newStatus } : prev
      );

      setFeedbackMsg(`Order updated to ${newStatus}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update status", err);
      setApiError("Network error while updating order status.");
    }
  };

  // Mark Payment as Paid
  const handleMarkAsPaid = async (orderId: string) => {
    try {
      if (process.env.NODE_ENV !== "production") {
        updateLocalOrderStatus(orderId, undefined, undefined, undefined, "Paid");
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: "Paid" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setApiError(data?.error || "Failed to mark payment as paid");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: "Paid" } : o))
      );
      setSelectedOrderForView((prev) =>
        prev && prev.id === orderId ? { ...prev, paymentStatus: "Paid" } : prev
      );

      setFeedbackMsg("Payment marked as Paid!");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to mark order payment as paid", err);
      setApiError("Network error while updating payment status.");
    }
  };

  // Update Tracking for Orders (via CourierTrackingModal)
  const handleUpdateTracking = async (
    orderId: string,
    trackingNumber: string,
    courierName: string
  ) => {
    try {
      if (process.env.NODE_ENV !== "production") {
        updateLocalOrderStatus(orderId, "Shipped", trackingNumber, courierName);
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: "Shipped",
          trackingNumber,
          courierName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setApiError(data?.error || "Failed to update tracking");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "Shipped", trackingNumber, courierName }
            : o
        )
      );
      setSelectedOrderForView((prev) =>
        prev && prev.id === orderId
          ? { ...prev, orderStatus: "Shipped", trackingNumber, courierName }
          : prev
      );

      setFeedbackMsg("Consignment tracking saved & order marked Shipped");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update tracking", err);
      setApiError("Network error while saving tracking details.");
    }
  };

  // Execute Delete (Product or Review via ConfirmDeleteModal)
  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    if (type === "product") {
      try {
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setApiError(data?.error || "Failed to delete product");
          setDeleteTarget(null);
          return;
        }
      } catch {
        setApiError("Failed to delete product");
        setDeleteTarget(null);
        return;
      }

      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      if (process.env.NODE_ENV !== "production") {
        saveLocalProducts(updated);
      }
      setFeedbackMsg("Product removed from catalog");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else if (type === "review") {
      try {
        const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success) {
          setReviews((prev) => prev.filter((r) => r.id !== id));
          setFeedbackMsg("Review deleted");
          setTimeout(() => setFeedbackMsg(null), 3000);
        }
      } catch (err) {
        console.error("Failed to delete review", err);
      }
    }

    setDeleteTarget(null);
  };

  // Add / Edit Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const ingredientsArray = prodIngredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const cleanedSizes: ProductPriceOption[] = (
      prodSizes.length > 0
        ? prodSizes
        : [{ size: "400 g", price: 399, originalPrice: 399, inStock: true }]
    ).map((s) => ({
      size: (s.size || "400 g").trim(),
      price: Math.max(1, Number(s.price) || 399),
      originalPrice: Math.max(1, Number(s.originalPrice ?? s.price) || 399),
      inStock: s.inStock !== false,
    }));

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodName.trim(),
      slug:
        editingProduct?.slug ||
        prodName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-"),
      subtitle: prodSubtitle.trim() || "Oyster mushroom pickle in mustard oil and spices",
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
      stockCount: Math.max(0, Number(prodStock) || 0),
      sizes: cleanedSizes,
      badges: editingProduct?.badges || ["Oyster Mushroom", "400 g Jar", "FSSAI Registered"],
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setApiError(data?.error || "Failed to save product");
        return;
      }

      const savedProduct: Product = data.product || productPayload;
      if (editingProduct) {
        const updated = products.map((p) =>
          p.id === editingProduct.id ? savedProduct : p
        );
        setProducts(updated);
        if (process.env.NODE_ENV !== "production") saveLocalProducts(updated);
        setFeedbackMsg("Product pricing and stock updated!");
      } else {
        const updated = [savedProduct, ...products];
        setProducts(updated);
        if (process.env.NODE_ENV !== "production") saveLocalProducts(updated);
        setFeedbackMsg("New pickle variety added to catalog!");
      }

      setStockDrafts((prev) => ({
        ...prev,
        [savedProduct.id]: String(savedProduct.stockCount ?? 0),
      }));
      setShowProductModal(false);
      setEditingProduct(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.warn("Product API save error:", err);
      setApiError("Network error while saving product.");
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name || "");
    setProdSubtitle(p.subtitle || "");
    setProdDescription(p.description || "");
    setProdFlavour(p.flavour || "Oyster Mushroom");
    setProdIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(", ") : "");
    setProdShelfLife(p.shelfLife || "");
    setProdSpice((p.spiceLevel as "Mild" | "Medium" | "Hot") || "Medium");
    setProdSizes(
      Array.isArray(p.sizes) && p.sizes.length > 0
        ? p.sizes.map((s) => ({
            size: s.size || "400 g",
            price: Number(s.price) || 399,
            originalPrice: Number(s.originalPrice ?? s.price) || 399,
            inStock: s.inStock !== false,
          }))
        : [{ size: "400 g", price: 399, originalPrice: 399, inStock: true }]
    );
    setProdStock(Number(p.stockCount) || 0);
    setProdImage(p.image || "/images/products/mushroom-mela-front.jpg");
    setShowProductModal(true);
  };

  // Quick Edit Stock
  const handleUpdateStock = async (productId: string, newStock: number) => {
    const qty = Math.max(0, Number(newStock) || 0);
    const target = products.find((p) => p.id === productId);
    const updatedSizes = (target?.sizes || []).map((s) => ({
      ...s,
      inStock: qty > 0,
    }));

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stockCount: qty, sizes: updatedSizes }),
      });
      const data = await res.json();
      if (data?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, stockCount: qty, sizes: updatedSizes } : p
          )
        );
        setStockDrafts((prev) => ({ ...prev, [productId]: String(qty) }));
        setFeedbackMsg(`Stock updated to ${qty} jars (${qty > 0 ? "In Stock" : "Out of Stock"})`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setApiError(data?.error || "Failed to update stock");
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  // Quick Toggle In Stock / Out of Stock
  const handleToggleProductInStock = async (product: Product) => {
    const currentlyInStock =
      (Number(product.stockCount) || 0) > 0 &&
      (product.sizes || []).some((s) => s.inStock !== false);

    const nextStock = currentlyInStock
      ? 0
      : Math.max(1, Number(product.stockCount) || 50);
    const nextSizes = (product.sizes || []).map((s) => ({
      ...s,
      inStock: !currentlyInStock,
    }));

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          stockCount: nextStock,
          sizes: nextSizes,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stockCount: nextStock, sizes: nextSizes }
              : p
          )
        );
        setStockDrafts((prev) => ({ ...prev, [product.id]: String(nextStock) }));
        setFeedbackMsg(
          `${product.name} marked as ${!currentlyInStock ? "In Stock" : "Out of Stock"}`
        );
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setApiError(data?.error || "Failed to update stock status");
      }
    } catch (err) {
      console.error("Failed to toggle stock status", err);
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
      "payment method",
      "payment status",
      "order status",
    ];

    const rows = orders.map((o) => {
      const itemsFormatted = (o.items || [])
        .map((it) => `${it.name || "-"} (${it.size || "-"}) x${it.quantity ?? 1}`)
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
        `"${(o.paymentMethod || "").replace(/"/g, '""')}"`,
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
      map[key].totalSpent += Number(o.total) || 0;
      if (new Date(o.createdAt).getTime() >= new Date(map[key].lastOrderDate).getTime()) {
        map[key].lastOrderDate = o.createdAt;
        if (o.customerName) map[key].name = o.customerName;
      }
    }

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // CSV Export for Customers
  const exportCustomersCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Number of Orders",
      "Total Spent (INR)",
      "Last Order Date",
    ];

    const rows = customerList.map((c) => [
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      c.orderCount,
      c.totalSpent,
      `"${c.lastOrderDate ? new Date(c.lastOrderDate).toISOString() : ""}"`,
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

  const [currentTime, setCurrentTime] = useState<number | null>(null);
  useEffect(() => {
    setCurrentTime(Date.now());
  }, [orders.length]);

  // Sales Statistics Calculation
  const salesStats = useMemo(() => {
    const emptyStats = { count: 0, revenue: 0, bestSellers: [] };
    if (!currentTime) {
      return { today: emptyStats, "7days": emptyStats, "30days": emptyStats };
    }

    const startOfToday = new Date(currentTime);
    startOfToday.setHours(0, 0, 0, 0);

    const calcForOrders = (list: Order[]) => {
      const count = list.length;
      const revenue = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
      for (const order of list) {
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            const label = (item.name || "Pickle") + (item.size ? ` (${item.size})` : "");
            if (!itemMap[label]) {
              itemMap[label] = { name: label, quantity: 0, revenue: 0 };
            }
            itemMap[label].quantity += Number(item.quantity) || 1;
            itemMap[label].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
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

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "New" || o.orderStatus === "Packed"
  ).length;

  // 1. Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF6EE]">
        <div className="bg-[#FDFBF7] p-6 sm:p-10 rounded-xl border border-[#E8DEC8] shadow-sm max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8 text-[#C89B3C]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FAF6EE] bg-[#1C130E] border border-[#C89B3C]/30 px-3 py-1 rounded">
              Restricted Area
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612] pt-2">
              Staff & Admin Portal
            </h1>
            <p className="text-xs text-[#3D2C24]/70 font-sans">
              Sign in with staff passkey to manage live orders, products, and inventory.
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#211612] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A87B28]" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full min-h-[44px] px-4 py-3 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#211612] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#A87B28]" />
                <span>Admin Passkey (ADMIN_PASSWORD)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Enter server ADMIN_PASSWORD"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full min-h-[44px] pl-4 pr-12 py-3 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide passkey" : "Show passkey"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#3D2C24]/70 hover:text-[#211612]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full min-h-[46px] py-3.5 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4 text-[#C89B3C]" />
              <span>{authLoading ? "Authenticating..." : "Unlock Store Admin"}</span>
            </button>
          </form>

          {canInstall && (
            <button
              type="button"
              onClick={triggerInstall}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#EFE8DD] hover:bg-[#E8DEC8] text-[#211612] border border-[#C89B3C]/40 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-[#A87B28]" />
              <span>Install AKHIL FOODS Admin App</span>
            </button>
          )}

          <div className="pt-2 border-t border-[#E8DEC8] space-y-1 text-[11px] text-[#3D2C24]/60 text-center">
            <p>Authorized personnel only. Enter your administrator password to proceed.</p>
            <p className="text-[10px] text-stone-400">
              {isSupabaseConfigured ? "Supabase Connected" : "Local development mode"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const q = searchOrder.trim().toLowerCase();
    const matchesQuery =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.orderStatus?.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.flavour?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredCustomers = customerList.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchCustomer.toLowerCase()) ||
      (c.phone || "").includes(searchCustomer)
  );

  const filteredReviews = reviews.filter(
    (r) => reviewFilter === "all" || r.status === reviewFilter
  );

  return (
    <div className="py-6 sm:py-12 bg-[#FAF6EE] min-h-screen">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-[#E8DEC8] gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-emerald-600" />
              <span className="text-xs font-bold text-[#A87B28] uppercase tracking-wider">
                Store Operations • {adminUser}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live • 30s{isInstalled ? " • App" : ""}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#211612]">
              Store Management Portal
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#211612]">
              <span className="bg-[#FDFBF7] px-2.5 py-1 rounded border border-[#E8DEC8]">
                FSSAI: <strong>{BRAND.fssaiNumber}</strong> (till {BRAND.fssaiValidity})
              </span>
              <span className="bg-[#FDFBF7] px-2.5 py-1 rounded border border-[#E8DEC8]">
                GSTIN: <strong>{BRAND.gstNumber}</strong>
              </span>
              <span className="bg-[#FDFBF7] px-2.5 py-1 rounded border border-[#E8DEC8]">
                Udyam: <strong>{BRAND.udyamNumber}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canInstall && (
              <button
                type="button"
                onClick={triggerInstall}
                className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#C89B3C] hover:bg-[#A87B28] text-[#211612] text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-label={soundEnabled ? "Mute new order chime" : "Enable new order chime"}
              title={soundEnabled ? "Order alert sound ON" : "Order alert sound OFF"}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-[#FDFBF7] border border-[#E8DEC8] text-xs font-semibold text-[#211612] hover:bg-[#EFE8DD] flex items-center justify-center gap-1.5"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#A87B28]" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
            </button>

            <button
              type="button"
              onClick={() => loadData()}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#FDFBF7] border border-[#E8DEC8] text-xs font-semibold text-[#211612] hover:bg-[#EFE8DD] flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* New Order Banner */}
        {newOrderNumbers.length > 0 && (
          <div className="bg-[#1C130E] text-[#FAF6EE] border-2 border-[#C89B3C] p-3.5 sm:p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#C89B3C] shrink-0" />
              <div className="text-xs sm:text-sm font-bold">
                New order: {newOrderNumbers.join(", ")}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("orders");
                  const firstNew = orders.find((o) => newOrderIds.includes(o.id));
                  if (firstNew) setSelectedOrderForView(firstNew);
                }}
                className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-lg bg-[#C89B3C] text-[#211612] text-xs font-bold"
              >
                View Order
              </button>
              <button
                type="button"
                onClick={dismissNewOrderBanner}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-[#2A1D17] text-[#EADBB6] text-xs font-semibold border border-[#C89B3C]/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {feedbackMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {apiError && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="min-w-[36px] min-h-[36px] text-amber-800 font-bold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-[#FDFBF7] p-4 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="font-serif text-xl sm:text-3xl font-extrabold text-[#211612]">
              ₹{totalRevenue}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Gross order book</p>
          </div>

          <div className="bg-[#FDFBF7] p-4 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase">Total Orders</span>
              <Package className="w-4 h-4 text-[#A87B28] shrink-0" />
            </div>
            <div className="font-serif text-xl sm:text-3xl font-extrabold text-[#211612]">
              {orders.length}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Recorded orders</p>
          </div>

          <div className="bg-[#FDFBF7] p-4 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase">Pending Dispatch</span>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <div className="font-serif text-xl sm:text-3xl font-extrabold text-amber-700">
              {pendingOrders}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">New & Packed orders</p>
          </div>

          <div className="bg-[#FDFBF7] p-4 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] sm:text-xs font-semibold uppercase">Active Catalog</span>
              <ShoppingBag className="w-4 h-4 text-[#A87B28] shrink-0" />
            </div>
            <div className="font-serif text-xl sm:text-3xl font-extrabold text-[#211612]">
              {products.length}
            </div>
            <p className="text-[11px] text-[#3D2C24]/60">Pickle varieties</p>
          </div>
        </div>

        {/* Horizontal Scrollable Tab Bar (Works cleanly at 360px) */}
        <div
          role="tablist"
          aria-label="Store management sections"
          className="flex flex-nowrap overflow-x-auto gap-5 sm:gap-7 border-b border-[#E8DEC8] pb-0.5"
        >
          {(
            [
              { id: "orders", label: `Orders (${orders.length})` },
              { id: "products", label: `Products & Stock (${products.length})` },
              { id: "sales", label: "Sales Report" },
              { id: "customers", label: `Customers (${customerList.length})` },
              { id: "reviews", label: `Reviews (${reviews.length})` },
              { id: "wholesale", label: `Wholesale (${wholesaleInquiries.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] pb-3 pt-1 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all relative ${
                activeTab === tab.id
                  ? "text-[#211612]"
                  : "text-stone-500 hover:text-[#211612]"
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#211612]" />
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Filter by Order #, Customer, Phone..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
                  aria-label="Filter orders by status"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs font-bold text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                <span className="text-xs text-stone-500">
                  Showing {filteredOrders.length} orders
                </span>
                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#C89B3C]" />
                  <span>Download orders CSV</span>
                </button>
              </div>
            </div>

            {/* MOBILE ORDERS CARDS (< md / 360px friendly) */}
            <div className="md:hidden space-y-3">
              {filteredOrders.length === 0 && (
                <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-8 text-center text-xs text-stone-400">
                  No customer orders found matching your filter.
                </div>
              )}

              {filteredOrders.map((order) => {
                const isNewOrderHighlight = newOrderIds.includes(order.id);
                const cleanPhone = formatCustomerWhatsAppNumber(order.phone || "");
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  getWhatsAppCustomerMessage(order)
                )}`;
                const dateLabel =
                  order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-";

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-4 space-y-3 shadow-sm ${
                      isNewOrderHighlight
                        ? "bg-[#FFF8E7] border-[#C89B3C] ring-2 ring-[#C89B3C]/60"
                        : "bg-[#FDFBF7] border-[#E8DEC8]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E8DEC8]">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForView(order);
                              dismissNewOrderBanner();
                            }}
                            className="font-mono font-bold text-sm text-[#211612] hover:underline flex items-center gap-1 min-h-[36px]"
                          >
                            <span>#{safeText(order.orderNumber)}</span>
                            <Eye className="w-3.5 h-3.5 text-[#A87B28]" />
                          </button>
                          {isNewOrderHighlight && (
                            <span className="px-2 py-0.5 rounded bg-[#C89B3C] text-[#211612] text-[10px] font-bold uppercase">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">{dateLabel}</p>
                      </div>

                      <div className="text-right">
                        <div className="font-serif font-extrabold text-lg text-[#211612]">
                          ₹{Number(order.total) || 0}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {(order.paymentMethod || "").includes("Cash")
                            ? "COD"
                            : (order.paymentMethod || "").includes("UPI")
                            ? "UPI"
                            : "Online"}{" "}
                          • {safeText(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-[#211612]">{safeText(order.customerName)}</div>
                      <div className="font-mono text-[#3D2C24]">
                        {safeText(order.phone)} • {safeText(order.city)}, {safeText(order.pincode)}
                      </div>
                      {order.utr && (
                        <div className="font-mono text-[11px] text-[#A87B28] font-bold">
                          UTR: {order.utr}
                        </div>
                      )}
                      <div className="pt-1 space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="text-[11px] text-[#3D2C24]">
                            {safeText(item.name)}{" "}
                            <span className="bg-[#FAF6EE] px-1.5 py-0.5 rounded border border-[#E8DEC8] font-semibold">
                              {safeText(item.size)} × {item.quantity ?? 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Big Tap-Target Controls */}
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#E8DEC8]">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={order.orderStatus || "New"}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          aria-label={`Order status for ${order.orderNumber}`}
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-xs font-bold text-[#211612]"
                        >
                          <option value="New">New</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setTrackingOrder(order)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#FAF6EE] border border-[#E8DEC8] text-[#211612] text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Truck className="w-4 h-4 text-[#A87B28]" />
                          <span>Tracking</span>
                        </button>
                      </div>

                      {order.paymentStatus !== "Paid" && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(order.id)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark as Paid</span>
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForView(order);
                            dismissNewOrderBanner();
                          }}
                          className="min-h-[44px] px-3 py-2 rounded-lg bg-[#211612] text-[#FAF6EE] text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-[#C89B3C]" />
                          <span>Full Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP ORDERS TABLE */}
            <div className="hidden md:block bg-[#FDFBF7] rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden">
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
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-stone-400">
                          No customer orders found matching your search.
                        </td>
                      </tr>
                    )}
                    {filteredOrders.map((order) => {
                      const isNewOrderHighlight = newOrderIds.includes(order.id);
                      const cleanPhone = formatCustomerWhatsAppNumber(order.phone || "");
                      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        getWhatsAppCustomerMessage(order)
                      )}`;

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isNewOrderHighlight
                              ? "bg-[#FFF8E7] ring-1 ring-inset ring-[#C89B3C]"
                              : "hover:bg-[#FAF6EE]/50"
                          }`}
                        >
                          <td className="p-4 font-mono font-bold text-[#211612]">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrderForView(order);
                                  dismissNewOrderBanner();
                                }}
                                className="hover:underline flex items-center gap-1 text-[#211612]"
                              >
                                <span>{safeText(order.orderNumber)}</span>
                                <Eye className="w-3 h-3 text-stone-400" />
                              </button>
                              {isNewOrderHighlight && (
                                <span className="px-1.5 py-0.5 rounded bg-[#C89B3C] text-[#211612] text-[9px] font-bold uppercase">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 font-normal">
                              {order.createdAt && !isNaN(new Date(order.createdAt).getTime())
                                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "-"}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-[#211612]">
                              {safeText(order.customerName)}
                            </div>
                            <div className="text-stone-500 text-[11px] font-mono">
                              {safeText(order.phone)}
                            </div>
                            <div className="text-stone-400 text-[10px] truncate max-w-[150px]">
                              {safeText(order.city)}, {safeText(order.pincode)}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="text-[#3D2C24]">
                                  <span className="font-medium">{safeText(item.name)}</span>{" "}
                                  <span className="text-[10px] text-[#211612] bg-[#FAF6EE] px-1.5 py-0.5 rounded font-bold border border-[#E8DEC8]">
                                    {safeText(item.size)} × {item.quantity ?? 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-serif font-bold text-sm text-[#211612]">
                              ₹{Number(order.total) || 0}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                order.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : order.paymentStatus === "Awaiting verification" ||
                                    order.paymentStatus === "Payment pending verification"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : (order.paymentMethod || "").includes("Cash")
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-stone-100 text-stone-700 border border-stone-200"
                              }`}
                            >
                              {(order.paymentMethod || "").includes("Cash")
                                ? "COD"
                                : (order.paymentMethod || "").includes("UPI")
                                ? "UPI"
                                : "Online"}{" "}
                              ({safeText(order.paymentStatus)})
                            </span>
                            {order.utr && (
                              <div className="text-[10px] font-mono text-[#A87B28] font-bold mt-1">
                                UTR: {order.utr}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <select
                              value={order.orderStatus || "New"}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="px-3 py-1.5 rounded border border-[#E8DEC8] bg-[#FAF6EE] text-xs font-semibold text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#211612]"
                            >
                              <option value="New">New</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {order.paymentStatus !== "Paid" && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(order.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark as Paid</span>
                                </button>
                              )}

                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setTrackingOrder(order)}
                                className="p-2 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
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

        {/* TAB 2: PRODUCTS & STOCK */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Pickle Catalog & Stock
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Update prices, adjust jar stock, and toggle In Stock / Out of Stock.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProdName("");
                    setProdSubtitle("");
                    setProdDescription("");
                    setProdFlavour("Oyster Mushroom");
                    setProdSizes([{ size: "400 g", price: 399, originalPrice: 399, inStock: true }]);
                    setProdStock(100);
                    setProdImage("/images/products/mushroom-mela-front.jpg");
                    setShowProductModal(true);
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>Add New Pickle</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-stone-400 bg-[#FDFBF7] rounded-xl border border-[#E8DEC8]">
                  No products found in catalog.
                </div>
              )}

              {filteredProducts.map((p) => {
                const isInStock =
                  (Number(p.stockCount) || 0) > 0 &&
                  (p.sizes || []).some((s) => s.inStock !== false);
                const draftVal = stockDrafts[p.id] ?? String(p.stockCount ?? 0);

                return (
                  <div
                    key={p.id}
                    className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square bg-[#FAF6EE]">
                        <Image
                          src={p.image || "/images/products/mushroom-mela-front.jpg"}
                          alt={p.name}
                          fill
                          className="object-contain p-3"
                        />
                        <span
                          className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded shadow-sm border ${
                            isInStock
                              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                              : "bg-red-900 text-red-100 border-red-700"
                          }`}
                        >
                          {isInStock ? `In Stock (${p.stockCount})` : "Out of Stock"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-3">
                        <span className="inline-block text-[10px] font-bold text-[#C89B3C] bg-[#1C130E] px-2.5 py-0.5 rounded border border-[#C89B3C]/30">
                          {safeText(p.flavour)}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#211612] leading-snug">
                          {safeText(p.name)}
                        </h4>

                        <div className="space-y-1 text-xs text-[#3D2C24]/80 bg-[#FAF6EE] p-3 rounded-lg border border-[#E8DEC8]">
                          {(p.sizes || []).map((s) => (
                            <div key={s.size} className="flex justify-between items-center">
                              <span className="font-medium">
                                {safeText(s.size)} ({s.inStock === false ? "Out" : "In Stock"}):
                              </span>
                              <span className="font-serif font-extrabold text-[#211612]">
                                ₹{s.price}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Stock input + explicit Save button */}
                        <div className="flex items-center justify-between gap-2 bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E8DEC8] text-xs">
                          <span className="font-bold text-[#211612]">Stock:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={draftVal}
                              onChange={(e) =>
                                setStockDrafts((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              aria-label={`Stock count for ${p.name}`}
                              className="w-16 min-h-[38px] px-2 py-1 text-xs border border-[#E8DEC8] rounded bg-white font-mono font-bold text-[#211612] text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(p.id, Number(draftVal))}
                              className="min-h-[38px] px-2.5 py-1 rounded bg-[#211612] text-[#FAF6EE] text-[11px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        {/* Quick In Stock / Out of Stock Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleProductInStock(p)}
                          className={`w-full min-h-[44px] py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                            isInStock
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {isInStock ? "Mark Out of Stock" : "Mark In Stock"}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="min-h-[44px] py-2.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E8DEC8] text-[#211612] text-xs font-bold flex items-center justify-center gap-1 border border-[#E8DEC8]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "product",
                            id: p.id,
                            label: p.name,
                          })
                        }
                        className="min-h-[44px] py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1 border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SALES REPORT */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Sales & Revenue Report
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Performance metrics and best-selling item tracking across periods.
                </p>
              </div>

              <div className="flex bg-[#FDFBF7] p-1 rounded-lg border border-[#E8DEC8] w-full sm:w-auto">
                {(
                  [
                    { id: "today", label: "Today" },
                    { id: "7days", label: "7 Days" },
                    { id: "30days", label: "30 Days" },
                  ] as const
                ).map((period) => (
                  <button
                    key={period.id}
                    type="button"
                    onClick={() => setSalesPeriod(period.id)}
                    className={`flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 text-xs font-bold rounded transition-all ${
                      salesPeriod === period.id
                        ? "bg-[#211612] text-[#FAF6EE]"
                        : "text-stone-500 hover:text-[#211612]"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { id: "today", title: "Today", stats: salesStats.today },
                  { id: "7days", title: "Last 7 Days", stats: salesStats["7days"] },
                  { id: "30days", title: "Last 30 Days", stats: salesStats["30days"] },
                ] as const
              ).map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSalesPeriod(card.id)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    salesPeriod === card.id
                      ? "bg-[#FDFBF7] border-[#211612] shadow-sm"
                      : "bg-[#FDFBF7] border-[#E8DEC8] hover:border-stone-400"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87B28] block">
                    {card.title}
                  </span>
                  <div className="font-serif text-2xl font-extrabold text-[#211612] mt-1">
                    ₹{card.stats.revenue}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {card.stats.count} {card.stats.count === 1 ? "order" : "orders"} placed
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] shadow-sm overflow-hidden space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8DEC8]">
                <h4 className="font-serif text-base font-bold text-[#211612]">
                  Best Selling Items (
                  {salesPeriod === "today"
                    ? "Today"
                    : salesPeriod === "7days"
                    ? "Last 7 Days"
                    : "Last 30 Days"}
                  )
                </h4>
                <span className="text-xs text-stone-500">
                  {salesStats[salesPeriod].bestSellers.length} products
                </span>
              </div>

              {salesStats[salesPeriod].bestSellers.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No orders or sales recorded for this period.
                </div>
              ) : (
                <>
                  <div className="md:hidden space-y-2.5">
                    {salesStats[salesPeriod].bestSellers.map((item, idx) => (
                      <div
                        key={item.name}
                        className="p-3 rounded-lg bg-[#FAF6EE] border border-[#E8DEC8] text-xs flex justify-between items-center gap-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#A87B28]">#{idx + 1} </span>
                          <span className="font-bold text-[#211612]">{item.name}</span>
                          <div className="text-[11px] text-stone-500">
                            {item.quantity} jars sold
                          </div>
                        </div>
                        <span className="font-serif font-bold text-sm text-[#211612]">
                          ₹{item.revenue}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
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
                              ₹{item.revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Customer Directory
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Aggregated buyer profiles derived from live orders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={exportCustomersCSV}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-lg bg-[#FDFBF7] hover:bg-[#E8DEC8] text-[#211612] border border-[#E8DEC8] text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#A87B28]" />
                  <span>Export Customers CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>Orders CSV</span>
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E8DEC8] text-xs focus:outline-none"
              />
            </div>

            {/* Mobile Customer Cards */}
            <div className="md:hidden space-y-3">
              {filteredCustomers.length === 0 && (
                <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-8 text-center text-xs text-stone-400">
                  No customer records found.
                </div>
              )}
              {filteredCustomers.map((cust, i) => (
                <div
                  key={i}
                  className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-4 space-y-2 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#211612]">{safeText(cust.name)}</div>
                      <div className="font-mono text-stone-600">{safeText(cust.phone)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#211612]">
                        ₹{cust.totalSpent}
                      </div>
                      <div className="text-[11px] text-stone-500">{cust.orderCount} orders</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-500 pt-1 border-t border-[#E8DEC8]">
                    Last order:{" "}
                    {cust.lastOrderDate && !isNaN(new Date(cust.lastOrderDate).getTime())
                      ? new Date(cust.lastOrderDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Customer Table */}
            <div className="hidden md:block bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] shadow-sm overflow-hidden">
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
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-stone-400">
                          No customer records found.
                        </td>
                      </tr>
                    )}
                    {filteredCustomers.map((cust, i) => (
                      <tr key={i} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-4 font-bold text-[#211612]">{safeText(cust.name)}</td>
                        <td className="p-4 font-mono text-stone-600">{safeText(cust.phone)}</td>
                        <td className="p-4 text-center font-bold text-[#211612]">
                          <span className="bg-[#FAF6EE] px-2.5 py-0.5 rounded border border-[#E8DEC8]">
                            {cust.orderCount}
                          </span>
                        </td>
                        <td className="p-4 font-serif font-bold text-[#211612]">
                          ₹{cust.totalSpent}
                        </td>
                        <td className="p-4 text-stone-500 font-mono text-[11px]">
                          {cust.lastOrderDate && !isNaN(new Date(cust.lastOrderDate).getTime())
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

        {/* TAB 5: REVIEWS */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {missingTables.includes("reviews") && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs">
                Supabase table <code>public.reviews</code> is not created yet. Run the SQL provided
                to enable live review storage.
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Verified Customer Reviews
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Approve or reject verified customer reviews.
                </p>
              </div>

              <div className="flex flex-nowrap overflow-x-auto bg-[#FDFBF7] p-1 rounded-lg border border-[#E8DEC8] max-w-full">
                {(
                  [
                    { id: "all", label: `All (${reviews.length})` },
                    {
                      id: "pending",
                      label: `Pending (${reviews.filter((r) => r.status === "pending").length})`,
                    },
                    {
                      id: "approved",
                      label: `Approved (${reviews.filter((r) => r.status === "approved").length})`,
                    },
                    {
                      id: "rejected",
                      label: `Rejected (${reviews.filter((r) => r.status === "rejected").length})`,
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReviewFilter(f.id)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap shrink-0 transition-all ${
                      reviewFilter === f.id
                        ? "bg-[#211612] text-[#FAF6EE]"
                        : "text-stone-600 hover:text-[#211612]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Reviews Cards */}
            <div className="md:hidden space-y-3">
              {filteredReviews.length === 0 && (
                <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-8 text-center text-xs text-stone-400">
                  No customer reviews found.
                </div>
              )}
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-4 space-y-3 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-[#211612]">{safeText(rev.customerName)}</div>
                      <div className="font-mono text-[11px] text-stone-500">
                        Order #{safeText(rev.orderNumber)} • {safeText(rev.phone)}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF6EE] border border-[#E8DEC8]">
                      {safeText(rev.status)}
                    </span>
                  </div>
                  <div className="text-[#A87B28] font-bold">
                    {"★".repeat(Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))} (
                    {rev.rating}/5)
                  </div>
                  <p className="text-[#3D2C24] leading-relaxed">{safeText(rev.comment)}</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {rev.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleReviewStatus(rev.id, "approved")}
                        className="min-h-[44px] rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleReviewStatus(rev.id, "rejected")}
                        className="min-h-[44px] rounded-lg bg-stone-200 text-stone-800 font-bold text-xs"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: "review",
                          id: rev.id,
                          label: rev.customerName,
                        })
                      }
                      className="min-h-[44px] rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Reviews Table */}
            <div className="hidden md:block bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] shadow-sm overflow-hidden">
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
                    {filteredReviews.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-xs text-stone-400">
                          No customer reviews submitted yet.
                        </td>
                      </tr>
                    )}
                    {filteredReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-4 space-y-1">
                          <div className="font-bold text-[#211612]">
                            {safeText(rev.customerName)}
                          </div>
                          <div className="text-[11px] font-mono text-stone-500">
                            Order #{safeText(rev.orderNumber)}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {safeText(rev.phone)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-[#A87B28] font-bold">
                            <span>
                              {"★".repeat(
                                Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5)))
                              )}
                            </span>
                            <span className="text-stone-400 font-normal">({rev.rating}/5)</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-sm">
                          <p className="text-[#3D2C24] leading-relaxed line-clamp-3">
                            {safeText(rev.comment)}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase border bg-[#FAF6EE]">
                            {safeText(rev.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rev.status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => handleReviewStatus(rev.id, "approved")}
                                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                              >
                                Approve
                              </button>
                            )}
                            {rev.status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleReviewStatus(rev.id, "rejected")}
                                className="px-3 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "review",
                                  id: rev.id,
                                  label: rev.customerName,
                                })
                              }
                              className="p-1.5 rounded text-red-600 hover:bg-red-50"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WHOLESALE INQUIRIES */}
        {activeTab === "wholesale" && (
          <div className="space-y-4">
            {missingTables.includes("wholesale_inquiries") && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs">
                Supabase table <code>public.wholesale_inquiries</code> is not created yet. Run the
                SQL provided to enable wholesale persistence.
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  Wholesale & Bulk Supply Inquiries
                </h3>
                <p className="text-xs text-[#3D2C24]/60">
                  Direct commercial inquiries submitted via the Wholesale portal.
                </p>
              </div>
              <span className="text-xs text-stone-500">
                {wholesaleInquiries.length} total inquiries
              </span>
            </div>

            {/* Mobile Wholesale Cards */}
            <div className="md:hidden space-y-3">
              {wholesaleInquiries.length === 0 && (
                <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-8 text-center text-xs text-stone-400">
                  No wholesale inquiries received yet.
                </div>
              )}
              {wholesaleInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] p-4 space-y-2.5 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#211612]">
                        {safeText(inq.businessName)}
                      </div>
                      <div className="text-stone-500">
                        {safeText(inq.contactPerson)} • {safeText(inq.city)}
                      </div>
                    </div>
                    <span className="bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#E8DEC8] font-bold">
                      {safeText(inq.quantityNeeded)}
                    </span>
                  </div>
                  <p className="text-[#3D2C24]">{safeText(inq.message)}</p>
                  <a
                    href={`https://wa.me/${formatCustomerWhatsAppNumber(inq.phone || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] rounded-lg bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp {safeText(inq.phone)}</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Desktop Wholesale Table */}
            <div className="hidden md:block bg-[#FDFBF7] rounded-xl border border-[#E8DEC8] shadow-sm overflow-hidden">
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
                    {wholesaleInquiries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-stone-400">
                          No wholesale inquiries received yet.
                        </td>
                      </tr>
                    )}
                    {wholesaleInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-4">
                          <div className="font-bold text-[#211612]">
                            {safeText(inq.businessName)}
                          </div>
                          <div className="text-[11px] text-stone-500">{safeText(inq.city)}</div>
                        </td>
                        <td className="p-4 font-medium text-[#211612]">
                          {safeText(inq.contactPerson)}
                        </td>
                        <td className="p-4">
                          <a
                            href={`https://wa.me/${formatCustomerWhatsAppNumber(inq.phone || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[#A87B28] font-bold hover:underline flex items-center gap-1"
                          >
                            <span>{safeText(inq.phone)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="p-4 font-bold text-[#211612]">
                          <span className="bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#E8DEC8]">
                            {safeText(inq.quantityNeeded)}
                          </span>
                        </td>
                        <td className="p-4 max-w-sm">
                          <p className="text-[#3D2C24] leading-relaxed">{safeText(inq.message)}</p>
                        </td>
                        <td className="p-4 text-stone-500 font-mono text-[11px]">
                          {inq.createdAt && !isNaN(new Date(inq.createdAt).getTime())
                            ? new Date(inq.createdAt).toLocaleDateString("en-IN", {
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

        {/* MODALS */}
        {selectedOrderForView && (
          <OrderDetailModal
            order={selectedOrderForView}
            onClose={() => setSelectedOrderForView(null)}
            onStatusChange={handleStatusChange}
            onMarkAsPaid={handleMarkAsPaid}
            onOpenTracking={(ord) => setTrackingOrder(ord)}
            getWhatsAppMessage={getWhatsAppCustomerMessage}
          />
        )}

        {trackingOrder && (
          <CourierTrackingModal
            order={trackingOrder}
            onClose={() => setTrackingOrder(null)}
            onSave={handleUpdateTracking}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            title={`Delete ${deleteTarget.type === "product" ? "Product" : "Review"}`}
            message={`Are you sure you want to permanently delete "${deleteTarget.label}"?`}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={executeDelete}
          />
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#FDFBF7] rounded-xl max-w-lg w-full p-5 sm:p-7 space-y-4 border border-[#E8DEC8] shadow-2xl relative my-4">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-400 hover:text-[#211612]"
                aria-label="Close product modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-10">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
                  {editingProduct ? "Edit Pickle & Pricing" : "Add New Pickle Variety"}
                </h3>
                <p className="text-xs text-[#3D2C24]/60 mt-1">
                  Changes sync directly to Supabase and reflect on the storefront.
                </p>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="space-y-2 p-3.5 rounded-lg bg-[#FAF6EE] border border-[#E8DEC8]">
                  <label className="font-bold text-[#211612] block">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-[#E8DEC8] shrink-0">
                      <Image
                        src={prodImage}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="cursor-pointer min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#211612] text-[#FAF6EE] text-xs font-semibold hover:bg-[#1C130E]">
                      <Upload className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Mushroom Mela Oyster Mushroom Pickle"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">Short Subtitle</label>
                  <input
                    type="text"
                    value={prodSubtitle}
                    onChange={(e) => setProdSubtitle(e.target.value)}
                    placeholder="Oyster mushroom pickle in mustard oil and spices"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#211612]">Flavour</label>
                    <input
                      type="text"
                      value={prodFlavour}
                      onChange={(e) => setProdFlavour(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#211612]">Spice Level</label>
                    <select
                      value={prodSpice}
                      onChange={(e) =>
                        setProdSpice(e.target.value as "Mild" | "Medium" | "Hot")
                      }
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Hot">Hot</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Jar Sizes & Prices (Preserves 400 g) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#211612]">Jar Sizes, Prices & Stock</label>
                    <button
                      type="button"
                      onClick={() =>
                        setProdSizes((prev) => [
                          ...prev,
                          { size: "400 g", price: 399, originalPrice: 399, inStock: true },
                        ])
                      }
                      className="text-[11px] font-bold text-[#A87B28] hover:underline"
                    >
                      + Add Size
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prodSizes.map((sz, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E8DEC8]"
                      >
                        <div className="col-span-4">
                          <span className="text-[10px] text-stone-500 block">Size</span>
                          <input
                            type="text"
                            required
                            value={sz.size}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, size: e.target.value } : it
                                )
                              )
                            }
                            className="w-full min-h-[38px] px-2 py-1 rounded border border-[#E8DEC8] bg-white font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <span className="text-[10px] text-stone-500 block">Price (₹)</span>
                          <input
                            type="number"
                            required
                            value={sz.price}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        price: Number(e.target.value),
                                        originalPrice: Number(e.target.value),
                                      }
                                    : it
                                )
                              )
                            }
                            className="w-full min-h-[38px] px-2 py-1 rounded border border-[#E8DEC8] bg-white font-bold"
                          />
                        </div>
                        <div className="col-span-3 flex flex-col items-center">
                          <span className="text-[10px] text-stone-500 block">In Stock</span>
                          <input
                            type="checkbox"
                            checked={sz.inStock !== false}
                            onChange={(e) =>
                              setProdSizes((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, inStock: e.target.checked } : it
                                )
                              )
                            }
                            className="w-5 h-5 accent-[#211612] mt-1.5"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end pt-3">
                          {prodSizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setProdSizes((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-red-600 p-1.5"
                              aria-label="Remove variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#211612]">
                    Inventory Count (Available Jars)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
                  />
                </div>

                <div className="pt-3 flex gap-2.5 border-t border-[#E8DEC8]">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg border border-[#E8DEC8] text-stone-600 font-bold hover:bg-[#FAF6EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] font-bold shadow-sm"
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
