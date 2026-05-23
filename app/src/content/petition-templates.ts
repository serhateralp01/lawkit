/**
 * Dilekçe şablonları — Dilekçe Lab modülü.
 *
 * Her şablon parça parça (section) tasarlanmıştır; öğrenci her parçayı
 * ayrı ayrı yazar ve AI rubric'e göre puanlanır.
 *
 * Vakadan bağımsız — kullanıcı kendi konusunu yazar. Sadece structure
 * + her parça için 'AI'ya verilecek bağlam' tarif edilir.
 */

import type { RubricKey } from "./types";

export interface PetitionSection {
  /** Parça anahtarı, örn. 'taraflar' */
  key: string;
  /** Görünür başlık, "Taraflar" */
  title: string;
  /** Kısa yardım — bu parçada ne istenir */
  guidance: string;
  /** Örnek placeholder — boş textarea içinde görünür */
  placeholder: string;
  /** AI assessment için minimum karakter */
  minChars: number;
  /** Bu parça hangi rubrik boyutlarında değerlendirilir */
  assessDimensions: RubricKey[];
  /** AI'ya verilecek ek prompt — "bu parçada ... aranır" */
  graderHint: string;
}

export interface PetitionTemplate {
  id: string;
  title: string;
  /** Hangi vaka türü için */
  category: "ise_iade" | "sebepsiz_zenginlesme" | "komsuluk" | "tazminat";
  branch: "is_hukuku" | "borclar" | "medeni" | "medeni_usul";
  /** UI'da gözüken kısa açıklama */
  summary: string;
  /** Sıralı parçalar */
  sections: PetitionSection[];
  /** Hangi kaynak id'leri ilgilidir (öğrenciye gösterilir) */
  relevantSources?: string[];
  /** Tahmini süre */
  estimatedMinutes: number;
  /** Zorluk */
  difficulty: 1 | 2 | 3 | 4;
}

const BASE_SECTIONS_HEADER: PetitionSection[] = [
  {
    key: "mahkeme",
    title: "Mahkeme Başlığı",
    guidance:
      "Hangi mahkemeye gönderiyorsun? Görevli + yetkili mahkemeyi açıkça yaz.",
    placeholder:
      "Örn:\n[YETKİLİ] İŞ MAHKEMESİ SAYIN HAKİMLİĞİNE\nİstanbul",
    minChars: 40,
    assessDimensions: ["usul", "ifade"],
    graderHint:
      "Doğru görevli mahkeme + yetkili yer. İl/ilçe açık. Konvansiyonel başlık formatı.",
  },
  {
    key: "taraflar",
    title: "Taraflar",
    guidance:
      "Davacı, davalı ve vekil bilgilerini eksiksiz yaz. T.C. kimlik no, adres, vekâlet ilişkisi.",
    placeholder:
      "DAVACI: [Ad Soyad, T.C., Adres]\nVEKİLİ: Av. [Ad Soyad, Baro Sicil, Adres]\nDAVALI: [Ad Soyad/Ünvan, Adres]",
    minChars: 80,
    assessDimensions: ["ifade", "usul"],
    graderHint:
      "Davacı + davalı net; vekil yetkisi bildirilmiş; T.C./tüzel kişi sicil bilgileri var.",
  },
];

