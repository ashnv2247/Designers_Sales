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