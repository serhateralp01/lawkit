-- Migration #6 — contact_messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "herkes mesaj gonderebilir" on public.contact_messages;
create policy "herkes mesaj gonderebilir" on public.contact_messages
  for insert with check (true);
