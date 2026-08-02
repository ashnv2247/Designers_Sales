do $$ begin
  create type public.sale_discount_type as enum ('percentage', 'fixed_amount', 'final_price');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.sale_discount_base as enum ('original_price', 'current_price');
exception when duplicate_object then null;
end $$;

alter table public.sale_products
  add column if not exists discount_type public.sale_discount_type,
  add column if not exists discount_value numeric(12,2),
  add column if not exists discount_base public.sale_discount_base not null default 'current_price',
  add column if not exists original_price_snapshot numeric(12,2),
  add column if not exists current_price_snapshot numeric(12,2),
  add column if not exists sale_price numeric(12,2),
  add column if not exists is_manually_overridden boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.sale_products
  add constraint sale_products_discount_value_valid check (discount_value is null or discount_value >= 0),
  add constraint sale_products_percentage_valid check (discount_type is distinct from 'percentage' or discount_value between 0 and 100),
  add constraint sale_products_original_snapshot_valid check (original_price_snapshot is null or original_price_snapshot >= 0),
  add constraint sale_products_current_snapshot_valid check (current_price_snapshot is null or current_price_snapshot >= 0),
  add constraint sale_products_sale_price_valid check (sale_price is null or sale_price >= 0),
  add constraint sale_products_sale_not_above_original check (sale_price is null or original_price_snapshot is null or sale_price <= original_price_snapshot),
  add constraint sale_products_sale_not_above_current check (sale_price is null or current_price_snapshot is null or sale_price <= current_price_snapshot);

create index if not exists idx_sale_products_product on public.sale_products(product_id);
create index if not exists idx_sale_products_sale_price on public.sale_products(sale_id, sale_price);

drop trigger if exists update_sale_products_updated_at on public.sale_products;
create trigger update_sale_products_updated_at before update on public.sale_products
for each row execute function public.update_updated_at_column();

