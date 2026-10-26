import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Home, Package, PhoneCall, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/lib/config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] bg-[#211612] text-[#C89B3C] text-xs font-bold tracking-wider uppercase border border-[#C89B3C]/30 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{BRAND.name} • Jhansi Heritage</span>
        </div>

        {/* 404 Headline */}
        <div className="space-y-3">
          <span className="font-serif text-7xl sm:text-9xl font-black text-[#211612] block tracking-tight">
            404
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612]">
            Jar Not Found!
          </h1>
          <p className="text-sm sm:text-base text-[#3D2C24]/80 font-sans max-w-md mx-auto leading-relaxed">
            It seems this page has gone missing like the last spoonful of our handcrafted oyster mushroom pickle. Let’s get you back to the flavor!
          </p>
        </div>

        {/* Action Grid */}
        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-[#211612] text-[#FAF6EE] hover:bg-[#1C130E] text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <Home className="w-4 h-4 text-[#C89B3C]" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-[#FAF6EE] text-[#211612] hover:bg-[#F2ECE0] border border-[#E8DEC8] text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#C89B3C]" />
              <span>Browse Pickles</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E8DEC8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link
              href="/track-order"
              className="flex items-center justify-center gap-1.5 py-2 text-[#3D2C24]/80 hover:text-[#211612] font-semibold"
            >
              <Package className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>Track Your Order</span>
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Akhil Foods! I encountered a missing page on the website and need assistance.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 text-[#3D2C24]/80 hover:text-[#211612] font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Support ({PHONE_DISPLAY})</span>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-[#3D2C24]/60 font-serif">
          Village Nandsiya, Moth, Jhansi, Uttar Pradesh • FSSAI Registered Kitchen
        </p>
      </div>
    </div>
  );
}
