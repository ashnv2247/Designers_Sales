import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase URL
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

/**
 * Modern Publishable Key (replaces deprecated NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * Safe to use in browser / public contexts with Row Level Security (RLS) configured.
 */
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/**
 * Modern Secret Key (replaces deprecated SUPABASE_SERVICE_ROLE_KEY)
 * Privileged access key for server, functions, and admin operations.
 * Never exposed to the browser.
 */
export const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/**
 * Standard public Supabase client using the Publishable key (or legacy anon key)
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabasePublishableKey || "sb_publishable_placeholder",
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Privileged server-side Supabase client using the Secret key (or service role key).
 * Falls back to publishable key if secret key is not configured.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseSecretKey || supabasePublishableKey || "sb_secret_placeholder",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Checks if local/remote Supabase connection is active and responsive.
 * Validates presence of modern Publishable/Secret keys or legacy keys.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  const activeKey = supabaseSecretKey || supabasePublishableKey;
  if (
    !supabaseUrl ||
    !activeKey ||
    activeKey.includes("dummy") ||
    activeKey.includes("placeholder") ||
    activeKey.includes("your_")
  ) {
    return false;
  }
  try {
    // Prefer privileged admin client on the server to avoid RLS block during health-check
    const clientToTest = supabaseSecretKey ? supabaseAdmin : supabase;
    const { error } = await clientToTest.from("boutiques").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}
