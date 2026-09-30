-- Run as the database administrator before deploying the Archive frontend.
-- Repeatable; preserves all content, IDs, statuses and timestamps.
begin;
lock table public.entries in access exclusive mode;
alter table public.entries drop constraint if exists entries_kind_check;
alter table public.entries disable trigger prepare_entry;
update public.entries set kind = 'archive' where kind = 'blog';
alter table public.entries enable trigger prepare_entry;
alter table public.entries add constraint entries_kind_check
  check (kind in ('notes', 'archive'));
commit;
