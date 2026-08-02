export const CLOUDINARY_FOLDERS = {
  banner: "designer-sales/banners",
  category: "designer-sales/categories",
  collection: "designer-sales/collections",
  designer: "designer-sales/designers",
  product: "designer-sales/products",
  sale: "designer-sales/sales",
  seed: "designer-sales/seed",
  variant: "designer-sales/variants",
} as const;

export type CloudinaryEntityType = keyof typeof CLOUDINARY_FOLDERS;

export function getCloudinaryFolder(entityType: CloudinaryEntityType): string {
  const folder = CLOUDINARY_FOLDERS[entityType];
  if (!folder) throw new Error("Unsupported Cloudinary entity type");
  return folder;
}

export function generateCloudinaryPublicId({
  entityId,
  imageId,
  fileName,
}: {
  entityId?: string;
  imageId?: string;
  fileName?: string;
}) {
  const safeParts = [entityId, imageId, fileName?.replace(/\.[^/.]+$/, "")]
    .filter(Boolean)
    .map((value) =>
      String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean);

  return safeParts.join("-") || crypto.randomUUID();
}
