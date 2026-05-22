import type { LegalCase } from "../types";

/**
 * medeni_002 — Derin Medeni Hukuk vakası.
 *
 * Komşuluk hukuku — apartman içinde işyeri açan kuru temizlemeci.
 * Müvekkilin uyku düzeni bozuldu, sağlık sorunları başladı. KMK + TMK m.
 * 737 + tazminat birleşik talep.
 *
 * 3 perde: olgu toplama + delil zinciri kurma → dilekçe ve görevli mahkeme
 * stratejisi → duruşmada bilirkişi raporu + ihtiyati tedbir tartışması.
 */
export const medeni002: LegalCase = {
  id: "medeni_002",
  title: "Komşuluk hukuku — apartman içi işyeri ve sağlık zararı",
  branch: "medeni",
  difficulty: 3,
  estimatedMinutes: 20,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil Fatma Hanım 12 yıldır oturduğu apartmanın yan dairesine taşınan kuru temizlemecinin gürültü ve kimyasal kokusundan etkileniyor. Uykusuzluk + nefes problemi + ihtar süreci 8 ay sürdü, sonuç yok. Senin işin: delil zinciri kurmak, doğru mahkemeyi seçmek, duruşmada bilirkişi raporu tartışmasına hazır olmak.",
  facts: [
    {
      text: "Müvekkilin adı Fatma Hanım, emekli öğretmen.",
      category: "Müvekkil",
    },
    {
      text: "Apartman içinde kuru temizleme dükkânının çalışmasından şikayet var.",
      category: "Anlaşmazlık",
    },
    // Gizli olgular
    {
      text: "Fatma Hanım 2014'ten beri apartmanın 1. katında oturuyor (12 yıl).",
      category: "Oturma süresi",
      hidden: true,
      revealKeywords: ["kaç yıl", "ne zaman", "tarih", "süre", "oturma"],
      revealAfterNode: "n1",
    },
    {
      text: "İşyeri 8 ay önce açıldı (08.2025), belediye ruhsatı işyeri kategorisinde.",
      category: "Açılış",
      hidden: true,
      revealKeywords: ["ne zaman", "açıldı", "ruhsat", "belediye"],
      revealAfterNode: "n1",
    },
    {
      text: "Makineler 06:00-24:00 arası çalışıyor, gece titreşim sürüyor.",
      category: "Gürültü",
      hidden: true,
      revealKeywords: ["gürültü", "ses", "saat", "ne zaman çalışıyor", "titreşim"],
      revealAfterNode: "n1",
    },
    {
      text: "Yönetim planında zemin + 1. kat MESKEN olarak kayıtlı — işyerine dönüşüm yönetim planı aykırılığı.",
      category: "Yönetim planı",
      hidden: true,
      revealKeywords: ["yönetim planı", "tapu", "mesken", "ne yazıyor", "izin"],
      revealAfterNode: "n1",
    },
    {
      text: "Fatma Hanım'da nefes darlığı + uyku bozukluğu — doktor raporu var (03.2026).",
      category: "Sağlık zararı",
      hidden: true,
      revealKeywords: ["sağlık", "hasta", "doktor", "rapor", "etki"],
      revealAfterNode: "n1",
    },
    {
      text: "3 yazılı uyarı + 2 noter ihtarı çekildi — yönetim ve esnaf hiç tepki vermedi.",
      category: "Ön süreç",
      hidden: true,
      revealKeywords: ["ihtar", "uyarı", "ne yaptın", "yöneticiye", "noter"],
      revealAfterNode: "n1",
    },
    {
      text: "Daire değer kaybı: emlakçı 'satılır ama bu komşulukla %25 düşük' diyor.",
      category: "Maddi zarar",
      hidden: true,
      revealKeywords: ["değer", "fiyat", "satış", "emlak", "tazminat"],
      revealAfterNode: "n1",
    },
  ],
  documents: [
    { label: "Apartman yönetim planı", ref: "Tapu Sicil · 2010 onaylı, mesken" },
    { label: "Belediye işyeri ruhsatı", ref: "08.2025 · komşu daire" },
    { label: "Doktor raporu", ref: "03.2026 · nefes darlığı + uyku bozukluğu" },
    { label: "Noter ihtarnameleri", ref: "2 adet · 03.2026 ve 06.2026" },
  ],
  acts: [
    { number: 1, title: "Olgu ve Delil", setting: "Avukatlık ofisi" },
    { number: 2, title: "Strateji ve Dilekçe", setting: "Mahkeme seçimi" },
    { number: 3, title: "Duruşma", setting: "Sulh Hukuk Mahkemesi" },
  ],
  cast: [
    {
      id: "fatma",
      role: "muvekkil",
      name: "Fatma Hanım",
      archetype: "Emekli öğretmen · 12 yıl bu evde",
      initials: "FH",
    },
    {
      id: "patron",
      role: "staj_patron",
      name: "Av. Tülin Demir",
      archetype: "Kıdemli avukat · senin patron",
      initials: "TD",
    },
    {
      id: "hakim",
      role: "hakim",
      name: "Hâkim Polat",
      archetype: "Sulh Hukuk · 18 yıl deneyimli",
      initials: "HP",
    },
    {
      id: "karsi",
      role: "karsi_vekil",
      name: "Av. Burak Karaca",
      archetype: "İşletmecinin vekili · usul taktiklere açık",
      initials: "BK",
    },
  ],
  intro: {
    setting: "Çarşamba sabahı. Fatma Hanım dosyalarını koltuk altında getirmiş, gözleri uykusuz.",
    beats: [
      {
        speakerId: "fatma",
        text: "Avukat hanım, son bir yıl evimde huzur kalmadı. Yan dairemize bir kuru temizleme açıldı. Makineler gece bile uğulduyor, kimyasal koku içime giriyor. Doktor 'nefes darlığı' dedi.",
      },
      {
        speakerId: "fatma",
        text: "Yöneticiye söyledim, ihtar çektim, belediyeye başvurdum. Hepsi 'ruhsatı var' diyor, sus pus oluyor. Ev evim olmaktan çıktı, satmayı bile düşünüyorum. Bir hakkım yok mu?",
      },
      {
        speakerId: "patron",
        text: "Komşuluk hakkı belediyenin ruhsatından bağımsızdır. Sen önce olguları topla; özellikle 'objektif rahatsızlık eşiği'ni ispat edecek delil zinciri en kritik tarafımız. Hadi başla.",
      },
    ],
  },
  startNode: "n1",
  nodes: [
    // ───────── PERDE I — Olgu ve Delil ─────────
    {
      id: "n1",
      kind: "client_chat",
      act: 1,
      speaker: "muvekkil",
      speakerId: "fatma",
      sceneCharacters: ["patron"],
      scene: "Fatma Hanım dosyasını masaya bıraktı: 'Ne öğrenmek isterseniz sorun.'",
      prompt:
        "Sorun avukat hanım. Yaşadıklarımı hatırlamaya çalışırım — ne lazımsa söyleyeyim.",
      clientChat: {
        maxTurns: 5,
        personaBrief:
          "Fatma Hanım 64 yaşında, emekli öğretmen. Hukuk bilgisi yok ama olguları detaylı hatırlıyor. Sağlık şikayetlerini doktor raporuyla destekleyebilir. Spesifik sorulursa tarih + yer + olay verir. Yönetim planı + tapu kaydı detayını sadece sorulursa söyler. Apartman değer kaybı kaygısı var — finansal etkiyi de sorgularsa anlatır.",
        requiredFacts: ["kaç yıl", "ne zaman", "gürültü", "yönetim planı", "sağlık", "ihtar"],
        next: "n2",
      },
    },
    {
      id: "n2",
      kind: "decision",
      act: 1,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["fatma"],
      scene: "Patron defterine not aldı. Hukuki çerçeve önemli — yanlış dayanak davayı bozar.",
      prompt:
        "Müvekkil için hangi hukuki dayanak en güçlü? Bu seçim mahkeme + talepleri belirler.",
      rubricTargets: ["mesele", "maddi"],
      options: [
        {
          id: "a",
          label:
            "TMK m. 730 + m. 737 komşuluk hukuku + KMK m. 24 (yönetim planına aykırı kullanım) + tazminat. Üçlü dayanak.",
          scores: { mesele: 4, maddi: 4 },
          feedback:
            "Doğru. Komşuluk hukuku eski hâle getirme + tazminat; KMK m. 24 yönetim planı ihlali. Birlikte güçlü dayanak.",
          next: "n3",
          verdict: "good",
          sources: ["tmk_m730", "tmk_m737"],
        },
        {
          id: "b",
          label:
            "Sağlık zararı somut → TBK m. 49 haksız fiil + manevi tazminat (m. 56). Hızlı çözüm için bu yeterli.",
          scores: { mesele: 1, maddi: 1 },
          feedback:
            "Eksik. Haksız fiil tek başına eski hâle getirme + el atmanın önlenmesi taleplerini güçsüz yapar. Özel hüküm TMK m. 730/737 komşuluk hukuku önceliklidir; KMK m. 24/33 ayağı ise yönetim planı aykırılığını açar — bunlarsız sadece tazminat alırız, gürültü sürer.",
          next: "n3",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "Belediye ruhsatı işyeri olarak verilmiş; idari yargı yoluyla iptal sağlanmadan komşuluk davası açmak ön şartı eksik bırakır.",
          scores: { mesele: 0, maddi: 0 },
          feedback:
            "Yanlış. Belediye ruhsatı ve özel hukuk komşuluk hakları farklı düzlemlerdir; idari iptali beklemek zorunluluk değildir. Aksine, mahkeme komşuluk hukuku gereği gece çalışma yasağı + ruhsata rağmen koku/gürültü sınırı koyabilir.",
          next: "n3",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n3",
      kind: "open_text",
      act: 1,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["fatma"],
      scene: "Patron defterini sana uzattı: 'Delil zincirini yaz, hangi delil hangi iddiayı kanıtlar.'",
      prompt:
        "Müvekkilin için delil planını gerekçeleriyle yaz. Hangi delil hangi iddiayı destekler? Eksik delil neyse onu nasıl tamamlayacağız?",
      rubricTargets: ["maddi", "gerekce", "risk"],
      openText: {
        assessDimensions: ["maddi", "gerekce", "risk"],
        minChars: 150,
        graderHint:
          "Olması gereken: bilirkişi raporu (ses+kimyasal ölçüm), doktor raporu, yönetim planı + tapu kaydı, noter ihtarları, tanık beyanı (diğer komşular), belediye yazışmaları, emlakçı görüşü (değer kaybı). Her birinin hangi taleple bağlandığını yazmak puanı yükseltir.",
        next: "n4",
      },
    },

    // ───────── PERDE II — Strateji ve Dilekçe ─────────
    {
      id: "n4",
      kind: "decision",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: [],
      scene: "Hangi mahkeme? Bu yanlış olursa dava reddi gelir.",
      prompt:
        "Görevli mahkeme hangisi? Yanlış seçersen yetkisizlik kararı + zaman kaybı.",
      rubricTargets: ["usul"],
      options: [
        {
          id: "a",
          label:
            "Sulh Hukuk Mahkemesi — KMK m. 33 gereği kat mülkiyetinden doğan davalar.",
          scores: { usul: 4 },
          feedback:
            "Doğru. KMK m. 33 görevli mahkemeyi açıkça Sulh Hukuk olarak belirler. Yetkili: taşınmazın bulunduğu yer.",
          next: "n5",
          verdict: "good",
        },
        {
          id: "b",
          label: "Asliye Hukuk Mahkemesi — komşuluk hukuku TMK düzeyinde.",
          scores: { usul: 1 },
          feedback:
            "Eksik. KMK m. 33 özel hüküm: kat mülkiyeti uyuşmazlıklarında Sulh Hukuk görevli. Asliye'ye gidilirse görevsizlik gelir.",
          next: "n5",
          verdict: "partial",
        },
        {
          id: "c",
          label: "İdare Mahkemesi — belediye ruhsatının iptali için.",
          scores: { usul: 0 },
          feedback:
            "Yanlış. Komşular arası özel hukuk uyuşmazlığı idari yargı konusu değildir. Doğru kapı Sulh Hukuk.",
          next: "n5",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n5",
      kind: "decision",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: [],
      scene: "İhtiyati tedbir — yargılama uzun, müvekkil her gece uyuyamıyor.",
      prompt:
        "Davayla birlikte ihtiyati tedbir talep etmeli misin? Hangi gerekçeyle?",
      rubricTargets: ["usul", "risk"],
      options: [
        {
          id: "a",
          label:
            "Evet — gecikmesinde sakınca var (HMK m. 389): sağlık zararı sürüyor. Gece çalışma yasağı + kimyasal kullanım sınırı talep et.",
          scores: { usul: 4, risk: 4 },
          feedback:
            "Doğru. HMK m. 389 'gecikmesinde sakınca' eşiği sağlık + uyku bozukluğuyla rahatlıkla karşılanır.",
          next: "n6",
          verdict: "good",
        },
        {
          id: "b",
          label: "Hayır — esastan karar bekleyelim, tedbir riski çok yüksek.",
          scores: { usul: 1, risk: 0 },
          feedback:
            "Eksik. Esas yargılaması 6-12 ay sürebilir; müvekkil bu süre boyunca sağlığı bozuk kalır. Tedbir hak kaybını önler.",
          next: "n6",
          verdict: "bad",
        },
        {
          id: "c",
          label:
            "Sadece tedbir davası açalım, esas davayı sonra.",
          scores: { usul: 1, risk: 1 },
          feedback:
            "Yetersiz. İhtiyati tedbir esas davaya bağlıdır (HMK m. 390); ayrı yürüyemez. İkisi birlikte.",
          next: "n6",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n6",
      kind: "checkpoint",
      act: 2,
      checkpoint: {
        branches: [
          {
            condition: { requireDimGte: { usul: 3, maddi: 3 } },
            nodeId: "n7_open",
          },
        ],
        fallbackNodeId: "n7_warn",
      },
    },
    {
      id: "n7_warn",
      kind: "info",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["fatma"],
      scene: "Patron seni durdurdu: 'Bir saniye, dayanak hâlâ zayıf.'",
      prompt:
        "Yönetim planına bakmadan KMK m. 24 ayağını dilekçeye koyamayız. Tapu sicil çıkarma + bilirkişi atanması talebini ayrıca yazmalı. Bunu da unutma — duruşmada karşı taraf bunu sorgulayacak.",
      options: [
        {
          id: "next",
          label: "Anladım, dilekçe taslağına geçelim.",
          next: "n7_open",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n7_open",
      kind: "open_text",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: [],
      scene: "Dilekçenin 'sonuç ve istem' kısmı pazartesi sabahı sunulacak.",
      prompt:
        "Dilekçenin sonuç ve istem kısmını yaz. Her talebi yasal dayanağıyla numarala. Eksik kalan kalem tahsil edilemez.",
      rubricTargets: ["gerekce", "ifade", "risk"],
      openText: {
        assessDimensions: ["gerekce", "ifade", "risk"],
        minChars: 180,
        graderHint:
          "İdeal: 1) Feshin geçersizliği — yönetim planı + KMK m. 24, 2) El atmanın önlenmesi — TMK m. 730/737, 3) Eski hâle getirme (gece çalışma yasağı, koku ölçümü), 4) Manevi tazminat — sağlık + huzur, 5) Maddi tazminat — değer kaybı, 6) İhtiyati tedbir — HMK m. 389. Faiz başlangıcı + yargılama giderleri ayrı kalem.",
        next: "n8",
      },
    },

    // ───────── PERDE III — Duruşma ─────────
    {
      id: "n8",
      kind: "decision",
      act: 3,
      speaker: "hakim",
      speakerId: "hakim",
      sceneCharacters: ["fatma", "karsi"],
      scene:
        "Sulh Hukuk Mahkemesi. Bilirkişi raporu okundu: gürültü 65 dB (sınır 55 dB), kimyasal ölçüm pozitif. Karşı vekil söz aldı.",
      prompt:
        "Hâkim ihtiyati tedbir talebini değerlendirecek. Beyanınız nedir?",
      rubricTargets: ["risk", "gerekce"],
      options: [
        {
          id: "a",
          label:
            "Sayın hâkim, bilirkişi raporu objektif eşiği aştığımızı göstermiştir. HMK m. 389 'gecikmesinde sakınca' şartı sağlık raporuyla teyit edilmiştir; gece çalışma yasağı + kimyasal sınırlama tedbirinin derhal verilmesini talep ederiz.",
          scores: { risk: 4, gerekce: 4 },
          feedback:
            "Mükemmel. Hem usul (m. 389) hem maddi (bilirkişi + doktor raporu) ayaklar birlikte. Hâkimin direnmesi zor.",
          next: "n9",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "Tedbir talebimi tekrar ediyorum, müvekkilim mağdur.",
          scores: { risk: 2, gerekce: 1 },
          feedback:
            "Zayıf. Yasal dayanak ve somut delile referans olmadan tedbir alma şansın düşer.",
          next: "n9",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "Tedbire gerek görmüyoruz, esas yargılamayı bekleyelim.",
          scores: { risk: 0, gerekce: 0 },
          feedback:
            "Müvekkilini öldürdün. Mevcut güçlü delillerle tedbir alma fırsatı vardı, sen reddettin.",
          next: "n9",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n9",
      kind: "ai_branch",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["fatma", "hakim"],
      scene:
        "Burak Karaca ayağa kalktı: 'Sayın hâkim, bilirkişi raporu tartışmalı. Belediyenin ses ölçümü daha düşük (52 dB). Müvekkilim yıllardır işyerinde, ruhsatı geçerli. Karşı tarafın 'rahatsızlık' iddiası abartılı.' Hâkim sana döndü.",
      prompt:
        "Karşı vekilin 'belediye ölçümü düşük + ruhsat geçerli + abartılı iddia' itirazına nasıl yanıt verirsin? Cevabını gerekçeleriyle yaz.",
      aiBranch: {
        context:
          "Karşı vekil 3 ayrı argüman atıyor: 1) Belediye ölçümü < bilirkişi ölçümü (52 vs 65 dB), 2) Ruhsat geçerli, 3) İddia abartılı/subjektif. Sen şunları kullanabilirsin: bilirkişi tarafsızdır + mahkeme atadı (belediye ölçümü taraf-iyi niyetli), yönetim planı (mesken) ruhsat üstünde, doktor raporu objektif sağlık zararı + yerel adet eşiği değil ÖLÇÜLEBİLİR eşik. Strong = üçü birden çürüt; partial = sadece bir tanesini cevapla; weak = kabul et veya konu dışı.",
        branches: [
          {
            nodeId: "n10_strong",
            label: "Güçlü cevap — üç itirazın üçü de çürütüldü",
            hint: "Bilirkişi tarafsızlığı + yönetim planı üstünlüğü + objektif sağlık raporu — üçlü cevap.",
            verdict: "good",
          },
          {
            nodeId: "n10_partial",
            label: "Kısmi cevap — sadece bir iki nokta",
            hint: "Sadece bilirkişi tarafsızlığı veya sadece ruhsat-yönetim planı ayrımı — diğerini eksik bırakıyor.",
            verdict: "partial",
          },
          {
            nodeId: "n10_weak",
            label: "Zayıf cevap — usul/duygusal/savunmasız",
            hint: "Genel 'müvekkilim mağdur' tarzı veya konuyu çuvallayan cevap.",
            verdict: "bad",
          },
        ],
        fallbackNodeId: "n10_partial",
      },
    },
    {
      id: "n10_strong",
      kind: "info",
      act: 3,
      speaker: "hakim",
      speakerId: "hakim",
      sceneCharacters: ["fatma", "karsi"],
      scene: "Hâkim Polat başını onaylar gibi salladı. Burak Karaca dosyaya bakıyor.",
      prompt:
        "Meslektaşım, üç itirazı da somut delille çürüttünüz. Talepleriniz konusunda son sözünüz?",
      rubricTargets: ["risk", "ifade"],
      options: [
        {
          id: "a",
          label:
            "Sayın hâkim, ihtiyati tedbir + esas yargılamaya geçilmesini, yönetim planı çıkarılarak KMK m. 24 ayağının da incelenmesini talep ediyorum.",
          scores: { risk: 4, ifade: 4 },
          feedback:
            "Güçlü kapanış. Tedbir ve esas birlikte; KMK ayağı açıkça istendi.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "Talebimi yineliyorum sayın hâkim.",
          scores: { risk: 2, ifade: 2 },
          feedback:
            "Yeterli ama spesifik değildi — yine de pozisyon iyi.",
          next: "n11",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n10_partial",
      kind: "info",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["fatma", "hakim"],
      scene: "Burak Karaca rahatlamış görünüyor — bazı argümanları geçti.",
      prompt:
        "Sayın hâkim, meslektaşımın cevabı eksik kaldı. Yönetim planı ile ruhsat arasındaki ayrımı henüz açıklayamadı. Tedbir reddedilmelidir.",
      rubricTargets: ["risk"],
      options: [
        {
          id: "a",
          label:
            "Müsaade ederseniz tamamlıyorum sayın hâkim: Yönetim planı tapu kaydında mesken; KMK m. 24 m. 19'a göre maliklerin yönetim planını değiştirmeden işyeri amacıyla kullanması yasaktır. Ruhsat bu özel hukuk kuralını ortadan kaldırmaz.",
          scores: { risk: 3 },
          feedback:
            "Geç telafi ettin. Argüman tamamlandı.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label: "Cevabımı korurum sayın hâkim.",
          scores: { risk: 0 },
          feedback:
            "Telafi etmedin. Karşı taraf eksikliğini fark etti.",
          next: "n11",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n10_weak",
      kind: "info",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["fatma", "hakim"],
      scene: "Burak Karaca güvenli adımlarla devam etti.",
      prompt:
        "Sayın hâkim, müvekkilim ruhsatlı bir işletme yürütmektedir. Karşı taraf abartılı bir iddia ile mahkemeyi meşgul ediyor. Tedbir reddedilmelidir.",
      rubricTargets: ["risk"],
      options: [
        {
          id: "next",
          label: "(Müsaade ederseniz son söz hakkı kullanmıyorum)",
          next: "n11",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n11",
      kind: "info",
      act: 3,
      speaker: "hakim",
      speakerId: "hakim",
      sceneCharacters: ["fatma", "karsi"],
      scene: "Hâkim notlarını topladı, mahkeme tahtasında karara çekildi.",
      prompt:
        "Tarafların beyanları dinlenmiştir. İhtiyati tedbir talebi ve esas dava için kararım önümüzdeki celse tefhim olunacaktır.",
      options: [
        {
          id: "go",
          label: "Kararı duy →",
          next: "outcome_router",
          verdict: "good",
        },
      ],
    },
    {
      id: "outcome_router",
      kind: "outcome",
      summary: "Karar tefhim ediliyor.",
      idealAnswer:
        "Çoklu outcome engine routing'ine güveniyor.",
    },
  ],
  outcomes: [
    {
      id: "tam_zafer",
      title: "İhtiyati tedbir + esas kabul + tüm tazminat",
      mood: "triumph",
      condition: {
        minLedgerAvg: 3.4,
        maxHints: 1,
        requireDimGte: { usul: 4, gerekce: 4 },
      },
      closingBeats: [
        {
          setting: "Hâkim Polat kararını okudu. Salon sessiz.",
        },
        {
          speakerId: "hakim",
          text: "İhtiyati tedbir talebi kabul edilmiştir: gece 22:00 sonrası makineler durdurulacak, kimyasal kullanımı bilirkişi raporundaki sınır içinde tutulacak. Esas dava: el atmanın önlenmesine, manevi tazminat olarak 50.000 TL, daire değer kaybı için 35.000 TL ödenmesine karar verilmiştir.",
        },
        {
          speakerId: "fatma",
          text: "Avukat hanım... 12 yıldır oturduğum evi geri alıyorum. Bu kazanım sizin sayenizde.",
        },
        {
          speakerId: "patron",
          text: "Delil zincirini güçlü kurdun. Bilirkişi + doktor + yönetim planı + ihtar serisi — hâkim için karar verirken hiç boşluk bırakmadı.",
        },
      ],
      narrative:
        "Tüm taleplerin kabul edildi: ihtiyati tedbir derhal, esas dava manevi + maddi tazminat, KMK ihlali tescil. Burak Karaca itiraz hakkını sakladığını söyledi ama yüzünde 'kaybettik' ifadesi vardı.",
      idealAnswer:
        "Komşuluk hukukunda dava şu üç ayak üzerine kurulur: (1) somut delil — bilirkişi + doktor raporu, (2) yönetim planı + KMK üstünlüğü, (3) HMK m. 389 ile ihtiyati tedbir. Üçü birden işlerse mahkeme reddedemez.",
      pivotalDecisions: [
        {
          nodeId: "n2",
          explanation: "Üçlü dayanağı doğru çerçeveledin — TMK m. 730/737 + KMK m. 24 + tazminat.",
        },
        {
          nodeId: "n5",
          explanation: "İhtiyati tedbiri esasla birlikte talep ettin — müvekkilin acısı hızla durdu.",
        },
        {
          nodeId: "n9",
          explanation: "AI branch'te üç itirazı da çürüttün — bilirkişi tarafsızlığı, yönetim planı üstünlüğü, objektif eşik.",
        },
      ],
    },
    {
      id: "kismi_zafer",
      title: "Esas kabul, ihtiyati tedbir reddi",
      mood: "neutral",
      condition: {
        minLedgerAvg: 2.7,
        maxHints: 3,
      },
      closingBeats: [
        {
          setting: "Hâkim Polat hükmü açıkladı. Burak Karaca rahatlamış.",
        },
        {
          speakerId: "hakim",
          text: "İhtiyati tedbir talebi 'gecikmesinde sakınca' şartını yeterince karşılamadığı için reddedilmiştir. Esas dava: el atmanın önlenmesi + 30.000 TL manevi tazminat kabul.",
        },
        {
          speakerId: "fatma",
          text: "Davayı kazandım ama gürültü hâlâ sürüyor... karar kesinleşene kadar?",
        },
        {
          speakerId: "patron",
          text: "Esası kazandık ama tedbir reddinden ders çıkar: sağlık zararı + sürdürülen ihtar zincirini daha somut anlatabilseydik tedbir alabilirdik.",
        },
      ],
      narrative:
        "Davayı kazandın — el atmanın önlenmesi + tazminat. Ancak ihtiyati tedbir reddedildiği için karar kesinleşene dek (6-12 ay) gürültü sürebilir.",
      idealAnswer:
        "Tedbir için HMK m. 389'un 'gecikmesinde sakınca' eşiğini somut delillerle çıpalamak gerekirdi: doktor raporundaki tarih + günlük etki tablosu + uyku düzeni kaydı.",
    },
    {
      id: "minimum_kazanim",
      title: "Sadece el atmanın önlenmesi — tazminat yok",
      mood: "neutral",
      condition: {
        minLedgerAvg: 2.0,
      },
      closingBeats: [
        {
          setting: "Hâkim hükmü okudu. Fatma Hanım yere bakıyor.",
        },
        {
          speakerId: "hakim",
          text: "Yönetim planına aykırılık nedeniyle el atmanın önlenmesine; manevi ve maddi tazminat taleplerinin yeterli somut delil bulunmadığından reddine karar verilmiştir.",
        },
        {
          speakerId: "fatma",
          text: "En azından artık gürültü duracak... değer kaybım için ne yapacağım?",
        },
        {
          speakerId: "patron",
          text: "Yapısal kazanım ama tazminat ayağı açık. Doktor raporu + emlakçı görüşü dilekçede daha somut bağlanmalıydı.",
        },
      ],
      narrative:
        "El atmanın önlenmesi kabul, kuru temizlemeci faaliyetlerini değiştirmek zorunda. Ama manevi ve maddi tazminat 'somut zarar ispat edilemediği' için reddedildi.",
      idealAnswer:
        "Tazminat talepleri delil zincirine bağlanmalı: doktor raporu + tedavi giderleri + emlakçı raporu + örnek satış emsali. Bu detaylar olmadan hâkim tazminat veremez.",
    },
    {
      id: "yetki_reddi",
      title: "Görevsizlik / yetkisizlik kararı",
      mood: "warning",
      condition: {
        minLedgerAvg: 1.2,
      },
      closingBeats: [
        {
          setting: "Hâkim dosyayı kapadı.",
        },
        {
          speakerId: "hakim",
          text: "Görevsizlik nedeniyle dava reddedilmiştir; dosyanın görevli mahkemeye gönderilmesine karar verildi.",
        },
        {
          speakerId: "fatma",
          text: "Avukat hanım, dava düştü mü?",
        },
        {
          speakerId: "patron",
          text: "Dava düşmedi ama 6-9 ay kaybettin. Görevli mahkeme seçimi davayı baştan etkiliyor. Bu dersi unutma.",
        },
      ],
      narrative:
        "Görevli mahkeme yanlış seçildi (Asliye Hukuk yerine Sulh Hukuk gerekirdi veya tersi). Dosya görevli mahkemeye gönderildi, yargılama baştan başlayacak.",
      idealAnswer:
        "KMK m. 33 kat mülkiyeti uyuşmazlıklarında görevli mahkeme Sulh Hukuk. Komşuluk hukuku TMK kapsamında olsa bile kat mülkiyeti yapısında özel hüküm uygulanır.",
    },
    {
      id: "tam_kayip",
      title: "Esastan ret — savunma çöktü",
      mood: "loss",
      condition: {
        default: true,
      },
      closingBeats: [
        {
          setting: "Hâkim Polat kararını okudu. Burak Karaca zaferin yüzünü gizleyemiyor.",
        },
        {
          speakerId: "hakim",
          text: "Davanın esastan reddine, yargılama giderlerinin davacıdan tahsiline karar verilmiştir.",
        },
        {
          speakerId: "fatma",
          text: "Yıllarca uğraştığım şey... böyle mi bitiyor?",
        },
        {
          speakerId: "patron",
          text: "Delil zincirini kuramadık. Bilirkişi raporu eksikti, KMK ayağı dilekçede zayıftı, duruşmada savunma dağıttı. Çıkarılacak çok ders var.",
        },
      ],
      narrative:
        "Dava esastan reddedildi. Bilirkişi raporunun yetersizliği + KMK ayağının zayıf savunması + duruşmada karşı vekilin itirazlarına yetersiz cevap birleşince hâkim için 'rahatsızlık eşiği aşılmamış' sonucu ortaya çıktı.",
      idealAnswer:
        "Komşuluk hukukunda dava kazanmak için (1) objektif ölçümler — gürültü/kimyasal/sağlık, (2) yönetim planı belgeleri, (3) ihtar zinciri, (4) duruşmada üç tabakalı savunma (bilirkişi tarafsızlık + yönetim planı üstünlük + objektif sağlık delil) gerekir. Bunlardan biri eksikse mahkeme reddetmek için bahane bulur.",
    },
  ],
};
