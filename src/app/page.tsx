"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Award,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { INITIAL_PRODUCTS, REVIEWS, FAQS } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { BRAND } from "@/lib/brand";
import { ProductSize } from "@/lib/types";
import HeroProductCard from "@/components/HeroProductCard";
import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE, FSSAI_NUMBER, GST_NUMBER, UDYAM_NUMBER } from "@/lib/config";

export default function HomePage() {
  const { addToCart, buyNow } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({
    "prod-mushroom-mela": "400g",
  });
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  const handleSizeChange = (productId: string, size: ProductSize) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="bg-[#FAF6EE]">
      {/* HERO SECTION: Warm luxury cream and ivory paper-like canvas with deep espresso-brown and gold accents */}
      <section
        id="hero-section"
        className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-8 pb-16 sm:py-20 overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#F6F0E4] to-[#EFE7D7]"
      >
        {/* Natural textured warm cream paper ambient aura */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FFF8E7]/80 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#C89B3C]/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Elegant High-Contrast Typography in Deep Espresso-Brown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-7 space-y-7 sm:space-y-8 text-center lg:text-left pr-0 lg:pr-6"
            >
              {/* Small Gold Lettering in Classic Serif */}
              <div className="inline-flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-6 h-[1.5px] bg-[#C89B3C] inline-block" />
                <span className="font-serif text-xs tracking-[0.35em] uppercase text-[#A87B28] font-bold">
                  THE ART OF THE INDIAN PICKLE
                </span>
              </div>

              {/* Gracefully Stacked Headline in Deep Espresso-Brown */}
              <div className="space-y-2">
                <h1 className="font-serif text-5xl lg:text-6xl font-normal text-[#211612] leading-[1.08] tracking-tight">
                  Artisanal. Rare. Handcrafted.
                </h1>
              </div>

              {/* Narrative-Style Paragraph in Refined Deep Espresso-Brown */}
              <p className="editorial-body text-base text-[#3D2C24] max-w-xl mx-auto lg:mx-0 leading-[1.8] font-sans font-light">
                From the fertile lands of Jhansi, we slowly cure hand-selected oyster mushrooms in cold-pressed mustard oil. From the fertile lands of Jhansi, we slowly cure hand-selected oyster mushrooms in cold-pressed mustard oil and stone-ground spices. A heritage of flavor, patient batch by patient batch.
              </p>

              {/* Action Buttons: Unified btn-primary and btn-outline */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="#featured-product"
                  className="btn-primary w-full sm:w-auto"
                >
                  <span>Discover The Batch</span>
                  <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
                </Link>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full sm:w-auto"
                >
                  <MessageSquare className="w-4 h-4 text-[#211612]" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>

              {/* Subtle Pill-Shaped Badges at the Very Bottom */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-serif font-medium text-[#3D2C24]">
                <div className="flex items-center gap-2 bg-[#EFE8DD] border border-[#DDD3C4] px-4 py-2 rounded-full shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#A87B28]" />
                  <span>FSSAI Lic. #{FSSAI_NUMBER}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#EFE8DD] border border-[#DDD3C4] px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="w-4 h-4 text-[#A87B28]" />
                  <span>400g Net Quantity</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual Product Card in Rounded Deep-Espresso Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 relative flex justify-center w-full"
            >
              <HeroProductCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* REST OF SECTIONS WITH ARTISANAL SPACING */}
      <div className="space-y-20 sm:space-y-28">

      {/* STATS STRIP */}
      <section className="bg-[#F2ECE1] border-y border-[#E2D6C0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1.5">
              <div className="font-serif text-4xl lg:text-5xl font-light text-[#211612]">
                400g
              </div>
              <p className="text-xs font-serif tracking-wider text-[#A87B28] font-medium">
                Net Weight Glass Jar
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-serif text-4xl lg:text-5xl font-light text-[#211612]">
                100%
              </div>
              <p className="text-xs font-serif tracking-wider text-[#A87B28] font-medium">
                Pure Mustard Oil & Spices
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-serif text-4xl lg:text-5xl font-light text-[#211612]">
                0%
              </div>
              <p className="text-xs font-serif tracking-wider text-[#A87B28] font-medium">
                Chemical Shortcuts
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-serif text-4xl lg:text-5xl font-light text-[#211612]">
                FSSAI
              </div>
              <p className="text-xs font-serif tracking-wider text-[#A87B28] font-medium">
                Registered {FSSAI_NUMBER}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US (4 ICONS & ROUNDED CARDS) */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#A87B28] bg-[#EFE8DD] px-4 py-1.5 rounded-full border border-[#DDD3C4] shadow-sm">
            Authentic Quality
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#211612]">
            Why Akhil Foods Tastes Unbelievably Authentic
          </h2>
          <p className="text-sm sm:text-base text-[#3D2C24] leading-relaxed font-light">
            Crafted with real care in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. We use tender oyster mushrooms, pungent cold-pressed mustard oil, and time-honoured whole spices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: 100% Homemade */}
          <div className="clay-card p-8 bg-[#FDFBF7] rounded-2xl space-y-5 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E8DEC8]">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-2xl shadow-inner">
              🏡
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211612]">100% Homemade</h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-sans font-light">
              Handcrafted in artisanal batches in Jhansi, Uttar Pradesh with authentic family care and clean, hygienic preparation.
            </p>
          </div>

          {/* Card 2: Pure Ingredients */}
          <div className="clay-card p-8 bg-[#FDFBF7] rounded-2xl space-y-5 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E8DEC8]">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-2xl shadow-inner">
              🌿
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211612]">Pure Mustard Oil & Spices</h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-sans font-light">
              Real mustard oil, vinegar, red chilli, coriander, mustard seeds, fennel, fenugreek, cumin, turmeric, ajwain, fresh ginger, and garlic.
            </p>
          </div>

          {/* Card 3: Quality Oyster Mushrooms */}
          <div className="clay-card p-8 bg-[#FDFBF7] rounded-2xl space-y-5 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E8DEC8]">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-2xl shadow-inner">
              🍄
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211612]">Tender Oyster Mushrooms</h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-sans font-light">
              Carefully chosen fresh oyster mushrooms, sliced and steeped to retain texture, tenderness, and rich savoury flavour.
            </p>
          </div>

          {/* Card 4: Certified & Safe */}
          <div className="clay-card p-8 bg-[#FDFBF7] rounded-2xl space-y-5 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl border border-[#E8DEC8]">
            <div className="w-14 h-14 rounded-2xl bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-2xl shadow-inner">
              🛡️
            </div>
            <h3 className="font-serif text-xl font-bold text-[#211612]">FSSAI & MSME Certified</h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-sans font-light">
              Registered with FSSAI (Lic. 22726293000001), GST, and Udyam. Safe 400g glass jar packaging with secure pan-India delivery.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 3. FEATURED PRODUCT ROW */}
      <motion.section
        id="featured-product"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header: Centered Vertical Rhythm */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="inline-block text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#A87B28] bg-[#EFE8DD] px-4 py-1.5 rounded-full border border-[#DDD3C4] shadow-sm mb-3">
            Signature Product
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#211612]">
            Mushroom Mela Oyster Pickle
          </h2>
          <p className="text-sm sm:text-base text-[#3D2C24] mt-2 font-sans font-light">
            Our signature 400g glass jar of authentic Oyster Mushroom Pickle handcrafted by AKHIL FOODS.
          </p>
        </div>

        {/* Centered Product Showcase Card */}
        <div className="flex justify-center">
          {INITIAL_PRODUCTS.map((product) => {
            const currentSize = selectedSizes[product.id] || "400g";
            const sizeOption =
              product.sizes.find((s) => s.size === currentSize) || product.sizes[0];

            return (
              <div
                key={product.id}
                className="clay-card rounded-2xl overflow-hidden flex flex-col justify-between group bg-[#FDFBF7] border border-[#E8DEC8] hover:border-[#C89B3C]/50 hover:shadow-2xl transition-all duration-300 max-w-md w-full shadow-lg"
              >
                <div>
                  {/* Product Image Frame */}
                  <div className="relative aspect-square overflow-hidden bg-[#FAF6EE] p-4 flex items-center justify-center border-b border-[#E8DEC8]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badges[0] && (
                      <span className="absolute top-3.5 left-3.5 bg-[#211612] text-[#FAF6EE] text-caption font-serif tracking-wider px-3 py-1 rounded-full shadow-md border border-[#C89B3C]/30">
                        {product.badges[0]}
                      </span>
                    )}
                    <span className="absolute top-3.5 right-3.5 bg-[#EFE8DD] text-[#211612] text-caption font-serif font-bold px-2.5 py-1 rounded-full shadow-md border border-[#DDD3C4]">
                      400g Jar
                    </span>
                  </div>

                  {/* Content Container */}
                  <div className="p-6 space-y-3.5">
                    <div className="flex items-center justify-between text-caption font-semibold text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span>✓ In Stock</span>
                      <span className="text-[#3D2C24]/70 font-serif">Jhansi Atelier, UP</span>
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-serif text-xl font-bold text-[#211612] group-hover:text-[#A87B28] transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-[#3D2C24] line-clamp-2 leading-relaxed font-light">
                      {product.subtitle}
                    </p>

                    {/* Informative Spec Display (Not a deceptive button affordance) */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8] text-xs font-serif text-[#211612]">
                        <span className="font-semibold text-[#A87B28] uppercase tracking-wider">
                          Net Quantity
                        </span>
                        <span className="font-bold text-[#211612]">
                          {sizeOption.size} (MRP ₹{sizeOption.price})
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="font-serif text-2xl font-bold text-[#211612]">
                        ₹{sizeOption.price}
                      </span>
                      <span className="text-caption text-[#3D2C24]/70 font-medium">
                        (All Taxes Included)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: Unified btn-outline and btn-primary */}
                <div className="p-6 pt-0 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => addToCart(product, currentSize, 1)}
                    className="btn-outline w-full !py-2.5 !px-3"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => buyNow(product, currentSize, 1)}
                    className="btn-primary w-full !py-2.5 !px-3"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prominent Secondary CTA: Visit Full Shop */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="btn-outline inline-flex items-center gap-2.5 !py-3 !px-8 text-xs font-serif tracking-[0.2em] uppercase font-bold"
          >
            <span>Visit Full Atelier Shop</span>
            <ArrowRight className="w-4 h-4 text-[#A87B28]" />
          </Link>
        </div>
      </motion.section>

      {/* 4. OUR STORY TEASER SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#1C130E] text-[#FAF6EE] rounded-3xl p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden border border-[#C89B3C]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C89B3C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left Story Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#C89B3C]/30 shadow-2xl bg-[#120B08] flex items-center justify-center p-4">
                <Image
                  src="/images/products/mushroom-mela-side.jpg"
                  alt="Mushroom Mela Jar by Akhil Foods Jhansi"
                  fill
                  className="object-contain p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120B08]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#1C130E]/90 backdrop-blur-md p-3.5 rounded-xl border border-[#C89B3C]/25 text-caption text-[#D4AF37] font-serif tracking-wide">
                  🌾 Packed in Village Nandsiya, Moth, Jhansi, UP
                </div>
              </div>
            </div>

            {/* Right Story Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A1D17] text-[#D4AF37] text-caption font-serif tracking-[0.2em] uppercase border border-[#C89B3C]/30">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span>Our Story • AKHIL FOODS</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF6EE] leading-tight">
                Authentic Oyster Mushroom Pickles from Jhansi, Uttar Pradesh.
              </h2>

              <p className="text-sm sm:text-base text-[#EADBB6]/90 leading-relaxed font-sans font-light">
                {BRAND.name} was founded in Village Nandsiya, Moth, Jhansi with a clear vision: {BRAND.tagline}. We set out to prepare pure, delicious, and honest pickles made with tender oyster mushrooms, cold-pressed mustard oil, and time-honoured whole spices.
              </p>

              <p className="text-sm sm:text-base text-[#EADBB6]/90 leading-relaxed font-sans font-light">
                Our signature &ldquo;Mushroom Mela&rdquo; pickle is crafted in clean micro-batches, packed into 400g sealed glass jars, and certified by FSSAI (Lic. No. {FSSAI_NUMBER}). No fake claims, just honest quality delivered straight from our kitchen to your home.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/our-story"
                  className="btn-primary !bg-[#FAF6EE] !text-[#211612] !border-[#FAF6EE] hover:!bg-[#EFE8DD]"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4 text-[#A87B28]" />
                </Link>
                <Link
                  href="/certificates"
                  className="btn-outline !text-[#FAF6EE] !border-[#FAF6EE]/40 hover:!bg-[#FAF6EE] hover:!text-[#211612]"
                >
                  <span>View Licenses & Certificates</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. REVIEWS SECTION (BE THE FIRST TO REVIEW) */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="bg-[#F5EFEB] py-16 sm:py-24 border-y border-[#E5DAC6]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#A87B28] bg-[#EFE8DD] px-4 py-1.5 rounded-full border border-[#DDD3C4] shadow-sm">
              Customer Reviews
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#211612]">
              Real Customer Feedback
            </h2>
            <p className="text-sm sm:text-base text-[#3D2C24] font-light">
              We value complete honesty. We never publish fake testimonials or invented reviews.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-2xl border border-[#E8DEC8] shadow-lg text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-3xl mx-auto">
                ⭐
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#211612]">
                Be the first to review Mushroom Mela!
              </h3>
              <p className="text-sm text-[#3D2C24] max-w-md mx-auto leading-relaxed font-light">
                Have you tasted our 400g Mushroom Mela Oyster Mushroom Pickle? We would love to hear your genuine feedback! Send us your review on WhatsApp.
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Akhil Foods, I would like to share my honest review of the Mushroom Mela Pickle:")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageSquare className="w-4 h-4 text-[#C89B3C]" />
                  <span>Share Your Review on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6. FAQ ACCORDION SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-serif font-bold uppercase tracking-[0.25em] text-[#A87B28] bg-[#EFE8DD] px-4 py-1.5 rounded-full border border-[#DDD3C4] shadow-sm">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#211612]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#3D2C24] font-light">
            Transparent answers regarding our ingredients, location in Jhansi, certifications, and delivery.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = faqOpenIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FDFBF7] rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-sm hover:border-[#C89B3C]/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between font-serif font-bold text-base sm:text-lg text-[#211612] hover:bg-[#FAF6EE] transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-[#A87B28] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 pt-0 text-sm text-[#3D2C24] leading-relaxed border-t border-[#E8DEC8] bg-[#FAF6EE]/50 font-sans font-light"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* 7. FINAL TRUST BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      >
        <div className="bg-[#1C130E] rounded-3xl p-8 sm:p-14 lg:p-16 text-center text-[#FAF6EE] shadow-2xl relative overflow-hidden space-y-6 border border-[#C89B3C]/35">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="text-xs font-serif font-bold tracking-[0.25em] uppercase text-[#D4AF37] bg-[#2A1D17] border border-[#C89B3C]/30 px-4 py-1.5 rounded-full shadow-sm">
              Authentic Jhansi Quality
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF6EE] leading-tight">
              Taste The Pure Goodness of Mushroom Mela
            </h2>
            <p className="text-sm sm:text-base text-[#EADBB6]/90 leading-relaxed font-sans font-light">
              Handcrafted by {BRAND.name} in Village Nandsiya, Moth, Jhansi, UP. 400g of flavourful oyster mushrooms steeped in mustard oil and traditional spices.
            </p>
            <div className="pt-3">
              <Link
                href="/shop"
                className="btn-primary !bg-[#FAF6EE] !text-[#211612] !border-[#FAF6EE] hover:!bg-[#EFE8DD] !px-8 !py-3.5"
              >
                <span>Shop Mushroom Mela Today</span>
                <ArrowRight className="w-4 h-4 text-[#A87B28]" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
      </div>
    </div>
  );
}
