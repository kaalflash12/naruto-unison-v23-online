revoke execute on function public.append_r41_event(text,text,jsonb,uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.append_r41_event(text,text,jsonb,uuid,uuid,uuid) to service_role;

revoke execute on function public.load_r41_state_v1(text) from public, anon, authenticated;
grant execute on function public.load_r41_state_v1(text) to service_role;

revoke execute on function public.save_r41_state_v1(text,jsonb,bigint,uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.save_r41_state_v1(text,jsonb,bigint,uuid,uuid,uuid) to service_role;

revoke execute on function public.r41_apply_action_v2(uuid,uuid,text,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.r41_apply_action_v2(uuid,uuid,text,jsonb,bigint) to service_role;

revoke execute on function public.r41_claim_actor_v1(uuid,text,uuid,integer) from public, anon, authenticated;
grant execute on function public.r41_claim_actor_v1(uuid,text,uuid,integer) to service_role;

revoke execute on function public.r41_create_world_v1(text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.r41_create_world_v1(text,uuid,jsonb) to service_role;

revoke execute on function public.r41_join_world_v1(text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.r41_join_world_v1(text,uuid,uuid) to service_role;

revoke execute on function public.r41_release_actor_v1(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.r41_release_actor_v1(uuid,text,uuid) to service_role;

revoke execute on function public.r41_world_set_flag_v1(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.r41_world_set_flag_v1(uuid,text,jsonb) to service_role;

revoke execute on function public.r41_world_set_presence_v1(uuid,uuid,uuid,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.r41_world_set_presence_v1(uuid,uuid,uuid,text,text,text,jsonb) to service_role;

revoke execute on function public.r41_world_snapshot_v1(uuid) from public, anon, authenticated;
grant execute on function public.r41_world_snapshot_v1(uuid) to service_role;

revoke execute on function public.r41_world_tick_v1(uuid,uuid,text,integer) from public, anon, authenticated;
grant execute on function public.r41_world_tick_v1(uuid,uuid,text,integer) to service_role;

revoke execute on function public.r41_world_upsert_mission_v1(uuid,text,uuid,uuid,text,text,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.r41_world_upsert_mission_v1(uuid,text,uuid,uuid,text,text,jsonb,bigint) to service_role;

revoke execute on function public.r41_world_upsert_npc_v1(uuid,text,text,boolean,jsonb,jsonb,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.r41_world_upsert_npc_v1(uuid,text,text,boolean,jsonb,jsonb,jsonb,bigint) to service_role;

revoke execute on function public.test_r41_db() from public, anon, authenticated;
grant execute on function public.test_r41_db() to service_role;

revoke execute on function public.test_r41_world_e2e_v2() from public, anon, authenticated;
grant execute on function public.test_r41_world_e2e_v2() to service_role;

revoke execute on function public.test_r41_world_v2() from public, anon, authenticated;
grant execute on function public.test_r41_world_v2() to service_role;

revoke execute on function public.enforce_naruto_account_ban_auth_state() from public, anon, authenticated;
grant execute on function public.enforce_naruto_account_ban_auth_state() to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

revoke execute on function public.authorize(public.app_permission) from public, anon;
grant execute on function public.authorize(public.app_permission) to authenticated, service_role;
