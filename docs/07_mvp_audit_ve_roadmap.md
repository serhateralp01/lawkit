# LawKit — MVP Audit + Yol Haritası v1

Bu doküman üç soruyu cevaplar: **(1) Şu an gerçekten ne hazır? (2) MVP'ye gitmek için ne eksik? (3) Hangi sırayla yapılır?**

Tarih: 2026 Mayıs · Hedef: ilk gerçek paying kullanıcı 8 hafta içinde.

---

## 1. ŞU AN NE HAZIR

### Hazır olanlar — solid

| Katman | Durum | Notlar |
|---|---|---|
| Engine (case state machine) | ✅ | 7 node tipi, çoklu outcome, AI branching, smoke test |
| Vaka kütüphanesi | ✅ | 6 vaka (3 tat + 3 derin), 3 hukuk dalı |
| AI orchestrator | ✅ | DeepSeek V4 Pro, Auditor, structured JSON |
| Auth + DB | ✅ | Supabase, RLS, profiles + case_attempts |
| Gamification | ✅ | XP, streak, mastery, cloud sync |
| /karne (dashboard) | ✅ | Radar, mastery rozet, filtre, vaka kütüphane |
| /profil | ✅ | display_name, school, exam_target_date |
| /sifre-sifirla | ✅ | İki modlu, Supabase reset email |
| Dilekçe Lab | ✅ | 3 şablon × 6 bölüm, AI rubric |
| Sahne kompozisyonu | ✅ | DiceBear avatar, StageBackdrop, animasyon |
| Email template (markalı) | ✅ | Confirm signup + Reset password HTML |

### Yarı hazır — iyileştirme gerek

| Şey | Sorun | Etki |
|---|---|---|
| HMGS Arena route'u | Boş Lovable iskeleti | "Ürün boş" hissi verir |
| Ana menü (/) | Tasarım sıradan, demo kalitesi düşük | İlk izlenim zayıf |
| Fiyatlandırma sayfası | Statik liste, ödeme yok | Conversion'a hazır değil |
| Test (E2E) | Sadece engine smoke | Regresyon riski |
| Hukuki doğrulama | Kanun referansları doğru, içtihat atıfı genel | Yanlış içerik riski |

### Hiç yok

- **Prod deployment** — uygulama yalnız localhost'ta
- **Custom domain** — lawkit.app/com.tr alınmamış
- **Ödeme sistemi** — Stripe/iyzico/Paddle bağlanmadı
- **Abonelik yönetimi** — plan/quota/cancel akışları
- **Yasal metinler** — KVKK aydınlatma, mesafeli satış, gizlilik, kullanım koşulları
- **AI cost otomasyonu** — DeepSeek balance auto-recharge
- **Hukukçu inceleme** — bağımsız hukuk uzmanı onayı yok
- **Analytics** — kullanıcı davranışı ölçümü yok (sadece local store)
- **Email gönderim** — Supabase default (1 saat 4 email limit), prod'da yetersiz
- **Hata izleme** — Sentry yok

---

## 2. HUKUKİ DOĞRULAMA — KRİTİK NOT

### Şu anki durum (dürüst değerlendirme)

Vakalarda kullanılan **kanun maddeleri ve sayıları doğru ve güncel:** İş K. m. 19/20/25/26, İş Mahk. K. m. 3, TBK m. 77/79/82, TMK m. 730/737, KMK m. 24/33, HMK m. 145/389. 

**Ancak:**
- Vakaları **bir hukuk fakültesi mezunu olmayan biri yazdı** (Claude AI). 
- Yargıtay içtihat atıfları **somut karar referansı içermiyor** (sadece "yerleşik içtihat" deniyor).
- Olay örgüleri **mantıken tutarlı ama pratikte ince ayrıntılar atlanmış olabilir** (örneğin işveren işçi sayısı eşiği 30 yerine bazı durumlarda 50 — özel hükümler).
- KMK m. 24 ile yönetim planı değişikliği için "kat malikler kurulu oybirliği" gibi spesifik şartlar vakada açıkça anlatılmıyor.
- **Hiçbir vaka pratik avukat tarafından gözden geçirilmedi.**

