-- Unified Supabase schema snapshot.
-- Generated from supabase/migrations in chronological order.
-- Use this file for a fresh Supabase project; existing projects should continue using migrations.
-- Last generated: 2026-07-31

begin;

-- ============================================================================
-- Source: supabase/migrations/20260726163502_202df32f-9ecd-4b5a-ba8e-eae73755359d.sql
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TYPE public.order_status AS ENUM ('confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled');

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  status public.order_status NOT NULL DEFAULT 'confirmed',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postcode TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'Australia',
  shipping_method TEXT NOT NULL DEFAULT 'signature',
  gift_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  designer TEXT NOT NULL,
  size TEXT,
  colour TEXT,
  image TEXT,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX orders_user_id_created_at_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

-- ============================================================================
-- Source: supabase/migrations/20260726163522_ad75bf84-677d-49d2-bf51-e4204e9d45d9.sql
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- Source: supabase/migrations/20260727082815_deb22136-64e0-479c-b039-588eab23790a.sql
-- ============================================================================

create extension if not exists "pgcrypto";

create type user_role as enum ('customer','merchant','admin','editor');
create type user_status as enum ('active','suspended','deleted');
create type merchant_status as enum ('pending','approved','rejected','suspended');
create type product_status as enum ('draft','published','archived','sold_out');
create type product_condition as enum ('new','new_with_tags','new_without_tags','excellent','very_good','good','fair');
create type cart_status as enum ('active','converted','abandoned');
create type content_status as enum ('draft','published','archived');
create type curated_section_type as enum ('hero','products','sales','merchants','categories','editorial','banner','blog_posts');

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- USERS -----------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name varchar(100),
  last_name varchar(100),
  display_name varchar(150),
  email varchar(255),
  phone varchar(30),
  avatar_url text,
  status user_status not null default 'active',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.users to authenticated;
grant all on public.users to service_role;
alter table public.users enable row level security;
create policy users_select_own on public.users for select to authenticated using (auth.uid() = id);
create policy users_insert_own on public.users for insert to authenticated with check (auth.uid() = id);
create policy users_update_own on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create trigger update_users_updated_at before update on public.users for each row execute function public.update_updated_at_column();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy user_roles_select_own on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create policy user_roles_admin_all on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy users_staff_select on public.users for select to authenticated using (public.is_staff(auth.uid()));

create table public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  label varchar(50),
  full_name varchar(150) not null,
  phone varchar(30),
  address_line_1 varchar(255) not null,
  address_line_2 varchar(255),
  city varchar(100) not null,
  state varchar(100),
  postal_code varchar(30) not null,
  country varchar(100) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.user_addresses to authenticated;
grant all on public.user_addresses to service_role;
alter table public.user_addresses enable row level security;
create policy addresses_own on public.user_addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_user_addresses_updated_at before update on public.user_addresses for each row execute function public.update_updated_at_column();

-- MERCHANTS / BRANDS -----------------------------------------------------
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on delete set null,
  name varchar(150) not null,
  slug varchar(180) not null unique,
  short_description varchar(300),
  description text,
  logo_url text,
  cover_image_url text,
  website_url text,
  instagram_url text,
  email varchar(255),
  phone varchar(30),
  city varchar(100),
  country varchar(100),
  status merchant_status not null default 'pending',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.merchants to anon;
grant select, insert, update, delete on public.merchants to authenticated;
grant all on public.merchants to service_role;
alter table public.merchants enable row level security;
create policy merchants_public_read on public.merchants for select using (is_active and status = 'approved');
create policy merchants_owner_all on public.merchants for all to authenticated using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy merchants_admin_all on public.merchants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger update_merchants_updated_at before update on public.merchants for each row execute function public.update_updated_at_column();

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  slug varchar(180) not null unique,
  description text,
  logo_url text,
  cover_image_url text,
  website_url text,
  country varchar(100),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.brands to anon;
grant select, insert, update, delete on public.brands to authenticated;
grant all on public.brands to service_role;
alter table public.brands enable row level security;
create policy brands_public_read on public.brands for select using (is_active);
create policy brands_staff_all on public.brands for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_brands_updated_at before update on public.brands for each row execute function public.update_updated_at_column();

