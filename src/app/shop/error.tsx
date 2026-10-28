"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Shop page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#FAF6EE] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#FDFBF7] p-8 rounded-[8px] border border-[#E8DEC8] text-center space-y-5 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#E8DEC8]/40 border border-[#C89B3C]/30 text-[#A87B28] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
            Unable to load products
          </h2>
          <p className="text-xs sm:text-sm text-[#3D2C24]/80 leading-relaxed">
            We are having trouble reaching our catalog. Please try refreshing or check back in a moment.
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
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#FAF6EE] text-[#211612] hover:bg-[#F2ECE0] border border-[#E8DEC8] text-xs font-semibold transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
