create table if not exists public.sns_auth_rate_limit_events(
  id uuid primary key default gen_random_uuid(),
  bucket_key text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists sns_auth_rate_limit_events_bucket_action_created_idx
  on public.sns_auth_rate_limit_events(bucket_key,action,created_at desc);

alter table public.sns_auth_rate_limit_events enable row level security;
revoke all on table public.sns_auth_rate_limit_events from public,anon,authenticated;
grant select,insert,delete on table public.sns_auth_rate_limit_events to service_role;

select cron.schedule(
  'sns-auth-rate-limit-cleanup',
  '*/15 * * * *',
  $$delete from public.sns_auth_rate_limit_events where created_at < now() - interval '2 hours'$$
);
