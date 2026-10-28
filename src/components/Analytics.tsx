"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState(true); // default true to avoid flash

  useEffect(() => {
    if (!gaId) return;
    try {
      const consent = localStorage.getItem("akhil_cookie_consent");
      if (!consent) {
        setCookieConsentAccepted(false);
      }
    } catch {
      // ignore local storage access issues
    }
  }, [gaId]);

  if (!gaId || gaId.trim() === "") {
    return null;
  }

  const handleAccept = () => {
    try {
      localStorage.setItem("akhil_cookie_consent", "accepted");
    } catch {
      // ignore
    }
    setCookieConsentAccepted(true);
  };

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId.trim()}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId.trim()}');
        `}
      </Script>

      {!cookieConsentAccepted && (
        <aside
          aria-label="Cookie Notice"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 bg-[#1C130E] text-[#FAF6EE] p-4 rounded-xl border border-[#C89B3C]/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <p className="text-xs text-[#FAF6EE]/90 leading-relaxed font-sans">
            We use cookies to analyze site traffic and enhance your browsing experience.
          </p>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-[#C89B3C] hover:bg-[#D4AF37] text-[#211612] font-serif text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            Accept
          </button>
        </aside>
      )}
    </>
  );
}
