import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { getMyAdminAccess } from "@/lib/admin.functions";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(getMyAdminAccess);
  const { data, isPending } = useQuery({ queryKey: ["admin-access"], queryFn: () => check({}) });
  const { user } = useSession();
  const email = user?.email ?? null;


  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="mt-4 text-lg font-semibold">Administrators only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have the admin role. If you believe this is a mistake, contact the
            store owner.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-foreground px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-background"
          >
            Back to the store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShell email={email}>
      <Outlet />
    </AdminShell>
  );
}
