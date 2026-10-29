import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Camera, AlertTriangle, CheckCircle2, Phone, Mail, ArrowLeft, Clock } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PHONE_DISPLAY, WHATSAPP_NUMBER, TEL_LINK, FSSAI_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: `Refund and Replacement Policy | ${BRAND.name}`,
  description: `Refund and replacement policy for ${BRAND.name}. 48-hour photo reporting policy for damaged or wrong items. No returns on opened food.`,
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "")}/refund-policy`,
  },
  openGraph: {
    title: `Refund and Replacement Policy | ${BRAND.name}`,
    description: `No returns on opened food items. Quick replacement or refund for damaged or wrong items reported within 48 hours with photos.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/refund-policy`,
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF6EE] min-h-screen py-12 sm:py-20 text-[#211612]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A87B28] hover:text-[#211612] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#A87B28] bg-[#EFE8DD] px-3.5 py-1 rounded-[6px] border border-[#DDD3C4] inline-flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#A87B28]" />
              <span>Policy Terms</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#211612] font-normal">
              Refund and Replacement Policy
            </h1>
            <p className="text-xs text-[#736b63]">
              Akhil Foods, Village Nandsiya, Moth, Jhansi, Uttar Pradesh 284303
            </p>
          </div>
        </div>

        {/* 48-Hour Banner */}
        <div className="bg-[#2D4F36] text-[#FAF6EE] rounded-[6px] p-6 sm:p-8 shadow-sm border border-[#3D6948] space-y-3">
          <div className="flex items-center gap-2 text-[#FAF6EE]">
            <Clock className="w-5 h-5 text-emerald-300" />
            <h2 className="font-serif text-xl sm:text-2xl font-normal">
              48-Hour Transit Damage Protection
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed font-light">
            If your parcel arrives damaged, leaking, broken in courier transit, or if you received an incorrect item, report it to us within <strong>48 hours of delivery with photos</strong>. We will arrange a replacement jar or issue a refund.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 sm:p-10 border border-[#E8DEC8] shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#3D2C24]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              1. No Returns on Opened Food Items
            </h2>
            <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-[6px] border border-[#E8DEC8] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-[#3D2C24]">
                Because our oyster mushroom pickles are perishable food items packed in sealed jars for hygiene and strict food safety compliance (FSSAI Lic. No. {FSSAI_NUMBER}), <strong>we cannot accept returns or exchanges once the jar seal has been opened or unsealed by the customer</strong>.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              2. Damaged in Transit or Wrong Item Delivered
            </h2>
            <p>
              We pack jars in protective cushioning. However, if courier transit damage occurs or an incorrect item was delivered:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <strong>Report within 48 hours:</strong> You must inform us within 48 hours of delivery (as recorded by the courier tracking record).
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Camera className="w-4 h-4 text-[#A87B28] shrink-0 mt-1" />
                <div>
                  <strong>Share clear photos:</strong> Take 2 to 3 clear photos of the shipping carton, shipping label showing your address, and the damaged jar showing the defect or seal breakage.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#A87B28] shrink-0 mt-1" />
                <div>
                  <strong>Send to WhatsApp or Email:</strong> Send the photos along with your Order Number to WhatsApp at <strong>+91 63864 23865</strong> or email us at <strong>{BRAND.email}</strong>.
                </div>
              </div>
            </div>
            <p className="pt-2 text-sm text-[#736b63]">
              Once verified by our team, you may choose:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[#E8DEC8]">
                <h3 className="font-bold text-[#211612] text-sm">Option A: Free Replacement</h3>
                <p className="text-xs text-[#736b63] mt-1">We dispatch a fresh jar of your ordered pickle to your address at no extra cost.</p>
              </div>
              <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[#E8DEC8]">
                <h3 className="font-bold text-[#211612] text-sm">Option B: Full Refund</h3>
                <p className="text-xs text-[#736b63] mt-1">We initiate a refund to your original payment method or via UPI to your mobile number.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              3. Order Cancellation
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Before dispatch:</strong> You may cancel your order at any time before it has been handed over to the courier partner. Message us on WhatsApp (+91 63864 23865) with your Order Number for an immediate cancellation and full refund.</li>
              <li><strong>After dispatch:</strong> Once a parcel has been picked up by the courier partner, the parcel cannot be cancelled mid-transit.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              4. Refund Timelines
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Prepaid online orders:</strong> Refunds are processed back to the original source card or bank account within 3 to 7 working days.</li>
              <li><strong>UPI QR payments:</strong> Refunds are sent via UPI to your mobile number or UPI ID within 24 to 48 hours.</li>
              <li><strong>Cash on Delivery (COD) orders:</strong> If a COD order arrived damaged, we will remit the refund directly to your UPI ID or bank account.</li>
            </ul>
          </section>

          {/* Contact Block */}
          <div className="pt-6 border-t border-[#E8DEC8] space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#211612]">
              Contact for Claims
            </h3>
            <div className="bg-[#FAF6EE] p-5 rounded-[6px] border border-[#E8DEC8] space-y-1.5 text-xs sm:text-sm">
              <p><strong>Akhil Foods:</strong> Village Nandsiya, Moth, Jhansi, Uttar Pradesh 284303</p>
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-[#A87B28] underline font-medium">
                  +91 63864 23865
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${BRAND.email}`} className="hover:text-[#A87B28] underline font-medium">
                  {BRAND.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
