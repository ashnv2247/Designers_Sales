import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Check, Field, SelectInput, TextArea, TextInput } from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { adminListMerchants, adminUpdateMerchant } from "@/lib/admin.functions";
import {
  adminCreateMerchant,
  adminDeleteMerchant,
  adminEditMerchant,
} from "@/lib/admin-content.functions";
import { CloudinaryImageUploader } from "@/components/admin/CloudinaryImageUploader";

const STATUSES = ["pending", "approved", "rejected", "suspended"] as const;
const LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const Route = createFileRoute("/_authenticated/admin/merchants")({
  head: () => ({
    meta: [
      { title: "Admin Merchants | DesignerSale" },
      {
        name: "description",
        content: "Add, edit, approve and suspend the boutiques selling on DesignerSale.",
      },
      { property: "og:title", content: "Admin Merchants | DesignerSale" },
      { property: "og:description", content: "Approve and manage DesignerSale boutiques." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminMerchants,
});

function MerchantForm({
  merchant,
  onSubmit,
  pending,
  submitLabel,
}: {
  merchant?: any;
  onSubmit: (values: any) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const [logo, setLogo] = useState({
    url: merchant?.logo_url ?? "",
    publicId: merchant?.logo_public_id ?? "",
  });
  const [cover, setCover] = useState({
    url: merchant?.cover_image_url ?? "",
    publicId: merchant?.cover_image_public_id ?? "",
  });
  return (
    <form
      className="grid gap-5 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget as HTMLFormElement);
        onSubmit({
          name: String(f.get("name")),
          email: String(f.get("email") ?? ""),
          phone: String(f.get("phone") ?? ""),
          city: String(f.get("city") ?? ""),
          country: String(f.get("country") ?? ""),
          website_url: String(f.get("website_url") ?? ""),
          instagram_url: String(f.get("instagram_url") ?? ""),
          logo_url: String(f.get("logo_url") ?? ""),
          logo_public_id: String(f.get("logo_public_id") ?? ""),
          cover_image_url: String(f.get("cover_image_url") ?? ""),
          cover_image_public_id: String(f.get("cover_image_public_id") ?? ""),
          short_description: String(f.get("short_description") ?? ""),
          description: String(f.get("description") ?? ""),
          status: String(f.get("status")),
          is_active: f.get("is_active") === "on",
          is_featured: f.get("is_featured") === "on",
        });
      }}
    >
      <Field label="Name">
        <TextInput name="name" defaultValue={merchant?.name ?? ""} required />
      </Field>
      <Field label="Email">
        <TextInput name="email" type="email" defaultValue={merchant?.email ?? ""} />
      </Field>
      <Field label="Phone">
        <TextInput name="phone" defaultValue={merchant?.phone ?? ""} />
      </Field>
      <Field label="City">
        <TextInput name="city" defaultValue={merchant?.city ?? ""} />
      </Field>
      <Field label="Country">
        <TextInput name="country" defaultValue={merchant?.country ?? ""} />
      </Field>
      <Field label="Status">
        <SelectInput name="status" defaultValue={merchant?.status ?? "approved"}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {LABEL[s]}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Website">
        <TextInput name="website_url" defaultValue={merchant?.website_url ?? ""} />
      </Field>
      <Field label="Instagram">
        <TextInput name="instagram_url" defaultValue={merchant?.instagram_url ?? ""} />
      </Field>
      <div>
        <CloudinaryImageUploader
          label="Logo"
          entityType="designer"
          value={logo.url}
          publicId={logo.publicId}
          onChange={(v) => setLogo({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
        <input type="hidden" name="logo_url" value={logo.url} />
        <input type="hidden" name="logo_public_id" value={logo.publicId} />
      </div>
      <div>
        <CloudinaryImageUploader
          label="Cover image"
          entityType="designer"
          value={cover.url}
          publicId={cover.publicId}
          onChange={(v) => setCover({ url: v?.url ?? "", publicId: v?.publicId ?? "" })}
        />
        <input type="hidden" name="cover_image_url" value={cover.url} />
        <input type="hidden" name="cover_image_public_id" value={cover.publicId} />
      </div>
      <div className="md:col-span-2">
        <Field label="Short description">
          <TextInput name="short_description" defaultValue={merchant?.short_description ?? ""} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Description">
          <TextArea name="description" defaultValue={merchant?.description ?? ""} />
        </Field>
      </div>
      <div className="flex items-center gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={merchant ? Boolean(merchant.is_active) : true}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={Boolean(merchant?.is_featured)}
          />
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

function AdminMerchants() {
  const list = useServerFn(adminListMerchants);
  const update = useServerFn(adminUpdateMerchant);
  const create = useServerFn(adminCreateMerchant);
  const edit = useServerFn(adminEditMerchant);
  const remove = useServerFn(adminDeleteMerchant);
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: () => list({}),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-merchants"] });
    qc.invalidateQueries({ queryKey: ["admin-summary"] });
    qc.invalidateQueries({ queryKey: ["admin-refs"] });
  };

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status?: (typeof STATUSES)[number]; is_active?: boolean }) =>
      update({ data: vars }),
    onSuccess: () => {
      toast.success("Merchant updated");
      invalidate();
    },
    onError: () => toast.error("Could not update that merchant"),
  });

  const createMut = useMutation({
    mutationFn: (vars: any) => create({ data: vars }),
    onSuccess: () => {
      toast.success("Merchant created");
      setShowNew(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not create that merchant"),
  });

  const editMut = useMutation({
    mutationFn: (vars: any) => edit({ data: vars }),
    onSuccess: () => {
      toast.success("Merchant saved");
      setEditingMerchant(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save that merchant"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Merchant deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete that merchant"),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">Loading merchants…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">We couldn't load merchants.</p>;

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-lg font-serif">Merchants & Boutiques</h2>
        <Btn onClick={() => setShowNew(true)}>+ New merchant</Btn>
      </div>

      {/* Create Merchant Modal */}
      <AdminModal
        open={showNew}
        onOpenChange={setShowNew}
        title="Create New Merchant"
        description="Add a boutique atelier or partner merchant to DesignerSale."
      >
        <MerchantForm
          onSubmit={(v) => createMut.mutate(v)}
          pending={createMut.isPending}
          submitLabel="Create Merchant"
        />
      </AdminModal>

      {/* Edit Merchant Modal */}
      <AdminModal
        open={Boolean(editingMerchant)}
        onOpenChange={(open) => {
          if (!open) setEditingMerchant(null);
        }}
        title={`Edit Merchant — ${editingMerchant?.name ?? ""}`}
        description="Update merchant contact details, images, status and social links."
      >
        {editingMerchant && (
          <MerchantForm
            merchant={editingMerchant}
            onSubmit={(v) => editMut.mutate({ id: editingMerchant.id, ...v })}
            pending={editMut.isPending}
            submitLabel="Save Merchant"
          />
        )}
      </AdminModal>

      {(data as any[]).length === 0 && (
        <p className="text-sm text-muted-foreground">No merchants yet.</p>
      )}

      <ul className="border-t border-border">
        {(data as any[]).map((m) => (
          <li key={m.id} className="border-b border-border py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[m.city, m.country].filter(Boolean).join(", ") || "Location not set"}
                  {m.email ? ` · ${m.email}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <Check
                  label="Active"
                  checked={Boolean(m.is_active)}
                  onChange={(v) => mutation.mutate({ id: m.id, is_active: v })}
                />
                <select
                  aria-label={`Status for ${m.name}`}
                  value={m.status}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    mutation.mutate({
                      id: m.id,
                      status: e.target.value as (typeof STATUSES)[number],
                    })
                  }
                  className="border border-border bg-transparent px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LABEL[s]}
                    </option>
                  ))}
                </select>
                <Btn variant="ghost" onClick={() => setEditingMerchant(m)}>
                  Edit
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete ${m.name}? This cannot be undone.`)) deleteMut.mutate(m.id);
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
