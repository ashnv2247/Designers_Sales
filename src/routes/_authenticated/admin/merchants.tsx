import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminListMerchants, adminUpdateMerchant } from "@/lib/admin.functions";

const STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
const LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const Route = createFileRoute("/_authenticated/admin/merchants")({
  head: () => ({
    meta: [
      { title: "Admin Merchants | DesignerSale" },
      { name: "description", content: "Approve, suspend and manage the boutiques selling on DesignerSale." },
      { property: "og:title", content: "Admin Merchants | DesignerSale" },
      { property: "og:description", content: "Approve and manage DesignerSale boutiques." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminMerchants,
});

function AdminMerchants() {
  const list = useServerFn(adminListMerchants);
  const update = useServerFn(adminUpdateMerchant);
  const qc = useQueryClient();

  const { data, isPending, error } = useQuery({ queryKey: ["admin-merchants"], queryFn: () => list({}) });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status?: (typeof STATUSES)[number]; is_active?: boolean }) =>
      update({ data: vars }),
    onSuccess: () => {
      toast.success("Merchant updated");
      qc.invalidateQueries({ queryKey: ["admin-merchants"] });
      qc.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: () => toast.error("Could not update that merchant"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading merchants…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load merchants.</p>;
  if ((data as any[]).length === 0)
    return <p className="text-sm text-muted-foreground">No merchants yet.</p>;

  return (
    <ul className="border-t border-border">
      {(data as any[]).map((m) => (
        <li key={m.id} className="grid gap-4 border-b border-border py-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm">{m.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {[m.city, m.country].filter(Boolean).join(", ") || "Location not set"}
              {m.email ? ` · ${m.email}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(m.is_active)}
                onChange={(e) => mutation.mutate({ id: m.id, is_active: e.target.checked })}
              />
              Active
            </label>
            <select
              aria-label={`Status for ${m.name}`}
              value={m.status}
              disabled={mutation.isPending}
              onChange={(e) =>
                mutation.mutate({ id: m.id, status: e.target.value as (typeof STATUSES)[number] })
              }
              className="border border-border bg-transparent px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </li>
      ))}
    </ul>
  );
}
