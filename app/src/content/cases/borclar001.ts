import type { LegalCase } from "../types";

/**
 * Borçlar Hukuku — sebepsiz zenginleşme + iade davası.
 * İkinci pilot vaka. Şemanın iş hukuku dışında bir alanda da
 * çalıştığını ve case-engine'in yeniden kullanılabilir olduğunu
 * doğrular.
 */
export const borclar001: LegalCase = {
  id: "borclar_001",
  title: "Yanlış havale — sebepsiz zenginleşme iadesi",
  branch: "borclar",
  difficulty: 2,
  estimatedMinutes: 10,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil, internet bankacılığında tarafına 18.500 TL'lik bir havale gelir. Gönderen kişiyle herhangi bir hukuki ilişkisi yoktur. Birkaç gün sonra gönderen kişi arar ve 'parayı yanlış kişiye yolladım, geri istiyorum' der. Müvekkil parayı bu süre içinde başka borçlarına ödemiştir.",
  facts: [
    "Müvekkilin hesabına 12.04.2026'da 18.500 TL geldi.",
    "Açıklama alanı boş; gönderen müvekkilin tanımadığı bir kişi.",
    "5 gün sonra gönderen müvekkili telefonla aradı, iade istedi.",
    "Müvekkil parayı bu sürede kredi kartı borcunu kapatmak için kullandı.",
    "Müvekkilin hesabında şu an iade için yeterli bakiye yok.",
  ],
  documents: [
    { label: "Banka EFT dekontu", ref: "12.04.2026" },
    { label: "Müvekkilin kredi kartı ekstresi", ref: "15.04.2026 ödeme kaydı" },
  ],
  startNode: "n1",
  nodes: [
    {
      id: "n1",
      kind: "decision",
      prompt:
        "Gönderen kişinin avukatı yazılı talep gönderdi. Müvekkilin hukuki durumunu nasıl çerçevelersin?",
      rubricTargets: ["mesele", "maddi"],
      options: [
        {
          id: "a",
          label:
            "TBK m. 77 — sebepsiz zenginleşme. Müvekkil borçludur ancak iade kapsamı 'mevcut zenginleşme' ile sınırlı; m. 79 iyi/kötüniyet ayrımı kritik.",
          scores: { mesele: 4, maddi: 3 },
          feedback:
            "Doğru çerçeveleme. Sebepsiz zenginleşmenin asli unsuru tamamlandı; iade kapsamı tartışılmalı.",
          next: "n2",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "Bağışlama hükümleri uygulanır — gönderen para gönderdi, geri isteyemez.",
          scores: { mesele: 0, maddi: 0 },
          feedback:
            "Yanlış. Bağışlamada irade unsuru aranır (TBK m. 285). Tanımadığı birine bilinçli bağış varsayılamaz.",
          next: "n2",
          verdict: "bad",
        },
        {
          id: "c",
          label:
            "Doğrudan haksız fiil sorumluluğu çerçevesinde değerlendirilir.",
          scores: { mesele: 1, maddi: 0 },
          feedback:
            "Eksik. Müvekkilin kusuru yok, fakat sebepsiz iktisap mevcut. TBK m. 77 vd. uygulanır, m. 49 değil.",
          next: "n2",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n2",
      kind: "decision",
      prompt:
        "İade kapsamı sorulduğunda hangi argümanı kurarsın?",
      rubricTargets: ["maddi", "gerekce", "risk"],
      options: [
        {
          id: "a",
          label:
            "TBK m. 79: iyiniyetli zenginleşen, geri verme zamanında elinde kalanı iade eder. Müvekkil havalenin yanlış olduğunu bilmiyordu; iade 'mevcut zenginleşme' ile sınırlı tartışılır.",
          scores: { maddi: 4, gerekce: 3, risk: 3 },
          feedback:
            "Doğru. Ancak müvekkilin gönderenin tanımadığı biri olduğunu bilmesi 'şüphe' eşiğini doğurabilir — bu noktada karşı argümana hazırlıklı ol.",
          next: "n3",
          verdict: "good",
          sources: ["tbk_m77", "tbk_m79"],
        },
        {
          id: "b",
          label:
            "Tüm 18.500 TL'nin iadesi gerekir, kapsam tartışılamaz.",
          scores: { maddi: 1, gerekce: 1, risk: 0 },
          feedback:
            "Eksik. İade kapsamı iyiniyet/kötüniyete göre değişir (m. 79). Kötüniyet ispatı karşı tarafa düşer.",
          next: "n3",
          verdict: "partial",
          sources: ["tbk_m79"],
        },
        {
          id: "c",
          label:
            "Para harcandığı için iade imkânsız — borç düştü.",
          scores: { maddi: 0, gerekce: 0, risk: 0 },
          feedback:
            "Yanlış. Borç imkânsızlıkla düşmez (TBK m. 136 farklı bağlam). Sebepsiz zenginleşmede borçlu, sadece iyiniyetli ise iade kapsamı daralır.",
          next: "n3",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n3",
      kind: "outcome",
      prompt: "Strateji notu hazır.",
      summary:
        "İyiniyetli sebepsiz zenginleşme savunması + iade kapsamı + ödeme planı önerisi.",
      idealAnswer:
        "Birinci argüman: TBK m. 77 vd. çerçevesinde müvekkil sebepsiz zenginleşmiş sayılır; iade yükümlülüğü vardır ancak m. 79 uyarınca iyiniyetli kişi yalnız 'mevcut zenginleşme' ile sorumludur. İkinci argüman: müvekkilin tanımadığı bir kaynaktan gelen havalenin şüphe doğurup doğurmadığı ispat tartışmasıdır; ispat yükü iadeyi isteyen tarafa düşer (kötüniyet iddiası). Pratik strateji: müşterek bir ödeme planı öner — bir defada ödeme imkânsız ise taksitli ifa; karşı taraf reddederse dava sürecinde ihtilafı m. 79 üzerinden yürüt. Risk: tanımadığı kişiden gelen havalenin 'kötüniyet karinesi' yaratmasıdır; bu durumda iade kapsamı tüm 18.500 TL'ye yükselir.",
    },
  ],
};
