/**
* TAG
* User-owned tag for organising things in the app. Each row is owned by exactly
* one user. Soft-deleted via deleted_at; never hard-deleted.
*/
create table tag (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint tag_name_length check (char_length(name) between 1 and 40),
  constraint tag_color_hex check (color ~ '^#[0-9a-fA-F]{6}$')
);

create unique index tag_user_id_name_unique
  on tag(user_id, name)
  where deleted_at is null;

create index tag_user_id_idx on tag(user_id) where deleted_at is null;

alter table tag enable row level security;

create policy "Users can view own tags."
  on tag for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own tags."
  on tag for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tags."
  on tag for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
