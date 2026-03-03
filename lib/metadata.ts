import type { Metadata } from "next";
import { storeConfig } from "./store-config";

export function generateSiteMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    title: {
      default: storeConfig.seoDefaults.title,
      template: `%s | ${storeConfig.storeName}`,
    },
    description: storeConfig.seoDefaults.description,
    keywords: [
      "e-ticaret",
      "online alisveris",
      storeConfig.storeName,
      "urun",
      "magaza",
    ],
    authors: [{ name: storeConfig.legalName }],
    creator: storeConfig.legalName,
    publisher: storeConfig.legalName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: {
      type: "website",
      locale: storeConfig.locale,
      siteName: storeConfig.storeName,
      title: storeConfig.seoDefaults.title,
      description: storeConfig.seoDefaults.description,
    },
    twitter: {
      card: "summary_large_image",
      title: storeConfig.seoDefaults.title,
      description: storeConfig.seoDefaults.description,
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
    ...overrides,
  };
}

export function generateProductMetadata(product: {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryName: string;
}): Metadata {
  const title = product.name;
  const description = product.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": storeConfig.currency,
      "product:category": product.categoryName,
    },
  };
}

export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
}): Metadata {
  const title = category.name;
  const description = category.description || `${category.name} kategorisindeki urunleri inceleyin`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
