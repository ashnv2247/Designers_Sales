import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Btn, Check, Field, SelectInput, TextArea, TextInput } from "./ui";
import {
  adminAddProductImage,
  adminCreateVariant,
  adminDeleteProductImage,
  adminDeleteVariant,
  adminEditProduct,
  adminEditVariant,
  adminGetProduct,
} from "@/lib/admin-content.functions";

const CONDITIONS = [
  "new",
  "new_with_tags",
  "new_without_tags",
  "excellent",
  "very_good",
  "good",
  "fair",
] as const;

type Refs = {
  merchants: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  colors: { id: string; name: string }[];
};

export function ProductEditor({ productId, refs }: { productId: string; refs: Refs }) {
  const get = useServerFn(adminGetProduct);
  const editProduct = useServerFn(adminEditProduct);
  const addImage = useServerFn(adminAddProductImage);
  const removeImage = useServerFn(adminDeleteProductImage);
  const createVariant = useServerFn(adminCreateVariant);
  const editVariant = useServerFn(adminEditVariant);
  const deleteVariant = useServerFn(adminDeleteVariant);
  const qc = useQueryClient();

  const key = ["admin-product", productId];
  const { data, isPending } = useQuery({ queryKey: key, queryFn: () => get({ data: { id: productId } }) });

  const [imageUrl, setImageUrl] = useState("");
  const [nv, setNv] = useState({ sku: "", sizes: "", original_price: "", discounted_price: "", stock: "0", color_id: "" });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) => editProduct({ data: { id: productId, ...patch } as never }),
    onSuccess: () => {
      toast.success("Saved");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save"),
  });

  const imageMut = useMutation({
    mutationFn: (vars: { add?: string; removeId?: string }) =>
      vars.add
        ? addImage({ data: { product_id: productId, image_url: vars.add, is_primary: false } })
        : removeImage({ data: { id: vars.removeId! } }),
    onSuccess: () => {
      setImageUrl("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not update images"),
  });

  const variantMut = useMutation({
    mutationFn: (vars: { create?: any; edit?: any; deleteId?: string }) =>
      vars.create
        ? createVariant({ data: vars.create })
        : vars.edit
          ? editVariant({ data: vars.edit })
          : deleteVariant({ data: { id: vars.deleteId! } }),
    onSuccess: () => {
      toast.success("Variant updated");
      setNv({ sku: "", sizes: "", original_price: "", discounted_price: "", stock: "0", color_id: "" });
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not update variant"),
  });

  if (isPending || !data) return <p className="py-6 text-xs text-muted-foreground">Loading piece…</p>;

  const p = data as any;

  return (
    <div className="space-y-10 border-t border-dashed border-border py-8">
      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget as HTMLFormElement);
          save.mutate({
            name: String(f.get("name")),
            merchant_id: String(f.get("merchant_id")),
            brand_id: String(f.get("brand_id") ?? ""),
            category_id: String(f.get("category_id") ?? ""),
            short_description: String(f.get("short_description") ?? ""),
            description: String(f.get("description") ?? ""),
            condition: String(f.get("condition")),
            composition: String(f.get("composition") ?? ""),
            care_instructions: String(f.get("care_instructions") ?? ""),
          });
        }}
      >
        <Field label="Name">
          <TextInput name="name" defaultValue={p.name} required />
        </Field>
        <Field label="Merchant">
          <SelectInput name="merchant_id" defaultValue={p.merchant_id}>
            {refs.merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Brand">
          <SelectInput name="brand_id" defaultValue={p.brand_id ?? ""}>
            <option value="">None</option>
            {refs.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Category">
          <SelectInput name="category_id" defaultValue={p.category_id ?? ""}>
            <option value="">None</option>
            {refs.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Condition">
          <SelectInput name="condition" defaultValue={p.condition}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Composition">
          <TextInput name="composition" defaultValue={p.composition ?? ""} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Short description">
            <TextInput name="short_description" defaultValue={p.short_description ?? ""} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description">
            <TextArea name="description" defaultValue={p.description ?? ""} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Care instructions">
            <TextInput name="care_instructions" defaultValue={p.care_instructions ?? ""} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Btn type="submit" disabled={save.isPending}>
            Save details
          </Btn>
        </div>
      </form>

      <div>
        <h3 className="mb-4 text-[0.62rem] uppercase tracking-[0.2em]">Images</h3>
        <div className="flex flex-wrap gap-3">
          {(p.product_images ?? []).map((img: any) => (
            <div key={img.id} className="w-24">
              <img src={img.image_url} alt="" className="h-28 w-24 object-cover" />
              <button
                onClick={() => imageMut.mutate({ removeId: img.id })}
                className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <TextInput
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://image-url"
            className="max-w-md"
          />
          <Btn
            variant="ghost"
            disabled={!imageUrl.trim() || imageMut.isPending}
            onClick={() => imageMut.mutate({ add: imageUrl.trim() })}
          >
            Add image
          </Btn>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-[0.62rem] uppercase tracking-[0.2em]">Variants</h3>
        <ul className="border-t border-border">
          {(p.product_variants ?? []).map((v: any) => (
            <li key={v.id} className="flex flex-wrap items-center gap-4 border-b border-border py-4 text-xs">
              <span className="min-w-32">{v.sku}</span>
              <span className="text-muted-foreground">{(v.sizes ?? []).join(", ") || "One size"}</span>
              <TextInput
                type="number"
                defaultValue={v.original_price}
                aria-label={`Price for ${v.sku}`}
                onBlur={(e) =>
                  variantMut.mutate({ edit: { id: v.id, original_price: Number(e.target.value) } })
                }
                className="w-28"
              />
              <TextInput
                type="number"
                defaultValue={v.stock_quantity}
                aria-label={`Stock for ${v.sku}`}
                onBlur={(e) =>
                  variantMut.mutate({ edit: { id: v.id, stock_quantity: Number(e.target.value) } })
                }
                className="w-24"
              />
              <Check
                label="Available"
                checked={Boolean(v.is_available)}
                onChange={(val) => variantMut.mutate({ edit: { id: v.id, is_available: val } })}
              />
              <Btn variant="danger" onClick={() => variantMut.mutate({ deleteId: v.id })}>
                Delete
              </Btn>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Field label="SKU">
            <TextInput value={nv.sku} onChange={(e) => setNv({ ...nv, sku: e.target.value })} />
          </Field>
          <Field label="Sizes (comma separated)">
            <TextInput value={nv.sizes} onChange={(e) => setNv({ ...nv, sizes: e.target.value })} />
          </Field>
          <Field label="Colour">
            <SelectInput value={nv.color_id} onChange={(e) => setNv({ ...nv, color_id: e.target.value })}>
              <option value="">None</option>
              {refs.colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Price">
            <TextInput
              type="number"
              value={nv.original_price}
              onChange={(e) => setNv({ ...nv, original_price: e.target.value })}
            />
          </Field>
          <Field label="Sale price">
            <TextInput
              type="number"
              value={nv.discounted_price}
              onChange={(e) => setNv({ ...nv, discounted_price: e.target.value })}
            />
          </Field>
          <Field label="Stock">
            <TextInput type="number" value={nv.stock} onChange={(e) => setNv({ ...nv, stock: e.target.value })} />
          </Field>
          <div className="md:col-span-3">
            <Btn
              disabled={!nv.sku.trim() || !nv.original_price || variantMut.isPending}
              onClick={() =>
                variantMut.mutate({
                  create: {
                    product_id: productId,
                    sku: nv.sku.trim(),
                    sizes: nv.sizes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    original_price: Number(nv.original_price),
                    discounted_price: nv.discounted_price ? Number(nv.discounted_price) : null,
                    stock_quantity: Number(nv.stock || 0),
                    color_id: nv.color_id,
                    currency: "AUD",
                    is_default: (p.product_variants ?? []).length === 0,
                    is_available: true,
                  },
                })
              }
            >
              Add variant
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
