create or replace function public.ranked_commit_turn_resolution(
  p_match_id uuid,
  p_expected_turn integer,
  p_new_state jsonb,
  p_winner uuid
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  m public.ranked_matches;
  distinct_submitters integer;
  loser uuid;
  ended boolean;
begin
  select * into m from public.ranked_matches where id=p_match_id for update;
  if not found then raise exception 'match not found'; end if;
  if m.status<>'ACTIVE' or m.turn<>p_expected_turn then
    return jsonb_build_object('duplicate',true,'status',m.status,'turn',m.turn,'winner',m.winner);
  end if;

  select count(distinct s.user_id) into distinct_submitters
  from public.ranked_turn_submissions s
  where s.match_id=p_match_id and s.turn=p_expected_turn and s.user_id in (m.player_a,m.player_b);
  if distinct_submitters<>2 then raise exception 'both player submissions required'; end if;

  if p_winner is not null and p_winner not in (m.player_a,m.player_b) then raise exception 'invalid winner'; end if;
  ended := p_winner is not null;

  update public.ranked_matches
  set state=p_new_state,
      status=case when ended then 'ENDED' else 'ACTIVE' end,
      turn=case when ended then p_expected_turn else p_expected_turn+1 end,
      winner=p_winner,
      updated_at=now()
  where id=p_match_id;

  if ended then
    loser:=case when p_winner=m.player_a then m.player_b else m.player_a end;
    insert into public.ranked_profiles(user_id,mmr,wins)
      values(p_winner,1016,1)
      on conflict(user_id) do update set mmr=public.ranked_profiles.mmr+16,wins=public.ranked_profiles.wins+1,updated_at=now();
    insert into public.ranked_profiles(user_id,mmr,losses)
      values(loser,984,1)
      on conflict(user_id) do update set mmr=greatest(0,public.ranked_profiles.mmr-16),losses=public.ranked_profiles.losses+1,updated_at=now();
  end if;

  return jsonb_build_object('duplicate',false,'status',case when ended then 'ENDED' else 'ACTIVE' end,'turn',case when ended then p_expected_turn else p_expected_turn+1 end,'winner',p_winner);
end
$function$;

create or replace function public.ranked_commit_abandon(
  p_match_id uuid,
  p_user_id uuid
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  m public.ranked_matches;
  winner_id uuid;
begin
  select * into m from public.ranked_matches where id=p_match_id for update;
  if not found then raise exception 'match not found'; end if;
  if p_user_id not in (m.player_a,m.player_b) then raise exception 'not participant'; end if;
  if m.status<>'ACTIVE' then
    return jsonb_build_object('duplicate',true,'status',m.status,'winner',m.winner);
  end if;

  winner_id:=case when m.player_a=p_user_id then m.player_b else m.player_a end;
  update public.ranked_matches set status='ENDED',winner=winner_id,updated_at=now() where id=p_match_id;

  insert into public.ranked_profiles(user_id,mmr,abandons,losses)
    values(p_user_id,972,1,1)
    on conflict(user_id) do update set mmr=greatest(0,public.ranked_profiles.mmr-28),abandons=public.ranked_profiles.abandons+1,losses=public.ranked_profiles.losses+1,updated_at=now();
  insert into public.ranked_profiles(user_id,mmr,wins)
    values(winner_id,1016,1)
    on conflict(user_id) do update set mmr=public.ranked_profiles.mmr+16,wins=public.ranked_profiles.wins+1,updated_at=now();

  return jsonb_build_object('duplicate',false,'status','ENDED','winner',winner_id);
end
$function$;

revoke all on function public.ranked_commit_turn_resolution(uuid,integer,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.ranked_commit_turn_resolution(uuid,integer,jsonb,uuid) to service_role;
revoke all on function public.ranked_commit_abandon(uuid,uuid) from public,anon,authenticated;
grant execute on function public.ranked_commit_abandon(uuid,uuid) to service_role;
