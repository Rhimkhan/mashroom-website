"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/config";

export default function FloatingWhatsApp() {
  const defaultMessage = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);

  return (
    <aside
      aria-label="Order on WhatsApp"
      className="fixed bottom-6 right-6 z-40"
    >
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="group flex items-center justify-center min-w-[44px] min-h-[44px] px-4 py-2.5 rounded-full bg-[#211612]/95 hover:bg-[#34221A] border border-[#C89B3C]/40 text-[#FAF6EE] backdrop-blur-md shadow-2xl hover:border-[#C89B3C] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C89B3C] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C89B3C]"></span>
        </span>
        <MessageSquare className="w-3.5 h-3.5 text-[#EADBB6] group-hover:scale-110 transition-transform" />
        <span className="font-serif text-[11px] tracking-[0.2em] uppercase text-[#EADBB6] font-medium hidden sm:inline">
          WhatsApp
        </span>
      </a>
    </aside>
  );
}
