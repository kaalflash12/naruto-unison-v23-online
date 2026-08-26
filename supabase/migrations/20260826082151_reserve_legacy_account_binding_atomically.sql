create or replace function public.claim_legacy_account_binding(
  p_legacy_account_id uuid,
  p_auth_user_id uuid,
  p_email text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  a public.naruto_accounts;
  m public.legacy_account_migrations;
  other_for_target uuid;
  was_same boolean:=false;
begin
  if p_legacy_account_id is null or p_auth_user_id is null then raise exception 'binding identifiers required'; end if;
  if p_email is null or length(trim(p_email))<3 or length(trim(p_email))>320 then raise exception 'invalid email'; end if;

  select * into a from public.naruto_accounts where id=p_legacy_account_id for update;
  if not found then raise exception 'legacy account not found'; end if;

  select * into m from public.legacy_account_migrations where legacy_account_id=p_legacy_account_id for update;
  if found and m.auth_user_id<>p_auth_user_id then
    return jsonb_build_object('ok',false,'error','already_migrated');
  end if;

  if a.auth_user_id is not null and a.auth_user_id<>p_auth_user_id then
    return jsonb_build_object('ok',false,'error','linked_other');
  end if;

  select legacy_account_id into other_for_target
  from public.legacy_account_migrations
  where auth_user_id=p_auth_user_id and legacy_account_id<>p_legacy_account_id
  limit 1;
  if other_for_target is not null then
    return jsonb_build_object('ok',false,'error','target_already_migrated');
  end if;

  was_same:=a.auth_user_id=p_auth_user_id;
  update public.naruto_accounts
  set auth_user_id=p_auth_user_id,
      recovery_email=lower(trim(p_email)),
      recovery_verified=true,
      session_token=null
  where id=p_legacy_account_id;

  return jsonb_build_object('ok',true,'duplicate',was_same);
end
$function$;

revoke all on function public.claim_legacy_account_binding(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_legacy_account_binding(uuid,uuid,text) to service_role;