create or replace function public.save_sale_with_products(p_sale jsonb, p_products jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sale_id uuid := nullif(p_sale->>'id', '')::uuid;
  v_item jsonb;
  v_product_id uuid;
  v_original numeric(12,2);
  v_current numeric(12,2);
  v_base numeric(12,2);
  v_sale_price numeric(12,2);
  v_type public.sale_discount_type;
  v_discount_base public.sale_discount_base;
  v_value numeric(12,2);
  v_existing public.sale_products%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;

  if v_sale_id is null then
    v_sale_id := gen_random_uuid();
    insert into public.sales(id, merchant_id, name, slug, description, banner_image_url,
      banner_image_public_id, mobile_banner_image_url, mobile_banner_image_public_id,
      starts_at, ends_at, is_active, is_featured)
    values (v_sale_id, nullif(p_sale->>'merchant_id','')::uuid, p_sale->>'name',
      regexp_replace(lower(trim(p_sale->>'name')), '[^a-z0-9]+', '-', 'g') || '-' || left(v_sale_id::text, 6),
      nullif(p_sale->>'description',''), nullif(p_sale->>'banner_image_url',''),
      nullif(p_sale->>'banner_image_public_id',''), nullif(p_sale->>'mobile_banner_image_url',''),
      nullif(p_sale->>'mobile_banner_image_public_id',''), nullif(p_sale->>'starts_at','')::timestamptz,
      nullif(p_sale->>'ends_at','')::timestamptz, coalesce((p_sale->>'is_active')::boolean,true),
      coalesce((p_sale->>'is_featured')::boolean,false));
  else
    update public.sales set
      merchant_id = nullif(p_sale->>'merchant_id','')::uuid,
      name = p_sale->>'name', description = nullif(p_sale->>'description',''),
      banner_image_url = nullif(p_sale->>'banner_image_url',''),
      banner_image_public_id = nullif(p_sale->>'banner_image_public_id',''),
      mobile_banner_image_url = nullif(p_sale->>'mobile_banner_image_url',''),
      mobile_banner_image_public_id = nullif(p_sale->>'mobile_banner_image_public_id',''),
      starts_at = nullif(p_sale->>'starts_at','')::timestamptz,
      ends_at = nullif(p_sale->>'ends_at','')::timestamptz,
      is_active = (p_sale->>'is_active')::boolean, is_featured = (p_sale->>'is_featured')::boolean
    where id = v_sale_id;
    if not found then raise exception 'Sale not found'; end if;
  end if;

  delete from public.sale_products sp where sp.sale_id = v_sale_id
    and not exists (select 1 from jsonb_array_elements(p_products) x where (x->>'product_id')::uuid = sp.product_id);

  for v_item in select * from jsonb_array_elements(p_products) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_type := (v_item->>'discount_type')::public.sale_discount_type;
    v_discount_base := coalesce((v_item->>'discount_base')::public.sale_discount_base, 'current_price');
    v_value := (v_item->>'discount_value')::numeric;
    if v_value is null or v_value < 0 then raise exception 'Invalid discount for product %', v_product_id; end if;

    select * into v_existing from public.sale_products where sale_id = v_sale_id and product_id = v_product_id;
    if v_existing.product_id is not null
      and v_existing.original_price_snapshot is not null
      and v_existing.current_price_snapshot is not null
      and not coalesce((v_item->>'refresh_snapshots')::boolean,false) then
      v_original := v_existing.original_price_snapshot;
      v_current := v_existing.current_price_snapshot;
    else
      select pv.original_price, coalesce(pv.discounted_price,pv.original_price)
      into v_original, v_current from public.product_variants pv
      where pv.product_id = v_product_id and pv.is_active and pv.original_price is not null
      order by coalesce(pv.discounted_price,pv.original_price) asc limit 1;
    end if;
    if v_original is null or v_current is null then raise exception 'Product % has no valid variant pricing', v_product_id; end if;

    v_base := case when v_discount_base = 'original_price' then v_original else v_current end;
    if v_type = 'percentage' then
      if v_value > 100 then raise exception 'Percentage cannot exceed 100'; end if;
      v_sale_price := round(v_base * (1 - v_value / 100), 2);
    elsif v_type = 'fixed_amount' then
      if v_value > v_base then raise exception 'Fixed discount exceeds base price'; end if;
      v_sale_price := round(v_base - v_value, 2);
    else v_sale_price := round(v_value, 2);
    end if;
    if v_sale_price < 0 or v_sale_price > v_original or v_sale_price > v_current then
      raise exception 'Invalid calculated sale price for product %', v_product_id;
    end if;
    if exists (
      select 1 from public.product_variants pv
      where pv.product_id = v_product_id and pv.is_active and pv.original_price is not null
      and (
        case
          when v_type = 'percentage' then round(
            (case when v_discount_base = 'original_price' then pv.original_price else coalesce(pv.discounted_price,pv.original_price) end)
            * (1 - v_value / 100), 2)
          when v_type = 'fixed_amount' then round(
            (case when v_discount_base = 'original_price' then pv.original_price else coalesce(pv.discounted_price,pv.original_price) end)
            - v_value, 2)
          else round(v_value, 2)
        end
      ) not between 0 and coalesce(pv.discounted_price,pv.original_price)
    ) then
      raise exception 'Discount is invalid for one or more variants of product %', v_product_id;
    end if;

    insert into public.sale_products(sale_id, product_id, display_order, discount_type,
      discount_value, discount_base, original_price_snapshot, current_price_snapshot,
      sale_price, is_manually_overridden)
    values(v_sale_id, v_product_id, coalesce((v_item->>'display_order')::int,0), v_type,
      v_value, v_discount_base, v_original, v_current, v_sale_price,
      coalesce((v_item->>'is_manually_overridden')::boolean,false))
    on conflict (sale_id,product_id) do update set
      display_order=excluded.display_order, discount_type=excluded.discount_type,
      discount_value=excluded.discount_value, discount_base=excluded.discount_base,
      original_price_snapshot=excluded.original_price_snapshot,
      current_price_snapshot=excluded.current_price_snapshot, sale_price=excluded.sale_price,
      is_manually_overridden=excluded.is_manually_overridden;
  end loop;
  return v_sale_id;
end $$;

revoke all on function public.save_sale_with_products(jsonb,jsonb) from public, anon;
grant execute on function public.save_sale_with_products(jsonb,jsonb) to authenticated, service_role;