-- TAXONOMY ---------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy categories_public_read on public.categories for select using (is_active);
create policy categories_staff_all on public.categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();

create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.product_types to anon;
grant select, insert, update, delete on public.product_types to authenticated;
grant all on public.product_types to service_role;
alter table public.product_types enable row level security;
create policy product_types_public_read on public.product_types for select using (is_active);
create policy product_types_staff_all on public.product_types for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_product_types_updated_at before update on public.product_types for each row execute function public.update_updated_at_column();

create table public.colors (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null unique,
  slug varchar(100) not null unique,
  hex_code varchar(7),
  created_at timestamptz not null default now()
);
grant select on public.colors to anon;
grant select, insert, update, delete on public.colors to authenticated;
grant all on public.colors to service_role;
alter table public.colors enable row level security;
create policy colors_public_read on public.colors for select using (true);
create policy colors_staff_all on public.colors for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  slug varchar(120) not null unique,
  created_at timestamptz not null default now()
);
grant select on public.materials to anon;
grant select, insert, update, delete on public.materials to authenticated;
grant all on public.materials to service_role;
alter table public.materials enable row level security;
create policy materials_public_read on public.materials for select using (true);
create policy materials_staff_all on public.materials for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null unique,
  slug varchar(100) not null unique,
  created_at timestamptz not null default now()
);
grant select on public.tags to anon;
grant select, insert, update, delete on public.tags to authenticated;
grant all on public.tags to service_role;
alter table public.tags enable row level security;
create policy tags_public_read on public.tags for select using (true);
create policy tags_staff_all on public.tags for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- PRODUCTS ---------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  product_type_id uuid references public.product_types(id) on delete set null,
  name varchar(200) not null,
  slug varchar(220) not null unique,
  short_description varchar(500),
  description text,
  condition product_condition not null default 'new',
  condition_notes text,
  composition text,
  care_instructions text,
  country_of_origin varchar(100),
  fit varchar(80),
  pattern varchar(80),
  neckline varchar(80),
  sleeve_length varchar(80),
  dress_length varchar(80),
  gender varchar(30),
  season varchar(50),
  model_height_cm numeric(5,2),
  model_wears_size varchar(30),
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create or replace function public.owns_merchant(_user_id uuid, _merchant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.merchants m where m.id = _merchant_id and m.owner_user_id = _user_id)
$$;

create or replace function public.can_edit_product(_user_id uuid, _product_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.products p join public.merchants m on m.id = p.merchant_id
    where p.id = _product_id and (m.owner_user_id = _user_id or public.is_staff(_user_id))
  )
$$;

create policy products_public_read on public.products for select using (status in ('published','sold_out'));
create policy products_owner_all on public.products for all to authenticated
  using (public.owns_merchant(auth.uid(), merchant_id) or public.is_staff(auth.uid()))
  with check (public.owns_merchant(auth.uid(), merchant_id) or public.is_staff(auth.uid()));
create trigger update_products_updated_at before update on public.products for each row execute function public.update_updated_at_column();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid references public.colors(id) on delete set null,
  name varchar(150),
  sku varchar(100) not null unique,
  sizes text[] not null default '{}',
  original_price numeric(12,2) not null,
  discounted_price numeric(12,2),
  currency varchar(3) not null default 'USD',
  stock_quantity integer not null default 0,
  external_product_url text,
  is_default boolean not null default false,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint variant_original_price_non_negative check (original_price >= 0),
  constraint variant_discounted_price_non_negative check (discounted_price is null or discounted_price >= 0),
  constraint variant_discount_not_above_original check (discounted_price is null or discounted_price <= original_price),
  constraint variant_stock_non_negative check (stock_quantity >= 0),
  constraint variant_sizes_not_empty check (cardinality(sizes) > 0),
  unique (product_id, color_id)
);
grant select on public.product_variants to anon;
grant select, insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy variants_public_read on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out')));
create policy variants_owner_all on public.product_variants for all to authenticated
  using (public.can_edit_product(auth.uid(), product_id)) with check (public.can_edit_product(auth.uid(), product_id));