const BASE_SECTIONS_FOOTER: PetitionSection[] = [
  {
    key: "deliller",
    title: "Deliller",
    guidance:
      "Hangi delilleri sunuyorsun? Her delilin neyi ispat ettiğini kısaca yaz.",
    placeholder:
      "1. İş sözleşmesi (kıdem ispatı)\n2. SGK hizmet dökümü (...)\n3. ...",
    minChars: 60,
    assessDimensions: ["maddi", "gerekce"],
    graderHint:
      "Delillerin somut + her birinin hangi iddiayı kanıtladığı belirtiliyor; tanık dahil edilmişse adres + ispat konusu açık.",
  },
  {
    key: "hukuki_sebepler",
    title: "Hukuki Sebepler",
    guidance:
      "Hangi yasalar, içtihatlar, doktrin kaynakları? Net referans ver.",
    placeholder: "HMK, İş K. m. 19, m. 20, İş Mahkemeleri K. m. 3, Yargıtay 22. HD ...",
    minChars: 60,
    assessDimensions: ["maddi", "gerekce"],
    graderHint:
      "Atıflar geçerli mevzuata; spesifik madde no veya Yargıtay daire+esas; genel ifadelerden kaçınılmış.",
  },
  {
    key: "sonuc_istem",
    title: "Sonuç ve İstem",
    guidance:
      "Mahkemeden ne istiyorsun? Her talebi numaralı + miktarlı yaz. Faiz başlangıcı + yargılama giderleri ayrı kalem.",
    placeholder:
      "Yukarıda açıklanan nedenlerle:\n1- ...\n2- ...\n3- Yargılama giderleri ve vekâlet ücretinin davalıya yükletilmesine,\n... karar verilmesini saygıyla arz ve talep ederiz.",
    minChars: 100,
    assessDimensions: ["gerekce", "ifade", "risk"],
    graderHint:
      "Talepler net, somut rakam veya 'fazlaya ilişkin haklar saklı' formülü; faiz başlangıç tarihi; yargılama giderleri + vekâlet ücreti.",
  },
];

