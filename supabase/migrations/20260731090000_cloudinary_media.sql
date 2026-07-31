-- Cloudinary asset metadata. URL columns remain for backwards compatibility and delivery.
alter table public.merchants add column if not exists logo_public_id text;
alter table public.merchants add column if not exists cover_image_public_id text;
alter table public.brands add column if not exists logo_public_id text;
alter table public.brands add column if not exists cover_image_public_id text;
alter table public.categories add column if not exists image_public_id text;
alter table public.categories add column if not exists metadata jsonb;
alter table public.product_types add column if not exists image_public_id text;
alter table public.product_images add column if not exists image_public_id text;
alter table public.product_variant_images add column if not exists image_public_id text;
alter table public.sales add column if not exists banner_image_public_id text;
alter table public.sales add column if not exists mobile_banner_image_public_id text;
alter table public.curated_pages add column if not exists hero_image_public_id text;
alter table public.curated_pages add column if not exists mobile_hero_image_public_id text;
alter table public.curated_sections add column if not exists image_public_id text;
alter table public.curated_sections add column if not exists mobile_image_public_id text;
alter table public.curated_sections add column if not exists settings jsonb;
alter table public.curated_section_categories add column if not exists custom_image_public_id text;
alter table public.blog_posts add column if not exists featured_image_public_id text;

create table if not exists public.site_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key varchar(160) not null unique,
  image_url text not null,
  image_public_id text not null unique,
  alt_text varchar(255),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_assets to anon, authenticated;
grant insert, update, delete on public.site_assets to authenticated;
grant all on public.site_assets to service_role;
alter table public.site_assets enable row level security;
drop policy if exists site_assets_public_read on public.site_assets;
drop policy if exists site_assets_admin_all on public.site_assets;
create policy site_assets_public_read on public.site_assets for select using (true);
create policy site_assets_admin_all on public.site_assets for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
drop trigger if exists update_site_assets_updated_at on public.site_assets;
create trigger update_site_assets_updated_at before update on public.site_assets
for each row execute function public.update_updated_at_column();

create index if not exists idx_product_images_public_id on public.product_images(image_public_id);
create index if not exists idx_variant_images_public_id on public.product_variant_images(image_public_id);
create unique index if not exists idx_product_images_order on public.product_images(product_id,display_order);
create unique index if not exists idx_variant_images_order on public.product_variant_images(variant_id,display_order);
