-- Unified Supabase schema snapshot.
-- Generated from supabase/migrations in chronological order.
-- Use this file for a fresh Supabase project; existing projects should continue using migrations.
-- Last generated: 2026-08-03

begin;

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'merchant', 'admin', 'editor');
create type public.user_status as enum ('active', 'suspended', 'deleted');
create type public.merchant_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.product_status as enum ('draft', 'published', 'archived', 'sold_out');
create type public.product_condition as enum ('new', 'new_with_tags', 'new_without_tags', 'excellent', 'very_good', 'good', 'fair');
create type public.cart_status as enum ('active', 'converted', 'abandoned');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled');

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid not null primary key references auth.users on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- USERS
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name varchar(100),
  last_name varchar(100),
  display_name varchar(150),
  email varchar(255),
  phone varchar(30),
  avatar_url text,
  status public.user_status not null default 'active',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

-- USER ADDRESSES
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

-- MERCHANTS
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users(id) on delete set null,
  name varchar(150) not null,
  slug varchar(180) not null unique,
  short_description varchar(300),
  description text,
  logo_url text,
  logo_public_id text,
  cover_image_url text,
  cover_image_public_id text,
  website_url text,
  instagram_url text,
  email varchar(255),
  phone varchar(30),
  city varchar(100),
  country varchar(100),
  status public.merchant_status not null default 'pending',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BRANDS
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  slug varchar(180) not null unique,
  description text,
  logo_url text,
  logo_public_id text,
  cover_image_url text,
  cover_image_public_id text,
  website_url text,
  country varchar(100),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  image_url text,
  image_public_id text,
  metadata jsonb,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PRODUCT TYPES
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  image_url text,
  image_public_id text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  product_type_id uuid references public.product_types(id) on delete set null,
  name varchar(200) not null,
  slug varchar(220) not null unique,
  sku varchar(100) unique,
  short_description varchar(500),
  description text,
  original_price numeric(12,2) not null,
  discounted_price numeric(12,2),
  currency varchar(3) not null default 'AUD',
  condition public.product_condition not null default 'new',
  condition_notes text,
  materials text[] not null default '{}',
  measurements jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
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
  external_product_url text,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_original_price_valid check (original_price >= 0),
  constraint products_discounted_price_valid check (discounted_price is null or discounted_price >= 0),
  constraint products_discount_not_above_original check (discounted_price is null or discounted_price <= original_price),
  constraint products_measurements_is_object check (jsonb_typeof(measurements) = 'object')
);

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

-- PRODUCT VARIANTS
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_name varchar(80) not null,
  color_hex varchar(7),
  size varchar(40) not null,
  sku varchar(120) unique,
  barcode varchar(120),
  stock_quantity integer not null default 0,
  original_price_override numeric(12,2),
  discounted_price_override numeric(12,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_non_negative check (stock_quantity >= 0),
  constraint product_variants_original_price_valid check (original_price_override is null or original_price_override >= 0),
  constraint product_variants_discounted_price_valid check (discounted_price_override is null or discounted_price_override >= 0),
  constraint product_variant_discount_not_above_original check (
    discounted_price_override is null 
    or original_price_override is null 
    or discounted_price_override <= original_price_override
  ),
  unique (product_id, color_name, size)
);

create index idx_product_variants_product on public.product_variants(product_id);
create index idx_product_variants_active on public.product_variants(product_id, is_active);
create index idx_product_variants_stock on public.product_variants(product_id, stock_quantity);

-- PRODUCT IMAGES
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  color_name varchar(80),
  image_url text not null,
  image_public_id text not null unique,
  alt_text varchar(255),
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_product_images_product on public.product_images(product_id);
create index idx_product_images_variant on public.product_images(variant_id);
create index idx_product_images_order on public.product_images(product_id, display_order);

-- CARTS
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status public.cart_status not null default 'active',
  currency varchar(3) not null default 'AUD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_at timestamptz
);
create unique index one_active_cart_per_user on public.carts(user_id) where status = 'active';

create or replace function public.owns_cart(_user_id uuid, _cart_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.carts c where c.id = _cart_id and c.user_id = _user_id)
$$;

-- CART ITEMS
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_item_quantity_positive check (quantity > 0),
  constraint cart_item_price_non_negative check (unit_price >= 0),
  unique (cart_id, variant_id)
);

create index idx_cart_items_cart on public.cart_items(cart_id);

-- WISHLISTS
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(100) not null default 'My Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_default_wishlist_per_user on public.wishlists(user_id) where is_default = true;

create or replace function public.owns_wishlist(_user_id uuid, _wishlist_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.wishlists w where w.id = _wishlist_id and w.user_id = _user_id)
$$;

-- WISHLIST ITEMS
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create index idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  status public.order_status not null default 'confirmed',
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  shipping_name text not null,
  shipping_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_postcode text not null,
  shipping_country text not null default 'Australia',
  shipping_method text not null default 'signature',
  currency varchar(3) not null default 'AUD',
  gift_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDER ITEMS
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  merchant_name text,
  brand_name text,
  selected_color text,
  selected_size text,
  product_sku text,
  variant_sku text,
  image_url text,
  unit_price_cents integer not null,
  quantity integer not null default 1,
  line_total_cents integer not null,
  created_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);