create trigger update_product_variants_updated_at before update on public.product_variants for each row execute function public.update_updated_at_column();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text varchar(255),
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy product_images_public_read on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out')));
create policy product_images_owner_all on public.product_images for all to authenticated
  using (public.can_edit_product(auth.uid(), product_id)) with check (public.can_edit_product(auth.uid(), product_id));

create table public.product_variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  image_url text not null,
  alt_text varchar(255),
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.product_variant_images to anon;
grant select, insert, update, delete on public.product_variant_images to authenticated;
grant all on public.product_variant_images to service_role;
alter table public.product_variant_images enable row level security;
create policy variant_images_public_read on public.product_variant_images for select
  using (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id
                 where v.id = variant_id and p.status in ('published','sold_out')));
create policy variant_images_owner_all on public.product_variant_images for all to authenticated
  using (exists (select 1 from public.product_variants v where v.id = variant_id and public.can_edit_product(auth.uid(), v.product_id)))
  with check (exists (select 1 from public.product_variants v where v.id = variant_id and public.can_edit_product(auth.uid(), v.product_id)));

create table public.product_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  percentage numeric(5,2),
  component varchar(100),
  created_at timestamptz not null default now(),
  constraint material_percentage_valid check (percentage is null or percentage between 0 and 100),
  unique (product_id, material_id, component)
);
grant select on public.product_materials to anon;
grant select, insert, update, delete on public.product_materials to authenticated;
grant all on public.product_materials to service_role;
alter table public.product_materials enable row level security;
create policy product_materials_public_read on public.product_materials for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out')));
create policy product_materials_owner_all on public.product_materials for all to authenticated
  using (public.can_edit_product(auth.uid(), product_id)) with check (public.can_edit_product(auth.uid(), product_id));

create table public.product_measurements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  measurement_name varchar(100) not null,
  measurement_value numeric(10,2) not null,
  unit varchar(10) not null default 'cm' check (unit in ('cm','inch')),
  created_at timestamptz not null default now(),
  unique (product_id, measurement_name, unit)
);
grant select on public.product_measurements to anon;
grant select, insert, update, delete on public.product_measurements to authenticated;
grant all on public.product_measurements to service_role;
alter table public.product_measurements enable row level security;
create policy product_measurements_public_read on public.product_measurements for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out')));
create policy product_measurements_owner_all on public.product_measurements for all to authenticated
  using (public.can_edit_product(auth.uid(), product_id)) with check (public.can_edit_product(auth.uid(), product_id));

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);
grant select on public.product_tags to anon;
grant select, insert, update, delete on public.product_tags to authenticated;
grant all on public.product_tags to service_role;
alter table public.product_tags enable row level security;
create policy product_tags_public_read on public.product_tags for select
  using (exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out')));
create policy product_tags_owner_all on public.product_tags for all to authenticated
  using (public.can_edit_product(auth.uid(), product_id)) with check (public.can_edit_product(auth.uid(), product_id));

-- CART / WISHLIST --------------------------------------------------------
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status cart_status not null default 'active',
  currency varchar(3) not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz
);
create unique index one_active_cart_per_user on public.carts(user_id) where status = 'active';
grant select, insert, update, delete on public.carts to authenticated;
grant all on public.carts to service_role;
alter table public.carts enable row level security;
create policy carts_own on public.carts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_carts_updated_at before update on public.carts for each row execute function public.update_updated_at_column();

create or replace function public.owns_cart(_user_id uuid, _cart_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.carts c where c.id = _cart_id and c.user_id = _user_id)
$$;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  selected_size varchar(30) not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_item_quantity_positive check (quantity > 0),
  constraint cart_item_price_non_negative check (unit_price >= 0),
  unique (cart_id, variant_id, selected_size)
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy cart_items_own on public.cart_items for all to authenticated
  using (public.owns_cart(auth.uid(), cart_id)) with check (public.owns_cart(auth.uid(), cart_id));
create trigger update_cart_items_updated_at before update on public.cart_items for each row execute function public.update_updated_at_column();

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(100) not null default 'My Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_default_wishlist_per_user on public.wishlists(user_id) where is_default = true;
grant select, insert, update, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy wishlists_own on public.wishlists for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_wishlists_updated_at before update on public.wishlists for each row execute function public.update_updated_at_column();

