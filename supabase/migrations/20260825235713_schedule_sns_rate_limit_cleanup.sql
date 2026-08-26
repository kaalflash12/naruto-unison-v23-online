select cron.schedule(
  'sns-rate-limit-cleanup',
  '*/15 * * * *',
  $$delete from public.sns_rate_limit_events where created_at < now() - interval '2 hours'$$
);