-- SALES
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.merchants(id) on delete cascade,
  name varchar(180) not null,
  slug varchar(200) not null unique,
  description text,
  banner_image_url text,
  banner_image_public_id text,
  mobile_banner_image_url text,
  mobile_banner_image_public_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_sale_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.sale_products (
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (sale_id, product_id)
);

create index idx_sales_dates on public.sales(starts_at, ends_at);

-- CURATED PAGES
create table public.curated_pages (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  slug varchar(200) not null unique,
  subtitle varchar(300),
  description text,
  hero_image_url text,
  hero_image_public_id text,
  mobile_hero_image_url text,
  mobile_hero_image_public_id text,
  status public.content_status not null default 'draft',
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.curated_page_products (
  id uuid primary key default gen_random_uuid(),
  curated_page_id uuid not null references public.curated_pages(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  unique(curated_page_id, product_id)
);

create index idx_curated_page_products_page on public.curated_page_products(curated_page_id);
create index idx_curated_page_products_order on public.curated_page_products(display_order);

create or replace function public.duplicate_curated_page(_page_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare src public.curated_pages%rowtype; new_page uuid; candidate text; n integer:=1;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into strict src from public.curated_pages where id=_page_id;
  candidate:=src.slug||'-copy';
  while exists(select 1 from public.curated_pages where slug=candidate) loop
    n:=n+1; candidate:=src.slug||'-copy-'||n;
  end loop;
  insert into public.curated_pages(title,slug,subtitle,description,hero_image_url,hero_image_public_id,mobile_hero_image_url,mobile_hero_image_public_id,status,seo_title,seo_description,published_at)
  values(src.title||' (Copy)',candidate,src.subtitle,src.description,src.hero_image_url,src.hero_image_public_id,src.mobile_hero_image_url,src.mobile_hero_image_public_id,'draft',src.seo_title,src.seo_description,null)
  returning id into new_page;
  
  insert into public.curated_page_products(curated_page_id, product_id, display_order)
  select new_page, product_id, display_order
  from public.curated_page_products
  where curated_page_id = _page_id;
  
  return new_page;
end $$;

-- BLOG POSTS
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  title varchar(220) not null,
  slug varchar(240) not null unique,
  excerpt varchar(500),
  content text not null,
  featured_image_url text,
  featured_image_public_id text,
  tags text[] not null default '{}',
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title varchar(255),
  seo_description varchar(500),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_blog_posts_status_date on public.blog_posts(status, published_at desc);

-- CONTACT INQUIRIES
create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  email varchar(255) not null,
  subject varchar(200) not null default 'General Inquiry',
  message text not null,
  status varchar(50) not null default 'unread',
  created_at timestamptz not null default now(),
  constraint contact_inquiries_status_valid check (status in ('unread', 'read', 'resolved', 'spam'))
);

-- NEWSLETTER SUBSCRIBERS
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  status varchar(50) not null default 'subscribed',
  created_at timestamptz not null default now()
);

-- PROFILE + ROLE ON SIGNUP
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

-- INDEXES
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

-- RLS AND POLICIES
alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_addresses enable row level security;
alter table public.merchants enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.product_types enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_products enable row level security;
alter table public.curated_pages enable row level security;
alter table public.curated_page_products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Profiles policies
create policy "Users can view their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "users_admin_read_profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Users policies
create policy users_select_own on public.users for select to authenticated using (auth.uid() = id);
create policy users_insert_own on public.users for insert to authenticated with check (auth.uid() = id);
create policy users_update_own on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy users_staff_select on public.users for select to authenticated using (public.is_staff(auth.uid()));
create policy users_admin_all on public.users for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- User roles policies
create policy user_roles_select_own on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy user_roles_admin_all on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- User addresses policies
create policy addresses_own on public.user_addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Merchants policies
create policy merchants_public_read on public.merchants for select using (is_active and status = 'approved');
create policy merchants_owner_all on public.merchants for all to authenticated using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy merchants_admin_all on public.merchants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Brands policies
create policy brands_public_read on public.brands for select using (is_active);
create policy brands_admin_all on public.brands for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Categories policies
create policy categories_public_read on public.categories for select using (is_active);
create policy categories_admin_all on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Product types policies
create policy product_types_public_read on public.product_types for select using (is_active);
create policy product_types_admin_all on public.product_types for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Products policies
create policy products_public_read on public.products for select using (status in ('published','sold_out'));
create policy products_admin_all on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Product variants policies
create policy product_variants_public_read on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out'))
);
create policy product_variants_admin_all on public.product_variants for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Product images policies
create policy product_images_public_read on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status in ('published','sold_out'))
);
create policy product_images_admin_all on public.product_images for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Carts policies
create policy carts_own on public.carts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy carts_admin_select on public.carts for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Cart items policies
create policy cart_items_own on public.cart_items for all to authenticated
  using (public.owns_cart(auth.uid(), cart_id)) with check (public.owns_cart(auth.uid(), cart_id));
