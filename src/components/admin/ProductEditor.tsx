import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Btn, Check, Field, SelectInput, TextArea, TextInput } from "./ui";
import { CloudinaryImageUploader, type UploadedCloudinaryImage } from "./CloudinaryImageUploader";
import { adminEditProduct, adminGetProduct } from "@/lib/admin-content.functions";

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
};

export function ProductEditor({ productId, refs }: { productId: string; refs: Refs }) {
  const get = useServerFn(adminGetProduct);
  const editProduct = useServerFn(adminEditProduct);
  const qc = useQueryClient();

  const key = ["admin-product", productId];
  const { data, isPending } = useQuery({
    queryKey: key,
    queryFn: () => get({ data: { id: productId } }),
  });

  // State arrays matching normalized tables
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // Repeatable rows states
  const [materials, setMaterials] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<{ key: string; val: string }[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  // New variant form states
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#FFFFFF");
  const [newSize, setNewSize] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newStock, setNewStock] = useState<number>(10);
  const [newOrigOverride, setNewOrigOverride] = useState("");
  const [newDiscOverride, setNewDiscOverride] = useState("");

  useEffect(() => {
    if (data) {
      const p = data as any;
      setVariants(p.product_variants ?? []);
      setImages(p.product_images ?? []);
      setMaterials(p.materials ?? []);

      const mObj = p.measurements ?? {};
      setMeasurements(Object.entries(mObj).map(([k, v]) => ({ key: k, val: String(v) })));

      setTagsInput((p.tags ?? []).join(", "));
    }
  }, [data]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      editProduct({ data: { id: productId, ...patch } as any }),
    onSuccess: () => {
      toast.success("Product & variants saved successfully");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save details"),
  });

  if (isPending || !data)
    return <p className="py-6 text-xs text-muted-foreground">Loading piece…</p>;

  const p = data as any;

  // Handle main product save
  const handleSaveDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);

    // Convert measurements rows to object
    const measurementsObj: Record<string, string> = {};
    for (const row of measurements) {
      if (row.key.trim() && row.val.trim()) {
        measurementsObj[row.key.trim()] = row.val.trim();
      }
    }

    // Convert tags comma string to array
    const tagsArr = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    save.mutate({
      name: String(f.get("name")),
      merchant_id: String(f.get("merchant_id")),
      brand_id: String(f.get("brand_id") ?? ""),
      category_id: String(f.get("category_id") ?? ""),
      product_type_id: String(f.get("product_type_id") ?? ""),
      short_description: String(f.get("short_description") ?? ""),
      description: String(f.get("description") ?? ""),
      condition: String(f.get("condition")),
      condition_notes: String(f.get("condition_notes") ?? ""),
      composition: String(f.get("composition") ?? ""),
      care_instructions: String(f.get("care_instructions") ?? ""),
      sku: String(f.get("sku") ?? ""),
      external_product_url: String(f.get("external_product_url") ?? ""),
      // Retained only for rollback compatibility; storefront pricing is variant-authoritative.
      original_price: Number(p.original_price || 0),
      discounted_price: p.discounted_price != null ? Number(p.discounted_price) : null,
      currency: String(f.get("currency") || "AUD"),
      fit: String(f.get("fit") ?? ""),
      pattern: String(f.get("pattern") ?? ""),
      neckline: String(f.get("neckline") ?? ""),
      sleeve_length: String(f.get("sleeve_length") ?? ""),
      dress_length: String(f.get("dress_length") ?? ""),
      gender: String(f.get("gender") ?? ""),
      season: String(f.get("season") ?? ""),
      status: String(f.get("status")),
      is_featured: f.get("is_featured") === "on",
      is_new_arrival: f.get("is_new_arrival") === "on",
      seo_title: String(f.get("seo_title") ?? ""),
      seo_description: String(f.get("seo_description") ?? ""),
      materials,
      measurements: measurementsObj,
      tags: tagsArr,
      variants,
      images,
    });
  };

  // Variants handlers
  const addVariant = () => {
    const sizes = [
      ...new Set(
        newSize
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
      ),
    ];
    if (!newColorName.trim() || sizes.length === 0) {
      toast.error("Color name and at least one size are required");
      return;
    }

    const color = newColorName.trim();
    const duplicates = sizes.filter((size) =>
      variants.some(
        (v) =>
          v.color_name.toLowerCase() === color.toLowerCase() &&
          v.size.toLowerCase() === size.toLowerCase(),
      ),
    );
    if (duplicates.length) {
      toast.error(`Already exists: ${duplicates.join(", ")}`);
      return;
    }

    const origOverride = newOrigOverride ? Number(newOrigOverride) : null;
    const discOverride = newDiscOverride ? Number(newDiscOverride) : null;

    if (origOverride !== null && origOverride < 0) {
      toast.error("Original price override must be non-negative");
      return;
    }
    if (discOverride !== null && discOverride < 0) {
      toast.error("Discounted price override must be non-negative");
      return;
    }
    if (origOverride !== null && discOverride !== null && discOverride > origOverride) {
      toast.error("Discounted price override cannot be greater than original override");
      return;
    }

    const newVariants = sizes.map((size) => ({
      color_name: color,
      color_hex: newColorHex || null,
      size,
      sku: newSku.trim() ? `${newSku.trim()}-${size}` : null,
      stock_quantity: Math.max(0, newStock),
      original_price: origOverride,
      discounted_price: discOverride,
      is_active: true,
    }));

    setVariants([...variants, ...newVariants]);
    setNewColorName("");
    setNewColorHex("#FFFFFF");
    setNewSize("");
    setNewSku("");
    setNewStock(10);
    setNewOrigOverride("");
    setNewDiscOverride("");
    toast.success(`${color} added with ${sizes.length} size${sizes.length === 1 ? "" : "s"}`);
  };

  const removeVariant = (index: number) => {
    const next = [...variants];
    next.splice(index, 1);
    setVariants(next);
    toast.success("Variant removed locally");
  };

  const updateVariantField = (index: number, key: string, val: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [key]: val };
    setVariants(next);
  };

  // Materials handlers
  const addMaterialRow = () => setMaterials([...materials, ""]);
  const updateMaterialRow = (index: number, val: string) => {
    const next = [...materials];
    next[index] = val;
    setMaterials(next);
  };
  const removeMaterialRow = (index: number) => {
    const next = [...materials];
    next.splice(index, 1);
    setMaterials(next);
  };

  // Measurements handlers
  const addMeasurementRow = () => setMeasurements([...measurements, { key: "", val: "" }]);
  const updateMeasurementRow = (index: number, fld: "key" | "val", val: string) => {
    const next = [...measurements];
    next[index] = { ...next[index], [fld]: val };
    setMeasurements(next);
  };
  const removeMeasurementRow = (index: number) => {
    const next = [...measurements];
    next.splice(index, 1);
    setMeasurements(next);
  };

  // Cloudinary images handlers
  const handleImageUploaded = (uploaded: UploadedCloudinaryImage) => {
    const nextImg = {
      image_url: uploaded.url,
      image_public_id: uploaded.publicId,
      color_name: null,
      alt_text: p.name,
      display_order: images.length,
      is_primary: images.length === 0,
    };
    setImages([...images, nextImg]);
    toast.success("Image uploaded successfully");
  };

  const removeImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    // Ensure at least one primary image remains if there are still images
    if (next.length > 0 && !next.some((img) => img.is_primary)) {
      next[0].is_primary = true;
    }
    setImages(next);
  };

  const updateImageField = (index: number, key: string, val: any) => {
    const next = [...images];
    if (key === "is_primary" && val === true) {
      // Unset all other primary images
      next.forEach((img, i) => {
        img.is_primary = i === index;
      });
    } else {
      next[index] = { ...next[index], [key]: val };
    }
    setImages(next);
  };

  // Get active colors for color dropdown
  const colorList = [...new Set(variants.map((v) => v.color_name).filter(Boolean))] as string[];
  const variantGroups = colorList.map((color) => ({
    color,
    entries: variants
      .map((variant, index) => ({ variant, index }))
      .filter(({ variant }) => variant.color_name === color),
  }));

  const updateGroupField = (color: string, key: string, value: unknown) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.color_name === color ? { ...variant, [key]: value } : variant,
      ),
    );
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSaveDetails} className="grid gap-6 md:grid-cols-2">
        {/* Basic Information Section */}
        <div className="md:col-span-2">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Basic Information
          </h3>
        </div>

        <Field label="Name">
          <TextInput name="name" defaultValue={p.name} required />
        </Field>
        <Field label="Merchant">
          <SelectInput name="merchant_id" defaultValue={p.merchant_id} required>
            {refs.merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Brand / Designer">
          <SelectInput name="brand_id" defaultValue={p.brand_id || ""}>
            <option value="">None</option>
            {refs.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Category">
          <SelectInput name="category_id" defaultValue={p.category_id || ""}>
            <option value="">None</option>
            {refs.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Status">
          <SelectInput name="status" defaultValue={p.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold Out</option>
            <option value="archived">Archived</option>
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

        <div className="md:col-span-2">
          <Field label="Short description">
            <TextInput name="short_description" defaultValue={p.short_description || ""} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Full description">
            <TextArea name="description" defaultValue={p.description || ""} rows={4} />
          </Field>
        </div>

        {/* Pricing & Logistics */}
        <div className="md:col-span-2 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Pricing & Logistics
          </h3>
        </div>

        <Field label="Currency">
          <TextInput name="currency" defaultValue={p.currency || "AUD"} required />
        </Field>
        <Field label="Base SKU">
          <TextInput name="sku" defaultValue={p.sku || ""} />
        </Field>

        {/* Additional Attributes */}
        <div className="md:col-span-2 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Product Attributes
          </h3>
        </div>

        <Field label="Composition">
          <TextInput name="composition" defaultValue={p.composition || ""} />
        </Field>
        <Field label="Care Instructions">
          <TextInput name="care_instructions" defaultValue={p.care_instructions || ""} />
        </Field>
        <Field label="Fit">
          <TextInput name="fit" defaultValue={p.fit || ""} />
        </Field>
        <Field label="Pattern">
          <TextInput name="pattern" defaultValue={p.pattern || ""} />
        </Field>
        <Field label="Neckline">
          <TextInput name="neckline" defaultValue={p.neckline || ""} />
        </Field>
        <Field label="Sleeve Length">
          <TextInput name="sleeve_length" defaultValue={p.sleeve_length || ""} />
        </Field>
        <Field label="Dress Length">
          <TextInput name="dress_length" defaultValue={p.dress_length || ""} />
        </Field>
        <Field label="Gender">
          <TextInput name="gender" defaultValue={p.gender || ""} />
        </Field>
        <Field label="Season">
          <TextInput name="season" defaultValue={p.season || ""} />
        </Field>
        <Field label="Condition Notes">
          <TextInput name="condition_notes" defaultValue={p.condition_notes || ""} />
        </Field>
        <div className="md:col-span-2">
          <Field label="External product checkout URL (Optional)">
            <TextInput name="external_product_url" defaultValue={p.external_product_url || ""} />
          </Field>
        </div>

        <div className="flex items-center gap-6 md:col-span-2 py-2">
          <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            <input type="checkbox" name="is_featured" defaultChecked={p.is_featured} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            <input type="checkbox" name="is_new_arrival" defaultChecked={p.is_new_arrival} />
            New Arrival
          </label>
        </div>

        {/* De-normalized Array Fields (Materials, Measurements, Tags) */}
        <div className="md:col-span-2 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Composition, Sizing & Tags
          </h3>
        </div>

        {/* Materials list */}
        <div className="border border-border p-4 bg-cream/10 rounded-md">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Materials Array
            </span>
            <Btn
              type="button"
              variant="ghost"
              onClick={addMaterialRow}
              className="py-1 px-3 text-[0.65rem]"
            >
              + Add
            </Btn>
          </div>
          <div className="space-y-2">
            {materials.map((mat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <TextInput
                  value={mat}
                  onChange={(e) => updateMaterialRow(i, e.target.value)}
                  placeholder="e.g. 70% Cotton"
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeMaterialRow(i)}
                  className="text-burgundy text-xs hover:underline shrink-0 px-2"
                >
                  Remove
                </button>
              </div>
            ))}
            {materials.length === 0 && (
              <p className="text-[0.7rem] text-muted-foreground italic text-center py-2">
                No materials specified
              </p>
            )}
          </div>
        </div>

        {/* Measurements list */}
        <div className="border border-border p-4 bg-cream/10 rounded-md">
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Measurements JSON
            </span>
            <Btn
              type="button"
              variant="ghost"
              onClick={addMeasurementRow}
              className="py-1 px-3 text-[0.65rem]"
            >
              + Add Row
            </Btn>
          </div>
          <div className="space-y-2">
            {measurements.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <TextInput
                  value={row.key}
                  onChange={(e) => updateMeasurementRow(i, "key", e.target.value)}
                  placeholder="Name (e.g. chest)"
                  className="text-xs w-1/2"
                />
                <TextInput
                  value={row.val}
                  onChange={(e) => updateMeasurementRow(i, "val", e.target.value)}
                  placeholder="Value (e.g. 42 cm)"
                  className="text-xs w-1/2"
                />
                <button
                  type="button"
                  onClick={() => removeMeasurementRow(i)}
                  className="text-burgundy text-xs hover:underline shrink-0 px-2"
                >
                  Remove
                </button>
              </div>
            ))}
            {measurements.length === 0 && (
              <p className="text-[0.7rem] text-muted-foreground italic text-center py-2">
                No measurements specified
              </p>
            )}
          </div>
        </div>

        {/* Tags Array Input */}
        <div className="md:col-span-2">
          <Field label="Product Tags (Comma separated, e.g. summer, archive, quiet-luxury)">
            <TextInput
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="summer, archive"
            />
          </Field>
        </div>

        {/* Variants Section */}
        <div className="md:col-span-2 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Inventory Variants
          </h3>
        </div>

        <div className="md:col-span-2 space-y-4">
          {variantGroups.map(({ color, entries }) => {
            const first = entries[0].variant;
            const needsPrice = first.original_price == null;
            return (
              <section key={color} className="rounded-md border border-border bg-background p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Color Name">
                    <TextInput
                      value={color}
                      onChange={(e) => updateGroupField(color, "color_name", e.target.value)}
                    />
                  </Field>
                  <Field label="Swatch Hex">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={first.color_hex || "#FFFFFF"}
                        onChange={(e) => updateGroupField(color, "color_hex", e.target.value)}
                      />
                      <TextInput
                        value={first.color_hex || ""}
                        onChange={(e) => updateGroupField(color, "color_hex", e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Original Price (AUD)">
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={first.original_price ?? ""}
                      onChange={(e) =>
                        updateGroupField(
                          color,
                          "original_price",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="Price required"
                    />
                  </Field>
                  <Field label="Sale Price (Optional)">
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={first.discounted_price ?? ""}
                      onChange={(e) =>
                        updateGroupField(
                          color,
                          "discounted_price",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </Field>
                </div>
                {needsPrice && (
                  <p className="mt-3 text-xs font-semibold text-destructive">Price required</p>
                )}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Size</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">Active</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(({ variant, index }) => (
                        <tr key={variant.id ?? index} className="border-b border-border/40">
                          <td className="p-2">
                            <TextInput
                              value={variant.size}
                              onChange={(e) => updateVariantField(index, "size", e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <TextInput
                              value={variant.sku || ""}
                              onChange={(e) =>
                                updateVariantField(index, "sku", e.target.value || null)
                              }
                            />
                          </td>
                          <td className="p-2">
                            <TextInput
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) =>
                                updateVariantField(index, "stock_quantity", Number(e.target.value))
                              }
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={variant.is_active}
                              onChange={(e) =>
                                updateVariantField(index, "is_active", e.target.checked)
                              }
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              className="text-destructive"
                              onClick={() => removeVariant(index)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
          {!variantGroups.length && (
            <p className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
              No variants defined yet.
            </p>
          )}
        </div>

        {/* Add Variant Form Panel */}
        <div className="md:col-span-2 border border-border p-4 bg-cream/10 rounded-md grid gap-4 md:grid-cols-4 items-end">
          <div className="md:col-span-4 border-b border-border/40 pb-1.5 mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Add Color with Sizes
            </span>
          </div>
          <Field label="Color Name">
            <TextInput
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Black"
              className="text-xs"
            />
          </Field>
          <div className="flex flex-col gap-2">
            <label className="rule-label text-muted-foreground">Swatch Hex</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer bg-transparent p-0"
              />
              <TextInput
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="text-xs flex-grow"
              />
            </div>
          </div>
          <Field label="Sizes (comma separated)">
            <div className="space-y-2">
              <TextInput
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g. S, M, L or 38, OS"
                className="text-xs"
              />
              <div className="flex flex-wrap gap-1">
                {["XS", "S", "M", "L", "XL", "XXL", "OS"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="rounded border px-2 py-1 text-[10px]"
                    onClick={() => {
                      const values = newSize
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean);
                      if (!values.includes(preset)) setNewSize([...values, preset].join(", "));
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="Variant SKU (Optional)">
            <TextInput
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              placeholder="SKU"
              className="text-xs"
            />
          </Field>
          <Field label="Stock Qty">
            <TextInput
              type="number"
              value={String(newStock)}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="text-xs"
            />
          </Field>
          <Field label="Original Price">
            <TextInput
              type="number"
              step="0.01"
              value={newOrigOverride}
              onChange={(e) => setNewOrigOverride(e.target.value)}
              placeholder="Required to sell"
              className="text-xs"
            />
          </Field>
          <Field label="Sale Price (Optional)">
            <TextInput
              type="number"
              step="0.01"
              value={newDiscOverride}
              onChange={(e) => setNewDiscOverride(e.target.value)}
              placeholder="None"
              className="text-xs"
            />
          </Field>
          <div>
            <Btn
              type="button"
              variant="ghost"
              onClick={addVariant}
              className="w-full text-center py-2 text-xs"
            >
              + Add Color & Sizes
            </Btn>
          </div>
        </div>

        {/* Media & Images Section */}
        <div className="md:col-span-2 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-2">
            Product Images
          </h3>
        </div>

        {/* Existing Images list */}
        <div className="md:col-span-2 grid gap-4 grid-cols-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative border border-border p-2 bg-cream/5 rounded flex flex-col justify-between"
            >
              <img src={img.image_url} alt="" className="aspect-[3/4] w-full object-cover mb-2" />
              <div className="space-y-1.5 text-[0.6rem] uppercase tracking-wider">
                {/* Color association dropdown */}
                <label className="block">
                  <span className="text-muted-foreground">Color</span>
                  <SelectInput
                    value={img.color_name || ""}
                    onChange={(e) => updateImageField(i, "color_name", e.target.value || null)}
                    className="text-[10px] py-0.5 mt-0.5"
                  >
                    <option value="">General (No Color)</option>
                    {colorList.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </SelectInput>
                </label>

                {/* Display order */}
                <label className="block">
                  <span className="text-muted-foreground">Sort Order</span>
                  <TextInput
                    type="number"
                    value={String(img.display_order ?? 0)}
                    onChange={(e) => updateImageField(i, "display_order", Number(e.target.value))}
                    className="text-[10px] py-0.5 mt-0.5"
                  />
                </label>

                {/* Primary option */}
                <button
                  type="button"
                  onClick={() => updateImageField(i, "is_primary", true)}
                  className={`block text-left w-full hover:underline font-bold mt-1.5 ${img.is_primary ? "text-gold" : "text-muted-foreground"}`}
                >
                  {img.is_primary ? "★ Primary Image" : "☆ Make Primary"}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="block text-left w-full text-burgundy font-bold hover:underline mt-1"
                >
                  Delete Image
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <p className="md:col-span-4 text-xs text-muted-foreground italic text-center py-6">
              No images uploaded yet. Upload images below.
            </p>
          )}
        </div>

        {/* Cloudinary uploader */}
        <div className="md:col-span-2 pt-2">
          <CloudinaryImageUploader
            label="Upload Image to Product Gallery"
            entityType="product"
            entityId={productId}
            value=""
            onChange={(uploaded) => {
              if (uploaded) handleImageUploaded(uploaded);
            }}
          />
        </div>

        {/* Save All Button */}
        <div className="md:col-span-2 pt-6 border-t border-border mt-6">
          <Btn type="submit" disabled={save.isPending} className="px-10 py-4 text-xs font-semibold">
            Save Product & Variants
          </Btn>
        </div>
      </form>
    </div>
  );
}
