import type { Metadata, Viewport } from "next";
import React from "react";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app").replace(/\/$/, "");

export const viewport: Viewport = {
  themeColor: "#211612",
};

export const metadata: Metadata = {
  title: "AKHIL FOODS Admin",
  manifest: "/admin-manifest.webmanifest",
  icons: {
    icon: [
      { url: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/admin-icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AF Admin",
  },
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
    canonical: `${appUrl}/admin`,
  },
};

const ADMIN_MANIFEST_SCRIPT = `(function(){try{var d=document,links=d.querySelectorAll('link[rel="manifest"]');if(links.length){for(var i=0;i<links.length;i++){links[i].setAttribute('href','/admin-manifest.webmanifest');}}else{var l=d.createElement('link');l.rel='manifest';l.href='/admin-manifest.webmanifest';d.head.appendChild(l);}}catch(e){}})();`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: ADMIN_MANIFEST_SCRIPT }} />
      {children}
    </>
  );
}
