/**
* TAG — add updated_at
* Issue #50 specifies the canonical tag schema includes an `updated_at`
* timestamp column alongside `created_at`. The original create-tag migration
* (#32) omitted it, so add it here non-destructively and backfill existing
* rows to `created_at`.
*/
alter table tag
  add column updated_at timestamptz not null default now();

update tag set updated_at = created_at where updated_at is distinct from created_at;