create or replace function public.owns_wishlist(_user_id uuid, _wishlist_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.wishlists w where w.id = _wishlist_id and w.user_id = _user_id)
$$;

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  preferred_variant_id uuid references public.product_variants(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);
grant select, insert, update, delete on public.wishlist_items to authenticated;
grant all on public.wishlist_items to service_role;
alter table public.wishlist_items enable row level security;
create policy wishlist_items_own on public.wishlist_items for all to authenticated
  using (public.owns_wishlist(auth.uid(), wishlist_id)) with check (public.owns_wishlist(auth.uid(), wishlist_id));

-- SALES ------------------------------------------------------------------
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.merchants(id) on delete cascade,
  name varchar(180) not null,
  slug varchar(200) not null unique,
  description text,
  banner_image_url text,
  mobile_banner_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_sale_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);
grant select on public.sales to anon;
grant select, insert, update, delete on public.sales to authenticated;
grant all on public.sales to service_role;
alter table public.sales enable row level security;
create policy sales_public_read on public.sales for select using (is_active);
create policy sales_owner_all on public.sales for all to authenticated
  using (public.is_staff(auth.uid()) or public.owns_merchant(auth.uid(), merchant_id))
  with check (public.is_staff(auth.uid()) or public.owns_merchant(auth.uid(), merchant_id));
create trigger update_sales_updated_at before update on public.sales for each row execute function public.update_updated_at_column();

