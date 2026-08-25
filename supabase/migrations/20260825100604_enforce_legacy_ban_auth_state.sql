alter table public.naruto_accounts
  add column if not exists ban_saved_pass_hash text;

create or replace function public.enforce_naruto_account_ban_auth_state()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'extensions', 'pg_temp'
as $$
begin
  -- Transition into BAN: preserve the valid password hash, replace the active
  -- hash with random bytes and revoke every existing legacy session.
  if new.banned is true and coalesce(old.banned, false) is false then
    new.ban_saved_pass_hash := old.pass_hash;
    new.pass_hash := encode(extensions.gen_random_bytes(32), 'base64');
    new.session_token := null;

  -- Stay banned: a password reset may legitimately write a new hash. Keep
  -- that new hash for the future unban, but never make it active while banned.
  elsif new.banned is true and old.banned is true then
    if new.pass_hash is distinct from old.pass_hash then
      new.ban_saved_pass_hash := new.pass_hash;
      new.pass_hash := old.pass_hash;
    end if;
    new.session_token := null;

  -- Transition out of BAN: restore the most recent legitimate password hash.
  -- The user must log in again; stale sessions remain revoked.
  elsif new.banned is false and old.banned is true then
    new.pass_hash := coalesce(old.ban_saved_pass_hash, old.pass_hash);
    new.ban_saved_pass_hash := null;
    new.session_token := null;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_naruto_account_ban_auth_state() from public, anon, authenticated;
grant execute on function public.enforce_naruto_account_ban_auth_state() to service_role;

drop trigger if exists trg_naruto_accounts_ban_auth_state on public.naruto_accounts;
create trigger trg_naruto_accounts_ban_auth_state
before update on public.naruto_accounts
for each row
execute function public.enforce_naruto_account_ban_auth_state();
