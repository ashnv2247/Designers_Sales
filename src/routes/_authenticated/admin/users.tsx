import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminListUsers, adminSetUserRole } from "@/lib/admin.functions";

const ROLES = ["customer", "merchant", "editor", "admin"] as const;

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin Users & Roles | DesignerSale" },
      {
        name: "description",
        content: "Grant or revoke customer, merchant, editor and admin access.",
      },
      { property: "og:title", content: "Admin Users & Roles | DesignerSale" },
      {
        property: "og:description",
        content: "Manage who can access DesignerSale and at what level.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetUserRole);
  const qc = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => list({}),
  });

  const mutation = useMutation({
    mutationFn: (vars: { userId: string; role: (typeof ROLES)[number]; grant: boolean }) =>
      setRole({ data: vars }),
    onSuccess: () => {
      toast.success("Roles updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update roles"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading people…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">We couldn't load the user list.</p>;

  return (
    <ul className="border-t border-border">
      {data.map((u) => (
        <li
          key={u.id}
          className="grid gap-4 border-b border-border py-5 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="text-sm">{u.email || "No email"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {new Date(u.createdAt).toLocaleDateString()}
              {u.lastSignInAt
                ? ` · last seen ${new Date(u.lastSignInAt).toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {ROLES.map((r) => {
              const has = u.roles.includes(r);
              return (
                <label
                  key={r}
                  className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    checked={has}
                    disabled={mutation.isPending}
                    onChange={(e) =>
                      mutation.mutate({ userId: u.id, role: r, grant: e.target.checked })
                    }
                  />
                  {r}
                </label>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
