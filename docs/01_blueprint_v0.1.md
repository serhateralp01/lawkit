# LawKit MVP Product Blueprint v0.1

## 1. Ürün kararı

LawKit ilk aşamada ayrı avukat, hâkim ve savcı uygulamalarına bölünmeyecek. İlk ürün, avukatlık yolculuğuna odaklanan tek bir web uygulaması olacak. Uygulamanın çekirdeği pasif video veya PDF deposu değil, karar verdikçe ilerleyen vaka motoru olacak.

İlk MVP alanı: **İş Hukuku / İş Mahkemeleri / işçilik alacağı ve işe iade senaryoları**.

Bu alanın seçilme nedeni: HMGS’de usul, borçlar, iş hukuku ve temel yargılama bilgisiyle kesişir; stajyer avukatın erken dönemde karşılaşabileceği gerçekçi vakalar üretir; müvekkil görüşmesi, arabuluculuk şartı, görev-yetki, zamanaşımı, dava türü, dilekçe ve duruşma adımlarını tek senaryo içinde bağlar.

## 2. İlk kullanıcı

Birincil kullanıcı: HMGS’ye hazırlanan son sınıf hukuk öğrencisi veya yeni mezun.

İkincil kullanıcı: avukatlık stajına başlamış, dilekçe ve müvekkil görüşmesi pratiği eksik olan stajyer avukat.

İlk satış kanalı B2C olacak. Fakülte, baro ve kurum lisansı daha sonra, kullanıcı verisi ve tamamlanma metrikleri oluşunca değerlendirilecek.

## 3. MVP değer önerisi

LawKit kullanıcısı bir hukuk kuralını sadece okumaz; bir müvekkil olayında kullanır, karar verir, gerekçe yazar, hata yapar, rubrik üzerinden puan alır ve aynı senaryonun sonuçlarını görür.

İlk değer cümlesi:

**“HMGS’den staja uzanan vaka tabanlı hukuk pratiği: müvekkil dinle, strateji kur, dilekçe yaz, geri bildirim al.”**

Alternatif daha kısa landing cümlesi:

**“Hukuku ezberleme. Vakada uygula.”**

## 4. MVP modülleri

### 4.1 HMGS Arena

Amaç: sınav kapısından kullanıcı almak.

İlk sürümde kapsam:

- tanı testi
- konu etiketli mini testler
- yanlış cevap açıklaması
- zayıf konu haritası
- çalışma planı önerisi

İlk MVP’de 25 hukuk dalı tam kapsanmayacak. İş hukuku senaryosu üzerinden HMGS’ye bağlanan temel alt konular seçilecek: iş hukuku, borçlar, medeni usul, arabuluculuk, temel anayasal hak arka planı.

### 4.2 Case Studio

Amaç: ürünün asıl farkını göstermek.

Kullanıcı, olay örgüsü içinde karar verir. Her karar bir sonraki adımı etkiler. Sistem yalnızca doğru/yanlış demez; seçilen yolun hukuki sonucu, kaçırılan bilgi ve doğru düşünme sırası gösterilir.

İlk case örneği:

**“Haksız fesih iddiası ve işe iade/işçilik alacağı stratejisi”**

Akış:

1. Müvekkil kısa olay anlatır.
2. Kullanıcı eksik bilgileri sorar.
3. Sistem kullanıcının sorduğu/sormadığı bilgileri kaydeder.
4. Kullanıcı dava yolunu seçer.
5. Sistem arabuluculuk, süre, görev, yetki, talep ve delil eksiklerini değerlendirir.
6. Kullanıcı kısa gerekçe yazar.
7. Sistem rubrik puanı verir.
8. Kullanıcı aynı senaryonun ideal çözümünü görür.

### 4.3 Dilekçe Lab

Amaç: stajyer avukat değerini başlatmak.

İlk sürümde tam serbest dilekçe üretimi yerine kontrollü yapı kurulacak.

Kullanıcıdan şu parçalar istenir:

