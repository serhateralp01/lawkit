# LawKit kuruluş raporu v0.1

Bu rapor Aşama 0 ve Aşama 1 sonuçlarını, neyin neden seçildiğini ve sonraki turda nelerin ele alınacağını tek sayfada özetler. Çerçeve dokümanı (`02_tasarim_ve_mimari_cercevesi.md`) referans alınır.

## Ne yapıldı

Çerçevedeki yedi katmanlı mimarinin L1, L2, L3, L4 (kontrat seviyesi) ve L6 katmanları kuruldu. Marketing yüzeyi (TanStack Start + React 19 + Tailwind v4) Lovable üzerinden geldi; üzerine pedagojik DNA'yı taşıyan composite bileşenler ve içerik şeması zaten yerleştirilmiş. Bu turda saf reducer engine, tam vaka ekranı, ikinci pilot vaka, AI orchestration kontratı ve regresyon eval test seti eklendi.

L1 pedagoji katmanı kodda görünmez ama kararları her yere sızar. Yedi boyutlu rubrik (Olay, Mesele, Usul, Maddi, Gerekçe, Risk, İfade) `defaultRubric` içinde davranışsal seviye tanımlarıyla (Bloom revised + AAC&U VALUE + Brookhart) sabittir; öğrenciye yalnız beş boyut görünür, yedi'si admin tarafında kalır (çerçeve §8'deki Brookhart hipotezi).

L2 içerik katmanı `content/schemas/` altında üç JSON şema (case, rubric, source) ile başlar. Mirror olarak `app/src/content/` altında TypeScript çalışma zamanı kopyaları durur — bu redundancy şu an kabul edilebilir, Aşama 5'te build-time scanner ile tek kaynaktan üretilecek. İki pilot vaka yayında: İş Hukuku (`is_hukuku_001` — sözlü fesih + işe iade) ve Borçlar (`borclar_001` — yanlış havale, sebepsiz zenginleşme). Doğrulanmış kaynaklar: İş K. m. 20, İş Mahk. K. m. 3, TBK m. 77, TBK m. 79.

L3 case-engine `app/src/lib/case-engine/` altında saf reducer olarak yazıldı. React'ı bilmez, ağ erişmez, LLM çağırmaz. Dört parçalı: `types.ts` (Session, StepRecord, Ledger), `engine.ts` (start/pick/open-hint/advance/reset reducer), `scoring.ts` (HintLadder ceiling cezası — Vygotsky ZPD + Pea scaffolding fade), `validate.ts` (DAG validator: yetim node, döngü, kayıp outcome, geçersiz kaynak anahtarı). React tarafı için `useCaseSession.ts` ince sarmalayıcı; engine state'i useState'e koyar, dispatcher'ları döner. Smoke test scripti `scripts/engine-smoke.ts` üç senaryoyu doğrular: doğru yol, hint ceiling cezası, yanlış yol.

L4 AI orchestration `app/src/lib/ai-orchestrator/` altında şimdilik yalnız kontrat seviyesinde. Üç ayrık rol — Grounded explanation, Role-play, Assessment — bağımsız tip + arayüzler olarak yazıldı. Auditor middleware'i ayrı şema ile tanımlı; hipoteze göre LLM çıktısının her cümlesini doğrulanmış kaynak setine eşler, eşlenemeyen iddia varsa `flaggedForReview=true` döner ve UI gizler. `mockAdapter.ts` interface'i implement eder ama LLM çağırmaz — vakanın kendi `feedback`/`idealAnswer` alanlarını döndürür. Aşama 3'te OpenAI Responses API + Structured Outputs adapter'ı bunun yerini alır.

