create unique index if not exists raid_attempts_one_active_per_user_event_idx
on public.raid_attempts (user_id, event_id)
where status = 'ACTIVE';
