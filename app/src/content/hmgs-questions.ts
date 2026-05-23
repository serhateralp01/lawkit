/**
 * HMGS soru bankası — ilk versiyon.
 *
 * Format Bear the Bar / TUS bench tarzı: tek doğru cevaplı çoktan seçmeli,
 * her soruda AI tutor benzeri kısa açıklama. Tanı testi 10 soru rastgele
 * çeker, sonunda branch breakdown + zayıf alan analizi.
 *
 * Hukukçu inceleme öncelikli — `reviewedBy` ile her soru bağımsız onay alır.
 */

import type { RubricKey } from "./types";

export type HmgsBranch =
  | "is_hukuku"
  | "borclar"
  | "medeni"
  | "medeni_usul"
  | "ceza"
  | "ceza_usul"
  | "idare"
  | "ticaret"
  | "anayasa"
  | "icra";

export interface HmgsChoice {
  id: "a" | "b" | "c" | "d";
  text: string;
}

export interface HmgsQuestion {
  id: string;
  branch: HmgsBranch;
  /** 1-4 zorluk */
  difficulty: 1 | 2 | 3 | 4;
  /** Hangi rubrik boyutunu en çok test ediyor */
  primarySkill: RubricKey;
  /** Soru metni (olay + sorulan) */
  stem: string;
  choices: HmgsChoice[];
  /** Doğru şık id'si */
  correctId: "a" | "b" | "c" | "d";
  /** Doğru cevap açıklaması */
  explanation: string;
  /** Yanlış şıkların kısa eleştirisi (opsiyonel, AI tutor benzeri) */
  distractorReasons?: Partial<Record<"a" | "b" | "c" | "d", string>>;
  /** Hangi mevzuat maddesi temelli */
  sources?: string[];
  /** Hukukçu inceleme */
  reviewedBy?: {
    reviewerName: string;
    reviewedAt: string;
  };
}

export const BRANCH_LABELS: Record<HmgsBranch, string> = {
  is_hukuku: "İş Hukuku",
  borclar: "Borçlar Hukuku",
  medeni: "Medeni Hukuk",
  medeni_usul: "Medeni Usul",
  ceza: "Ceza Hukuku",
  ceza_usul: "Ceza Usul",
  idare: "İdare Hukuku",
  ticaret: "Ticaret Hukuku",
  anayasa: "Anayasa Hukuku",
  icra: "İcra İflas",
};

