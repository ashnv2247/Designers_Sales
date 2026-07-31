import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const cache = new Map();
export const isCloudinaryUrl = (value) => {
  try {
    return new URL(value).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};
export const stablePublicId = (
  source,
  root = process.env.CLOUDINARY_UPLOAD_FOLDER || "designer-sales",
) => {
  const normalized = source
    .replaceAll("\\", "/")
    .replace(/^.*?(src\/assets\/|public\/media\/)/, "")
    .replace(/\.[^.]+$/, "");
  return `${root.replace(/^\/|\/$/g, "")}/seed/${normalized}`
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .toLowerCase();
};
export function configureCloudinary(env = process.env) {
  for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"])
    if (!env[key]) throw new Error(`Missing ${key}`);
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}
export async function uploadSeedImage({ source, root = process.cwd(), required = true }) {
  if (!source) {
    if (required) throw new Error("Required image source is missing");
    return null;
  }
  if (isCloudinaryUrl(source)) return { publicId: null, secureUrl: source, reused: true };
  const key = source.replaceAll("\\", "/");
  if (cache.has(key)) return { ...cache.get(key), reused: true };
  const input = /^https?:\/\//.test(source) ? source : path.resolve(root, source);
  if (!/^https?:\/\//.test(input) && !fs.existsSync(input)) {
    if (required) throw new Error(`Image not found: ${source}`);
    return null;
  }
  const result = await configureCloudinary().uploader.upload(input, {
    public_id: stablePublicId(source),
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
  const value = {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    reused: false,
  };
  cache.set(key, value);
  return value;
}
export const resetUploadCache = () => cache.clear();
