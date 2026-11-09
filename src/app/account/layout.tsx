import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "My Account | Akhil Foods",
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
  alternates: {
    canonical: `${appUrl}/account`,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
