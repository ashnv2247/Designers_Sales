import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, Grid } from "lucide-react";

import { Btn, Field, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { Card, PageHeader } from "@/components/admin/kit";
import {
  adminCreateProductType,
  adminDeleteProductType,
  adminEditProductType,
  adminListCategories,
  adminListProductTypes,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

export const Route = createFileRoute("/_authenticated/admin/product-types")({
  head: () => ({
    meta: [
      { title: "Admin Product Types | DesignerSale" },
      { name: "description", content: "Manage boutique product types on DesignerSale." },
    ],
  }),
  component: AdminProductTypes,
});

function ProductTypeForm({
  productType,
  categories,
  onSubmit,
  pending,
  submitLabel,
}: {
  productType?: any;
  categories: any[];
  onSubmit: (values: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [image, setImage] = useState({
    url: productType?.image_url ?? "",
    publicId: productType?.image_public_id ?? "",
  });

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          category_id: f.get("category_id") || null,
          description: String(f.get("description") ?? ""),
          display_order: Number(f.get("display_order") || 0),
          image_url: image.url || null,
          image_public_id: image.publicId || null,
          is_active: f.get("is_active") === "on",
        });
      }}
    >
      <Field label="Product Type Name">
        <TextInput name="name" defaultValue={productType?.name ?? ""} required />
      </Field>
      <Field label="Associated Category">
        <SelectInput name="category_id" defaultValue={productType?.category_id ?? ""}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Display Order">
        <TextInput
          name="display_order"
          type="number"
          defaultValue={String(productType?.display_order ?? 0)}
        />
      </Field>
      <div className="flex items-center gap-6 pt-4">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={productType ? Boolean(productType.is_active) : true}
          />
          Active
        </label>
      </div>

      <div className="md:col-span-2">
        <CloudinaryImageUploader
          label="Product Type Image"
          entityType="category"
          value={image.url}
          publicId={image.publicId}
          onChange={(v) => setImage({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
      </div>

      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={productType?.description ?? ""} rows={3} />
        </Field>
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-border mt-4">
        <Btn type="submit" disabled={pending}>
          {submitLabel}
        </Btn>
      </div>
    </form>
  );
}

function AdminProductTypes() {
  const list = useServerFn(adminListProductTypes);
  const listCategories = useServerFn(adminListCategories);
  const create = useServerFn(adminCreateProductType);
  const edit = useServerFn(adminEditProductType);
  const remove = useServerFn(adminDeleteProductType);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);

  const {
    data: productTypes,
    isPending,
    error,
  } = useQuery({
    queryKey: ["admin-product-types"],
    queryFn: () => list({}),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCategories({}),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-product-types"] });
    qc.invalidateQueries({ queryKey: ["admin-refs"] });
  };

  const createMut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => {
      toast.success("Product type created successfully");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create product type"),
  });

  const editMut = useMutation({
    mutationFn: (v: any) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Product type saved successfully");
      setEditingType(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save product type"),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Product type active status updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update product type"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product type deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete product type"),
  });

  const listData = productTypes ?? [];
  const categoriesList = categories ?? [];

  const filtered = listData.filter((t: any) => {
    const matchesSearch = search.trim()
      ? t.name.toLowerCase().includes(search.trim().toLowerCase())
      : true;
    const matchesCategory = categoryFilter ? t.category_id === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <PageHeader
        title="Product Types"
        description="Define garment classifications, dress lengths, top types, sample structures, and tags."
        actions={
          <Btn onClick={() => setShowNew(true)}>
            <span className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> New Product Type
            </span>
          </Btn>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product types..."
            aria-label="Search product types"
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create Product Type"
        description="Add a specific design categorization line item."
      >
        <ProductTypeForm
          categories={categoriesList}
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Create Product Type"
        />
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        open={Boolean(editingType)}
        onOpenChange={(open) => {
          if (!open) setEditingType(null);
        }}
        title={`Edit Product Type — ${editingType?.name ?? ""}`}
        description="Update type details, layout settings, and images."
      >
        {editingType && (
          <ProductTypeForm
            productType={editingType}
            categories={categoriesList}
            onSubmit={(v) => editMut.mutate({ id: editingType.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Changes"
          />
        )}
      </AdminModal>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading product types...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load product types.</p>
      ) : filtered.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">
              No product types found.
            </p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Associated Category</th>
                  <th className="px-6 py-3">Display Order</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt=""
                          className="h-8 w-12 object-cover rounded border border-border/40"
                        />
                      ) : (
                        <div className="h-8 w-12 bg-muted text-[10px] text-muted-foreground flex items-center justify-center rounded border border-dashed border-border/40">
                          <Grid className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium">{t.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {t.categories?.name ?? "None"}
                    </td>
                    <td className="px-6 py-3">{t.display_order}</td>
                    <td className="px-6 py-3">{t.products?.[0]?.count ?? 0} pieces</td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Toggle active for ${t.name}`}
                        checked={t.is_active}
                        disabled={toggleMut.isPending}
                        onChange={(e) =>
                          toggleMut.mutate({ id: t.id, is_active: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingType(t)}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Edit product type"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete Product Type: "${t.name}"? This will check constraints.`,
                              )
                            ) {
                              deleteMut.mutate(t.id);
                            }
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Delete product type"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
