-- product_types was omitted from the original grants loop. Its RLS policies
-- already enforce public-read/admin-write rules, but PostgREST also requires
-- the corresponding SQL table privileges.
grant select on table public.product_types to anon;
grant select, insert, update, delete on table public.product_types to authenticated;
grant all privileges on table public.product_types to service_role;
