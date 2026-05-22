-- ============================================================================
-- LawKit migration #2 — content_reports + subscriptions
-- ============================================================================
-- Uygulama:
--   1. Supabase dashboard → SQL Editor → New query
--   2. Bu dosyayı yapıştır → Run
-- Idempotent: tekrar çalıştırılır.
-- ============================================================================

-- ───────── content_reports ─────────
-- Vaka/dilekçe içeriklerinde hatalı bilgi rapor formu.
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  content_type text not null check (content_type in ('case', 'petition', 'source', 'other')),
  content_id text not null,
  category text check (category in ('legal_error', 'typo', 'outdated', 'inappropriate', 'other')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists content_reports_status_idx on public.content_reports (status, created_at desc);
create index if not exists content_reports_content_idx on public.content_reports (content_type, content_id);

comment on table public.content_reports is 'Kullanıcı raporladığı içerik hataları — hukuki, yazım, güncellik, uygunsuz vb.';

-- ───────── subscriptions ─────────
-- Ödeme entegrasyonu gelince burası dolar.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'sprint', 'core', 'pro')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'expired')),
  period_start timestamptz not null default now(),
  period_end timestamptz,
  provider text check (provider in ('shopier', 'paytr', 'iyzico', 'manual')),
  provider_subscription_id text,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_user_active_idx
  on public.subscriptions (user_id)
  where status = 'active';

create index if not exists subscriptions_status_period_idx on public.subscriptions (status, period_end);

comment on table public.subscriptions is 'Kullanıcı abonelik kayıtları. Her kullanıcının max 1 active subscription olabilir.';

-- updated_at trigger reuse
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — herkes sadece kendi raporunu/aboneliğini görür
-- ============================================================================
alter table public.content_reports enable row level security;
alter table public.subscriptions enable row level security;

-- content_reports — kullanıcı kendi rapotlarını görür ve yenisini ekleyebilir
drop policy if exists "kendi raporlarım — select" on public.content_reports;
create policy "kendi raporlarım — select" on public.content_reports
  for select using (auth.uid() = user_id);

drop policy if exists "rapor ekleme" on public.content_reports;
create policy "rapor ekleme" on public.content_reports
  for insert with check (auth.uid() = user_id or user_id is null);

-- subscriptions — kullanıcı sadece kendi aboneliğini görür (yazma yok, server eder)
drop policy if exists "kendi aboneliğim — select" on public.subscriptions;
create policy "kendi aboneliğim — select" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Subscriptions yazma sadece service_role'dan — webhook'tan ödeme ile gelir.