export const hmgsQuestions: HmgsQuestion[] = [
  // ───────── İş Hukuku ─────────
  {
    id: "is_001",
    branch: "is_hukuku",
    difficulty: 2,
    primarySkill: "usul",
    stem: "Selin Hanım sözlü olarak işten çıkarılmıştır. İşveren 50 işçi çalıştırmaktadır. Selin Hanım işe iade için hangi süre içinde arabulucuya başvurmalıdır?",
    choices: [
      { id: "a", text: "Fesih bildiriminin tebliğinden itibaren 2 hafta" },
      { id: "b", text: "Fesih bildiriminin tebliğinden itibaren 1 ay" },
      { id: "c", text: "Fesih bildiriminin tebliğinden itibaren 2 ay" },
      { id: "d", text: "Genel zamanaşımı süresi olan 5 yıl içinde her zaman" },
    ],
    correctId: "b",
    explanation:
      "İş K. m. 20 uyarınca fesih bildiriminin tebliği tarihinden itibaren 1 ay içinde işe iade talebiyle arabulucuya başvurulması gerekir. Bu süre hak düşürücü süredir; kaçırılırsa işe iade hakkı sona erer.",
    distractorReasons: {
      a: "2 hafta arabuluculuk uzlaşmazlık tutanağından sonra dava açma süresidir, başvuru süresi değildir.",
      c: "Böyle bir süre mevzuatta yoktur.",
      d: "İşe iade hak düşürücü süreye tâbi; genel zamanaşımı uygulanmaz.",
    },
    sources: ["is_kanunu_m20"],
  },
  {
    id: "is_002",
    branch: "is_hukuku",
    difficulty: 3,
    primarySkill: "mesele",
    stem: "İşveren bir işçiyi sözlü olarak işten çıkarmıştır. Aynı işveren ardından mahkemede 'haklı sebeple feshettim' iddiasında bulunmuştur. Ancak haklı sebebin gerçekleştiği iddia edilen olay 3 ay öncedir. İş K. m. 26 uyarınca işverenin haklı sebep ileri sürebilmesi için süre hangisidir?",
    choices: [
      { id: "a", text: "Haklı sebebin öğrenilmesinden itibaren 6 iş günü" },
      { id: "b", text: "Haklı sebebin öğrenilmesinden itibaren 1 ay" },
      { id: "c", text: "Olaydan itibaren 1 yıl" },
      { id: "d", text: "Süresi sınırsızdır" },
    ],
    correctId: "a",
    explanation:
      "İş K. m. 26/I uyarınca haklı sebepten fesih, sebebin öğrenildiği günden itibaren 6 iş günü ve her hâlde olayın gerçekleşmesinden itibaren 1 yıl içinde yapılabilir. Olay 3 ay öncesiyse haklı sebep iddiası hak düşürücü süreyle düşmüştür.",
    distractorReasons: {
      b: "1 ay işe iade için arabulucu başvuru süresidir, m. 26 ile karıştırılmamalı.",
      c: "1 yıl objektif son sınır, sübjektif süre 6 iş günüdür.",
      d: "Hak düşürücü süre vardır.",
    },
    sources: [],
  },
  {
    id: "is_003",
    branch: "is_hukuku",
    difficulty: 2,
    primarySkill: "maddi",
    stem: "İş güvencesi hükümlerinin uygulanması için aşağıdaki şartlardan hangisi mutlaka aranır?",
    choices: [
      { id: "a", text: "İşçinin en az 6 ay kıdemi" },
      { id: "b", text: "İşçinin yazılı sözleşmesi" },
      { id: "c", text: "İşyerinde en az 30 işçi çalışması" },
      { id: "d", text: "İşçinin sendika üyeliği" },
    ],
    correctId: "c",
    explanation:
      "İş güvencesi (İş K. m. 18 vd.) işyerinde en az 30 işçi çalıştırılması + işçinin en az 6 ay kıdemli olması koşullarına bağlıdır. Ancak en kritik ve mutlak koşul 30 işçi sınırıdır; kıdem de aranır ama bu sorudaki şıklarda kıdem değeri 'en az 6 ay' olarak değil tek geçmektedir.",
    distractorReasons: {
      a: "Doğru bir şart ama tek başına yeterli değil — 30 işçi koşulu olmazsa iş güvencesi yoktur.",
      b: "Yazılı sözleşme şartı değildir, iş güvencesi her tür sözleşmede uygulanabilir.",
      d: "Sendika üyeliği şartı değildir.",
    },
  },

  // ───────── Borçlar ─────────
  {
    id: "borc_001",
    branch: "borclar",
    difficulty: 3,
    primarySkill: "maddi",
    stem: "Bir kişiye sehven banka havalesi yapılmış, alıcı parayı kullanmıştır. Gönderen TBK m. 77 vd. uyarınca iade isteyince alıcının iade kapsamı m. 79'a göre ne olur?",
    choices: [
      { id: "a", text: "Alıcı her durumda tüm tutarı iade etmek zorundadır" },
      { id: "b", text: "Alıcı iyiniyetli ise yalnız 'mevcut zenginleşmesi' kadar iade eder" },
      { id: "c", text: "Alıcının iade yükümlülüğü yoktur; gönderenin kendi hatası" },
      { id: "d", text: "TBK m. 49 haksız fiil hükümleri uygulanır" },
    ],
    correctId: "b",
    explanation:
      "TBK m. 79 uyarınca iyiniyetli zenginleşen, geri verme zamanında elinde kalan kısmı iade eder; elden çıkmış olanlardan sorumlu değildir. Kötüniyet ispatı davacıya düşer; ispatlanırsa tamamı iade edilir.",
    distractorReasons: {
      a: "Yalnız kötüniyetli alıcılarda tüm tutar iade edilir; iyiniyetli ise mevcut zenginleşme.",
      c: "Sebepsiz iktisap mevcut; iade borcu vardır, sadece kapsamı tartışılır.",
      d: "Haksız fiil kusur unsuru gerektirir; sehven havalede alıcının kusuru yok.",
    },
    sources: ["tbk_m77", "tbk_m79"],
  },
  {
    id: "borc_002",
    branch: "borclar",
    difficulty: 2,
    primarySkill: "usul",
    stem: "Sebepsiz zenginleşmeden doğan istemler için TBK m. 82 hangi zamanaşımı sürelerini öngörür?",
    choices: [
      { id: "a", text: "Genel 10 yıl zamanaşımı; özel süre yok" },
      { id: "b", text: "Öğrenmeden 1 yıl, her hâlde 5 yıl" },
      { id: "c", text: "Öğrenmeden 2 yıl, her hâlde 10 yıl" },
      { id: "d", text: "1 ay hak düşürücü süre" },
    ],
    correctId: "c",
    explanation:
      "TBK m. 82 sebepsiz zenginleşmede iki kademeli özel zamanaşımı düzenler: öğrenmeden itibaren 2 yıl (sübjektif), her hâlde olaydan itibaren 10 yıl (objektif).",
    distractorReasons: {
      a: "Özel hüküm vardır, genel 10 yıl uygulanmaz.",
      b: "Yanlış süreler; mevzuatta böyle bir kombinasyon yok.",
      d: "1 ay işe iade içindir, borçlar ile ilgisi yok.",
    },
    sources: ["tbk_m82"],
  },
  {
    id: "borc_003",
    branch: "borclar",
    difficulty: 2,
    primarySkill: "mesele",
    stem: "A, B'ye 50.000 TL borç verdiği iddiasıyla dava açmıştır. B 'bu para borç değil, A'nın bana bağışıydı' der. İspat yükü hangisindedir?",
    choices: [
      { id: "a", text: "Bağışlama iddiasını ileri süren B'de" },
      { id: "b", text: "Para gönderen A'da (kim talep ediyorsa)" },
      { id: "c", text: "Hâkim re'sen araştırır" },
      { id: "d", text: "Banka kayıtlarına bakılır, taraf ispat etmez" },
    ],
    correctId: "a",
    explanation:
      "HMK m. 190 ve TBK ilkeleri: 'iddiayı ispat ona düşer'. Bağışlama bir hukuki olay; bunu ileri süren taraf (B) ispatlamak zorundadır. Borç verme iddiasında borç verenin (A) parayı verdiğini ispatlaması da gerekir ama bağışlama defi ileri sürüldüğünde defi ispatı B'ye düşer.",
    distractorReasons: {
      c: "Medeni yargılamada re'sen araştırma değil tasarruf ilkesi geçerli.",
      d: "Banka kayıtları delil olabilir ama ispat yükü hâlâ taraflarındır.",
    },
  },

  // ───────── Medeni Hukuk ─────────
  {
    id: "med_001",
    branch: "medeni",
    difficulty: 2,
    primarySkill: "maddi",
    stem: "Komşu apartmandaki bir işyerinden gelen kötü koku ve gürültü nedeniyle taşınmaz maliki dava açmak istemektedir. Aşağıdakilerden hangisi en uygun hukuki dayanaktır?",
    choices: [
      { id: "a", text: "TBK m. 49 haksız fiil tazminatı" },
      { id: "b", text: "TMK m. 730 ve m. 737 komşuluk hukuku — el atmanın önlenmesi" },
      { id: "c", text: "TBK m. 77 sebepsiz zenginleşme" },
      { id: "d", text: "İdari yargıda ruhsat iptali" },
    ],
    correctId: "b",
    explanation:
      "TMK m. 730 (taşkın kullanım sorumluluğu) ve m. 737 (komşu hakkı) özel hüküm olarak komşuluk uyuşmazlıklarında uygulanır. El atmanın önlenmesi + tazminat talepleri bu çerçevede ileri sürülür. Genel hüküm TBK m. 49 yerine özel hüküm önceliklidir.",
    distractorReasons: {
      a: "Haksız fiil ancak özel hüküm yokken devreye girer.",
      c: "Sebepsiz zenginleşme tamamen farklı bir bağlamdır.",
      d: "Belediye ruhsatı özel hukuk komşuluk haklarını ortadan kaldırmaz; idari iptal alternatif olabilir ama asli dayanak değil.",
    },
    sources: ["tmk_m730", "tmk_m737"],
  },
  {
    id: "med_002",
    branch: "medeni",
    difficulty: 3,
    primarySkill: "usul",
    stem: "Apartman içindeki bir kat malikinin yönetim planına aykırı kullanımı nedeniyle açılacak el atmanın önlenmesi davasında görevli mahkeme hangisidir?",
    choices: [
      { id: "a", text: "Asliye Hukuk Mahkemesi" },
      { id: "b", text: "Sulh Hukuk Mahkemesi (KMK m. 33)" },
      { id: "c", text: "Tüketici Mahkemesi" },
      { id: "d", text: "İdare Mahkemesi" },
    ],
    correctId: "b",
    explanation:
      "Kat Mülkiyeti Kanunu m. 33 uyarınca kat mülkiyetinden doğan davalarda görevli mahkeme Sulh Hukuk Mahkemesidir. Yetkili mahkeme taşınmazın bulunduğu yer.",
    distractorReasons: {
      a: "Asliye Hukuk genel görevli mahkeme; KMK m. 33 özel hüküm olarak Sulh Hukuk'u görevli kılar.",
      c: "Tüketici hukuku ile ilgisi yok.",
      d: "Komşular arası özel hukuk uyuşmazlığı idari yargı konusu değildir.",
    },
  },

  // ───────── Medeni Usul ─────────
  {
    id: "musul_001",
    branch: "medeni_usul",
    difficulty: 2,
    primarySkill: "usul",
    stem: "Davacı, dava açtıktan sonra mahkemenin ilk tahkikat duruşmasında ek delil sunmak istemiştir. HMK m. 145'e göre bu durum mümkün müdür?",
    choices: [
      { id: "a", text: "Her zaman mümkündür" },
      { id: "b", text: "Karşı tarafın açık muvafakati veya hâkimin kabulü ile mümkündür" },
      { id: "c", text: "Yalnızca dilekçeler aşamasında sunulabilir; sonradan asla sunulamaz" },
      { id: "d", text: "Sadece istinaf aşamasında sunulabilir" },
    ],
    correctId: "b",
    explanation:
      "HMK m. 145 'sonradan ileri sürme yasağı' düzenlemesi getirmiştir. Tahkikat aşamasında sonradan ileri sürülecek vakıa ve deliller, karşı tarafın muvafakati veya hâkimin kabulü ile dosyaya girebilir.",
    distractorReasons: {
      a: "Sınırsız sonradan ileri sürme yargılama ekonomisini bozar; yasak getirilmiştir.",
      c: "İstisnai yollar var (m. 145).",
      d: "İstinaf yeni delil için son çıkıştır ama tahkikat aşamasında da mümkündür.",
    },
  },
  {
    id: "musul_002",
    branch: "medeni_usul",
    difficulty: 2,
    primarySkill: "usul",
    stem: "İhtiyati tedbir talebi için HMK m. 389 hangi koşulu öngörür?",
    choices: [
      { id: "a", text: "Talep edenin haklı çıkma ihtimalinin %100 olması" },
      { id: "b", text: "Gecikmesinde sakınca bulunması veya ciddi zarar tehlikesi" },
      { id: "c", text: "Karşı tarafın açık muvafakati" },
      { id: "d", text: "Mahkemenin başka çare bulamaması" },
    ],
    correctId: "b",
    explanation:
      "HMK m. 389 ihtiyati tedbir için 'gecikmesinde sakınca veya önemli bir zarar doğacağı' koşulunu arar. Talep eden yaklaşık ispat yükümlülüğü altındadır.",
    distractorReasons: {
      a: "%100 ispat değil, yaklaşık ispat yeterli.",
      c: "Muvafakat şart değil; aksine genelde gizlilikle istenir.",
      d: "Çare çokluğu değil tedbirin niteliği değerlendirilir.",
    },
  },

  // ───────── Ceza Hukuku ─────────
  {
    id: "ceza_001",
    branch: "ceza",
    difficulty: 2,
    primarySkill: "mesele",
    stem: "Bir kişi başkasının evine zorla girip eşyalarını almıştır. TCK kapsamında hangi suç oluşur?",
    choices: [
      { id: "a", text: "Hırsızlık (TCK m. 141)" },
      { id: "b", text: "Yağma (TCK m. 148)" },
      { id: "c", text: "Konut dokunulmazlığı + hırsızlık birleşimi" },
      { id: "d", text: "Sadece konut dokunulmazlığı (TCK m. 116)" },
    ],
    correctId: "c",
    explanation:
      "Konuta zorla girip eşya almak fiili hem konut dokunulmazlığını ihlal eder (TCK m. 116) hem hırsızlık suçunu oluşturur (TCK m. 141). İki ayrı suç olduğu için fail her ikisinden de cezalandırılır (gerçek içtima). Yağma (m. 148) ancak zor + tehdit insana yöneltilirse oluşur; sadece konuta girmek yağma değildir.",
    distractorReasons: {
      a: "Konuta zorla girme ihmal edilemez, sadece hırsızlık değil.",
      b: "Yağma cebir veya tehdidin kişiye yöneltilmesini gerektirir.",
      d: "Eşya alma fiilini ihmal etmek yanlış olur.",
    },
  },
  {
    id: "ceza_002",
    branch: "ceza_usul",
    difficulty: 3,
    primarySkill: "usul",
    stem: "Bir kişi gözaltına alınmıştır. CMK uyarınca azami gözaltı süresi (toplu suç dışında) nedir?",
    choices: [
      { id: "a", text: "12 saat" },
      { id: "b", text: "24 saat" },
      { id: "c", text: "48 saat" },
      { id: "d", text: "4 gün" },
    ],
    correctId: "b",
    explanation:
      "CMK m. 91 uyarınca tek bir suç için azami gözaltı süresi 24 saattir (yakalama zamanı dahil değil, mahallerine getirilme zamanı dahil). Toplu suçlarda Cumhuriyet savcısı kararıyla bu süre 4 güne kadar uzatılabilir.",
    distractorReasons: {
      a: "12 saat değil, asgari veya azami sınır olarak mevzuatta yok.",
      c: "48 saat eski bir düzenleme, mevcut CMK'da 24 saattir.",
      d: "4 gün toplu suçlarda uzatma sınırıdır, normal sınır değildir.",
    },
  },

  // ───────── Anayasa ─────────
  {
    id: "anaya_001",
    branch: "anayasa",
    difficulty: 2,
    primarySkill: "mesele",
    stem: "Anayasa'ya göre temel hak ve özgürlüklerin sınırlandırılması hangi şartları taşımalıdır?",
    choices: [
      { id: "a", text: "Yalnız Cumhurbaşkanlığı kararnamesi ile" },
      { id: "b", text: "Kanunla, Anayasa'nın ilgili maddelerinde belirtilen sebeplere bağlı, demokratik toplum gereklerine ve ölçülülük ilkesine uygun" },
      { id: "c", text: "Sınırsız ve serbestçe yapılabilir" },
      { id: "d", text: "Sadece olağanüstü hâl dönemlerinde sınırlandırılır" },
    ],
    correctId: "b",
    explanation:
      "Anayasa m. 13 temel hakların sınırlandırılmasını üç koşula bağlar: (1) yalnız kanunla, (2) Anayasa'da ilgili maddelerde yer alan sebeplere bağlı olarak, (3) demokratik toplum gerekleri + ölçülülük ilkesine uygun olarak.",
    distractorReasons: {
      a: "Cumhurbaşkanlığı kararnamesiyle temel hak sınırlanamaz.",
      c: "Sınırlandırma şartları katıdır.",
      d: "Normal dönemde de sınırlanabilir, OHAL özel rejim sağlar (m. 15).",
    },
  },
  {
    id: "anaya_002",
    branch: "anayasa",
    difficulty: 3,
    primarySkill: "usul",
    stem: "Bir kişi Anayasa Mahkemesi'ne bireysel başvuru yapmak istiyor. Hangi koşul YOKTUR?",
    choices: [
      { id: "a", text: "Olağan kanun yollarının tüketilmiş olması" },
      { id: "b", text: "Temel hak ihlali iddiası" },
      { id: "c", text: "30 gün içinde başvuru süresi" },
      { id: "d", text: "Başvurucunun avukatla temsil edilmiş olması" },
    ],
    correctId: "d",
    explanation:
      "Anayasa m. 148 ve AYM İçtüzüğü gereği bireysel başvuru için (a) olağan kanun yollarının tüketilmesi, (b) temel hak ihlali iddiası, (c) ihlalin öğrenildiği tarihten itibaren 30 gün içinde başvuru gerekir. Avukatla temsil zorunluluğu YOKTUR; başvurucu kendisi başvurabilir.",
    distractorReasons: {
      a: "Doğru — kanun yolları tüketilmeli.",
      b: "Doğru — temel hak iddiası şart.",
      c: "Doğru — 30 gün hak düşürücü süre.",
    },
  },

  // ───────── İdare ─────────
  {
    id: "idare_001",
    branch: "idare",
    difficulty: 2,
    primarySkill: "usul",
    stem: "İdari işlemin iptali için İdare Mahkemesi'ne dava açma süresi ne kadardır?",
    choices: [
      { id: "a", text: "30 gün" },
      { id: "b", text: "60 gün" },
      { id: "c", text: "6 ay" },
      { id: "d", text: "1 yıl" },
    ],
    correctId: "b",
    explanation:
      "İdari Yargılama Usulü Kanunu (İYUK) m. 7/I uyarınca İdare Mahkemelerinde dava açma süresi tebliğden itibaren 60 gündür. Vergi mahkemelerinde ise 30 gündür (m. 7/II).",
    distractorReasons: {
      a: "30 gün vergi mahkemeleri içindir.",
      c: "6 ay genelde Anayasa Mahkemesi bireysel başvurudan bağımsız bir süre değil.",
      d: "1 yıl uzun, mevzuatta öyle bir süre yok.",
    },
  },

  // ───────── İcra İflas ─────────
  {
    id: "icra_001",
    branch: "icra",
    difficulty: 2,
    primarySkill: "usul",
    stem: "İlamsız icra takibinde ödeme emrine itiraz süresi ne kadardır?",
    choices: [
      { id: "a", text: "Tebliğden itibaren 7 gün" },
      { id: "b", text: "Tebliğden itibaren 15 gün" },
      { id: "c", text: "Tebliğden itibaren 30 gün" },
      { id: "d", text: "Tebliğden itibaren 60 gün" },
    ],
    correctId: "a",
    explanation:
      "İİK m. 62 uyarınca ödeme emrine borçlu, tebliğ tarihinden itibaren 7 gün içinde itiraz etmek zorundadır. İtiraz icra dairesine veya icra mahkemesine yapılır. Süre hak düşürücü süredir.",
    distractorReasons: {
      b: "15 gün ilam takibinde itiraz değil, bazı tasfiye usullerindedir.",
      c: "30 gün başka süredir.",
      d: "60 gün İYUK'ta idari dava açma süresidir.",
    },
  },
];

