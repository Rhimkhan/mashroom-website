import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FSSAI_NUMBER, FSSAI_VALIDITY, GST_NUMBER, UDYAM_NUMBER, PHONE_DISPLAY, WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/config";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app";

export const metadata: Metadata = {
  title: "Our Story | AKHIL FOODS - Moth, Jhansi, Uttar Pradesh",
  description:
    "Learn about AKHIL FOODS, based in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. We make Mushroom Mela oyster mushroom pickles using mustard oil, vinegar, and spices.",
  alternates: {
    canonical: `${appUrl}/our-story`,
  },
  openGraph: {
    title: "Our Story | AKHIL FOODS",
    description:
      "Oyster mushroom pickles from Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
    url: `${appUrl}/our-story`,
    siteName: "AKHIL FOODS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Our Story | AKHIL FOODS",
    description: "Oyster mushroom pickles from Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
  },
};

export default function OurStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Our Story - Akhil Foods",
    description:
      "Who we are, where we make our pickle, and what goes into Mushroom Mela oyster mushroom pickle.",
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: appUrl,
      taxID: GST_NUMBER,
      identifier: [
        {
          "@type": "PropertyValue",
          name: "FSSAI License",
          value: FSSAI_NUMBER,
        },
        {
          "@type": "PropertyValue",
          name: "GSTIN",
          value: GST_NUMBER,
        },
        {
          "@type": "PropertyValue",
          name: "Udyam Registration",
          value: UDYAM_NUMBER,
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: BRAND.address,
        addressLocality: BRAND.city,
        addressRegion: BRAND.state,
        postalCode: BRAND.pincode,
        addressCountry: "IN",
      },
    },
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen text-[#211612]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Heading */}
        <div className="space-y-3">
          <span className="font-serif text-xs tracking-wider uppercase text-[#A87B28] font-bold block">
            About Akhil Foods
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#211612] leading-tight">
            Our Story
          </h1>
          <p className="text-base text-[#3D2C24] font-light leading-relaxed">
            Akhil Foods is a small food enterprise operated in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
          </p>
        </div>

        {/* Section 1: Who We Are */}
        <section className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] space-y-4 shadow-sm">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
            Who We Are
          </h2>
          <p className="text-sm sm:text-base text-[#3D2C24] leading-relaxed font-light">
            Akhil Foods was started by Abhishek Kumar in Jhansi district, Uttar Pradesh. We are a small business dedicated to making one product done right: Mushroom Mela oyster mushroom pickle. We handle sourcing, cleaning, preparation, pickling, packing, and dispatch directly.
          </p>
        </section>

        {/* Section 2: Where We Make It */}
        <section className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#A87B28]">
            <MapPin className="w-5 h-5" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
              Where We Make It
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#3D2C24] leading-relaxed font-light">
            Our kitchen and packing facility is located at:
          </p>
          <div className="p-4 rounded-[6px] bg-[#FAF6EE] border border-[#E8DEC8] font-mono text-xs sm:text-sm text-[#211612]">
            Akhil Foods<br />
            Village Nandsiya, Karguwan Road, Near Ambedkar Murti<br />
            Moth, Jhansi, Uttar Pradesh 284303<br />
            Contact: {PHONE_DISPLAY} • {BRAND.email}
          </div>
        </section>

        {/* Section 3: What The Product Is */}
        <section className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] space-y-4 shadow-sm">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
            What The Product Is
          </h2>
          <p className="text-sm sm:text-base text-[#3D2C24] leading-relaxed font-light">
            Our product is <strong>Mushroom Mela Oyster Mushroom Pickle</strong>. It is sold in a 400 g net quantity jar at an MRP of Rs 399.
          </p>
          <div className="space-y-2 pt-2">
            <h3 className="font-serif font-bold text-sm text-[#211612]">
              Label Ingredients
            </h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-light">
              Mushroom, mustard oil, vinegar, salt, red chilli, coriander, mustard, fennel, fenugreek, cumin, turmeric, ajwain, ginger, garlic, and permitted additives.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <h3 className="font-serif font-bold text-sm text-[#211612]">
              Storage Instructions
            </h3>
            <p className="text-sm text-[#3D2C24] leading-relaxed font-light">
              Store in a cool, dry place. Keep away from direct sunlight. Always use a clean, dry spoon.
            </p>
          </div>
        </section>

        {/* Section 4: Government Registrations */}
        <section className="bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#A87B28]">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#211612]">
              Government Registrations
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#3D2C24] leading-relaxed font-light">
            Our business and product are registered under the following official government identifiers:
          </p>
          <ul className="space-y-2 text-sm text-[#3D2C24] font-mono">
            <li><strong>FSSAI Registration:</strong> {FSSAI_NUMBER} (Valid through {FSSAI_VALIDITY})</li>
            <li><strong>GSTIN:</strong> {GST_NUMBER} (Uttar Pradesh, State Code 09)</li>
            <li><strong>Udyam MSME Registration:</strong> {UDYAM_NUMBER}</li>
          </ul>
        </section>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="btn-primary"
          >
            <span>Shop now</span>
            <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
