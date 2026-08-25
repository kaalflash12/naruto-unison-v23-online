create or replace function public.r41_world_set_presence_v1(p_world_id uuid,p_account_id uuid,p_character_id uuid default null,p_area_key text default null,p_scene_key text default null,p_status text default 'online',p_meta jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if p_character_id is not null then return jsonb_build_object('ok',false,'error','character_binding_unsupported'); end if;
 if length(coalesce(p_area_key,''))>120 or length(coalesce(p_scene_key,''))>120 or length(coalesce(p_status,''))>40 then raise exception 'presence_field_too_long'; end if;
 if octet_length(coalesce(p_meta,'{}'::jsonb)::text)>32768 then raise exception 'presence_meta_too_large'; end if;
 if not exists(select 1 from public.r41_world_members where world_id=p_world_id and account_id=p_account_id) then return jsonb_build_object('ok',false,'error','not_world_member'); end if;
 insert into public.r41_world_presence(world_id,account_id,character_id,area_key,scene_key,status,meta,last_seen_at) values(p_world_id,p_account_id,null,p_area_key,p_scene_key,coalesce(nullif(p_status,''),'online'),coalesce(p_meta,'{}'::jsonb),now()) on conflict(world_id,account_id) do update set character_id=null,area_key=excluded.area_key,scene_key=excluded.scene_key,status=excluded.status,meta=excluded.meta,last_seen_at=now();
 update public.r41_world_members set last_seen_at=now(),character_id=null where world_id=p_world_id and account_id=p_account_id;
 return jsonb_build_object('ok',true,'world_id',p_world_id,'account_id',p_account_id,'status',coalesce(nullif(p_status,''),'online'),'seen_at',now(),'identity_mode','account');
end $$;

create or replace function public.r41_world_upsert_mission_v1(p_world_id uuid,p_mission_key text,p_account_id uuid default null,p_character_id uuid default null,p_status text default 'available',p_phase text default null,p_state jsonb default '{}'::jsonb,p_expected_revision bigint default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v public.r41_world_missions%rowtype;
begin
 if p_character_id is not null then return jsonb_build_object('ok',false,'error','character_binding_unsupported'); end if;
 if p_mission_key is null or btrim(p_mission_key)='' or length(p_mission_key)>120 then raise exception 'mission_key_invalid'; end if;
 if length(coalesce(p_status,''))>40 or length(coalesce(p_phase,''))>120 then raise exception 'mission_field_too_long'; end if;
 if octet_length(coalesce(p_state,'{}'::jsonb)::text)>131072 then raise exception 'mission_state_too_large'; end if;
 if p_account_id is not null and not exists(select 1 from public.r41_world_members where world_id=p_world_id and account_id=p_account_id) then return jsonb_build_object('ok',false,'error','not_world_member'); end if;
 select * into v from public.r41_world_missions where world_id=p_world_id and mission_key=p_mission_key for update;
 if found and p_expected_revision is not null and v.revision<>p_expected_revision then return jsonb_build_object('ok',false,'error','revision_conflict','revision',v.revision,'mission',to_jsonb(v)); end if;
 insert into public.r41_world_missions(world_id,mission_key,account_id,character_id,status,phase,state,revision,updated_at) values(p_world_id,p_mission_key,p_account_id,null,coalesce(nullif(p_status,''),'available'),p_phase,coalesce(p_state,'{}'::jsonb),1,now()) on conflict(world_id,mission_key) do update set account_id=coalesce(excluded.account_id,public.r41_world_missions.account_id),character_id=null,status=excluded.status,phase=excluded.phase,state=excluded.state,revision=public.r41_world_missions.revision+1,updated_at=now() returning * into v;
 return jsonb_build_object('ok',true,'mission',to_jsonb(v),'identity_mode','account');
end $$;

create or replace function public.r41_world_upsert_npc_v1(p_world_id uuid,p_npc_key text,p_location_key text default null,p_alive boolean default true,p_state jsonb default '{}'::jsonb,p_relationship jsonb default '{}'::jsonb,p_agenda jsonb default '{}'::jsonb,p_expected_revision bigint default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v public.r41_world_npcs%rowtype;
begin
 if p_npc_key is null or btrim(p_npc_key)='' or length(p_npc_key)>120 then raise exception 'npc_key_invalid'; end if;
 if length(coalesce(p_location_key,''))>120 then raise exception 'location_key_too_long'; end if;
 if octet_length(coalesce(p_state,'{}'::jsonb)::text)>131072 or octet_length(coalesce(p_relationship,'{}'::jsonb)::text)>131072 or octet_length(coalesce(p_agenda,'{}'::jsonb)::text)>131072 then raise exception 'npc_payload_too_large'; end if;
 if not exists(select 1 from public.r41_worlds where id=p_world_id) then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 select * into v from public.r41_world_npcs where world_id=p_world_id and npc_key=p_npc_key for update;
 if found and p_expected_revision is not null and v.revision<>p_expected_revision then return jsonb_build_object('ok',false,'error','revision_conflict','revision',v.revision,'npc',to_jsonb(v)); end if;
 insert into public.r41_world_npcs(world_id,npc_key,location_key,alive,state,relationship,agenda,revision,updated_at) values(p_world_id,p_npc_key,p_location_key,p_alive,coalesce(p_state,'{}'::jsonb),coalesce(p_relationship,'{}'::jsonb),coalesce(p_agenda,'{}'::jsonb),1,now()) on conflict(world_id,npc_key) do update set location_key=coalesce(excluded.location_key,public.r41_world_npcs.location_key),alive=excluded.alive,state=excluded.state,relationship=excluded.relationship,agenda=excluded.agenda,revision=public.r41_world_npcs.revision+1,updated_at=now() returning * into v;
 return jsonb_build_object('ok',true,'npc',to_jsonb(v));
end $$;

create or replace function public.r41_world_set_flag_v1(p_world_id uuid,p_flag_key text,p_value jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if p_flag_key is null or btrim(p_flag_key)='' or length(p_flag_key)>120 then raise exception 'flag_key_invalid'; end if;
 if octet_length(coalesce(p_value,'null'::jsonb)::text)>65536 then raise exception 'flag_value_too_large'; end if;
 if not exists(select 1 from public.r41_worlds where id=p_world_id) then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 insert into public.r41_world_flags(world_id,flag_key,value,updated_at) values(p_world_id,p_flag_key,coalesce(p_value,'null'::jsonb),now()) on conflict(world_id,flag_key) do update set value=excluded.value,updated_at=now();
 return jsonb_build_object('ok',true,'world_id',p_world_id,'flag_key',p_flag_key,'value',coalesce(p_value,'null'::jsonb));
end $$;

create or replace function public.r41_world_tick_v1(p_world_id uuid,p_account_id uuid default null,p_reason text default 'scene',p_delta_minutes integer default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_clock public.r41_world_clock%rowtype; v_event bigint;
begin
 if p_delta_minutes<0 then raise exception 'delta_minutes_negative'; end if;
 if p_delta_minutes>10080 then raise exception 'delta_minutes_too_large'; end if;
 if length(coalesce(p_reason,''))>80 then raise exception 'reason_too_long'; end if;
 if not exists(select 1 from public.r41_worlds where id=p_world_id) then return jsonb_build_object('ok',false,'error','world_not_found'); end if;
 if p_account_id is not null and not exists(select 1 from public.r41_world_members where world_id=p_world_id and account_id=p_account_id) then return jsonb_build_object('ok',false,'error','not_world_member'); end if;
 insert into public.r41_world_clock(world_id) values(p_world_id) on conflict(world_id) do nothing;
 update public.r41_world_clock set tick=tick+1,scene=scene+case when coalesce(p_reason,'scene') in ('scene','mission_scene','combat_scene','training_scene') then 1 else 0 end,game_minutes=game_minutes+p_delta_minutes,day=1+((game_minutes+p_delta_minutes)/1440)::integer,phase=case when ((game_minutes+p_delta_minutes)%1440) between 360 and 719 then 'morning' when ((game_minutes+p_delta_minutes)%1440) between 720 and 1079 then 'afternoon' when ((game_minutes+p_delta_minutes)%1440) between 1080 and 1259 then 'evening' else 'night' end,updated_at=now() where world_id=p_world_id returning * into v_clock;
 update public.r41_worlds set revision=revision+1,state=jsonb_set(coalesce(state,'{}'::jsonb),'{worldTick}',jsonb_build_object('tick',v_clock.tick,'scene',v_clock.scene,'game_minutes',v_clock.game_minutes,'day',v_clock.day,'phase',v_clock.phase,'reason',coalesce(p_reason,'scene'),'at',now()),true),updated_at=now() where id=p_world_id;
 insert into public.r41_events(scope_key,account_id,world_id,event_type,payload) values('world:'||p_world_id::text,p_account_id,p_world_id,'world.tick',jsonb_build_object('tick',v_clock.tick,'scene',v_clock.scene,'minutes',p_delta_minutes,'game_minutes',v_clock.game_minutes,'day',v_clock.day,'phase',v_clock.phase,'reason',coalesce(p_reason,'scene'))) returning id into v_event;
 return jsonb_build_object('ok',true,'world_id',p_world_id,'tick',v_clock.tick,'scene',v_clock.scene,'game_minutes',v_clock.game_minutes,'day',v_clock.day,'phase',v_clock.phase,'event_id',v_event);
end $$;
