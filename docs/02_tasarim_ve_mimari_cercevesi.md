# LawKit — Tasarım ve Mimari Çerçevesi v0.1

Bu doküman, blueprint v0.1'in üzerine oturur. Ürün kararları, fiyatlandırma ve pazar analizi orada sabittir. Burada üç şey tanımlanır: (1) ürünün hangi öğrenme bilimine dayandığı, (2) sistemin katmanlarının ne yaptığı ve birbirine nasıl bağlandığı, (3) tasarım dilinin kuralları ve aşamalı kurulum sırası.

Doküman bilimsel referansları açıkça verir; her tasarım veya mimari karar için ya bir kaynak ya da somut bir gerekçe gösterir. Spekülatif kısımlar "hipotez" olarak işaretlidir.

---

## 1. Pedagojik temel

LawKit'in çekirdek tezi yeni değil: hukuk pratiği, soyut kuralın somut olaya uygulanmasıyla öğrenilir. Bu tez, Harvard Business School'un 1920'lerde başlattığı vaka yönteminin (Garvin, 2003) ve McMaster Tıp Fakültesi'nin 1969'da kurumsallaştırdığı Problem-Based Learning (PBL) çerçevesinin (Barrows & Tamblyn, 1980) hukuk eğitimine uygulanmış halidir. LawKit bu iki geleneği üç ek mekanizmayla genişletir: retrieval practice, branching simulation ve rubric tabanlı formatif değerlendirme.

**Vaka temelli öğrenme (CBL).** Vaka, öğrencinin hem bilgi toplamak hem de karar vermek zorunda kaldığı, sonuçları olan bir olay örgüsüdür. CBL'nin pasif okuma veya video tüketimine kıyasla muhakeme ve transfer performansını anlamlı biçimde artırdığı çoklu meta-analizlerde gösterilmiştir (Thistlethwaite et al., 2012, BEME Guide No. 23). Hukukta klinik eğitim literatürü (MacCrate Report, 1992; Carnegie Report — Sullivan et al., 2007) aynı boşluğa işaret eder: teori-pratik açığı.

**Bilişsel yük yönetimi.** Sweller'in (1988, 1994) Cognitive Load Theory'si üç yük tipini ayırır: intrinsic (görevin doğal karmaşıklığı), extraneous (kötü tasarımdan gelen gürültü), germane (şema inşasına ayrılan zihinsel kaynak). LawKit'in tasarım kararları extraneous yükü minimize etmeyi, intrinsic yükü ise scaffold ile aşamalı açmayı hedefler. "Worked example effect" (Sweller & Cooper, 1985) bu çerçevede ideal cevap ekranını gerekçelendirir: öğrenci kendi cevabını verdikten sonra ideal çözümü görür; bu sıra hem retrieval hem worked example faydasını korur.

**Aralıklı tekrar ve retrieval practice.** Ebbinghaus'un (1885) unutma eğrisi ve Roediger & Karpicke'nin (2006) test etkisi çalışmaları, kalıcı öğrenmenin pasif tekrar değil aktif geri çağırma ile inşa edildiğini gösterir. Cepeda et al. (2008) optimal aralık aralıklarını ampirik olarak haritalamıştır. HMGS Arena'nın "zayıf konu" mekanizması bu literatürün uygulamasıdır: yanlış cevaplanmış konu artan aralıklarla yeniden gündeme gelir.

**Mastery learning ve formatif değerlendirme.** Bloom'un (1968) Mastery Learning modeli ve Black & Wiliam'ın (1998) formatif değerlendirme meta-analizi, ilerlemenin tek kerelik özetsel sınavla değil küçük, sık ve düzeltilebilir geri bildirim döngüleriyle sağlandığını gösterir. Rubrik sistemi bu modeli operasyonel hale getirir.

