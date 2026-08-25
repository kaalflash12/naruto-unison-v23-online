alter table public.r41_rate_limit_events drop constraint if exists r41_rate_limit_events_action_check;
alter table public.r41_rate_limit_events add constraint r41_rate_limit_events_action_check check (action = any(array['world_create'::text,'world_join'::text,'world_claim'::text,'state_save'::text,'event_append'::text,'world_action'::text]));

create or replace function public.r41_create_world_v1(p_code text,p_owner_account_id uuid default null,p_state jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_world public.r41_worlds%rowtype; v_code text;
begin
 v_code:=upper(btrim(coalesce(p_code,'')));
 if v_code !~ '^WORLD-[A-F0-9]{18}$' then return jsonb_build_object('ok',false,'error','world_code_invalid'); end if;
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
 if v_code !~ '^WORLD-[A-F0-9]{18}$' then return jsonb_build_object('ok',false,'error','world_code_invalid'); end if;
 select * into v_world from public.r41_worlds where code=v_code;
 if not found then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 insert into public.r41_world_members(world_id,account_id,character_id) values(v_world.id,p_account_id,null) on conflict(world_id,account_id) do update set last_seen_at=now();
 return jsonb_build_object('ok',true,'world_id',v_world.id,'code',v_world.code,'revision',v_world.revision,'state',v_world.state,'identity_mode','account');
end $$;
