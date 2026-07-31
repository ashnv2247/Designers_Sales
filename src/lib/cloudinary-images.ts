export type CloudinaryPreset = "card" | "detail" | "logo" | "banner";
const transformations: Record<CloudinaryPreset, string> = {
  card: "f_auto,q_auto,c_fill,w_600,h_750",
  detail: "f_auto,q_auto,c_limit,w_1600",
  logo: "f_auto,q_auto,c_fit,w_400,h_400",
  banner: "f_auto,q_auto,c_fill,w_1200,h_1500",
};

export function isCloudinaryUrl(value: string) {
  try {
    return new URL(value).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function getCloudinaryImageUrl(value: string, preset: CloudinaryPreset) {
  if (!isCloudinaryUrl(value)) return value;
  return value.replace("/image/upload/", `/image/upload/${transformations[preset]}/`);
}
