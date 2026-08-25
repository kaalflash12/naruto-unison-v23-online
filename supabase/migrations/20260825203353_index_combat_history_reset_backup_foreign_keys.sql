create index if not exists idx_combat_history_reset_backups_legacy_account_id
  on public.combat_history_reset_backups (legacy_account_id);

create index if not exists idx_combat_history_reset_backups_user_id
  on public.combat_history_reset_backups (user_id);
