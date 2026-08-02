/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { adminCuratedSelectors, adminSaveCuratedPageProducts } from "@/lib/curated-pages.functions";

export function CuratedSectionBuilder({ page }: { page: any }) {
  const qc = useQueryClient();
  const saveProducts = useServerFn(adminSaveCuratedPageProducts);

  const initialProductIds = (page.curated_page_products ?? [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((x: any) => x.product_id);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialProductIds);

  useEffect(() => {
    const ids = (page.curated_page_products ?? [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((x: any) => x.product_id);
    setSelectedIds(ids);
  }, [page]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["curated-page", page.id] });

  const mut = useMutation({
    mutationFn: (ids: string[]) => saveProducts({ data: { pageId: page.id, productIds: ids } }),
    onSuccess: () => {
      toast.success("Curated products updated");
      invalidate();
    },
    onError: (e: Error) => {
      setSelectedIds(initialProductIds);
      toast.error(e.message);
    },
  });

  const handleProductsChange = (newIds: string[]) => {
    setSelectedIds(newIds);
    mut.mutate(newIds);
  };

  return (
    <section className="mt-8 rounded-lg border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Curated Products</h2>
        <p className="text-sm text-muted-foreground">
          Select products to display on this curated page. Drag to reorder. Changes save
          automatically.
        </p>
      </div>

      <ItemSelector selected={selectedIds} onChange={handleProductsChange} />
    </section>
  );
}

function ItemSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (x: string[]) => void;
}) {
  const selector = useServerFn(adminCuratedSelectors);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["curated-selector", "products", search, drafts],
    queryFn: () => selector({ data: { kind: "products", search, includeDrafts: drafts, page: 1 } }),
  });

  const rows = (data as any)?.rows ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      {selected.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide">Display order</p>
          <DndContext
            sensors={sensors}
            onDragEnd={(event) => {
              if (!event.over || event.active.id === event.over.id) return;
              onChange(
                arrayMove(
                  selected,
                  selected.indexOf(String(event.active.id)),
                  selected.indexOf(String(event.over.id)),
                ),
              );
            }}
          >
            <SortableContext items={selected} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {selected.map((id, index) => (
                  <SelectedItem
                    key={id}
                    id={id}
                    index={index}
                    label={rows.find((row: any) => row.id === id)?.name ?? id}
                    remove={() => {
                      onChange(selected.filter((value) => value !== id));
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          className={input}
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={drafts} onChange={(e) => setDrafts(e.target.checked)} />{" "}
          Include drafts for preview
        </label>
      </div>

      {isPending ? (
        <p className="py-5 text-sm">Loading…</p>
      ) : (
        <div className="mt-3 max-h-72 overflow-y-auto">
          {rows.map((r: any) => {
            const id = r.id;
            const checked = selected.includes(id);
            return (
              <div key={id} className="border-b py-2">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const ids = checked ? selected.filter((x) => x !== id) : [...selected, id];
                      onChange(ids);
                    }}
                  />
                  {r.product_images?.[0]?.image_url ? (
                    <img
                      src={r.product_images[0].image_url}
                      className="h-10 w-10 object-cover"
                      alt=""
                    />
                  ) : null}
                  <span>{r.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.status}</span>
                </label>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selected.length} selected. Selection order is preserved.
      </p>
    </div>
  );
}

function SelectedItem({
  id,
  index,
  label,
  remove,
}: {
  id: string;
  index: number;
  label: string;
  remove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded border bg-background p-2 text-sm"
    >
      <button type="button" {...attributes} {...listeners} className="touch-none cursor-grab">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-xs text-muted-foreground">{index + 1}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <button type="button" onClick={remove} className="text-xs text-destructive">
        Remove
      </button>
    </div>
  );
}

const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