create table public.sale_variants (
  sale_id uuid not null references public.sales(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  display_order integer not null default 0,
  primary key (sale_id, variant_id)
);
grant select on public.sale_variants to anon;
grant select, insert, update, delete on public.sale_variants to authenticated;
grant all on public.sale_variants to service_role;
alter table public.sale_variants enable row level security;
create policy sale_variants_public_read on public.sale_variants for select using (true);
create policy sale_variants_staff_all on public.sale_variants for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- CURATED PAGES ----------------------------------------------------------
create table public.curated_pages (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  slug varchar(200) not null unique,
  subtitle varchar(300),
  description text,
  hero_image_url text,
  mobile_hero_image_url text,
  status content_status not null default 'draft',
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.curated_pages to anon;
grant select, insert, update, delete on public.curated_pages to authenticated;
grant all on public.curated_pages to service_role;
alter table public.curated_pages enable row level security;
create policy curated_pages_public_read on public.curated_pages for select using (status = 'published');
create policy curated_pages_staff_all on public.curated_pages for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_curated_pages_updated_at before update on public.curated_pages for each row execute function public.update_updated_at_column();

create table public.curated_sections (
  id uuid primary key default gen_random_uuid(),
  curated_page_id uuid not null references public.curated_pages(id) on delete cascade,
  title varchar(180),
  subtitle varchar(300),
  section_type curated_section_type not null,
  content text,
  image_url text,
  mobile_image_url text,
  link_url text,
  link_label varchar(100),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.curated_sections to anon;
grant select, insert, update, delete on public.curated_sections to authenticated;
grant all on public.curated_sections to service_role;
alter table public.curated_sections enable row level security;
create policy curated_sections_public_read on public.curated_sections for select
  using (is_active and exists (select 1 from public.curated_pages p where p.id = curated_page_id and p.status = 'published'));
create policy curated_sections_staff_all on public.curated_sections for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_curated_sections_updated_at before update on public.curated_sections for each row execute function public.update_updated_at_column();

create table public.curated_section_products (
  section_id uuid not null references public.curated_sections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  primary key (section_id, product_id)
);
create table public.curated_section_sales (
  section_id uuid not null references public.curated_sections(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  display_order integer not null default 0,
  primary key (section_id, sale_id)
);
create table public.curated_section_merchants (
  section_id uuid not null references public.curated_sections(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  display_order integer not null default 0,
  primary key (section_id, merchant_id)
);
create table public.curated_section_categories (
  section_id uuid not null references public.curated_sections(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  custom_title varchar(150),
  custom_image_url text,
  display_order integer not null default 0,
  primary key (section_id, category_id)
);

-- BLOG -------------------------------------------------------------------
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.blog_categories to anon;
grant select, insert, update, delete on public.blog_categories to authenticated;
grant all on public.blog_categories to service_role;
alter table public.blog_categories enable row level security;
create policy blog_categories_public_read on public.blog_categories for select using (true);
create policy blog_categories_staff_all on public.blog_categories for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_blog_categories_updated_at before update on public.blog_categories for each row execute function public.update_updated_at_column();

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  category_id uuid references public.blog_categories(id) on delete set null,
  title varchar(220) not null,
  slug varchar(240) not null unique,
  excerpt varchar(500),
  content text not null,
  featured_image_url text,
  status content_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy blog_posts_public_read on public.blog_posts for select using (status = 'published');
create policy blog_posts_author_read on public.blog_posts for select to authenticated using (auth.uid() = author_id);
create policy blog_posts_staff_all on public.blog_posts for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger update_blog_posts_updated_at before update on public.blog_posts for each row execute function public.update_updated_at_column();

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null unique,
  slug varchar(100) not null unique,
  created_at timestamptz not null default now()
);
grant select on public.blog_tags to anon;
grant select, insert, update, delete on public.blog_tags to authenticated;
grant all on public.blog_tags to service_role;
alter table public.blog_tags enable row level security;
create policy blog_tags_public_read on public.blog_tags for select using (true);
create policy blog_tags_staff_all on public.blog_tags for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.blog_post_tags (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (blog_post_id, tag_id)
);
create table public.blog_post_products (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  primary key (blog_post_id, product_id)
);
create table public.curated_section_blog_posts (
  section_id uuid not null references public.curated_sections(id) on delete cascade,
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  display_order integer not null default 0,
  primary key (section_id, blog_post_id)
);

-- join tables: public read, staff write
do $$
declare t text;
begin
  foreach t in array array[
    'curated_section_products','curated_section_sales','curated_section_merchants',
    'curated_section_categories','blog_post_tags','blog_post_products','curated_section_blog_posts'
  ] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (true)', t||'_public_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()))', t||'_staff_all', t);
  end loop;
end $$;

-- PROFILE + ROLE ON SIGNUP -----------------------------------------------
create or replace function public.handle_new_marketplace_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name, first_name, last_name)
  values (new.id, new.email,
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'last_name')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict (user_id, role) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created_marketplace
after insert on auth.users
for each row execute function public.handle_new_marketplace_user();

-- INDEXES ----------------------------------------------------------------
create index idx_user_roles_user on public.user_roles(user_id);
create index idx_merchants_owner on public.merchants(owner_user_id);
create index idx_merchants_status on public.merchants(status);
create index idx_merchants_featured on public.merchants(is_featured) where is_featured = true;
create index idx_products_merchant on public.products(merchant_id);
create index idx_products_brand on public.products(brand_id);
create index idx_products_category on public.products(category_id);
create index idx_products_type on public.products(product_type_id);
create index idx_products_status on public.products(status);
create index idx_products_published on public.products(published_at desc) where status = 'published';
create index idx_product_variants_product on public.product_variants(product_id);
create index idx_product_variants_color on public.product_variants(color_id);
create index idx_product_variants_sizes on public.product_variants using gin(sizes);
create index idx_product_variants_available on public.product_variants(product_id, is_available);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);
create index idx_sales_dates on public.sales(starts_at, ends_at);
create index idx_curated_sections_page on public.curated_sections(curated_page_id, display_order);
create index idx_blog_posts_status_date on public.blog_posts(status, published_at desc);

-- ============================================================================
-- Source: supabase/migrations/20260727082904_ae02283d-db3e-45d3-ab5f-3363fe70f91c.sql
-- ============================================================================

revoke execute on function public.has_role(uuid, user_role) from anon, public;
revoke execute on function public.is_staff(uuid) from anon, public;
revoke execute on function public.owns_merchant(uuid, uuid) from anon, public;
revoke execute on function public.can_edit_product(uuid, uuid) from anon, public;
revoke execute on function public.owns_cart(uuid, uuid) from anon, public;
revoke execute on function public.owns_wishlist(uuid, uuid) from anon, public;
revoke execute on function public.update_updated_at_column() from anon, authenticated, public;
revoke execute on function public.handle_new_marketplace_user() from anon, authenticated, public;

grant execute on function public.has_role(uuid, user_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.owns_merchant(uuid, uuid) to authenticated;
grant execute on function public.can_edit_product(uuid, uuid) to authenticated;
grant execute on function public.owns_cart(uuid, uuid) to authenticated;
grant execute on function public.owns_wishlist(uuid, uuid) to authenticated;

-- ============================================================================
-- Source: supabase/migrations/20260727084537_dfb4bae5-d8e9-40b6-a6d9-0931a9a53b3f.sql
-- ============================================================================

-- Public/catalog tables: readable by everyone, managed by signed-in staff/owners per existing policies
do $$
declare t text;
begin
  foreach t in array array[
    'brands','categories','colors','materials','merchants','product_images','product_materials',
    'product_measurements','product_tags','product_types','product_variant_images','product_variants',
    'products','sale_variants','sales','tags','curated_pages','curated_sections',
    'curated_section_blog_posts','curated_section_categories','curated_section_merchants',
    'curated_section_products','curated_section_sales','blog_categories','blog_post_products',
    'blog_post_tags','blog_posts','blog_tags'
  ] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;

  foreach t in array array[
    'carts','cart_items','wishlists','wishlist_items','user_addresses','users','profiles','orders','order_items','user_roles'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- ============================================================================
-- Source: supabase/migrations/20260727091005_49704b75-9bfc-4430-a574-0aeb113999d1.sql
-- ============================================================================

-- Admin access to orders
CREATE POLICY "orders_admin_select" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "order_items_admin_select" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin management of customer records
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Keep public.users in sync when someone signs up (no auth-schema changes)
CREATE POLICY "users_admin_read_profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Source: supabase/migrations/20260730090000_curated_pages_admin.sql
-- ============================================================================

-- Curated Pages: admin-only writes, storage, and atomic duplication/reordering.
do $$
declare t text;
begin
  foreach t in array array[
    'curated_pages','curated_sections','curated_section_products',
    'curated_section_sales','curated_section_merchants',
    'curated_section_categories','curated_section_blog_posts'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))',
      t || '_admin_all', t
    );
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'curated_section_products','curated_section_sales','curated_section_merchants',
    'curated_section_categories','curated_section_blog_posts'
  ] loop
    execute format('drop policy if exists %I on public.%I',t||'_public_read',t);
    execute format(
      'create policy %I on public.%I for select using (exists (select 1 from public.curated_sections s join public.curated_pages p on p.id=s.curated_page_id where s.id=section_id and s.is_active and p.status=''published''))',
      t||'_public_read',t
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('curated-pages', 'curated-pages', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists curated_pages_storage_admin_insert on storage.objects;
drop policy if exists curated_pages_storage_admin_update on storage.objects;
drop policy if exists curated_pages_storage_admin_delete on storage.objects;
create policy curated_pages_storage_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'curated-pages' and public.has_role(auth.uid(),'admin'));
create policy curated_pages_storage_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'curated-pages' and public.has_role(auth.uid(),'admin'))
  with check (bucket_id = 'curated-pages' and public.has_role(auth.uid(),'admin'));
