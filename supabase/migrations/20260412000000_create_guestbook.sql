/**
* GUESTBOOK
* Public-within-the-app guestbook entries. Any authenticated user can read
* non-soft-deleted entries; only the owner (user_id = auth.uid()) can insert,
* update, or soft-delete their own rows. Soft-deleted via deleted_at; never
* hard-deleted.
*/
create table guestbook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint guestbook_message_length check (char_length(message) between 1 and 280)
);

create index guestbook_user_id_idx on guestbook(user_id) where deleted_at is null;
create index guestbook_created_at_idx on guestbook(created_at desc) where deleted_at is null;

alter table guestbook enable row level security;

create policy "Authenticated users can view non-deleted guestbook entries."
  on guestbook for select
  to authenticated
  using (deleted_at is null);

create policy "Users can insert own guestbook entries."
  on guestbook for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own guestbook entries."
  on guestbook for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