L6 tasarım sistemi tam çerçeve uyumlu kuruldu (Lovable). Surface/Ink/Signal/Accent rolleri, indigo (#3730A3 hipotez) + amber ikili accent, OKLCH renk uzayı, WCAG AA kontrast eşiği, dark mode, `prefers-reduced-motion` saygısı. Inter (UI) + Source Serif (hukuki alıntı) + Playfair (display) üç fontla tipografi. Composite kütüphane: `RubricMeter` (7 boyut, yüzde yok), `HintLadder` (3 kademe, ceiling cezası şeffaf), `SourceCallout`, `MasteryBadge`, `StreakDot`, `LegalQuote`, `CaseCard`, `FeedbackPanel` (worked example sonuç ekranı), `MiniCaseRunner` (hero demo). Pattern olarak `CaseScreenLayout` (28/44/28 üçlü kolon) tam ürün route'u için yazıldı.

Tam ürün route'u: `/vaka/$caseId` — engine + CaseScreenLayout + FeedbackPanel ile uçtan uca çalışır, iki vakayla denenebilir. Marketing'in `/` sayfasındaki MiniCaseRunner aynı engine'i kullanır (henüz refactor edilmedi, inline mantığı var — DRY tamamlanacak iş listesinde).

Repo yapısı: `docs/` (framework dokümanları), `research/` (pazar araştırması), `app/` (TanStack Start uygulaması). Tek git commit ile başlangıç noktası olarak işaretlendi. GitHub'a push talimatı `PUBLISH_INSTRUCTIONS.md` içinde.

## Ne yapılmadı (bilinçli erteleme)

L5 backend ve veritabanı yok: kullanıcı oturumu sahte, fiziksel kayıt yok. Aşama 3'te Supabase Auth + Postgres + pgvector + RLS politikaları. L7 KVKK katmanı yok: PII maskeleme, audit log, silme/saklama politikası kod düzeyinde implement edilmedi — ürünün ilk gerçek kullanıcısı çıkmadan önce eklenmek zorunda. Ödeme entegrasyonu (iyzico/PayTR) yok. Admin panel yok — vaka editörü Aşama 5. Otomatik eval runner yok; `engine-smoke.ts` manuel çalıştırılır, CI bağlantısı ilerleyen turda. Storybook yok; composite'ler şu an yalnızca kullanım yerinde görülüyor.

İçerik tarafında yalnız iki pilot vaka var. Aşama 3'ün dikey MVP'sine geçmeden önce İş Hukuku alanında 5-7 vaka ile pilot grubu (10-20 öğrenci) çalıştırılması gerekiyor — engine threshold ayarları ve case zorluk kalibrasyonu burada yapılacak. Vakaların hukukçu onay süreci formelleşmedi; şu an LawKit içerik ekibi tek imza, Aşama 4'te ikinci imza (bağımsız hukukçu inceleyici) zorunlu olacak.

## Açık karar noktaları

Accent paleti (indigo + amber) — kullanıcı testine girmedi, hipotez. Üç alternatif (tek indigo, tek amber, indigo+amber) preference testiyle dondurulmalı. Vaka süresi — şu an 8-10 dakika varsayımı, gerçek kullanıcıda 15-25 dakikaya çıkabilir, bilişsel yük açısından üst sınır 25 dk; pilot ölçüm gerekli. Rubrik boyut sayısı 7 yerine 5 mi gösterilsin: şu an admin/öğrenci ayrımıyla çözüldü ama uzun vadede tek norm üzerinde durulması gerek. Yerel ödeme sağlayıcısı (iyzico vs PayTR) — ticari karar, evraklar açılınca netleşir.

İsim ve marka: TÜRKPATENT taraması yapılmadı. "LawKit" alan adı ve sosyal medya kullanıcı adları doğrulanmadı. Push'tan sonraki ilk işlerden.

## Sonraki tur — somut iş paketi

Birinci öncelik: marketing site'taki MiniCaseRunner'ı yeni engine'e refactor et (DRY tamamlama). İkinci: dashboard/karne route'u (`/karne`) — mock data ile, daha sonra gerçek engine geçmişinden beslenecek. Üçüncü: Dilekçe Lab'ın iskeleti — parça parça yapılandırılmış editör, her parça için ayrı rubrik puanı, kümülatif skor. Dördüncü: üçüncü ve dördüncü pilot vakalar (İş Hukuku derinleştirme: fazla mesai + arabuluculuk + ön inceleme duruşması). Beşinci: marka, alan adı, KVKK aydınlatma metni ve mesafeli satış sözleşmesi taslakları.

Aşama 3 MVP'ye giriş kapısı: yedi vaka tamamlandığında ve engine threshold'ları ayarlandığında. Hedef tarih kullanıcı tarafından belirlenecek; ben sadece teknik hazırlığı tarif edebilirim.

## Doğrulama yöntemi

Her aşama sonu üç metrik:
- engine smoke test geçiyor mu (`bunx tsx app/scripts/engine-smoke.ts`)
- DAG validator her vakaya `ok=true` döndürüyor mu
- TypeScript derlemesi `app/` içinde `npm run build` ile temiz mi

Aşama 3'ten itibaren bunlara eklenir: kullanıcı session tamamlama oranı, ortalama rubric skoru, en sık kaçırılan boyut, AI assessor'un kullanıcı düzeltme talebine açtığı oran (Auditor false-positive metriği).

## Bu dokümanın yaşam döngüsü

v0.1. Her aşama kapısında güncellenir. Çerçeve dokümanından farklı olarak bu rapor gerçekleşmiş işin durum tutanağıdır; öngörü değil, sayım.
