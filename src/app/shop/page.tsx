import React from "react";
import { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import { INITIAL_PRODUCTS } from "@/lib/data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app";

export const metadata: Metadata = {
  title: "Shop Mushroom Mela Oyster Mushroom Pickle | AKHIL FOODS",
  description:
    "Buy Mushroom Mela Oyster Mushroom Pickle (400g) by AKHIL FOODS, Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Prepared with mustard oil and spices.",
  keywords: ["AKHIL FOODS", "Mushroom Pickle"],
  openGraph: {
    title: "Shop Mushroom Mela Oyster Mushroom Pickle | AKHIL FOODS",
    description:
      "Made in Village Nandsiya, Moth, Jhansi, Uttar Pradesh with mustard oil and spices.",
    url: `${appUrl}/shop`,
    siteName: "AKHIL FOODS",
    images: [
      {
        url: "/images/products/mushroom-mela-front.jpg",
        width: 1200,
        height: 630,
        alt: "AKHIL FOODS Mushroom Mela Oyster Mushroom Pickle Jar",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Mushroom Mela Oyster Mushroom Pickle | AKHIL FOODS",
    description: "Made in Moth, Jhansi, UP with mustard oil and spices.",
    images: ["/images/products/mushroom-mela-front.jpg"],
  },
  alternates: {
    canonical: `${appUrl}/shop`,
  },
};

export default function ShopPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AKHIL FOODS Mushroom Pickle Catalog",
    description: "Oyster Mushroom Pickle made in Jhansi, UP.",
    numberOfItems: INITIAL_PRODUCTS.length,
    itemListElement: INITIAL_PRODUCTS.map((prod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: prod.name,
        image: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}${prod.image}`,
        description: prod.description,
        sku: prod.id,
        offers: {
          "@type": "Offer",
          price: prod.sizes[0]?.price || 399,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ShopClient />
    </>
  );
}
