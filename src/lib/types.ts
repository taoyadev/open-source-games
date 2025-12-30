// Re-export Game type from database schema for convenience
export type { Game } from "@/db/schema";

// Affiliate device types (inline in schema, but re-exported for components)
export interface AffiliateDevice {
  name: string;
  url: string;
  price: string;
  image?: string;
  description?: string;
}

export interface VPSProvider {
  name: string;
  url: string;
  price: string;
  description: string;
}

// Schema.org types for JSON-LD
export interface VideoGameSchema {
  "@context"?: string;
  "@type": string | string[];
  "@id"?: string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    ratingCount?: number;
    reviewCount?: number;
    bestRating: string;
    worstRating: string;
  };
  author: {
    "@type": string;
    "@id"?: string;
    name: string;
    url?: string;
  };
  publisher?: {
    "@type": string;
    name: string;
  };
  sourceOrganization?: {
    "@type": string;
    name: string;
    url?: string;
  };
  isAccessibleForFree?: boolean;
  isFamilyFriendly?: boolean;
  softwareVersion?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string | string[];
  thumbnailUrl?: string;
  screenshot?: string[];
  genre?: string[];
  gamePlatform?: string[];
  license?: string;
  keywords?: string;
}

// Breadcrumb schema
export interface BreadcrumbSchema {
  "@context": string;
  "@type": string;
  "@id"?: string;
  itemListElement: {
    "@type": string;
    position: number;
    "@id"?: string;
    name: string;
    item?: string;
  }[];
}
