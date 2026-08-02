/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AdminModal } from "./AdminModal";
import { Btn, SelectInput, TextInput } from "./ui";
import {
  calculateSalePrice,
  formatCurrency,
  type SaleDiscountBase,
  type SaleDiscountType,
} from "@/lib/sale-pricing";

export type SaleProductFormValue = {
  product_id: string;
  display_order: number;
  discount_type: SaleDiscountType;
  discount_base: SaleDiscountBase;
  discount_value: number;
  is_manually_overridden: boolean;
  refresh_snapshots?: boolean;
};

type Rule = Omit<SaleProductFormValue, "product_id" | "display_order">;
const defaultRule: Rule = {
  discount_type: "percentage",
  discount_base: "current_price",
  discount_value: 10,
  is_manually_overridden: false,
};

function productPricing(product: any) {
  const variants = (product.product_variants ?? []).filter(
    (variant: any) => variant.is_active && variant.original_price != null,
  );
  if (!variants.length) return null;
  const priced = variants.map((variant: any) => ({
    original: Number(variant.original_price),
    current: Number(variant.discounted_price ?? variant.original_price),
  }));
  return priced.reduce((best: any, price: any) => (price.current < best.current ? price : best));
}

export function SalePricingManager({
  products,
  existing = [],
  merchantId,
  onChange,
}: {
  products: any[];
  existing?: any[];
  merchantId?: string;
  onChange: (products: SaleProductFormValue[]) => void;
}) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        existing.map((relation) => [
          relation.product_id,
          {
            discount_type: relation.discount_type ?? "percentage",
            discount_base: relation.discount_base ?? "current_price",
            discount_value: Number(relation.discount_value ?? 0),
            is_manually_overridden: Boolean(relation.is_manually_overridden),
          } satisfies Rule,
        ]),
      ) as Record<string, Rule>,
    [existing],
  );
  const [rules, setRules] = useState<Record<string, Rule>>(initial);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [status, setStatus] = useState("all");
  const [stock, setStock] = useState("all");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState("all");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(0);
  const [applyTo, setApplyTo] = useState("selected");
  const [bulk, setBulk] = useState<Rule>(defaultRule);
  const [preserveOverrides, setPreserveOverrides] = useState(true);
  const [preview, setPreview] = useState<Array<{
    product: any;
    price: number;
    error?: string;
  }> | null>(null);

  useEffect(() => {
    onChange(
      Object.entries(rules).map(([product_id, rule], display_order) => ({
        product_id,
        display_order,
        ...rule,
      })),
    );
  }, [rules, onChange]);

  const eligible = useMemo(
    () => products.filter((product) => !merchantId || product.merchant_id === merchantId),
    [products, merchantId],
  );
  const filtered = useMemo(() => {
    const rows = eligible.filter((product) => {
      const availableStock = (product.product_variants ?? []).reduce(
        (total: number, variant: any) =>
          total + (variant.is_active ? (variant.stock_quantity ?? 0) : 0),
        0,
      );
      return (
        (!deferredSearch ||
          `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(deferredSearch)) &&
        (!selectedOnly || Boolean(rules[product.id])) &&
        (status === "all" || product.status === status) &&
        (brand === "all" || product.brand_id === brand) &&
        (category === "all" || product.category_id === category) &&
        (productType === "all" || product.product_type_id === productType) &&
        (discountFilter === "all" ||
          (discountFilter === "normal"
            ? (product.product_variants ?? []).some(
                (variant: any) => variant.discounted_price != null,
              )
            : discountFilter === "none"
              ? !(product.product_variants ?? []).some(
                  (variant: any) => variant.discounted_price != null,
                )
              : discountFilter === "sale"
                ? Boolean(rules[product.id])
                : !rules[product.id])) &&
        (stock === "all" || (stock === "in" ? availableStock > 0 : availableStock === 0))
      );
    });
    return rows.sort((a, b) => {
      const ap = productPricing(a)?.current ?? Infinity;
      const bp = productPricing(b)?.current ?? Infinity;
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "current-asc") return ap - bp;
      if (sort === "current-desc") return bp - ap;
      if (sort === "recent") return String(b.created_at).localeCompare(String(a.created_at));
      return a.name.localeCompare(b.name);
    });
  }, [
    eligible,
    deferredSearch,
    selectedOnly,
    rules,
    status,
    stock,
    brand,
    category,
    productType,
    discountFilter,
    sort,
  ]);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const brands = [
    ...new Map(
      eligible.filter((p) => p.brand_id).map((p) => [p.brand_id, p.brands?.name ?? "Brand"]),
    ).entries(),
  ];
  const categories = [
    ...new Map(
      eligible
        .filter((p) => p.category_id)
        .map((p) => [p.category_id, p.categories?.name ?? "Category"]),
    ).entries(),
  ];
  const productTypes = [
    ...new Map(
      eligible
        .filter((p) => p.product_type_id)
        .map((p) => [p.product_type_id, `Product type ${String(p.product_type_id).slice(0, 6)}`]),
    ).entries(),
  ];

  const toggle = (id: string) =>
    setRules((current) => {
      if (current[id]) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: { ...defaultRule } };
    });
  const update = (id: string, patch: Partial<Rule>) =>
    setRules((current) => ({
      ...current,
      [id]: { ...(current[id] ?? defaultRule), ...patch, is_manually_overridden: true },
    }));
  const refreshSnapshots = (product: any) => {
    const old = existing.find((relation) => relation.product_id === product.id);
    const latest = productPricing(product);
    if (!latest) return;
    const message =
      old?.original_price_snapshot != null
        ? `Refresh price snapshots for ${product.name}?\n\nOriginal: ${formatCurrency(Number(old.original_price_snapshot), product.currency)} → ${formatCurrency(latest.original, product.currency)}\nCurrent: ${formatCurrency(Number(old.current_price_snapshot), product.currency)} → ${formatCurrency(latest.current, product.currency)}\n\nThe sale price will be recalculated when you save.`
        : `Capture current price snapshots for ${product.name} and recalculate its sale price when you save?`;
    if (!window.confirm(message)) return;
    setRules((current) => ({
      ...current,
      [product.id]: { ...(current[product.id] ?? defaultRule), refresh_snapshots: true },
    }));
  };

  const previewBulk = () => {
    const baseTargets =
      applyTo === "filtered"
        ? filtered
        : applyTo === "without-pricing"
          ? eligible.filter((product) => !rules[product.id])
          : applyTo === "normal-discount"
            ? eligible.filter((product) =>
                (product.product_variants ?? []).some(
                  (variant: any) => variant.discounted_price != null,
                ),
              )
            : eligible.filter((product) => rules[product.id]);
    const targets = baseTargets.filter(
      (product) => !(preserveOverrides && rules[product.id]?.is_manually_overridden),
    );
    setPreview(
      targets.map((product) => {
        const pricing = productPricing(product);
        if (!pricing) return { product, price: 0, error: "No valid variant pricing" };
        try {
          return {
            product,
            price: calculateSalePrice({
              originalPrice: pricing.original,
              currentPrice: pricing.current,
              discountType: bulk.discount_type,
              discountBase: bulk.discount_base,
              discountValue: bulk.discount_value,
            }),
          };
        } catch (error) {
          return {
            product,
            price: 0,
            error: error instanceof Error ? error.message : "Invalid discount",
          };
        }
      }),
    );
  };
  const applyPreview = () => {
    const validIds = new Set(preview?.filter((item) => !item.error).map((item) => item.product.id));
    setRules((current) => {
      const next = { ...current };
      validIds.forEach((id) => {
        next[id] = { ...bulk, is_manually_overridden: false };
      });
      return next;
    });
    setPreview(null);
  };

  const selectedProducts = eligible.filter((product) => rules[product.id]);
  const summary = selectedProducts.reduce(
    (total, product) => {
      const pricing = productPricing(product);
      if (!pricing) return total;
      try {
        const rule = rules[product.id];
        const sale = calculateSalePrice({
          originalPrice: pricing.original,
          currentPrice: pricing.current,
          discountType: rule.discount_type,
          discountBase: rule.discount_base,
          discountValue: rule.discount_value,
        });
        total.original += pricing.original;
        total.current += pricing.current;
        total.sale += sale;
      } catch {
        /* validation is shown per row */
      }
      return total;
    },
    { original: 0, current: 0, sale: 0 },
  );

  return (
    <section className="space-y-4 rounded border border-border bg-muted/20 p-4 md:col-span-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">Products in this sale</h3>
      <div className="grid gap-2 md:grid-cols-4">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
        />
        <SelectInput
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Product status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="sold_out">Sold out</option>
        </SelectInput>
        <SelectInput value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Stock">
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </SelectInput>
        <SelectInput
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="current-asc">Current price low–high</option>
          <option value="current-desc">Current price high–low</option>
          <option value="recent">Recently added</option>
        </SelectInput>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <SelectInput
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          aria-label="Brand filter"
        >
          <option value="all">All brands</option>
          {brands.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category filter"
        >
          <option value="all">All categories</option>
          {categories.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          aria-label="Product type filter"
        >
          <option value="all">All product types</option>
          {productTypes.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          value={discountFilter}
          onChange={(e) => setDiscountFilter(e.target.value)}
          aria-label="Discount filter"
        >
          <option value="all">All discounts</option>
          <option value="normal">Has normal discount</option>
          <option value="none">No normal discount</option>
          <option value="sale">Has sale discount</option>
          <option value="no-sale">No sale discount</option>
        </SelectInput>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <Btn
          type="button"
          variant="ghost"
          onClick={() =>
            setRules((r) => ({
              ...r,
              ...Object.fromEntries(filtered.map((p) => [p.id, r[p.id] ?? { ...defaultRule }])),
            }))
          }
        >
          Select filtered
        </Btn>
        <Btn
          type="button"
          variant="ghost"
          onClick={() =>
            setRules((r) => {
              const next = { ...r };
              filtered.forEach((p) => delete next[p.id]);
              return next;
            })
          }
        >
          Clear filtered
        </Btn>
        <Btn type="button" variant="ghost" onClick={() => setSelectedOnly((v) => !v)}>
          {selectedOnly ? "Show all" : "Selected only"}
        </Btn>
        <Btn
          type="button"
          variant="ghost"
          onClick={() =>
            setRules((r) => ({
              ...r,
              ...Object.fromEntries(visible.map((p) => [p.id, r[p.id] ?? { ...defaultRule }])),
            }))
          }
        >
          Select visible
        </Btn>
        <Btn
          type="button"
          variant="ghost"
          onClick={() =>
            setRules((r) => {
              const next = { ...r };
              visible.forEach((p) => delete next[p.id]);
              return next;
            })
          }
        >
          Clear visible
        </Btn>
        <Btn
          type="button"
          variant="ghost"
          onClick={() => {
            setSearch("");
            setStatus("all");
            setStock("all");
            setBrand("all");
            setCategory("all");
            setProductType("all");
            setDiscountFilter("all");
            setSelectedOnly(false);
          }}
        >
          Reset filters
        </Btn>
      </div>

      <div className="sticky top-16 z-10 rounded border bg-background p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold">Bulk Discount</p>
        <div className="grid gap-2 md:grid-cols-5">
          <SelectInput
            value={applyTo}
            onChange={(e) => setApplyTo(e.target.value)}
            aria-label="Apply bulk discount to"
          >
            <option value="selected">Selected products</option>
            <option value="filtered">All filtered products</option>
            <option value="without-pricing">Products without sale pricing</option>
            <option value="normal-discount">Products with normal discount</option>
          </SelectInput>
          <SelectInput
            value={bulk.discount_type}
            onChange={(e) =>
              setBulk((v) => ({ ...v, discount_type: e.target.value as SaleDiscountType }))
            }
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed amount</option>
            <option value="final_price">Set final price</option>
          </SelectInput>
          {bulk.discount_type !== "final_price" && (
            <SelectInput
              value={bulk.discount_base}
              onChange={(e) =>
                setBulk((v) => ({ ...v, discount_base: e.target.value as SaleDiscountBase }))
              }
            >
              <option value="current_price">Current price</option>
              <option value="original_price">Original price</option>
            </SelectInput>
          )}
          <TextInput
            type="number"
            min="0"
            step="0.01"
            value={bulk.discount_value}
            onChange={(e) => setBulk((v) => ({ ...v, discount_value: Number(e.target.value) }))}
            aria-label="Bulk discount value"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={preserveOverrides}
              onChange={(e) => setPreserveOverrides(e.target.checked)}
            />{" "}
            Preserve manual overrides
          </label>
          <Btn type="button" onClick={previewBulk}>
            Preview changes
          </Btn>
        </div>
      </div>

      <div className="max-h-[34rem] space-y-2 overflow-y-auto">
        {visible.map((product) => {
          const pricing = productPricing(product);
          const rule = rules[product.id];
          let salePrice: number | null = null;
          let error = "";
          if (rule && pricing)
            try {
              salePrice = calculateSalePrice({
                originalPrice: pricing.original,
                currentPrice: pricing.current,
                discountType: rule.discount_type,
                discountBase: rule.discount_base,
                discountValue: rule.discount_value,
              });
            } catch (e) {
              error = e instanceof Error ? e.message : "Invalid discount";
            }
          return (
            <article
              key={product.id}
              className={`rounded border p-3 ${rule ? "border-gold bg-gold/5" : "border-border"} ${error ? "border-destructive" : ""}`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(rule)}
                  onChange={() => toggle(product.id)}
                  aria-label={`Select ${product.name}`}
                />
                <img
                  src={
                    [...(product.product_images ?? [])].sort(
                      (a: any, b: any) =>
                        Number(b.is_primary) - Number(a.is_primary) ||
                        (a.display_order ?? 0) - (b.display_order ?? 0),
                    )[0]?.image_url ?? "/placeholder.svg"
                  }
                  alt=""
                  className="h-16 w-12 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.brands?.name ?? "No brand"} ·{" "}
                    {product.categories?.name ?? "No category"} · {product.sku ?? "No SKU"}
                  </p>
                  {pricing ? (
                    <p className="mt-1 text-xs">
                      Original {formatCurrency(pricing.original, product.currency)} · Current{" "}
                      {formatCurrency(pricing.current, product.currency)}
                      {salePrice != null
                        ? ` · Sale ${formatCurrency(salePrice, product.currency)}`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">No valid variant pricing</p>
                  )}
                </div>
                {rule?.is_manually_overridden && (
                  <span className="text-[10px] font-semibold uppercase text-gold">
                    Manual override
                  </span>
                )}
              </div>
              {rule && (
                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  <SelectInput
                    value={rule.discount_type}
                    onChange={(e) =>
                      update(product.id, { discount_type: e.target.value as SaleDiscountType })
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed amount</option>
                    <option value="final_price">Final price</option>
                  </SelectInput>
                  {rule.discount_type !== "final_price" && (
                    <SelectInput
                      value={rule.discount_base}
                      onChange={(e) =>
                        update(product.id, { discount_base: e.target.value as SaleDiscountBase })
                      }
                    >
                      <option value="current_price">Current price</option>
                      <option value="original_price">Original price</option>
                    </SelectInput>
                  )}
                  <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={rule.discount_value}
                    onChange={(e) => update(product.id, { discount_value: Number(e.target.value) })}
                  />
                  <Btn
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      update(product.id, { ...defaultRule, is_manually_overridden: false })
                    }
                  >
                    Reset discount
                  </Btn>
                  <Btn type="button" variant="ghost" onClick={() => refreshSnapshots(product)}>
                    Refresh snapshots
                  </Btn>
                </div>
              )}
              {error && (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  {error}
                </p>
              )}
            </article>
          );
        })}
        {!visible.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No products match your search or filters.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span>
          Page {safePage + 1} of {pageCount} · {filtered.length} matching
        </span>
        <div className="flex gap-2">
          <Btn
            type="button"
            variant="ghost"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Btn>
          <Btn
            type="button"
            variant="ghost"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Btn>
        </div>
      </div>
      <div className="grid gap-2 rounded bg-background p-3 text-sm sm:grid-cols-4">
        <span>
          Selected {selectedProducts.length} of {eligible.length}
        </span>
        <span>Current {formatCurrency(summary.current)}</span>
        <span>Sale {formatCurrency(summary.sale)}</span>
        <span>Total saving {formatCurrency(summary.original - summary.sale)}</span>
      </div>

      <AdminModal
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        title="Preview bulk discount"
        description="Previewing does not save any changes."
      >
        <div className="space-y-3">
          {preview?.map((item) => (
            <div key={item.product.id} className="flex justify-between border-b pb-2 text-sm">
              <span>{item.product.name}</span>
              <span className={item.error ? "text-destructive" : ""}>
                {item.error ?? formatCurrency(item.price, item.product.currency)}
              </span>
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <Btn type="button" variant="ghost" onClick={() => setPreview(null)}>
              Cancel
            </Btn>
            <Btn
              type="button"
              onClick={applyPreview}
              disabled={!preview?.some((item) => !item.error)}
            >
              Apply to valid products
            </Btn>
          </div>
        </div>
      </AdminModal>
    </section>
  );
}
