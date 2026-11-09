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
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Product, ProductSize } from "@/lib/types";
import PincodeChecker from "@/components/PincodeChecker";

export default function ShopClient() {
  const { addToCart, buyNow } = useCart();
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedFlavour, setSelectedFlavour] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({
    "prod-1": "250g",
    "prod-2": "250g",
    "prod-3": "250g",
    "prod-4": "250g",
  });

  // Fetch updated products from API endpoint
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.log("Using cached products:", err));
  }, []);

  const flavours = ["All", "Classic Masala", "Garlic", "Mustard Oil", "Spicy Red Chilli"];

  const handleSizeChange = (productId: string, size: ProductSize) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        const matchesFlavour =
          selectedFlavour === "All" ||
          product.flavour.toLowerCase().includes(selectedFlavour.toLowerCase());
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.ingredients?.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFlavour && matchesSearch;
      })
      .sort((a, b) => {
        const sizeA = selectedSizes[a.id] || "250g";
        const sizeB = selectedSizes[b.id] || "250g";
        const priceA = (a.sizes?.find((s) => s.size === sizeA) || a.sizes?.[0])?.price || 0;
        const priceB = (b.sizes?.find((s) => s.size === sizeB) || b.sizes?.[0])?.price || 0;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
        return 0; // recommended
      });
  }, [productsList, selectedFlavour, searchQuery, sortBy, selectedSizes]);

  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#A87B28] bg-[#EFE8DD] px-4 py-1.5 rounded-full border border-[#DDD3C4] shadow-sm">
            Handcrafted in Jhansi, Uttar Pradesh
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#211612]">
            Authentic Mushroom Pickles
          </h1>
          <p className="text-sm sm:text-base text-[#3D2C24] font-sans font-light leading-relaxed">
            Prepared with tender oyster mushrooms, cold-pressed mustard oil, natural vinegar, and traditional stone-ground Indian spices.
          </p>
        </div>

        {/* Filter, Search & Sort Control Panel */}
        <div className="bg-[#FDFBF7] p-5 sm:p-7 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#A87B28] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search flavour, ingredient, mushroom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8] text-sm text-[#211612] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C89B3C]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ArrowUpDown className="w-4 h-4 text-[#A87B28]" />
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#211612]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8] text-xs font-serif text-[#211612] focus:outline-none focus:ring-1 focus:ring-[#C89B3C]"
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Flavour Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#211612] flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#A87B28]" /> Flavours:
            </span>
            {flavours.map((flavour) => (
              <button
                key={flavour}
                type="button"
                onClick={() => setSelectedFlavour(flavour)}
                className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider uppercase shrink-0 transition-all ${
                  selectedFlavour === flavour
                    ? "bg-[#211612] text-[#FAF6EE] shadow-sm border border-[#211612]"
                    : "bg-[#FAF6EE] text-[#3D2C24] hover:bg-[#EFE8DD] hover:text-[#211612] border border-[#E8DEC8]"
                }`}
              >
                {flavour}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid with semantic h2 heading */}
        <div>
          <h2 className="sr-only">Our Handcrafted Mushroom Pickles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const currentSize = selectedSizes[product.id] || "250g";
            const sizeOption =
              product.sizes?.find((s) => s.size === currentSize) || product.sizes?.[0] || {
                size: "250g",
                price: 299,
                originalPrice: 350,
                inStock: true,
              };

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
                      alt={`${product.name} - Handcrafted clay aged mushroom pickle from Akhil Foods`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badges?.[0] && (
                      <span className="absolute top-3.5 left-3.5 bg-[#211612] text-[#FAF6EE] text-caption font-serif tracking-wider px-3 py-1 rounded-full shadow-md border border-[#C89B3C]/30">
                        {product.badges[0]}
                      </span>
                    )}
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
                        <span className="italic font-serif">Atelier Micro-Batch</span>
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
                    onClick={() => addToCart(product, currentSize, 1)}
                    className="py-3 px-3 rounded-xl border border-[#211612] text-[#211612] hover:bg-[#211612] hover:text-[#FAF6EE] text-xs font-serif tracking-[0.16em] uppercase font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => buyNow(product, currentSize, 1)}
                    className="py-3 px-3 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif tracking-[0.16em] uppercase font-bold transition-all text-center shadow-md flex items-center justify-center gap-1.5 border border-[#211612]"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C89B3C]" />
                    <span>Acquire</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Delivery Checker Module */}
        <div className="max-w-xl mx-auto pt-8">
          <PincodeChecker />
        </div>
      </div>
    </div>
  );
}
