"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Tag,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER } from "@/lib/config";

export default function CartPage() {
  const {
    items,
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
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput("");
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-6 bg-[#FAF6EE]">
        <div className="w-16 h-16 rounded-[6px] bg-[#EFE8DD] text-[#A87B28] flex items-center justify-center mx-auto shadow-sm border border-[#DDD3C4]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-normal text-[#211612]">Your cart is empty</h1>
        <p className="text-sm text-[#3D2C24] font-light">
          You have not added any items to your cart yet.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-[6px] bg-[#211612] text-[#FAF6EE] font-bold text-xs uppercase tracking-wider hover:bg-[#34221A] transition-colors border border-[#211612]"
        >
          <span>Shop now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#211612]">
            Shopping Cart
          </h1>
          <p className="text-sm text-[#3D2C24] mt-1 font-light">
            Review your items before proceeding to checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table / Cards */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="sr-only">Items in your cart</h2>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="bg-[#FDFBF7] p-4 sm:p-6 rounded-[6px] border border-[#E8DEC8] shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[6px] overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#E8DEC8] flex items-center justify-center p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#211612]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Net weight:{" "}
                      <strong className="text-[#211612] bg-[#EFE8DD] px-2 py-0.5 rounded-[4px] border border-[#DDD3C4]">
                        {item.size}
                      </strong>
                    </p>
                    <p className="text-xs text-stone-600 mt-1">₹{item.price} each</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8DEC8]">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-[#E8DEC8] rounded-[6px] bg-[#FAF6EE] px-2 py-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="p-1 hover:text-[#211612] text-stone-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#211612]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="p-1 hover:text-[#211612] text-stone-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-base sm:text-xl font-bold text-[#211612]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#211612] hover:text-[#A87B28]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-[#FDFBF7] p-6 sm:p-7 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#211612]">Order Summary</h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#211612] block">Coupon code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-[#A87B28]" />
                  <input
                    type="text"
                    placeholder="Enter coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#C89B3C]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[6px] bg-[#211612] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider hover:bg-[#34221A] transition-colors shadow-sm"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-[#EFE8DD] p-2.5 rounded-[6px] text-[#211612] font-semibold border border-[#DDD3C4]">
                  <span>Coupon <strong>{appliedCoupon}</strong> active</span>
                  <button onClick={removeCoupon} className="text-red-700 font-bold underline text-xs">
                    Remove
                  </button>
                </div>
              )}

              {couponMsg && (
                <p className={`text-xs ${couponMsg.isError ? "text-red-600" : "text-emerald-700"} font-medium`}>
                  {couponMsg.text}
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-[#3D2C24] pt-2 border-t border-[#E8DEC8] font-light">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#211612]">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery charge</span>
                <span>{shipping === 0 ? <strong className="text-emerald-800 font-bold">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#211612] pt-3 border-t border-[#E8DEC8]">
                <span>Total</span>
                <span className="font-serif text-2xl font-bold text-[#211612]">₹{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-3.5 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-bold text-xs tracking-wider uppercase shadow-md transition-colors flex items-center justify-center gap-2 border border-[#211612]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Order on WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi, I want to order mushroom pickle from Akhil Foods!\nMy Cart Items:\n${items
                  .map((i) => `- ${i.name} (${i.size}) x${i.quantity} = ₹${i.price * i.quantity}`)
                  .join("\n")}\nTotal Amount: ₹${total}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-[6px] bg-[#2A1D17] hover:bg-[#38271F] text-[#FAF6EE] font-semibold text-xs tracking-wider uppercase border border-[#C89B3C]/30 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#C89B3C]" />
              <span>Order on WhatsApp</span>
            </a>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-600 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
