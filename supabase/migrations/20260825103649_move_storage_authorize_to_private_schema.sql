create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.authorize(requested_permission public.app_permission)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.admin_principals p
    join public.admin_principal_roles pr on pr.principal_id = p.id
    join public.admin_role_permissions rp on rp.role = pr.role
    where p.user_id = auth.uid()
      and p.active
      and rp.permission = requested_permission
  )
$$;

revoke all on function private.authorize(public.app_permission) from public, anon;
grant execute on function private.authorize(public.app_permission) to authenticated, service_role;

alter policy content_assets_admin_update on storage.objects
using ((bucket_id = 'content-assets'::text) and private.authorize('content.write'::public.app_permission))
with check ((bucket_id = 'content-assets'::text) and private.authorize('content.write'::public.app_permission));

alter policy content_assets_admin_write on storage.objects
with check ((bucket_id = 'content-assets'::text) and private.authorize('content.write'::public.app_permission));

drop function public.authorize(public.app_permission);
