import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { INITIAL_PRODUCTS } from "@/lib/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INITIAL_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Pickle Not Found | AKHIL FOODS",
      description: "The requested mushroom pickle could not be located.",
    };
  }

  const title = `${product.name} | AKHIL FOODS`;
  const description = `Oyster mushroom pickle made in Jhansi with mustard oil and spices.`;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

  return {
    title,
    description,
    keywords: [product.name, "AKHIL FOODS"],
    openGraph: {
      title,
      description,
      url: `${appUrl}/product/${product.slug}`,
      siteName: "AKHIL FOODS",
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.name} - Pickle Jar`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: `${appUrl}/product/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return notFound();
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `${appUrl}${product.image}`,
    description: product.description,
    sku: product.id,
    weight: "400 g",
    brand: {
      "@type": "Brand",
      name: "AKHIL FOODS",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: 399,
      availability: (product.stockCount ?? 100) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "AKHIL FOODS",
      },
    },
  };

  // Add aggregateRating only if approved reviews exist
  if (product.reviewsCount > 0 && product.rating > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient />
    </>
  );
}
