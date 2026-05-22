# Hukuki Doğrulama Checklist — Vaka İncelemesi

Her vaka için bağımsız hukuk uzmanı bu listeyi imzalayarak doldurmalıdır.

**Asıl amaç:** Türkiye hukuku açısından **maddi**, **usul** ve **terminoloji** açısından her vakanın gerçek yargı süreçlerinde başına gelebilecek hayata uygunluğunu garanti etmek.

---

## Genel kurallar (tüm vakalar için)

### Mevzuat referansları
- [ ] Tüm kanun numaraları doğru (örn. 4857 İş K., 6098 TBK, 4721 TMK, 6100 HMK, 634 KMK, 7036 İş Mahk. K.)
- [ ] Kullanılan maddeler son resmi güncelleme tarihine kadar geçerli
- [ ] Madde içerik özetleri `app/src/content/sources.ts` ile birebir uyumlu (kısaltma yapılsa bile manaya zarar yok)
- [ ] mevzuat.gov.tr URL'leri doğru ve canlı

### Yargıtay içtihat
- [ ] Vakalarda atıf yapılan içtihatlar için **somut karar numarası** verilmiş (örn. "Yargıtay 22. HD. 2024/X E. 2024/Y K.")
- [ ] Sadece "yerleşik içtihat" demek **kabul edilemez**: dipnot olarak 1-2 spesifik karar eklenmeli
- [ ] HGK kararı varsa öne çıkarılmalı

### Olay örgüsü gerçekçiliği
- [ ] Olaylar Türkiye'de gerçek hayatta yaşanabilir
- [ ] Olay tarihleri tutarlı (örn. fesih tarihi + arabuluculuk başvuru + dava tarihleri birbiriyle uyumlu)
- [ ] Sayısal bilgiler gerçekçi (kıdem yılı, işçi sayısı, tazminat tutarları)
- [ ] Karakter ifadeleri/lehçeleri normal vatandaş üslubuna yakın (avukat jargon değil)

### Hukuki strateji
- [ ] "Doğru cevap" (verdict: good) gerçekten doğru — bir hâkim/Yargıtay reddetmez
- [ ] "Yanlış cevap" (verdict: bad) gerçekten yanlış — savunmada kullanılınca müvekkili kaybettirir
- [ ] "Kısmi cevap" (verdict: partial) gerçek hayatta çok karşılaşılan ortayolcu yaklaşım
- [ ] Tuzaklar (yanlış Yargıtay atfı, yanlış süre, yanlış görevli mahkeme) günlük pratikte yapılan tipik hatalardan
- [ ] Açıklamalar (`feedback`) öğrenciye hatasını anlatır ama küçümsemez

### KVKK + etik
- [ ] Kullanılan isimler kurgusal (gerçek bir kişiye benzemiyor)
- [ ] Olay örgüsü herhangi bir gerçek davaya doğrudan benzemiyor
- [ ] Tıbbi/sağlık iddiaları (medeni vakalarda) gerçekçi sınırlar içinde

---

## Vaka 1: `is_hukuku_002` — Selin Hanım, işe iade davası

### Mevzuat referansları
- [ ] **İş K. m. 19** — yazılı fesih şartı (4857 SK)
- [ ] **İş K. m. 20** — 1 ay hak düşürücü süre (kontrol: arabuluculuk başvurusu için mi, dava için mi?)
- [ ] **İş K. m. 21** — işe iade hükümleri, 4-8 ay tazminat
- [ ] **İş K. m. 25** — haklı sebep, m. 25/II ahlak ve iyiniyet kurallarına aykırılık
- [ ] **İş K. m. 26** — haklı sebepten fesih süresi (6 işgünü)
- [ ] **İş Mahk. K. m. 3** — arabuluculuk dava şartı
- [ ] **HMK m. 145** — sonradan ileri sürme yasağı

### Vakada doğrulanması gerekenler
- [ ] **İş güvencesi kapsamı:** 30+ işçi şartı (işyeri başına mı, toplam mı?)
- [ ] **Süreler:** fesih bildirimi → arabuluculuk (1 ay) → dava (uzlaşmazlık tutanağından 2 hafta)
- [ ] **SMS yazılı şekil sayılır mı?** — Yargıtay 9. HD veya 22. HD karar atfı
- [ ] **n9 ai_branch context'i:** "haklı sebepten fesih 6 işgünü içinde" — m. 26/I tam alıntısı

### Olay örgüsü
- [ ] 9 yıl kıdem + 140 işçi → iş güvencesi kapsamı **kesin**
- [ ] SMS ile fesih → Yargıtay yerleşik içtihatları "geçersiz şekil" olarak değerlendiriyor mu? Spesifik karar?
- [ ] Karşı tarafın "haklı sebep" iddiası (sevkiyat kaçırma) → 2 ay öncesi → m. 26 süresi geçmiş — bu argüman gerçek davalarda kabul ediliyor mu?

