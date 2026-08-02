/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProductOption = {
  id: string;
  name: string;
  hex: string | null;
  isDefault: boolean;
  isAvailable: boolean;
  sizes: Array<{ name: string; available: boolean; stock: number }>;
  images: Array<{
    url: string;
    publicId: string | null;
    isPrimary: boolean;
    displayOrder: number;
  }>;
};

/** Builds the legacy UI option shape from the normalized variant/image tables. */
export function normalizedProductOptions(product: any): ProductOption[] {
  const variants = (product?.product_variants ?? []).filter(
    (variant: any) => variant.is_active && variant.original_price != null,
  );
  const images = product?.product_images ?? [];
  const colors = new Map<string, any[]>();

  for (const variant of variants) {
    const name = variant.color_name || "Default";
    colors.set(name, [...(colors.get(name) ?? []), variant]);
  }

  return [...colors.entries()].map(([name, colorVariants], index) => {
    const colorImages = images
      .filter((image: any) => !image.color_name || image.color_name === name)
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return {
      id: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      name,
      hex: colorVariants.find((variant: any) => variant.color_hex)?.color_hex ?? null,
      isDefault: index === 0,
      isAvailable: colorVariants.some((variant: any) => (variant.stock_quantity ?? 0) > 0),
      sizes: colorVariants.map((variant: any) => ({
        name: variant.size,
        available: (variant.stock_quantity ?? 0) > 0,
        stock: variant.stock_quantity ?? 0,
      })),
      images: colorImages.map((image: any) => ({
        url: image.image_url,
        publicId: image.image_public_id ?? null,
        isPrimary: Boolean(image.is_primary),
        displayOrder: image.display_order ?? 0,
      })),
    };
  });
}

export function withNormalizedOptions<T extends Record<string, any>>(
  product: T,
): T & {
  options: ProductOption[];
} {
  return { ...product, options: normalizedProductOptions(product) };
}
