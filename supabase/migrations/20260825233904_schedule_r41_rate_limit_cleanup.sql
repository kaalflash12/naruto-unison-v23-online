do $$
declare v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname='r41-rate-limit-cleanup' limit 1;
  if v_jobid is not null then perform cron.unschedule(v_jobid); end if;
end $$;

select cron.schedule(
  'r41-rate-limit-cleanup',
  '*/15 * * * *',
  $$delete from public.r41_rate_limit_events where created_at < now() - interval '2 hours'$$
);
