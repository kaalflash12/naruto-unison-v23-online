-- R41 public-authority hardening. Production migration 20260825232744 also applied equivalent service-helper guards.

create or replace function public.save_r41_state_v1(p_scope_key text,p_state jsonb,p_expected_revision bigint default null,p_account_id uuid default null,p_character_id uuid default null,p_world_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.r41_states%rowtype;
begin
 if p_scope_key is null or btrim(p_scope_key)='' then raise exception 'scope_key_required'; end if;
 if length(p_scope_key)>120 then raise exception 'scope_key_too_long'; end if;
 if p_state is null or jsonb_typeof(p_state)<>'object' then raise exception 'state_must_be_object'; end if;
 if octet_length(p_state::text)>1048576 then raise exception 'state_too_large'; end if;
 if p_character_id is not null then raise exception 'character_binding_unsupported'; end if;
 select * into v_row from public.r41_states where scope_key=p_scope_key for update;
 if found then
  if p_expected_revision is not null and v_row.revision<>p_expected_revision then return jsonb_build_object('ok',false,'error','revision_conflict','revision',v_row.revision,'state',v_row.state); end if;
  update public.r41_states set state=p_state,account_id=coalesce(p_account_id,account_id),world_id=coalesce(p_world_id,world_id),revision=revision+1,updated_at=now() where scope_key=p_scope_key returning * into v_row;
 else
  if p_expected_revision is not null and p_expected_revision not in (-1,0) then return jsonb_build_object('ok',false,'error','revision_conflict','revision',null); end if;
  insert into public.r41_states(scope_key,account_id,character_id,world_id,state,revision) values(p_scope_key,p_account_id,null,p_world_id,p_state,1) returning * into v_row;
 end if;
 return jsonb_build_object('ok',true,'scope_key',v_row.scope_key,'revision',v_row.revision,'updated_at',v_row.updated_at,'state',v_row.state);
end $$;

create or replace function public.append_r41_event(p_scope_key text,p_event_type text,p_payload jsonb default '{}'::jsonb,p_account_id uuid default null,p_character_id uuid default null,p_world_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id bigint;
begin
 if p_scope_key is null or btrim(p_scope_key)='' then raise exception 'scope_key_required'; end if;
 if length(p_scope_key)>120 then raise exception 'scope_key_too_long'; end if;
 if p_event_type is null or btrim(p_event_type)='' then raise exception 'event_type_required'; end if;
 if length(p_event_type)>100 then raise exception 'event_type_too_long'; end if;
 if p_character_id is not null then raise exception 'character_binding_unsupported'; end if;
 if octet_length(coalesce(p_payload,'{}'::jsonb)::text)>131072 then raise exception 'event_payload_too_large'; end if;
 insert into public.r41_events(scope_key,account_id,character_id,world_id,event_type,payload) values(p_scope_key,p_account_id,null,p_world_id,p_event_type,coalesce(p_payload,'{}'::jsonb)) returning id into v_id;
 return jsonb_build_object('ok',true,'id',v_id);
end $$;

create or replace function public.r41_create_world_v1(p_code text,p_owner_account_id uuid default null,p_state jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world public.r41_worlds%rowtype; v_code text;
begin
 v_code:=upper(btrim(coalesce(p_code,'')));
 if length(v_code)<12 then return jsonb_build_object('ok',false,'error','world_code_weak'); end if;
 if length(v_code)>40 or v_code!~'^[A-Z0-9_-]+$' then return jsonb_build_object('ok',false,'error','world_code_invalid'); end if;
 if octet_length(coalesce(p_state,'{}'::jsonb)::text)>1048576 then raise exception 'world_state_too_large'; end if;
 select * into v_world from public.r41_worlds where code=v_code for update;
 if found then
  if v_world.owner_account_id is distinct from p_owner_account_id then return jsonb_build_object('ok',false,'error','world_code_taken'); end if;
  update public.r41_worlds set updated_at=now() where id=v_world.id returning * into v_world;
 else
  insert into public.r41_worlds(code,owner_account_id,state) values(v_code,p_owner_account_id,coalesce(p_state,'{}'::jsonb)) returning * into v_world;
 end if;
 if p_owner_account_id is not null then insert into public.r41_world_members(world_id,account_id,character_id,role) values(v_world.id,p_owner_account_id,null,'owner') on conflict(world_id,account_id) do update set last_seen_at=now(); end if;
 return jsonb_build_object('ok',true,'world_id',v_world.id,'code',v_world.code,'revision',v_world.revision,'state',v_world.state);
end $$;

create or replace function public.r41_join_world_v1(p_code text,p_account_id uuid,p_character_id uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world public.r41_worlds%rowtype; v_code text;
begin
 v_code:=upper(btrim(coalesce(p_code,'')));
 if length(v_code)<12 or length(v_code)>40 or v_code!~'^[A-Z0-9_-]+$' then return jsonb_build_object('ok',false,'error','world_code_invalid'); end if;
 select * into v_world from public.r41_worlds where code=v_code;
 if not found then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 insert into public.r41_world_members(world_id,account_id,character_id) values(v_world.id,p_account_id,null) on conflict(world_id,account_id) do update set last_seen_at=now();
 return jsonb_build_object('ok',true,'world_id',v_world.id,'code',v_world.code,'revision',v_world.revision,'state',v_world.state,'identity_mode','account');
end $$;

create or replace function public.r41_apply_action_v2(p_world_id uuid,p_account_id uuid,p_actor_key text,p_action jsonb,p_expected_revision bigint default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world public.r41_worlds%rowtype; v_claim public.r41_actor_claims%rowtype; v_event_id bigint; v_action_type text;
begin
 if p_action is null or jsonb_typeof(p_action)<>'object' then raise exception 'action_must_be_object'; end if;
 if octet_length(p_action::text)>65536 then raise exception 'action_too_large'; end if;
 if p_actor_key is null or btrim(p_actor_key)='' or length(p_actor_key)>120 then raise exception 'actor_key_invalid'; end if;
 v_action_type:=coalesce(nullif(p_action->>'type',''),'action'); if length(v_action_type)>100 then raise exception 'action_type_too_long'; end if;
 select * into v_world from public.r41_worlds where id=p_world_id for update; if not found then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 if not exists(select 1 from public.r41_world_members where world_id=p_world_id and account_id=p_account_id) then return jsonb_build_object('ok',false,'error','not_world_member'); end if;
 if p_expected_revision is not null and v_world.revision<>p_expected_revision then return jsonb_build_object('ok',false,'error','revision_conflict','revision',v_world.revision,'state',v_world.state); end if;
 select * into v_claim from public.r41_actor_claims where world_id=p_world_id and actor_key=p_actor_key;
 if not found or v_claim.account_id<>p_account_id or (v_claim.expires_at is not null and v_claim.expires_at<=now()) then return jsonb_build_object('ok',false,'error','actor_not_claimed'); end if;
 update public.r41_worlds set state=jsonb_set(jsonb_set(coalesce(state,'{}'::jsonb),'{lastAction}',p_action,true),'{lastActor}',to_jsonb(p_actor_key),true),revision=revision+1,updated_at=now() where id=p_world_id returning * into v_world;
 insert into public.r41_events(scope_key,account_id,world_id,event_type,payload) values('world:'||p_world_id::text,p_account_id,p_world_id,'online_action.'||v_action_type,jsonb_build_object('actor_key',p_actor_key,'action',p_action,'revision',v_world.revision)) returning id into v_event_id;
 return jsonb_build_object('ok',true,'world_id',v_world.id,'revision',v_world.revision,'state',v_world.state,'event_id',v_event_id);
end $$;
