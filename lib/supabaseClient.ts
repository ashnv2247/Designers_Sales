import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Checks if local/remote Supabase connection is active and responsive
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes("dummy")) {
    return false;
  }
  try {
    const { error } = await supabase.from("boutiques").select("id").limit(1);
    return !error;
  } catch (e) {
    return false;
  }
}

