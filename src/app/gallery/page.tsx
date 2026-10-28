import React from "react";
import { Metadata } from "next";
import GalleryClient from "@/components/GalleryClient";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app";

export const metadata: Metadata = {
  title: "Gallery | AKHIL FOODS Mushroom Pickles",
  description:
    "Product photos of Mushroom Mela oyster mushroom pickle jars, ingredients, nutrition label, and packaging in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
  keywords: ["AKHIL FOODS", "Mushroom Pickle"],
  openGraph: {
    title: "Gallery | AKHIL FOODS Mushroom Pickles",
    description:
      "Photos of 400 g Mushroom Mela oyster mushroom pickle jars, label ingredients, and packaging in Jhansi, Uttar Pradesh.",
    url: `${appUrl}/gallery`,
    siteName: "AKHIL FOODS",
    images: [
      {
        url: "/images/products/mushroom-mela-front.jpg",
        width: 1200,
        height: 900,
        alt: "Mushroom Mela Oyster Mushroom Pickle 400g Jar - Akhil Foods Jhansi",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | AKHIL FOODS",
    description: "Product photos of mushroom pickles in Jhansi, Uttar Pradesh.",
    images: ["/images/products/mushroom-mela-front.jpg"],
  },
  alternates: {
    canonical: `${appUrl}/gallery`,
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
