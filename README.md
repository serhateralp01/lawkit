# LawKit

Vaka-temelli, AI destekli Türk hukuk eğitim platformu. HMGS hazırlığından staj sürecine kadar tek çatı altında çalışır.

**Konumlandırma cümlesi.** Hukuku ezberleme. Vakada uygula.

LawKit, soyut kural anlatımı yerine dallanan vaka simülasyonları üzerinden hukuki muhakeme inşa eder. Kullanıcı müvekkili dinler, eksik bilgileri sorar, dava yolunu seçer, dilekçesini parça parça yazar ve yedi boyutlu rubrik üzerinden formatif geri bildirim alır. AI çıktıları doğrulanmış mevzuat ve içtihat parçalarına bağlıdır, JSON şemasına zorlanır.

## Mevcut durum

Aşama 1 — şema ve engine — tamamlandı. Tasarım sistemi (token + composite + pattern), L2 içerik şeması, L3 case-engine ve L4 AI orchestration kontratı kurulu. İki pilot vaka (İş Hukuku ve Borçlar Hukuku) üretildi; engine smoke testleri yazıldı. Marketing site (TanStack Start) hazır. L5 backend, L7 KVKK katmanı ve L4 gerçek LLM adapteri sonraki aşamada.

## Depo yapısı

```
lawkit/
  docs/                              Pedagojik temel ve mimari kararlar
    01_blueprint_v0.1.md             Ürün kararı, MVP kapsam, fiyatlama
    02_tasarim_ve_mimari_cercevesi.md  7 katmanlı mimari + tasarım sistemi
  research/                          Pazar araştırması (commit history için)
  app/                               TanStack Start uygulaması
    content/
      schemas/                       case / rubric / source / eval JSON şemaları
      cases/                         Vaka JSON dosyaları (kanonik içerik)
      rubrics/                       Varsayılan 7 boyutlu rubrik
      sources/                       Doğrulanmış kanun ve içtihat parçaları
      eval/                          AI Auditor regresyon test setleri
    src/
      lib/
        case-engine/                 L3 — saf reducer state machine
          types.ts, scoring.ts, engine.ts, validate.ts
          useCaseSession.ts          React sarmalayıcısı
        ai-orchestrator/             L4 — orkestrasyon kontratı
          types.ts                   Grounded / RolePlay / Assessment + Auditor
          mockAdapter.ts             Geliştirme adapteri
      content/                       L2 — TypeScript çalışma zamanı kopyaları
        cases/                       isHukuku001, borclar001, registry
        rubrics.ts, sources.ts, types.ts
      components/
        ui/                          shadcn primitif bileşenleri
        composite/                   RubricMeter, HintLadder, FeedbackPanel,
                                     SourceCallout, MasteryBadge, StreakDot,
                                     LegalQuote, CaseCard, MiniCaseRunner
        patterns/                    CaseScreenLayout (3-kolon)
        site/                        Header, Footer, PageShell, PageHero
      routes/                        Dosya tabanlı yönlendirme
        index.tsx                    Ana sayfa
        vaka.$caseId.tsx             Tam vaka ekranı (engine + 3-kolon)
        urun.*.tsx                   Ürün modülü sayfaları
        metodoloji.tsx, guvenlik-kvkk.tsx, hakkimizda.tsx
        giris.tsx, kayit.tsx
      styles.css                     Tasarım tokenları (Surface/Ink/Signal/Accent)
    scripts/
      engine-smoke.ts                Engine doğrulama smoke testi
```

## Katmanlı mimari özet

Yedi katman, tek yönlü bağımlılık. L1 pedagoji kararları içeriği belirler (L2); L3 engine içeriği saf state machine olarak yürütür; L4 AI orchestration engine'in talep ettiği AI işlerini yapar; L5 uygulama tüm bunları kullanıcıya sunar; L6 tasarım sistemi her ekranı görsel olarak besler; L7 veri ve güvenlik tüm katmanın altındadır.

Detaylar `docs/02_tasarim_ve_mimari_cercevesi.md` içinde.

## Bilimsel temel

Vaka-temelli öğrenme (Garvin, 2003; Thistlethwaite et al., 2012), bilişsel yük teorisi (Sweller, 1988), retrieval practice ve aralıklı tekrar (Roediger & Karpicke, 2006; Cepeda et al., 2008), mastery learning (Bloom, 1968), formatif değerlendirme (Black & Wiliam, 1998), rubrik tasarımı (AAC&U VALUE; Brookhart, 2013), branching scenarios (Moore, 2017), cognitive apprenticeship (Collins, Brown & Newman, 1989), Self-Determination Theory (Deci & Ryan, 2000), Zone of Proximal Development ve scaffolding fading (Vygotsky, 1978; Pea, 2004).

Her tasarım kararı ve gamification mekanizması bu literatüre bağlı olarak gerekçelendirildi; gerekçesiz mekanizma eklenmedi.

## Teknik yığın

Frontend için TanStack Start + React 19 + TypeScript; UI için Tailwind v4 (`@theme` blok) + shadcn primitives + Lucide; tasarım sistemi tokenları OKLCH renk uzayında WCAG AA kontrast eşiğiyle. Backend ve AI orchestration için bir sonraki aşamada FastAPI + Python (LangChain veya CrewAI) + Supabase (Postgres + pgvector + RLS) + Redis. Ödeme Türkiye için iyzico/PayTR.

## Çalıştırma

```bash
cd app
npm install        # veya bun install
npm run dev        # vite dev
npm run build      # üretim derlemesi
```

Engine smoke testi:

```bash
cd app
npx tsx scripts/engine-smoke.ts
```

Vaka ekranını görmek için: `npm run dev` sonrası `http://localhost:5173/vaka/is_hukuku_001` veya `/vaka/borclar_001`.

## Lisans

Henüz lisanslanmadı. Repo şu an private/personal; içerik üretim katmanı ve hukukçu onay süreci stabilleşene kadar açık lisansa geçilmeyecek.

## Sorumluluk reddi

LawKit eğitim amaçlı bir simülasyon ortamıdır. Gerçek hukuki tavsiye vermez. AI çıktıları yalnızca doğrulanmış kaynaklara dayandırılır, ancak hata payı sıfır değildir. Gerçek hukuki bir mesele için yetkili bir avukatla görüşülmelidir.
