import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import Analytics from "@/components/Analytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"),
  title: {
    default: "AKHIL FOODS | Oyster Mushroom Pickle",
    template: "%s | AKHIL FOODS",
  },
  description:
    "Oyster mushroom pickle made in Jhansi with mustard oil and spices by AKHIL FOODS. Great Food, Better Life.",
  keywords: [
    "mushroom pickle",
    "akhil foods",
    "mushroom mela",
    "oyster mushroom pickle",
    "jhansi pickles",
    "uttar pradesh pickle",
    "pure mustard oil pickle",
    "mushroom pickle online",
    "fssai registered pickle",
  ],
  authors: [{ name: "AKHIL FOODS", url: process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app" }],
  creator: "AKHIL FOODS",
  publisher: "AKHIL FOODS",
  formatDetection: {
    telephone: false,
    email: false,
  },
  openGraph: {
    title: "AKHIL FOODS | Oyster Mushroom Pickle",
    description: "Oyster mushroom pickle made in Jhansi with mustard oil and spices.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app",
    siteName: "AKHIL FOODS",
    images: [
      {
        url: "/images/products/mushroom-mela-front.jpg",
        width: 1200,
        height: 630,
        alt: "AKHIL FOODS Mushroom Mela Oyster Mushroom Pickle 400g Jar",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AKHIL FOODS | Oyster Mushroom Pickle",
    description: "Oyster mushroom pickle made in Jhansi with mustard oil and spices.",
    images: ["/images/products/mushroom-mela-front.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/images/akhil-foods-logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#211612] antialiased selection:bg-[#211612] selection:text-[#FAF6EE]">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <AuthModal />
            <FloatingWhatsApp />
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
