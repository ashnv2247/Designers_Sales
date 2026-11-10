import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileToUpload: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";
      fileToUpload = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const json = await req.json();
      if (!json.image) {
        return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
      }
      fileToUpload = json.image;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileToUpload, {
      folder: "designersale",
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}

