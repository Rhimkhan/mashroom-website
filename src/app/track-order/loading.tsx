import React from "react";

export default function TrackOrderLoading() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="h-6 w-36 bg-[#E8DEC8] mx-auto rounded" />
          <div className="h-10 w-72 bg-[#E8DEC8] mx-auto rounded" />
          <div className="h-4 w-96 bg-[#E8DEC8] mx-auto rounded" />
        </div>

        <div className="bg-[#FDFBF7] p-7 rounded-[6px] border border-[#E8DEC8] max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            <div className="h-10 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
          </div>
          <div className="h-12 bg-[#211612]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
