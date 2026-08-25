create or replace function private.guard_sns_session_against_legacy_ban()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.sns_accounts a
    join public.naruto_accounts n on n.user_key = a.username_key
    where a.id = new.account_id
      and n.banned is true
  ) then
    raise exception using errcode = '42501', message = 'Legacy account is banned';
  end if;
  return new;
end;
$$;

revoke all on function private.guard_sns_session_against_legacy_ban() from public, anon, authenticated;
grant execute on function private.guard_sns_session_against_legacy_ban() to service_role;

drop trigger if exists trg_guard_sns_session_against_legacy_ban on public.sns_sessions;
create trigger trg_guard_sns_session_against_legacy_ban
before insert or update of account_id on public.sns_sessions
for each row
execute function private.guard_sns_session_against_legacy_ban();

create or replace function private.guard_sns_room_owner_immutable()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_account_id is distinct from old.owner_account_id then
    raise exception using errcode = '42501', message = 'Room owner is immutable';
  end if;
  return new;
end;
$$;

revoke all on function private.guard_sns_room_owner_immutable() from public, anon, authenticated;
grant execute on function private.guard_sns_room_owner_immutable() to service_role;

drop trigger if exists trg_guard_sns_room_owner_immutable on public.sns_rooms;
create trigger trg_guard_sns_room_owner_immutable
before update of owner_account_id on public.sns_rooms
for each row
execute function private.guard_sns_room_owner_immutable();