- olay özeti
- hukuki nedenler
- deliller
- talep sonucu
- görevli/yetkili mahkeme gerekçesi

Sistem her parçayı ayrı puanlar. Model gerçek dava tavsiyesi vermez; eğitim amaçlı simülasyon ve rubrik geri bildirimi verir.

### 4.4 Portföy ve Karne

Amaç: retention ve paylaşılabilir ilerleme.

İlk sürümde kullanıcıya şu göstergeler verilecek:

- tamamlanan vaka sayısı
- konu bazlı başarı
- rubrik alt puanları
- en sık yapılan hata türleri
- son 7 gün çalışma ritmi

Paylaşılabilir sertifika veya rozet ilk sürümde zorunlu değil; ancak veri modeli baştan buna izin verecek şekilde kurulacak.

## 5. İlk kullanıcı akışı

### 5.1 Landing

Ekran yapısı:

1. Hero: kısa değer cümlesi
2. “Nasıl çalışır?” üçlü akış: vaka çöz, geri bildirim al, gelişimini takip et
3. Örnek mini vaka kartı
4. HMGS ve staj için kullanım alanı
5. Waitlist / ücretsiz deneme çağrısı

### 5.2 Onboarding

Kullanıcıdan yalnızca gerekli bilgiler alınır:

- durum: 3. sınıf / 4. sınıf / mezun / stajyer
- hedef: HMGS / staj pratiği / dilekçe pratiği
- sınav tarihi veya çalışma dönemi
- zayıf hissettiği alanlar

Onboarding sonunda kullanıcıya ilk önerilen görev verilir:

**“10 dakikalık İş Hukuku tanı vakası”**

### 5.3 Case ekranı

Ekran üç ana bölüme ayrılır:

- sol: olay dosyası ve kaynaklar
- orta: aktif diyalog / karar adımı
- sağ: görev listesi, süre, rubrik ilerlemesi, ipuçları

İlk sürümde voice input zorunlu değil. Metin tabanlı ilerlemek yeterli.

### 5.4 Feedback ekranı

Feedback serbest uzun metin olmayacak. Standart yapı:

- karar sonucu
- doğru/yanlış durumu
- gerekçe kalitesi
- kaçırılan hukuki mesele
- ilgili kaynak
- rubrik skoru
- bir sonraki önerilen adım

## 6. Rubrik sistemi

Her vaka aynı üst rubrik ağacına bağlanacak.

İlk rubrik boyutları:

1. Olayı anlama ve bilgi toplama
2. Hukuki mesele tespiti
3. Usul bilgisi
4. Maddi hukuk uygulaması
5. Gerekçelendirme kalitesi
6. Risk ve süre farkındalığı
7. Dilekçe/ifade açıklığı

Her boyut 0–4 arası puanlanır.

0 = yok veya hatalı
1 = zayıf
2 = kısmen doğru
3 = doğru ama eksik
4 = doğru, tam ve gerekçeli

## 7. AI mimarisi

AI tek prompt içinde çalışmayacak. Üç ayrı işlev ayrılacak.

### 7.1 Grounded explanation

Görevi: kullanıcının cevabını doğrulanmış hukuk kaynağına bağlı açıklamak.

Kaynak dışında kanun, içtihat veya kural uydurmasına izin verilmez. Kaynak yoksa sistem “bu konuda doğrulanmış kaynak bulunamadı” demelidir.

### 7.2 Role-play

Görevi: müvekkil, hâkim, karşı vekil veya staj patronu rolü oynamak.

Bu katman hukuki doğrulama motoru değil, simülasyon motorudur. Gerçek hukuki sonuç üretmez; kullanıcıyı karar vermeye zorlayan olay akışını taşır.

### 7.3 Assessment

Görevi: kullanıcı cevabını rubriğe göre puanlamak.

Çıktı mutlaka yapılandırılmış JSON olacak. Puan, hata türü, kaynak referansı ve sonraki adım ayrı alanlarda dönecek.

## 8. Structured output taslağı

