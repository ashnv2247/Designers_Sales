/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminGetCuratedPage } from "@/lib/curated-pages.functions";
import { CuratedPagePreview } from "@/components/admin/curated/CuratedPagePreview";
export const Route = createFileRoute("/_authenticated/admin/curated-pages/$id")({
  component: Detail,
});
function Detail() {
  const { id } = Route.useParams();
  const get = useServerFn(adminGetCuratedPage);
  const { data, isPending, error } = useQuery({
    queryKey: ["curated-page", id],
    queryFn: () => get({ data: { id } }),
  });
  if (isPending) return <p>Loading page…</p>;
  if (error || !data) return <p>Could not load this page.</p>;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{(data as any).title}</h1>
          <p className="text-sm text-muted-foreground">
            {(data as any).slug} · {(data as any).status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/curated-pages/$id/edit"
            params={{ id }}
            className="rounded border px-3 py-2 text-sm"
          >
            Edit
          </Link>
          <Link
            to="/admin/curated-pages/$id/preview"
            params={{ id }}
            className="rounded bg-foreground px-3 py-2 text-sm text-background"
          >
            Preview
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <CuratedPagePreview page={data} />
      </div>
    </div>
  );
}
