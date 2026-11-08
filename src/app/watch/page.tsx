"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER } from "@/lib/config";

export default function WatchPage() {
  const [videoError, setVideoError] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello AKHIL FOODS, I would like to order Mushroom Mela Oyster Mushroom Pickle."
  )}`;

  return (
    <main className="bg-[#FAF6EE] min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-8 sm:space-y-10 text-center">
        {/* Brand Header */}
        <header className="space-y-3">
          <p className="text-xs font-serif font-bold tracking-[0.25em] text-[#A87B28] uppercase">
            {BRAND.tagline}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#211612] font-normal tracking-wide">
            {BRAND.name}
          </h1>
          <p className="text-sm sm:text-base text-[#3D2C24] max-w-2xl mx-auto font-light leading-relaxed">
            Authentic Oyster Mushroom Pickles made in Village Nandsiya, Moth, Jhansi, Uttar Pradesh with pure mustard oil and whole spices.
          </p>
        </header>

        {/* Video Player or Fallback Poster */}
        <div className="w-full max-w-4xl mx-auto rounded-md overflow-hidden bg-[#1C130E] border border-[#C89B3C]/35 shadow-2xl">
          {videoError ? (
            <div className="relative w-full aspect-video flex items-center justify-center bg-[#1C130E]">
              <Image
                src="/images/products/mushroom-mela-front.jpg"
                alt="AKHIL FOODS Mushroom Mela"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
              />
            </div>
          ) : (
            <video
              src="/videos/akhil-foods.mp4"
              controls
              playsInline
              preload="metadata"
              poster="/images/products/mushroom-mela-front.jpg"
              onError={() => setVideoError(true)}
              className="w-full aspect-video object-contain bg-black"
            >
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Action Buttons Below Video (rounded-md) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif font-bold uppercase tracking-[0.18em] transition-all shadow-md hover:shadow-lg border border-[#211612]"
          >
            <ShoppingBag className="w-4 h-4 text-[#C89B3C]" />
            <span>Order now</span>
            <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-serif font-bold uppercase tracking-[0.18em] transition-all shadow-md hover:shadow-lg border border-[#25D366]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}