/** Branch bazında soruları gruplar — analiz için. */
export function questionsByBranch(): Record<HmgsBranch, HmgsQuestion[]> {
  const out: Partial<Record<HmgsBranch, HmgsQuestion[]>> = {};
  for (const q of hmgsQuestions) {
    if (!out[q.branch]) out[q.branch] = [];
    out[q.branch]!.push(q);
  }
  return out as Record<HmgsBranch, HmgsQuestion[]>;
}

/** Belirtilen sayıda rastgele soru — tanı testi için. */
export function pickDiagnosticSet(count = 10, seed?: number): HmgsQuestion[] {
  const all = [...hmgsQuestions];
  // Branch çeşitliliği için her branch'ten 1-2 al
  const grouped = questionsByBranch();
  const branches = Object.keys(grouped) as HmgsBranch[];

  const set: HmgsQuestion[] = [];
  let i = 0;
  while (set.length < count && i < 100) {
    for (const b of branches) {
      if (set.length >= count) break;
      const pool = grouped[b].filter((q) => !set.some((x) => x.id === q.id));
      if (pool.length === 0) continue;
      // Deterministik seed varsa kullan
      const idx = seed !== undefined ? (seed + i) % pool.length : Math.floor(Math.random() * pool.length);
      set.push(pool[idx]);
    }
    i++;
  }

  // Yetmediyse kalan havuzdan al
  while (set.length < count) {
    const remaining = all.filter((q) => !set.some((x) => x.id === q.id));
    if (remaining.length === 0) break;
    set.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return set;
}

/** Cevapları analiz et — branch ve primarySkill kırılımı. */
export interface DiagnosticResult {
  total: number;
  correct: number;
  byBranch: Partial<Record<HmgsBranch, { total: number; correct: number }>>;
  bySkill: Partial<Record<RubricKey, { total: number; correct: number }>>;
  weakestBranch?: HmgsBranch;
  weakestSkill?: RubricKey;
}

export function analyzeDiagnostic(
  questions: HmgsQuestion[],
  answers: Record<string, "a" | "b" | "c" | "d">,
): DiagnosticResult {
  const byBranch: DiagnosticResult["byBranch"] = {};
  const bySkill: DiagnosticResult["bySkill"] = {};
  let correct = 0;

  for (const q of questions) {
    const ans = answers[q.id];
    const isCorrect = ans === q.correctId;
    if (isCorrect) correct += 1;

    const bb = byBranch[q.branch] ?? { total: 0, correct: 0 };
    bb.total += 1;
    if (isCorrect) bb.correct += 1;
    byBranch[q.branch] = bb;

    const bs = bySkill[q.primarySkill] ?? { total: 0, correct: 0 };
    bs.total += 1;
    if (isCorrect) bs.correct += 1;
    bySkill[q.primarySkill] = bs;
  }

  // En zayıf branch + skill
  let weakestBranch: HmgsBranch | undefined;
  let weakestBranchRatio = 1;
  for (const [b, d] of Object.entries(byBranch) as [HmgsBranch, { total: number; correct: number }][]) {
    if (d.total === 0) continue;
    const r = d.correct / d.total;
    if (r < weakestBranchRatio) {
      weakestBranchRatio = r;
      weakestBranch = b;
    }
  }

  let weakestSkill: RubricKey | undefined;
  let weakestSkillRatio = 1;
  for (const [s, d] of Object.entries(bySkill) as [RubricKey, { total: number; correct: number }][]) {
    if (d.total === 0) continue;
    const r = d.correct / d.total;
    if (r < weakestSkillRatio) {
      weakestSkillRatio = r;
      weakestSkill = s;
    }
  }

  return {
    total: questions.length,
    correct,
    byBranch,
    bySkill,
    weakestBranch,
    weakestSkill,
  };
}
