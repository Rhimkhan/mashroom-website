import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Shopping Cart | AKHIL FOODS",
  description: "Review items in your cart and proceed to secure checkout for authentic oyster mushroom pickles.",
  alternates: {
    canonical: `${appUrl}/cart`,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

