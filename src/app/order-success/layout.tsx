import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Order Receipt | Akhil Foods",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
