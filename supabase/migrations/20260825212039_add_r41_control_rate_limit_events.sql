create table if not exists public.r41_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  action text not null check (action in ('world_create','world_join','world_claim')),
  created_at timestamptz not null default now()
);

create index if not exists r41_rate_limit_events_account_action_created_idx
  on public.r41_rate_limit_events (account_id, action, created_at desc);

alter table public.r41_rate_limit_events enable row level security;
revoke all on table public.r41_rate_limit_events from anon, authenticated;
grant select, insert, delete on table public.r41_rate_limit_events to service_role;
