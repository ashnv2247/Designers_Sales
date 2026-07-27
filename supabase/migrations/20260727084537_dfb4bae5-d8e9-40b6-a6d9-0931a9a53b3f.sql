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
