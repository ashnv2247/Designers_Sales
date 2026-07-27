import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Panel, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import {
  adminCreateSale,
  adminDeleteSale,
  adminEditSale,
  adminGetRefs,
  adminListSales,
} from "@/lib/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/sales")({
  head: () => ({
    meta: [
      { title: "Admin Sales | DesignerSale" },
      { name: "description", content: "Create and schedule sale events across the DesignerSale marketplace." },
      { property: "og:title", content: "Admin Sales | DesignerSale" },
      { property: "og:description", content: "Schedule and manage DesignerSale sale events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSales,
});

function SaleForm({
  sale,
  merchants,
  onSubmit,
  pending,
  submitLabel,
}: {
  sale?: any;
  merchants: any[];
  onSubmit: (v: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          description: String(f.get("description") ?? ""),
          merchant_id: String(f.get("merchant_id") ?? ""),
          banner_image_url: String(f.get("banner_image_url") ?? ""),
          starts_at: String(f.get("starts_at") ?? ""),
          ends_at: String(f.get("ends_at") ?? ""),
          is_active: f.get("is_active") === "on",
          is_featured: f.get("is_featured") === "on",
        });
      }}
    >
      <Field label="Name">
        <TextInput name="name" defaultValue={sale?.name ?? ""} required />
      </Field>
      <Field label="Merchant">
        <SelectInput name="merchant_id" defaultValue={sale?.merchant_id ?? ""}>
          <option value="">All merchants</option>
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Starts">
        <TextInput
          name="starts_at"
          type="datetime-local"
          defaultValue={sale?.starts_at ? String(sale.starts_at).slice(0, 16) : ""}
        />
      </Field>
      <Field label="Ends">
        <TextInput
          name="ends_at"
          type="datetime-local"
          defaultValue={sale?.ends_at ? String(sale.ends_at).slice(0, 16) : ""}
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Banner image URL">
          <TextInput name="banner_image_url" defaultValue={sale?.banner_image_url ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={sale?.description ?? ""} />
        </Field>
      </div>
      <div className="flex items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input type="checkbox" name="is_active" defaultChecked={sale ? Boolean(sale.is_active) : true} /> Active
        </label>
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input type="checkbox" name="is_featured" defaultChecked={Boolean(sale?.is_featured)} /> Featured
        </label>
      </div>
      <div className="md:col-span-2">
        <Btn type="submit" disabled={pending}>
          {submitLabel}
        </Btn>
      </div>
    </form>
  );
}

function AdminSales() {
  const list = useServerFn(adminListSales);
  const create = useServerFn(adminCreateSale);
  const edit = useServerFn(adminEditSale);
  const remove = useServerFn(adminDeleteSale);
  const getRefs = useServerFn(adminGetRefs);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isPending, error } = useQuery({ queryKey: ["admin-sales"], queryFn: () => list({}) });
  const { data: refs } = useQuery({ queryKey: ["admin-refs"], queryFn: () => getRefs({}) });
  const merchants = ((refs as any)?.merchants ?? []) as any[];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-sales"] });

  const createMut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => {
      toast.success("Sale created");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not create that sale"),
  });

  const editMut = useMutation({
    mutationFn: (v: any) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Sale saved");
      setOpenId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save that sale"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Sale deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete that sale"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading sales…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load sales.</p>;

  return (
    <>
      <div className="mb-8">
        <Btn onClick={() => setShowNew((v) => !v)}>{showNew ? "Close" : "New sale"}</Btn>
      </div>

      {showNew && (
        <Panel title="New sale">
          <SaleForm
            merchants={merchants}
            onSubmit={(v) => createMut.mutate(v)}
            pending={createMut.isPending}
            submitLabel="Create sale"
          />
        </Panel>
      )}

      {(data as any[]).length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}

      <ul className="border-t border-border">
        {(data as any[]).map((s) => (
          <li key={s.id} className="border-b border-border py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.merchants?.name ?? "All merchants"} · {s.is_active ? "Active" : "Inactive"}
                  {s.ends_at ? ` · ends ${new Date(s.ends_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Btn variant="ghost" onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                  {openId === s.id ? "Close" : "Edit"}
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete ${s.name}?`)) deleteMut.mutate(s.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
            {openId === s.id && (
              <div className="mt-6 border-t border-dashed border-border pt-6">
                <SaleForm
                  sale={s}
                  merchants={merchants}
                  onSubmit={(v) => editMut.mutate({ id: s.id, ...v })}
                  pending={editMut.isPending}
                  submitLabel="Save sale"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
