/**
* FEEDBACK
* User-submitted feedback messages. Each row is owned by the user who created it.
* Soft-deleted via deleted_at; never hard-deleted.
*/
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint feedback_subject_length check (char_length(subject) between 1 and 120),
  constraint feedback_body_length check (char_length(body) between 1 and 2000)
);

create index feedback_user_id_idx on feedback(user_id) where deleted_at is null;

alter table feedback enable row level security;

create policy "Users can insert own feedback."
  on feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own feedback."
  on feedback for select
  to authenticated
  using (auth.uid() = user_id);
