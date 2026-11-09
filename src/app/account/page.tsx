"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  ExternalLink,
  Truck,
  MessageSquare,
  Clock,
  ShieldCheck,

  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Order } from "@/lib/types";
import { getLocalOrders } from "@/lib/store";
import { WHATSAPP_NUMBER } from "@/lib/config";

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    try {
      const userEmail = (user.email || "").toLowerCase().trim();
      const userId = user.id;

      // 1. Fetch from server API
      let serverOrders: Order[] = [];
      try {
        const queryParams = new URLSearchParams();
        if (userEmail) queryParams.set("email", userEmail);
        if (userId) queryParams.set("userId", userId);

        const res = await fetch("/api/account/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          serverOrders = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number || o.orderNumber,
            customerName: o.customer_name || o.customerName,
            email: o.email,
            phone: o.phone,
            address: o.address,
            landmark: o.landmark,
            city: o.city,
            state: o.state,
            pincode: o.pincode,
            items: o.items || [],
            subtotal: Number(o.subtotal) || 0,
            shipping: Number(o.shipping) || 0,
            discount: Number(o.discount) || 0,
            couponCode: o.coupon_code || o.couponCode,
            total: Number(o.total) || 0,
            paymentMethod: o.payment_method || o.paymentMethod,
            paymentStatus: o.payment_status || o.paymentStatus,
            orderStatus: o.order_status || o.orderStatus,
            trackingNumber: o.tracking_number || o.trackingNumber,
            courierName: o.courier_name || o.courierName,
            notes: o.notes,
            userId: o.user_id || o.userId,
            createdAt: o.created_at || o.createdAt,
          }));
        }
      } catch (err) {
        console.warn("Server orders fetch warning:", err);
      }

      // 2. Fetch from local store
      const localOrders = getLocalOrders().filter((o) => {
        const matchesEmail = userEmail && o.email?.toLowerCase().trim() === userEmail;
        const matchesId = userId && o.userId === userId;
        return matchesEmail || matchesId;
      });

      // 3. Merge & deduplicate by id
      const combinedMap = new Map<string, Order>();
      for (const order of [...serverOrders, ...localOrders]) {
        if (order.id && !combinedMap.has(order.id)) {
          combinedMap.set(order.id, order);
        }
      }

      const merged = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(merged);
    } catch (err) {
      console.error("Error loading customer orders:", err);
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, user, fetchOrders]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100/80 text-emerald-800 border-emerald-300";
      case "Shipped":
        return "bg-amber-100/80 text-amber-900 border-amber-300";
      case "Packed":
        return "bg-[#211612] text-[#FAF6EE] border-[#C89B3C]";
      default:
        return "bg-[#FAF6EE] text-[#211612] border-[#DDD3C4]";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF6EE]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#211612] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm tracking-widest uppercase text-[#A87B28]">
            Loading Account...
          </p>
        </div>
      </div>
    );
  }

  // Logged-out State: Sign In
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#FAF6EE]">
        <div className="max-w-md w-full bg-[#FDFBF7] rounded-[6px] border border-[#C89B3C]/35 shadow-sm p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-[6px] bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center mx-auto text-[#A87B28] shadow-sm">
            <UserIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#A87B28] font-bold block">
              AKHIL FOODS • CUSTOMER PORTAL
            </span>
            <h1 className="font-serif text-3xl font-normal text-[#211612]">
              Customer Account
            </h1>
            <p className="text-xs sm:text-sm text-[#3D2C24]/80 font-light leading-relaxed">
              Sign in to view your past oyster mushroom pickle orders, monitor active shipments, and manage your delivery details.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => (window.location.href = "/login?next=/account")}
              className="w-full py-3.5 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-serif font-bold text-xs tracking-[0.2em] uppercase transition-colors shadow-sm border border-[#211612]"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/login?next=/account")}
              className="w-full py-3 rounded-[6px] bg-transparent hover:bg-[#EDE3C8] text-[#211612] font-serif font-medium text-xs tracking-[0.16em] uppercase transition-colors border border-[#DDD3C4]"
            >
              Create New Account
            </button>
          </div>

          <div className="pt-4 border-t border-[#E8DEC8] flex items-center justify-center gap-4 text-[11px] text-[#3D2C24]/70 font-serif">
            <Link href="/track-order" className="hover:text-[#211612] underline">
              Guest Order Tracking
            </Link>
            <span>•</span>
            <Link href="/shop" className="hover:text-[#211612] underline">
              Browse Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer";

  // Logged-in State: Full Customer Orders & Profile
  return (
    <div className="min-h-screen bg-[#FAF6EE] py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Account Header Banner */}
        <div className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[6px] bg-[#211612] text-[#FAF6EE] flex items-center justify-center text-xl font-serif font-bold uppercase shadow-sm border border-[#C89B3C]/50">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[10px] tracking-[0.25em] uppercase text-[#A87B28] font-bold">
                  Account Member
                </span>
                <span className="w-1.5 h-1.5 rounded-sm bg-[#C89B3C]" />
                <span className="text-xs text-emerald-700 font-medium">Active</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211612] capitalize mt-0.5">
                {displayName}
              </h1>
              <p className="text-xs text-[#3D2C24]/70 font-light mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-[6px] bg-[#FAF6EE] hover:bg-[#EDE3C8] text-xs font-serif text-[#211612] border border-[#DDD3C4] transition-colors flex items-center gap-1.5"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif tracking-wider uppercase font-bold transition-colors shadow-sm border border-[#211612]"
            >
              Order Pickles
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2.5 rounded-[6px] bg-red-50 hover:bg-red-100 text-red-700 text-xs font-serif transition-colors border border-red-200 flex items-center gap-1.5"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
            <div className="flex items-center gap-2.5">
              <Package className="w-5 h-5 text-[#A87B28]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
                My Orders
              </h2>
              <span className="text-xs font-serif font-bold bg-[#EFE8DD] text-[#211612] px-2.5 py-0.5 rounded-[4px] border border-[#DDD3C4]">
                {orders.length}
              </span>
            </div>

            <Link
              href="/track-order"
              className="text-xs font-serif text-[#211612] hover:text-[#A87B28] flex items-center gap-1"
            >
              <span>Track with tracking ID</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8]">
              <div className="w-8 h-8 border-2 border-[#211612] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-serif text-[#3D2C24]">Loading your order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 sm:p-16 text-center bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-[6px] bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center mx-auto text-[#211612]/60">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#211612]">
                  No orders placed yet
                </h3>
                <p className="text-xs sm:text-sm text-[#3D2C24]/80 max-w-md mx-auto font-light">
                  You haven&apos;t placed any orders with {user.email} yet. Discover our signature Mushroom Mela pickle from Jhansi.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block px-7 py-3 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif tracking-[0.2em] uppercase font-bold shadow-sm transition-colors border border-[#211612]"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={order.id}
                    className="bg-[#FDFBF7] rounded-[6px] border border-[#E8DEC8] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Order Card Header */}
                    <div className="bg-[#FAF6EE] px-5 sm:px-7 py-4 border-b border-[#E8DEC8] flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base sm:text-lg font-bold text-[#211612]">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-[4px] text-[11px] font-serif tracking-wider uppercase font-semibold border ${getStatusBadge(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#3D2C24]/70">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Placed on {dateStr}</span>
                          <span>•</span>
                          <span className="capitalize">{order.paymentMethod}</span>
                          <span>•</span>
                          <span
                            className={`font-semibold ${
                              order.paymentStatus === "Paid" ? "text-emerald-700" : "text-amber-800"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#3D2C24]/70 block font-serif">
                          Total Amount
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#211612]">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>

                    {/* Order Card Body */}
                    <div className="p-5 sm:p-7 space-y-5">
                      {/* Items List */}
                      <div className="divide-y divide-[#E8DEC8]/60">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-14 h-14 rounded-[6px] overflow-hidden bg-[#1C130E] border border-[#C89B3C]/25 shrink-0">
                                <Image
                                  src={item.image || "/images/products/mushroom-mela-front.jpg"}
                                  alt={`${item.name} (${item.size || "400 g"}) - Order item`}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-serif text-sm font-bold text-[#211612]">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-[#3D2C24]/80 mt-0.5 font-light">
                                  Size: {item.size} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-serif text-sm font-semibold text-[#211612]">
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Delivery Info Bar */}
                      <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[#E8DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-serif font-bold text-[#211612] flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#A87B28]" />
                            <span>Delivery Destination</span>
                          </p>
                          <p className="text-[#3D2C24]/80 font-light">
                            {order.customerName}, {order.address}, {order.city}, {order.state} - {order.pincode}
                          </p>
                        </div>

                        {order.trackingNumber ? (
                          <div className="sm:text-right space-y-0.5">
                            <p className="font-serif font-bold text-[#211612]">
                              {order.courierName || "Express Courier"}
                            </p>
                            <p className="font-mono text-[11px] text-[#A87B28] font-bold">
                              Track: {order.trackingNumber}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs text-[#3D2C24]/60 italic font-serif">
                            Dispatching from Moth, Jhansi
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8DEC8]">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/track-order?q=${encodeURIComponent(order.orderNumber)}`}
                            className="px-4 py-2 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-serif text-xs tracking-wider uppercase font-bold transition-colors shadow-sm"
                          >
                            Live Tracking
                          </Link>

                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `Hi Akhil Foods, I have a question regarding my order #${order.orderNumber}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-[6px] bg-[#FAF6EE] hover:bg-[#EDE3C8] text-[#211612] font-serif text-xs transition-colors border border-[#DDD3C4] flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#211612]" />
                            <span>Order Help</span>
                          </a>
                        </div>

                        <Link
                          href={`/order-success/${order.id}`}
                          className="text-xs text-[#A87B28] font-serif hover:underline flex items-center gap-1"
                        >
                          <span>View Official Invoice Receipt</span>
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
