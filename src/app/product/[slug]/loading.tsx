import React from "react";

export default function ProductLoading() {
  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-60 bg-[#E8DEC8] rounded" />

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Visual Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-3xl bg-[#FDFBF7] border border-[#E8DEC8]" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 rounded-2xl bg-[#FDFBF7] border border-[#E8DEC8]" />
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="h-6 w-32 bg-[#E8DEC8] rounded-full" />
            <div className="h-10 w-3/4 bg-[#E8DEC8] rounded" />
            <div className="h-4 w-40 bg-[#E8DEC8] rounded" />
            <div className="h-8 w-28 bg-[#E8DEC8] rounded" />
            <div className="h-20 w-full bg-[#E8DEC8]/50 rounded-xl" />

            {/* Sizes */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-28 bg-[#E8DEC8] rounded" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-28 bg-[#FDFBF7] rounded-xl border border-[#E8DEC8]" />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-14 bg-[#FAF6EE] rounded-xl border border-[#211612]" />
              <div className="h-14 bg-[#211612]/30 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
