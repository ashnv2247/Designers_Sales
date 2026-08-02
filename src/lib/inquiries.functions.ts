import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
        email: z.string().trim().email("Invalid email address").max(255),
        subject: z.string().trim().min(2).max(200).default("General Inquiry"),
        message: z.string().trim().min(5, "Message must be at least 5 characters").max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("contact_inquiries" as any).insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true, message: "Inquiry received" };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().trim().email("Invalid email address").max(255),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb
      .from("newsletter_subscribers" as any)
      .upsert({ email: data.email, status: "subscribed" }, { onConflict: "email" });
    if (error) throw new Error(error.message);
    return { ok: true, message: "Subscribed successfully" };
  });