### Risk

KVKK ve Türk hukuku açısından "eğitim amaçlı simülasyon" uyarısı koymak yasal koruma sağlar ama **etkisini sınırlar**: bir öğrenci uygulamadaki yanlış bir bilgiyi pratiğe taşırsa hak kaybı yaşayabilir; bu uygulamanın itibarına ciddi zarar verir.

### Acil eylem

1. **2-3 stajyer veya yeni avukatla içerik review anlaşması** (saatlik ücret 200-400 TL bandında). Her vakayı kanun + içtihat referanslarıyla doğrulasınlar, düzeltme önerisi yazsınlar.
2. **Yargıtay içtihat ekle:** her m. 20, m. 79 atfı için 1-2 spesifik karar numarası (HGK + ilgili daire). Karar metinlerinden alıntı yapma — sadece atıf yeter.
3. **`docs/08_hukuki_dogrulama_checklist.md`** çıkartılacak (aşağıda). Her vakaya yapışmış checklist.
4. **UI'da güçlü uyarı:** her vaka sonu + dilekçe lab footer'ında "Bu içerik bağımsız hukuk uzmanı tarafından henüz onaylanmamıştır" notu — onaylananlar için "✓ Av. [Ad] tarafından incelendi" rozeti.
5. **Yanlış bilgi raporlama:** her vaka sonunda küçük "İçerikte yanlış buldun mu?" butonu — Supabase'e form kaydı.

---

## 3. AI EKONOMİSİ — DETAYLI ANALİZ

### DeepSeek V4 Pro mali tablosu (31 Mayıs'a kadar %75 indirimli)

| Kalem | İndirimli fiyat | Standart fiyat |
|---|---|---|
| Input — cache hit | $0.0036 / 1M token | $0.014 / 1M token |
| Input — cache miss | $0.435 / 1M token | $1.74 / 1M token |
| Output | $0.87 / 1M token | $3.48 / 1M token |

### Bir vakanın AI maliyeti (kaba hesap)

Tipik derin vaka kullanım:

| Çağrı | Input tokens | Output tokens | Cost (indirimli) |
|---|---|---|---|
| Müvekkil chat (5 tur) | ~4,000 | ~1,500 | $0.003 |
| Open text assess (2× ortalama) | ~5,000 | ~1,000 | $0.003 |
| AI branch (1 çağrı) | ~1,500 | ~300 | $0.001 |
| AI Tutor (Grounded, sonda) | ~2,000 | ~500 | $0.001 |
| **Toplam** | **~12,500** | **~3,300** | **~$0.008** |

Yaklaşık **0.25 TL / vaka** (Mayıs 2026 kuru ile).

### Ölçek senaryoları

| Kullanıcı | Vaka / gün | Vaka / ay | AI cost / ay | TL maliyet |
|---|---|---|---|---|
| 10 (early beta) | 2 | 600 | $5 | ~150 TL |
| 100 (MVP launch) | 1.5 | 4,500 | $36 | ~1.100 TL |
| 1,000 (growth) | 1 | 30,000 | $240 | ~7.500 TL |
| 10,000 (scale) | 0.8 | 240,000 | $1,920 | ~60.000 TL |

**Çıkarım:** 1,000 kullanıcıya kadar AI maliyeti aylık 100 USD altında. Ödeme almıyor olsak bile 6 ay sürebiliriz. Bu **rakipsiz bir maliyet avantajı**.

### Provider karşılaştırması (1M token output)

| Model | Output | DeepSeek'ten kaç kat pahalı |
|---|---|---|
| **DeepSeek V4 Pro (indirimli)** | **$0.87** | **1×** |
| DeepSeek V4 Pro (standart) | $3.48 | 4× |
| GPT-4o mini | $0.60 | 0.7× (sadece bu daha ucuz!) |
| Gemini 2.0 Flash | $0.30 | 0.35× (en ucuz ama JSON zayıf) |
| Claude 3.5 Haiku | $4 | 4.6× |
| GPT-4o | $10 | 11× |
| Claude 3.5 Sonnet | $15 | 17× |

