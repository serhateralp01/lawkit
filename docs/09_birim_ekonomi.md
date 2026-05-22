# Birim Ekonomi — Aktif kullanıcı başına maliyet

Sorulan soru: "Bir kişi günde 4 vaka çözerse bize aylık kaç TL'ye mâl olur?"

## Tek kullanıcı modeli (yoğun kullanım)

Bir aktif kullanıcı **günde 4 vaka × 30 gün = 120 vaka/ay** çözüyor.

### AI maliyeti (DeepSeek V4 Pro, indirimli)

Bir derin vakanın AI çağrı kümesi (önceki doküman):

| Çağrı | Input tokens | Output tokens | Cost (USD) |
|---|---|---|---|
| Müvekkil chat (5 tur) | ~4,000 | ~1,500 | $0.003 |
| Open text assess (2×) | ~5,000 | ~1,000 | $0.003 |
| AI branch (1×) | ~1,500 | ~300 | $0.001 |
| AI Tutor (opsiyonel) | ~2,000 | ~500 | $0.001 |
| **Vaka toplamı** | | | **~$0.008** |

**Günde 4 vaka × 30 = 120 vaka**: 120 × $0.008 = **$0.96 / ay** ≈ **30 TL / ay**.

### Cloudflare + Supabase

| Kalem | Tek user başına (ay) |
|---|---|
| Cloudflare Pages (free tier) | 0 TL |
| Cloudflare Workers (100k req/gün free) | 0 TL |
| Supabase (50k MAU free) | 0 TL |
| Email gönderim (Supabase free) | 0 TL |

**Toplam altyapı ≈ 0 TL** (1000 kullanıcıya kadar).

### Reklam / acquisition cost (CAC)

Bunu ürün maliyetine **amortize edilmiş** olarak yansıtmak doğru. Ortalama acquisition cost:
- Organic + influencer barter karışımı: ~30-50 TL/kullanıcı (varsayım)
- Google Ads HMGS hashtag CTR + CR: 50-100 TL/kullanıcı (TR pazarı 2026 ortalama)

12 ay LTV varsayarsak CAC'i **/12** alıyoruz:
- Organik dominant: 50 TL / 12 ≈ **4 TL/ay/user**
- Reklamlı: 100 TL / 12 ≈ **8 TL/ay/user**

Karışım ortalama: **~6 TL/ay/user**.

### Senin işçiliğin (opportunity cost)

Bu sürecin değerli olması için zamanını boşa harcamamalısın. Varsayım:
- İçerik bakım + müşteri desteği + bug fix: ayda 20 saat
- Saatlik değer: 200 TL (öğrenci/serbest çalışan tahmin)
- Toplam: 4.000 TL/ay sabit emek
- 100 ödemeli kullanıcı varsa: **40 TL/ay/user** (sabit emek)
- 1.000 ödemeli kullanıcıda: **4 TL/ay/user**

İşçilik **ölçek geldikçe sıfıra yaklaşır** — bu yüzden ilk 100 user fazıyla 1.000+ user fazı çok farklı görünür.

### Tek kullanıcı toplam maliyet (ay)

| Faz | AI | Altyapı | Reklam | İşçilik | TOPLAM |
|---|---|---|---|---|---|
| 100 ödemeli user | 30 TL | 0 | 6 TL | 40 TL | **76 TL** |
| 1.000 ödemeli user | 30 TL | 0 | 6 TL | 4 TL | **40 TL** |
| 10.000 ödemeli user | 30 TL | 25 TL (Supabase Pro) | 6 TL | 0.4 TL | **62 TL** |

### Fiyatlandırma kontrol — 250 TL/ay Core

| User sayısı | Maliyet/user | Gelir/user | Net/user | Aylık gelir | Aylık net |
|---|---|---|---|---|---|
| 100 | 76 TL | 250 TL | 174 TL | 25.000 TL | 17.400 TL |
| 1.000 | 40 TL | 250 TL | 210 TL | 250.000 TL | 210.000 TL |
| 10.000 | 62 TL | 250 TL | 188 TL | 2.500.000 TL | 1.880.000 TL |

