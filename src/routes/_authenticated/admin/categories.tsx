import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, FolderOpen } from "lucide-react";

import { Btn, Field, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminEditCategory,
  adminListCategories,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "Admin Categories | DesignerSale" },
      { name: "description", content: "Manage boutique product categories on DesignerSale." },
    ],
  }),
  component: AdminCategories,
});

function CategoryForm({
  category,
  categories,
  onSubmit,
  pending,
  submitLabel,
}: {
  category?: any;
  categories: any[];
  onSubmit: (values: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [image, setImage] = useState({
    url: category?.image_url ?? "",
    publicId: category?.image_public_id ?? "",
  });

  // Filter out the category itself to prevent circular parent assignments
  const potentialParents = categories.filter((c) => !category || c.id !== category.id);

  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          parent_id: f.get("parent_id") || null,
          description: String(f.get("description") ?? ""),
          display_order: Number(f.get("display_order") || 0),
          image_url: image.url || null,
          image_public_id: image.publicId || null,
          is_active: f.get("is_active") === "on",
        });
      }}
    >
      <Field label="Category Name">
        <TextInput name="name" defaultValue={category?.name ?? ""} required />
      </Field>
      <Field label="Parent Category">
        <SelectInput name="parent_id" defaultValue={category?.parent_id ?? ""}>
          <option value="">None (Top-Level Category)</option>
          {potentialParents.map((c) => (
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
          defaultValue={String(category?.display_order ?? 0)}
        />
      </Field>
      <div className="flex items-center gap-6 pt-4">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={category ? Boolean(category.is_active) : true}
          />
          Active
        </label>
      </div>

      <div className="md:col-span-2">
        <CloudinaryImageUploader
          label="Category Image"
          entityType="category"
          value={image.url}
          publicId={image.publicId}
          onChange={(v) => setImage({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
      </div>

      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={category?.description ?? ""} rows={3} />
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

function AdminCategories() {
  const list = useServerFn(adminListCategories);
  const create = useServerFn(adminCreateCategory);
  const edit = useServerFn(adminEditCategory);
  const remove = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const {
    data: categories,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => list({}),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["admin-summary"] });
    qc.invalidateQueries({ queryKey: ["admin-refs"] });
  };

  const createMut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => {
      toast.success("Category created successfully");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create category"),
  });

  const editMut = useMutation({
    mutationFn: (v: any) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Category saved successfully");
      setEditingCategory(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save category"),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Category active status updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update category"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete category"),
  });

  const listData = categories ?? [];
  const parentMap = new Map(listData.map((c: any) => [c.id, c.name]));

  const filtered = listData.filter((c: any) =>
    search.trim() ? c.name.toLowerCase().includes(search.trim().toLowerCase()) : true,
  );

  return (
    <>
      <PageHeader
        title="Boutique Categories"
        description="Organize catalog products with parent and child categories."
        actions={
          <Btn onClick={() => setShowNew(true)}>
            <span className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> New Category
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
            placeholder="Search categories by name..."
            aria-label="Search categories"
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
      </div>

      {/* Create Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create Category"
        description="Add a top-level or sub-category."
      >
        <CategoryForm
          categories={listData}
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Create Category"
        />
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
        title={`Edit Category — ${editingCategory?.name ?? ""}`}
        description="Update parent mapping, hierarchy, and cover image."
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            categories={listData}
            onSubmit={(v) => editMut.mutate({ id: editingCategory.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Changes"
          />
        )}
      </AdminModal>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load categories.</p>
      ) : filtered.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">No categories found.</p>
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
                  <th className="px-6 py-3">Parent Category</th>
                  <th className="px-6 py-3">Display Order</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="h-8 w-12 object-cover rounded border border-border/40"
                        />
                      ) : (
                        <div className="h-8 w-12 bg-muted text-[10px] text-muted-foreground flex items-center justify-center rounded border border-dashed border-border/40">
                          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.parent_id ? (
                        (parentMap.get(c.parent_id) ?? "—")
                      ) : (
                        <span className="text-xs uppercase tracking-wider bg-cream/10 px-2 py-0.5 rounded border border-border/20 text-muted-foreground">
                          Top Level
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">{c.display_order}</td>
                    <td className="px-6 py-3">{c.products?.[0]?.count ?? 0} pieces</td>
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Toggle active for ${c.name}`}
                        checked={c.is_active}
                        disabled={toggleMut.isPending}
                        onChange={(e) =>
                          toggleMut.mutate({ id: c.id, is_active: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Edit category"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(`Delete Category: "${c.name}"? This will check constraints.`)
                            ) {
                              deleteMut.mutate(c.id);
                            }
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="Delete category"
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
