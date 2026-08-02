/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin-guard.server";

const publicId = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-zA-Z0-9/_-]+$/)
  .refine((value) => !value.includes(".."), "Invalid public ID");

export const adminSignCloudinaryUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entityType: z.enum([
          "banner",
          "category",
          "collection",
          "designer",
          "product",
          "sale",
          "seed",
          "variant",
        ]),
        entityId: z.string().trim().max(180).optional(),
        imageId: z.string().trim().max(180).optional(),
        fileName: z.string().trim().max(255).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { signCloudinaryUpload } = await import("./cloudinary.server");
    return signCloudinaryUpload(data);
  });

export const adminDeleteCloudinaryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ publicId }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { destroyCloudinaryImage } = await import("./cloudinary.server");
    await destroyCloudinaryImage(data.publicId);
    return { ok: true };
  });
