-- ============================================================================
-- LawKit migration #3 — profiles.is_admin + admin policy + beta gating
-- ============================================================================
-- Bu migration prod'a deploy etmeden ÖNCE çalıştırılmalı; aksi halde
-- kimse admin olmaz, tüm gated route'lar herkese kapalı kalır.
--
-- Uygulama:
--   1. SQL Editor → bu dosyayı yapıştır → Run
--   2. Tek admin kullanıcıyı işaretle: dashboard'da auth.users tablosundan
--      kendi email'inle kayıtlı satırın id'sini al, sonra:
--      update public.profiles set is_admin = true where id = '<senin-uuid>';
-- ============================================================================

-- is_admin sütunu (idempotent)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx
  on public.profiles (is_admin)
  where is_admin = true;

comment on column public.profiles.is_admin is
  'Beta dönemi gating için: sadece bu işaretli kullanıcılar gated route''lara erişebilir.';

-- ============================================================================
-- Admin tespit fonksiyonu — RLS politikalarında kullanılabilir
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

comment on function public.is_admin() is
  'Şu anki auth user admin mi? RLS politikalarında SELECT yetkisi için kullanılır.';

-- ============================================================================
-- İPUCU: Mevcut bir kullanıcıyı admin yapmak için:
--
--   update public.profiles
--   set is_admin = true
--   where id = (select id from auth.users where email = 'senin@email.com');
-- ============================================================================
