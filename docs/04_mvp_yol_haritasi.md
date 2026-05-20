# LawKit MVP yol haritası v0.1

Bu doküman kuruluş raporundan (`03_kurulus_raporu_v0.1.md`) sonraki adımları, stack kararını ve fazlandırmayı içerir. Çerçeve dokümanı (`02_tasarim_ve_mimari_cercevesi.md`) hâlâ pedagojik anayasadır.

## Stratejik özet

LawKit, HMGS başarısızlık oranı %30'da kalmış bir pazarda case-based + AI tutored + gamified bir Türk hukuku pratik motoru olarak konumlanır. Rakipler üç uçta dağılmış: pahalı pasif kurslar (14–47 bin TL), ucuz soru bankaları (~500 TL/ay) ve pahalı profesyonel legal AI (1500+ TL/ay). LawKit'in boşluğu ortadaki "öğrenirken yapma" katmanıdır. Bear the Bar'ın AI tutor + adaptif pratiği ile Quimbee'nin tek-abonelik-modülleri kombinasyonu hedeflenir.

Faz 1 satılan ürün soru bankası değil **case-runner**'dır.

## Stack kararı (kilitli)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Frontend + SSR | TanStack Start (React 19 + Vite) | Lovable scaffold zaten kuruldu; SSR + file-based routing + server functions tek pakette. |
| Styling | Tailwind v4 + shadcn/ui (Radix) | L6 tasarım sistemi kuruldu; değiştirmek kayıp. |
| Animasyon | Framer Motion | `prefers-reduced-motion` saygılı, declarative. |
| State (client) | React state + zustand | Engine zaten saf reducer; gamification için zustand + localStorage persist. |
| Auth + DB | Supabase (Postgres + RLS + pgvector) | Free tier yeterli (50k MAU). Auth/DB/vector tek sağlayıcı. |
| LLM gateway | OpenRouter | Tek API, çoklu model (free tier: DeepSeek/Llama, ücretli: Claude/GPT). Adapter pattern sayesinde sağlayıcı tek dosyada değişir. |
| Async/queue | Cloudflare Queues + Workers | Dilekçe puanlama gibi uzun işler için (Faz 3+). |
| Vector store | Supabase pgvector | Mevzuat + içtihat embed; tek DB içinde. Qdrant'a gerek yok. |
| Deploy | Cloudflare Workers (`wrangler`) | Lovable yapılandırması mevcut. Ücretsiz tier 100k req/gün. |
| Ödeme | iyzico veya PayTR (Faz 4) | Türkiye recurring desteği zorunlu, Stripe TR yok. |

**Reddedilen alternatifler ve sebep:** Next.js + FastAPI yeniden kurulum 1-2 hafta kaybı + Lovable temelini siler. Qdrant ayrı servis maliyeti + pgvector zaten yeterli. CrewAI/LangChain prod'da gereksiz katman; structured outputs + zod ile multi-agent simüle edilir.

## MVP içerik kapsamı

3 alan × 3 vaka = 9 pilot vaka. HMGS'nin yoğun konuları:

| Alan | Mevcut | Hedef | Konular |
|---|---|---|---|
| İş Hukuku | 1 (`is_hukuku_001`) | 3 | sözlü fesih + işe iade; fazla mesai + arabuluculuk; kıdem + ihbar tazminatı |
| Borçlar | 1 (`borclar_001`) | 3 | sebepsiz zenginleşme; haksız fiil; sözleşme aykırılık + tazminat |
| Medeni | 0 | 3 | komşuluk hakkı; mirasta tenkis; velayet + iştirak nafakası |

İçerik üretimi paralel iş paketi: her vaka için DAG validator + hukukçu onay + smoke test geçecek.

## Pedagojik DNA (sabit)

- Yedi boyutlu rubrik (Olay, Mesele, Usul, Maddi, Gerekçe, Risk, İfade) — öğrenciye 5 görünür, 7 admin görür.
- HintLadder 3 kademe + ceiling cezası (Vygotsky ZPD scaffolding fade).
- Worked example sonuç ekranı (FeedbackPanel) — vakanın sonunda ideal cevap + boyut bazlı geri bildirim.
- AI üç ayrık rol: Grounded explanation, Role-play, Assessment. Auditor middleware her çıktıyı doğrulanmış kaynak setine eşler.

