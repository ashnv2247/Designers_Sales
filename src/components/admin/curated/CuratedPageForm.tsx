/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { curatedPageSchema, slugify } from "@/lib/curated-pages.schemas";
import { adminSaveCuratedPage } from "@/lib/curated-pages.functions";
import { ImageUploader } from "./ImageUploader";

export function CuratedPageForm({ page }: { page?: any }) {
  const save = useServerFn(adminSaveCuratedPage);
  const nav = useNavigate();
  const qc = useQueryClient();
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: zodResolver(curatedPageSchema),
    defaultValues: page ?? {
      title: "",
      slug: "",
      subtitle: "",
      description: "",
      hero_image_url: "",
      hero_image_public_id: "",
      mobile_hero_image_url: "",
      mobile_hero_image_public_id: "",
      status: "draft",
      published_at: null,
      seo_title: "",
      seo_description: "",
    },
  });
  const title = watch("title");
  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(title ?? ""), { shouldValidate: true });
  }, [title, slugTouched, setValue]);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", fn);
    return () => removeEventListener("beforeunload", fn);
  }, [isDirty]);
  const mut = useMutation({
    mutationFn: (v: any) => save({ data: { ...v, id: page?.id } }),
    onSuccess: (r: any) => {
      toast.success("Curated page saved");
      qc.invalidateQueries({ queryKey: ["curated-pages"] });
      nav({ to: "/admin/curated-pages/$id/edit", params: { id: r.id } } as any);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="space-y-8 pb-24">
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Basic information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Title" error={errors.title?.message as string}>
            <input {...register("title")} className={input} />
          </Field>
          <Field label="Slug" error={errors.slug?.message as string}>
            <input
              {...register("slug", { onChange: () => setSlugTouched(true) })}
              className={input}
            />
          </Field>
          <Field label="Subtitle" error={errors.subtitle?.message as string}>
            <input {...register("subtitle")} className={input} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message as string}>
              <textarea {...register("description")} rows={4} className={input} />
            </Field>
          </div>
        </div>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Hero media</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <ImageUploader
            label="Desktop hero"
            value={watch("hero_image_url")}
            publicId={watch("hero_image_public_id")}
            folder="curated/pages"
            onChange={(v) => setValue("hero_image_url", v, { shouldDirty: true })}
            onPublicIdChange={(v) => setValue("hero_image_public_id", v, { shouldDirty: true })}
          />
          <ImageUploader
            label="Mobile hero"
            value={watch("mobile_hero_image_url")}
            publicId={watch("mobile_hero_image_public_id")}
            folder="curated/pages"
            onChange={(v) => setValue("mobile_hero_image_url", v, { shouldDirty: true })}
            onPublicIdChange={(v) =>
              setValue("mobile_hero_image_public_id", v, { shouldDirty: true })
            }
          />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Publishing and SEO</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Status">
            <select {...register("status")} className={input}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Published date">
            <input type="datetime-local" {...register("published_at")} className={input} />
          </Field>
          <Field label="SEO title" error={errors.seo_title?.message as string}>
            <input {...register("seo_title")} className={input} />
          </Field>
          <Field label="SEO description" error={errors.seo_description?.message as string}>
            <textarea {...register("seo_description")} className={input} />
          </Field>
        </div>
      </section>
      <div className="fixed bottom-0 right-0 z-20 flex w-full justify-end gap-3 border-t bg-background/95 p-4 lg:w-[calc(100%-16rem)]">
        {page && (
          <button
            type="button"
            className={secondary}
            onClick={() =>
              nav({ to: "/admin/curated-pages/$id/preview", params: { id: page.id } } as any)
            }
          >
            Preview
          </button>
        )}
        <button disabled={mut.isPending} className={button}>
          {mut.isPending ? "Saving…" : "Save page"}
        </button>
      </div>
    </form>
  );
}
const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";
const button = "rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50";
const secondary = "rounded-md border px-4 py-2 text-sm";
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}
