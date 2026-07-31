import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminGetCuratedPage } from "@/lib/curated-pages.functions";
import { CuratedPageForm } from "@/components/admin/curated/CuratedPageForm";
import { CuratedSectionBuilder } from "@/components/admin/curated/CuratedSectionBuilder";
export const Route = createFileRoute("/_authenticated/admin/curated-pages/$id/edit")({
  component: Edit,
});
function Edit() {
  const { id } = Route.useParams();
  const get = useServerFn(adminGetCuratedPage);
  const { data, isPending, error } = useQuery({
    queryKey: ["curated-page", id],
    queryFn: () => get({ data: { id } }),
  });
  if (isPending) return <p>Loading editor…</p>;
  if (error || !data) return <p>Could not load this page.</p>;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit curated page</h1>
      <CuratedPageForm page={data} />
      <CuratedSectionBuilder page={data} />
    </div>
  );
}
