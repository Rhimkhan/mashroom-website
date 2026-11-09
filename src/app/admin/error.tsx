"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#FDFBF7] p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-[6px] bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#C89B3C]" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FAF6EE] bg-[#1C130E] border border-[#C89B3C]/30 px-3 py-1 rounded-[4px]">
            Admin Security Boundary
          </span>
          <h1 className="font-serif text-2xl font-extrabold text-[#211612] pt-1">
            Admin Dashboard Notice
          </h1>
          <p className="text-xs text-[#3D2C24]/70 leading-relaxed font-sans">
            A temporary view error occurred while rendering dashboard operations. Store transactions and live customer data remain safe.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] hover:bg-[#1C130E] text-xs font-bold transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Reload View</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#FAF6EE] text-[#211612] hover:bg-[#F2ECE0] border border-[#E8DEC8] text-xs font-bold transition-colors shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Store Front</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

