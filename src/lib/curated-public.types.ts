import type { Product } from "@/components/ProductCard";

export interface CuratedPageData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  heroImageUrl: string | null;
  mobileHeroImageUrl: string | null;
  heroImagePublicId?: string | null;
  mobileHeroImagePublicId?: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  status: "draft" | "published" | "archived";
  products: Product[];
}