```json
{
  "case_id": "is_hukuku_001",
  "step_id": "client_intake_03",
  "user_action_type": "free_text_answer",
  "assessment": {
    "is_correct": false,
    "score_total": 9,
    "score_max": 16,
    "rubric_scores": [
      {
        "dimension": "bilgi_toplama",
        "score": 2,
        "max": 4,
        "reason": "Kullanıcı fesih tarihini sordu ancak tebliğ şeklini ve arabuluculuk başvuru tarihini sormadı."
      }
    ],
    "missed_issues": ["fesih tarihi", "arabuluculuk şartı", "hak düşürücü süre"],
    "source_refs": ["source_labor_law_001", "source_mediation_002"],
    "next_step": "ask_missing_questions"
  },
  "student_feedback": {
    "short": "Doğru yoldasın, ancak süre hesabı için kritik iki bilgiyi kaçırdın.",
    "explanation": "İşe iade ve işçilik alacağı stratejisinde fesih tarihi ve arabuluculuk başvurusu süre hesabını belirler.",
    "suggested_action": "Müvekkile fesih bildiriminin tarihini ve yazılı olup olmadığını sor."
  }
}
```

## 9. Teknik omurga

MVP için modüler monolit yeterli.

Önerilen yapı:

- Frontend: Next.js + TypeScript
- UI: Tailwind + shadcn/ui
- Auth/database/storage: Supabase
- Vector search: Supabase pgvector
- AI orchestration: ayrı servis veya Next.js route handler ile başlayan, sonra worker’a taşınabilecek yapı
- Background jobs: ilk sürümde basit queue; büyüyünce Redis/BullMQ veya Python worker
- Payment: Türkiye için iyzico/PayTR/Param gibi yerel ödeme sağlayıcıları incelenecek
- Deployment: Vercel + Supabase başlangıç için yeterli

## 10. Repo yapısı

```text
lawkit/
  apps/
    web/
    admin/
  packages/
    ui/
    db/
    auth/
    case-engine/
    ai-orchestrator/
    content-schema/
    analytics/
  content/
    hmgs/
      labor-law/
      civil-procedure/
      obligations/
    practice/
      client-interviews/
      petitions/
      hearings/
  docs/
    adr/
    content-style-guide.md
    publishing-workflow.md
    pricing.md
  .github/
    workflows/
    CODEOWNERS
```

Kod, hukuki içerik ve AI davranışı ayrı tutulacak. Case içeriği JSON/YAML olarak versiyonlanacak. Her case publish edilmeden önce hukukçu kontrolü ve otomatik eval’den geçecek.

## 11. İçerik üretim hattı

İlk 10 case yeterli. Case sayısını büyütmeden önce vaka motoru ve rubrik kalitesi doğrulanmalı.

İlk içerik paketi:

1. İşe iade ön görüşmesi
2. Kıdem ve ihbar tazminatı talebi
3. Fazla mesai ispatı
4. Arabuluculuk şartı ve süre
5. Görevli ve yetkili mahkeme
6. Belirsiz alacak / kısmi dava seçimi
7. Delil listesi kurma
8. Dava dilekçesi iskeleti
9. Ön inceleme duruşması simülasyonu
10. Karşı taraf savunmasına cevap

Her case için dosya yapısı:

```text
case.yaml
rubric.yaml
sources.yaml
ideal_answer.md
ai_eval_tests.json
```

## 12. Güvenlik ve hukuki sorumluluk

Ürünün her kritik noktasında şu ilke korunacak:

**LawKit gerçek hukuki tavsiye vermez; eğitim amaçlı simülasyon ve değerlendirme sunar.**

Uygulama kuralları:

- gerçek kişi verisi varsayılan olarak modele gönderilmez
- kullanıcı yüklemesi varsa maskeleme yapılır
- eğitim amaçlı simülasyon uyarısı görünür olur
- AI açıklaması yalnızca doğrulanmış kaynaklara bağlanır
- kullanıcı cevabı ve model cevabı versiyonlanır
- silme ve veri saklama politikası baştan yazılır

