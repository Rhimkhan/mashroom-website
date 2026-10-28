import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Truck, MapPin, Phone, Mail, ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PHONE_DISPLAY, WHATSAPP_NUMBER, TEL_LINK } from "@/lib/config";

export const metadata: Metadata = {
  title: `Shipping and Delivery Policy | ${BRAND.name}`,
  description: `Shipping details for Mushroom Mela oyster mushroom pickle from ${BRAND.name}, Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Delivery timelines and packaging safety.`,
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: `Shipping and Delivery Policy | ${BRAND.name}`,
    description: `Packaging and nationwide delivery details from our kitchen in Moth, Jhansi. Delivery timelines depend on courier and location.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/shipping-policy`,
    type: "website",
  },
};

export default function ShippingPolicyPage() {
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
              <Truck className="w-3.5 h-3.5 text-[#A87B28]" />
              <span>Courier Delivery</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#211612] font-normal">
              Shipping and Delivery Policy
            </h1>
            <p className="text-xs text-[#736b63]">
              Dispatched from Village Nandsiya, Moth, Jhansi, Uttar Pradesh 284303
            </p>
          </div>
        </div>

        {/* Notice Callout */}
        <div className="bg-[#2D4F36] text-[#FAF6EE] rounded-[6px] p-6 sm:p-8 shadow-sm border border-[#3D6948] space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-300" />
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#FAF6EE]">
              Delivery Timelines
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed font-light">
            We are based in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Delivery time depends on the courier partner and your delivery location and pincode. We pack each jar with cushioning to ensure it arrives safely.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 sm:p-10 border border-[#E8DEC8] shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#3D2C24]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              1. Dispatch Location
            </h2>
            <p>
              Every jar of Mushroom Mela oyster mushroom pickle is prepared, jarred, and dispatched from:
            </p>
            <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[#E8DEC8] flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#A87B28] shrink-0" />
              <span className="font-medium text-[#211612] text-sm">
                {BRAND.address}
              </span>
            </div>
            <p className="text-xs text-[#736b63]">
              Orders are typically packed and handed over to courier partners within 1 to 2 business days of order confirmation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              2. Transit Times
            </h2>
            <p>
              Actual transit duration is determined by courier logistics networks (including India Post, Delhivery, DTDC, and regional couriers) and distance from Jhansi:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Uttar Pradesh and Delhi NCR:</strong> Deliveries are generally faster due to direct highway transport connections from Jhansi.</li>
              <li><strong>Major Cities:</strong> Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai, Ahmedabad, Pune, and state capitals follow standard inter-state transit times.</li>
              <li><strong>Remote and Rural Areas:</strong> May take additional days depending on local courier and postal reach.</li>
              <li><strong>Weather and Holidays:</strong> Regional holidays, weather conditions, or local transport disruptions can sometimes affect courier transit schedules.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              3. Delivery Charges
            </h2>
            <p>
              Delivery charges depend on order weight and destination pincode:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Standard delivery charge is ₹60 for single jar orders, and delivery is free for orders above ₹999.</li>
              <li>The exact delivery charge is calculated and displayed transparently on the Checkout page before payment.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              4. Cushioning and Packaging
            </h2>
            <p>
              Pickle jars are packed securely to withstand road and courier transport:
            </p>
            <div className="bg-[#FAF6EE] p-4 rounded-[6px] border border-[#E8DEC8] space-y-2">
              <div className="flex items-center gap-2 text-[#211612] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Our Packaging Standards:</span>
              </div>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-[#736b63] space-y-1">
                <li>Bubble wrap layer around each 400 g jar.</li>
                <li>Tight lid seal to prevent oil leakage during transit.</li>
                <li>Sturdy corrugated shipping carton with cushioning inserts.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              5. Tracking Your Shipment
            </h2>
            <p>
              Once your order has been dispatched, a courier tracking number is assigned:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Track on our website at <Link href="/track-order" className="text-[#A87B28] underline font-medium">Track Order</Link> using your Order Number and 10-digit mobile number.</li>
              <li>Or message us on WhatsApp with your Order Number for an update.</li>
            </ul>
          </section>

          {/* Contact Block */}
          <div className="pt-6 border-t border-[#E8DEC8] space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#211612]">
              Shipping Questions
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
