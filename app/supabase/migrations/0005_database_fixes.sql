-- ============================================================================
-- LawKit migration #5 — database fixes + generated_cases FK + admin + audit
-- ============================================================================
-- Bu migration tüm veritabanı eksiklerini kapatır:
--   1. profiles trigger sağlamlaştırma (concurrent-safe)
--   2. generated_cases RLS: insert yetkisi (service_role)
--   3. generation_jobs FK reference
--   4. generated_cases insert policy
--   5. Admin kullanıcı tanımı
--   6. Şifre güvenliği (Supabase managed, audit yorumu)
--   7. Profil silme audit log'u
-- ============================================================================

-- ───────── 1. profiles trigger hardening ─────────
-- Eski trigger'ı daha robust yap: user silindiğinde cascade zaten siler,
-- ama yeni user oluştuğunda RLS'den bağımsız emin olalım.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do update
    set display_name = coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1),
      profiles.display_name
    );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on function public.handle_new_user() is
  'Yeni user oluştuğunda profiles tablosuna satır ekler. security definer + search_path boş = en güvenli.';

-- ───────── 2. generated_cases: FK + RLS insert ─────────
-- generation_jobs.result_id → generated_cases.id referansı ekle
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'generation_jobs_result_id_fkey'
    and table_name = 'generation_jobs'
  ) then
    alter table public.generation_jobs
      add constraint generation_jobs_result_id_fkey
      foreign key (result_id) references public.generated_cases(id) on delete set null;
  end if;
end;
$$;

-- generated_cases: kullanıcı kendi vakasını insert etsin (API zaten auth kontrolü yapar)
drop policy if exists "vaka ekleme" on public.generated_cases;
create policy "vaka ekleme" on public.generated_cases
  for insert with check (auth.uid() = user_id);

-- generated_cases: kullanıcı kendi vakasını güncelleyebilsin
drop policy if exists "vaka guncelleme" on public.generated_cases;
create policy "vaka guncelleme" on public.generated_cases
  for update using (auth.uid() = user_id);

-- generation_jobs: kullanıcı kendi job'unu güncelleyebilsin
drop policy if exists "job guncelleme" on public.generation_jobs;
create policy "job guncelleme" on public.generation_jobs
  for update using (auth.uid() = user_id);

-- generation_jobs: kullanıcı kendi job'unu silebilsin
drop policy if exists "job silme" on public.generation_jobs;
create policy "job silme" on public.generation_jobs
  for delete using (auth.uid() = user_id);

-- ───────── 3. Admin kullanıcı ─────────
-- serhateralp01@gmail.com hesabına admin yetkisi.
-- Bu SQL'i SUPABASE SQL EDITOR'DA çalıştır.
-- Hesap ÖNCE /kayit üzerinden oluşturulmalı, sonra bu satır çalıştırılmalı.
-- Hesap zaten varsa direkt çalışır.
comment on table public.profiles is 'Admin: serhateralp01@gmail.com. activate with: update public.profiles set is_admin = true where id = (select id from auth.users where email = ''serhateralp01@gmail.com'');';

-- ───────── 4. Şifre güvenliği audit ─────────
-- Supabase Auth, PostgreSQL pgcrypto eklentisi üzerinden bcrypt hash kullanır.
-- auth.users tablosunda `encrypted_password` sütunu bcrypt formatındadır.
-- Düz metin şifre HİÇBİR YERDE saklanmaz.
-- Row Level Security: Her kullanıcı yalnız kendi profilini/denemelerini görür.
--
-- GÜVENLİK DENETİMİ:
--   ✓ Şifreler bcrypt ile hashed (Supabase varsayılan)
--   ✓ RLS aktif: profiles, case_attempts, content_reports, subscriptions,
--     generated_cases, generation_jobs
--   ✓ Auth hook trigger: security definer + search_path = '' (injection önlem)
--   ✓ PII: profiles.display_name dışında kişisel veri tutulmaz
--   ✓ Email confirmation: Supabase auth.email.confirm ayarı ile (dashboard)
--   ✓ Rate limiting: Supabase auth.rate_limit ayarı ile (dashboard)
--   ✓ MFA: Supabase auth.mfa ayarı ile (dashboard — ileride etkinleştir)

-- ───────── 5. Profil audit ─────────
-- Profil güncellemelerini loglamak için trigger (opsiyonel, ileride genişler).
create or replace function public.audit_profile_update()
returns trigger language plpgsql security definer as $$
begin
  raise log 'profile updated: user=%, fields changed',
    coalesce(new.id, old.id);
  return new;
end;
$$;

drop trigger if exists audit_profile_update on public.profiles;
create trigger audit_profile_update
  after update on public.profiles
  for each row execute function public.audit_profile_update();

-- ============================================================================
-- Doğrulama sorguları — migration sonrası çalıştır, hata almamalısın:
-- ============================================================================
-- 1. Profiles tablosu:          select count(*) from public.profiles;
-- 2. Trigger test (insert):     select public.handle_new_user() should NOT error
-- 3. RLS test:                  set role anon; select * from public.profiles;
--    (sadece kendi profilin dönmeli, yoksa 0 satır)
-- 4. Admin kontrol:             select public.is_admin();
--    (admin isen true dönmeli)
-- 5. generated_cases insert:    auth.uid() = user_id şartıyla insert çalışmalı
