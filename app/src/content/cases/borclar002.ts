import type { LegalCase } from "../types";

/**
 * borclar_002 — Derin Borçlar Hukuku vakası.
 *
 * Senaryo: Yanlış havale + müvekkil parayı kullandı + karşı taraf 'kötüniyet'
 * iddiasıyla tam iade istiyor. Avukat olarak müzakerede kazanım sınırını
 * belirleyeceksin.
 *
 * 3 perde: müvekkil görüşmesi (olgu + iyiniyet sorgulaması) → strateji ve
 * yazılı cevap (TBK m. 77-79, ispat yükü) → uzlaşma müzakeresi (ai_branch
 * ile karşı vekille pazarlık).
 */
export const borclar002: LegalCase = {
  id: "borclar_002",
  title: "Yanlış havale — kötüniyet iddiası karşısında müzakere",
  branch: "borclar",
  difficulty: 3,
  estimatedMinutes: 18,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil Kerem Bey'in hesabına tanımadığı birinden 24.800 TL geldi. 5 gün sonra gönderen kişinin avukatı 'kötüniyet' iddiasıyla tam iade istedi. Para harcanmış. Senin işin: olguları doğru çıkar, iyiniyet savunmasını kur, müzakere masasında ne kadar kazanabileceğini gör.",
  facts: [
    {
      text: "Müvekkilin adı Kerem Bey, küçük esnaf.",
      category: "Müvekkil",
    },
    {
      text: "Hesabına tanımadığı birinden 24.800 TL geldi, 5 gün sonra ihtar geldi.",
      category: "Anlaşmazlık",
    },
    // Aşağıdakiler chat'te soru sorulunca açılır
    {
      text: "Havale 14.04.2026'da geldi, ihtar 19.04.2026'da geldi.",
      category: "Tarihler",
      hidden: true,
      revealKeywords: ["tarih", "ne zaman", "kaç gün", "havale ne zaman"],
      revealAfterNode: "n1",
    },
    {
      text: "Açıklama alanı boştu, gönderen ad: 'Mehmet Y.' — Kerem Bey tanımıyor.",
      category: "Gönderen bilgisi",
      hidden: true,
      revealKeywords: ["gönderen", "kim", "tanımıyor", "açıklama", "isim"],
      revealAfterNode: "n1",
    },
    {
      text: "Kerem Bey parayı 15.04 sabahı kredi kartı borcu kapatmaya kullandı (18.500 TL).",
      category: "Para nereye gitti",
      hidden: true,
      revealKeywords: ["nereye", "harcadı", "kullandı", "borç", "kredi", "ne yaptı"],
      revealAfterNode: "n1",
    },
    {
      text: "Kalan 6.300 TL hesabında duruyor.",
      category: "Mevcut bakiye",
      hidden: true,
      revealKeywords: ["bakiye", "kaldı", "hesap", "kalan"],
      revealAfterNode: "n1",
    },
    {
      text: "Karşı vekilin iddiası: Kerem 'tanımadığı birinden gelen parayı bilerek almıştır' — bu kötüniyet karinesidir.",
      category: "Karşı iddia",
      hidden: true,
      revealKeywords: ["karşı", "iddia", "vekil", "kötüniyet", "neden"],
      revealAfterNode: "n1",
    },
    {
      text: "Kerem Bey havalenin geldiği gün bankaya gidip 'bu para ne?' diye sormayı düşünmüş ama yapmadı.",
      category: "Şüphe anı",
      hidden: true,
      revealKeywords: ["şüphe", "sordu", "düşündü", "bilmek", "araştır"],
      revealAfterNode: "n1",
    },
  ],
  documents: [
    { label: "Banka EFT dekontu", ref: "14.04.2026, 24.800 TL" },
    { label: "Kerem'in kredi kartı ekstresi", ref: "15.04.2026 · 18.500 TL ödeme" },
    { label: "Karşı vekilin noter ihtarı", ref: "19.04.2026" },
  ],
  acts: [
    { number: 1, title: "Olgu Toplama", setting: "Avukatlık ofisi" },
    { number: 2, title: "Strateji ve Cevap", setting: "Dilekçe hazırlığı" },
    { number: 3, title: "Müzakere", setting: "Uzlaşma masası" },
  ],
  cast: [
    {
      id: "kerem",
      role: "muvekkil",
      name: "Kerem Bey",
      archetype: "Esnaf · 38 yaşında",
      initials: "KB",
    },
    {
      id: "patron",
      role: "staj_patron",
      name: "Av. Tülin Demir",
      archetype: "Kıdemli avukat · senin patron",
      initials: "TD",
    },
    {
      id: "karsi",
      role: "karsi_vekil",
      name: "Av. Çağrı Erdem",
      archetype: "Gönderenin avukatı · pazarlıkçı",
      initials: "ÇE",
    },
  ],
  intro: {
    setting: "Salı sabahı. Kerem Bey ofise daha kapı açılır açılmaz girdi.",
    beats: [
      {
        speakerId: "kerem",
        text: "Avukat hanım, başıma garip bir iş geldi. Geçen hafta hesabıma 24.800 lira düştü, tanımadığım birinden. Açıklama yok.",
      },
      {
        speakerId: "kerem",
        text: "Beş gün sonra adam aradı, 'yanlış kişiye gönderdim, geri ver' dedi. Ben de o parayla kredi kartımı kapatmıştım — şimdi avukatı 'kötüniyet' diyor, tamamını istiyor. Korkuyorum.",
      },
      {
        speakerId: "patron",
        text: "Kötüniyet iddiası ciddi — gerçekten varsa tüm 24.800'i iade edersin. Yoksa sadece elde kalanı. Önce olguları doğru çıkar — soru sıran kritik. Hadi.",
      },
    ],
  },
  startNode: "n1",
  nodes: [
    // ───────── PERDE I — Olgu Toplama ─────────
    {
      id: "n1",
      kind: "client_chat",
      act: 1,
      speaker: "muvekkil",
      speakerId: "kerem",
      sceneCharacters: ["patron"],
      scene: "Kerem masaya oturdu. Yorgun ama yardım edersen anlatacak.",
      prompt:
        "Sorun avukat hanım — ne öğrenmek istiyorsanız söyleyeyim. Aklımdan ne geçti, ne yaptım — hepsini hatırlıyorum.",
      clientChat: {
        maxTurns: 5,
        personaBrief:
          "Kerem Bey 38 yaşında küçük esnaf. Hukuk bilgisi sınırlı. İyiniyetli ama panik halinde. Spesifik sorulduğunda detay verir; muğlak soruda 'tam hatırlamıyorum' der. Şüphe anını (bankaya gidip sormayı düşündüğünü) sadece doğrudan sorulursa söyler — kendiliğinden söylemez.",
        requiredFacts: ["tarih", "gönderen", "nereye", "şüphe", "karşı", "bakiye"],
        next: "n2",
      },
    },
    {
      id: "n2",
      kind: "decision",
      act: 1,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["kerem"],
      scene: "Patron notları topluyor. Hukuki çerçeve şimdi kuracaksın.",
      prompt:
        "Müvekkili dinledikten sonra hukuki ilişkiyi nasıl çerçevelersin? Yanlış çerçeveleme tüm stratejiyi bozar.",
      rubricTargets: ["mesele", "maddi"],
      options: [
        {
          id: "a",
          label:
            "TBK m. 77 — sebepsiz zenginleşme. İade yükümlülüğü var ama kapsamı m. 79 iyi/kötüniyet ayrımıyla değişir. Asıl tartışma 'iyiniyet'.",
          scores: { mesele: 4, maddi: 3 },
          feedback:
            "Doğru çerçeveleme. Borç kurulduğunu kabul ediyoruz, savunmayı kapsam üzerinden yapıyoruz.",
          next: "n3",
          verdict: "good",
          sources: ["tbk_m77", "tbk_m79"],
        },
        {
          id: "b",
          label:
            "Gönderenin kusurlu hatası TBK m. 49 haksız fiil sorumluluğunu doğurur; iade talebi onun zararı için değil müvekkilin sebepsiz iktisabı için olmalı — ikincil dayanak m. 49.",
          scores: { mesele: 1, maddi: 0 },
          feedback:
            "Yanlış kurgu. TBK m. 49 haksız fiil kusur unsuru gerektirir; müvekkilde kusur yok, davacıda da 'müvekkile karşı' bir haksız fiil yok. Özel hüküm m. 77 vd. genel hükmü dışlar — m. 49'u ekleyince savunma karışır ve hâkim 'avukatım çelişkili dayanak sunuyor' der.",
          next: "n3",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "Para açıklamasız geldi → gönderen iradesi tartışmalı; iade isteyebilmek için önce bağışlama (TBK m. 285) iradesinin bulunmadığını ispat etmesi gerekir.",
          scores: { mesele: 0, maddi: 0 },
          feedback:
            "Yanlış ankraj. TBK m. 285 bağışlamada 'bağışlama iradesi' kurulduktan sonra geri alma sınırlarını düzenler. Tanımadığı birine yapılan açıklamasız havalede asli ispat yükü 'bağışlama iradesi vardı' diyen tarafta, yani müvekkilde olur — bunu kuramayız. Doğru dayanak m. 77 vd.",
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
      sceneCharacters: ["kerem"],
      scene: "Patron defterini açtı. 'Şimdi argümanını yaz.'",
      prompt:
        "Kerem Bey için 'iyiniyet' savunmasını gerekçeleriyle yaz. Hangi olgular iyiniyet karinesi yaratır, hangileri tehlike?",
      rubricTargets: ["mesele", "gerekce", "risk"],
      openText: {
        assessDimensions: ["mesele", "gerekce", "risk"],
        minChars: 140,
        graderHint:
          "Lehte olgular: tanımıyor, açıklama yok, makul süre içinde harcadı, kalan kısmı duruyor. Aleyhte: 'tanımadığı' olması şüphe doğurabilir; bankaya sormamış olması ihmal sayılabilir.",
        next: "n4",
      },
    },

    // ───────── PERDE II — Strateji ve Cevap ─────────
    {
      id: "n4",
      kind: "decision",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: [],
      scene: "Yazılı cevapta hangi rakamı sunacaksın? Bu pazarlığın çıpası.",
      prompt:
        "Karşı vekilin ihtarına yazılı cevabında hangi rakamı teklif edersin?",
      rubricTargets: ["maddi", "gerekce", "risk"],
      options: [
        {
          id: "a",
          label:
            "Mevcut zenginleşme (6.300 TL kalan + ihtilaflı kısım için pazarlığa açıkız) — m. 79 iyiniyetli geri verme kapsamı.",
          scores: { maddi: 4, gerekce: 3, risk: 3 },
          feedback:
            "Doğru ankraj. İyiniyet karinesi + mevcut zenginleşme savunması güçlü bir başlangıç.",
          next: "n5",
          verdict: "good",
          sources: ["tbk_m79"],
        },
        {
          id: "b",
          label:
            "Tüm 24.800 TL — borç var, ödeme planı yapalım. Çekişmeden kaçınalım.",
          scores: { maddi: 1, gerekce: 1, risk: 0 },
          feedback:
            "Eksik. Müvekkilin yasal hakkı m. 79 ile iyiniyet kapsamında daraltılmıştır; doğrudan tamamını kabul etmek hak ihlalidir.",
          next: "n5",
          verdict: "bad",
        },
        {
          id: "c",
          label:
            "Hiçbir şey teklif etme, davayı bekle — ispat yükü onlarda.",
          scores: { maddi: 2, gerekce: 1, risk: 1 },
          feedback:
            "Riskli. İspat yükü kötüniyet için davacıda ama 'hiç teklif yapmama' tutumu mahkemeye 'kötüniyetli direnme' olarak yansıyabilir, m. 79/2 tetiklenir.",
          next: "n5",
          verdict: "partial",
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
      scene: "Süreyle ilgili bir soru var: zamanaşımı.",
      prompt:
        "Karşı tarafın istem hakkı için zamanaşımı süresi nedir? Bu uzun vadeli pazarlık gücünü etkiler.",
      rubricTargets: ["usul"],
      options: [
        {
          id: "a",
          label:
            "Öğrenmeden 2 yıl, her hâlde 10 yıl (TBK m. 82). Pazarlık baskısı kısıtlı değil.",
          scores: { usul: 4 },
          feedback:
            "Doğru. m. 82 sebepsiz zenginleşmede özel zamanaşımı. Süre kısa olmadığı için uzlaşmaya zorlamazlar.",
          next: "n6",
          verdict: "good",
          sources: ["tbk_m82"],
        },
        {
          id: "b",
          label: "Genel 10 yıl — özel hüküm yok.",
          scores: { usul: 1 },
          feedback:
            "Eksik. TBK m. 82 özel süre öngörür: subjektif 2 yıl + objektif 10 yıl.",
          next: "n6",
          verdict: "partial",
          sources: ["tbk_m82"],
        },
        {
          id: "c",
          label: "1 ay hak düşürücü süre.",
          scores: { usul: 0 },
          feedback:
            "Yanlış — bu işe iade davasının süresidir, borçlar hukukuyla ilgisi yok.",
          next: "n6",
          verdict: "bad",
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
            // Risk + mesele iyi → uzlaşma yoluna git
            condition: { requireDimGte: { mesele: 3, risk: 2 } },
            nodeId: "n7_open",
          },
        ],
        // Aksi halde patron uyarısı
        fallbackNodeId: "n7_warn",
      },
    },
    {
      id: "n7_warn",
      kind: "info",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["kerem"],
      scene: "Patron seni durdurdu. Bir şey eksik kaldı.",
      prompt:
        "Bir saniye. Kötüniyet iddiasına karşı 'şüphe' olgusunu net cevaplamadık — Kerem'in bankaya sormayı düşünüp yapmaması karşı tarafın elinde delildir. Bu eksikliği aklında tut; müzakerede zayıf nokta olabilir.",
      options: [
        {
          id: "next",
          label: "Anladım, müzakereye geçelim.",
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
      scene: "Yarınki uzlaşma toplantısı için açılış pozisyonun ne?",
      prompt:
        "Karşı vekilin masasında ilk teklifin ne olacak? Rakam + gerekçe + 'red sınırı' (asla altına inmem dediğin nokta) — üçü birlikte yaz.",
      rubricTargets: ["gerekce", "ifade", "risk"],
      openText: {
        assessDimensions: ["gerekce", "ifade", "risk"],
        minChars: 130,
        graderHint:
          "İdeal: 6.300 TL (kalan bakiye) hemen iade + ihtilaflı 18.500 TL için 12 ay vadeli ödeme planı veya orta yol pazarlığı. Red sınırı: tüm 24.800'in peşin ödenmesi.",
        next: "n8",
      },
    },

    // ───────── PERDE III — Müzakere ─────────
    {
      id: "n8",
      kind: "decision",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["kerem", "patron"],
      scene:
        "Uzlaşma odası. Çağrı Erdem dosyasını açtı, sakin ama sert bakıyor.",
      prompt:
        "Meslektaşım, müvekkiliniz tanımadığı bir kaynaktan gelen parayı bilerek aldı — bu kötüniyet. Tüm 24.800 + faiz talep ediyorum. Ne diyorsunuz?",
      rubricTargets: ["mesele", "gerekce"],
      options: [
        {
          id: "a",
          label:
            "Sayın meslektaşım, kötüniyet karinesi TBK m. 79/2'ye göre ispatlanmadan iyiniyet asıldır. Müvekkilim açıklama olmayan bir havaleyi olağan kabul etti.",
          scores: { mesele: 4, gerekce: 4 },
          feedback:
            "Sağlam. İspat yükünü doğru yere koydun. Karşı taraf zorlanacak.",
          next: "n9",
          verdict: "good",
          sources: ["tbk_m79"],
        },
        {
          id: "b",
          label:
            "Müvekkilim parayı iade etmek istiyor ama tamamı şu an mümkün değil. Ödeme planı yapalım.",
          scores: { mesele: 2, gerekce: 1 },
          feedback:
            "Müvekkilini iade borçlusu olarak kabul ettin — savunma yumuşadı. Pazarlık gücün düştü.",
          next: "n9",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "Kötüniyet iddianızı reddediyoruz. Müvekkilim hiçbir şey ödemeyecek.",
          scores: { mesele: 1, gerekce: 0 },
          feedback:
            "Çok sert. Kalan 6.300 TL'lik bakiye için iyiniyetli iade yükümü mevcut — sıfır teklif mantıksız.",
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
      sceneCharacters: ["kerem", "patron"],
      scene:
        "Karşı vekil eğildi: 'Bir bilgim var — müvekkiliniz havalenin geldiği gün bankaya sormayı düşünmüş ama yapmamış. Bu açıkça şüphe.' Tülin Demir size baktı — sıra sende.",
      prompt:
        "Karşı vekilin 'şüphe → kötüniyet' iddiasına nasıl yanıt verirsin? Cevabını gerekçeleriyle yaz.",
      aiBranch: {
        context:
          "Karşı vekil müvekkilin 'sormayı düşünüp yapmadığı' anı bir 'kötüniyet' kanıtı olarak kullanıyor. Sen hukuken bu olguyu zayıflatmalı veya bağlamı değiştirmelisin. TBK m. 79: kötüniyet objektif değerlendirilir — sadece 'düşünmek' yetmez, 'bilmek veya bilmesi gerekmek' gerek. Müvekkilin tanımadığı biri olması tek başına 'bilmesi gerekti' demek değil. 'Düşünüp sormamak' günlük ihmal olabilir.",
        branches: [
          {
            nodeId: "n10_strong",
            label: "Güçlü cevap — 'düşünmek' kötüniyet eşiğine ulaşmaz",
            hint: "Öğrenci m. 79'un objektif kötüniyet eşiğini vurgular: 'bilme veya bilmesi gerekme'. 'Düşünmek' bunu karşılamaz; karşı tarafın delili zayıf.",
            verdict: "good",
          },
          {
            nodeId: "n10_partial",
            label: "Kısmi cevap — sadece duygu, hukuk eksik",
            hint: "Öğrenci 'müvekkilim iyiniyetlidir, bu adaletsiz' tarzı genel savunma yapar, ama m. 79'un objektif testini kurmaz.",
            verdict: "partial",
          },
          {
            nodeId: "n10_weak",
            label: "Zayıf cevap — kabul etti veya çuvalladı",
            hint: "Öğrenci olguyu kabul edip 'belki kötüniyet vardı, ödeme planına bakalım' diyor; ya da konuyu kaçırıyor.",
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
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["kerem", "patron"],
      scene: "Çağrı Erdem geri çekildi. Sesi yumuşadı.",
      prompt:
        "İyi argüman meslektaşım — m. 79 objektif testi bizi zorlar. Müvekkilim 18.000 TL'lik ödeme planına razı. 12 ay vadeli, faizsiz. Kabul mü?",
      rubricTargets: ["risk", "ifade"],
      options: [
        {
          id: "a",
          label:
            "Kabul ediyoruz — bu rakam müvekkilim için makul, davaya gerek yok.",
          scores: { risk: 4, ifade: 3 },
          feedback:
            "İyi karar. Pazarlık gücün vardı ama daha fazlasını istemek dava riski getirirdi.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "12.000 TL diyelim, vadeli — kalan 6.300 hemen, gerisi 6 ay.",
          scores: { risk: 3, ifade: 3 },
          feedback:
            "Cesur ama makul — pazarlık devam edebilir.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "c",
          label:
            "Reddediyorum — hiçbir şey ödemeyiz, davaya gidelim.",
          scores: { risk: 0, ifade: 1 },
          feedback:
            "Aşırı. Müvekkilin lehine olan teklifi reddetmek dava riskine girer.",
          next: "n11",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n10_partial",
      kind: "info",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["kerem", "patron"],
      scene: "Çağrı Erdem rahatlamış görünüyor — argümanın yetersizdi.",
      prompt:
        "Anlıyorum meslektaşım. Pozisyonumuzu yumuşatabilirim: 22.000 TL, 6 ay vadeli. Kabul ederseniz davadan vazgeçeriz.",
      rubricTargets: ["risk"],
      options: [
        {
          id: "a",
          label:
            "Yine de daha düşük öneririm — 18.000 + 12 ay diyelim.",
          scores: { risk: 3 },
          feedback:
            "Telafi ettin. Pazarlıkta geriden geldin ama makul yere getirdin.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "Kabul, 22.000 hemen başlasın.",
          scores: { risk: 1 },
          feedback:
            "Müvekkilini olduğundan fazla yüke soktun. Daha düşük rakam alabilirdin.",
          next: "n11",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n10_weak",
      kind: "info",
      act: 3,
      speaker: "karsi_vekil",
      speakerId: "karsi",
      sceneCharacters: ["kerem", "patron"],
      scene: "Çağrı Erdem kazandığını biliyor. Sesi sertleşti.",
      prompt:
        "Müvekkilinizin kötüniyetli olduğunu siz de gördünüz. Tüm 24.800 + 6 ay yasal faiz. Tek teklifim bu. Yoksa mahkemede görüşürüz.",
      rubricTargets: ["risk"],
      options: [
        {
          id: "a",
          label:
            "Kabul — koşulları yumuşatma çabasıyla tüm tutarı + faiz.",
          scores: { risk: 0 },
          feedback:
            "Müvekkilin için en kötü senaryo. Müzakerede pozisyonunu tamamen kaybettin.",
          next: "n11",
          verdict: "bad",
        },
        {
          id: "b",
          label:
            "Tek seferde değil ama 24.800'i 18 ay vadeli kabul ediyoruz.",
          scores: { risk: 1 },
          feedback:
            "Tutarı kabul ettin ama vadeyi alabildin. Yine de hak kaybı yüksek.",
          next: "n11",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n11",
      kind: "info",
      act: 3,
      speaker: "narrator",
      sceneCharacters: ["kerem", "patron"],
      scene: "Toplantı bitti. Kerem Bey'le ofise dönüyorsun.",
      prompt: "Sonuç netleşiyor.",
      options: [
        {
          id: "go",
          label: "Sonucu gör →",
          next: "outcome_router",
          verdict: "good",
        },
      ],
    },
    {
      id: "outcome_router",
      kind: "outcome",
      summary: "Müzakere sonuçlandı",
      idealAnswer:
        "Bu sahne engine outcome routing'ine güveniyor; condition'a göre 5 sonuçtan biri seçilir.",
    },
  ],
  outcomes: [
    {
      id: "tam_savunma",
      title: "Tam savunma — sadece kalan bakiye iade",
      mood: "triumph",
      condition: {
        minLedgerAvg: 3.4,
        maxHints: 1,
        requireDimGte: { mesele: 4 },
      },
      closingBeats: [
        { setting: "Çağrı Erdem dosyasını topladı, elini uzattı: 'Kazandınız meslektaşım.'" },
        {
          speakerId: "kerem",
          text: "Yani sadece 6.300'ü ödeyeceğim? Avukatım, sizi tanıdığım gün şanslı günümmüş.",
        },
        {
          speakerId: "patron",
          text: "M. 79'u doğru kullandın. İyiniyet karinesini koruyarak müzakereyi senin tarafına çekmek — bu zor bir iştir. Helal.",
        },
      ],
      narrative:
        "Çağrı Erdem 'kötüniyet ispat edemeyeceği'ni kabul etti ve müzakereyi kapattı. Müvekkilin sadece kalan bakiye olan 6.300 TL'yi iade edecek; 18.500 TL'lik kısmı için 'mevcut zenginleşme yok' savunması kabul edildi. Dava açılmadı. Avukatlık ücretine girmediler — Kerem Bey 12 ay önce kapı çaldığında ümitsizdi, bugün gülerek çıkıyor.",
      idealAnswer:
        "İyiniyet karinesi (TBK m. 79) + 'düşünmek ≠ bilme/bilmesi gerekme' objektif testi + ispat yükü davacıda. Bu üç ayağı doğru kurarsan karşı vekil pozisyonunu yumuşatmaya zorlanır.",
      pivotalDecisions: [
        {
          nodeId: "n4",
          explanation: "Mevcut zenginleşme + iyiniyet ankrajı pazarlığın temelini attı.",
        },
        {
          nodeId: "n9",
          explanation: "AI branch'te 'düşünmek kötüniyet eşiğine ulaşmaz' argümanı karşı tarafı çekildirdi.",
        },
      ],
    },
    {
      id: "uzlasma_orta",
      title: "Orta yol uzlaşma — 18.000 TL vadeli",
      mood: "neutral",
      condition: {
        minLedgerAvg: 2.7,
        maxHints: 3,
      },
      closingBeats: [
        { setting: "Tutanak imzalandı, taraflar masadan kalktı." },
        {
          speakerId: "kerem",
          text: "12 ay vadeli, 18.000 TL. Yapabilirim. Daha kötü çıkabilirdi.",
        },
        {
          speakerId: "patron",
          text: "Makul sonuç. İyiniyet savunması bizi çıpalad ı ama m. 79'un objektif testini daha güçlü kurabilirdin — biraz daha düşürebilirdik.",
        },
      ],
      narrative:
        "Çağrı Erdem'le 18.000 TL üzerinde anlaştın — 12 ay vadeli, faizsiz. Kalan 6.300 hemen ödendi. Kerem Bey memnun ama Tülin Demir 'biraz daha sıkıştırabilirdik' diyor.",
      idealAnswer:
        "Açılış teklifin daha agresif olabilirdi; özellikle ispat yükünü vurgulamak. Orta yol iyi ama tam savunma daha mümkündü.",
    },
    {
      id: "uzlasma_yumusak",
      title: "Yumuşak uzlaşma — 22.000 TL yarısı peşin",
      mood: "neutral",
      condition: {
        minLedgerAvg: 1.8,
      },
      closingBeats: [
        { setting: "Çağrı Erdem zafer yüzlü çıktı. Sen kâğıtları topluyorsun." },
        {
          speakerId: "kerem",
          text: "22.000... peki, ödemeye çalışırım. Karşı taraf da iyiniyetli galiba.",
        },
        {
          speakerId: "patron",
          text: "Sınırlı bir kazanım. Pazarlığa başlarken zayıf ankrajladık; karşı taraf bunu fark etti.",
        },
      ],
      narrative:
        "22.000 TL, yarısı peşin, kalan 6 ay vadeli kabul ettin. Müvekkilin ekonomik olarak zorlanacak ama dava yolu kapandı.",
      idealAnswer:
        "İyiniyet savunmasını TBK m. 79'a daha sıkı bağlamak + açılış teklifini düşük tutmak gerekirdi. Ankraj noktan zayıftı.",
    },
    {
      id: "dava_yolunda",
      title: "Müzakere bitti, dava yolu açık",
      mood: "warning",
      condition: {
        minLedgerAvg: 1.0,
      },
      closingBeats: [
        { setting: "Çağrı Erdem kalktı: 'Bu kadarsa, mahkemede görüşürüz.'" },
        {
          speakerId: "kerem",
          text: "Avukat hanım... şimdi ne olacak?",
        },
        {
          speakerId: "patron",
          text: "Davaya hazırlanacağız. Pozisyonun teknik olarak savunulabilir ama müzakerede gücün düştü. Yargılama 1-2 yıl sürer, sonuç belirsiz.",
        },
      ],
      narrative:
        "Müzakere uzlaşmasız bitti. Karşı taraf dava açacak. Müvekkilin için hak kaybı olmadı ama ekonomik ve psikolojik yük yıllarca sürebilir.",
      idealAnswer:
        "Müzakerede ya çok sert ya da ankrajsız bir tutum aldın. Karşı taraf 'pazarlık masasında değil mahkemede daha iyi sonuç alırım' düşündü.",
    },
    {
      id: "tam_kayip",
      title: "Tüm tutar + faiz — savunma çöktü",
      mood: "loss",
      condition: {
        default: true,
      },
      closingBeats: [
        { setting: "Tutanak imzalandı. Kerem Bey yere bakıyor." },
        {
          speakerId: "kerem",
          text: "24.800 + faiz... 6 ay içinde. Avukat hanım, bunu nasıl yaparım?",
        },
        {
          speakerId: "patron",
          text: "İyiniyet savunmasını kuramadık. m. 79 kapımızı çalıyordu ama içeri almadık. Bir ders olarak kalsın.",
        },
      ],
      narrative:
        "Karşı vekilin 'kötüniyet' iddiasını çürütemedin. Müvekkilin tüm tutarı + 6 ay yasal faizi ödemek zorunda. Müzakerede pozisyonunu kaybettin.",
      idealAnswer:
        "TBK m. 79: kötüniyet objektif olarak ispatlanmadan iyiniyet asıldır. 'Bilme veya bilmesi gerekme' eşiği. 'Düşünmek' bu eşiği karşılamaz. İspat yükü her zaman davacıdadır. Bu üçünü doğru kurmak savunmanın temelidir.",
    },
  ],
};
