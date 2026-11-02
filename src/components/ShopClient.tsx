"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Filter,
  ArrowUpDown,
  Search,
  ShoppingBag,
  Zap,
  Sparkles,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Product, ProductSize } from "@/lib/types";
import PincodeChecker from "@/components/PincodeChecker";
import { fetchWithTimeout } from "@/lib/fetch-timeout";

export default function ShopClient() {
  const { addToCart, buyNow } = useCart();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlavour, setSelectedFlavour] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({
    "prod-mushroom-mela": "400g",
  });

  useEffect(() => {
    fetchWithTimeout("/api/products", undefined, 3500)
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.log("Using cached products in shop:", err));
  }, []);

  const flavours = ["all", "Oyster Mushroom"];

  const handleSizeChange = (productId: string, size: ProductSize) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.flavour.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFlavour =
          selectedFlavour === "all" || product.flavour === selectedFlavour;
        return matchesSearch && matchesFlavour;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          const priceA = a.sizes[0]?.price || 0;
          const priceB = b.sizes[0]?.price || 0;
          return priceA - priceB;
        }
        if (sortBy === "price-desc") {
          const priceA = a.sizes[0]?.price || 0;
          const priceB = b.sizes[0]?.price || 0;
          return priceB - priceA;
        }
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, searchQuery, selectedFlavour, sortBy]);

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-[#FAF6EE] bg-[#1C130E] px-4 py-1.5 rounded-full border border-[#C89B3C]/40 inline-block shadow-sm">
            Handcrafted in Moth, Jhansi
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#211612] tracking-tight">
            Artisanal Mushroom Pickles
          </h1>
          <p className="text-sm sm:text-base text-[#3D2C24]/85 leading-relaxed font-sans font-light">
            Crafted with farm-fresh oyster mushrooms, cold-pressed mustard oil, and whole stone-ground spices in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-[#FDFBF7] p-4 sm:p-6 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A87B28]" />
              <input
                type="text"
                placeholder="Search oyster mushroom pickles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs focus:outline-none focus:ring-2 focus:ring-[#211612]"
              />
            </div>

            {/* Sort Dropdown Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ArrowUpDown className="w-4 h-4 text-[#A87B28] shrink-0" />
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] text-xs font-serif font-semibold focus:outline-none focus:ring-2 focus:ring-[#211612] cursor-pointer"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Flavours Filter Pill Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8DEC8]">
            <span className="text-xs font-serif font-bold text-[#211612] flex items-center gap-1.5 mr-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-[#A87B28]" />
              <span>Flavour:</span>
            </span>
            {flavours.map((flavour) => (
              <button
                key={flavour}
                type="button"
                onClick={() => setSelectedFlavour(flavour)}
                className={`px-3 py-1.5 rounded-full text-xs font-serif tracking-wider uppercase font-semibold transition-all ${
                  selectedFlavour === flavour
                    ? "bg-[#211612] text-[#FAF6EE] shadow-sm"
                    : "bg-[#FAF6EE] text-stone-600 hover:text-[#211612] hover:bg-[#EFE8DD] border border-[#E8DEC8]"
                }`}
              >
                {flavour}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid with semantic h2 heading and empty state */}
        <div>
          <h2 className="sr-only">Our Mushroom Pickles</h2>
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FDFBF7] p-12 rounded-3xl border border-[#E8DEC8] text-center space-y-3 max-w-md mx-auto my-8 shadow-sm">
              <Sparkles className="w-8 h-8 text-[#A87B28] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#211612]">No Pickles Found</h3>
              <p className="text-xs text-[#3D2C24]/70">
                We couldn&apos;t find any products matching your current filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlavour("all");
                  setSearchQuery("");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#211612] text-[#FAF6EE] text-xs font-serif uppercase tracking-wider hover:bg-[#34221A] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => {
                const currentSize = selectedSizes[product.id] || "400g";
                const sizeOption =
                  product.sizes?.find((s) => s.size === currentSize) || product.sizes?.[0] || {
                    size: "400g",
                    price: 399,
                    originalPrice: 399,
                    inStock: true,
                  };

                const isOutOfStock = (product.stockCount ?? 1) <= 0;

                return (
                  <div
                    key={product.id}
                    className="clay-card rounded-2xl overflow-hidden flex flex-col justify-between group bg-[#FDFBF7] border border-[#E8DEC8] hover:border-[#C89B3C]/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div>
                      {/* Product Image Frame with lazy load and rich alt */}
                      <div className="relative aspect-square overflow-hidden bg-[#FAF6EE] border-b border-[#E8DEC8]">
                        <Image
                          src={product.image || "/images/hero-pickle.jpg"}
                          alt={`${product.name} - Mushroom pickle from Akhil Foods`}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        />
                        {isOutOfStock ? (
                          <span className="absolute top-3.5 left-3.5 bg-red-800 text-white text-caption font-serif tracking-wider px-3 py-1 rounded-full shadow-md">
                            Out of Stock
                          </span>
                        ) : product.badges?.[0] ? (
                          <span className="absolute top-3.5 left-3.5 bg-[#211612] text-[#FAF6EE] text-caption font-serif tracking-wider px-3 py-1 rounded-full shadow-md border border-[#C89B3C]/30">
                            {product.badges[0]}
                          </span>
                        ) : null}
                        <span className="absolute top-3.5 right-3.5 bg-[#EFE8DD] text-[#211612] text-caption font-serif font-bold px-2.5 py-1 rounded-full shadow-md border border-[#DDD3C4]">
                          {product.flavour}
                        </span>
                      </div>

                      {/* Card Content Details */}
                      <div className="p-5 sm:p-6 space-y-3">
                        {product.reviewsCount > 0 ? (
                          <div className="flex items-center gap-1.5 text-caption text-[#A87B28] font-semibold">
                            <Star className="w-3.5 h-3.5 fill-[#C89B3C] text-[#C89B3C]" />
                            <span>{product.rating}</span>
                            <span className="text-stone-400">({product.reviewsCount} reviews)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-caption text-stone-500 font-medium">
                            <Star className="w-3.5 h-3.5 text-[#C89B3C]" />
                            <span className="italic font-serif">Fresh Preparation</span>
                          </div>
                        )}

                        <Link href={`/product/${product.slug}`} className="block">
                          <h3 className="font-serif text-lg font-bold text-[#211612] group-hover:text-[#A87B28] transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-sm text-[#3D2C24] line-clamp-2 leading-relaxed font-sans font-light">
                          {product.subtitle || product.description}
                        </p>

                        {/* Size Selector Switcher */}
                        <div className="pt-2">
                          <label className="text-xs font-serif font-bold text-[#211612] block mb-1.5 uppercase tracking-wider">
                            Net Quantity / Size:
                          </label>
                          <div className="flex flex-wrap gap-1.5 bg-[#FAF6EE] p-1.5 rounded-xl border border-[#E8DEC8]">
                            {product.sizes?.map((s) => (
                              <button
                                key={s.size}
                                type="button"
                                onClick={() => handleSizeChange(product.id, s.size)}
                                className={`px-3 py-1.5 text-xs font-serif font-semibold rounded-lg transition-all ${
                                  currentSize === s.size
                                    ? "bg-[#211612] text-[#FAF6EE] shadow-sm"
                                    : "text-stone-600 hover:text-[#211612]"
                                }`}
                              >
                                {s.size} (MRP ₹{s.price})
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-2">
                          <span className="font-serif text-2xl font-bold text-[#211612]">
                            ₹{sizeOption.price}
                          </span>
                          {sizeOption.originalPrice > sizeOption.price && (
                            <>
                              <span className="text-caption text-stone-400 line-through">
                                ₹{sizeOption.originalPrice}
                              </span>
                              <span className="text-caption font-serif font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                Save ₹{sizeOption.originalPrice - sizeOption.price}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons: Add to Cart and Buy Now */}
                    <div className="p-5 sm:p-6 pt-0 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product, currentSize, 1)}
                        className="py-3 px-3 rounded-xl border border-[#211612] text-[#211612] hover:bg-[#211612] hover:text-[#FAF6EE] text-xs font-serif tracking-[0.16em] uppercase font-bold transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? "Out of Stock" : "Add to Bag"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => buyNow(product, currentSize, 1)}
                        className="py-3 px-3 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif tracking-[0.16em] uppercase font-bold transition-all text-center shadow-md flex items-center justify-center gap-1.5 border border-[#211612] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#C89B3C]" />
                        <span>{isOutOfStock ? "Out of Stock" : "Acquire"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Checker Module */}
        <div className="max-w-xl mx-auto pt-8">
          <PincodeChecker />
        </div>
      </div>
    </div>
  );
}