**Çıkarım:** 250 TL fiyat 100 user'dan itibaren güzel kâr marjı veriyor. **Yoğun kullanan (4 vaka/gün) bir user bile 30 TL AI maliyetinde — gelirinin sadece %12'sini AI'a harcıyoruz.**

### Ne kadar yoğun kullanan tehlikeli olur?

AI maliyetinin gelirin %50'sini aşması break-point. 250 TL × 0.5 = 125 TL AI maliyet eşiği.

- 125 TL / 0.25 TL_per_case = **500 vaka/ay** = günde 16-17 vaka

Bu tamamen patolojik kullanım. Bunu engellemek için **fair-use limit** yeterli: günde 10 vaka, ayda 200 vaka. %99 kullanıcı bunu görmez bile.

### Free tier'ın AI maliyeti

Free tier: günde **2 AI çağrılı vaka** (senin dediğin).
- 2 vaka × 30 gün × 0.008 USD = **$0.48 / ay** ≈ **15 TL / ay / free user**

100 free user × 15 TL = **1.500 TL/ay** salt AI. Bu kabul edilebilir bir akı maliyeti (lead acquisition).

100 free user'dan **%5 conversion** beklersek → 5 paying user → 5 × 174 TL net = **870 TL gelir**. Free tier net negatif (1.500 - 870 = -630 TL aylık zarar 100 free user için). 

**Sonuç:** Free tier'ı çok cömert tutma. Şu öneri:
- Free: **ayda 3 AI'lı vaka + sınırsız tat vakaları** (engine-only, AI yok)
- Sprint (50 TL/7gün): sınırsız AI, sınav öncesi yoğun
- Core (250 TL/ay): sınırsız, ana plan
- Pro (400 TL/ay): + Claude opsiyon + öncelikli AI

Free tier ayda 3 vaka × 0.008 USD = $0.024 ≈ **0.75 TL/free user**. 100 free user ayda 75 TL maliyet. Çok yüksek conversion karşılayabilir.

---

## Senin gerçek bütçen (1000 TL)

- **Domain:** lawkit.com.tr ~30-50 TL/yıl Cloudflare Registrar (cheap)
- **Test reklam:** 500 TL pilot Google Ads (1 hafta)
- **Email gönderim:** 0 TL (Supabase free)
- **AI maliyeti:** ilk 50 free user × 0.75 TL = 38 TL/ay (negligible)
- **Hosting:** 0 TL

**1000 TL ile en az 3-4 ay rahat ilerleyebilirsin.** Domain + domain DNS + ilk 1-2 ay reklam pilot bütçesi.

---

## Yıllık planın matematiği (1.990 → 2.490)

%25 zam sonrası **yıllık Core = 2.490 TL** (~208 TL/ay efektif, %17 indirim).

Yıllık ödeme avantajı:
- Cash flow ilk gün
- Churn riski 12 aya yayılır
- Pazarlama harcama gücü artar

Hedef yıllık plan oranı **%30+**. Şubat-Mart döneminde HMGS yaklaşırken yıllık abonman atışı yüksek olur.

---

## Karar özetı

1. **Fiyatları 50 / 250 / 400 yap.** Sprint 50/7gün, Core 250/ay, Pro 400/ay.
2. **Free tier:** ayda 3 AI'lı vaka, sınırsız tat (engine-only).
3. **Fair-use:** günde 10 vaka limit (Core), günde 20 (Pro). %99 kullanıcı görmez.
4. **Yıllık:** Core 2.490 TL (~208/ay), Pro 3.990 TL (~333/ay).
5. **Kurumsal:** görüşme, min 50 lisans, paket bazlı (öğrenci başına 80-120 TL band).

Bu rakamlarla **100 ödemeli user'da 17.400 TL aylık net**, **1000 user'da 210.000 TL aylık net**. Yapılabilir hedef.
