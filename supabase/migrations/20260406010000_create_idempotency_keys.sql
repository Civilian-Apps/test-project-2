/**
* IDEMPOTENCY KEYS
* Records client-supplied Idempotency-Key headers so retried edge function
* calls can return the previously created resource without inserting again.
*
* Each row binds (user_id, key, resource_type) -> resource_id. The unique
* primary key prevents two concurrent retries from creating duplicates.
*/
create table idempotency_keys (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  resource_type text not null,
  resource_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, key, resource_type)
);

alter table idempotency_keys enable row level security;

create policy "Users can view own idempotency keys."
  on idempotency_keys for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own idempotency keys."
  on idempotency_keys for insert
  to authenticated
  with check (auth.uid() = user_id);
