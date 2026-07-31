import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";
export function ImageUploader({
  label,
  value,
  publicId,
  folder = "curated",
  onChange,
  onPublicIdChange,
}: {
  label: string;
  value?: string | null;
  publicId?: string | null;
  folder?: string;
  onChange: (v: string) => void;
  onPublicIdChange?: (v: string) => void;
}) {
  return (
    <CloudinaryImageUploader
      label={label}
      value={value}
      publicId={publicId}
      folder={folder}
      onChange={(image) => {
        onChange(image?.url ?? "");
        onPublicIdChange?.(image?.publicId ?? "");
      }}
    />
  );
}