**Karar:** DeepSeek V4 Pro birincil. Fallback olarak GPT-4o mini (Türkçe biraz zayıf ama hızlı). Premium / "Pro Tier" için Claude 3.5 Sonnet opsiyonel (kullanıcı ister, ek ücret).

### Maliyet düşürme stratejileri

1. **Prompt cache:** DeepSeek cache hit %120× ucuz. Aynı vaka context'ini chat boyunca tekrar etmek yerine sistem prompt'unu cache'lemek için sıralı çağrılar.
2. **Cloudflare KV cache:** Aynı kullanıcının aynı sorusu → cache'ten dön. Maliyet düşer, hız artar.
3. **Token budget:** Her endpoint'e max_tokens limit. Output spam'i önler.
4. **Streaming + early stop:** Cevap belli olduğunda kesme.
5. **Free tier modeller eğitim aşamasında:** OpenRouter free tier (`:free` ekli) — beta kullanıcılar için.

### Auto-recharge (DeepSeek balance otomasyonu)

DeepSeek dashboard'da otomatik tekrar yükleme yok (Kasım 2026 itibariyle). Çözüm:
- **Cloudflare Worker cron** — günde 1 kez balance kontrol et, eşik altındaysa Slack/email bildirim
- **OpenRouter üzerinden DeepSeek:** OpenRouter auto-recharge destekler (Stripe). DeepSeek API'sini OpenRouter aracılığıyla çağırırsak otomatik yükleme alırız. **Maliyet:** OpenRouter %5 markup ekliyor (yine de Claude'dan ucuz).
- **Manuel yükleme:** balance > 50 USD tut, otomatik bildirimle aşağı düşünce yükle. En basit ve şu an yeterli.

**Öneri:** İlk 3 ay manuel + Slack bildirimi. 100+ kullanıcıdan sonra OpenRouter'a geç veya kendin auto-recharge worker'ı yaz.

---

## 4. ÖDEME STRATEJİSİ

### Sağlayıcı karşılaştırması (TR pazarı için)

| Sağlayıcı | TR satıcı | Abonelik | Komisyon | Kurulum |
|---|---|---|---|---|
| Stripe | ❌ (TR direkt yok) | ✅ | %2.9 + 0.30 USD | Karmaşık (US LLC gerekli) |
| **iyzico** | ✅ | ✅ | %3-4 + 0.25 TL | Vergi levhası gerekli |
| **PayTR** | ✅ | ✅ | %1.49-2.99 | Vergi levhası gerekli |
| LemonSqueezy | ⚠️ (sınırlı TR) | ✅ | %5 + 0.50 USD | Hızlı (Merchant of Record) |
| Paddle | ⚠️ | ✅ | %5 + 0.50 USD | Hızlı (MoR) |
| Shopier | ✅ | ⚠️ (sınırlı) | %1.99 + 0.50 TL | En hızlı, B2C odaklı |

### Karar matrisi

