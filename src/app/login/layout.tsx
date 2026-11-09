import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Sign In / Register | AKHIL FOODS",
  description: "Sign in to your customer account or create a new account with AKHIL FOODS.",
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
    canonical: `${appUrl}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
