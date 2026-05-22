import type { LegalCase } from "../types";

/**
 * is_hukuku_002 — Derin İş Hukuku pilot vakası.
 *
 * Yapı: 3 perde × 4-5 sahne + 5 outcome.
 * Yeni node tipleri: client_chat (müvekkil görüşmesi), open_text (dilekçe parçası),
 * ai_branch (karşı vekil itirazına serbest cevap), checkpoint (usul performansı dalı).
 *
 * Bilim: Cathy Moore action mapping; her sahne ya karar, ya bilgi toplama,
 * ya da risk anı. Skor dramatik olarak hikayeyi değiştirir.
 */
export const isHukuku002: LegalCase = {
  id: "is_hukuku_002",
  title: "İşe iade davası — sözlü fesih, eksik delil, riskli duruşma",
  branch: "is_hukuku",
  difficulty: 3,
  estimatedMinutes: 20,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil Selin Hanım, 9 yıldır çalıştığı lojistik firmasından sözlü olarak işten çıkarıldı. İşveren 'haklı sebep' iddia ediyor. Senin işin: doğru olguları toplamak, davayı doğru yerden açmak ve duruşmada karşı vekilin tuzaklarına yakalanmamak.",
  facts: [
    {
      text: "Müvekkilin adı Selin Hanım, lojistik koordinatörü.",
      category: "Müvekkil",
    },
    {
      text: "Sözlü/SMS yolla işten çıkarılma durumu var.",
      category: "Anlaşmazlık",
    },
    // ───── Aşağıdakiler chat'te soru sorulunca açılır ─────
    {
      text: "Selin Hanım Aralık 2016'dan beri aynı işveren — 9 yıl, kesintisiz.",
      category: "Kıdem",
      hidden: true,
      revealKeywords: ["kaç yıl", "ne kadar", "kıdem", "sigorta", "sgk"],
      revealAfterNode: "n1",
    },
    {
      text: "Pazartesi tartışma + akşam SMS bildirimi 'gelmene gerek yok'.",
      category: "Fesih biçimi",
      hidden: true,
      revealKeywords: ["nasıl", "sms", "yazılı", "bildirim", "kağıt", "belge"],
      revealAfterNode: "n1",
    },
    {
      text: "İşverenin iddiası: Selin son 2 ayda 3 sevkiyatı kaçırdı (haklı sebep iddiası).",
      category: "İşveren savunması",
      hidden: true,
      revealKeywords: ["haklı sebep", "iddia", "neden", "gerekçe"],
      revealAfterNode: "n1",
    },
    {
      text: "Selin'in elinde planlama hatasını gösteren e-postalar var.",
      category: "Delil",
      hidden: true,
      revealKeywords: ["delil", "kanıt", "belge", "e-posta", "email"],
      revealAfterNode: "n1",
    },
    {
      text: "İşveren 140 işçi çalıştırıyor → iş güvencesi tartışmasız.",
      category: "İş güvencesi",
      hidden: true,
      revealKeywords: ["işçi sayısı", "iş güvencesi", "kaç kişi", "firma büyük"],
      revealAfterNode: "n1",
    },
    {
      text: "Son 3 ay fazla mesai ödenmedi, yıllık izin kullandırılmadı.",
      category: "Ek alacaklar",
      hidden: true,
      revealKeywords: ["fazla mesai", "izin", "alacak", "maaş", "ödeme"],
      revealAfterNode: "n1",
    },
  ],
  documents: [
    { label: "İş sözleşmesi", ref: "20.12.2016, belirsiz süreli" },
    { label: "SGK hizmet dökümü", ref: "9 yıl 2 ay kesintisiz" },
    { label: "SMS ekran görüntüsü", ref: "fesih bildirimi · 14.04.2026" },
    { label: "Sevkiyat e-postaları", ref: "planlama hatasının izi · 3 mail" },
    { label: "Bordro kayıtları", ref: "fazla mesai · ödenmemiş 3 ay" },
  ],
  acts: [
    { number: 1, title: "Olgu Toplama", setting: "Avukatlık ofisi" },
    { number: 2, title: "Strateji ve Dilekçe", setting: "Ofis · gece çalışması" },
    { number: 3, title: "Duruşma", setting: "İş Mahkemesi salonu" },
  ],
  cast: [
    {
      id: "selin",
      role: "muvekkil",
      name: "Selin Hanım",
      archetype: "Lojistik koordinatörü · 9 yıl kıdemli",
      initials: "SH",
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
      name: "Hâkim Aydın",
      archetype: "İş Mahkemesi · 15 yıl deneyimli",
      initials: "HA",
    },
    {
      id: "karsi",
      role: "karsi_vekil",
      name: "Av. Mert Çelik",
      archetype: "İşveren vekili · agresif tarz",
      initials: "MÇ",
    },
  ],
  intro: {
    setting: "Pazartesi sabahı. Ofise yeni gelen müvekkil masaya oturmuş.",
    beats: [
      {
        speakerId: "selin",
        text: "Avukat hanım, dokuz yıldır bu firmadayım. Geçen Pazartesi patronla işyerinde tartıştım — sevkiyat planlama hatası vardı, sorumlu o değildi bunda. Akşam telefonuma SMS geldi: 'gelmene gerek yok.'",
      },
      {
        speakerId: "selin",
        text: "Şimdi şirketin avukatı arıyor, 'haklı sebeple feshettik, tazminat hakkın yok' diyor. İçim daralıyor — ne yapacağımı bilmiyorum.",
      },
      {
        speakerId: "patron",
        text: "Selin'i dinledim. Şimdi sıra sende. Önce olguları doğru topla — eksik bir soru, davanın seyrini değiştirir. Hadi başla.",
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
      speakerId: "selin",
      sceneCharacters: ["patron"],
      scene: "Müvekkille ilk görüşme. Doğru sorular ileride hayat kurtarır.",
      prompt:
        "Avukat hanım, çok yıpranmış durumdayım. Sorularınızı sorun — elimden geldiğince anlatırım.",
      clientChat: {
        maxTurns: 5,
        personaBrief:
          "Selin Hanım 38 yaşında, 9 yıl kıdemli lojistik koordinatörü. Hukuk bilgisi sınırlı. Yorgun ve kırılgan ama olguları net hatırlıyor. Spesifik sorulduğunda ayrıntı verir; muğlak soruda 'bilmiyorum' der.",
        requiredFacts: [
          "fesih tarihi",
          "yazılı",
          "kaç yıl",
          "iş güvencesi",
          "fazla mesai",
          "haklı sebep",
        ],
        next: "n2",
      },
    },
    {
      id: "n2",
      kind: "decision",
      act: 1,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["selin"],
      scene: "Patron bilgi notlarını topluyor: 'Şimdi sınıflandıralım.'",
      prompt:
        "Müvekkili dinledikten sonra fesih nasıl nitelendirilir? Bu, davanın tüm seyrini belirler.",
      rubricTargets: ["mesele", "maddi"],
      options: [
        {
          id: "a",
          label:
            "Sözlü/SMS fesih + yazılı bildirim yok + 9 yıl kıdem → fesih usulsüz; iş güvencesi devrede.",
          scores: { mesele: 4, maddi: 3 },
          feedback:
            "Doğru. İş K. m. 19 yazılı şekil zorunluluğu; SMS yazılı şekil sayılmaz. Usulsüz feshin sonuçları açılır.",
          next: "n3",
          verdict: "good",
          sources: ["is_kanunu_m20"],
        },
        {
          id: "b",
          label:
            "İşveren 'haklı sebep' iddia ettiğine göre önce o iddianın doğruluğuna bakmak gerek.",
          scores: { mesele: 2, maddi: 2 },
          feedback:
            "Kısmen doğru. Haklı sebep iddiası önemli ama önce şekil incelenmeli; usulsüzlük tek başına davayı kazandırabilir.",
          next: "n3",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "SMS de bir bildirim sayılır; tartışma da işverene haklı sebep tanır — pozisyonumuz zayıf.",
          scores: { mesele: 0, maddi: 0 },
          feedback:
            "Yanlış. İş K. m. 19 fesih bildiriminin yazılı yapılmasını ve sebebin açık şekilde belirtilmesini emreder. SMS bu şartı karşılamaz.",
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
      sceneCharacters: ["selin"],
      scene: "Patron defterini çıkardı: 'Şimdi yaz.'",
      prompt:
        "Selin Hanım için talep edebileceğin başlıca hukuki haklar nedir? Her birini gerekçesiyle yaz.",
      rubricTargets: ["mesele", "gerekce", "ifade"],
      openText: {
        assessDimensions: ["mesele", "gerekce", "ifade"],
        minChars: 120,
        graderHint:
          "En az 4 hak başlığı + her birinin yasal dayanağı. İşe iade, ihbar tazminatı, kıdem tazminatı, fazla mesai/yıllık izin ücretleri, manevi tazminat...",
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
      scene: "Strateji aşaması. Yanlış yol seçersen, dava daha başından düşer.",
      prompt:
        "İşe iade davası açmadan önce hangi adım atılmalı? Bu adımı atlamak müvekkilin hakkını yok eder.",
      rubricTargets: ["usul", "risk"],
      options: [
        {
          id: "a",
          label: "Önce arabuluculuğa başvur (dava şartı, İş Mahk. K. m. 3).",
          scores: { usul: 4, risk: 3 },
          feedback:
            "Doğru. Arabuluculuk işe iade davalarında zorunlu dava şartıdır; atlanırsa dava usulden reddedilir.",
          next: "n5",
          verdict: "good",
          sources: ["is_mahkemeleri_m3"],
        },
        {
          id: "b",
          label: "Doğrudan iş mahkemesinde dava aç; zaten süre kısıtlı.",
          scores: { usul: 0, risk: 0 },
          feedback:
            "Yanlış. Arabuluculuk dava şartıdır. Doğrudan dava açılırsa İş Mahk. K. m. 3 gereği usulden reddedilir, süreyi de geçirmiş olursun.",
          next: "n5",
          verdict: "bad",
          sources: ["is_mahkemeleri_m3"],
        },
        {
          id: "c",
          label: "Çalışma Bakanlığı'na şikâyet, sonra dava.",
          scores: { usul: 1, risk: 1 },
          feedback:
            "Yetersiz. İdari şikâyet işe iade hakkını doğrudan etkilemez; dava şartı arabuluculuktur.",
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
      scene: "Sürelere takılırsan müvekkilin hak kaybı yaşar.",
      prompt:
        "Arabuluculuk başvurusu hangi süre içinde yapılmalı? Hatalı süreyi seçersen geri dönüş yok.",
      rubricTargets: ["usul"],
      options: [
        {
          id: "a",
          label: "Fesih bildiriminin tebliğinden itibaren 1 ay (İş K. m. 20).",
          scores: { usul: 4 },
          feedback:
            "Doğru. 1 aylık hak düşürücü süre. Bu süre geçerse işe iade hakkı sona erer.",
          next: "n6",
          verdict: "good",
          sources: ["is_kanunu_m20"],
        },
        {
          id: "b",
          label: "2 hafta içinde (iş sözleşmesi feshi genel zaman).",
          scores: { usul: 1 },
          feedback:
            "Yanlış. 2 hafta arabuluculuk uzlaşmazlık tutanağından sonra dava açma süresi. Başvuru süresi 1 aydır.",
          next: "n6",
          verdict: "bad",
          sources: ["is_kanunu_m20"],
        },
        {
          id: "c",
          label: "2 yıl genel zamanaşımı içinde her zaman.",
          scores: { usul: 0 },
          feedback:
            "Yanlış. İşe iade hak düşürücü süreye tâbi (1 ay). Kıdem/ihbar tazminatı 5 yıl ama işe iade değil.",
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
            // Usul skoru < 2 → patron uyarı sahnesi (n7a)
            condition: { requireDimGte: { usul: 2 } },
            nodeId: "n7b",
          },
        ],
        fallbackNodeId: "n7a",
      },
    },
    {
      id: "n7a",
      kind: "info",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["selin"],
      scene: "Patron sert bakıyor. Bir hata yaptın, telafi şansı var.",
      prompt:
        "Selin, durdur bir saniye. Süre konusunda hatalı düşündün. Şimdi düzeltelim: işe iade davasında 1 ay hak düşürücü süredir, 2 hafta sonraki adıma ait. Bunu içselleştir, devam edelim.",
      options: [{ id: "next", label: "Anladım, devam.", next: "n7b", verdict: "partial" }],
    },
    {
      id: "n7b",
      kind: "open_text",
      act: 2,
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: [],
      scene: "Dilekçenin en kritik kısmı: talep sonucu.",
      prompt:
        "Dilekçenin 'sonuç ve istem' kısmını yaz. Her talebin altında yasal dayanağı belirt. Eksik kalemler tahsil edilemez.",
      rubricTargets: ["gerekce", "ifade", "risk"],
      openText: {
        assessDimensions: ["gerekce", "ifade", "risk"],
        minChars: 150,
        graderHint:
          "İşe iade + boşta geçen süre ücreti (4 aya kadar) + işe başlatmama tazminatı (4-8 aylık ücret) + birikmiş alacaklar (fazla mesai, yıllık izin) + faiz başlangıcı.",
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
      sceneCharacters: ["selin", "karsi"],
      scene:
        "İş Mahkemesi duruşma salonu. Karşı vekil sıkıca dosyaya bakıyor, hâkim sana döndü.",
      prompt:
        "Meslektaşım, karşı taraf bu duruşmada yeni bir tanık ve belge sunmak istediğini bildirdi. Beyanınız nedir?",
      rubricTargets: ["usul", "risk"],
      options: [
        {
          id: "a",
          label:
            "Süre tutum talep ediyorum sayın hâkim — HMK m. 145 gereği yeni delil için itiraz hakkımı saklı tutuyorum.",
          scores: { usul: 4, risk: 3 },
          feedback:
            "Doğru. HMK m. 145 sonradan ileri sürme yasağı, m. 119 vakıaların tahkikat aşamasında belirlenmesi. Süre tutum istemek meslektaşın profesyonelliğidir.",
          next: "n9",
          verdict: "good",
        },
        {
          id: "b",
          label: "Beyanım hazır, itirazımı hemen sözlü olarak yapıyorum.",
          scores: { usul: 2, risk: 1 },
          feedback:
            "Riskli. Yeni delili incelemeden anlık itiraz yapmak bilgi eksikliğine yol açar. Profesyonel olan süre tutum istemektir.",
          next: "n9",
          verdict: "partial",
        },
        {
          id: "c",
          label: "İtirazım yok sayın hâkim, savunma hazırdır.",
          scores: { usul: 0, risk: 0 },
          feedback:
            "Tehlikeli. İncelemeden delil kabul edilirse müvekkilin aleyhine süpriz çıkabilir. Süre tutum hakkı kaybedilmemeli.",
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
      sceneCharacters: ["selin", "hakim"],
      scene:
        "Karşı vekil ayağa kalktı: 'Müvekkilim haklı sebeple feshetti — Selin Hanım son 2 ayda 3 sevkiyatı kaçırdı, kanıtları sunuyorum.' Hâkim sana döndü: 'Cevabınız?'",
      prompt:
        "Karşı vekil iddiasına nasıl yanıt verirsin? Cevabını profesyonel + hukuki dayanaklı yaz.",
      aiBranch: {
        context:
          "İşveren 'haklı sebep' iddiası getirdi (İş K. m. 25). Selin Hanım'ın elinde sevkiyat e-postaları var — planlama hatasının asıl sorumlusu olmadığını gösteriyor. Süre kuralı: haklı sebepten fesih, sebebin öğrenildiği günden itibaren 6 iş günü içinde yapılmalı (İş K. m. 26). Olay 2 ay öncesi → süreyi geçmiş.",
        branches: [
          {
            nodeId: "n10_strong",
            label: "Güçlü savunma — m. 26 süresi geçmiş + delil var",
            hint: "Öğrenci hem süre itirazını hem maddi savunmayı yapıyor (e-posta delilleri).",
            verdict: "good",
          },
          {
            nodeId: "n10_partial",
            label: "Kısmi savunma — sadece maddi inkar",
            hint: "Sadece 'sevkiyatları kaçırmadı' diyor, usul/süre itirazını atlıyor.",
            verdict: "partial",
          },
          {
            nodeId: "n10_weak",
            label: "Zayıf savunma — sadece ispat yükü itirazı",
            hint: "Sadece 'ispat yükü işverende' diyor, somut delil veya süre itirazı yok.",
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
      sceneCharacters: ["selin"],
      scene: "Hâkim notlar aldı, başını salladı. Karşı vekil oturdu.",
      prompt:
        "Çok iyi meslektaşım. Süre itirazı haklı; ayrıca delil sunumu sağlam. Esasa girmeden önce: müvekkilinizin son sözü nedir?",
      rubricTargets: ["risk", "ifade"],
      options: [
        {
          id: "a",
          label:
            "Manevi tazminat talebimi pekiştiriyorum — 9 yıllık emek + onurla işten çıkarılmama hakkı.",
          scores: { risk: 3, ifade: 3 },
          feedback: "İyi. Manevi tazminat anlatımı için son söz uygun zaman.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label: "Sayın hâkim, müvekkilim sadece adaletin tesisini istiyor.",
          scores: { risk: 2, ifade: 2 },
          feedback:
            "Genel geçer. Spesifik bir talebi yeniden vurgulamak duruşmayı daha güçlü kapatırdı.",
          next: "n11",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n10_partial",
      kind: "info",
      act: 3,
      speaker: "hakim",
      speakerId: "hakim",
      sceneCharacters: ["selin", "karsi"],
      scene: "Karşı vekil gülümsedi — usul itirazını atladığını fark etti.",
      prompt:
        "Meslektaşım, maddi inkârınız not edildi ama haklı sebep + süre meselesini eksik bıraktınız. Son sözünüz var mı?",
      rubricTargets: ["risk"],
      options: [
        {
          id: "a",
          label:
            "Sayın hâkim, kısa bir ek beyan: m. 26 süresi geçtiğinden haklı sebep iddiası zaten geçersizdir.",
          scores: { risk: 3 },
          feedback: "Düzelttin. Kabul edildi.",
          next: "n11",
          verdict: "good",
        },
        {
          id: "b",
          label: "Ek beyanım yok, duruşma kapansın.",
          scores: { risk: 0 },
          feedback: "Telafi şansını kaçırdın.",
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
      sceneCharacters: ["selin", "hakim"],
      scene: "Karşı vekil ezici biçimde kapadı. Selin Hanım yere bakıyor.",
      prompt:
        "Sayın hâkim, müvekkilimin elindeki belgeler ispat yükünü fazlasıyla karşılamaktadır. Davanın reddini talep ediyoruz.",
      rubricTargets: [],
      options: [
        {
          id: "next",
          label: "Hâkim son söz tanımıyor — duruşma kapanıyor.",
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
      sceneCharacters: ["selin", "karsi"],
      scene: "Hâkim ayağa kalktı. Karar verilecek.",
      prompt: "Duruşma sona erdi. Kararımı önümüzdeki celse tefhim edeceğim.",
      options: [
        {
          id: "go",
          label: "Karar bekleniyor → Sonuç",
          next: "outcome_router",
          verdict: "good",
        },
      ],
    },

    // ───────── OUTCOME ROUTER (görünmez, engine route eder) ─────────
    {
      id: "outcome_router",
      kind: "outcome",
      summary: "Mahkeme kararı tefhim ediliyor",
      idealAnswer:
        "Bu sahne engine'in outcome routing'ine güveniyor. Eğer LegalCase.outcomes tanımlıysa engine uygun outcome'a route eder; tanımlı değilse bu generic outcome görünür.",
    },
  ],
  outcomes: [
    {
      id: "zafer",
      title: "Mahkeme kararı: işe iade — tüm talepler kabul",
      mood: "triumph",
      condition: {
        minLedgerAvg: 3.3,
        maxHints: 1,
        requireDimGte: { usul: 4 },
      },
      closingBeats: [
        { setting: "Hâkim Aydın kararını okumaya başladı. Salon sessiz." },
        {
          speakerId: "hakim",
          text: "Davacının işverence yapılan feshin geçersizliğine, davacının işe iadesine; boşta geçen süre için 4 aylık ücreti tutarında ödeme yapılmasına... oybirliğiyle karar verilmiştir.",
        },
        { setting: "Karşı vekil dosyasını topladı, salonu sessiz terk etti." },
        {
          speakerId: "selin",
          text: "Avukatım... başardık. Dokuz yılım boşa gitmedi. Size minnettarım.",
        },
        { setting: "Salondan çıkıyorsun. Adliye koridorunda Selin'in yüzünde ilk kez gerçek bir gülümseme." },
        {
          speakerId: "patron",
          text: "Helal sana. Süre tutum, m. 26 itirazı, delil zinciri — hepsini yerinde kullandın. Bu bir genç avukat için zor kazanılan bir zaferdir.",
        },
      ],
      narrative:
        "Hâkim Aydın kararını verdi: feshin geçersizliği tespit edildi, işe iade kabul. Boşta geçen süre ücreti (4 ay) + işe başlatmama tazminatı (8 aylık ücret) + birikmiş fazla mesai ve yıllık izin alacakları + tüm yargılama giderleri davalıdan alınarak müvekkilinize ödenecek. Selin Hanım gözleri dolu çıktı salondan, sana bakarak 'sayenizde' dedi.",
      idealAnswer:
        "Usul tarafında kusursuz: arabuluculuk şartı + 1 ay hak düşürücü süre + duruşmada süre tutum + delil zinciri. Maddi: SMS yazılı sayılmaz argümanı, m. 26 süresi geçmiş savunması. Karşı vekilin yeni delil sürpriz hamlesi süre tutum talebinizle etkisizleştirildi.",
      pivotalDecisions: [
        {
          nodeId: "n4",
          explanation: "Arabuluculuğa doğru zamanda gittin → dava şartı yerine geldi.",
        },
        {
          nodeId: "n8",
          explanation: "Süre tutum talebi ile karşı vekilin sürpriz delillerini etkisizleştirdin.",
        },
        {
          nodeId: "n9",
          explanation: "Karşı vekil itirazına hem usul (m. 26 süresi) hem maddi (e-posta delilleri) ile yanıt verdin.",
        },
      ],
    },
    {
      id: "ihtiyatli_zafer",
      title: "İşe iade kazanıldı, ek tazminat kalemleri kısmen reddedildi",
      mood: "neutral",
      condition: {
        minLedgerAvg: 2.6,
        maxHints: 3,
      },
      closingBeats: [
        { setting: "Hâkim Aydın kararı kısmen kabul yönünde okudu." },
        {
          speakerId: "hakim",
          text: "Feshin geçersizliğine ve davacının işe iadesine; bir kısım fazla mesai alacağının ispatlanamadığından reddine karar verilmiştir.",
        },
        {
          speakerId: "selin",
          text: "Yine de işime dönüyorum, bu çok şey demek. Teşekkür ederim avukatım.",
        },
        {
          speakerId: "patron",
          text: "Asıl talep tahsil edildi. Fazla mesai için bordro tanığı çağırmak gerekirdi — bir dahaki sefere.",
        },
      ],
      narrative:
        "Hâkim Aydın işe iadeyi kabul etti — feshin geçersizliği tescillendi. Ancak fazla mesai için sunulan bordro kayıtlarındaki bazı kalemler ispatlanamadığı için bir kısım alacak reddedildi. Selin Hanım tatmin oldu ama 'keşke biraz daha kuvvetli savunsaydık' dedi.",
      idealAnswer:
        "Asli talep (işe iade) tahsil edildi ama detay kalemler (fazla mesai delil yetersizliği) için 'sonuç ve istem'i daha güçlü gerekçelendirmen + duruşmada bordro tanığı çağırman gerekirdi.",
      pivotalDecisions: [
        {
          nodeId: "n7b",
          explanation: "Dilekçenin 'sonuç ve istem' kısmı eksik kaldı — fazla mesai için yeterli dayanak verilmedi.",
        },
      ],
    },
    {
      id: "uzlasma",
      title: "Arabuluculukta uzlaşma — sınırlı kazanım",
      mood: "neutral",
      condition: {
        minLedgerAvg: 2.0,
      },
      closingBeats: [
        { setting: "Arabuluculuk masasında. İşveren temsilcisi teklif sunmuştu." },
        {
          speakerId: "selin",
          text: "Kabul edeceğim. Daha fazla beklemek yorucu — bir şey kazanmak hiç kazanmamaktan iyi.",
        },
        { setting: "Tutanak imzalandı, dosya kapandı. Mahkeme yolu kapalı." },
        {
          speakerId: "patron",
          text: "Uzlaşma mantıklı bir çıkıştı ama dosyada daha güçlü argümanlar vardı. Davaya gitseydik daha fazlasını alabilirdik.",
        },
      ],
      narrative:
        "Dava açılmadan, arabuluculuk masasında işveren bir teklif sundu: 6 maaş tutarında ödeme + kıdem + ihbar tazminatı, işe iade yok. Selin Hanım yorgun, kabul etti. Hâkime kadar gitmedik. 'En azından bir şey kazandık' dedi ama gözünde işe iade hayali kaldı.",
      idealAnswer:
        "Uzlaşma teklifi mantıklı kabul edilebilir ama gerçek değer (işe iade + 8 aylık tazminat + boşta geçen süre) daha büyüktü. Daha güçlü dosya hazırlığıyla davaya gidip kazanmak mümkündü.",
    },
    {
      id: "kismi_kayip",
      title: "Dava reddedildi — temyiz hakkı korundu",
      mood: "warning",
      condition: {
        minLedgerAvg: 1.2,
      },
      closingBeats: [
        { setting: "Hâkim Aydın kararını verdi. Selin Hanım dimdik duruyor." },
        {
          speakerId: "hakim",
          text: "Feshin geçerli sebebe dayandığı kanaatine varılmıştır. İşe iade talebinin reddine; sadece birikmiş fazla mesai alacağı yönünden kısmen kabule karar verilmiştir.",
        },
        {
          speakerId: "selin",
          text: "Bu kadarına da razıyım. Ama içime sinmiyor — istinafa gidebilir miyiz?",
        },
        {
          speakerId: "patron",
          text: "İstinaf yolu açık. Ama davayı baştan kuran argümanlar yetersizdi — m. 26 süresini güçlendirmedik. Bunu içselleştir.",
        },
      ],
      narrative:
        "Hâkim kararı verdi: feshin geçerli olduğuna karar verildi. Boşta geçen süre ücreti reddedildi. Birikmiş fazla mesai alacakları yargılama gideriyle birlikte kabul edildi. Selin Hanım kararı duyunca sessiz kaldı. 'Temyize gideceğim' dedi. Sen de bilirsin — istinaf yolu açık ama emek kaybı çok.",
      idealAnswer:
        "Dava ya yanlış usul (arabuluculuksuz açıldı / süreyi geçirdi) ya da duruşmada karşı vekil itirazlarına yetersiz cevap verilerek kaybedildi. Asıl güçlü argüman — m. 26 süre ihlali — eksik kullanıldı.",
    },
    {
      id: "tam_kayip",
      title: "Hak düşürücü süre kaçırıldı — işe iade hakkı düştü",
      mood: "loss",
      condition: {
        default: true,
      },
      closingBeats: [
        { setting: "Hâkim Aydın dosyayı kapadı. Yüzünde sıkıntılı bir ifade vardı." },
        {
          speakerId: "hakim",
          text: "İş Mahkemeleri Kanunu m. 3 — arabuluculuk dava şartı yerine getirilmemiştir. Dava şartı yokluğundan davanın usulden reddine karar verildi.",
        },
        { setting: "Selin Hanım kararı duyunca olduğu yerde donup kaldı." },
        {
          speakerId: "selin",
          text: "Avukatım... anlamadım. Bu nasıl olabilir? Suç benim mi?",
        },
        { setting: "Sözcüklerin nereye gideceğini bilmiyorsun. Karşı vekil dosyasını topladı, gülümsemeden çıktı." },
        {
          speakerId: "patron",
          text: "Bu sertlikten bir ders çıkar. Usul hukuku affetmez. 1 ay hak düşürücü süre — bu konuda bir daha tereddüt etme.",
        },
      ],
      narrative:
        "Mahkeme önündeki ilk celsede usulden ret kararı çıktı. 1 ay hak düşürücü süre içinde arabuluculuğa başvurulmamıştı; işe iade hakkı sona ermişti. Birikmiş alacaklar için ayrı dava açılabilir ama Selin Hanım'ın işyerine dönme hayali bitti. Salondan çıkarken sana baktı, 'avukatım, anlamadım nasıl olduğunu' dedi.",
      idealAnswer:
        "Bu sonuç bir şeyi öğretir: usul hukukunda 'hak düşürücü süre' affetmez. İş K. m. 20 — 1 ay. İş Mahk. K. m. 3 — arabuluculuk dava şartı. Bu iki kuralı doğru sırayla uygulamadan duruşmaya bile çıkamazsın.",
      pivotalDecisions: [
        {
          nodeId: "n4",
          explanation: "Doğrudan dava veya idari yola gitmek dava şartını atladı.",
        },
        {
          nodeId: "n5",
          explanation: "Yanlış süre tahmini hak düşürücü kuralı ihlal etti.",
        },
      ],
    },
  ],
};
