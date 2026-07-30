export type AdminCtx = { supabase: any; userId: string };

/** Verifies the caller holds the `admin` role in public.user_roles. */
export async function assertAdmin(context: AdminCtx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify permissions");
  if (!data) throw new Error("Forbidden");
}
