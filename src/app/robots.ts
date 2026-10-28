import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/", "/checkout", "/order-success/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
