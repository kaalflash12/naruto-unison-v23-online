create schema if not exists private;

create or replace function private.revoke_sns_sessions_on_legacy_ban()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.banned is true and old.banned is distinct from true then
    delete from public.sns_sessions s
    using public.sns_accounts a
    where s.account_id = a.id
      and a.username_key = new.user_key;
  end if;
  return new;
end;
$$;

revoke all on function private.revoke_sns_sessions_on_legacy_ban() from public, anon, authenticated;
grant execute on function private.revoke_sns_sessions_on_legacy_ban() to service_role;

drop trigger if exists trg_revoke_sns_sessions_on_legacy_ban on public.naruto_accounts;
create trigger trg_revoke_sns_sessions_on_legacy_ban
after update of banned on public.naruto_accounts
for each row
when (new.banned is true and old.banned is distinct from true)
execute function private.revoke_sns_sessions_on_legacy_ban();
