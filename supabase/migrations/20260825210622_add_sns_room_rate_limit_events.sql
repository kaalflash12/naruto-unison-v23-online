create table if not exists public.sns_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.sns_accounts(id) on delete cascade,
  action text not null check (action in ('room_join','room_create','room_message')),
  created_at timestamptz not null default now()
);

create index if not exists sns_rate_limit_events_account_action_created_idx
  on public.sns_rate_limit_events (account_id, action, created_at desc);

alter table public.sns_rate_limit_events enable row level security;
revoke all on table public.sns_rate_limit_events from anon, authenticated;
grant select, insert, delete on table public.sns_rate_limit_events to service_role;
