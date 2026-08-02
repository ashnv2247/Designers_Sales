import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const userId = context.userId;

    const [userRes, addrRes] = await Promise.all([
      sb.from("users").select("*").eq("id", userId).single(),
      sb
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (userRes.error && userRes.error.code !== "PGRST116") {
      throw new Error(userRes.error.message);
    }

    return {
      profile: userRes.data ?? null,
      addresses: addrRes.data ?? [],
    };
  });

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        first_name: z.string().trim().max(100).optional(),
        last_name: z.string().trim().max(100).optional(),
        display_name: z.string().trim().max(150).optional(),
        phone: z.string().trim().max(30).optional(),
        avatar_url: z.string().trim().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const userId = context.userId;

    const patch: Record<string, string | undefined> = {};
    if (data.first_name !== undefined) patch.first_name = data.first_name;
    if (data.last_name !== undefined) patch.last_name = data.last_name;
    if (data.display_name !== undefined) patch.display_name = data.display_name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url;

    const { error } = await sb.from("users").upsert({ id: userId, ...patch }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true, message: "Profile updated" };
  });

export const addUserAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        label: z.string().trim().max(50).optional(),
        full_name: z.string().trim().min(2, "Full name required").max(150),
        phone: z.string().trim().max(30).optional(),
        address_line_1: z.string().trim().min(3, "Address required").max(255),
        address_line_2: z.string().trim().max(255).optional(),
        city: z.string().trim().min(2, "City required").max(100),
        state: z.string().trim().max(100).optional(),
        postal_code: z.string().trim().min(2, "Postcode required").max(30),
        country: z.string().trim().max(100).default("Australia"),
        is_default: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const userId = context.userId;

    if (data.is_default) {
      await sb.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
    }

    const { error } = await sb.from("user_addresses").insert({
      user_id: userId,
      label: data.label,
      full_name: data.full_name,
      phone: data.phone,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      is_default: data.is_default,
    });

    if (error) throw new Error(error.message);
    return { ok: true, message: "Address added" };
  });

export const deleteUserAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { error } = await sb.from("user_addresses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, message: "Address deleted" };
  });
