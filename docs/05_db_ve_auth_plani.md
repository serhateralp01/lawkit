# Tur 2 — DB ve Auth planı

Bu doküman Tur 2'ye girmeden önce **veritabanı + kullanıcı sistemi** kurulumunu sıfırdan anlatır. Teknik terim minimum tutulmuştur; her seçimin neden yapıldığı açıklanır.

## TL;DR

- Sağlayıcı: **Supabase** (ücretsiz başlar, 50.000 aktif kullanıcıya kadar bedava).
- Bağlantı: tarayıcıdan **anon key** ile sınırlı, sunucu tarafından **service role key** ile tam yetki.
- Güvenlik: **RLS** (Row Level Security) — her kullanıcı sadece kendi verisini görür.
- Migration: SQL dosyaları `app/supabase/migrations/` altında, versiyonlu.

## 1. Neden Supabase?

| Kıstas | Karşılık |
|---|---|
| Auth (kayıt/giriş/şifre/magic link) | Hazır geliyor. Kod yazmıyoruz. |
| Postgres SQL DB | 500 MB free; ürünün ömrü boyunca bedava bantta kalırız. |
| pgvector (mevzuat embed) | Aynı DB içinde — Qdrant gibi ayrı servis kurmuyoruz. |
| Realtime (canlı leaderboard, koop) | Hazır WebSocket altyapısı. |
| Row Level Security | Her satıra "kim okuyabilir/yazabilir" SQL'i. |
| Türkiye'ye taşınabilirlik | Postgres standart — gerekirse VPS'e migrate edilir. |
| Cloudflare Worker'dan erişim | REST + HTTP, edge'den 30 ms. |

Ücretsiz tier sınırı: 50.000 MAU, 500 MB DB, 2 GB outbound. İlk 5.000 kullanıcıya kadar 0 TL. Sınır aşılırsa Pro plan 25 USD/ay.

## 2. Veri modeli (sıfır karmaşıklık)

```
profiles
├─ id (uuid, auth.users.id'ye bağlı)
├─ display_name (text)
├─ school (text, opsiyonel)
├─ exam_target_date (date, opsiyonel — "Eylül 2026 HMGS")
├─ created_at (timestamptz)

case_attempts
├─ id (uuid)
├─ user_id → profiles.id
├─ case_id (text — 'is_hukuku_001')
├─ started_at, finished_at (timestamptz)
├─ duration_ms (int)
├─ hints_opened (int)
├─ xp_earned (int)
├─ ledger (jsonb — {usul: 4, mesele: 3, ...})
├─ verdict_summary (jsonb — [{node, verdict, optionId}, ...])

mastery_progress (otomatik hesaplanır — view veya trigger)
├─ user_id, dimension (text), avg_score (float), last_3_attempts (jsonb)

petition_drafts (Tur 3'te devreye girer)
├─ id, user_id, case_id, body (jsonb — parça parça), version (int)
├─ ai_score (jsonb), updated_at

legal_sources_embeddings (Tur 4 — mevzuat semantic search için)
├─ id, source_id (FK), embedding vector(1536), updated_at
```

Şu an gamification için `localStorage`'da tuttuğumuz `attempts` listesi, **bire bir** `case_attempts` tablosuna yazılacak. zustand store'u Supabase'e proxy haline gelecek; UI hiç değişmeyecek.

## 3. Güvenlik (RLS) — herkes sadece kendi verisi

Postgres'te her tabloya bir kural yazılır:

```sql
-- profiles
create policy "kendi profilim" on profiles
  for all using (auth.uid() = id);

-- case_attempts
create policy "kendi denemelerim" on case_attempts
  for all using (auth.uid() = user_id);
```

Bu sayede ön yüzdeki bir hata bile başka kullanıcının verisini okutmaz. Cloudflare Worker'dan service_role_key ile gelen istekler RLS'i bypass eder — orada da tek tek `auth.uid()` kontrolünü manuel ekleriz.

## 4. Auth akışı — kullanıcı sırasıyla ne görür

