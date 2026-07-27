import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { adminListProducts, adminUpdateProduct } from "@/lib/admin.functions";

const STATUSES = ["draft", "published", "archived", "sold_out"] as const;
const LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  sold_out: "Sold out",
};

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Admin Catalogue | DesignerSale" },
      { name: "description", content: "Publish, archive and feature pieces across the DesignerSale catalogue." },
      { property: "og:title", content: "Admin Catalogue | DesignerSale" },
      { property: "og:description", content: "Manage the DesignerSale product catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const list = useServerFn(adminListProducts);
  const update = useServerFn(adminUpdateProduct);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isPending, error } = useQuery({ queryKey: ["admin-products"], queryFn: () => list({}) });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status?: (typeof STATUSES)[number]; is_featured?: boolean }) =>
      update({ data: vars }),
    onSuccess: () => {
      toast.success("Product updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: () => toast.error("Could not update that product"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading catalogue…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load the catalogue.</p>;

  const rows = (data as any[]).filter((p) =>
    q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true,
  );

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search pieces"
        aria-label="Search pieces"
        className="mb-8 w-full max-w-sm border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
      />
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No pieces match.</p>}
      <ul className="border-t border-border">
        {rows.map((p) => {
          const variant = (p.product_variants ?? [])[0];
          return (
            <li
              key={p.id}
              className="grid gap-4 border-b border-border py-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="text-sm">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.merchants?.name ?? "No merchant"}
                  {variant
                    ? ` · ${variant.currency ?? "AUD"} ${variant.discounted_price ?? variant.original_price} · ${variant.stock_quantity} in stock`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(p.is_featured)}
                    onChange={(e) => mutation.mutate({ id: p.id, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
                <select
                  aria-label={`Status for ${p.name}`}
                  value={p.status}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    mutation.mutate({ id: p.id, status: e.target.value as (typeof STATUSES)[number] })
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
          );
        })}
      </ul>
    </>
  );
}
