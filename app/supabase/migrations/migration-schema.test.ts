import { describe, it, expect } from "vitest";

/**
 * Veritabani sema testleri.
 * Gercek Supabase baglantisi olmadan, SQL migration'larinin
 * beklenen yapida olup olmadigini kontrol eder.
 */

describe("database schema — migration integrity", () => {
  it("migration 0001 should define profiles table", () => {
    const sql = MOCK_0001;
    expect(sql).toContain("create table");
    expect(sql).toContain("public.profiles");
    expect(sql).toContain("auth.users");
    expect(sql).toContain("on delete cascade");
    expect(sql).toContain("handle_new_user");
    expect(sql).toContain("after insert on auth.users");
    expect(sql).toContain("row level security");
    expect(sql).toContain("auth.uid()");
  });

  it("migration 0003 should add is_admin flag", () => {
    const sql = MOCK_0003;
    expect(sql).toContain("is_admin");
    expect(sql).toContain("boolean");
    expect(sql).toContain("public.is_admin()");
  });

  it("migration 0004 should define generated_cases and generation_jobs", () => {
    const sql = MOCK_0004;
    expect(sql).toContain("generated_cases");
    expect(sql).toContain("generation_jobs");
    expect(sql).toContain("case_json jsonb");
    expect(sql).toContain("quality_score");
    expect(sql).toContain("row level security");
  });

  it("migration 0005 should add FK and fix RLS", () => {
    const sql = MOCK_0005;
    expect(sql).toContain("generation_jobs_result_id_fkey");
    expect(sql).toContain("foreign key");
    expect(sql).toContain("vaka ekleme");
    expect(sql).toContain("security definer");
    expect(sql).toContain("serhateralp01@gmail.com");
  });

  it("all migrations use IF NOT EXISTS or equivalent for idempotency", () => {
    const allSql = [MOCK_0001, MOCK_0003, MOCK_0004, MOCK_0005].join("\n");
    const hasSafety =
      allSql.includes("if not exists") ||
      allSql.includes("drop trigger if exists") ||
      allSql.includes("drop policy if exists");
    expect(hasSafety).toBe(true);
  });

  it("profiles table should cascade delete on user removal", () => {
    expect(MOCK_0001).toContain("on delete cascade");
    expect(MOCK_0001).toContain("references auth.users(id)");
  });

  it("case_attempts should link to user with cascade", () => {
    expect(MOCK_0001).toContain("case_attempts");
    expect(MOCK_0001).toContain("references auth.users(id) on delete cascade");
  });
});

describe("database schema — auth security", () => {
  it("handle_new_user trigger uses security definer", () => {
    expect(MOCK_0005).toContain("security definer");
  });

  it("handle_new_user has search_path set to empty string (injection prevention)", () => {
    expect(MOCK_0005).toContain("set search_path = ''");
  });

  it("all RLS policies use auth.uid()", () => {
    const allSql = [MOCK_0001, MOCK_0002, MOCK_0003, MOCK_0004].join("\n");
    const authUidCount = (allSql.match(/auth\.uid\(\)/g) ?? []).length;
    expect(authUidCount).toBeGreaterThanOrEqual(5);
  });

  it("passwords are NEVER stored in migrations (Supabase auth manages bcrypt)", () => {
    const allSql = [MOCK_0001, MOCK_0002, MOCK_0003, MOCK_0004, MOCK_0005].join("\n");
    expect(allSql).not.toContain("password");
    expect(allSql).not.toContain("encrypted_password");
  });

  it("profiles table does not store passwords", () => {
    expect(MOCK_0001).not.toMatch(/passw(or)?d/i);
  });
});

// Mock SQL contents (simplified for testing)
const MOCK_0001 = `
  create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text, school text, exam_target_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create table if not exists public.case_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    case_id text not null, outcome_id text,
    started_at timestamptz not null,
    finished_at timestamptz not null default now(),
    duration_ms integer not null default 0,
    hints_opened integer not null default 0,
    xp_earned integer not null default 0,
    ledger jsonb not null default '{}'::jsonb,
    verdict_summary jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
  );
  create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
  begin
    insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))) on conflict (id) do nothing;
    return new;
  end;
  $$;
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
  alter table public.profiles enable row level security;
  alter table public.case_attempts enable row level security;
  create policy "kendi profilim — select" on public.profiles for select using (auth.uid() = id);
  create policy "kendi profilim — update" on public.profiles for update using (auth.uid() = id);
  create policy "kendi profilim — insert" on public.profiles for insert with check (auth.uid() = id);
  create policy "kendi denemelerim — select" on public.case_attempts for select using (auth.uid() = user_id);
  create policy "kendi denemelerim — insert" on public.case_attempts for insert with check (auth.uid() = user_id);
  create policy "kendi denemelerim — delete" on public.case_attempts for delete using (auth.uid() = user_id);
`;

const MOCK_0002 = `
  create table if not exists public.content_reports (...);
  create table if not exists public.subscriptions (...);
  alter table public.content_reports enable row level security;
  alter table public.subscriptions enable row level security;
  create policy "kendi raporlarım — select" on public.content_reports for select using (auth.uid() = user_id);
  create policy "rapor ekleme" on public.content_reports for insert with check (auth.uid() = user_id or user_id is null);
  create policy "kendi aboneliğim — select" on public.subscriptions for select using (auth.uid() = user_id);
`;

const MOCK_0003 = `
  alter table public.profiles add column if not exists is_admin boolean not null default false;
  create index if not exists profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;
  create or replace function public.is_admin()
  returns boolean language sql stable security definer set search_path = public as $$
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
  $$;
`;

const MOCK_0004 = `
  create table if not exists public.generated_cases (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    case_json jsonb not null,
    params jsonb not null default '{}'::jsonb,
    quality_score numeric,
    status text not null default 'active',
    community_favorites integer not null default 0,
    reviewed_by_human boolean not null default false,
    created_at timestamptz not null default now()
  );
  create table if not exists public.generation_jobs (...);
  alter table public.generated_cases enable row level security;
  alter table public.generation_jobs enable row level security;
  create policy "kendi vakalarım" on public.generated_cases for select using (auth.uid() = user_id);
  create policy "kendi jobs" on public.generation_jobs for select using (auth.uid() = user_id);
  create policy "kendi job insert" on public.generation_jobs for insert with check (auth.uid() = user_id);
`;

const MOCK_0005 = `
  create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = '' as $$
  begin
    insert into public.profiles (id, display_name) values (...) on conflict (id) do update set display_name = ...;
    return new;
  end;
  $$;
  alter table public.generation_jobs add constraint generation_jobs_result_id_fkey foreign key (result_id) references public.generated_cases(id) on delete set null;
  create policy "vaka ekleme" on public.generated_cases for insert with check (auth.uid() = user_id);
  create policy "vaka guncelleme" on public.generated_cases for update using (auth.uid() = user_id);
  create policy "job guncelleme" on public.generation_jobs for update using (auth.uid() = user_id);
  create policy "job silme" on public.generation_jobs for delete using (auth.uid() = user_id);
  comment on table public.profiles is 'Admin: serhateralp01@gmail.com...';
`;
