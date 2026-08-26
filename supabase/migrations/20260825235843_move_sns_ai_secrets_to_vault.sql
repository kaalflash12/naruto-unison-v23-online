alter table public.sns_ai_secrets add column vault_secret_id uuid;
alter table public.sns_ai_secrets drop column secret;
alter table public.sns_ai_secrets alter column vault_secret_id set not null;

create or replace function private.sns_store_ai_secret_impl(p_account_id uuid,p_provider text,p_secret text,p_model text default '')
returns void
language plpgsql
security definer
set search_path='public','vault','private'
as $$
declare
  sid uuid;
  normalized_provider text:=lower(trim(coalesce(p_provider,'')));
  normalized_model text:=trim(coalesce(p_model,''));
begin
  if normalized_provider not in ('gemini','openai','anthropic','groq','openrouter','xai') then
    raise exception using errcode='22023',message='invalid_provider';
  end if;
  if length(coalesce(p_secret,'')) < 8 or length(p_secret) > 8192 then
    raise exception using errcode='22023',message='invalid_secret';
  end if;
  if length(normalized_model) > 200 then
    raise exception using errcode='22023',message='invalid_model';
  end if;
  if not exists(select 1 from public.sns_accounts where id=p_account_id) then
    raise exception using errcode='23503',message='account_not_found';
  end if;

  select vault_secret_id into sid
  from public.sns_ai_secrets
  where account_id=p_account_id and provider=normalized_provider;

  if sid is null then
    sid:=vault.create_secret(
      p_secret,
      'sns_ai_'||replace(p_account_id::text,'-','')||'_'||normalized_provider,
      'SNS AI provider secret'
    );
  else
    perform vault.update_secret(
      sid,
      p_secret,
      'sns_ai_'||replace(p_account_id::text,'-','')||'_'||normalized_provider,
      'SNS AI provider secret'
    );
  end if;

  insert into public.sns_ai_secrets(account_id,provider,vault_secret_id,model,enabled,updated_at)
  values(p_account_id,normalized_provider,sid,normalized_model,true,now())
  on conflict(account_id,provider) do update
  set vault_secret_id=excluded.vault_secret_id,
      model=excluded.model,
      enabled=true,
      updated_at=now();
end $$;

create or replace function public.sns_store_ai_secret(p_account_id uuid,p_provider text,p_secret text,p_model text default '')
returns void
language sql
security invoker
set search_path=''
as $$select private.sns_store_ai_secret_impl(p_account_id,p_provider,p_secret,p_model)$$;

create or replace function private.sns_list_ai_secrets_impl(p_account_id uuid)
returns table(provider text,secret text,model text,enabled boolean)
language sql
security definer
set search_path='public','vault'
as $$
  select s.provider,d.decrypted_secret,s.model,s.enabled
  from public.sns_ai_secrets s
  join vault.decrypted_secrets d on d.id=s.vault_secret_id
  where s.account_id=p_account_id and s.enabled=true
  order by s.provider
$$;

create or replace function public.sns_list_ai_secrets(p_account_id uuid)
returns table(provider text,secret text,model text,enabled boolean)
language sql
security invoker
set search_path=''
as $$select * from private.sns_list_ai_secrets_impl(p_account_id)$$;

create or replace function private.cleanup_sns_ai_vault_secret()
returns trigger
language plpgsql
security definer
set search_path='vault','public'
as $$
begin
  delete from vault.secrets where id=old.vault_secret_id;
  return old;
end
$$;

drop trigger if exists trg_cleanup_sns_ai_vault_secret on public.sns_ai_secrets;
create trigger trg_cleanup_sns_ai_vault_secret
before delete on public.sns_ai_secrets
for each row execute function private.cleanup_sns_ai_vault_secret();

revoke all on function public.sns_store_ai_secret(uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.sns_list_ai_secrets(uuid) from public,anon,authenticated;
revoke all on function private.sns_store_ai_secret_impl(uuid,text,text,text) from public,anon,authenticated;
revoke all on function private.sns_list_ai_secrets_impl(uuid) from public,anon,authenticated;
grant execute on function public.sns_store_ai_secret(uuid,text,text,text) to service_role;
grant execute on function public.sns_list_ai_secrets(uuid) to service_role;
grant execute on function private.sns_store_ai_secret_impl(uuid,text,text,text) to service_role;
grant execute on function private.sns_list_ai_secrets_impl(uuid) to service_role;
