create table if not exists public.combat_history_reset_backups (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  legacy_account_id uuid null references public.naruto_accounts(id) on delete set null,
  user_id uuid null references public.profiles(user_id) on delete set null,
  user_name text null,
  profile_before jsonb null,
  reset_reason text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  constraint combat_history_reset_backup_target_chk check (
    legacy_account_id is not null or user_id is not null
  )
);

alter table public.combat_history_reset_backups enable row level security;
revoke all on table public.combat_history_reset_backups from anon, authenticated;

create or replace function private.reset_legacy_combat_profile(p_profile jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_profile, '{}'::jsonb)
    || jsonb_build_object(
      'wins', 0,
      'losses', 0,
      'c', coalesce(p_profile->'c', '{}'::jsonb) || jsonb_build_object(
        'kos', 0,
        'wins', 0,
        'items', 0,
        'jutsu', 0,
        'damage', 0,
        'battles', 0,
        'perfect', 0,
        'hardwins', 0,
        'bijuuWins', 0,
        'rankedWins', 0,
        'nukeninWins', 0,
        'rankedMatches', 0
      ),
      'ranked', coalesce(p_profile->'ranked', '{}'::jsonb) || jsonb_build_object(
        'mmr', 1000,
        'rating', 1000,
        'wins', 0,
        'losses', 0,
        'draws', 0,
        'abandons', 0,
        'lastRoom', null,
        'lastOutcome', null
      )
    )
$$;

revoke all on function private.reset_legacy_combat_profile(jsonb) from public, anon, authenticated;

create or replace function public.admin_reset_combat_history(
  p_legacy_account_id uuid default null,
  p_user_id uuid default null,
  p_reset_all boolean default false,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_principal_id uuid;
  v_batch_id uuid := gen_random_uuid();
  v_legacy_count integer := 0;
  v_normalized_count integer := 0;
  v_replays_deleted integer := 0;
  v_matches_deleted integer := 0;
  v_queue_deleted integer := 0;
  v_ranked_profiles_reset integer := 0;
begin
  if v_actor is null or not private.authorize('ranked.admin'::public.app_permission) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_reset_all and (p_legacy_account_id is not null or p_user_id is not null) then
    raise exception 'INVALID_RESET_SCOPE';
  end if;

  if not p_reset_all and p_legacy_account_id is null and p_user_id is null then
    raise exception 'RESET_TARGET_REQUIRED';
  end if;

  if not p_reset_all and p_legacy_account_id is not null and p_user_id is not null then
    raise exception 'ONE_RESET_TARGET_AT_A_TIME';
  end if;

  if length(coalesce(p_reason, '')) > 500 then
    raise exception 'RESET_REASON_TOO_LONG';
  end if;

  select ap.id into v_principal_id
  from public.admin_principals ap
  where ap.user_id = v_actor and ap.active
  order by ap.created_at
  limit 1;

  insert into public.combat_history_reset_backups(
    batch_id, legacy_account_id, user_name, profile_before, reset_reason, created_by
  )
  select v_batch_id, a.id, a.user_name, a.profile, p_reason, v_actor
  from public.naruto_accounts a
  where p_reset_all or a.id = p_legacy_account_id;

  update public.naruto_accounts a
  set profile = private.reset_legacy_combat_profile(a.profile),
      revision = a.revision + 1,
      saved_at = now()
  where p_reset_all or a.id = p_legacy_account_id;
  get diagnostics v_legacy_count = row_count;

  insert into public.combat_history_reset_backups(
    batch_id, user_id, user_name, reset_reason, created_by
  )
  select v_batch_id, p.user_id, p.username, p_reason, v_actor
  from public.profiles p
  where p_reset_all or p.user_id = p_user_id;
  get diagnostics v_normalized_count = row_count;

  delete from public.battle_replays br
  where p_reset_all
     or br.match_id in (
       select rm.id
       from public.ranked_matches rm
       where rm.player_a = p_user_id or rm.player_b = p_user_id
     );
  get diagnostics v_replays_deleted = row_count;

  delete from public.ranked_matches rm
  where p_reset_all or rm.player_a = p_user_id or rm.player_b = p_user_id;
  get diagnostics v_matches_deleted = row_count;

  delete from public.ranked_queue rq
  where p_reset_all or rq.user_id = p_user_id;
  get diagnostics v_queue_deleted = row_count;

  update public.ranked_profiles rp
  set mmr = 1000,
      wins = 0,
      losses = 0,
      abandons = 0,
      updated_at = now()
  where p_reset_all or rp.user_id = p_user_id;
  get diagnostics v_ranked_profiles_reset = row_count;

  insert into public.admin_audit_log(
    principal_id, action, target_type, target_id, before, after, request_id
  ) values (
    v_principal_id,
    'accounts.reset_combat_history',
    case when p_reset_all then 'all_accounts' when p_legacy_account_id is not null then 'legacy_account' else 'profile' end,
    case when p_reset_all then 'ALL' when p_legacy_account_id is not null then p_legacy_account_id::text else p_user_id::text end,
    jsonb_build_object('reason', p_reason),
    jsonb_build_object(
      'batchId', v_batch_id,
      'legacyAccountsReset', v_legacy_count,
      'normalizedUsersTargeted', v_normalized_count,
      'battleReplaysDeleted', v_replays_deleted,
      'rankedMatchesDeleted', v_matches_deleted,
      'rankedQueueDeleted', v_queue_deleted,
      'rankedProfilesReset', v_ranked_profiles_reset,
      'preserved', jsonb_build_array(
        'auth/account identity',
        'characters/unlocks',
        'jutsu/mastery progression',
        'inventory/equipment/loadouts',
        'xp/ryo/story/mission progress',
        'mission/raid anti-abuse ledgers'
      )
    ),
    v_batch_id::text
  );

  return jsonb_build_object(
    'ok', true,
    'batchId', v_batch_id,
    'legacyAccountsReset', v_legacy_count,
    'normalizedUsersTargeted', v_normalized_count,
    'battleReplaysDeleted', v_replays_deleted,
    'rankedMatchesDeleted', v_matches_deleted,
    'rankedQueueDeleted', v_queue_deleted,
    'rankedProfilesReset', v_ranked_profiles_reset
  );
end;
$$;

revoke all on function public.admin_reset_combat_history(uuid, uuid, boolean, text) from public, anon;
grant execute on function public.admin_reset_combat_history(uuid, uuid, boolean, text) to authenticated;

comment on function public.admin_reset_combat_history(uuid, uuid, boolean, text) is
'RBAC-protected combat-history reset. Requires ranked.admin. Preserves account identity, unlocks, equipment, XP/ryo, story/mission progress and mastery; clears legacy combat counters and normalized ranked history.';
