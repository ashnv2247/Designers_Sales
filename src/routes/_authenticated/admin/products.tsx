import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Check, Field, Panel, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { adminListProducts, adminUpdateProduct } from "@/lib/admin.functions";
import { adminCreateProduct, adminDeleteProduct, adminGetRefs } from "@/lib/admin-content.functions";

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
      { name: "description", content: "Create, edit, publish and feature pieces across the DesignerSale catalogue." },
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
  const create = useServerFn(adminCreateProduct);
  const remove = useServerFn(adminDeleteProduct);
  const getRefs = useServerFn(adminGetRefs);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data, isPending, error } = useQuery({ queryKey: ["admin-products"], queryFn: () => list({}) });
  const { data: refs } = useQuery({ queryKey: ["admin-refs"], queryFn: () => getRefs({}) });

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

  const createMut = useMutation({
    mutationFn: (vars: any) => create({ data: vars }),
    onSuccess: (row: any) => {
      toast.success("Piece created");
      setShowNew(false);
      setOpenId(row?.id ?? null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not create that piece"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Piece deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete that piece"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading catalogue…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load the catalogue.</p>;

  const rows = (data as any[]).filter((p) =>
    q.trim() ? p.name.toLowerCase().includes(q.trim().toLowerCase()) : true,
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pieces"
          aria-label="Search pieces"
          className="w-full max-w-sm border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
        />
        <Btn onClick={() => setShowNew((v) => !v)}>{showNew ? "Close" : "New piece"}</Btn>
      </div>

      {showNew && refs && (
        <Panel title="New piece">
          <form
            className="grid gap-5 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget as HTMLFormElement);
              createMut.mutate({
                name: String(f.get("name")),
                merchant_id: String(f.get("merchant_id")),
                brand_id: String(f.get("brand_id") ?? ""),
                category_id: String(f.get("category_id") ?? ""),
                short_description: String(f.get("short_description") ?? ""),
                description: String(f.get("description") ?? ""),
                condition: String(f.get("condition")),
                status: String(f.get("status")),
                is_featured: f.get("is_featured") === "on",
                is_new_arrival: f.get("is_new_arrival") === "on",
              });
            }}
          >
            <Field label="Name">
              <TextInput name="name" required />
            </Field>
            <Field label="Merchant">
              <SelectInput name="merchant_id" required defaultValue="">
                <option value="" disabled>
                  Select a merchant
                </option>
                {(refs as any).merchants.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Brand">
              <SelectInput name="brand_id" defaultValue="">
                <option value="">None</option>
                {(refs as any).brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Category">
              <SelectInput name="category_id" defaultValue="">
                <option value="">None</option>
                {(refs as any).categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Condition">
              <SelectInput name="condition" defaultValue="new">
                {["new", "new_with_tags", "new_without_tags", "excellent", "very_good", "good", "fair"].map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput name="status" defaultValue="draft">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LABEL[s]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <div className="md:col-span-2">
              <Field label="Short description">
                <TextInput name="short_description" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description">
                <TextArea name="description" />
              </Field>
            </div>
            <div className="flex items-center gap-6 md:col-span-2">
              <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                <input type="checkbox" name="is_featured" /> Featured
              </label>
              <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                <input type="checkbox" name="is_new_arrival" /> New arrival
              </label>
            </div>
            <div className="md:col-span-2">
              <Btn type="submit" disabled={createMut.isPending}>
                Create piece
              </Btn>
            </div>
          </form>
        </Panel>
      )}

      {rows.length === 0 && <p className="text-sm text-muted-foreground">No pieces match.</p>}
      <ul className="border-t border-border">
        {rows.map((p) => {
          const variant = (p.product_variants ?? [])[0];
          return (
            <li key={p.id} className="border-b border-border py-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm">{p.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.merchants?.name ?? "No merchant"}
                    {variant
                      ? ` · ${variant.currency ?? "AUD"} ${variant.discounted_price ?? variant.original_price} · ${variant.stock_quantity} in stock`
                      : " · no variants yet"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <Check
                    label="Featured"
                    checked={Boolean(p.is_featured)}
                    onChange={(v) => mutation.mutate({ id: p.id, is_featured: v })}
                  />
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
                  <Btn variant="ghost" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                    {openId === p.id ? "Close" : "Edit"}
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => {
                      if (confirm(`Delete ${p.name}? This cannot be undone.`)) deleteMut.mutate(p.id);
                    }}
                  >
                    Delete
                  </Btn>
                </div>
              </div>
              {openId === p.id && refs && <ProductEditor productId={p.id} refs={refs as any} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}
