# Dinamik İçerik Üretim Mimarisi — Paradigma Kayması

> "Her seferinde yeni vaka oluşturmuyoruz. Biraz bekleme süresi karşılığında kullanıcı her istediğinde ona özel case'ler yaratılacak."

Bu doküman LawKit'i statik içerik kütüphanesinden **kullanıcı talebine göre dinamik içerik üreten** bir platforma dönüştüren mimari kararı tarif eder.

---

## Neden bu değişiklik

### Eski yaklaşım (mevcut)
- 6 hardcoded derin vaka
- 18 hardcoded HMGS sorusu
- 3 hardcoded dilekçe şablonu
- **Sınır:** içerik biter, kullanıcı tekrar eder, viral değer yok

### Yeni yaklaşım (hedef)
- **Hardcoded core** — 6 vaka + 18 soru + 3 şablon = onboarding ve fallback
- **Dinamik üretim** — kullanıcı "yeni vaka istiyorum, X konusunda" der → 30-90 saniye → AI ona özel vaka üretir
- **Personalize** — kullanıcının zayıf alanına göre seçilen tema + zorluk
- **Quality gate** — her üretim ikinci AI'dan geçer (Auditor), reddedilirse regenerate

### Değer önerisi
- **Sonsuz içerik** — kütüphane biter kaygısı yok
- **Personalize** — herkesin karnesi farklı, ihtiyacı farklı
- **Viral döngü** — "AI bana özel dava simülasyonu üretti" sosyal paylaşılabilir
- **Maliyet avantajı korunur** — DeepSeek 1 vaka üretimi ~$0.05 (200 user'a kadar aylık $300 altı)

---

## Sistem bileşenleri

```
┌─────────────────────────────────────────────────────────────────┐
│                     KULLANICI ARAYÜZÜ (Vite/Tanstack)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Vaka Studio  │  │ HMGS Üretici │  │ Dilekçe Üretici      │  │
│  │ (yeni vaka)  │  │ (yeni soru)  │  │ (özel dilekçe)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼──────────────────┼──────────────────────┼────────────┘
          │                  │                      │
          └──────────────────┴──────────────────────┘
                            │
                            ▼
       ┌────────────────────────────────────────┐
       │       GENERATION ORCHESTRATOR          │
       │  (Cloudflare Worker /api/ai/generate)  │
       │                                        │
       │  1. RAG: ilgili mevzuat + içtihat çek  │
       │  2. LLM: yapılandırılmış üretim        │
       │  3. Auditor: kalite + DAG validate     │
       │  4. Persist: Supabase                  │
       │  5. Return: kullanıcıya                │
       └─────────┬──────────────────────────────┘
                 │
       ┌─────────┴──────────┐
       ▼                    ▼
┌──────────────┐   ┌────────────────────────┐
│  Supabase    │   │   DeepSeek V4 Pro      │
│ + pgvector   │   │   (Türkçe + JSON)      │
│              │   │                        │
│ legal_sources│   │   Structured outputs   │
│ legal_cases  │   │   ~30K token / vaka    │
│ embeddings   │   │   ~$0.05 per call      │
└──────────────┘   └────────────────────────┘
```

---

## 4 Faz uygulama planı

### Faz 1 — Hukuki Referans Altyapı (1-2 hafta)

**Hedef:** AI üretimin "kanıtlanabilir" olması için sağlam mevzuat tabanı.

1. `sources.ts` 6 → 50+ madde:
   - **Borçlar:** TBK m. 49, 77-82, 117, 119, 136, 285, 311
   - **Medeni:** TMK m. 23, 24, 165, 175, 184, 200, 619, 683, 730, 737
   - **İş:** İş K. m. 17-26, İş Mahk. K. m. 3
   - **Medeni Usul:** HMK m. 6, 7, 119, 145, 389, 390
   - **Ceza:** TCK m. 21, 86, 116, 141, 148, 158
   - **Ceza Usul:** CMK m. 91, 100, 153
   - **İdare:** İYUK m. 7, 11, 27
   - **İcra:** İİK m. 62, 67, 68
   - **KMK:** m. 19, 24, 33
2. Her madde:
   - `id`, `kanun`, `madde`, `fıkra`, `metin`, `verified_at`, `verifier`
   - **Yeni:** `keywords` (semantic search için bağlamsal kelimeler)
3. Migration: `legal_sources` Supabase tablosu (gelecekte pgvector embedding)

**Çıktı:** RAG için zengin context havuzu.

### Faz 2 — Dinamik Vaka Üretici (2-3 hafta)

**Hedef:** Kullanıcı bir buton bastığında AI ona özel `LegalCase` JSON üretir.

1. **Input formu** (`/vaka-studio`):
   - Branş seçimi (İş, Borçlar, Medeni, ...)
   - Zorluk (1-4)
   - Konu (opsiyonel): "fesih", "tazminat", "komşuluk" gibi
   - Karakter tonu (opsiyonel): "yaşlı müvekkil", "öğrenci"
2. **`/api/ai/generate-case` endpoint:**
   - RAG: input'a göre ilgili 5-10 mevzuat maddesi çek
   - System prompt: "Sen LawKit'in Türk hukuku vaka tasarımcısısın. LegalCase JSON şemasına uyan vaka üret..."
   - DeepSeek call (response_format: json_object, ~30K token)
   - Schema validate (zod) + DAG validate (engine'in mevcut validator'ı)
   - **Auditor pass:** ikinci AI çağrısı: "Bu vaka mevzuata uygun mu? Karakter tutarlı mı?"
   - Reddedilirse 1× retry, yine olmazsa hata
3. **`generated_cases` tablosu:**
   - `id`, `user_id`, `case_json` (JSONB), `params` (input), `quality_score`, `created_at`
   - RLS: kullanıcı sadece kendi üretimlerini görür
4. **UI: Vaka Studio sayfası**
   - "AI vakanızı hazırlıyor... (30-60 saniye)" loading
   - Üretim tamamlanınca `/vaka/{generated_id}` aç
   - Aynı vaka tekrar oynanabilir (id ile)
   - "Karneye kaydet" → `case_attempts` ile bağlantı

**Çıktı:** Sonsuz vaka kütüphanesi.

### Faz 3 — Dinamik HMGS Soru Üretici (1-2 hafta)

**Hedef:** Kullanıcının daha önce görmediği sorular.

1. **`/api/ai/generate-question`:**
   - Input: branş + zorluk + (geçmiş soru özetleri)
   - RAG: 3-5 ilgili madde
   - Output: 4 şıklı soru + correctId + explanation + distractor reasons
2. **Duplicate önleme:**
   - Üretilen soru için embedding hesapla (DeepSeek embed veya OpenAI text-embedding-3-small)
   - Kullanıcının `generated_questions` tablosundakilerle cosine similarity
   - Eşik 0.85 → "çok benziyor, yeniden üret"
3. **HMGS Arena revize:**
   - Mevcut 18 hardcoded soru → onboarding pool
   - "Daha fazla soru çöz" butonu → her tıklamada AI üretir
   - Kullanıcı 10 üst üste soru → 10 yeni üretim

**Çıktı:** Sonsuz soru bankası, sürekli taze.

### Faz 4 — Dinamik Dilekçe Üretici + Kullanıcı Senaryosu (2-3 hafta)

**Hedef:** Kullanıcı kendi vaka senaryosunu girer, AI dilekçe taslağı hazırlar, kullanıcı düzenler, AI puanlar.

1. **Kullanıcı senaryo input:**
   - "Müvekkilim X yıl çalıştı, Y sebebiyle çıkarıldı, ben Z dilekçesi yazmak istiyorum"
2. **AI dilekçe taslağı:**
   - Şablon seçimi + RAG + kullanıcı senaryosu → tüm bölümler dolduruldu draft
3. **Kullanıcı düzenleyebilir:**
   - Mevcut Dilekçe Lab'ın workbench UI'ında, bölümler önceden dolu
   - Her bölümü kullanıcı değiştirebilir
   - "AI değerlendir" mevcut, ama artık AI hem kullanıcının yazdığını hem kendi taslağıyla karşılaştırır

**Çıktı:** Hızlı dilekçe çıkışı + öğrenme döngüsü.

### Faz 5 — Finetune (gelecek, opsiyonel)

200+ üretim biriktiğinde + nişanlının onayladığı 50+ vaka olduğunda:
- DeepSeek finetune API (V3 ve V4 destekli)
- Maliyet: ~$10-30 training + kullanım
- Avantaj: prompt kısa, output daha tutarlı, maliyet düşer

---

## Kritik teknik kararlar

### Bekleme süresi UX

DeepSeek V4 Pro bir vaka üretimi tipik 30-60 saniye. Kullanıcı bunu görmeli:
- Animasyonlu loading: "Müvekkilini yaratıyoruz...", "Olay örgüsünü kuruyoruz...", "Hukuki dayanakları kontrol ediyoruz...", "Karakterleri çiziyoruz..."
- Background polling: 5 saniye aralıkla `generation_jobs` tablosunu sorgula
- Tamamlanınca otomatik redirect

### Quality gate (Auditor)

Üretilen her vakanın ikinci AI çağrısıyla denetlenmesi:
1. **Mevzuat uyumu:** "Bu vakada referans alınan madde gerçekten o numarada var mı, kapsam doğru mu?"
2. **DAG bütünlüğü:** validateCase() pass
3. **Karakter tutarlılığı:** "Selin Hanım 9 yıl kıdemli iş güvencesi kapsamında" — bu olgular n2'deki seçeneklerle tutarlı mı?
4. **5 outcome makul mü:** zafer condition'ları ulaşılabilir, tam kayıp default

Quality score < 0.7 → otomatik retry. < 0.5 → hata, kullanıcıya "bir terslik oldu, lütfen tekrar dene".

### Maliyet kontrolü

Vaka üretimi pahalı (30K token ≈ $0.05). Kötüye kullanım önleme:
- **Plan başına quota:** Free 1 üretim/ay, Sprint 5/gün, Core 3/gün, Pro 10/gün
- **Cache:** aynı input parametreli iki üretim aynı havuza düşebilir (deterministik seed)
- **Cooldown:** ardışık 2 üretim arasında en az 60 saniye

### Hukuki güvence (nişanlı için kritik)

Dinamik üretim insan inceleme aşamasını bypass eder. Çözüm:
- Üretilen vakanın UI'sında **otomatik amber rozet:** "Bu vaka AI tarafından üretildi, henüz bağımsız hukukçu incelemesinde değil"
- Topluluk modu: kullanıcılar "favorile" → 5+ favori alan vakalar → admin paneli → nişanlı manuel inceleyebilir → onaylanırsa **yeşil rozet**
- Hatalı bilgi raporlama (zaten var) — üretilen vakalarda öncelikli

### Hardcoded içerik ne olacak?

**Korunur ama rolü değişir:**
- 6 hardcoded vaka → **onboarding showcase** ("Selin Hanım'ın hikayesi", "Kerem Bey'in havalesi") — yeni kullanıcının ilk deneyimi
- 18 HMGS sorusu → **fallback pool** (AI üretimi başarısız olursa)
- 3 dilekçe şablonu → **structure template** (AI bu yapıyı taklit ediyor)

Yeni kullanıcı:
1. Onboarding: 1 hardcoded vaka oyna (Selin Hanım)
2. Sonuç ekranında: "Şimdi sana özel vaka yaratalım mı?" CTA
3. Kullanıcı tema seçer → AI üretir
4. Her sonraki vaka %80 AI üretimi, %20 hardcoded core

---

## Veri modeli değişiklikleri (Supabase)

```sql
-- legal_sources: zenginleştirilmiş mevzuat (Faz 1)
create table legal_sources (
  id text primary key,
  kanun text not null,
  madde text not null,
  fıkra text,
  metin text not null,
  keywords text[] not null default '{}',
  branch text[] not null default '{}',
  embedding vector(1536),  -- pgvector
  verified_at date,
  verifier text,
  created_at timestamptz default now()
);

create index legal_sources_embedding_idx
  on legal_sources using ivfflat (embedding vector_cosine_ops);

-- generated_cases: AI üretimi vakalar
create table generated_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  case_json jsonb not null,
  params jsonb not null,        -- input: { branch, difficulty, theme, ... }
  quality_score numeric,         -- 0-1, Auditor çıktısı
  status text not null default 'active' check (status in ('active', 'archived', 'flagged')),
  community_favorites int not null default 0,
  reviewed_by_human boolean not null default false,
  created_at timestamptz default now()
);

create index generated_cases_user_idx on generated_cases(user_id, created_at desc);

-- generated_questions: AI üretimi sorular
create table generated_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_json jsonb not null,
  embedding vector(1536),
  branch text,
  difficulty smallint,
  created_at timestamptz default now()
);

create index generated_questions_user_idx on generated_questions(user_id);
create index generated_questions_embedding_idx
  on generated_questions using ivfflat (embedding vector_cosine_ops);

-- generation_jobs: long-running AI işlerinin tracking'i
create table generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_type text not null check (job_type in ('case', 'question', 'petition')),
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  params jsonb not null,
  result_id uuid,
  error_message text,
  progress_phase text,  -- "müvekkil yaratılıyor", "olay örgüsü kuruluyor"...
  created_at timestamptz default now(),
  finished_at timestamptz
);

create index generation_jobs_user_status_idx
  on generation_jobs(user_id, status, created_at desc);
```

---

## Bu seansta yapacağım

1. ✅ Bu vizyon dokümanı (`docs/11_dinamik_uretim_mimarisi.md`)
2. **Faz 1 başlangıcı:** `sources.ts` 50+ maddeye genişlet
3. **Faz 2 iskeleti:**
   - `/api/ai/generate-case` endpoint (mock + DeepSeek prompt)
   - Migration 0004: `generated_cases` + `generation_jobs`
   - `/vaka-studio` route (input form + loading state + sonuç)

Faz 3 ve 4 sonraki seanslara. Önce Faz 1 + 2'nin sağlam temelini at — kullanıcı ilk gerçek AI üretimi vakayı oynayabilsin.

---

## Bu seansın sonunda ne göreceksin

- `/vaka-studio` sayfası: branş + zorluk + tema seçimi
- "AI vakanı hazırlıyor..." 30-60 saniye loading
- Tamamlanınca: yeni üretilmiş vaka, mevcut engine ile oynanabilir
- Karnen'e kaydoldu, tekrar oynanabilir

Sonraki seanslar Faz 3 (soru) + 4 (dilekçe) + finetune (Faz 5).