**Rubric tasarımı.** Rubrik boyutları Bloom'un revize edilmiş bilişsel taksonomisi (Anderson & Krathwohl, 2001) ile AAC&U VALUE rubric ailesinin yapısına dayanır: her boyut bağımsız ölçülür, her seviye davranışsal olarak tanımlanır. Blueprint'teki yedi boyut (olayı anlama, mesele tespiti, usul, maddi hukuk, gerekçelendirme, risk farkındalığı, ifade) bu literatürle uyumludur; eklenmesi gereken tek standart, her seviyenin gözlemlenebilir davranışla tanımlanmasıdır (Brookhart, 2013).

**Branching scenarios.** Cathy Moore'un (2017) Action Mapping çerçevesi, eğitim simülasyonlarının doğru tasarım birimini "öğrencinin yapacağı karar" olarak tanımlar — bilgi parçası değil. Her karar dalı bir öğrenme hedefine bağlanır; her dal sonucu hedefe ne kadar yakın taşıdığına göre puanlanır. LawKit'in case-engine'i bu modele göre kurulur.

**Gamification — kalibreli kullanım.** Hamari, Koivisto & Sarsa'nın (2014) meta-analizi gamification'ın motivasyona etkisinin pozitif ama bağlama duyarlı olduğunu, yanlış uygulamanın içsel motivasyonu zayıflatabileceğini (overjustification effect — Deci, 1971) gösterir. Self-Determination Theory (Deci & Ryan, 2000) üç ihtiyaç üzerinden kurar: özerklik (autonomy), yetkinlik (competence), ilişkililik (relatedness). LawKit'in gamification katmanı puan-rozet-leaderboard maksimizasyonu değil, bu üç ihtiyacı destekleyen sade mekanizmalar olarak kurulur (bkz. §4).

**Flow ve zorluk kalibrasyonu.** Csikszentmihalyi'nin (1990) flow modeli, beceri ve meydan okuma dengesini tarif eder. Adaptif zorluk seçimi (case zorluğunu kullanıcının son rubrik ortalamasına göre seçmek) bu modele dayanır.

**Cognitive apprenticeship.** Collins, Brown & Newman'ın (1989) modeli — modeling, coaching, scaffolding, articulation, reflection, exploration — uzman avukatın bilişsel sürecinin nasıl görünür kılınacağını tarif eder. Grounded explanation ve ideal answer ekranları bu modelin "modeling" ve "articulation" basamaklarıdır.

---

## 2. Katmanlı mimari

Sistem yedi katmana ayrılır. Her katman tek sorumluluk taşır, üst katmana tanımlı bir arayüzle bilgi verir ve alt katmanı doğrudan çağırmadan kullanır. Bu ayrım hem ekibin küçük kalmasına, hem hukuki içerik değişikliğinin koda dokunmadan yayınlanmasına izin verir.

**L1 — Pedagoji katmanı.** Kodda değildir. Rubric şeması, öğrenme hedefi taksonomisi, zorluk dereceleri ve geri bildirim taksonomisi burada tanımlanır. Diğer her katman bu katmanın tanımlarına göre çalışır. Ürün ekibinin "ne ölçüyoruz, neden ölçüyoruz" sorusu bu katmandadır.

**L2 — İçerik katmanı.** Vakalar, kaynaklar (kanun, içtihat, doktrin alıntıları), ideal cevaplar ve eval test setleri. JSON/YAML olarak versiyonlanır, hukukçu onayından geçer, ai_eval_tests.json ile birlikte yayınlanır. Kod tarafı bu katmanı bir "veri kaynağı" olarak okur; içerik değiştiğinde uygulama yeniden derlenmez. Repo'da `content/` dizinidir.

**L3 — Case engine.** Vaka durumunu yöneten state machine. Her vaka bir directed acyclic graph'tır: düğümler "olay anı / karar noktası / cevap / geri bildirim", kenarlar geçiş kuralları. Engine üç şeyden sorumludur: hangi düğümdeyiz, kullanıcıdan gelen aksiyona göre hangi düğüme geçeriz, mevcut rubrik ilerlemesi nedir. Engine LLM'i çağırmaz; karar verir ve LLM'i kim çağıracaksa ona iş paketi verir.

