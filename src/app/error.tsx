"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, MessageSquare } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER } from "@/lib/config";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Antigravity caught runtime boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-[12px] bg-red-100 border border-red-200 text-red-700 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#A87B28] uppercase tracking-wider font-mono">
            {BRAND.name} • System Notice
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612]">
            Something unexpected occurred
          </h1>
          <p className="text-sm text-[#3D2C24]/80 font-sans leading-relaxed">
            Our kitchen team has been alerted. Your cart contents and order history remain safe in your browser session.
          </p>
        </div>

        {error?.digest && (
          <div className="text-xs font-mono text-[#3D2C24]/60 bg-[#FDFBF7] py-1.5 px-3 rounded border border-[#E8DEC8] inline-block">
            Reference Code: {error.digest}
          </div>
        )}

        <div className="bg-[#FDFBF7] p-6 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-[#211612] text-[#FAF6EE] hover:bg-[#1C130E] text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-[#C89B3C]" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] bg-[#FAF6EE] text-[#211612] hover:bg-[#F2ECE0] border border-[#E8DEC8] text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              <Home className="w-4 h-4 text-[#C89B3C]" />
              <span>Back to Store</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E8DEC8]">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi Akhil Foods! I encountered an error on the site${error?.digest ? ` (Code: ${error.digest})` : ""}. Could you help me?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 py-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Need instant help? Message our Jhansi kitchen on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
