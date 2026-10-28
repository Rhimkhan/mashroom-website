import React from "react";

export default function CartLoading() {
  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#E8DEC8] rounded" />
          <div className="h-8 w-64 bg-[#E8DEC8] rounded" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#FDFBF7] p-6 rounded-[6px] border border-[#E8DEC8] flex gap-4 items-center"
            >
              <div className="w-20 h-20 bg-[#FAF6EE] rounded-[6px] border border-[#E8DEC8]" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-[#E8DEC8] rounded" />
                <div className="h-4 w-24 bg-[#E8DEC8]/60 rounded" />
              </div>
              <div className="h-6 w-20 bg-[#E8DEC8] rounded" />
            </div>
          ))}
        </div>

        <div className="bg-[#FDFBF7] p-6 rounded-[6px] border border-[#E8DEC8] space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-[#E8DEC8] rounded" />
            <div className="h-4 w-16 bg-[#E8DEC8] rounded" />
          </div>
          <div className="h-12 w-full bg-[#211612]/30 rounded-[6px] mt-4" />
        </div>
      </div>
    </div>
  );
}
