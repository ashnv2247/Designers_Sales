import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Field, SelectInput, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminCreateBlogPost,
  adminDeleteBlogPost,
  adminEditBlogPost,
  adminListBlogPosts,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

const STATUSES = ["draft", "published", "archived"] as const;

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({
    meta: [
      { title: "Admin Journal | DesignerSale" },
      {
        name: "description",
        content: "Write, publish and archive editorial stories on the DesignerSale journal.",
      },
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
  onSubmit,
  pending,
  submitLabel,
}: {
  post?: any;
  onSubmit: (v: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [featured, setFeatured] = useState({
    url: post?.featured_image_url ?? "",
    publicId: post?.featured_image_public_id ?? "",
  });
  const [tagsText, setTagsText] = useState((post?.tags ?? []).join(", "));

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
          featured_image_url: String(f.get("featured_image_url") ?? ""),
          featured_image_public_id: String(f.get("featured_image_public_id") ?? ""),
          status: String(f.get("status")),
          is_featured: f.get("is_featured") === "on",
          tags: tagsText
            .split(",")
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0),
        });
      }}
    >
      <Field label="Title">
        <TextInput name="title" defaultValue={post?.title ?? ""} required />
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
      <div className="md:col-span-2">
        <Field label="Tags (Comma separated, e.g. resort, trend-report, quiet-luxury)">
          <TextInput
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="resort, editorial"
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <CloudinaryImageUploader
          label="Featured image"
          entityType="collection"
          value={featured.url}
          publicId={featured.publicId}
          onChange={(v) => setFeatured({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
        <input type="hidden" name="featured_image_url" value={featured.url} />
        <input type="hidden" name="featured_image_public_id" value={featured.publicId} />
      </div>
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
          <input type="checkbox" name="is_featured" defaultChecked={Boolean(post?.is_featured)} />{" "}
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

function AdminBlog() {
  const list = useServerFn(adminListBlogPosts);
  const create = useServerFn(adminCreateBlogPost);
  const edit = useServerFn(adminEditBlogPost);
  const remove = useServerFn(adminDeleteBlogPost);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => list({}),
  });

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
      setEditingPost(null);
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

  if (isPending) return <p className="text-sm text-muted-foreground">Loading journal…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">We couldn't load the journal.</p>;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-serif">Journal & Editorial Stories</h2>
        <Btn onClick={() => setShowNew(true)}>+ New story</Btn>
      </div>

      {/* Create Story Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create New Story"
        description="Publish an editorial story, trend report or designer profile."
      >
        <PostForm
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Publish Story"
        />
      </AdminModal>

      {/* Edit Story Modal */}
      <AdminModal
        open={Boolean(editingPost)}
        onOpenChange={(open) => {
          if (!open) setEditingPost(null);
        }}
        title={`Edit Story — ${editingPost?.title ?? ""}`}
        description="Update article content, images, status and tags."
      >
        {editingPost && (
          <PostForm
            post={editingPost}
            onSubmit={(v) => editMut.mutate({ id: editingPost.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Story"
          />
        )}
      </AdminModal>

      {(data as any[]).length === 0 && (
        <p className="text-sm text-muted-foreground">No stories yet.</p>
      )}

      <ul className="border-t border-border">
        {(data as any[]).map((p) => (
          <li key={p.id} className="border-b border-border py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tags: {p.tags?.join(", ") || "None"} ·{" "}
                  <span className="capitalize">{p.status}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Btn variant="ghost" onClick={() => setEditingPost(p)}>
                  Edit
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
          </li>
        ))}
      </ul>
    </>
  );
}
