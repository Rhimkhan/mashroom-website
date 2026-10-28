"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Share2,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  MessageCircle,
  Loader2,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { INITIAL_PRODUCTS, REVIEWS } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Product, ProductSize } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/lib/config";
import PincodeChecker from "@/components/PincodeChecker";

function ProductDetailContent() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { addToCart, buyNow } = useCart();

  const [product, setProduct] = useState<Product | null>(() => {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  });

  const [selectedSize, setSelectedSize] = useState<ProductSize>("250g");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("/images/products/mushroom-mela-front.jpg");
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with API in case product has been edited
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          const match = data.products.find((p: Product) => p.slug === slug);
          if (match) {
            setProduct(match);
            if (match.image) setSelectedImage(match.image);
          }
        }
      })
      .catch((err) => console.log("Using static fallback:", err));
  }, [slug]);

  useEffect(() => {
    if (product?.image && selectedImage === "/images/products/mushroom-mela-front.jpg") {
      setSelectedImage(product.image);
    }
  }, [product, selectedImage]);

  if (!product) {
    return notFound();
  }

  const currentSizeOption =
    product.sizes?.find((s) => s.size === selectedSize) ||
    product.sizes?.[0] || {
      size: "250g",
      price: 299,
      originalPrice: 350,
      inStock: true,
    };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image, "/images/products/mushroom-mela-front.jpg"];

  const whatsappOrderUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello Akhil Foods! I would like to order:\n- Pickle: ${product.name}\n- Flavour: ${product.flavour}\n- Jar Size: ${selectedSize}\n- Quantity: ${quantity}\n- Total Price: ₹${currentSizeOption.price * quantity}\nPlease confirm delivery availability to my pincode.`
  )}`;

  return (
    <div className="py-8 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#211612] hover:text-[#A87B28] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#A87B28]" />
          <span>Back to All Artisanal Pickles</span>
        </Link>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* 1. Image Gallery with Main View & Clickable Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FDFBF7] border border-[#E8DEC8] shadow-xl group cursor-zoom-in">
              <Image
                src={selectedImage}
                alt={`${product.name} - Handcrafted Oyster Mushroom Pickle`}
                fill
                className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out origin-center"
                priority
              />
              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badges?.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-[#1C130E] text-[#FAF6EE] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#C89B3C]/40 backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="absolute top-4 right-4 bg-[#1C130E] text-[#C89B3C] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#C89B3C]/40">
                {product.flavour}
              </div>
            </div>

            {/* Clickable Image Thumbnails */}
            <div className="flex gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all bg-[#FDFBF7] ${
                    selectedImage === img
                      ? "border-[#211612] ring-4 ring-[#E8DEC8] scale-105"
                      : "border-[#E8DEC8] opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Select gallery photo ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail view ${i + 1}`}
                    fill
                    loading="lazy"
                    sizes="96px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Product Details & Purchase Controller */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C89B3C] bg-[#1C130E] px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#C89B3C]/30 shadow-sm">
                  {product.flavour}
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-[#E8DEC8]/50 text-[#211612] transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>{copied ? "Link Copied!" : "Share Pickle"}</span>
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#211612] leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                {product.reviewsCount > 0 ? (
                  <>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="font-bold text-[#211612]">{product.rating}</span>
                    <span className="text-[#3D2C24]/60">({product.reviewsCount} customer ratings)</span>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#3D2C24]/70 font-medium">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="italic">Be the first to review</span>
                  </div>
                )}
                <span>•</span>
                <span className="text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  In Stock ({product.stockCount} jars available)
                </span>
              </div>
            </div>

            {/* Price Box with Live Recalculation */}
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC8] shadow-sm flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211612]">
                  ₹{currentSizeOption.price * quantity}
                </span>
                {currentSizeOption.originalPrice > currentSizeOption.price && (
                  <>
                    <span className="text-sm text-stone-400 line-through">
                      ₹{currentSizeOption.originalPrice * quantity}
                    </span>
                    <span className="text-caption font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Save ₹{(currentSizeOption.originalPrice - currentSizeOption.price) * quantity}
                    </span>
                  </>
                )}
              </div>
              <span className="text-caption text-[#3D2C24]/60 font-medium">MRP Inclusive of all taxes</span>
            </div>

            {/* Size Selector Switcher */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#211612] text-sm">
                  Select Weight / Jar Size:
                </span>
                <span className="text-[#A87B28] font-semibold text-xs">Active: {selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`py-2.5 px-5 rounded-xl border text-center transition-all flex items-center gap-3 ${
                      selectedSize === s.size
                        ? "border-[#211612] bg-[#211612] text-[#FAF6EE] shadow-md scale-[1.02]"
                        : "border-[#E8DEC8] bg-[#FDFBF7] text-[#211612] hover:border-[#211612]"
                    }`}
                  >
                    <span className="font-bold text-sm sm:text-base">{s.size}</span>
                    <span className="text-xs opacity-90">• ₹{s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-sm font-semibold text-[#211612]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E8DEC8] rounded-xl bg-[#FDFBF7] px-3 py-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-[#211612] text-stone-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-[#211612]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:text-[#211612] text-stone-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => addToCart(product, selectedSize, quantity, true)}
                className="py-3.5 px-6 rounded-full border-2 border-[#211612] text-[#211612] hover:bg-[#211612] hover:text-[#FAF6EE] font-bold text-sm transition-all text-center shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ₹{currentSizeOption.price * quantity}</span>
              </button>

              <button
                type="button"
                onClick={() => buyNow(product, selectedSize, quantity)}
                className="py-3.5 px-6 rounded-full bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 font-bold text-sm shadow-xl transition-all text-center flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <Zap className="w-4 h-4 text-[#C89B3C]" />
                <span>Buy Now (Express Checkout)</span>
              </button>
            </div>

            {/* Direct WhatsApp Ordering */}
            <div>
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-full bg-[#1C130E] hover:bg-[#2A1D17] text-[#FAF6EE] border border-[#C89B3C]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp ({PHONE_DISPLAY})</span>
              </a>
            </div>

            {/* Pincode Availability Checker */}
            <div className="pt-2">
              <PincodeChecker />
            </div>

            {/* Trust & Certification Points */}
            <div className="space-y-2.5 pt-4 border-t border-[#E8DEC8] text-xs text-[#3D2C24]/80">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#A87B28]" />
                  <span>2-4 Days Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-[#211612]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{BRAND.fssaiLicense}</span>
                </div>
              </div>
              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8DEC8] text-[11px] font-mono text-[#211612] flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>GSTIN: <strong>{BRAND.gstNumber}</strong></span>
                  <span>•</span>
                  <span>Udyam: <strong>{BRAND.udyamNumber}</strong></span>
                </div>
                <Link href="/certificates" className="text-[10px] font-sans font-bold text-[#A87B28] hover:underline">
                  View Certificates →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Product Tabs */}
        <div className="bg-[#FDFBF7] rounded-2xl p-6 sm:p-10 border border-[#E8DEC8] shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#211612]">Product Overview</h3>
              <p className="text-sm text-[#3D2C24]/85 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#211612]">Ingredients from Label</h3>
              <ul className="space-y-2 text-sm text-[#3D2C24]/85 font-sans">
                {product.ingredients?.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#A87B28] font-bold">•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#211612]">Storage & Care</h3>
              <p className="text-sm text-[#3D2C24]/85 leading-relaxed font-sans">
                <strong>{product.shelfLife}</strong>
              </p>
              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E8DEC8] text-sm text-[#211612] space-y-1.5 font-sans">
                <p>🏺 <strong>Pro Tip:</strong> Always use a clean dry spoon.</p>
                <p>☀️ Keep away from direct sunlight.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews for this item */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#211612]">
            Customer Reviews
          </h2>
          {REVIEWS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-3"
                >
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#3D2C24]/85 italic leading-relaxed font-serif">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-[#E8DEC8]/60 flex justify-between items-center text-xs font-sans">
                    <span className="font-bold text-[#211612]">
                      {rev.author} ({rev.location})
                    </span>
                    <span className="text-[#3D2C24]/60 text-[11px]">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-3xl border border-[#E8DEC8] text-center space-y-3 shadow-sm">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto" />
              <p className="font-serif text-lg font-bold text-[#211612]">Be the first to review</p>
              <p className="text-xs sm:text-sm text-[#3D2C24]/80 max-w-md mx-auto leading-relaxed">
                Have you tasted our Mushroom Mela Oyster Mushroom Pickle? We would love to hear your honest thoughts and feedback!
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Akhil Foods, I would like to review Mushroom Mela Oyster Mushroom Pickle!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 text-xs font-bold hover:bg-[#2A1D17] transition-all shadow-sm"
                >
                  Share Your Review on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center bg-[#FAF6EE]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#211612]" />
          <p className="text-xs text-[#3D2C24]/70 mt-2">Loading artisanal pickle jar...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
