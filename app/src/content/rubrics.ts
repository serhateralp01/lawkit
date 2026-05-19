import type { Rubric } from "./types";

/** content/rubrics/default_v1.json — tipleştirilmiş kopya */
export const defaultRubric: Rubric = {
  id: "rubric_v1",
  version: "1.0.0",
  description: "Yedi boyutlu varsayılan rubrik — Bloom/AAC&U çerçevesi.",
  studentVisibleDimensions: ["mesele", "usul", "maddi", "gerekce", "risk"],
  dimensions: [
    {
      key: "olay",
      label: "Olayı Anlama",
      short: "Olgu",
      definition: "Olgu örgüsünü doğru ve eksiksiz okuma, taraf-zaman-yer ilişkilerini kurma.",
      levels: {
        "0": "Temel olgular kaçırıldı.",
        "1": "Olguların önemli kısmı doğru ancak boşluk var.",
        "2": "Olgular doğru kuruldu, zaman çizelgesi tutarlı.",
        "3": "Olgular eksiksiz; gizli olgu farkındalığı.",
        "4": "Tartışmalı bilgilerin ispat yükü ayrı ele alındı.",
      },
    },
    {
      key: "mesele",
      label: "Hukuki Mesele Tespiti",
      short: "Mesele",
      definition: "Olayda doğan asıl ve tali hukuki meseleleri tanımlama.",
      levels: {
        "0": "Asıl mesele kaçırıldı.",
        "1": "Asıl mesele kısmen tespit edildi.",
        "2": "Asıl mesele net belirlendi.",
        "3": "Tali meseleler de tespit edildi.",
        "4": "Usul/maddi ayrımı ile hiyerarşik kuruldu.",
      },
    },
    {
      key: "usul",
      label: "Usul Hukuku",
      short: "Usul",
      definition: "Görev/yetki, dava şartları, süreler, taraf ehliyeti.",
      levels: {
        "0": "Usul kuralları gözardı edildi.",
        "1": "Bir usul unsuru ele alındı.",
        "2": "Görev/yetki ve dava şartları doğru.",
        "3": "Süre farkındalığı var.",
        "4": "Usul ekonomisi ve strateji bağlamında ele alındı.",
      },
    },
    {
      key: "maddi",
      label: "Maddi Hukuk",
      short: "Maddi",
      definition: "Uygulanacak kanun maddesi/içtihat seçimi ve subsumption.",
      levels: {
        "0": "İlgisiz mevzuat seçildi.",
        "1": "İlgili kanun bulundu, yanlış uygulandı.",
        "2": "Doğru madde + doğru subsumption.",
        "3": "İçtihat ile desteklendi.",
        "4": "Çelişen içtihat tartışıldı.",
      },
    },
    {
      key: "gerekce",
      label: "Gerekçelendirme",
      short: "Gerekçe",
      definition: "Önermeler arası mantıksal bağ ve çıkarım kalitesi.",
      levels: {
        "0": "Çıkarım yok.",
        "1": "Tek yönlü, eksik gerekçe.",
        "2": "Tutarlı çıkarım zinciri.",
        "3": "Karşı argüman değerlendirildi.",
        "4": "Karşı argüman çürütüldü; sonuç ölçülü.",
      },
    },
    {
      key: "risk",
      label: "Risk Farkındalığı",
      short: "Risk",
      definition: "Müvekkilin yararı/zararı, dava sonucu belirsizliği, alternatif yollar.",
      levels: {
        "0": "Risk değerlendirilmedi.",
        "1": "Tek risk anıldı.",
        "2": "Olası riskler özetlendi.",
        "3": "Riskler önceliklendirildi.",
        "4": "Beklenen değer / maliyet analizi.",
      },
    },
    {
      key: "ifade",
      label: "Hukuki İfade",
      short: "İfade",
      definition: "Terminoloji, atıf, açıklık, profesyonel ton.",
      levels: {
        "0": "Terminoloji hatalı.",
        "1": "Terminoloji kısmen doğru.",
        "2": "Doğru terminoloji, açık ifade.",
        "3": "Atıflar standart formatta.",
        "4": "Üslup dilekçe standartında.",
      },
    },
  ],
};