1. **Kayıt:** `/kayit` → mail + şifre. Supabase doğrulama maili gönderir.
2. **Giriş:** `/giris` → mail + şifre **veya** "Magic link gönder" (mail'e tıkla, otomatik giriş).
3. **İlk vaka:** profile'a otomatik `display_name = mailin baş kısmı` yazılır; sonra ayar sayfasından değişir.
4. **Anonim deneme:** /vaka/* route'una kayıt olmadan girebilir (1 vaka), karne göstermez; oradan "kaydet" CTA'sı.

## 5. Migration süreci (her yeni tablo)

Yeni SQL dosyası:
```
app/supabase/migrations/20260620_initial_profiles.sql
app/supabase/migrations/20260621_case_attempts.sql
```

Lokal: `supabase db reset` ile temiz başla, sıfırdan oynat.
Prod: `supabase db push` ile uzaktaki DB'ye uygula. Geri alma için `supabase db reset --linked` (DİKKAT: prod siler).

Her migration **idempotent** olur (defalarca çalışsa da aynı sonucu verir) — `if not exists` kullanılır.

## 6. Tur 2 iş paketi (sırayla yapılır)

1. **Supabase projesi aç** — supabase.com → New project. Bölge: Frankfurt veya Londra (TR'ye yakın). Şifre güvenli yere kaydet.
2. **API anahtarlarını al** — project settings → API. `URL`, `anon key`, `service_role key`.
3. **`.env` ve `.dev.vars`'a ekle** — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. **Migration #1: profiles + RLS** — yukarıdaki SQL, dashboard SQL editor'den çalıştır.
5. **Migration #2: case_attempts + RLS** — aynı.
6. **Supabase client wrapper** — `app/src/lib/supabase/client.ts` (browser), `app/src/lib/supabase/server.ts` (worker).
7. **Auth route'ları** — `/giris` + `/kayit` mevcut Lovable iskeleti, Supabase Auth UI veya manuel form bağlanır.
8. **Profile bootstrap trigger** — `auth.users` insert olduğunda `profiles` satırı oluşturan SQL trigger.
9. **Gamification store cloud sync** — zustand'ın `recordAttempt` çağrısı paralel hem localStorage'a hem Supabase'e yazsın. Login varsa server, yoksa local. Login olunca local→server tek seferde migrate.
10. **/karne route'u cloud beslemeye geç** — `attempts` artık `case_attempts` tablosundan gelir.

Tahmini süre: 4-6 saat solo geliştirme. Auth UI'a ne kadar özen gösterdiğine bağlı.

## 7. Yapmıyoruz (kasıtlı erteleme)

- pgvector mevzuat embed → Tur 4 (5+ vaka var, mevzuat kütüphanesi büyüdükçe anlamlı).
- Realtime leaderboard → Tur 4+ (sosyal mekanik MVP'de gereksiz).
- Multi-region replikasyon → ölçek ihtiyacı gelene kadar yok.
- Stripe abonelik → iyzico/PayTR araştırması Tur 5.

## 8. Bilinmesi gereken riskler

- **Anon key public.** Tarayıcıya gider, RLS olmazsa veri çalınır. Bu yüzden RLS testleri ilk gün yazılır.
- **Service_role_key SECRET.** Asla `VITE_*` prefix'iyle veya client tarafa konmaz. Worker secret olarak `.dev.vars` + `wrangler secret put`.
- **Supabase free tier projesini 1 hafta kullanmayan freezelar.** Lansman öncesi 1 Pro plan açılır.
- **Migration rollback yoktur.** Test ortamında 2 kez denenmeden prod'a uygulanmaz.

## 9. Bir sonraki konuşma için karar bekleyen başlıklar

- Supabase projesini sen mi açacaksın yoksa ben mi rehberlik edeyim?
- "Anonim deneme" — kayıt olmadan 1 vaka oynama hakkı tanıyalım mı, yoksa kayıt zorunlu mu?
- Şifre + mail mi, sadece magic link mi (UX daha kolay ama mail sağlayıcısı gerekli — Supabase default'u var, prod'da kendi domain mailimiz gerekecek).
- Türkiye'de KVKK aydınlatma metni: kullanıcı verisi tutulduğunda zorunlu. Tur 2'de mi Tur 5'te mi konuyoruz?

Bu sorulara cevabın gelince Tur 2'ye başlanır.
