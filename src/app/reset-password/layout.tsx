import type { Metadata } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Reset Password | AKHIL FOODS",
  description: "Set a new password for your AKHIL FOODS customer account.",
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
    canonical: `${appUrl}/reset-password`,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
