import React from "react";
import { Metadata } from "next";
import WholesaleForm from "@/components/WholesaleForm";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Wholesale Inquiries | ${BRAND.name}`,
  description: `Bulk and wholesale order inquiries for Mushroom Mela oyster mushroom pickles. Sourced, prepared and packed in Moth, Jhansi, Uttar Pradesh.`,
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "")}/wholesale`,
  },
};

export default function WholesalePage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <WholesaleForm />
      </div>
    </div>
  );
}
