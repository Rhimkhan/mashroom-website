import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AKHIL FOODS — Artisanal Mushroom Pickles",
    short_name: "AKHIL FOODS",
    description:
      "Handcrafted Artisanal Oyster Mushroom Pickles made with pure mustard oil, whole spices, and zero chemical shortcuts. Prepared in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#211612",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/images/akhil-foods-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/akhil-foods-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
