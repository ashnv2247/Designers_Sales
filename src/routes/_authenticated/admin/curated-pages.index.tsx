/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  adminDeleteCuratedPage,
  adminDuplicateCuratedPage,
  adminListCuratedPages,
  adminSaveCuratedPage,
} from "@/lib/curated-pages.functions";

import { useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { CuratedPageForm } from "@/components/admin/curated/CuratedPageForm";

const searchSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  title: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  publishedFrom: z.string().optional(),
  publishedTo: z.string().optional(),
  sort: z
    .enum(["created_at", "updated_at", "published_at", "title", "slug", "status"])
    .catch("updated_at"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});
export const Route = createFileRoute("/_authenticated/admin/curated-pages/")({
  validateSearch: (s) => searchSchema.parse(s),
  component: List,
});
function List() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const list = useServerFn(adminListCuratedPages),
    del = useServerFn(adminDeleteCuratedPage),
    dup = useServerFn(adminDuplicateCuratedPage),
    save = useServerFn(adminSaveCuratedPage);
  const { data, isPending, error } = useQuery({
    queryKey: ["curated-pages", search],
    queryFn: () => list({ data: { ...search, pageSize: 20 } }),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["curated-pages"] });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Page deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const duplicate = useMutation({
    mutationFn: (id: string) => dup({ data: { _page_id: id } }),
    onSuccess: () => {
      toast.success("Page duplicated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const status = useMutation({
    mutationFn: (p: any) => save({ data: p }),
    onSuccess: () => {
      toast.success("Status updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (patch: any) =>
    nav({
      to: "/admin/curated-pages",
      search: { ...search, ...patch, page: patch.page ?? 1 } as any,
    });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Curated Pages</h1>
          <p className="text-sm text-muted-foreground">
            Build and publish editorial storefront experiences.
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className={primary}>
          + New page
        </button>
      </div>

      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create Curated Page"
        description="Set up page titles, hero media, and publishing status."
      >
        <CuratedPageForm />
      </AdminModal>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {[
          ["", "All"],
          ["draft", "Draft"],
          ["published", "Published"],
          ["archived", "Archived"],
        ].map(([v, l]) => (
          <button
            key={l}
            onClick={() => set({ status: v || undefined })}
            className={`rounded-full px-4 py-2 text-sm ${search.status === v || (!search.status && !v) ? "bg-foreground text-background" : "border"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mb-5 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-4">
        <input
          value={search.title ?? ""}
          onChange={(e) => set({ title: e.target.value || undefined })}
          placeholder="Search title"
          className={input}
        />
        <input
          value={search.slug ?? ""}
          onChange={(e) => set({ slug: e.target.value || undefined })}
          placeholder="Search slug"
          className={input}
        />
        <label className="text-xs">
          Created from
          <input
            type="date"
            value={search.createdFrom ?? ""}
            onChange={(e) => set({ createdFrom: e.target.value || undefined })}
            className={input}
          />
        </label>
        <label className="text-xs">
          Created to
          <input
            type="date"
            value={search.createdTo ?? ""}
            onChange={(e) => set({ createdTo: e.target.value || undefined })}
            className={input}
          />
        </label>
        <label className="text-xs">
          Published from
          <input
            type="date"
            value={search.publishedFrom ?? ""}
            onChange={(e) => set({ publishedFrom: e.target.value || undefined })}
            className={input}
          />
        </label>
        <label className="text-xs">
          Published to
          <input
            type="date"
            value={search.publishedTo ?? ""}
            onChange={(e) => set({ publishedTo: e.target.value || undefined })}
            className={input}
          />
        </label>
        <select
          value={search.sort}
          onChange={(e) => set({ sort: e.target.value })}
          className={input}
        >
          <option value="updated_at">Last updated</option>
          <option value="created_at">Created</option>
          <option value="published_at">Published</option>
          <option value="title">Title</option>
          <option value="slug">Slug</option>
        </select>
        <select
          value={search.direction}
          onChange={(e) => set({ direction: e.target.value })}
          className={input}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      {isPending ? (
        <Skeleton />
      ) : error ? (
        <p className="rounded border p-6 text-destructive">Could not load curated pages.</p>
      ) : !(data as any)?.rows?.length ? (
        <p className="rounded border border-dashed p-10 text-center text-muted-foreground">
          No curated pages match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                {[
                  "Hero",
                  "Title",
                  "Slug",
                  "Status",
                  "Sections",
                  "Published",
                  "Updated",
                  "Actions",
                ].map((x) => (
                  <th key={x} className="p-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data as any).rows.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.hero_image_url ? (
                      <img
                        src={p.hero_image_url}
                        className="h-12 w-20 rounded object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.slug}</td>
                  <td className="p-3">
                    <span className="rounded bg-muted px-2 py-1 text-xs uppercase">{p.status}</span>
                  </td>
                  <td className="p-3">{p.curated_sections?.[0]?.count ?? 0}</td>
                  <td className="p-3">{date(p.published_at)}</td>
                  <td className="p-3">{date(p.updated_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to="/admin/curated-pages/$id" params={{ id: p.id }} className={small}>
                        View
                      </Link>
                      <Link
                        to="/admin/curated-pages/$id/edit"
                        params={{ id: p.id }}
                        className={small}
                      >
                        Edit
                      </Link>
                      <Link
                        to="/admin/curated-pages/$id/preview"
                        params={{ id: p.id }}
                        className={small}
                      >
                        Preview
                      </Link>
                      <button className={small} onClick={() => duplicate.mutate(p.id)}>
                        Duplicate
                      </button>
                      {p.status !== "published" && (
                        <button
                          className={small}
                          onClick={() =>
                            confirm("Publish this page?") &&
                            status.mutate({
                              ...p,
                              curated_sections: undefined,
                              status: "published",
                            })
                          }
                        >
                          Publish
                        </button>
                      )}
                      {p.status === "published" && (
                        <button
                          className={small}
                          onClick={() =>
                            status.mutate({ ...p, curated_sections: undefined, status: "draft" })
                          }
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        className={small}
                        onClick={() =>
                          confirm("Archive this page?") &&
                          status.mutate({ ...p, curated_sections: undefined, status: "archived" })
                        }
                      >
                        Archive
                      </button>
                      <button
                        className="text-xs text-destructive"
                        onClick={() =>
                          confirm("Delete this page permanently?") && remove.mutate(p.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(data as any)?.count > 20 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            disabled={search.page <= 1}
            className={small}
            onClick={() => set({ page: search.page - 1 })}
          >
            Previous
          </button>
          <span className="p-2 text-sm">
            Page {search.page} of {Math.ceil((data as any).count / 20)}
          </span>
          <button
            disabled={search.page >= Math.ceil((data as any).count / 20)}
            className={small}
            onClick={() => set({ page: search.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
const date = (v: string | null) => (v ? new Date(v).toLocaleDateString() : "—");
const input = "rounded-md border bg-background px-3 py-2 text-sm";
const primary = "rounded-md bg-foreground px-4 py-2 text-sm text-background";
const small = "rounded border px-2 py-1 text-xs disabled:opacity-40";
function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton-shimmer h-16 rounded" />
      ))}
    </div>
  );
}
