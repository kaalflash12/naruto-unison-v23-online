create or replace function public.r41_create_world_v1(
  p_code text,
  p_owner_account_id uuid default null,
  p_state jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_world public.r41_worlds%rowtype;
  v_code text;
begin
  v_code := upper(btrim(p_code));
  if v_code is null or v_code = '' then raise exception 'world_code_required'; end if;

  select * into v_world
    from public.r41_worlds
   where code = v_code
   for update;

  if found then
    if v_world.owner_account_id is distinct from p_owner_account_id then
      return jsonb_build_object('ok', false, 'error', 'world_code_taken');
    end if;

    if p_owner_account_id is not null then
      insert into public.r41_world_members(world_id, account_id, role)
      values (v_world.id, p_owner_account_id, 'owner')
      on conflict (world_id, account_id) do update
        set role='owner', last_seen_at=now();
    end if;

    return jsonb_build_object('ok', true, 'world_id', v_world.id, 'code', v_world.code, 'revision', v_world.revision, 'state', v_world.state);
  end if;

  insert into public.r41_worlds(code, owner_account_id, state)
  values (v_code, p_owner_account_id, coalesce(p_state,'{}'::jsonb))
  returning * into v_world;

  if p_owner_account_id is not null then
    insert into public.r41_world_members(world_id, account_id, role)
    values (v_world.id, p_owner_account_id, 'owner')
    on conflict (world_id, account_id) do update
      set role='owner', last_seen_at=now();
  end if;

  return jsonb_build_object('ok', true, 'world_id', v_world.id, 'code', v_world.code, 'revision', v_world.revision, 'state', v_world.state);
end;
$function$;

create or replace function public.r41_claim_actor_v1(
  p_world_id uuid,
  p_actor_key text,
  p_account_id uuid,
  p_ttl_seconds integer default 120
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_existing public.r41_actor_claims%rowtype;
  v_expires timestamptz;
begin
  if not exists (
    select 1 from public.r41_world_members
     where world_id = p_world_id and account_id = p_account_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'not_world_member');
  end if;

  if p_ttl_seconds < 15 then p_ttl_seconds := 15; end if;
  if p_ttl_seconds > 3600 then p_ttl_seconds := 3600; end if;
  v_expires := now() + make_interval(secs => p_ttl_seconds);

  delete from public.r41_actor_claims
   where expires_at is not null and expires_at <= now();

  select * into v_existing
    from public.r41_actor_claims
   where world_id=p_world_id and actor_key=p_actor_key
   for update;

  if found and v_existing.account_id <> p_account_id
     and (v_existing.expires_at is null or v_existing.expires_at > now()) then
    return jsonb_build_object('ok', false, 'error', 'actor_already_claimed', 'account_id', v_existing.account_id, 'expires_at', v_existing.expires_at);
  end if;

  insert into public.r41_actor_claims(world_id, actor_key, account_id, claimed_at, expires_at)
  values (p_world_id, p_actor_key, p_account_id, now(), v_expires)
  on conflict (world_id, actor_key) do update
     set account_id=excluded.account_id, claimed_at=now(), expires_at=excluded.expires_at;

  return jsonb_build_object('ok', true, 'actor_key', p_actor_key, 'account_id', p_account_id, 'expires_at', v_expires);
end;
$function$;

create or replace function private.guard_r41_world_owner_role()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'private'
as $function$
declare
  v_owner uuid;
begin
  if new.role = 'owner' then
    select owner_account_id into v_owner
      from public.r41_worlds
     where id = new.world_id;
    if v_owner is distinct from new.account_id then
      raise exception using errcode='42501', message='owner_role_requires_world_owner';
    end if;
  end if;
  return new;
end;
$function$;

revoke all on function private.guard_r41_world_owner_role() from public, anon, authenticated;

drop trigger if exists trg_guard_r41_world_owner_role on public.r41_world_members;
create trigger trg_guard_r41_world_owner_role
before insert or update of account_id, role, world_id on public.r41_world_members
for each row execute function private.guard_r41_world_owner_role();
