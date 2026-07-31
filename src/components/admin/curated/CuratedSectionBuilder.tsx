/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
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
import { GripVertical, Copy, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { curatedSectionSchema, sectionTypes } from "@/lib/curated-pages.schemas";
import {
  adminCuratedSelectors,
  adminDeleteCuratedSection,
  adminDuplicateCuratedSection,
  adminReorderCuratedSections,
  adminSaveCuratedSection,
} from "@/lib/curated-pages.functions";
import { ImageUploader } from "./ImageUploader";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

export function CuratedSectionBuilder({ page }: { page: any }) {
  const qc = useQueryClient(),
    reorder = useServerFn(adminReorderCuratedSections),
    remove = useServerFn(adminDeleteCuratedSection),
    duplicate = useServerFn(adminDuplicateCuratedSection),
    saveSection = useServerFn(adminSaveCuratedSection);
  const [rows, setRows] = useState<any[]>(() =>
    [...(page.curated_sections ?? [])].sort((a, b) => a.display_order - b.display_order),
  );
  const [editing, setEditing] = useState<any | undefined>();
  useEffect(
    () =>
      setRows([...(page.curated_sections ?? [])].sort((a, b) => a.display_order - b.display_order)),
    [page],
  );
  const invalidate = () => qc.invalidateQueries({ queryKey: ["curated-page", page.id] });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const orderMut = useMutation({
    mutationFn: (ids: string[]) => reorder({ data: { _page_id: page.id, _ordered_ids: ids } }),
    onSuccess: () => {
      toast.success("Section order saved");
      invalidate();
    },
    onError: (e: Error) => {
      setRows([...(page.curated_sections ?? [])]);
      toast.error(e.message);
    },
  });
  function dropped(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const next = arrayMove(
      rows,
      rows.findIndex((x) => x.id === e.active.id),
      rows.findIndex((x) => x.id === e.over!.id),
    );
    setRows(next);
    orderMut.mutate(next.map((x) => x.id));
  }
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Section deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const dup = useMutation({
    mutationFn: (id: string) => duplicate({ data: { _section_id: id } }),
    onSuccess: () => {
      toast.success("Section duplicated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: (s: any) =>
      saveSection({
        data: {
          id: s.id,
          curated_page_id: s.curated_page_id,
          section_type: s.section_type,
          title: s.title ?? "",
          subtitle: s.subtitle ?? "",
          content: s.content ?? "",
          image_url: s.image_url ?? "",
          image_public_id: s.image_public_id ?? "",
          mobile_image_url: s.mobile_image_url ?? "",
          mobile_image_public_id: s.mobile_image_public_id ?? "",
          link_url: s.link_url ?? "",
          link_label: s.link_label ?? "",
          display_order: s.display_order,
          is_active: !s.is_active,
          item_ids: itemIds(s),
          categories:
            s.curated_section_categories?.map((x: any) => ({
              id: x.category_id,
              custom_title: x.custom_title,
              custom_image_url: x.custom_image_url,
              custom_image_public_id: x.custom_image_public_id,
            })) ?? [],
        },
      }),
    onSuccess: () => {
      toast.success("Section state updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sections</h2>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Changes save immediately.
          </p>
        </div>
        <button className={primary} onClick={() => setEditing(null as any)}>
          <Plus className="h-4 w-4" /> Add section
        </button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No sections yet.
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={dropped}>
          <SortableContext items={rows.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {rows.map((s) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  onToggle={() => toggle.mutate(s)}
                  onEdit={() => setEditing(s)}
                  onDuplicate={() => dup.mutate(s.id)}
                  onDelete={() => confirm("Delete this section?") && del.mutate(s.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {editing !== undefined && (
        <SectionEditor
          pageId={page.id}
          section={editing || undefined}
          order={rows.length}
          close={() => setEditing(undefined)}
          saved={() => {
            setEditing(undefined);
            invalidate();
          }}
        />
      )}
    </section>
  );
}
function SectionCard({
  section,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
}: {
  section: any;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const count = itemIds(section).length;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Reorder section"
        className="cursor-grab touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase">
            {section.section_type.replace("_", " ")}
          </span>
          <span
            className={`text-xs ${section.is_active ? "text-green-700" : "text-muted-foreground"}`}
          >
            {section.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-1 truncate font-medium">{section.title || "Untitled section"}</p>
        <p className="text-xs text-muted-foreground">
          {count} items · order {section.display_order}
        </p>
      </div>
      <button onClick={onToggle} className="text-xs">
        {section.is_active ? "Deactivate" : "Activate"}
      </button>
      <button onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onDuplicate} aria-label="Duplicate">
        <Copy className="h-4 w-4" />
      </button>
      <button onClick={onDelete} aria-label="Delete" className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
function SectionEditor({
  pageId,
  section,
  order,
  close,
  saved,
}: {
  pageId: string;
  section?: any;
  order: number;
  close: () => void;
  saved: () => void;
}) {
  const save = useServerFn(adminSaveCuratedSection);
  const initialIds = itemIds(section);
  const [selected, setSelected] = useState<string[]>(initialIds);
  const [categoryMeta, setCategoryMeta] = useState<any[]>(
    () =>
      section?.curated_section_categories
        ?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((x: any) => ({
          id: x.category_id,
          custom_title: x.custom_title,
          custom_image_url: x.custom_image_url,
          custom_image_public_id: x.custom_image_public_id,
        })) ?? [],
  );
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(curatedSectionSchema),
    defaultValues: {
      id: section?.id,
      curated_page_id: pageId,
      section_type: section?.section_type ?? "hero",
      title: section?.title ?? "",
      subtitle: section?.subtitle ?? "",
      content: section?.content ?? "",
      image_url: section?.image_url ?? "",
      image_public_id: section?.image_public_id ?? "",
      mobile_image_url: section?.mobile_image_url ?? "",
      mobile_image_public_id: section?.mobile_image_public_id ?? "",
      link_url: section?.link_url ?? "",
      link_label: section?.link_label ?? "",
      display_order: section?.display_order ?? order,
      is_active: section?.is_active ?? true,
      item_ids: initialIds,
      categories: categoryMeta,
    },
  });
  const type = watch("section_type"),
    image = watch("image_url"),
    mobile = watch("mobile_image_url");
  const mut = useMutation({
    mutationFn: (v: any) => save({ data: { ...v, item_ids: selected, categories: categoryMeta } }),
    onSuccess: () => {
      toast.success("Section saved");
      saved();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3 md:p-8">
      <form
        onSubmit={handleSubmit((v) => mut.mutate(v))}
        className="mx-auto max-w-4xl space-y-5 rounded-lg bg-background p-5 shadow-xl"
      >
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">{section ? "Edit" : "Add"} section</h2>
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Label text="Section type">
            <select {...register("section_type")} className={input}>
              {sectionTypes.map((x) => (
                <option key={x} value={x}>
                  {x.replace("_", " ")}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Title">
            <input {...register("title")} className={input} />
          </Label>
          <Label text="Subtitle">
            <input {...register("subtitle")} className={input} />
          </Label>
          <Label text="Display order">
            <input type="number" {...register("display_order")} className={input} />
          </Label>
        </div>
        {["hero", "editorial"].includes(type) && (
          <Label text={type === "editorial" ? "Rich text (safe HTML)" : "Content"}>
            <RichText
              value={watch("content")}
              onChange={(v) => setValue("content", v, { shouldDirty: true })}
            />
          </Label>
        )}
        {["hero", "banner", "editorial"].includes(type) && (
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploader
              label="Desktop image"
              value={image}
              publicId={watch("image_public_id")}
              folder="curated/sections"
              onChange={(v) => setValue("image_url", v, { shouldDirty: true })}
              onPublicIdChange={(v) => setValue("image_public_id", v, { shouldDirty: true })}
            />
            <ImageUploader
              label="Mobile image"
              value={mobile}
              publicId={watch("mobile_image_public_id")}
              folder="curated/sections"
              onChange={(v) => setValue("mobile_image_url", v, { shouldDirty: true })}
              onPublicIdChange={(v) => setValue("mobile_image_public_id", v, { shouldDirty: true })}
            />
            <Label text="Link URL">
              <input {...register("link_url")} className={input} />
            </Label>
            <Label text="Link label">
              <input {...register("link_label")} className={input} />
            </Label>
          </div>
        )}
        {["products", "sales", "merchants", "categories", "blog_posts"].includes(type) && (
          <ItemSelector
            kind={type}
            selected={selected}
            onChange={(ids) => {
              setSelected(ids);
              setValue("item_ids", ids);
            }}
            categoryMeta={categoryMeta}
            setCategoryMeta={setCategoryMeta}
          />
        )}
        <label className="flex gap-2 text-sm">
          <input type="checkbox" {...register("is_active")} /> Active
        </label>
        {errors.root && <p className="text-destructive">{String(errors.root.message)}</p>}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background py-3">
          <button type="button" className={secondary} onClick={close}>
            Cancel
          </button>
          <button className={primary} disabled={mut.isPending}>
            Save section
          </button>
        </div>
      </form>
    </div>
  );
}
function ItemSelector({
  kind,
  selected,
  onChange,
  categoryMeta,
  setCategoryMeta,
}: {
  kind: any;
  selected: string[];
  onChange: (x: string[]) => void;
  categoryMeta: any[];
  setCategoryMeta: (x: any[]) => void;
}) {
  const selector = useServerFn(adminCuratedSelectors);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState(false);
  const { data, isPending } = useQuery({
    queryKey: ["curated-selector", kind, search, drafts],
    queryFn: () => selector({ data: { kind, search, includeDrafts: drafts, page: 1 } }),
  });
  const rows = (data as any)?.rows ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <div className="rounded-lg border p-4">
      {selected.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide">Selected order</p>
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
                    label={
                      rows.find((row: any) => row.id === id)?.name ??
                      rows.find((row: any) => row.id === id)?.title ??
                      id
                    }
                    remove={() => {
                      onChange(selected.filter((value) => value !== id));
                      if (kind === "categories")
                        setCategoryMeta(categoryMeta.filter((item) => item.id !== id));
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
          placeholder={`Search ${kind.replace("_", " ")}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {["products", "blog_posts"].includes(kind) && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={drafts} onChange={(e) => setDrafts(e.target.checked)} />{" "}
            Include drafts for preview
          </label>
        )}
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
                      if (kind === "categories")
                        setCategoryMeta(
                          checked
                            ? categoryMeta.filter((x) => x.id !== id)
                            : [
                                ...categoryMeta,
                                {
                                  id,
                                  custom_title: null,
                                  custom_image_url: null,
                                  custom_image_public_id: null,
                                },
                              ],
                        );
                    }}
                  />
                  {r.logo_url || r.image_url || r.featured_image_url || r.banner_image_url ? (
                    <img
                      src={r.logo_url || r.image_url || r.featured_image_url || r.banner_image_url}
                      className="h-10 w-10 object-cover"
                      alt=""
                    />
                  ) : null}
                  <span>{r.name || r.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.status}</span>
                </label>
                {kind === "categories" && checked && (
                  <div className="ml-7 mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      className={input}
                      placeholder="Custom title"
                      value={categoryMeta.find((x) => x.id === id)?.custom_title ?? ""}
                      onChange={(e) =>
                        setCategoryMeta(
                          categoryMeta.map((x) =>
                            x.id === id ? { ...x, custom_title: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <CloudinaryImageUploader
                      label="Custom image"
                      folder="curated/categories"
                      value={categoryMeta.find((x) => x.id === id)?.custom_image_url}
                      publicId={categoryMeta.find((x) => x.id === id)?.custom_image_public_id}
                      onChange={(image) =>
                        setCategoryMeta(
                          categoryMeta.map((x) =>
                            x.id === id
                              ? {
                                  ...x,
                                  custom_image_url: image?.url ?? null,
                                  custom_image_public_id: image?.publicId ?? null,
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
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
function RichText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex gap-1 border p-1">
        {["bold", "italic", "underline", "insertUnorderedList"].map((c) => (
          <button
            key={c}
            type="button"
            className="rounded px-2 py-1 text-xs hover:bg-muted"
            onMouseDown={(e) => {
              e.preventDefault();
              document.execCommand(c);
            }}
          >
            {c.replace("insertUnorderedList", "List")}
          </button>
        ))}
      </div>
      <div
        className={`${input} min-h-36`}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: value || "" }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{text}</span>
      {children}
    </label>
  );
}
function itemIds(s: any) {
  if (!s) return [];
  const map: any = {
    products: ["curated_section_products", "product_id"],
    sales: ["curated_section_sales", "sale_id"],
    merchants: ["curated_section_merchants", "merchant_id"],
    categories: ["curated_section_categories", "category_id"],
    blog_posts: ["curated_section_blog_posts", "blog_post_id"],
  };
  const c = map[s.section_type];
  return c
    ? [...(s[c[0]] ?? [])].sort((a, b) => a.display_order - b.display_order).map((x) => x[c[1]])
    : [];
}
const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
const primary =
  "inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50";
const secondary = "rounded-md border px-4 py-2 text-sm";
