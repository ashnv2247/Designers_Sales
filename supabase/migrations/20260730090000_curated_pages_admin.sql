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
