/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminSignCloudinaryUpload } from "@/lib/cloudinary.functions";
import type { CloudinaryEntityType } from "@/lib/cloudinary-config";

export type UploadedCloudinaryImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};
export function CloudinaryImageUploader({
  label,
  value,
  publicId,
  entityType,
  entityId,
  onChange,
}: {
  label: string;
  value?: string | null;
  publicId?: string | null;
  entityType: CloudinaryEntityType;
  entityId?: string;
  onChange: (image: UploadedCloudinaryImage | null) => void;
}) {
  const sign = useServerFn(adminSignCloudinaryUpload),
    ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null),
    [progress, setProgress] = useState(0),
    [busy, setBusy] = useState(false);
  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return toast.error("Use a JPEG, PNG, or WebP image");
    if (file.size > 10 * 1024 * 1024) return toast.error("Images must be 10 MB or smaller");
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);
    try {
      const signed = await sign({
        data: { entityType, entityId, imageId: crypto.randomUUID(), fileName: file.name },
      });
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = () => reject(new Error("Network error while uploading image"));
        xhr.onload = () => {
          const body = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) resolve(body);
          else reject(new Error(body.error?.message || "Cloudinary upload failed"));
        };
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", signed.apiKey);
        body.append("timestamp", String(signed.timestamp));
        body.append("signature", signed.signature);
        body.append("folder", signed.folder);
        body.append("public_id", signed.publicId);
        xhr.send(body);
      });
      setPreview(result.secure_url);
      onChange({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
      toast.success("Image uploaded");
    } catch (error) {
      setPreview(value ?? null);
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      URL.revokeObjectURL(local);
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <p className="text-sm">{label}</p>
      {preview ? (
        <img src={preview} alt="" className="h-36 w-full rounded-md border object-cover" />
      ) : (
        <div className="grid h-36 place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
          No image
        </div>
      )}
      {busy && (
        <div className="h-1 overflow-hidden rounded bg-muted">
          <div className="h-full bg-foreground" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border px-3 py-1.5 text-xs"
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          {preview ? "Replace" : "Upload"}
        </button>
        {preview && (
          <button
            type="button"
            className="text-xs text-destructive"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
          >
            Remove
          </button>
        )}
      </div>
      {publicId && <p className="truncate text-[10px] text-muted-foreground">{publicId}</p>}
      <input
        ref={ref}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
    </div>
  );
}
