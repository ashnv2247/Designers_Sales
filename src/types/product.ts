import type { Database } from "@/integrations/supabase/types";

export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
export type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type DbProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type DbMerchant = Database["public"]["Tables"]["merchants"]["Row"];
export type DbBrand = Database["public"]["Tables"]["brands"]["Row"];
export type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
export type DbProductType = Database["public"]["Tables"]["product_types"]["Row"];

export type Product = DbProduct;
export type ProductVariant = DbProductVariant;
export type ProductImage = DbProductImage;

export type ProductWithRelations = Product & {
  merchants: DbMerchant | null;
  brands: DbBrand | null;
  categories: DbCategory | null;
  product_types: DbProductType | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
};

export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];

export type CartItemWithDetails = CartItem & {
  products: Product;
  product_variants: ProductVariant;
  product_images?: ProductImage | null;
};
