import React from "react";

export default function ShopLoading() {
  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="h-6 w-48 bg-[#E8DEC8] rounded-full mx-auto" />
          <div className="h-10 w-80 bg-[#E8DEC8] rounded mx-auto" />
          <div className="h-4 w-96 bg-[#E8DEC8] rounded mx-auto" />
        </div>

        {/* Filters Skeleton */}
        <div className="bg-[#FDFBF7] p-5 sm:p-7 rounded-2xl border border-[#E8DEC8] space-y-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="h-10 w-full md:w-80 bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
            <div className="h-10 w-44 bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
            ))}
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-[#FDFBF7] border border-[#E8DEC8] p-5 space-y-4"
            >
              <div className="aspect-square bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
              <div className="h-5 w-3/4 bg-[#E8DEC8] rounded" />
              <div className="h-4 w-full bg-[#E8DEC8]/60 rounded" />
              <div className="h-8 w-full bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-10 bg-[#FAF6EE] rounded-xl border border-[#E8DEC8]" />
                <div className="h-10 bg-[#211612]/20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