**L4 — AI orchestration.** Üç ayrık rol: grounded explanation (kaynağa bağlı açıklama), role-play (müvekkil/hâkim/karşı vekil simülasyonu), assessment (rubrik tabanlı puanlama). Her rol ayrı prompt, ayrı sıcaklık, ayrı çıktı şeması. Asla tek prompt değildir. Agentic RAG çerçevesi içinde (raporlarda Librarian / Auditor / Strategist / Red Team olarak tarif edilen) mikro-ajanlar bu katmanda yaşar. Çıktı her zaman structured JSON; serbest metin yalnızca öğrenciye gösterilen açıklayıcı alanlardadır ve bu alanlar yapılandırılmış zarfın *içindedir*.

**L5 — Uygulama katmanı.** Web uygulaması (Next.js + TypeScript), admin paneli, ödeme entegrasyonu, kullanıcı oturumu. Bu katman case-engine'i bir kütüphane gibi kullanır; içeriği L2'den çeker; AI çağrılarını L4 üzerinden yapar.

**L6 — Tasarım katmanı.** Token + bileşen + örüntü hiyerarşisi (bkz. §3). Tek bir tasarım sistemi paketi (`packages/ui`) tüm yüzeylerin (öğrenci, admin, pazarlama) görünümünü belirler.

**L7 — Veri ve güvenlik katmanı.** Postgres (Supabase), pgvector, signed URL storage, RLS politikaları, KVKK uyum mekanizmaları (maskeleme, silme, saklama süresi), audit log. KVKK Üretken Yapay Zeka Rehberi'nin (KVKK, 2024) öngördüğü "tasarımdan itibaren mahremiyet" ilkesi bu katmanın varsayılanıdır: gerçek kişi verisi varsayılan olarak modele gönderilmez, kullanıcı yüklemesi maskelenir, model çıktısı versiyonlanır.

Katmanlar arası bağımlılık tek yönlüdür: L5 → L3 → L2; L5 → L4 → L2; L4'ün L3'e doğrudan erişimi yoktur, engine ne istediğini söyler, AI ne aldıysa onu döner. Bu sıkı ayrım, halüsinasyon yüzeyinin engine state machine'ine sızmasını engeller.

---

## 3. Tasarım sistemi

Hedef: "akademik ciddiyet" ile "uygulanabilir motivasyon" aynı anda hissedilecek. Referans çıpaları Linear ve Notion'un sadeliği, Stripe Docs'un tipografik netliği, Duolingo'nun aşamalı ilerleme hissi — ama Duolingo'nun parlak renk-ses-rozet yoğunluğu olmadan. Hukuk öğrencisi/stajyer kullanıcı için aşırı oyunlaştırma profesyonelliği zedeler; ciddiyet ise tek başına motivasyonu yormaz. İki ucun ortasında kalmak için aşağıdaki kurallar konur.

### 3.1 Tasarım ilkeleri

Birinci ilke: **bilişsel ekonomi**. Her ekran tek bir asli karar veya tek bir asli mesaj taşır. Sweller'in extraneous load tanımıyla uyumlu: dekoratif animasyon, çoklu CTA, gereksiz renk kullanımı kaldırılır.

İkinci ilke: **kalibreli oyun hissi**. Gamification öğeleri yalnızca SDT'nin üç ihtiyacını destekleyen yerlerde belirir. İlerleme çubuğu (competence), kullanıcı kontrolündeki vaka seçimi (autonomy), karne paylaşılabilirliği (relatedness, opsiyonel). Puan-rozet enflasyonu yok; her gamification öğesi bir öğrenme hedefine bağlı.

Üçüncü ilke: **hukuk diline saygı**. Tipografi ve dil tonu, "edutainment" değil, "ciddi pratik" hissi vermeli. Madde numarası, içtihat referansı, dilekçe alıntısı tipografik olarak ayırt edilebilir ve kopyalanabilir olmalı. Mahkeme, kanun, hakim gibi kelimeler dekoratif amaçla küçültülmemeli.

