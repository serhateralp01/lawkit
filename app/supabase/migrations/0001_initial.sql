-- ============================================================================
-- LawKit ilk migration: profiles + case_attempts + RLS + auto-profile trigger
-- ============================================================================
-- Uygulama yöntemi:
--   1. Supabase dashboard → SQL Editor → New query
--   2. Bu dosyanın tamamını yapıştır → Run
--   3. Sol menüden Table Editor'a gidip 'profiles' ve 'case_attempts'
--      görünüyor mu kontrol et
-- Idempotent: tekrar çalıştırılırsa hata vermez (IF NOT EXISTS).
-- ============================================================================

-- ───────── profiles ─────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  school text,
  exam_target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Her auth.users''a bir profil. id = auth.users.id.';

-- ───────── case_attempts ─────────
create table if not exists public.case_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null,
  outcome_id text,
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  duration_ms integer not null default 0,
  hints_opened integer not null default 0,
  xp_earned integer not null default 0,
  ledger jsonb not null default '{}'::jsonb,
  verdict_summary jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists case_attempts_user_idx on public.case_attempts (user_id, finished_at desc);
create index if not exists case_attempts_case_idx on public.case_attempts (case_id);

comment on table public.case_attempts is 'Her vaka denemesi bir kayıt — karne radarı ve mastery hesaplaması bu tablodan.';

-- ───────── updated_at trigger ─────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ───────── auto-profile trigger ─────────
-- Yeni bir kullanıcı auth.users'a eklendiğinde profiles satırı otomatik açılır.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security — herkes sadece kendi verisini görür
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.case_attempts enable row level security;

-- profiles
drop policy if exists "kendi profilim — select" on public.profiles;
create policy "kendi profilim — select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "kendi profilim — update" on public.profiles;
create policy "kendi profilim — update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "kendi profilim — insert" on public.profiles;
create policy "kendi profilim — insert" on public.profiles
  for insert with check (auth.uid() = id);

-- case_attempts
drop policy if exists "kendi denemelerim — select" on public.case_attempts;
create policy "kendi denemelerim — select" on public.case_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "kendi denemelerim — insert" on public.case_attempts;
create policy "kendi denemelerim — insert" on public.case_attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists "kendi denemelerim — delete" on public.case_attempts;
create policy "kendi denemelerim — delete" on public.case_attempts
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Doğrulama: aşağıdaki sorgular sıfırdan veri döndürür ama hata vermez.
-- Eğer hata alırsan, migration uygulanmamış demektir.
-- ============================================================================
-- select * from public.profiles limit 0;
-- select * from public.case_attempts limit 0;