## 13. Fiyatlama başlangıç varsayımı

İlk fiyatlama gerçek kullanıcı görüşmesiyle test edilecek. Başlangıç hipotezi:

- Free: sınırlı vaka + tanı testi
- Sprint: 7 veya 14 günlük sınav kampı, otomatik yenilenmez
- Core: HMGS Arena + Case Studio
- Studio: Dilekçe Lab + duruşma pratiği + gelişmiş AI feedback

Haftalık plan ana gelir modeli olmayacak. Sınav öncesi kampanya ürünü olacak. Aylık/yıllık plan ana gelir modeli olarak kurulacak.

## 14. İlk 30 günlük üretim planı

### Hafta 1

- marka ve domain kontrolü
- landing sayfası wireframe
- repo açılışı
- Supabase proje kurulumu
- ilk case schema taslağı
- ilk rubrik schema taslağı

### Hafta 2

- Case Studio ekran prototipi
- kullanıcı onboarding akışı
- ilk 3 iş hukuku case taslağı
- kaynak veri klasörü
- structured output denemesi

### Hafta 3

- AI feedback endpoint
- rubrik puanlama ekranı
- admin içerik girişi için basit panel
- eval test seti
- 5–10 hukuk öğrencisiyle kullanılabilirlik testi

### Hafta 4

- waitlist landing yayını
- ilk kapalı beta
- fiyat algısı anketi
- ödeme altyapısı seçimi
- ilk metrik paneli

## 15. İlk başarı metrikleri

MVP başarı metrikleri:

- landing conversion: ziyaretçi → waitlist
- activation: kayıt → ilk case tamamlama
- completion: başlayan case → tamamlanan case
- feedback usefulness: kullanıcı puanı
- repeat usage: 7 gün içinde ikinci case
- willingness to pay: ücretli beta ilgisi
- model reliability: eval test başarı oranı

İlk hedefler:

- %20+ waitlist conversion
- %60+ ilk case tamamlama
- %30+ ikinci case dönüşü
- 20 kullanıcıdan en az 5’inin ücretli beta için ödeme niyeti göstermesi

## 16. Şimdilik ertelenecek işler

- ayrı hâkim/savcı uygulaması
- tam 25 hukuk dalı kapsamı
- mobil uygulama
- voice-first duruşma simülasyonu
- gerçek dilekçe otomatik üretimi
- B2B fakülte/baro satışı
- büyük ölçekli içtihat scraping

Bu işler ürün doğrulaması sonrası açılacak.

## 17. Hemen üretilecek ilk ekranlar

1. Landing page
2. Onboarding
3. Dashboard
4. Case Studio
5. Feedback / Rubrik skoru
6. Progress / Karne
7. Admin case editor

## 18. İlk case tasarım brief’i

Case adı: **İşten çıkarılan satış temsilcisi**

Kısa olay: Kullanıcı, işten çıkarıldığını söyleyen bir satış temsilcisiyle görüşür. Müvekkil sözleşmesinin belirsiz süreli olduğunu, son üç ayda fazla mesai yaptığını, işverenin yazılı fesih bildirimi vermediğini ve arabulucuya henüz gitmediğini söyler. Kullanıcı doğru soruları sorarak süreleri, delilleri, dava yolunu ve talepleri belirlemelidir.

Öğrenme hedefleri:

- fesih tarihinin önemini kavrama
- zorunlu arabuluculuk şartını tespit etme
- görevli mahkemeyi belirleme
- işe iade ve alacak taleplerini ayırma
- delil ihtiyacını görme
- dilekçede talep sonucunu doğru kurma

Başarısızlık yolları:

- arabuluculuğu atlamak
- süreleri sormamak
- yanlış mahkemeye yönelmek
- tüm talepleri tek ve belirsiz şekilde istemek
- delil listesi oluşturmamak

Başarı çıktısı:

Kullanıcı, müvekkilden eksik bilgileri alır, arabuluculuk şartını ve süreleri doğru kurar, talep türlerini ayırır ve kısa bir dava stratejisi yazar.

