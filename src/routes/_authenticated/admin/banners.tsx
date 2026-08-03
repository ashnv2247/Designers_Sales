import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";
import { Btn, Field, TextArea, TextInput } from "@/components/admin/ui";
import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import {
  adminDeleteBanner,
  adminListBanners,
  adminSaveBanner,
} from "@/lib/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/banners")({ component: AdminBanners });

function ColorControl({
  name,
  value,
  fallback,
}: {
  name: string;
  value?: string | null;
  fallback: string;
}) {
  const [color, setColor] = useState(value || fallback);
  const pickerValue = /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => setColor(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
        aria-label={`${name.replaceAll("_", " ")} picker`}
      />
      <TextInput
        name={name}
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="#243026"
        required={name !== "glow_color"}
      />
      <span
        className="h-10 w-10 shrink-0 rounded border border-border"
        style={{ backgroundColor: color || "transparent" }}
        aria-hidden="true"
      />
    </div>
  );
}

function BannerForm({
  banner,
  pending,
  onSubmit,
}: {
  banner?: any;
  pending: boolean;
  onSubmit: (v: any) => void;
}) {
  const [desktop, setDesktop] = useState({
    url: banner?.image_url ?? "",
    publicId: banner?.image_public_id ?? "",
  });
  const [mobile, setMobile] = useState({
    url: banner?.mobile_image_url ?? "",
    publicId: banner?.mobile_image_public_id ?? "",
  });
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit({
          name: String(f.get("name")),
          eyebrow: String(f.get("eyebrow") ?? ""),
          headline: String(f.get("headline")),
          highlighted_text: String(f.get("highlighted_text") ?? ""),
          description: String(f.get("description") ?? ""),
          image_url: desktop.url,
          image_public_id: desktop.publicId,
          mobile_image_url: mobile.url,
          mobile_image_public_id: mobile.publicId,
          background_color: String(f.get("background_color")),
          accent_color: String(f.get("accent_color")),
          glow_color: String(f.get("glow_color") ?? ""),
          cta_label: String(f.get("cta_label") ?? ""),
          target_path: String(f.get("target_path") ?? ""),
          display_order: Number(f.get("display_order") || 0),
          starts_at: String(f.get("starts_at") ?? ""),
          ends_at: String(f.get("ends_at") ?? ""),
          is_active: f.get("is_active") === "on",
        });
      }}
    >
      <Field label="Admin name">
        <TextInput name="name" defaultValue={banner?.name ?? ""} required />
      </Field>
      <Field label="Eyebrow">
        <TextInput name="eyebrow" defaultValue={banner?.eyebrow ?? ""} />
      </Field>
      <Field label="Headline">
        <TextInput name="headline" defaultValue={banner?.headline ?? ""} required />
      </Field>
      <Field label="Highlighted text">
        <TextInput name="highlighted_text" defaultValue={banner?.highlighted_text ?? ""} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={banner?.description ?? ""} />
        </Field>
      </div>
      <CloudinaryImageUploader
        label="Desktop image"
        entityType="banner"
        value={desktop.url}
        publicId={desktop.publicId}
        onChange={(v) => setDesktop({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
      />
      <CloudinaryImageUploader
        label="Mobile image"
        entityType="banner"
        value={mobile.url}
        publicId={mobile.publicId}
        onChange={(v) => setMobile({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
      />
      <Field label="Background color">
        <ColorControl name="background_color" value={banner?.background_color} fallback="#243026" />
      </Field>
      <Field label="Accent color">
        <ColorControl name="accent_color" value={banner?.accent_color} fallback="#d6b36a" />
      </Field>
      <Field label="Glow color">
        <ColorControl name="glow_color" value={banner?.glow_color} fallback="#243026" />
      </Field>
      <Field label="Display order">
        <TextInput
          name="display_order"
          type="number"
          min="0"
          defaultValue={banner?.display_order ?? 0}
        />
      </Field>
      <Field label="CTA label">
        <TextInput name="cta_label" defaultValue={banner?.cta_label ?? ""} />
      </Field>
      <Field label="Internal target path">
        <TextInput
          name="target_path"
          defaultValue={banner?.target_path ?? ""}
          placeholder="/shop/dresses"
        />
      </Field>
      <Field label="Starts at">
        <TextInput
          name="starts_at"
          type="datetime-local"
          defaultValue={banner?.starts_at?.slice(0, 16) ?? ""}
        />
      </Field>
      <Field label="Ends at">
        <TextInput
          name="ends_at"
          type="datetime-local"
          defaultValue={banner?.ends_at?.slice(0, 16) ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={banner ? banner.is_active : true} />{" "}
        Active
      </label>
      <div className="md:col-span-2">
        <Btn type="submit" disabled={pending || !desktop.url}>
          {pending ? "Saving…" : "Save banner"}
        </Btn>
      </div>
    </form>
  );
}

function AdminBanners() {
  const list = useServerFn(adminListBanners),
    save = useServerFn(adminSaveBanner),
    remove = useServerFn(adminDeleteBanner);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null | undefined>(undefined);
  const { data = [] } = useQuery({ queryKey: ["admin-banners"], queryFn: () => list() });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-banners"] });
  const saveMut = useMutation({
    mutationFn: (banner: any) => save({ data: { id: editing?.id, banner } }),
    onSuccess: () => {
      toast.success("Banner saved");
      setEditing(undefined);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Banner deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader
        title="Banners"
        description="Manage the homepage hero carousel."
        actions={
          <Btn onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> New banner
          </Btn>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((b: any) => (
          <Card key={b.id}>
            <div className="flex gap-4">
              <img src={b.image_url} alt="" className="h-28 w-24 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{b.name}</h2>
                  <StatusBadge status={b.is_active ? "active" : "inactive"} />
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{b.headline}</p>
                <p className="mt-2 text-xs">Order {b.display_order}</p>
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" onClick={() => setEditing(b)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => confirm("Delete this banner?") && deleteMut.mutate(b.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Btn>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <AdminModal
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        title={editing ? "Edit Banner" : "New Banner"}
        description="Hero copy, media, colors, destination, and schedule."
      >
        <BannerForm
          key={editing?.id ?? "new"}
          banner={editing ?? undefined}
          pending={saveMut.isPending}
          onSubmit={(v) => saveMut.mutate(v)}
        />
      </AdminModal>
    </>
  );
}
