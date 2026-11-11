"use client";

import React from "react";
import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/config";

export default function FloatingWhatsApp() {
  const defaultMessage = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE);

  return (
    <aside
      aria-label="Atelier Concierge"
      className="fixed bottom-6 right-6 z-40"
    >
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atelier WhatsApp Concierge"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#211612]/95 hover:bg-[#34221A] border border-[#C89B3C]/40 text-[#FAF6EE] backdrop-blur-md shadow-2xl hover:border-[#C89B3C] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C89B3C] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C89B3C]"></span>
        </span>
        {/* WhatsApp official logo SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0"
          aria-hidden="true"
        >
          <path fill="#fff" d="M4.9 43.3l2.7-9.8C5.9 30.6 5 27.4 5 24 5 13.5 13.5 5 24 5s19 8.5 19 19-8.5 19-19 19c-3.2 0-6.2-.8-8.8-2.3L4.9 43.3z"/>
          <path fill="#25D366" d="M24 7c-9.4 0-17 7.6-17 17 0 3.1.8 6 2.3 8.5L7.4 41l8.7-2.8c2.4 1.3 5.1 2 7.9 2 9.4 0 17-7.6 17-17S33.4 7 24 7z"/>
          <path fill="#fff" d="M19.3 16c-.4-1-.7-1-1.1-1-.3 0-.6 0-.9.1s-.9.3-1.4.9c-.5.6-1.9 1.9-1.9 4.5s1.9 5.2 2.2 5.6c.3.4 3.7 5.9 9.1 8 1.3.5 2.3.8 3.1 1 1.3.4 2.5.3 3.4.2 1-.1 3.2-1.3 3.7-2.6.5-1.2.5-2.3.3-2.5-.2-.2-.5-.3-.9-.5s-2.9-1.4-3.4-1.6c-.5-.2-.8-.2-1.1.2-.3.4-1.3 1.6-1.6 1.9-.3.3-.6.4-1 .1-.5-.2-1.9-.7-3.6-2.2-1.3-1.2-2.2-2.6-2.5-3-.3-.4 0-.7.2-.9.2-.2.5-.6.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1.1-2.7-1.6-3.7z"/>
        </svg>
        <span className="font-serif text-[11px] tracking-[0.2em] uppercase text-[#EADBB6] font-medium hidden sm:inline">
          WhatsApp
        </span>
      </a>
    </aside>
  );
}
