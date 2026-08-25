alter function public.admin_reset_combat_history(uuid, uuid, boolean, text) set schema private;

revoke all on function private.admin_reset_combat_history(uuid, uuid, boolean, text) from public, anon;
grant execute on function private.admin_reset_combat_history(uuid, uuid, boolean, text) to authenticated, service_role;

create or replace function public.admin_reset_combat_history(
  p_legacy_account_id uuid default null,
  p_user_id uuid default null,
  p_reset_all boolean default false,
  p_reason text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.admin_reset_combat_history(
    p_legacy_account_id,
    p_user_id,
    p_reset_all,
    p_reason
  )
$$;

revoke all on function public.admin_reset_combat_history(uuid, uuid, boolean, text) from public, anon;
grant execute on function public.admin_reset_combat_history(uuid, uuid, boolean, text) to authenticated, service_role;

comment on function public.admin_reset_combat_history(uuid, uuid, boolean, text) is
'Invoker wrapper for the private RBAC-protected combat-history reset implementation. Requires ranked.admin and preserves non-combat progression.';
