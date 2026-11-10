import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "h8nmncfh",
  api_key: process.env.CLOUDINARY_API_KEY || "558623275137998",
  api_secret: process.env.CLOUDINARY_API_SECRET || "-IKl0y_keBSp6-uSAnebqpXOzgw",
  secure: true,
});

export default cloudinary;

