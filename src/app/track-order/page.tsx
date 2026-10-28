"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  ShieldAlert,
  MessageCircle,
  Truck,
  Package,
  Loader2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  total: number;
  trackingNumber?: string | null;
  courierName?: string | null;
  createdAt: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
  }>;
}

export default function TrackOrderPage() {
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if URL has query parameter (e.g. ?q=AF-8921)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("q");
      if (q) {
        setOrderNumberInput(q);
      }
    }
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOrderNumber = orderNumberInput.trim();
    const cleanPhone = phoneInput.replace(/\D/g, "");

    if (!cleanOrderNumber || cleanPhone.length < 10) {
      setErrorMessage("Order not found. Please verify your order number and phone number.");
      setSearched(true);
      setOrder(null);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: cleanOrderNumber,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || "Order not found. Please verify your order number and phone number."
        );
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setErrorMessage("Order not found. Please verify your order number and phone number.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ["New", "Packed", "Shipped", "Delivered"];

  const getStepStatus = (orderStatus: string, step: string) => {
    const currentIndex = statuses.indexOf(orderStatus);
    const stepIndex = statuses.indexOf(step);
    if (currentIndex >= stepIndex && currentIndex !== -1) return "completed";
    return "pending";
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#FAF6EE] bg-[#1C130E] px-4 py-1.5 rounded-[6px] border border-[#C89B3C]/40 shadow-sm">
            Consignment Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#211612]">
            Track Your Pickle Shipment
          </h1>
          <p className="text-sm text-[#3D2C24]/80 font-sans">
            Enter both your <strong>Order Number</strong> and your <strong>10-digit mobile number</strong>.
          </p>
        </div>

        {/* Search Bar requiring Order Number AND Phone Number */}
        <div className="bg-[#FDFBF7] p-5 sm:p-7 rounded-[6px] border border-[#E8DEC8] shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#211612]">
                  Order Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. AF-8921"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] font-mono focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#211612]">
                  Phone Number Used <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] font-mono focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#C89B3C] animate-spin" />
                  <span>Locating Parcel...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-[#C89B3C]" />
                  <span>Track Consignment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-[6px] border border-[#E8DEC8] text-center space-y-3 max-w-md mx-auto shadow-sm animate-pulse">
            <Loader2 className="w-10 h-10 text-[#C89B3C] animate-spin mx-auto" />
            <h2 className="font-serif text-xl font-bold text-[#211612]">Locating Your Consignment...</h2>
            <p className="text-xs text-[#3D2C24]/70 font-sans">
              Checking dispatch records and verification status...
            </p>
          </div>
        ) : searched && (
          <div className="space-y-6">
            {!order ? (
              <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-[6px] border border-[#E8DEC8] text-center space-y-4 max-w-md mx-auto shadow-sm">
                <ShieldAlert className="w-12 h-12 text-[#A87B28] mx-auto" />
                <h2 className="font-serif text-xl font-bold text-[#211612]">Tracking Unavailable</h2>
                <p className="text-sm text-[#3D2C24]/80 font-sans leading-relaxed">
                  {errorMessage || "We could not find an order matching that Order Number and Phone Number combination."}
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
                      `Hi Akhil Foods! Need help tracking order: ${orderNumberInput}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-[#25D366] text-white text-sm font-semibold shadow-sm hover:bg-[#20ba59] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-6">
                {/* Header Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DEC8] gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#A87B28] font-mono uppercase tracking-wider">
                      Consignment Reference
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#211612]">
                      #{order.orderNumber}
                    </h2>
                    <p className="text-xs text-[#3D2C24]/60">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-block px-3.5 py-1.5 rounded-[6px] text-xs font-bold bg-[#FAF6EE] text-[#211612] border border-[#E8DEC8]">
                      Status: {order.orderStatus}
                    </span>
                    <p className="text-xs font-serif font-bold text-[#211612] mt-1.5">
                      Total: ₹{order.total}
                    </p>
                  </div>
                </div>

                {/* 4-Step Status Pipeline */}
                <div className="py-4">
                  <div className="grid grid-cols-4 gap-2 text-center relative">
                    {statuses.map((step) => {
                      const status = getStepStatus(order.orderStatus, step);
                      const isDone = status === "completed";

                      return (
                        <div key={step} className="flex flex-col items-center space-y-2">
                          <div
                            className={`w-9 h-9 rounded-[6px] flex items-center justify-center text-xs font-bold transition-colors shadow-sm ${
                              isDone
                                ? "bg-[#211612] text-[#FAF6EE] border border-[#C89B3C]/40"
                                : "bg-[#FAF6EE] text-stone-400 border border-[#E8DEC8]"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-[#C89B3C]" /> : step.charAt(0)}
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              isDone ? "text-[#211612] font-bold" : "text-stone-400"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier Dispatch Details (If Shipped) */}
                {order.trackingNumber && (
                  <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E8DEC8] flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#211612] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#A87B28]" />
                        <span>Logistics Partner: {order.courierName || "Express Courier"}</span>
                      </span>
                      <p className="text-stone-600 font-mono">
                        Air Waybill (AWB): <strong>{order.trackingNumber}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Items in this Consignment */}
                <div className="space-y-2.5 pt-2 border-t border-[#E8DEC8]">
                  <h3 className="text-xs font-bold text-[#211612] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#A87B28]" />
                    <span>Jars in this Consignment:</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {order.items?.map((i, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#FAF6EE] px-4 py-2.5 rounded-xl border border-[#E8DEC8] text-xs"
                      >
                        <span className="font-semibold text-[#211612]">{i.name}</span>
                        <span className="text-[#3D2C24]/80 font-mono bg-white px-2 py-0.5 rounded border border-[#E8DEC8]">
                          {i.size} × {i.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
