import { v2 as cloudinary } from "cloudinary";
import {
  generateCloudinaryPublicId,
  getCloudinaryFolder,
  type CloudinaryEntityType,
} from "./cloudinary-config";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: required("CLOUDINARY_CLOUD_NAME"),
    api_key: required("CLOUDINARY_API_KEY"),
    api_secret: required("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  return cloudinary;
}

export function signCloudinaryUpload(input: {
  entityType: CloudinaryEntityType;
  entityId?: string;
  imageId?: string;
  fileName?: string;
}) {
  const client = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getCloudinaryFolder(input.entityType);
  const publicId = generateCloudinaryPublicId(input);
  const params = { timestamp, folder, public_id: publicId };
  return {
    timestamp,
    folder,
    publicId,
    signature: client.utils.api_sign_request(params, required("CLOUDINARY_API_SECRET")),
    apiKey: required("CLOUDINARY_API_KEY"),
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
  };
}

export async function destroyCloudinaryImage(publicId: string) {
  const result = await configureCloudinary().uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
  if (!["ok", "not found"].includes(result.result)) {
    throw new Error(`Cloudinary could not delete ${publicId}: ${result.result}`);
  }
  return result;
}
