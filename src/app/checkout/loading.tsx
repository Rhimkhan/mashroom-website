import React from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutLoading() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-[#E8DEC8] rounded" />
          <div className="h-8 w-64 bg-[#E8DEC8] rounded" />
          <div className="h-4 w-80 bg-[#E8DEC8] rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#FDFBF7] p-8 rounded-[6px] border border-[#E8DEC8] space-y-6">
            <div className="h-6 w-48 bg-[#E8DEC8] rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            </div>
            <div className="h-20 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FDFBF7] p-8 rounded-[6px] border border-[#E8DEC8] space-y-6">
            <div className="h-6 w-40 bg-[#E8DEC8] rounded" />
            <div className="h-24 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            <div className="h-12 bg-[#211612]/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