create policy cart_items_admin_select on public.cart_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Wishlists policies
create policy wishlists_own on public.wishlists for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy wishlists_admin_select on public.wishlists for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Wishlist items policies
create policy wishlist_items_own on public.wishlist_items for all to authenticated
  using (public.owns_wishlist(auth.uid(), wishlist_id)) with check (public.owns_wishlist(auth.uid(), wishlist_id));
create policy wishlist_items_admin_select on public.wishlist_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Orders policies
create policy "Users can view their own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "Users can create their own orders" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "orders_admin_select" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "orders_admin_update" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Order items policies
create policy "Users can view their own order items" on public.order_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can create their own order items" on public.order_items for insert to authenticated with check (auth.uid() = user_id);
create policy "order_items_admin_select" on public.order_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Sales policies
create policy sales_public_read on public.sales for select using (is_active);
create policy sales_admin_all on public.sales for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Sale products policies
create policy sale_products_public_read on public.sale_products for select using (true);
create policy sale_products_admin_all on public.sale_products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Curated pages policies
create policy curated_pages_public_read on public.curated_pages for select using (status = 'published');
create policy curated_pages_admin_all on public.curated_pages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Curated page products policies
create policy curated_page_products_public_read on public.curated_page_products for select
  using (exists (select 1 from public.curated_pages p where p.id = curated_page_id and p.status = 'published'));
create policy curated_page_products_admin_all on public.curated_page_products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Blog posts policies
create policy blog_posts_public_read on public.blog_posts for select using (status = 'published');
create policy blog_posts_author_read on public.blog_posts for select to authenticated using (auth.uid() = author_id);
create policy blog_posts_admin_all on public.blog_posts for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Contact inquiries policies
create policy contact_inquiries_public_insert on public.contact_inquiries for insert with check (true);
create policy contact_inquiries_admin_all on public.contact_inquiries for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Newsletter subscribers policies
create policy newsletter_subscribers_public_insert on public.newsletter_subscribers for insert with check (true);
create policy newsletter_subscribers_admin_all on public.newsletter_subscribers for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- TRIGGERS
create trigger update_users_updated_at before update on public.users for each row execute function public.update_updated_at_column();
create trigger update_user_addresses_updated_at before update on public.user_addresses for each row execute function public.update_updated_at_column();
create trigger update_merchants_updated_at before update on public.merchants for each row execute function public.update_updated_at_column();
create trigger update_brands_updated_at before update on public.brands for each row execute function public.update_updated_at_column();
create trigger update_categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();
create trigger update_product_types_updated_at before update on public.product_types for each row execute function public.update_updated_at_column();
create trigger update_products_updated_at before update on public.products for each row execute function public.update_updated_at_column();
create trigger update_product_variants_updated_at before update on public.product_variants for each row execute function public.update_updated_at_column();
create trigger update_carts_updated_at before update on public.carts for each row execute function public.update_updated_at_column();
create trigger update_cart_items_updated_at before update on public.cart_items for each row execute function public.update_updated_at_column();
create trigger update_wishlists_updated_at before update on public.wishlists for each row execute function public.update_updated_at_column();
create trigger update_sales_updated_at before update on public.sales for each row execute function public.update_updated_at_column();
create trigger update_curated_pages_updated_at before update on public.curated_pages for each row execute function public.update_updated_at_column();
create trigger update_blog_posts_updated_at before update on public.blog_posts for each row execute function public.update_updated_at_column();

-- GRANTS AND EXECUTE PERMISSIONS
revoke execute on function public.has_role(uuid, public.user_role) from anon, public;
revoke execute on function public.is_staff(uuid) from anon, public;
revoke execute on function public.owns_merchant(uuid, uuid) from anon, public;
revoke execute on function public.can_edit_product(uuid, uuid) from anon, public;
revoke execute on function public.owns_cart(uuid, uuid) from anon, public;
revoke execute on function public.owns_wishlist(uuid, uuid) from anon, public;
revoke execute on function public.update_updated_at_column() from anon, authenticated, public;
revoke execute on function public.handle_new_marketplace_user() from anon, authenticated, public;

grant execute on function public.has_role(uuid, public.user_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.owns_merchant(uuid, uuid) to authenticated;
grant execute on function public.can_edit_product(uuid, uuid) to authenticated;
grant execute on function public.owns_cart(uuid, uuid) to authenticated;
grant execute on function public.owns_wishlist(uuid, uuid) to authenticated;
grant execute on function public.duplicate_curated_page(uuid) to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'brands','categories','product_types','merchants','product_variants','product_images','products',
    'sale_products','sales','curated_pages','curated_page_products','blog_posts'
  ] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;

  foreach t in array array[
    'carts','cart_items','wishlists','wishlist_items','user_addresses','users','profiles','orders','order_items','user_roles','contact_inquiries','newsletter_subscribers'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
  
  grant select, insert on public.contact_inquiries to anon;
  grant insert on public.newsletter_subscribers to anon;
end $$;

commit;
