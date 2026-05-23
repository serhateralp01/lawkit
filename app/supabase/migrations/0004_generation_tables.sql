-- ============================================================================
-- LawKit migration #4 — generated_cases + generation_jobs (dinamik üretim)
-- ============================================================================
-- AI ile üretilen vakalar ve uzun süren generation işlerinin tracking'i.
-- ============================================================================

-- ───────── generated_cases ─────────
create table if not exists public.generated_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  case_json jsonb not null,
  params jsonb not null default '{}'::jsonb,
  quality_score numeric,
  status text not null default 'active' check (status in ('active', 'archived', 'flagged')),
  community_favorites integer not null default 0,
  reviewed_by_human boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists generated_cases_user_idx
  on public.generated_cases (user_id, created_at desc);

create index if not exists generated_cases_status_idx
  on public.generated_cases (status, created_at desc);

comment on table public.generated_cases is
  'AI tarafından kullanıcıya özel üretilen LegalCase JSON kayıtları. case_attempts buraya FK üzerinden bağlanabilir.';

-- ───────── generation_jobs ─────────
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_type text not null check (job_type in ('case', 'question', 'petition')),
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  params jsonb not null default '{}'::jsonb,
  result_id uuid,
  error_message text,
  progress_phase text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists generation_jobs_user_status_idx
  on public.generation_jobs (user_id, status, created_at desc);

create index if not exists generation_jobs_queued_idx
  on public.generation_jobs (status, created_at)
  where status in ('queued', 'running');

comment on table public.generation_jobs is
  'Long-running AI generation işlerinin durumu. UI 3-5 saniye aralıkla bu tablodan polling yapar.';

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.generated_cases enable row level security;
alter table public.generation_jobs enable row level security;

drop policy if exists "kendi vakalarım" on public.generated_cases;
create policy "kendi vakalarım" on public.generated_cases
  for select using (auth.uid() = user_id);

drop policy if exists "kendi vakalarımı silebilirim" on public.generated_cases;
create policy "kendi vakalarımı silebilirim" on public.generated_cases
  for delete using (auth.uid() = user_id);

drop policy if exists "kendi jobs" on public.generation_jobs;
create policy "kendi jobs" on public.generation_jobs
  for select using (auth.uid() = user_id);

drop policy if exists "kendi job insert" on public.generation_jobs;
create policy "kendi job insert" on public.generation_jobs
  for insert with check (auth.uid() = user_id);

-- ============================================================================
-- generated_cases insert sadece service_role'dan (Worker, üretim sonrası yazar)
-- generation_jobs update sadece service_role'dan
-- ============================================================================
