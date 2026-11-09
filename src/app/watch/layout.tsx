import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Watch Our Story | AKHIL FOODS",
  description: "Watch how Mushroom Mela oyster mushroom pickle is made in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
  alternates: {
    canonical: `${appUrl}/watch`,
  },
};

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