create policy curated_pages_storage_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'curated-pages' and public.has_role(auth.uid(),'admin'));

create or replace function public.reorder_curated_sections(_page_id uuid, _ordered_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
declare i integer; affected integer;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  if coalesce(array_length(_ordered_ids,1),0) <>
    (select count(*) from curated_sections where curated_page_id = _page_id)
    or exists (select 1 from unnest(_ordered_ids) x where not exists
      (select 1 from curated_sections s where s.id=x and s.curated_page_id=_page_id))
  then raise exception 'Invalid section order'; end if;
  for i in 1..coalesce(array_length(_ordered_ids,1),0) loop
    update curated_sections set display_order=i-1 where id=_ordered_ids[i] and curated_page_id=_page_id;
  end loop;
end $$;

create or replace function public.reorder_curated_items(_section_id uuid, _kind text, _ordered_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
declare i integer; table_name text; id_name text;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  if not exists(select 1 from curated_sections where id=_section_id) then raise exception 'Unknown section'; end if;
  select case _kind when 'products' then 'curated_section_products' when 'sales' then 'curated_section_sales'
    when 'merchants' then 'curated_section_merchants' when 'categories' then 'curated_section_categories'
    when 'blog_posts' then 'curated_section_blog_posts' end,
    case _kind when 'products' then 'product_id' when 'sales' then 'sale_id'
    when 'merchants' then 'merchant_id' when 'categories' then 'category_id'
    when 'blog_posts' then 'blog_post_id' end into table_name,id_name;
  if table_name is null then raise exception 'Invalid item kind'; end if;
  for i in 1..coalesce(array_length(_ordered_ids,1),0) loop
    execute format('update public.%I set display_order=$1 where section_id=$2 and %I=$3',table_name,id_name)
      using i-1,_section_id,_ordered_ids[i];
  end loop;
end $$;

create or replace function public.duplicate_curated_section(_section_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare src curated_sections%rowtype; new_id uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into strict src from curated_sections where id=_section_id for update;
  update curated_sections set display_order=display_order+1
    where curated_page_id=src.curated_page_id and display_order>src.display_order;
  insert into curated_sections(curated_page_id,title,subtitle,section_type,content,image_url,mobile_image_url,
    link_url,link_label,display_order,is_active)
  values(src.curated_page_id,src.title,src.subtitle,src.section_type,src.content,src.image_url,src.mobile_image_url,
    src.link_url,src.link_label,src.display_order+1,src.is_active) returning id into new_id;
  insert into curated_section_products select new_id,product_id,display_order from curated_section_products where section_id=_section_id;
  insert into curated_section_sales select new_id,sale_id,display_order from curated_section_sales where section_id=_section_id;
  insert into curated_section_merchants select new_id,merchant_id,display_order from curated_section_merchants where section_id=_section_id;
  insert into curated_section_categories select new_id,category_id,custom_title,custom_image_url,display_order from curated_section_categories where section_id=_section_id;
  insert into curated_section_blog_posts select new_id,blog_post_id,display_order from curated_section_blog_posts where section_id=_section_id;
  return new_id;
end $$;

create or replace function public.duplicate_curated_page(_page_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare src curated_pages%rowtype; new_page uuid; s record; new_section uuid; candidate text; n integer:=1;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into strict src from curated_pages where id=_page_id;
  candidate:=src.slug||'-copy';
  while exists(select 1 from curated_pages where slug=candidate) loop
    n:=n+1; candidate:=src.slug||'-copy-'||n;
  end loop;
  insert into curated_pages(title,slug,subtitle,description,hero_image_url,mobile_hero_image_url,status,seo_title,seo_description,published_at)
  values(src.title||' (Copy)',candidate,src.subtitle,src.description,src.hero_image_url,src.mobile_hero_image_url,'draft',src.seo_title,src.seo_description,null)
  returning id into new_page;
  for s in select * from curated_sections where curated_page_id=_page_id order by display_order,id loop
    insert into curated_sections(curated_page_id,title,subtitle,section_type,content,image_url,mobile_image_url,link_url,link_label,display_order,is_active)
    values(new_page,s.title,s.subtitle,s.section_type,s.content,s.image_url,s.mobile_image_url,s.link_url,s.link_label,s.display_order,s.is_active)
    returning id into new_section;
    insert into curated_section_products select new_section,product_id,display_order from curated_section_products where section_id=s.id;
    insert into curated_section_sales select new_section,sale_id,display_order from curated_section_sales where section_id=s.id;
    insert into curated_section_merchants select new_section,merchant_id,display_order from curated_section_merchants where section_id=s.id;
    insert into curated_section_categories select new_section,category_id,custom_title,custom_image_url,display_order from curated_section_categories where section_id=s.id;
    insert into curated_section_blog_posts select new_section,blog_post_id,display_order from curated_section_blog_posts where section_id=s.id;
  end loop;
  return new_page;
end $$;

grant execute on function public.reorder_curated_sections(uuid,uuid[]) to authenticated;
grant execute on function public.reorder_curated_items(uuid,text,uuid[]) to authenticated;
grant execute on function public.duplicate_curated_section(uuid) to authenticated;
grant execute on function public.duplicate_curated_page(uuid) to authenticated;

-- ============================================================================
-- Source: supabase/migrations/20260731090000_cloudinary_media.sql
-- ============================================================================

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

commit;
