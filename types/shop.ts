export type BlockType =
  | 'text_with_image'
  | 'image_duo'
  | 'full_bleed_image'
  | 'pull_quote'
  | 'designer_roster';

export type AspectRatio = '4:5' | '1:1' | '16:10' | 'auto';

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  aspectRatio: AspectRatio;
  photographerCredit?: string;
}

export interface EditorialBlock {
  id: string;
  type: BlockType;
  order: number;
  heading?: string;
  bodyText?: string;
  images?: MediaAsset[]; // Max 1 for text_with_image & full_bleed_image; Exactly 2 for image_duo
  quote?: {
    text: string;
    author: string;
    role?: string;
  };
  designers?: {
    id: string;
    name: string;
    discipline: string;
    profileUrl?: string;
  }[];
}

export interface OperatingHours {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  open: string;  // "10:00" (24h format)
  close: string; // "17:00"
  isClosed: boolean;
}

export interface SimilarShopPreview {
  id: string;
  slug: string;
  name: string;
  precinct: string;
  thumbnailUrl: string;
}

export interface ShopProfile {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  city: 'Melbourne' | 'Sydney' | 'Brisbane' | 'Perth' | 'Adelaide' | 'Byron Bay' | 'Hobart';
  precinct: string; // e.g., "Fitzroy & Gertrude St"
  categories: string[];
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    formatted: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: OperatingHours[];
  contact: {
    websiteUrl?: string;
    instagramHandle?: string;
    phone?: string;
  };
  heroImage: MediaAsset;
  similarShops: SimilarShopPreview[]; // Max 6 items for 2x3 sidebar grid
  contentBlocks: EditorialBlock[];
  publishedAt: string;
  updatedAt: string;
}

