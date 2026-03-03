import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/urun/", "/sepet", "/hesabim"],
        disallow: ["/yonetim/", "/api/", "/odeme"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
