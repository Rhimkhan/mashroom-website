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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://akhilfoods.com"),
  title: {
    default: "AKHIL FOODS | Artisanal Handcrafted Mushroom Pickles",
    template: "%s | AKHIL FOODS",
  },
  description:
    "Experience authentic artisanal oyster mushroom pickles handcrafted in Village Nandsiya, Moth, Jhansi, Uttar Pradesh by AKHIL FOODS with fresh mushrooms, pure mustard oil, and traditional spices. Great Food, Better Life.",
  keywords: [
    "mushroom pickle",
    "akhil foods",
    "mushroom mela",
    "oyster mushroom pickle",
    "jhansi pickles",
    "uttar pradesh pickle",
    "pure mustard oil pickle",
    "handcrafted pickle online",
    "fssai registered pickle",
  ],
  authors: [{ name: "AKHIL FOODS", url: "https://akhilfoods.com" }],
  creator: "AKHIL FOODS",
  publisher: "AKHIL FOODS",
  formatDetection: {
    telephone: false,
    email: false,
  },
  openGraph: {
    title: "AKHIL FOODS | Artisanal Handcrafted Mushroom Pickles",
    description: "Great Food, Better Life. Authentic handcrafted oyster mushroom pickles from Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
    url: "https://akhilfoods.com",
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
    title: "AKHIL FOODS | Artisanal Mushroom Pickles",
    description: "Authentic handcrafted oyster mushroom pickles from Jhansi, Uttar Pradesh.",
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
