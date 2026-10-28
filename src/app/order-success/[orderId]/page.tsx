"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle, MessageSquare, Printer, MapPin, Loader2 } from "lucide-react";
import { Order } from "@/lib/types";
import { BRAND } from "@/lib/brand";

function OrderSuccessContent() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "";
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Only show details for the order just placed in that browser
    if (typeof window !== "undefined") {
      try {
        const sessionKey = "akhil_placed_order_" + orderId;
        const storedOrder = sessionStorage.getItem(sessionKey) || sessionStorage.getItem("akhil_last_placed_order");
        if (storedOrder) {
          const parsed = JSON.parse(storedOrder);
          if (parsed && (parsed.id === orderId || parsed.orderNumber === orderId)) {
            setOrder(parsed);

            // Fire celebration confetti
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#211612", "#C89B3C", "#A87B28", "#FAF6EE", "#D4AF37"],
              });
            } catch {
              // ignore
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Session retrieval error:", err);
      }
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="py-20 bg-[#FAF6EE] min-h-screen">
        <div className="max-w-md mx-auto px-4 text-center space-y-5 bg-[#FDFBF7] p-8 sm:p-10 rounded-3xl border border-[#E8DEC8] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-[#A87B28] flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[#A87B28]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#211612]">
            Order Receipt Unavailable
          </h1>
          <p className="text-sm text-[#3D2C24]/80 leading-relaxed">
            For customer data privacy, detailed order receipts are only displayed immediately after placing an order in your active browser.
          </p>
          <p className="text-xs text-stone-500">
            You can verify and follow live consignment progress using your Order Number and Mobile Number.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/track-order"
              className="px-6 py-2.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] font-bold text-xs uppercase tracking-wider hover:bg-[#1C130E] transition-colors"
            >
              Go to Order Tracking
            </Link>
            <Link
              href="/shop"
              className="px-6 py-2.5 rounded-[6px] border border-[#E8DEC8] text-[#211612] font-semibold text-xs uppercase tracking-wider hover:bg-[#FAF6EE] transition-colors"
            >
              Continue to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hi Akhil Foods! I just placed an order:\n\n*Order #:* ${order.orderNumber}\n*Name:* ${order.customerName}\n*Amount:* ₹${order.total}\n*Payment Mode:* ${order.paymentMethod}\n*Items:* ${order.items.map((i) => `${i.name} (${i.size}) x${i.quantity}`).join(", ")}\n*Delivery Address:* ${order.address}, ${order.city}, ${order.pincode}\n\nPlease share tracking updates when dispatched!`
      )
    : "";

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-[6px] border border-[#E8DEC8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-[6px] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FAF6EE] bg-[#1C130E] border border-[#C89B3C]/40 px-3.5 py-1 rounded-[6px]">
              Order Confirmed & Received
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211612]">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-[#3D2C24]/80 max-w-md mx-auto">
              Your mushroom pickle order is being prepared in our Jhansi kitchen. We will pack and dispatch your jar with care.
            </p>
          </div>

          {order && (
            <div className="inline-block bg-[#FAF6EE] px-6 py-2.5 rounded-[6px] border border-[#E8DEC8]">
              <span className="text-xs text-[#3D2C24]/70 font-medium">Order Number:</span>{" "}
              <strong className="font-mono text-base text-[#211612]">{order.orderNumber}</strong>
            </div>
          )}

          {/* WhatsApp Notify CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${BRAND.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-[6px] bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send to WhatsApp for Live Dispatch Alert</span>
            </a>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-3 rounded-[6px] border border-[#E8DEC8] text-[#211612] hover:bg-[#FAF6EE] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#A87B28]" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Order Details Receipt */}
        {order && (
          <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DEC8] gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#211612]">Receipt Summary</h2>
                <p className="text-xs text-[#3D2C24]/60 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                <div className="text-xs text-[#3D2C24]/80 font-mono mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>FSSAI: <strong>{BRAND.fssaiNumber}</strong></span>
                  <span>•</span>
                  <span>GSTIN: <strong>{BRAND.gstNumber}</strong></span>
                  <span>•</span>
                  <span>Udyam: <strong>{BRAND.udyamNumber}</strong></span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#211612] bg-[#FAF6EE] px-3 py-1 rounded-[4px] self-start sm:self-center border border-[#E8DEC8]">
                Status: {order.orderStatus}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-[#E8DEC8]/50">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-[4px] overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#E8DEC8]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        loading="lazy"
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#211612] text-sm">{item.name}</h3>
                      <p className="text-[#3D2C24]/70 text-xs">Size: {item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#211612]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="space-y-1.5 text-sm text-[#3D2C24]/80 pt-2 border-t border-[#E8DEC8]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#211612] pt-2 border-t border-[#E8DEC8]">
                <span>Total Paid / Payable</span>
                <span className="font-serif text-lg">₹{order.total}</span>
              </div>
              <div className="flex justify-between text-xs text-[#3D2C24]/70 pt-1">
                <span>Payment Mode:</span>
                <span className="font-medium text-[#211612]">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-4 border-t border-[#E8DEC8] bg-[#FAF6EE] p-4 rounded-[6px] text-sm space-y-1.5 border border-[#E8DEC8]">
              <h3 className="font-bold text-[#211612] flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-[#A87B28]" />
                <span>Delivery Address</span>
              </h3>
              <p className="font-semibold text-[#211612]">{order.customerName}</p>
              <p className="text-[#3D2C24]/80">{order.address} {order.landmark ? `(Near ${order.landmark})` : ""}</p>
              <p className="text-[#3D2C24]/80">{order.city}, {order.state} {order.pincode}</p>
              <p className="text-[#3D2C24]/80">Contact: {order.phone} | {order.email}</p>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <Link
                href={`/track-order?q=${order.orderNumber}`}
                className="text-[#211612] font-bold underline hover:text-[#A87B28]"
              >
                Track this order online
              </Link>
              <Link
                href="/shop"
                className="px-6 py-2.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] border border-[#211612] font-semibold text-xs uppercase tracking-wider hover:bg-[#1C130E] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center bg-[#FAF6EE]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#211612]" />
          <p className="text-sm text-[#3D2C24]/70 mt-2">Loading your order receipt...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