## Gamification katmanı

| Mekanik | Bilim | Implementasyon |
|---|---|---|
| Streak (günlük) | Habit loop, %19 retention farkı | `last_active_at` günlük rollover, ardışık gün sayacı, gönüllü dondurma 1×/hafta. |
| XP + günlük hedef | Goal-gradient effect | Vaka tamamlama +50, doğru kritik karar +10, hint açma cezası -5. Günlük hedef varsayılan 1 vaka, ring göstergesi. |
| Mastery rozeti | Bloom 0–4 + mastery learning | Boyut başına 3.5+ ortalama 3 ardışık vakada → "Mastered" rozet. |
| Skill tree | Yetkinlik kavramı | Karne ekranında radar grafik (7 boyut), zayıf alan vurgusu. |
| Vaka içi animasyon | Mayer cognitive load + flow | Framer Motion: option pick verdict animasyonu, hint açılışı, skor sayacı tween, rubric bar fill. |

**Erteleme:** Leaderboard (Faz 3), paylaşılabilir portfolyo görsel kart (Faz 3), haftalık challenge.

## Tur planı

### Tur 1 — Bu oturum (MVP iskeleti, ~3-4 saat)

Hedef: Mevcut iki vaka üzerinde stabil + animasyonlu + gamified + AI bağlantılı bir deneyim. Stack tam kuruldu, OpenRouter live, üçüncü vaka eklendi.

İş paketi: `TaskList` üzerinden takip — 10 task.

### Tur 2 — Auth + multi-user

- Supabase Auth (mail/şifre + magic link).
- DB schema: `profiles`, `case_attempts`, `session_history`, `mastery_ledger`.
- RLS politikaları (kullanıcı sadece kendi verisini görür).
- Gamification store'u Supabase'e taşı (mevcut zustand → server source of truth).
- `/giris` ve `/kayit` route'larını gerçek auth'a bağla.

### Tur 3 — Dilekçe Lab iskelet

- Parça parça yapılandırılmış editör (başlık, vakıalar, hukuki sebepler, talep sonucu).
- Her parça için ayrı rubric puanı + Assessment endpoint.
- Worked example: ideal dilekçe parça parça gösterimi.

### Tur 4 — İçerik genişletme

- 4-6 ek vaka (toplam 9'a çıkar).
- Her alanda hukukçu ikinci imza süreci.
- Eval test seti (regresyon) her vaka için.

### Tur 5 — KVKK + ödeme

- KVKK aydınlatma metni + mesafeli satış sözleşmesi.
- PII maskeleme middleware (AI'a giden veri).
- iyzico/PayTR araştırma + checkout sayfası.
- Fiyat katmanları: Free (5 vaka/ay), Core (349 TL/ay), Sprint (HMGS öncesi 7-14 gün, kampanya).

## Doğrulama metrikleri

Her tur kapısı:
- `npm run build` temiz.
- `tsx app/scripts/engine-smoke.ts` geçiyor.
- DAG validator tüm vakalara `ok=true`.
- Tur 2'den sonra: kullanıcı tamamlama oranı, ortalama rubric, AI auditor false-positive oranı.

## Riskler (aktif izleme)

1. **AI hallucination → hukuki yaptırım.** Auditor middleware + her vakanın `noSourceFound=true` fallback'i + ekranda "eğitim amaçlı simülasyon" uyarısı. (Mevcut)
2. **OpenRouter free tier rate limit.** Cache + retry + Sentry-benzeri log. Ücretli tier'a otomatik fallback (Faz 3).
3. **İçerik üretim hızı düşük.** Vaka şablonu (JSON skeleton generator script) + LLM destekli taslak + insan onay döngüsü.
4. **Lovable + TanStack Start henüz erken stack.** Kritik bir bug'da Next.js'e migrate edilebilecek şekilde kod sınırları net: engine, content, ai-orchestrator zaten framework-agnostic.

## Bu dokümanın yaşam döngüsü

v0.1. Her tur kapısında güncellenir. Stack kararı değişirse `## Stack` bölümü tek seferde rewrite edilir.
