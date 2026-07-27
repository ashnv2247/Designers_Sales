import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, Panel, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import {
  adminCreateBlogCategory,
  adminCreateBlogPost,
  adminDeleteBlogPost,
  adminEditBlogPost,
  adminGetRefs,
  adminListBlogPosts,
} from "@/lib/admin-content.functions";

const STATUSES = ["draft", "published", "archived"] as const;

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({
    meta: [
      { title: "Admin Journal | DesignerSale" },
      { name: "description", content: "Write, publish and archive editorial stories on the DesignerSale journal." },
      { property: "og:title", content: "Admin Journal | DesignerSale" },
      { property: "og:description", content: "Manage DesignerSale journal stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminBlog,
});

function PostForm({
  post,
  categories,
  onSubmit,
  pending,
  submitLabel,
}: {
  post?: any;
  categories: any[];
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
          title: String(f.get("title")),
          excerpt: String(f.get("excerpt") ?? ""),
          content: String(f.get("content")),
          category_id: String(f.get("category_id") ?? ""),
          featured_image_url: String(f.get("featured_image_url") ?? ""),
          status: String(f.get("status")),
          is_featured: f.get("is_featured") === "on",
        });
      }}
    >
      <Field label="Title">
        <TextInput name="title" defaultValue={post?.title ?? ""} required />
      </Field>
      <Field label="Category">
        <SelectInput name="category_id" defaultValue={post?.category_id ?? ""}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Status">
        <SelectInput name="status" defaultValue={post?.status ?? "draft"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Featured image URL">
        <TextInput name="featured_image_url" defaultValue={post?.featured_image_url ?? ""} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Excerpt">
          <TextInput name="excerpt" defaultValue={post?.excerpt ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Content">
          <textarea
            name="content"
            rows={10}
            required
            defaultValue={post?.content ?? ""}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-foreground"
          />
        </Field>
      </div>
      <div className="flex items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input type="checkbox" name="is_featured" defaultChecked={Boolean(post?.is_featured)} /> Featured
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

function AdminBlog() {
  const list = useServerFn(adminListBlogPosts);
  const create = useServerFn(adminCreateBlogPost);
  const edit = useServerFn(adminEditBlogPost);
  const remove = useServerFn(adminDeleteBlogPost);
  const createCategory = useServerFn(adminCreateBlogCategory);
  const getRefs = useServerFn(adminGetRefs);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const { data, isPending, error } = useQuery({ queryKey: ["admin-posts"], queryFn: () => list({}) });
  const { data: refs } = useQuery({ queryKey: ["admin-refs"], queryFn: () => getRefs({}) });
  const categories = ((refs as any)?.blogCategories ?? []) as any[];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-posts"] });

  const createMut = useMutation({
    mutationFn: (v: any) => create({ data: v }),
    onSuccess: () => {
      toast.success("Story created");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not create that story"),
  });

  const editMut = useMutation({
    mutationFn: (v: any) => edit({ data: v }),
    onSuccess: () => {
      toast.success("Story saved");
      setOpenId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save that story"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Story deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete that story"),
  });

  const categoryMut = useMutation({
    mutationFn: (name: string) => createCategory({ data: { name } }),
    onSuccess: () => {
      toast.success("Category added");
      setNewCategory("");
      qc.invalidateQueries({ queryKey: ["admin-refs"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not add that category"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading journal…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">We couldn't load the journal.</p>;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <Btn onClick={() => setShowNew((v) => !v)}>{showNew ? "Close" : "New story"}</Btn>
        <div className="flex items-end gap-3">
          <TextInput
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="max-w-xs"
          />
          <Btn
            variant="ghost"
            disabled={!newCategory.trim() || categoryMut.isPending}
            onClick={() => categoryMut.mutate(newCategory.trim())}
          >
            Add category
          </Btn>
        </div>
      </div>

      {showNew && (
        <Panel title="New story">
          <PostForm
            categories={categories}
            onSubmit={(v) => createMut.mutate(v)}
            pending={createMut.isPending}
            submitLabel="Create story"
          />
        </Panel>
      )}

      {(data as any[]).length === 0 && <p className="text-sm text-muted-foreground">No stories yet.</p>}

      <ul className="border-t border-border">
        {(data as any[]).map((p) => (
          <li key={p.id} className="border-b border-border py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.blog_categories?.name ?? "Uncategorised"} · {p.status}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Btn variant="ghost" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                  {openId === p.id ? "Close" : "Edit"}
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete "${p.title}"?`)) deleteMut.mutate(p.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
            {openId === p.id && (
              <div className="mt-6 border-t border-dashed border-border pt-6">
                <PostForm
                  post={p}
                  categories={categories}
                  onSubmit={(v) => editMut.mutate({ id: p.id, ...v })}
                  pending={editMut.isPending}
                  submitLabel="Save story"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
