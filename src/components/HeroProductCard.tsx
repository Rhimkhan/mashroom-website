import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/data";

export default function HeroProductCard() {
  const product = INITIAL_PRODUCTS[0]; // Mushroom Mela Pickle

  return (
    <div className="relative w-full max-w-xl flex flex-col group">
      {/* Large, rounded, deep-espresso card container with subtle gold accents */}
      <div className="relative w-full rounded-3xl bg-[#1C130E] border border-[#C89B3C]/35 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Ambient warm gold aura behind the jar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C89B3C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: ATELIER HARVEST • BATCH NO. 01 and 400G GLASS JAR in tiny, elegant gold lettering */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-[#C89B3C]/20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
            <span className="font-serif text-xs tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
              ATELIER HARVEST • BATCH NO. 01
            </span>
          </div>
          <span className="font-serif text-xs tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
            400G GLASS JAR
          </span>
        </div>

        {/* Artistic Closeup Photograph */}
        <div className="relative z-10 my-4 rounded-2xl overflow-hidden shadow-2xl border border-[#C89B3C]/25 bg-[#120B08]">
          <div className="relative w-full aspect-[4/3]">
            <Image
              src="/images/mushroom-mela-jar-luxury.jpg"
              alt="Mushroom Mela Artisanal Oyster Mushroom Pickle Jar with matte paper label, gold lettering, dark twine seal, dried chilies, mustard seeds and oyster mushrooms"
              fill
              sizes="(max-width: 640px) 100vw, 550px"
              priority
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120B08]/85 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[#FAF6EE]">
              <span className="font-serif italic text-xs text-[#D4AF37] tracking-wide">
                Mushroom Mela • Artisanal Oyster Mushroom Pickle • Jhansi
              </span>
            </div>
          </div>
        </div>

        {/* Beneath the card: Dark Tab Buttons for Key Ingredients */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-1 pb-4">
          <div className="bg-[#2A1D17] border border-[#C89B3C]/20 rounded-xl py-2 px-1 text-center shadow-sm">
            <span className="font-serif text-xs text-[#EADBB6] tracking-wider block font-medium">
              Plump Oyster Caps
            </span>
          </div>
          <div className="bg-[#2A1D17] border border-[#C89B3C]/20 rounded-xl py-2 px-1 text-center shadow-sm">
            <span className="font-serif text-xs text-[#EADBB6] tracking-wider block font-medium">
              Virgin Mustard Oil
            </span>
          </div>
          <div className="bg-[#2A1D17] border border-[#C89B3C]/20 rounded-xl py-2 px-1 text-center shadow-sm">
            <span className="font-serif text-xs text-[#EADBB6] tracking-wider block font-medium">
              Crushed Fenugreek & Nigella
            </span>
          </div>
        </div>

        {/* Consolidated Single Action Bar (Reduces Decision Paralysis) */}
        <div className="relative z-10 pt-4 border-t border-[#C89B3C]/20 flex items-center justify-between text-[#FAF6EE] gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#D4AF37] tracking-wide">
              ₹399
            </span>
            <span className="text-xs text-[#EADBB6]/80 font-serif italic">
              Artisanal Collector&apos;s Jar • 400g
            </span>
          </div>

          <Link
            href="/product/mushroom-mela-oyster-mushroom-pickle"
            className="btn-primary !py-2 !px-4 !bg-[#FAF6EE] !text-[#211612] !border-[#FAF6EE] hover:!bg-[#EFE8DD] text-xs font-serif tracking-wider uppercase font-bold shadow-sm shrink-0"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A87B28]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
