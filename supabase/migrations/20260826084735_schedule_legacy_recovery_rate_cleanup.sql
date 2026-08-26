select cron.schedule(
  'legacy-recovery-rate-limit-cleanup',
  '*/15 * * * *',
  $$delete from public.legacy_recovery_rate_events where created_at < now() - interval '2 hours'$$
);