**Eğer şahıs şirketin / vergi levhan varsa:** PayTR (en ucuz, TR'ye özel).

**Eğer şirket kurmadıysan:** Önce Shopier — vergi levhası gerektirmez (mikro işletme limitlerinde), %1.99 + 0.50 TL, abonelik için "tekrarlayan ödeme" özelliği var (yeni).

**Eğer global ödemeler de istiyorsan (örneğin Türkçe konuşan diaspora):** LemonSqueezy — Merchant of Record, vergi işini onlar halleder, %5'lik komisyon yüksek ama tek tıkla başlar.

### Önerilen ilk adım

1. **MVP launch:** Shopier ile başla (en hızlı). 50 ödemeyle test et.
2. **Growth (100+ aboneli):** PayTR'ye geç — ek %1-2 tasarruf büyük rakam olur.
3. **Pro plan / kurumsal:** iyzico kurumsal hesap (fakülteler için fatura kesimi).

### Fiyatlandırma teklifi (revize)

| Plan | Aylık | Yıllık | Kullanım |
|---|---|---|---|
| **Free** | 0 TL | — | 2 vaka/ay + 1 dilekçe taslağı, AI tutor yok |
| **Sprint** (7 gün) | 49 TL | — | HMGS sınav öncesi 7 günlük yoğun, sınırsız |
| **Core** | 199 TL/ay | 1,990 TL | Sınırsız vaka + dilekçe + AI tutor |
| **Pro** | 349 TL/ay | 3,490 TL | Core + Claude opsiyonu + öncelikli AI + analiz |
| **Kurumsal** | Görüşme | — | Fakülte / baro paket, min. 50 lisans |

Stripe TR olmadığı için fiyatları TL bazında kuruyoruz. Pro plana Claude/GPT seçimi opsiyon olarak eklemek diferansiyasyon. Free tier düşük çünkü AI maliyeti zaten düşük — viral loop için cazip giriş.

### Free tier'in AI maliyeti

2 vaka × 30 gün × 0.25 TL = 15 TL aylık maliyet per free user. Bu nedenle free tier'a "AI tutor yok, sadece engine + mock feedback" sınırlaması koymak akıllıca.

---

## 5. PROD DEPLOYMENT

### Stack (mevcut Cloudflare uyumlu)

- **Cloudflare Pages** — `npm run build` → `dist/` deploy
- **Cloudflare Workers** — `wrangler.jsonc` mevcut, AI endpoint'leri
- **Cloudflare DNS** — custom domain
- **Cloudflare KV** — gelecekteki cache
- **Cloudflare Vectorize** — Tur 4 mevzuat embed

### Adım adım deploy planı

#### Hafta 1: Cloudflare account + domain

1. **Cloudflare hesap aç:** dash.cloudflare.com → Sign Up
2. **Domain al:**
   - `lawkit.com.tr` (önce — TR domain'i daha güvenilir)
   - `lawkit.app` veya `lawkit.io` (uluslararası SEO)
   - Cloudflare Registrar maliyet fiyatına satar (~$8/yıl .com)
3. **DNS ekle:** Cloudflare DNS, basic propagation 24 saat

#### Hafta 1: Worker secrets + env

```bash
cd app
wrangler login
wrangler secret put LLM_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Supabase Site URL ve Redirect URLs'i prod domain'iyle güncelle.

#### Hafta 1: İlk deploy

```bash
npm run build
wrangler deploy
```

Cloudflare dashboard'da custom domain'i Worker'a bağla.

#### Hafta 2: Production checklist

- [ ] DNS records prod'a yöneldi
- [ ] HTTPS aktif (Cloudflare Universal SSL)
- [ ] Supabase Site URL güncellendi
- [ ] Email template'leri uploaded
- [ ] Sentry (error tracking) eklendi
- [ ] Cloudflare Analytics aktif
- [ ] Robot.txt + sitemap.xml
- [ ] OpenGraph image (paylaşıldığında görünür)
- [ ] Yasal metinler (KVKK, mesafeli satış, gizlilik, kullanım koşulları)
- [ ] Hata sayfaları (404, 500)

### Tahmini ilk yıl maliyet (1000 user'a kadar)

| Kalem | Aylık |
|---|---|
| Cloudflare Pages + Workers | $0 (free tier) |
| Cloudflare Domain | $0.7 (yıllık $8) |
| Supabase Pro (50k+ MAU için) | $25 (gerekirse) |
| DeepSeek AI | $36 (100 user) → $240 (1k) |
| Email (Resend) | $0-20 |
| Sentry | $0 (free) |
| **TOPLAM** | **$25-280 / ay** |

**1000 kullanıcı × 200 TL/ay ortalama × %5 conversion = 10.000 TL gelir, $280 = ~8.500 TL maliyet → net pozitif.**

---

## 6. GTM (GO-TO-MARKET) / REKLAM PLANI

### Hedef kitle segmentleri

| Segment | Boyut (TR) | İlk dönüşüm potansiyeli |
|---|---|---|
| HMGS adayı (mezun) | ~30,000 | %5 conversion realistik (1500 kişi) |
| Hukuk fakültesi son sınıf | ~13,000/yıl | %2 conversion (260 kişi) |
| Stajyer avukat | ~9,000 | %3 conversion (270 kişi) |
| Genç avukat (1-3 yıl) | ~25,000 | %1 conversion (250 kişi) |

### Pre-launch (8 hafta önce)

1. **Landing page + waitlist** (mevcut zaten, ama "early access" CTA'ya çevir)
2. **Twitter/X hesabı** — "hukukinformatik" alanında günlük 1-2 değerli içerik
3. **Instagram hukukçu sayfaları:** mikro-influencer (5-50k takipçi) ile barter — 1 ay ücretsiz Core karşılığı story
4. **LinkedIn:** HMGS hashtag'leriyle haftalık post

### Launch (gün 0)

1. **HMGS açık formal duyuru:** Hukukçu hashtag'lerle Twitter thread
2. **Product Hunt benzeri TR alternatifi** — Devlet/Webrazzi'ye bilgi gönder
3. **YouTube hukuk content creator'ları:** "Yeni çıkan vaka simülatörü" review için ürün gönder
4. **Hukuk öğrenci toplulukları:** İstanbul, Ankara, İzmir fakültelerinde temsilci öğrenci

### Ücretli reklam (3 ay sonra, conversion verisi netleşince)

1. **Google Ads:** "HMGS hazırlık", "işe iade dilekçesi örneği", "hukuk vaka çözümü"
2. **Meta Ads (Instagram + Facebook):** 18-30 yaş hukuk fakültesi öğrenci targetli
3. **TikTok Ads:** kısa demo video, "uygulamanın AI'sı müvekkil rolü oynuyor"

Bütçe başlangıç: **5.000 TL/ay**, conversion verisine göre 20.000 TL'ye çıkar.

### Organik döngü (en kritik)

1. **Karne paylaş:** kullanıcı vakayı bitirince "skoru paylaş" butonu → Instagram story image
2. **Referans programı:** arkadaş davet et → +1 ay Core
3. **Haftalık vaka challenge:** her hafta yeni vaka, leaderboard, social sharing
4. **Blog SEO:** "İşe iade davası nasıl açılır?", "Sebepsiz zenginleşmede iyiniyet ne demek?" — bu konularda Google'da #1 olmak hayati

---

## 7. TEST STRATEJİSİ

### Şu anki durum

- **Engine smoke test** ✅ (validate + happy path) — 6/6 vaka
- **Component test** ❌
- **E2E test** ❌
- **AI prompt eval** ❌
- **Visual regression** ❌

### Acil eklenmesi gerekenler

1. **Vitest + React Testing Library** kurulumu
   - Engine reducer testleri (her event tipi için unit)
   - Component snapshot testleri (CaseScreenLayout, FeedbackPanel, StageView)
   - Auth provider mock testi
2. **Playwright E2E**
   - "Yeni kullanıcı kayıt + vaka oyna + karne'de görür" full flow
   - "Şifre sıfırlama" flow
   - "Dilekçe lab parça parça" flow
3. **AI eval harness**
   - `content/eval/*.eval.json` — her vaka için referans cevaplar + AI çıktısının kabul kriterleri
   - CI'da DeepSeek free model ile haftalık çalışır
   - Regresyon: cevap kalitesi düştü mü?

### Bu seansta hızlıca yapacağım

- Engine smoke test'i `borclar_002` ve `medeni_002` happy path'lerle genişlet
- DAG validator zaten 6 vakayı kontrol ediyor
- Yarın için: Vitest setup + 5-10 unit test

---

## 8. PRİORİTELİ YOL HARİTASI

### Faz 1: Production temelleri (Hafta 1-2)

**Hedef: lawkit.com.tr canlıda, kayıt olabilen, vaka oynayabilen ilk gerçek kullanıcı.**

1. Domain al + Cloudflare DNS
2. Wrangler secrets + ilk deploy
3. Supabase prod ayarları (Site URL, Redirect URLs)
4. Email template'leri yükle
5. Yasal metinler (KVKK + mesafeli satış + gizlilik) — şablon kullan, hukuki review sonra
6. Sentry kurulumu
7. Basic analytics (Cloudflare native)

### Faz 2: İçerik + güven (Hafta 2-4)

**Hedef: 3 derin vakaya hukukçu onay rozeti + 5 yeni vaka.**

1. 2-3 stajyer/yeni avukatla content review anlaşması
2. is_hukuku_002 / borclar_002 / medeni_002 hukuki düzeltmeler
3. Yargıtay içtihat numaraları (her vaka için 2-3 spesifik karar)
4. **5 yeni vaka:** Ceza Hukuku başlangıç + İdare Hukuku + Ticaret Hukuku + Aile Hukuku + İcra İflas
5. HMGS Arena route'unu boş bırakma — 30-50 soruluk **mini tanı testi** (kısa, 15 dk) kur
6. Ana menüyü ürün vitrin olarak ciddi revize et

### Faz 3: Ödeme (Hafta 4-6)

**Hedef: ilk ödemeli kullanıcı.**

1. Şahıs şirketi veya mikro işletme kuruluşu (gerekiyorsa)
2. **Shopier hesabı + entegrasyon** (en hızlı)
3. Subscription quota mantığı (free tier vaka sayacı)
4. Stripe Checkout benzeri ödeme akışı
5. Fatura altyapısı (Logo/Mikro entegrasyon yerine PDF email)
6. "Ödeme başarılı" → Supabase'de `subscription_tier` güncelle

### Faz 4: Pazarlama (Hafta 6-8)

**Hedef: 100 kayıtlı, 10 ödemeli kullanıcı.**

1. Twitter/Instagram organik içerik (haftada 3 post)
2. 5 hukuk YouTube'cusuna ürün gönderme
3. 3 fakülte öğrenci temsilcisi
4. Google Ads "HMGS hazırlık" 1000 TL pilot
5. Karne paylaşım image generator
6. Referans programı

### Faz 5: Ölçek (3+ ay)

1. Sosyal mekanik (haftalık challenge, leaderboard)
2. B2B / fakülte lisansı
3. Mobil uygulama (PWA → React Native?)
4. Mevzuat embed (pgvector) — semantic search AI Tutor
5. Premium tier (Claude opsiyon)

---

## 9. BU SEANSTAN SONRA İLK ADIM

Üç senaryodan birini seç:

**A. Production'a çıkart (en kritik):**  
Cloudflare + Wrangler ile prod deploy. Yasal metinler. lawkit.com.tr canlı. Bu seçili: 1-2 oturum, sen yapacaksın (domain alım + Cloudflare login), ben adım adım rehberlik + kod yazıyorum.

**B. Hukuki doğrulama + içerik genişletme:**  
Mevcut 6 vakaya hukukçu inceleme rozet sistemi + Yargıtay içtihat ekleme. 3-5 yeni vaka (yeni hukuk dalları). HMGS Arena mini tanı testi.

**C. AI testler + dinamik zorluk:**  
Vitest + Playwright kurulumu. AI eval harness. Dinamik zorluk algoritması (kullanıcı geçmişine göre option randomize'ı, ipucu kısıtlaması, vaka önerme motoru).

---

## 10. AÇIKÇA NE GEREKİR — SENDEN

| Konu | Karar |
|---|---|
| Domain | `lawkit.com.tr` mi, `lawkit.app` mi? İkisini de al? |
| Şirket | Şahıs şirketi var mı? Mikro işletme limitlerinde misin? |
| Bütçe | İlk 3 ay reklam bütçesi? (5k mı 20k mı TL/ay?) |
| Hukuk uzmanı | Tanıdığın stajyer/yeni avukat var mı? Yoksa içerik forumlardan bul? |
| Ödeme | Shopier'ı kabul ediyor musun yoksa PayTR'ye atlama mı? |
| AI strateji | Free tier'da AI sınırlı / yok mu? Tüm planlarda mı AI? |

Bu kararları net verirsen Faz 1'i bu hafta içinde bitirebiliriz.

---

## Bu doküman yaşam döngüsü

v1 — 2026 Mayıs. Her faz kapısında güncellenir. Faz tamamlanan satırların yanına `(tamamlandı: tarih)` notu düşülür.
