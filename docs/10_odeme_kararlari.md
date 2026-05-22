# Ödeme Sağlayıcı Kararları — TR pazarı, kişisel/şirketsiz başlangıç

Senin durumun:
- **Şahıs şirketi yok**
- Vergi levhası yok
- Bütçe 1.000 TL
- İlk hedef: 10-50 ödemeli kullanıcı (test)

## Ön bilgi — TR'de ödeme almak için ne gerekir?

Türkiye'de ödeme almak (özellikle abonelik) için **bir hukuki kişilik** gerekir:

### Seçenekler (en hızlıdan en yavaşa)

1. **Mikro İhracat (Şahıs):** TC kimliği ile, ihracatçı statüsü, vergi muafiyeti — sadece yurt dışına satış yapılırsa. **TR müşterilere satışta uygulanmaz.**
2. **Esnaf vergi muafiyeti (Md. 9 GVK):** Yıllık 240.000 TL altı gelir + belirli kategoriler. **Eğitim hizmetleri kapsam dışı**, kullanılamaz.
3. **Genç Girişimci Vergi İndirimi:** 29 yaş altı, ilk işletme. Şahıs şirketi açar, 3 yıl boyunca **75.000 TL gelirine kadar vergi yok**. **En çok bizim duruma uyan.**
4. **Şahıs şirketi (basit):** Vergi dairesinden açılır, 1-2 gün sürer, kuruluş ücreti yok (sadece e-imza ve mali müşavir aylık ücreti ~600-1.000 TL).
5. **Limited Şirket:** 10.000 TL sermaye, noter + ticaret sicil, ~5.000 TL kuruluş, mali müşavir ~2.000 TL/ay. **Şu an aşırı.**

### Karar: Şahıs Şirketi (Genç Girişimci varsa)

- **29 yaş altıysan: Genç Girişimci** — 3 yıl boyunca 75.000 TL'ye kadar gelir vergisi yok.
- Mali müşavir aylık ~600-1.000 TL (giderden düşülür)
- KDV mükellefi olursun ama ürün dijital hizmet → KDV %20 ekleyip fiyatlara → kullanıcıdan tahsil + Devlete öde

**Açılış adımları:**
1. e-Devlet üzerinden "İşe Başlama Bildirimi" (gerçek kişi)
2. Vergi dairesi ziyareti, faaliyet kodu (NACE 6312 — bilgi hizmetleri / 8559 — eğitim)
3. Yoklama tutanağı (yerinde inceleme, ev adresinde olabilir)
4. e-imza al (~400 TL/yıl)
5. Mali müşavir tut (gerekli) — onlar Defter-Beyan sistemini yönetir

**Süre:** 1-3 hafta, ~1.500 TL ilk ay (mali müşavir + e-imza + diğer kuruluş).

**Bu adım yapılmadan ödeme alamayacaksın.** Önce hukuki kişilik, sonra ödeme.

---

## Sağlayıcı Karşılaştırması

### 1. **Shopier** ⭐ En hızlı, kişisel uyumlu

- **Avantaj:** Şahıs hesabıyla (bireysel) hesap açabilir — ticari kişilik gerekli ama dijital onboarding hızlı.
- **Komisyon:** %1.99-2.99 + 0.50 TL/işlem
- **Abonelik:** Yeni eklendi (2024), "düzenli ödeme" diyorlar — Stripe Subscriptions kadar güçlü değil
- **API:** REST + webhooks (orta kalite dökümanı)
- **Ödeme yöntemleri:** Kredi kartı, havale, BKM Express, kuponlar
- **Para çekme:** Banka transferi, T+2 gün

**Risk:** Abonelik özelliği henüz olgun değil, iptal/güncelleme akışları biraz manuel.

### 2. **PayTR** Güçlü, ucuz, biraz teknik

- **Avantaj:** En düşük komisyon (%1.49-2.49), abonelik motoru olgun
- **Komisyon:** %1.49-2.99 + 0.40 TL (yıllık ciroya göre)
- **Abonelik:** Tam destek (subscription period + retry logic)
- **API:** REST + webhook, oturmuş döküman
- **Onboarding:** Şirket gerekli, evrak süreç 1-2 hafta
- **Para çekme:** T+1 (1 gün sonra)

**Risk:** Onboarding biraz daha yavaş. İlk abonelik akışı kurulumu PHP/Java ağırlıklı örneklere yatkın.

### 3. **iyzico** Premium, kurumsal

- **Avantaj:** En oturmuş, dökümantasyon en iyi, marka güveni
- **Komisyon:** %3-4 + 0.25 TL — diğerlerinden pahalı
- **Abonelik:** Güçlü, sub-aktarım var (3D secure dahil)
- **API:** REST + webhook + iyzico Inci (B2B paneli)
- **Onboarding:** Şirket evrakı + vergi levhası + banka hesabı, ~5-10 gün
- **Para çekme:** T+1

**Risk:** Komisyon yüksek, küçük marjlı abonelikte fark açar.

