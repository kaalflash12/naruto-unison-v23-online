create unique index if not exists ranked_turn_one_submission_per_user_turn_idx on public.ranked_turn_submissions(match_id,user_id,turn);

create or replace function public.ranked_matchmake(
  p_user_id uuid,
  p_team jsonb,
  p_mmr integer,
  p_season_id text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  existing_match public.ranked_matches;
  opponent public.ranked_queue;
  created_match public.ranked_matches;
  safe_mmr integer := greatest(0, least(coalesce(p_mmr,1000),100000));
  safe_season text := left(coalesce(nullif(p_season_id,''),'S1'),64);
begin
  if p_user_id is null then raise exception 'user required'; end if;
  if jsonb_typeof(p_team) <> 'object' or jsonb_typeof(p_team->'snapshot') <> 'array' then raise exception 'invalid team snapshot'; end if;

  perform pg_advisory_xact_lock(hashtext('naruto-ranked-matchmake'));

  select * into existing_match
  from public.ranked_matches
  where status='ACTIVE' and (player_a=p_user_id or player_b=p_user_id)
  order by created_at desc
  limit 1;

  if found then
    delete from public.ranked_queue where user_id=p_user_id;
    return jsonb_build_object('status','MATCHED','existing',true,'match',to_jsonb(existing_match));
  end if;

  insert into public.ranked_queue(user_id,team,mmr,queued_at)
  values(p_user_id,p_team,safe_mmr,now())
  on conflict(user_id) do update set team=excluded.team,mmr=excluded.mmr,queued_at=excluded.queued_at;

  select q.* into opponent
  from public.ranked_queue q
  where q.user_id<>p_user_id
    and q.mmr between safe_mmr-150 and safe_mmr+150
    and not exists (
      select 1 from public.ranked_matches m
      where m.status='ACTIVE' and (m.player_a=q.user_id or m.player_b=q.user_id)
    )
  order by q.queued_at
  limit 1
  for update skip locked;

  if not found then
    return jsonb_build_object('status','QUEUED');
  end if;

  insert into public.ranked_matches(season_id,player_a,player_b,state,turn,status)
  values(
    safe_season,
    p_user_id,
    opponent.user_id,
    jsonb_build_object(
      'turn',1,
      'players',jsonb_build_object('a',p_user_id,'b',opponent.user_id),
      'teams',jsonb_build_object('a',coalesce(p_team->'snapshot','[]'::jsonb),'b',coalesce(opponent.team->'snapshot','[]'::jsonb)),
      'chakra',jsonb_build_object(
        'a',jsonb_build_object('NIN',2,'TAI',2,'GEN',2,'KEK',2),
        'b',jsonb_build_object('NIN',2,'TAI',2,'GEN',2,'KEK',2)
      ),
      'events','[]'::jsonb,
      'resolvedSubmissions','{}'::jsonb
    ),
    1,
    'ACTIVE'
  ) returning * into created_match;

  delete from public.ranked_queue where user_id in (p_user_id,opponent.user_id);
  return jsonb_build_object('status','MATCHED','existing',false,'match',to_jsonb(created_match));
end
$function$;

revoke all on function public.ranked_matchmake(uuid,jsonb,integer,text) from public, anon, authenticated;
grant execute on function public.ranked_matchmake(uuid,jsonb,integer,text) to service_role;
