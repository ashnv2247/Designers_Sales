import { createFileRoute } from "@tanstack/react-router";
import { CuratedPageForm } from "@/components/admin/curated/CuratedPageForm";
export const Route = createFileRoute("/_authenticated/admin/curated-pages/new")({
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New curated page</h1>
      <CuratedPageForm />
    </div>
  ),
});