### 4. **LemonSqueezy** Global, vergi otomasyon

- **Avantaj:** Merchant of Record — onlar vergi/fatura/iade yönetir, sen sadece ürüne odaklan
- **Komisyon:** %5 + 0.50 USD
- **Abonelik:** Tam destek
- **API:** Mükemmel
- **Onboarding:** Şahsi adresle de açılır — ama TR ödemeleri "card not present" akışında 3DS sorunları olabilir
- **Türk Lirası:** Destek **yok** — USD veya EUR

**Risk:** TR müşteri kart bilgileriyle USD ödemek psikolojik bariyer; kurdan kayıp.

### 5. **Stripe** ❌ TR satıcı yok

- TR'de doğrudan satıcı hesabı açılmıyor
- US LLC + Mercury banka açarak yapılabilir ama 1-2 ay + $400+ maliyet

---

## Karar matrisi (senin için)

| Sağlayıcı | Hız | Maliyet | Risk | Skor |
|---|---|---|---|---|
| Shopier | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | **15** |
| PayTR | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **15** |
| iyzico | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **14** |
| LemonSqueezy | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | **8** |

### Öneri (sıralı)

1. **İlk faz (0-50 ödemeli user):** Shopier
   - En hızlı entegrasyon, mikro işletme uyumlu
   - Komisyon kabul edilebilir
   - Subscription motoru zayıf ama 50 user için manuel yenileme akışı kötü değil
2. **İkinci faz (50-500 user):** PayTR'ye geç
   - %1.5 komisyon = 250 TL/ay × 500 user × %1.5 = 1.875 TL/ay tasarruf
   - Subscription motoru çok daha iyi
3. **Üçüncü faz (B2B / fakülte):** iyzico Kurumsal
   - Toplu fatura, fakülteler iyzico'yu zaten tanıyor

---

## Akış: ödeme entegrasyonu (Shopier ile)

### Adım 1: Şahıs şirketi aç (1-3 hafta)
- e-Devlet → İşe Başlama Bildirimi
- Mali müşavir (~700 TL/ay sözleşmeli)
- e-imza
- Vergi levhası

### Adım 2: Shopier merchant başvurusu (1 gün)
- shopier.com/merchant signup
- Vergi levhası + IBAN
- Onay ~24 saat

### Adım 3: Entegrasyon (1-2 gün)
- Shopier API key + secret
- Cloudflare Worker secret olarak ekle
- Yeni route: `/odeme/basla` — checkout başlat
- Webhook endpoint: `/api/webhooks/shopier` — başarılı ödeme + abonelik yenileme
- Supabase'de yeni tablo: `subscriptions`

### Adım 4: Abonelik mantığı
```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('sprint', 'core', 'pro')),
  status text not null check (status in ('active', 'past_due', 'canceled', 'expired')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  shopier_order_id text,
  created_at timestamptz not null default now()
);
```

### Adım 5: Fair-use sayaç
- `case_attempts` tablosunda ayrı index: `user_id + finished_at`
- Vaka başlamadan önce kontrol: bu ay kaç vaka çözmüş?
- Free tier 3 AI'lı vaka → 4. denemede paywall UI

---

## Vergi notu (önemli)

KDV dijital hizmetlerde %20. Fiyatlandırmada **KDV dahil** mi **hariç** mi göstermek?

**Tüketici (B2C) için TR mevzuatı: KDV dahil göstermek zorunlu.**

Yani 250 TL/ay (KDV dahil) = ~208 TL satıcıda, 42 TL KDV.

İlk yıl Genç Girişimci varsa gelir vergisi yok, sadece KDV ödenir.

Mali müşavir bunu otomatik takip eder, sen sadece her ay Shopier ekstresi gönderirsin.

---

## Action items (senin yapacağın)

1. **Yaşını söyle:** Genç Girişimci uygun mu (29 altı)? Çok büyük fark yaratır.
2. **Mali müşavir bul:** Çevreden referans veya iyiavukatim.com / Avukat Saati'nde "mali müşavir" araması.
3. **Şahıs şirketi açılış aralığını söyle:** 2 hafta sonra mı, 1 ay mı?
4. **Shopier ile başlamayı kabul mü?**

Şirket olmadan **ödeme alamazsın**. Bu adım atılmadan ürün canlıya bile çıkarılır, ama para alamazsın (waitlist + free tier ile başlarız).

---

## Alternatif strateji — şirket gelmeden önce

Şirket açılışı 2-3 hafta sürerken:
1. **MVP'yi prod'a çıkar** (lawkit.com.tr, ücretsiz)
2. **"Ücretsiz beta" launch** — sınırsız Core erişim 30 gün
3. **Şirket açılınca** ödeme akışını ekle, mevcut kullanıcılar "30 günü doldu, abone ol" UI'sıyla karşılaşır
4. **Erken kuş indirimi:** Beta kullanıcıları için ilk yıl Core %50 indirim (125 TL/ay)

Bu şekilde organic momentum kaybetmezsin.
