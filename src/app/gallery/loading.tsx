import React from "react";

export default function GalleryLoading() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="h-4 w-32 bg-[#E8DEC8] rounded-full mx-auto" />
          <div className="h-10 w-72 bg-[#E8DEC8] rounded-lg mx-auto" />
          <div className="h-4 w-96 max-w-full bg-[#E8DEC8] rounded mx-auto" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex justify-center gap-2 max-w-md mx-auto">
          <div className="h-9 w-20 bg-[#E8DEC8] rounded-full" />
          <div className="h-9 w-28 bg-[#E8DEC8] rounded-full" />
          <div className="h-9 w-24 bg-[#E8DEC8] rounded-full" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden bg-[#FDFBF7] border border-[#E8DEC8] p-4 space-y-4"
            >
              <div className="aspect-square bg-[#FAF6EE] rounded-2xl" />
              <div className="h-5 w-3/4 bg-[#E8DEC8] rounded" />
              <div className="h-3 w-1/2 bg-[#E8DEC8] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
