"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#FAF6EE] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#FDFBF7] p-8 rounded-[8px] border border-[#E8DEC8] text-center space-y-5 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#E8DEC8]/40 border border-[#C89B3C]/30 text-[#A87B28] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
            Cart encountered an issue
          </h2>
          <p className="text-xs sm:text-sm text-[#3D2C24]/80 leading-relaxed">
            Your items are safe in your session. Please refresh or return to the shop to continue.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] hover:bg-[#1C130E] text-xs font-semibold transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4 text-[#C89B3C]" />
            <span>Try Again</span>
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FAF6EE] text-[#211612] hover:bg-[#F2ECE0] border border-[#E8DEC8] text-xs font-semibold transition-colors min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4 text-[#C89B3C]" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