### 5 outcome gerçekçi mi?
- [ ] **Zafer**: İşe iade + 4 ay boşta + 8 ay tazminat + birikmiş alacaklar → m. 21 ile uyumlu mu?
- [ ] **Tam kayıp**: 1 ay süre kaçırma → işe iade hakkı düşer, ama **kıdem/ihbar tazminatı** ayrı dava ile alınabilir mi? (Bu outcome'da bilgi eksik olabilir)

### Eksikler tespit edildi mi?
- [ ] Türkiye Barolar Birliği Avukatlık Asgari Ücret Tarifesi'ne göre maktu/nispi ücret vurgusu yok
- [ ] Yargıtay aşaması (istinaf 6 ay, temyiz 1-2 yıl) süresi açık değil

**İnceleyen:** ___________________  **Tarih:** ___________________  **Onay:** ☐ / ☐ Düzeltme istendi

---

## Vaka 2: `borclar_002` — Kerem Bey, sebepsiz zenginleşme

### Mevzuat referansları
- [ ] **TBK m. 77** — sebepsiz zenginleşme tanımı (6098 SK)
- [ ] **TBK m. 78** — geri verme (kontrol: m. 78 ya da m. 79?)
- [ ] **TBK m. 79** — iyi/kötüniyet kapsam ayrımı (gerçek metin?)
- [ ] **TBK m. 82** — zamanaşımı (2 yıl + 10 yıl)
- [ ] **TBK m. 285** — bağışlama iradesi
- [ ] **TBK m. 49** — haksız fiil

### Vakada doğrulanması gerekenler
- [ ] **TBK m. 79 metni** — "iyi niyetli" mi yoksa "iyiniyetli" mi? Resmi metin?
- [ ] **İspat yükü:** kötüniyet iddiasında bulunan tarafta — Yargıtay HGK içtihadı?
- [ ] **"Bilme veya bilmesi gerekme" eşiği:** TBK m. 79'da açıkça var mı, doktrinde mi tanımlı?
- [ ] **n9 ai_branch:** "düşünüp sormamak" kötüniyet eşiğini karşılar mı? Pratikte tartışmalı, hangi içtihat dayanaklı?

### Olay örgüsü
- [ ] **24.800 TL** yanlış havale → günlük hayatta tipik (BAĞIŞLAMA mı sebepsiz iktisap mı tartışması)
- [ ] **5 gün sonra ihtar** → makul süre içinde
- [ ] **Müvekkilin kredi kartı borcu kapatması** → "mevcut zenginleşme" tartışmasını doğurur (m. 79)
- [ ] **Müvekkilin "sormayı düşünüp yapmaması"** → karşı tarafın delili olabilir mi? Pratik mi?

### 5 outcome gerçekçi mi?
- [ ] **Tam savunma:** sadece kalan 6.300 TL iade — pratiğe uygun mu?
- [ ] **Tam kayıp:** 24.800 TL + 6 ay yasal faiz → faiz oranı? 9.39 mu yoksa avans faizi mi?

### Eksikler
- [ ] TBK m. 78 — geri verme zamanı düzenliyor, vakada atlanmış olabilir
- [ ] Dava harçları (binde 6.83 nispi) tartışılmamış

**İnceleyen:** ___________________  **Tarih:** ___________________  **Onay:** ☐ / ☐ Düzeltme istendi

---

## Vaka 3: `medeni_002` — Fatma Hanım, komşuluk hukuku

### Mevzuat referansları
- [ ] **TMK m. 730** — taşkın kullanımı sorumluluğu (4721 SK)
- [ ] **TMK m. 737** — komşu hakkı / kullanmaya ilişkin
- [ ] **KMK m. 24** — yönetim planına aykırı kullanım (634 SK)
- [ ] **KMK m. 33** — Sulh Hukuk görevli mahkeme — bu doğru mu, yoksa Asliye Hukuk mu?
- [ ] **HMK m. 389** — ihtiyati tedbir
- [ ] **HMK m. 390** — ihtiyati tedbir esasa bağlılığı

### Vakada doğrulanması gerekenler
- [ ] **KMK m. 33** — kat mülkiyetinden doğan davalarda görevli mahkeme şu an Sulh Hukuk mu? **DİKKAT:** 2016 sonrası reform var
- [ ] **KMK m. 24** — yönetim planı değişikliği için "kat malikler kurulu oybirliği" mi, "salt çoğunluk" mu?
- [ ] **Belediye ruhsatı** ile özel hukuk komşuluk hakkı ilişkisi — somut Yargıtay kararı?
- [ ] **Bilirkişi raporu ses 65 dB** → resmi sınır 55 dB mi? Çevresel Gürültü Yönetmeliği?
- [ ] **TMK m. 730 dava türü:** "el atmanın önlenmesi" tek terim mi, "men'i müdahale" de denilir mi?

### Olay örgüsü
- [ ] Yönetim planında "mesken" kayıtlı + belediye işyeri ruhsatı → bu çelişki gerçek hayatta sık karşılaşılan bir durum mu?
- [ ] Doktor raporu sağlık zararı → mahkemede manevi tazminat için yeterli mi?

### 5 outcome gerçekçi mi?
- [ ] **Tam zafer:** İhtiyati tedbir + 50.000 TL manevi + 35.000 TL maddi tazminat — rakamlar 2026 paraya uygun mu?
- [ ] **Görevsizlik:** Hâkim re'sen görev kontrolü yapar — bu outcome'a gerçekçi mi?

### Eksikler
- [ ] **Daire değer kaybı tazminatı (35.000 TL):** Bilirkişi atanması zorunlu — vakada açık değil
- [ ] **Tedbir kararı + esas dava aynı dilekçede mi yoksa ayrı mı açılır?** (HMK m. 390/I)
- [ ] **Türk Patent + İşyeri açma izni** sürecine atıf yok

**İnceleyen:** ___________________  **Tarih:** ___________________  **Onay:** ☐ / ☐ Düzeltme istendi

---

## Demo vakalar (kısaltılmış)

Demo vakalar (`is_hukuku_001`, `borclar_001`, `medeni_001`) MiniCaseRunner için kullanılıyor. Aynı temel kontroller geçerli ama daha basit:

### `is_hukuku_001` — Ayşe Hanım sözlü fesih
- [ ] İş K. m. 20 — süre + arabuluculuk
- [ ] İş Mahk. K. m. 3 — dava şartı
- [ ] 7 yıl + 30+ işçi → iş güvencesi kapsamı (sınırda — kontrol)

### `borclar_001` — yanlış havale
- [ ] TBK m. 77 — sebepsiz zenginleşme
- [ ] TBK m. 79 — kapsam
- [ ] 18.500 TL — günümüze uygun mu?

### `medeni_001` — kuru temizlemeci
- [ ] TMK m. 730 — taşkın kullanım
- [ ] TMK m. 737 — komşu hakkı
- [ ] Apartman planında mesken kayıtlı detayı

**İnceleyen:** ___________________  **Tarih:** ___________________

---

## Dilekçe Lab şablonları

`app/src/content/petition-templates.ts` içindeki 3 şablon (işe iade, sebepsiz zenginleşme, komşuluk) için ayrı checklist:

### İşe iade dilekçesi
- [ ] Sonuç istem kalemleri tam: işe iade + boşta geçen süre + işe başlatmama tazminatı + birikmiş alacaklar + faiz başlangıcı + yargılama giderleri + vekâlet ücreti
- [ ] HMK m. 119 zorunlu unsurlar (adresler, deliller) tam mı?
- [ ] Arabuluculuk uzlaşmazlık tutanağı eklenmesi belirtilmiş mi?

### Sebepsiz zenginleşme dilekçesi
- [ ] Talep tutar net; "fazlaya ilişkin haklar saklı" formülü
- [ ] Belirsiz alacak davası mı kısmi dava mı seçimi açık

### Komşuluk dilekçesi
- [ ] El atmanın önlenmesi + tazminat + ihtiyati tedbir — üçlü ayrı kalem
- [ ] Bilirkişi atanması talebi var mı?

**İnceleyen:** ___________________  **Tarih:** ___________________

---

## Hukukçu inceleme süreci

1. **Aday hukukçu bulma:**
   - Hukuk fakültesi mezunu, baroya kayıtlı, 1-5 yıl deneyimli, vaka konusuyla ilgili (örn. iş hukuku için iş davalarına bakan)
   - Saatlik ücret 200-400 TL bandı (2026 Mayıs piyasa)
2. **Her vaka için:** bu checklist + vaka JSON dosyası + ilgili kaynak.ts içeriği
3. **Çıktı:** düzeltme önerileri + yeşil rozet (`reviewedBy: { name, baroSicil, date }`)
4. **JSON'a kayıt:** `LegalCase` tipine `reviewedBy?: ReviewMeta` ekle, UI'da rozet göster

### Marka davranışı

Yeşil rozet olmayan vakalar: küçük amber uyarı "henüz hukukçu incelemesinde değil"
Yeşil rozet olanlar: profil kartında "✓ Av. [Ad], [Baro] tarafından incelendi"

Bu güven sinyali sosyal medya pazarlaması için çok değerli.

---

## Yaşam döngüsü

Bu doküman her vaka için referans noktasıdır. Yeni vaka eklendiğinde aynı checklist kopyalanır, yeni hukukçu imzasına gönderilir.
