import type { MetadataRoute } from "next";
import { SEO } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO.siteNamePlainFa,
    short_name: SEO.siteNameFa,
    description: SEO.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fcf7ef",
    theme_color: "#061728",
    dir: "rtl",
    lang: "fa-IR",
    categories: ["shopping", "fashion", "lifestyle"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
