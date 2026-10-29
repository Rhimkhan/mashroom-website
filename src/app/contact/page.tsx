import React from "react";
import { Metadata } from "next";
import ContactClient from "@/components/ContactClient";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact Us & Location in Jhansi | AKHIL FOODS",
  description:
    "Get in touch with AKHIL FOODS in Village Nandsiya, Moth, Jhansi, Uttar Pradesh - 284303. Order inquiries, customer support, and direct WhatsApp ordering on 916386423865.",
  keywords: ["AKHIL FOODS", "Contact", "Jhansi"],
  openGraph: {
    title: "Contact Us & Location | AKHIL FOODS",
    description:
      "Reach out to AKHIL FOODS in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Quick WhatsApp support on 916386423865.",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/contact`,
    siteName: "AKHIL FOODS",
    images: [
      {
        url: "/images/products/mushroom-mela-front.jpg",
        width: 1200,
        height: 630,
        alt: "AKHIL FOODS Mushroom Pickles Customer Care and Location",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | AKHIL FOODS Jhansi",
    description: "Get in touch with our team in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
    images: ["/images/products/mushroom-mela-front.jpg"],
  },
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "")}/contact`,
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND.name,
    image: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/images/products/mushroom-mela-front.jpg`,
    telephone: BRAND.phone,
    email: BRAND.email,
    url: process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app",
    taxID: BRAND.gstNumber,
    identifier: [
      {
        "@type": "PropertyValue",
        name: "FSSAI License",
        value: BRAND.fssaiNumber,
      },
      {
        "@type": "PropertyValue",
        name: "GSTIN",
        value: BRAND.gstNumber,
      },
      {
        "@type": "PropertyValue",
        name: "Udyam Registration",
        value: BRAND.udyamNumber,
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
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.7148,
      longitude: 78.9535,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
