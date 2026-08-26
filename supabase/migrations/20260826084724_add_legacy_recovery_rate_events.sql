create table if not exists public.legacy_recovery_rate_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists legacy_recovery_rate_events_user_created_idx on public.legacy_recovery_rate_events (user_id, created_at desc);
alter table public.legacy_recovery_rate_events enable row level security;
revoke all on table public.legacy_recovery_rate_events from public, anon, authenticated;
grant select, insert, delete on table public.legacy_recovery_rate_events to service_role;
