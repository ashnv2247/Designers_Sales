/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminGetCuratedPage } from "@/lib/curated-pages.functions";
import { CuratedPagePreview } from "@/components/admin/curated/CuratedPagePreview";
export const Route = createFileRoute("/_authenticated/admin/curated-pages/$id/preview")({
  component: Preview,
});
function Preview() {
  const { id } = Route.useParams();
  const get = useServerFn(adminGetCuratedPage);
  const [mobile, setMobile] = useState(false),
    [inactive, setInactive] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["curated-page", id],
    queryFn: () => get({ data: { id } }),
  });
  if (isPending) return <p>Loading preview…</p>;
  if (error || !data) return <p>Could not load preview.</p>;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-xl font-semibold">Preview: {(data as any).title}</h1>
        <label className="text-sm">
          <input
            type="checkbox"
            checked={inactive}
            onChange={(e) => setInactive(e.target.checked)}
          />{" "}
          Show inactive sections
        </label>
        <button className="rounded border px-3 py-2 text-sm" onClick={() => setMobile((v) => !v)}>
          {mobile ? "Desktop" : "Mobile"} mode
        </button>
      </div>
      <div
        className={`mx-auto overflow-hidden border bg-background shadow ${mobile ? "max-w-[390px]" : ""}`}
      >
        <CuratedPagePreview page={data} showInactive={inactive} />
      </div>
    </div>
  );
}
