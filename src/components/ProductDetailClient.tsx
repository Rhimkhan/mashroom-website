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
  X,
  Upload,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Product, ProductSize, ProductReview } from "@/lib/types";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/lib/config";
import PincodeChecker from "@/components/PincodeChecker";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

function ProductDetailContent() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { addToCart, buyNow } = useCart();

  const [product, setProduct] = useState<Product | null>(() => {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  });

  const [selectedSize, setSelectedSize] = useState<ProductSize>("400g");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("/images/products/mushroom-mela-front.jpg");
  const [copied, setCopied] = useState<boolean>(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoaded, setReviewsLoaded] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({
    orderNumber: "",
    phone: "",
    customerName: "",
    rating: 5,
    comment: "",
    photoUrl: "",
    website_url: "", // honeypot
  });
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  // Sync with API in case product has been edited or stock changed
  useEffect(() => {
    fetchWithTimeout("/api/products", undefined, 3500)
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

  // Load approved reviews
  useEffect(() => {
    if (!product?.id) return;
    fetchWithTimeout(`/api/reviews?productId=${encodeURIComponent(product.id)}`, undefined, 3500)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
        setReviewsLoaded(true);
      })
      .catch(() => setReviewsLoaded(true));
  }, [product?.id]);

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
      size: "400g",
      price: 399,
      originalPrice: 399,
      inStock: true,
    };

  const isOutOfStock = typeof product.stockCount === "number" && product.stockCount <= 0;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewErrorMsg(null);
    setReviewSuccessMsg(null);
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewForm,
          productId: product.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSuccessMsg(data.message || "Thank you. Your review has been submitted and will appear once verified.");
        setReviewForm({
          orderNumber: "",
          phone: "",
          customerName: "",
          rating: 5,
          comment: "",
          photoUrl: "",
          website_url: "",
        });
      } else {
        setReviewErrorMsg(data.error || "Failed to submit review. Please verify your order number and phone.");
      }
    } catch {
      setReviewErrorMsg("Network error. Please try again later.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // WhatsApp order message: wa.me/916386423865 with prefilled message containing product name, quantity and price
  const prefilledWhatsAppMessage = encodeURIComponent(
    `Hi Akhil Foods, I want to order ${product.name} (${currentSizeOption.size}) - Quantity: ${quantity}, Price: Rs ${currentSizeOption.price * quantity}`
  );
  const whatsappOrderUrl = `https://wa.me/916386423865?text=${prefilledWhatsAppMessage}`;

  return (
    <div className="py-8 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#3D2C24]/80">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 hover:text-[#211612] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Pickles</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 hover:text-[#211612] transition-colors"
              title="Share Product"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Primary Product Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Visual Gallery & Product Media */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FDFBF7] border border-[#E8DEC8] shadow-sm flex items-center justify-center p-6 group">
              <Image
                src={selectedImage}
                alt={`${product.name} - 400 g jar`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
              {product.badges?.[0] && (
                <span className="absolute top-4 left-4 bg-[#211612] text-[#FAF6EE] text-caption font-bold tracking-wider px-3 py-1 rounded-full shadow-md border border-[#C89B3C]/30 uppercase">
                  {product.badges[0]}
                </span>
              )}
              {isOutOfStock && (
                <span className="absolute top-4 right-4 bg-red-800 text-white text-caption font-bold tracking-wider px-3.5 py-1 rounded-full shadow-md uppercase">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                product.image || "/images/products/mushroom-mela-front.jpg",
                "/images/products/mushroom-mela-side.jpg",
                "/images/products/mushroom-mela-back.jpg",
                "/images/products/mushroom-mela-ingredients.jpg",
              ].map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 bg-[#FDFBF7] shrink-0 transition-all ${
                    selectedImage === imgUrl
                      ? "border-[#211612] shadow-md scale-105"
                      : "border-[#E8DEC8] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Pickle Thumbnail ${idx + 1}`}
                    fill
                    loading="lazy"
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Title, Pricing, Selectors & Checkout Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A87B28]">
                <span>Village Nandsiya, Moth, Jhansi</span>
                <span>•</span>
                <span>FSSAI Lic. {BRAND.fssaiNumber}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#211612] leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                {reviews.length > 0 && (
                  <>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="font-bold text-[#211612]">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-[#3D2C24]/60">({reviews.length} customer reviews)</span>
                    <span>•</span>
                  </>
                )}
                {isOutOfStock ? (
                  <span className="text-red-800 font-semibold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    In Stock ({product.stockCount} jars available)
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC8] shadow-sm flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211612]">
                  Rs {currentSizeOption.price * quantity}
                </span>
                {currentSizeOption.originalPrice > currentSizeOption.price && (
                  <span className="text-sm text-stone-400 line-through">
                    Rs {currentSizeOption.originalPrice * quantity}
                  </span>
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
                    <span className="text-xs opacity-90">• Rs {s.price}</span>
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
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-[#211612] text-stone-600 transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-[#211612]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:text-[#211612] text-stone-600 transition-colors disabled:opacity-40"
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
                disabled={isOutOfStock}
                onClick={() => addToCart(product, selectedSize, quantity, true)}
                className={`py-3.5 px-6 rounded-full border-2 border-[#211612] font-bold text-sm transition-all text-center shadow-sm flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed bg-stone-200 text-stone-500 border-stone-300"
                    : "text-[#211612] hover:bg-[#211612] hover:text-[#FAF6EE] hover:scale-[1.02] active:scale-95"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? "Out of Stock" : `Add to Cart - Rs ${currentSizeOption.price * quantity}`}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => buyNow(product, selectedSize, quantity)}
                className={`py-3.5 px-6 rounded-full border border-[#C89B3C]/40 font-bold text-sm shadow-xl transition-all text-center flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed bg-stone-300 text-stone-500 border-stone-300"
                    : "bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] hover:scale-[1.02] active:scale-95"
                }`}
              >
                <Zap className="w-4 h-4 text-[#C89B3C]" />
                <span>{isOutOfStock ? "Out of Stock" : "Buy Now (Express Checkout)"}</span>
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
                  <span>Pan-India Delivery</span>
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
                <p><strong>Pro Tip:</strong> Always use a clean dry spoon.</p>
                <p>Keep away from direct sunlight.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section: Rendered ONLY if approved reviews exist */}
        {reviews.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-[#E8DEC8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#211612]">
                  Customer Reviews ({reviews.length})
                </h2>
                <p className="text-xs sm:text-sm text-[#3D2C24]/70">
                  Verified customer reviews submitted with an official order number.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2.5 rounded-full bg-[#211612] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider hover:bg-[#34221A] transition-colors self-start"
              >
                Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-[#3D2C24]/60">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#3D2C24]/85 leading-relaxed font-sans">
                    {rev.comment}
                  </p>

                  {rev.photoUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E8DEC8] bg-[#FAF6EE]">
                      <Image
                        src={rev.photoUrl}
                        alt="Customer Photo"
                        fill
                        loading="lazy"
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E8DEC8]/60 flex justify-between items-center text-xs font-sans">
                    <span className="font-bold text-[#211612]">
                      {rev.customerName}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      Verified Order
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no reviews yet, provide small link for customers with an order to review */}
        {reviews.length === 0 && reviewsLoaded && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold text-[#A87B28] hover:text-[#211612] underline transition-colors"
            >
              Have you ordered this pickle? Submit an order-verified review
            </button>
          </div>
        )}

        {/* Review Submission Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#FDFBF7] w-full max-w-lg rounded-2xl border border-[#E8DEC8] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#211612]">
                    Submit Customer Review
                  </h3>
                  <p className="text-xs text-[#3D2C24]/70 mt-0.5">
                    Requires order number and phone number from your order
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 rounded-full text-stone-500 hover:text-[#211612]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reviewSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center space-y-3">
                  <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-lg font-bold">Review Received</h4>
                  <p className="text-xs sm:text-sm text-[#3D2C24]/80 leading-relaxed">
                    {reviewSuccessMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewSuccessMsg(null);
                    }}
                    className="px-6 py-2 rounded-full bg-[#211612] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs sm:text-sm">
                  {/* Honeypot field */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={reviewForm.website_url}
                      onChange={(e) => setReviewForm({ ...reviewForm, website_url: e.target.value })}
                    />
                  </div>

                  {reviewErrorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                      {reviewErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#211612] mb-1">
                        Order Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AF-8921"
                        value={reviewForm.orderNumber}
                        onChange={(e) => setReviewForm({ ...reviewForm, orderNumber: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:border-[#C89B3C]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#211612] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit phone used in order"
                        value={reviewForm.phone}
                        onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:border-[#C89B3C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#211612] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={reviewForm.customerName}
                      onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:border-[#C89B3C]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211612] mb-1">
                      Rating (1 to 5 Stars) *
                    </label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewForm.rating ? "fill-amber-500 text-amber-500" : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#211612] ml-2">
                        {reviewForm.rating} of 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#211612] mb-1">
                      Review Text *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share your authentic feedback about taste, spice blend, packaging and delivery..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:border-[#C89B3C] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211612] mb-1">
                      Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={reviewForm.photoUrl}
                      onChange={(e) => setReviewForm({ ...reviewForm, photoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:border-[#C89B3C]"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#E8DEC8] text-[#211612] text-xs font-bold uppercase hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-[#211612] text-[#FAF6EE] text-xs font-bold uppercase hover:bg-[#34221A] disabled:opacity-50"
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
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
          <p className="text-xs text-[#3D2C24]/70 mt-2">Loading pickle jar...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
