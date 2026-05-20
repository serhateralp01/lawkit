import type { LegalCase } from "../types";

/** İş Hukuku — İşe iade demo vakası. Marketing site mini demo ve dashboard preview burayı kullanır. */
export const isHukuku001: LegalCase = {
  id: "is_hukuku_001",
  title: "İşe iade — sözlü fesih ve ödenmemiş maaş",
  branch: "is_hukuku",
  difficulty: 1,
  estimatedMinutes: 8,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil Ayşe Hanım, 7 yıl çalıştığı tekstil fabrikasından sözlü olarak işten çıkarıldı. Yazılı fesih bildirimi yok, son ay maaşı ödenmedi.",
  facts: [
    "Ayşe Hanım 2018'den beri aynı işverende çalışıyor (7 yıl).",
    "1 hafta önce müdür sözlü olarak 'bugünden itibaren gelmiyorsun' dedi.",
    "Yazılı fesih bildirimi yapılmadı.",
    "Son ay maaşı ödenmedi.",
    "İşveren 30+ işçi çalıştırıyor — iş güvencesi kapsamında.",
  ],
  documents: [
    { label: "İş sözleşmesi", ref: "2018-01-15" },
    { label: "SGK hizmet dökümü", ref: "7 yıl, kesintisiz" },
  ],
  cast: [
    {
      id: "ayse",
      role: "muvekkil",
      name: "Ayşe Hanım",
      archetype: "Tekstil işçisi · 7 yıl kıdemli",
      initials: "AH",
    },
    {
      id: "patron",
      role: "staj_patron",
      name: "Av. Tülin Demir",
      archetype: "Kıdemli avukat · seninle çalışıyor",
      initials: "TD",
    },
    {
      id: "hakim",
      role: "hakim",
      name: "Hâkim Yıldız",
      archetype: "İş Mahkemesi başkanı",
      initials: "HY",
    },
  ],
  intro: {
    setting: "Avukatlık ofisinde, Pazartesi sabahı. Kapı çalınıyor.",
    beats: [
      {
        speakerId: "ayse",
        text: "Merhaba avukatım. Adım Ayşe. 7 yıldır aynı fabrikada çalışıyordum, geçen hafta müdür beni odasına çağırdı. Tek kelimeyle, 'bugünden itibaren gelmiyorsun' dedi.",
      },
      {
        speakerId: "ayse",
        text: "Hiçbir kağıt imzalatmadılar. Üstüne son ayımın maaşı da yatmadı. Ne yapacağımı bilmiyorum, bana yardım eder misiniz?",
      },
      {
        speakerId: "patron",
        text: "Tamam, derin nefes al. Önce olguları toparlayalım, sonra hamleyi seçeceksin. Hazır mısın?",
      },
    ],
  },
  startNode: "n1",
  nodes: [
    {
      id: "n1",
      kind: "decision",
      prompt: "Müvekkili dinledin. İlk hamlen ne olmalı?",
      rubricTargets: ["mesele", "usul"],
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["ayse"],
      scene: "Ofiste, Ayşe Hanım masanın karşısında oturuyor.",
      options: [
        {
          id: "a",
          label:
            "Önce fesih sebebini ve yazılı bildirim olup olmadığını sor; olgu tespiti yap.",
          scores: { mesele: 3, usul: 2 },
          feedback:
            "Doğru hamle. Geçerli sebep yok + yazılı bildirim yok → fesih usulsüz. İşe iade ve ihbar/kıdem tazminatı gündeme gelir.",
          next: "n2",
          verdict: "good",
        },
        {
          id: "b",
          label: "Doğrudan arabuluculuğa başvur; fesih sebebini sormaya gerek yok.",
          scores: { mesele: 1, usul: 2 },
          feedback:
            "Eksik. Arabuluculuk dava şartı ama olgu tespiti yapılmadan strateji kurulamaz.",
          next: "n2",
          verdict: "partial",
        },
        {
          id: "c",
          label: "Doğrudan iş mahkemesinde işe iade davası aç.",
          scores: { mesele: 1, usul: 0 },
          feedback:
            "Yanlış. Arabuluculuk dava şartıdır (İş Mahk. K. m. 3). Davaya doğrudan gidilirse usulden reddedilir.",
          next: "n2",
          verdict: "bad",
          sources: ["is_mahkemeleri_m3"],
        },
      ],
    },
    {
      id: "n2",
      kind: "decision",
      prompt: "Hangi süreye dikkat etmen gerekir? Süreyi kaçırırsan müvekkilin işe iade hakkı yanar.",
      rubricTargets: ["usul", "risk"],
      speaker: "staj_patron",
      speakerId: "patron",
      sceneCharacters: ["ayse"],
      scene: "Patron seni uyarıyor; Ayşe Hanım dosyasına bakıyor.",
      options: [
        {
          id: "a",
          label: "Fesih bildirim tarihinden itibaren 1 ay içinde arabulucuya başvur.",
          scores: { usul: 4, risk: 3 },
          feedback: "Doğru. İş K. m. 20 — 1 ay hak düşürücü süre.",
          next: "n3",
          verdict: "good",
          sources: ["is_kanunu_m20"],
        },
        {
          id: "b",
          label: "2 yıllık genel zamanaşımı içinde her zaman başvurulabilir.",
          scores: { usul: 0, risk: 1 },
          feedback:
            "Yanlış. İşe iadede süre 1 aydır ve hak düşürücüdür. Kaçırılırsa işe iade hakkı düşer.",
          next: "n3",
          verdict: "bad",
          sources: ["is_kanunu_m20"],
        },
      ],
    },
    {
      id: "n3",
      kind: "outcome",
      prompt: "Strateji özeti hazır.",
      speaker: "narrator",
      sceneCharacters: ["ayse", "patron"],
      scene: "Ofiste; Ayşe Hanım yüzü biraz rahatlamış.",
      summary:
        "Arabuluculuk + işe iade davası + birikmiş maaş + ihbar/kıdem tazminatı talepleri.",
      idealAnswer:
        "1 ay içinde arabulucuya başvur (İş Mahk. K. m. 3 — dava şartı). Anlaşma olmazsa 2 hafta içinde iş mahkemesinde işe iade davası (İş K. m. 20). Davayla birlikte birikmiş maaş, fazla mesai, yıllık izin, ihbar ve kıdem tazminatı alacaklarını ayrı kalem olarak talep et. Risk: işveren 'haklı sebep' iddia ederse ispat yükü işverendedir.",
    },
  ],
};
