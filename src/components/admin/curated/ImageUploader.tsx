import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";
import type { CloudinaryEntityType } from "@/lib/cloudinary-config";
export function ImageUploader({
  label,
  value,
  publicId,
  entityType = "collection",
  onChange,
  onPublicIdChange,
}: {
  label: string;
  value?: string | null;
  publicId?: string | null;
  entityType?: CloudinaryEntityType;
  onChange: (v: string) => void;
  onPublicIdChange?: (v: string) => void;
}) {
  return (
    <CloudinaryImageUploader
      label={label}
      value={value}
      publicId={publicId}
      entityType={entityType}
      onChange={(image) => {
        onChange(image?.url ?? "");
        onPublicIdChange?.(image?.publicId ?? "");
      }}
    />
  );
}
