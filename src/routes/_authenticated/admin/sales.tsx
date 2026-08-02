import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminCreateSale,
  adminDeleteSale,
  adminEditSale,
  adminGetRefs,
  adminListSales,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";
import {
  SalePricingManager,
  type SaleProductFormValue,
} from "@/components/admin/SalePricingManager";

export const Route = createFileRoute("/_authenticated/admin/sales")({
  head: () => ({
    meta: [
      { title: "Admin Sales | DesignerSale" },
      {
        name: "description",
        content: "Create and schedule sale events across the DesignerSale marketplace.",
      },
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
  products,
  onSubmit,
  pending,
  submitLabel,
}: {
  sale?: any;
  merchants: any[];
  products: any[];
  onSubmit: (v: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [banner, setBanner] = useState({
    url: sale?.banner_image_url ?? "",
    publicId: sale?.banner_image_public_id ?? "",
  });

  const [merchantId, setMerchantId] = useState(sale?.merchant_id ?? "");

  const [saleProducts, setSaleProducts] = useState<SaleProductFormValue[]>([]);

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          description: String(f.get("description") ?? ""),
          merchant_id: merchantId || null,
          banner_image_url: banner.url,
          banner_image_public_id: banner.publicId,
          starts_at: String(f.get("starts_at") ?? ""),
          ends_at: String(f.get("ends_at") ?? ""),
          is_active: f.get("is_active") === "on",
          is_featured: f.get("is_featured") === "on",
          products: saleProducts,
        });
      }}
    >
      <Field label="Name">
        <TextInput name="name" defaultValue={sale?.name ?? ""} required />
      </Field>
      <Field label="Merchant">
        <SelectInput
          name="merchant_id"
          value={merchantId}
          onChange={(e) => {
            setMerchantId(e.target.value);
          }}
        >
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
        <CloudinaryImageUploader
          label="Banner image"
          entityType="sale"
          value={banner.url}
          publicId={banner.publicId}
          onChange={(v) => setBanner({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
      </div>
      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={sale?.description ?? ""} />
        </Field>
      </div>

      <SalePricingManager
        products={products}
        existing={sale?.sale_products ?? []}
        merchantId={merchantId}
        onChange={setSaleProducts}
      />

      <div className="flex items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={sale ? Boolean(sale.is_active) : true}
          />{" "}
          Active
        </label>
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input type="checkbox" name="is_featured" defaultChecked={Boolean(sale?.is_featured)} />{" "}
          Featured
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
  const [editingSale, setEditingSale] = useState<any | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => list({}),
  });
  const { data: refs } = useQuery({ queryKey: ["admin-refs"], queryFn: () => getRefs({}) });
  const merchants = ((refs as any)?.merchants ?? []) as any[];
  const products = ((refs as any)?.products ?? []) as any[];

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
      setEditingSale(null);
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
  if (error || !data)
    return <p className="text-sm text-muted-foreground">We couldn't load sales.</p>;

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-lg font-serif">Sale Events</h2>
        <Btn onClick={() => setShowNew(true)}>+ New sale</Btn>
      </div>

      {/* Create Sale Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create New Sale Event"
        description="Schedule a promotional clearance or event for products and merchants."
      >
        <SaleForm
          merchants={merchants}
          products={products}
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Create Sale Event"
        />
      </AdminModal>

      {/* Edit Sale Modal */}
      <AdminModal
        open={Boolean(editingSale)}
        onOpenChange={(open) => {
          if (!open) setEditingSale(null);
        }}
        title={`Edit Sale — ${editingSale?.name ?? ""}`}
        description="Update sale dates, featured status, and included products."
      >
        {editingSale && (
          <SaleForm
            sale={editingSale}
            merchants={merchants}
            products={products}
            onSubmit={(v) => editMut.mutate({ id: editingSale.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Changes"
          />
        )}
      </AdminModal>

      {(data as any[]).length === 0 && (
        <p className="text-sm text-muted-foreground">No sales yet.</p>
      )}

      <ul className="border-t border-border">
        {(data as any[]).map((s) => (
          <li key={s.id} className="border-b border-border py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.merchants?.name ?? "All merchants"} · {s.is_active ? "Active" : "Inactive"}
                  {s.ends_at ? ` · ends ${new Date(s.ends_at).toLocaleDateString()}` : ""}
                  {s.sale_products?.length > 0 && ` · ${s.sale_products.length} products`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Btn variant="ghost" onClick={() => setEditingSale(s)}>
                  Edit
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
          </li>
        ))}
      </ul>
    </>
  );
}
