"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER } from "@/lib/config";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = BRAND.freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponStatus({ message: res.message, isError: !res.success });
    if (res.success) setCouponInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6EE] shadow-2xl flex flex-col border-l border-[#E8DEC8]">
          {/* Header (Deep Espresso & Warm Gold) */}
          <div className="p-5 bg-[#1C130E] text-[#FAF6EE] flex items-center justify-between shadow-md border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-lg font-bold tracking-wide text-[#FAF6EE]">
                Artisanal Pickle Basket
              </h2>
              <span className="text-xs bg-[#2A1D17] text-[#D4AF37] px-2.5 py-0.5 rounded-full font-serif border border-[#C89B3C]/20">
                {items.reduce((s, i) => s + i.quantity, 0)} jars
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#2A1D17] text-[#FAF6EE] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#EFE8DD] px-5 py-3 border-b border-[#DDD3C4] text-xs text-[#211612]">
            {amountNeededForFreeShipping === 0 || appliedCoupon === "FREESHIP" ? (
              <div className="flex items-center gap-1.5 font-serif font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#A87B28]" />
                <span>You unlocked <strong>Complimentary Express Dispatch</strong>!</span>
              </div>
            ) : (
              <div>
                <p className="font-serif text-xs mb-1.5">
                  Add <strong className="text-[#A87B28]">₹{amountNeededForFreeShipping}</strong> more for <strong>Complimentary Shipping</strong>
                </p>
                <div className="w-full bg-[#E2D6C0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#211612] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EFE8DD] flex items-center justify-center mx-auto text-[#A87B28] border border-[#DDD3C4]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#211612]">Your basket is empty</h3>
                <p className="text-sm text-[#3D2C24] max-w-xs mx-auto font-light">
                  Add our signature 400g Mushroom Mela Oyster Mushroom Pickle to your basket.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif uppercase tracking-wider font-semibold shadow-md transition-all border border-[#211612]"
                >
                  Explore The Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E8DEC8] shadow-sm flex gap-3.5 relative"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#E8DEC8]">
                    <Image
                      src={item.image}
                      alt={`${item.name} - Handcrafted Pickle Jar`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-bold text-[#211612] truncate leading-tight">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-[#211612]/50 hover:text-red-700 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="inline-block text-caption font-serif text-[#211612] bg-[#EFE8DD] px-2 py-0.5 rounded-full mt-1 border border-[#DDD3C4]">
                        Net Qty: {item.size}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8DEC8]">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-[#E8DEC8] rounded-full bg-[#FAF6EE] px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 hover:text-[#211612] text-stone-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2 text-[#211612]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1 hover:text-[#211612] text-stone-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-stone-500">₹{item.price} each</span>
                        <p className="font-serif text-sm font-bold text-[#211612]">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {items.length > 0 && (
            <div className="p-5 bg-[#FDFBF7] border-t border-[#E8DEC8] space-y-3.5 shadow-inner">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-[#A87B28]" />
                  <input
                    type="text"
                    placeholder="Coupon (try AKHIL10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#C89B3C]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#211612] text-[#FAF6EE] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#34221A] transition-colors shadow-sm"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-[#EFE8DD] p-2.5 rounded-xl text-[#211612] border border-[#DDD3C4]">
                  <span>Code <strong>{appliedCoupon}</strong> active</span>
                  <button onClick={removeCoupon} className="text-red-700 font-semibold underline text-xs">
                    Remove
                  </button>
                </div>
              )}

              {couponStatus && (
                <p className={`text-xs ${couponStatus.isError ? "text-red-600" : "text-emerald-700"} font-medium`}>
                  {couponStatus.message}
                </p>
              )}

              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-[#3D2C24] pt-1 font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#211612]">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Transit</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-800 font-semibold">FREE</strong> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#211612] pt-2 border-t border-[#E8DEC8]">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl font-bold text-[#211612]">₹{total}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-3 px-4 rounded-xl border border-[#211612] text-[#211612] font-serif font-bold text-xs uppercase tracking-wider text-center hover:bg-[#211612] hover:text-[#FAF6EE] transition-all"
                >
                  View Basket
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-3 px-4 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-serif font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-md transition-all border border-[#211612]"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Order on WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hi, I want to order mushroom pickle from Akhil Foods!\nMy Cart Items:\n${items
                    .map((i) => `- ${i.name} (${i.size}) x${i.quantity} = ₹${i.price * i.quantity}`)
                    .join("\n")}\nTotal Amount: ₹${total}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#2A1D17] hover:bg-[#38271F] text-[#FAF6EE] font-serif font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-[#C89B3C]/30 shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#C89B3C]" />
                <span>Order via WhatsApp Concierge</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