export const petitionTemplates: PetitionTemplate[] = [
  {
    id: "ise_iade",
    title: "İşe İade Davası",
    category: "ise_iade",
    branch: "is_hukuku",
    summary:
      "Geçersiz fesih sebebiyle işe iade + boşta geçen süre + tazminat talepli dava dilekçesi.",
    estimatedMinutes: 18,
    difficulty: 3,
    relevantSources: ["is_kanunu_m20", "is_mahkemeleri_m3"],
    sections: [
      ...BASE_SECTIONS_HEADER,
      {
        key: "konu",
        title: "Konu",
        guidance:
          "Davanın özünü tek cümlede yaz: ne talep edildiği + hangi tarihli olayla bağlantılı.",
        placeholder:
          "Müvekkilim ... tarafından usulsüz feshedilen iş sözleşmesinin geçersizliği ve işe iadesi ile boşta geçen süre ücreti ve diğer alacaklar.",
        minChars: 60,
        assessDimensions: ["ifade"],
        graderHint:
          "Tek cümle, talep türü açık (işe iade, boşta geçen süre, tazminat), fesih tarihine atıf.",
      },
      {
        key: "vakialar",
        title: "Vakıalar (Olay Örgüsü)",
        guidance:
          "Kronolojik. Müvekkilin işe girişi → görevleri → fesih süreci → fesih şekli → ihtar/arabuluculuk başvurusu.",
        placeholder:
          "1. Müvekkilim ... tarihinde davalı işverende çalışmaya başlamıştır.\n2. ...\n3. ... tarihinde sözlü olarak feshedilmiştir.\n4. Arabuluculuk başvurusu yapılmış, uzlaşılamamıştır.",
        minChars: 200,
        assessDimensions: ["olay", "mesele"],
        graderHint:
          "Kronolojik düzen; iş güvencesi (30+ işçi) açıkça belirtiliyor; fesih şekli ve süresi belgeli; arabuluculuk tutanağı tarihi.",
      },
      ...BASE_SECTIONS_FOOTER,
    ],
  },
  {
    id: "sebepsiz_zenginlesme",
    title: "Sebepsiz Zenginleşme İadesi",
    category: "sebepsiz_zenginlesme",
    branch: "borclar",
    summary:
      "Yanlış havale, sehven ödeme vs. — TBK m. 77 vd. uyarınca iade davası dilekçesi.",
    estimatedMinutes: 15,
    difficulty: 3,
    relevantSources: ["tbk_m77", "tbk_m79", "tbk_m82"],
    sections: [
      ...BASE_SECTIONS_HEADER,
      {
        key: "konu",
        title: "Konu",
        guidance:
          "İadesi istenen tutar + dayanak (TBK m. 77 vd.) + neden sebepsiz iktisap olduğu.",
        placeholder:
          "Davalı tarafından sehven hesaba yatırılan ... TL'nin TBK m. 77 ve devamı uyarınca sebepsiz zenginleşme nedeniyle iadesi talebidir.",
        minChars: 60,
        assessDimensions: ["mesele", "ifade"],
        graderHint:
          "Tutar net; m. 77 atfı; 'sebepsiz iktisap' ifadesi açık.",
      },
      {
        key: "vakialar",
        title: "Vakıalar",
        guidance:
          "Havalenin tarih ve tutarı, açıklama olup olmadığı, tarafların ilişkisinin yokluğu, geri verme talebi.",
        placeholder:
          "1. ... tarihinde davalı hesabıma ... TL göndermiştir.\n2. Açıklama alanı boştur.\n3. Davalı ile aramda bir hukuki ilişki bulunmamaktadır.\n4. Tespit edilen ... tarihinde geri verme talep edilmiştir.",
        minChars: 180,
        assessDimensions: ["olay", "mesele"],
        graderHint:
          "Havalenin tarihi + tutarı + açıklamasız oluşu; tarafların ilişkisinin yokluğu; iyi/kötüniyet vurgusuna açık olgular.",
      },
      ...BASE_SECTIONS_FOOTER,
    ],
  },
  {
    id: "komsuluk",
    title: "Komşuluk Hukuku — El Atmanın Önlenmesi",
    category: "komsuluk",
    branch: "medeni",
    summary:
      "Apartman içi işyeri, gürültü/koku, yönetim planı aykırılığı — TMK + KMK karması.",
    estimatedMinutes: 20,
    difficulty: 4,
    relevantSources: ["tmk_m730", "tmk_m737"],
    sections: [
      ...BASE_SECTIONS_HEADER,
      {
        key: "konu",
        title: "Konu",
        guidance:
          "El atmanın önlenmesi + manevi/maddi tazminat + ihtiyati tedbir taleplerinin özeti.",
        placeholder:
          "Davalının apartman içindeki işyeri faaliyetinden kaynaklanan rahatsızlığın önlenmesi, eski hâle getirilme ve uğradığım maddi/manevi zararın tazmini ile ihtiyati tedbir talebidir.",
        minChars: 80,
        assessDimensions: ["mesele", "ifade"],
        graderHint:
          "Talep çeşitleri ayrık (el atma + tazminat + tedbir); KMK ve TMK ayakları birleştirilmiş.",
      },
      {
        key: "vakialar",
        title: "Vakıalar",
        guidance:
          "Oturma süresi → işyerinin açılması → rahatsızlığın türü → sağlık etkisi → yönetime/işyerine yapılan başvurular.",
        placeholder:
          "1. Müvekkil ... yıldır apartmanda ikamet etmektedir.\n2. Davalı ... tarihinde apartman içinde işyeri açmıştır.\n3. Gürültü ve koku ölçümleri ektedir.\n4. Sağlık zararı doktor raporuyla sabittir.\n5. ... tarihli noter ihtarına rağmen değişiklik olmamıştır.",
        minChars: 220,
        assessDimensions: ["olay", "maddi"],
        graderHint:
          "Yönetim planı bilgisi var; ölçüm/rapor referansı; ihtar zinciri tarihli; sağlık zararı belge dayanaklı.",
      },
      ...BASE_SECTIONS_FOOTER,
    ],
  },
];

export function getPetitionTemplate(id: string): PetitionTemplate | undefined {
  return petitionTemplates.find((t) => t.id === id);
}

/**
 * Tarayıcı tarafı: AI ile üretilmiş şablon sessionStorage'da tutulur.
 * Sunucu/SSR yolunda undefined döner — bu doğru, çünkü generated template
 * sadece üreten kullanıcıya özel ve istemci-yan saklanır.
 */
const AI_PETITION_STORAGE_PREFIX = "lawkit:ai-petition:";

export function saveAiPetitionTemplate(tpl: PetitionTemplate): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      AI_PETITION_STORAGE_PREFIX + tpl.id,
      JSON.stringify(tpl),
    );
  } catch {
    // sessionStorage dolu / izin yok — sessizce geç
  }
}

export function getAiPetitionTemplate(id: string): PetitionTemplate | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(AI_PETITION_STORAGE_PREFIX + id);
    if (!raw) return undefined;
    return JSON.parse(raw) as PetitionTemplate;
  } catch {
    return undefined;
  }
}
