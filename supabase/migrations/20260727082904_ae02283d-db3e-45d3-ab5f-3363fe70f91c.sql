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