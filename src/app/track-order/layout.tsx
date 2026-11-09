import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Track Your Order | AKHIL FOODS",
  description: "Track shipment status and courier updates for your AKHIL FOODS pickle order.",
  alternates: {
    canonical: `${appUrl}/track-order`,
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

