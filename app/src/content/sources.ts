import type { LegalSource } from "./types";

export const sources: Record<string, LegalSource> = {
  is_kanunu_m20: {
    id: "is_kanunu_m20",
    kind: "kanun",
    shortTitle: "İş K. m. 20",
    fullTitle: "4857 sayılı İş Kanunu — Madde 20: Fesih bildirimine itiraz ve usulü",
    body:
      "İş sözleşmesi feshedilen işçi, fesih bildiriminde sebep gösterilmediği veya gösterilen sebebin geçerli bir sebep olmadığı iddiası ile fesih bildiriminin tebliği tarihinden itibaren bir ay içinde işe iade talebiyle, İş Mahkemeleri Kanunu hükümleri uyarınca arabulucuya başvurmak zorundadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    verifiedAt: "2026-01-01",
    verifier: "LawKit içerik ekibi",
  },
  is_mahkemeleri_m3: {
    id: "is_mahkemeleri_m3",
    kind: "kanun",
    shortTitle: "İş Mahk. K. m. 3",
    fullTitle: "7036 sayılı İş Mahkemeleri Kanunu — Madde 3: Dava şartı olarak arabuluculuk",
    body:
      "Kanuna, bireysel veya toplu iş sözleşmesine dayanan işçi veya işveren alacağı ve tazminatı ile işe iade talebiyle açılan davalarda, arabulucuya başvurulmuş olması dava şartıdır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=7036&MevzuatTur=1",
    verifiedAt: "2026-01-01",
    verifier: "LawKit içerik ekibi",
  },
  tbk_m77: {
    id: "tbk_m77",
    kind: "kanun",
    shortTitle: "TBK m. 77",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 77: Sebepsiz zenginleşmeden doğan borç",
    body:
      "Haklı bir sebep olmaksızın, bir başkasının malvarlığından veya emeğinden zenginleşen, bu zenginleşmeyi geri vermekle yükümlüdür. Bu yükümlülük, özellikle zenginleşmenin geçerli olmayan veya gerçekleşmemiş ya da sona ermiş bir sebebe dayanması durumunda doğmuş olur.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    verifiedAt: "2026-01-01",
    verifier: "LawKit içerik ekibi",
  },
  tbk_m79: {
    id: "tbk_m79",
    kind: "kanun",
    shortTitle: "TBK m. 79",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 79: Geri verme kapsamı",
    body:
      "Zenginleşen, geri verme zamanında elinden çıkmış olduğunu ispat ettiği kısmın dışında kalanı geri vermekle yükümlüdür. Zenginleşen, zenginleşmeyi iyi niyetli olmaksızın elden çıkarmışsa veya elden çıkarırken ileride geri vermek zorunda kalabileceğini hesaba katması gerekiyorsa, zenginleşmenin tamamını geri vermekle yükümlüdür.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    verifiedAt: "2026-01-01",
    verifier: "LawKit içerik ekibi",
  },
};
