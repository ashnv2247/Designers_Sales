alter table public.product_variants
  add column if not exists original_price numeric(12,2),
  add column if not exists discounted_price numeric(12,2);

alter table public.product_variants
  add constraint product_variants_price_valid
    check (original_price is null or original_price >= 0),
  add constraint product_variants_sale_price_valid
    check (discounted_price is null or discounted_price >= 0),
  add constraint product_variants_sale_not_above_original
    check (discounted_price is null or (original_price is not null and discounted_price <= original_price));

create index if not exists idx_product_variants_sellable
  on public.product_variants(product_id, original_price, stock_quantity)
  where is_active = true;

comment on column public.product_variants.original_price is
  'Authoritative variant price. NULL means this variant is not sellable.';
comment on column public.product_variants.discounted_price is
  'Optional authoritative sale price for the variant.';
