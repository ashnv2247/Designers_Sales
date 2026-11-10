export interface Product {
  id: string;
  boutiqueId: string;
  boutiqueName?: string;
  name: string;
  designer: string;
  category: "Apparel" | "Ceramics" | "Leather Goods" | "Books" | "Fragrance" | "Objects";
  price: number;
  currency: string;
  image: string;
  description: string;
  inStock: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