Dördüncü ilke: **dürüst geri bildirim**. "Aferin, harika!" yerine rubrik üzerinden somut puan ve hangi boyutta neyin eksik kaldığı. Sahte motivasyon yerine ölçülmüş ilerleme.

### 3.2 Renk sistemi

Renk paleti üç fonksiyonel role bölünür. Her rolün koyu ve açık tema değişkeni vardır; WCAG AA kontrastı (4.5:1 metin için, 3:1 büyük metin/ikon için) zorunlu eşiktir.

**Surface** — arayüzün taşıyıcı renkleri (arka plan, panel, kart). Soğuk, doygunluğu düşük, neredeyse nötr. Beyaza tam beyaz kullanılmaz; göz yorgunluğunu azaltmak için hafif soğuk gri (örn. #FAFAFB). Koyu tema için iki kademe (yüzey ve yükseltilmiş yüzey) ayrı tanımlanır.

**Ink** — metin ve simge renkleri. Üç kademe: birincil (en yoğun, başlık ve önemli metin), ikincil (paragraf), üçüncül (yardımcı, ipucu, meta).

**Signal** — anlamsal renkler. Dört rol: olumlu (doğru karar, rubrikte 3-4 puan), uyarı (kısmen doğru, eksik), kritik (yanlış, kaçırılan zorunlu mesele), bilgi (kaynak referansı, ipucu). Sinyal renkleri parlak değil, "olgun" bir doygunluktadır; kırmızı kanlı kırmızı değil, doygunluğu düşürülmüş bir terra; yeşil neon değil, koyu çam tonu.

**Vurgu (accent)** — markaya ait tek renk. Diğer renklerden farklı, ama yerleşim yoğunluğu düşük tutulur (yalnızca aktif/seçili durumlar, ilerleme dolusu, ana CTA). Hipotez: lacivert-ötesi (deep indigo) ve sıcak kehribar (amber) ikilisi, hukuk markalarının yaygın "lacivert + altın" çağrışımını günceller ve ciddiyet-canlılık dengesini kurar. Kesin token değerleri Stage 1 tasarım sprintinde renk kontrast testiyle dondurulur.

### 3.3 Tipografi

İki yazı ailesi yeterlidir. Birincisi bir sans-serif (UI metni, başlık) — örneğin Inter veya benzeri yüksek x-height, modern grotesk. İkincisi bir serif (hukuki metin alıntısı, dilekçe örneği, içtihat) — örneğin Source Serif veya Lora. Serifin işlevi dekoratif değil; hukuki metinleri arayüz metninden ayırarak okuyucuya "şimdi alıntı okuyorsun" sinyali vermek.

Ölçek: dört adım yeterli — caption (12), body (14-15), subhead (18-20), display (28-36). Satır yüksekliği body için 1.55; başlıklar için 1.2. Uzun hukuki pasajlarda satır uzunluğu 65-75 karakterle sınırlı.

### 3.4 Boşluk, köşe, gölge

Boşluk sistemi 4'ün katları üzerine kurulur (4, 8, 12, 16, 24, 32, 48). Köşe yumuşaklığı orta — küçük öğelerde 6-8px, kartlarda 12px, modallarda 16px; tam yuvarlak yalnızca rozet veya avatar. Gölgeler düşük yoğunluklu, çok katmanlı (1px iç çizgi + 8-12px yumuşak dış). Aşırı yuvarlak veya neumorphic stil kullanılmaz — bu stiller "edutainment" çağrışımı yapar.

### 3.5 Hareket

Hareket fonksiyonel olmalı, dekoratif değil. Üç tipik hareket: durum geçişi (150-200ms ease-out), ilerleme animasyonu (rubrik puanı dolması, 400-600ms cubic-bezier), dikkat çağrısı (yeni karar düğümü açıldığında hafif kayma + opaklık geçişi). Confetti, aşırı bounce, parlama gibi efektler yok. WCAG'ın prefers-reduced-motion direktifi her hareket için saygılanır.

### 3.6 Bileşen hiyerarşisi

Beş katmandan oluşur. **Token** (renk, ölçek, hareket sabitleri) → **Primitive** (button, input, badge, separator) → **Composite** (CaseCard, RubricMeter, SourceCallout, FeedbackPanel) → **Pattern** (case-screen üçlü layout, feedback flow, onboarding adımları) → **Page** (Landing, Dashboard, Case Studio, Karne, Admin Editor). Bu hiyerarşi `packages/ui` paketinde aynı klasör yapısına yansır.

---

## 4. Etkileşim ve gamification katmanı

Her gamification mekanizması bir bilimsel ya da işlevsel gerekçeye bağlanır. Gerekçesiz mekanizma eklenmez.

**Rubrik göstergeleri.** Her vaka adımında ekranın sağ kenarında yedi rubrik boyutunun küçük bar göstergesi. Henüz değerlendirilmemiş boyut gri, kazanılmış puan aksent rengiyle dolar. Gerekçe: SDT'nin competence ihtiyacı ve formatif geri bildirim. Anti-pattern: toplam puan göstergesini "score" diye büyütmek — bu rubrik boyut bilgisini ezer.

**Vaka tamamlama yüzdesi.** Karne ekranında konu bazlı tamamlama. Sayısal yüzde değil, "kavradığın", "pratiği derinleştir", "henüz başlamadı" şeklinde üç kademeli görsel etiket. Gerekçe: yüzdenin yarattığı "yarış" hissi, hukukta yanlış sinyaldir; mastery seviyesi göstergesi (Bloom) doğru sinyaldir.

**Çalışma serisi (streak).** Günlük çalışma serisi sayacı, ancak günlük zorunluluk dayatmadan. Pazar günü "dinlenme günü", iki günlük boşluk "güvenli ara" olarak etiketlenir. Gerekçe: streak retention etkisi (Habit literature: Lally et al., 2010) ama overjustification ve anksiyete riskine karşı yumuşatma.

**Sertifika ve karne.** Tamamlanan vaka kümeleri öğrencinin paylaşılabilir karnesine eklenir. Karne LinkedIn'e ve staj başvurusuna kanıt olarak gider. Gerekçe: relatedness (SDT) + dış motivasyon olarak portföy değeri (raporlarda viral loop olarak işaretlendi).

**Leaderboard yok.** İlk sürümde sıralama tablosu açılmaz. Gerekçe: rekabet bazlı motivasyon hukukta yanlış teşvik kurabilir (yanıt hızını yanıt kalitesinden önemli kılma riski). Hipotez olarak kalsın; ileride yalnızca "haftalık vaka challenge" formatında, kalite metriğine bağlı şekilde değerlendirilebilir.

**Hata kataloğu.** Karnede "en sık yaptığım hata" listesi. Olumsuz bilgi olduğu için yargılayıcı dille değil tanı dili ile sunulur ("bu vakada arabuluculuk şartı kaçırıldı; benzer üç vakada da aynı kalıp gözlendi"). Gerekçe: metacognitive awareness (Flavell, 1979) — kendi hata örüntüsünü görme, transfer öğrenmeyi artırır.

---

## 5. Ekran envanteri ve case-screen örüntüsü

Blueprint zaten yedi başlangıç ekranını listeler. Burada case-screen'in iç düzeni netleştirilir, çünkü ürünün öğrenme yükünün %70'i bu ekrandadır.

**Üçlü kolon düzeni.** Sol kolon (28% genişlik): olay dosyası, taraflar, zaman çizelgesi, mevcut belgeler. Statik referans alanı; öğrenci her an buraya dönüp olayı yeniden okuyabilir. Orta kolon (44%): aktif diyalog veya karar noktası. Bir anda tek mikro-görev. Sağ kolon (28%): görev listesi (bu vakada hangi adımlar var), aktif rubrik göstergesi, ipucu açma butonu, zamanlayıcı (opsiyonel).

İpucu sistemi üç kademe: yumuşak yönlendirme ("Bu noktada hangi sürelerin işlemekte olduğunu hatırla"), spesifik işaret ("İş Kanunu m. 20 çerçevesinde dava süresi nedir?"), tam açıklama (worked example). Kademe açma kullanıcıya ait — bu autonomy (SDT) ihtiyacını destekler. Açılan kademenin rubrik üzerindeki maliyeti var: tam açıklama açıldıysa "Hukuki Mesele Tespiti" boyutunda ceiling 3'e düşer. Bu Vygotsky'nin Zone of Proximal Development modeline (1978) ve scaffolding fading (Pea, 2004) ilkesine uygun çalışır.

**Feedback ekranı.** Vaka tamamlandığında tek ekran: üstte rubrik özet bar grafiği, ortada "kaçırılan zorunlu meseleler" listesi, altta worked example olarak ideal cevap. Hukuki kaynak referansları açılır panel arkasında; öğrenci kendi cevabını okurken kaynak adından maddenin tam metnine geçebilir. Feedback ekranı asla "yanlış" diye başlamaz; "bu vakada şu boyutta X puan aldın, şu mesele kaçırıldı, ideal cevap şu nedenle daha güçlü" sırası uygulanır.

---

## 6. Aşamalı yol haritası

Blueprint'in 30 günlük plan tablosu süreyi tarif eder; bu bölüm her aşamanın *çıktısını* tarif eder. Her aşama bittiğinde elde test edilebilir somut bir şey olur.

**Aşama 0 — Temel.** Repo, marka, alan adı, ödeme sağlayıcı evrakları, KVKK aydınlatma metni, mesafeli satış sözleşmesi, içerik stil rehberi, bu dokümanın v1'i. Çıktı: belgesel zemin ve organizasyon hesapları.

**Aşama 1 — Şema ve engine.** Case JSON şeması, rubric şeması, source şeması; case-engine paketi (state machine + transition validator); tek bir oyuncak vaka ile end-to-end test. AI yok, UI yok; sadece engine + içerik şeması. Çıktı: `npm run play case=is_hukuku_001` terminalden çalışıp vaka adımlarını gezdirir.

**Aşama 2 — Tasarım sistemi sürümü.** Tokens dondurulur, primitive ve composite bileşenler kurulur, Storybook ile incelemeye açılır, kontrast ve klavye erişilebilirliği denetlenir. Çıktı: `packages/ui` paketinde 25-30 stabil bileşen, Storybook canlı.

**Aşama 3 — Dikey MVP.** Tek hukuk dalı (İş Hukuku — blueprint kararı), üç vaka, HMGS Arena'nın iş hukuku alt küme test deneyimi, dilekçe lab'ın temel sürümü, karne ekranı, ödeme. AI orchestration grounded explanation ve assessment için canlı. Çıktı: 20-30 öğrenciyle kapalı beta.

**Aşama 4 — Geri bildirim ve iyileştirme.** Beta verisinden: hangi adımda öğrenci kaybediyor, hangi rubrik boyutu sürekli düşük, hangi vaka çok zor / çok kolay. Engine threshold'ları ve case zorluk parametreleri yeniden ayarlanır. Eval test seti büyür. Çıktı: ölçülmüş "kullanıcı sahip olunca neyi değiştirdik" raporu.

**Aşama 5 — Genişleme dikey.** İş Hukuku üzerine borçlar genel hükümler, medeni usul, arabuluculuk daha derin işlenir. Vaka sayısı 10-15'e çıkar. HMGS Arena'da bu dört alanın tanı testi tamamlanır.

**Aşama 6 — Dilekçe lab tam sürümü.** Yapılandırılmış parça parça dilekçe → her parça için rubrik puanı → kümülatif dilekçe kalite skoru. Karneye dilekçe portföyü eklenir.

**Aşama 7 — Ölçek.** Halen tek uygulama. HMGS'nin geniş içerik kapsama planı, branş akademisi modülü, B2B fakülte/baro lisans değerlendirmesi. Bu aşamaya geçiş kararı kullanıcı verisiyle alınır — blueprint §16'da listelenen "ertelenmiş işler" buradan açılır.

Her aşama sonunda bir "go / iterate / kill" kapısı vardır. Kapıyı geçemeyen aşama tekrarlanır; uydurma metriklerle ileri gidilmez.

---

## 7. Kalite, doğrulama ve halüsinasyon kontrolü

Hukukta AI hatasının kullanıcı maliyeti yüksek olduğundan, kalite katmanı opsiyonel değil, ürünün omurgasıdır.

**İçerik onayı.** Her vaka yayınlanmadan önce: (a) yazar uzman; (b) hukukçu inceleyici (ayrı kişi); (c) eval test setine eklenen 8-12 senaryo. Eval seti, AI çıktısının kabul edilebilir varyasyon aralığında kalıp kalmadığını otomatik denetler.

**AI çıktı kuralları.** Tüm çıktılar JSON şemaya zorlanır (OpenAI Structured Outputs veya muadili). Şema dışı çıktı reddedilir. Açıklayıcı serbest metin alanları yalnızca kaynak referansını içerebilir; uydurulmuş kanun maddesi veya içtihat tespit edilirse o çıktı kullanıcıya gösterilmeden geri çevrilir (Auditor ajanı bu denetimi yapar).

**Kaynak topraklaması.** Grounded explanation katmanı yalnızca veritabanında kayıtlı, hukukçu onaylı kaynak parçalarını kullanır. Kaynak yoksa cevap "doğrulanmış kaynak bulunamadı" der; uydurma yapmaz.

**Maskeleme.** Kullanıcı bir dosya yüklerse PII (isim, TC kimlik, telefon, adres, e-posta, müvekkil dosya numarası) sunucu tarafında maskelenmeden modele gitmez. KVKK Üretken Yapay Zeka Rehberi (2024) doğrultusunda yurtdışı veri aktarımı şartı varsa açık metinle bildirilir.

**Uyarı görünürlüğü.** Her AI çıktısının altında küçük ama okunaklı bir satır: "Eğitim amaçlı simülasyon. Gerçek hukuki tavsiye değildir." Görünürlüğü pazarlama değil, sorumluluk gerekçesidir.

---

## 8. Açık sorular ve hipotezler

Bu çerçeveyi gerçek kullanıcıya çarptırmadan önce iki-üç şey hâlâ bilinmiyor.

Hipotez 1 — accent renk seçimi (deep indigo + amber): test edilmedi. Erken kullanıcı görüşmesinde üç palet varyasyonunun A/B preference testi yapılır.

Hipotez 2 — vaka süresi: blueprint 10 dakikalık tanı vakası varsayıyor. Tam vaka süresi 25-40 dakika aralığında olabilir. Bilişsel yük açısından 25 dakika üstü oturumlar yorgunluk riskini taşır (Sweller'in working memory limitleri); pilot ölçülecek.

Hipotez 3 — rubrik boyut sayısı 7: deneysel olarak çok olabilir. Brookhart (2013) 4-6 boyutu önerir. İlk pilotta tüm 7 boyut puanlanır, ama öğrenciye ekranda yalnızca 4-5 boyut gösterilebilir; arka planda kalanlar admin paneli için kalır.

Bilinmeyen 1 — yerel ödeme sağlayıcısı seçimi (iyzico vs PayTR) yalnızca operasyonel evraklar açıldıktan sonra netleşir; teknik karar değil ticari karar.

Bilinmeyen 2 — Türk hukuk içtihat verisinin tam ve yasal toplu erişimi sınırlıdır. Eğitim amaçlı alıntı kullanım sınırı, içerik üretim ekibinin hukukçu danışmanıyla netleştirilmelidir.

---

## 9. Bu dokümanın yaşam döngüsü

Bu doküman v0.1. Her aşama sonunda revize edilir. Değişiklikler `docs/adr/` altında ADR (architecture decision record) olarak versiyonlanır. Doküman, blueprint ile çelişirse blueprint'in ürün kararları öncelikli kabul edilir; çelişki bu dokümanda not edilip blueprint güncellenir.
