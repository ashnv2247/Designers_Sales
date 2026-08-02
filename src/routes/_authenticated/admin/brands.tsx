import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, ExternalLink } from "lucide-react";

import { Btn, Field, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import {
  adminCreateBrand,
  adminDeleteBrand,
  adminEditBrand,
  adminListBrands,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

export const Route = createFileRoute("/_authenticated/admin/brands")({
  head: () => ({
    meta: [
      { title: "Admin Brands | DesignerSale" },
      { name: "description", content: "Manage luxury designer brands on DesignerSale." },
    ],
  }),
  component: AdminBrands,
});

function BrandForm({
  brand,
  onSubmit,
  pending,
  submitLabel,
}: {
  brand?: any;
  onSubmit: (values: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [logo, setLogo] = useState({
    url: brand?.logo_url ?? "",
    publicId: brand?.logo_public_id ?? "",
  });
  const [cover, setCover] = useState({
    url: brand?.cover_image_url ?? "",
    publicId: brand?.cover_image_public_id ?? "",
  });

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          description: String(f.get("description") ?? ""),
          website_url: String(f.get("website_url") ?? ""),
          country: String(f.get("country") ?? ""),
          logo_url: logo.url || null,
          logo_public_id: logo.publicId || null,
          cover_image_url: cover.url || null,
          cover_image_public_id: cover.publicId || null,
          is_active: f.get("is_active") === "on",
          is_featured: f.get("is_featured") === "on",
        });
      }}
    >
      <Field label="Brand Name">
        <TextInput name="name" defaultValue={brand?.name ?? ""} required />
      </Field>
      <Field label="Country of Origin">
        <TextInput name="country" defaultValue={brand?.country ?? ""} placeholder="e.g. Italy" />
      </Field>
      <Field label="Website URL">
        <TextInput
          name="website_url"
          type="url"
          defaultValue={brand?.website_url ?? ""}
          placeholder="https://example.com"
        />
      </Field>
      <div className="flex items-center gap-6 pt-4">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={brand ? Boolean(brand.is_active) : true}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input type="checkbox" name="is_featured" defaultChecked={Boolean(brand?.is_featured)} />
          Featured
        </label>
      </div>

      <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
        <CloudinaryImageUploader
          label="Logo"
          entityType="designer"
          value={logo.url}
          publicId={logo.publicId}
          onChange={(v) => setLogo({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
        <CloudinaryImageUploader
          label="Cover Image"
          entityType="designer"
          value={cover.url}
          publicId={cover.publicId}
          onChange={(v) => setCover({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
      </div>

      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={brand?.description ?? ""} rows={4} />
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

function AdminBrands() {
  const list = useServerFn(adminListBrands);
  const create = useServerFn(adminCreateBrand);
  const edit = useServerFn(adminEditBrand);
  const remove = useServerFn(adminDeleteBrand);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);

  const {
    data: brands,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-brands", search],
    queryFn: () => list({ data: { search } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
    qc.invalidateQueries({ queryKey: ["admin-summary"] });
    qc.invalidateQueries({ queryKey: ["admin-refs"] });
  };

  const createMut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => {
      toast.success("Brand created successfully");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create brand"),
  });

  const editMut = useMutation({
    mutationFn: (v: any) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Brand saved successfully");
      setEditingBrand(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save brand"),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active?: boolean; is_featured?: boolean }) =>
      edit({ data: v }),
    onSuccess: () => {
      toast.success("Brand updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update brand"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Brand deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete brand"),
  });

  return (
    <>
      <PageHeader
        title="Brands & Designers"
        description="Manage luxury labels, logos, and featured spotlight brands."
        actions={
          <Btn onClick={() => setShowNew(true)}>
            <span className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> New Brand
            </span>
          </Btn>
        }
      />

      <div className="mb-6 flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by name..."
            aria-label="Search brands"
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
      </div>

      {/* Create Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create New Brand"
        description="Add a designer label to the catalog."
      >
        <BrandForm
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Create Brand"
        />
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        open={Boolean(editingBrand)}
        onOpenChange={(open) => {
          if (!open) setEditingBrand(null);
        }}
        title={`Edit Brand — ${editingBrand?.name ?? ""}`}
        description="Update brand details, website, and assets."
      >
        {editingBrand && (
          <BrandForm
            brand={editingBrand}
            onSubmit={(v) => editMut.mutate({ id: editingBrand.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Changes"
          />
        )}
      </AdminModal>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading brands...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load brands.</p>
      ) : brands.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">No brands found.</p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Logo</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((b: any) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      {b.logo_url ? (
                        <img
                          src={b.logo_url}
                          alt=""
                          className="h-8 w-12 object-contain bg-cream/10 rounded border border-border/40"
                        />
                      ) : (
                        <div className="h-8 w-12 bg-muted text-[10px] text-muted-foreground flex items-center justify-center rounded border border-dashed border-border/40">
                          No logo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{b.name}</span>
                        {b.website_url && (
                          <a
                            href={b.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View official website"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{b.country ?? "—"}</td>
                    <td className="px-6 py-3">{b.products?.[0]?.count ?? 0} pieces</td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Toggle active for ${b.name}`}
                        checked={b.is_active}
                        disabled={toggleMut.isPending}
                        onChange={(e) =>
                          toggleMut.mutate({ id: b.id, is_active: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Toggle featured for ${b.name}`}
                        checked={b.is_featured}
                        disabled={toggleMut.isPending}
                        onChange={(e) =>
                          toggleMut.mutate({ id: b.id, is_featured: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingBrand(b)}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Edit brand"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Brand: "${b.name}"? This cannot be undone.`)) {
                              deleteMut.mutate(b.id);
                            }
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Delete brand"
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
