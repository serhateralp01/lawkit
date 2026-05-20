import type { LegalCase } from "../types";

/**
 * Medeni Hukuk — komşuluk hukuku / taşkın kullanım + el atmanın önlenmesi.
 * Üçüncü pilot vaka. Engine'in farklı bir alanda da tutarlı çalıştığını
 * doğrular; TMK m. 730 + m. 737 kaynakları ile bağlanır.
 */
export const medeni001: LegalCase = {
  id: "medeni_001",
  title: "Komşuluk hukuku — taşkın gürültü ve el atmanın önlenmesi",
  branch: "medeni",
  difficulty: 2,
  estimatedMinutes: 9,
  rubricId: "rubric_v1",
  summary:
    "Müvekkil, apartmanının zemin katındaki dairesini 12 yıldır mesken olarak kullanıyor. Yan dairesine 8 ay önce bir kuru temizlemeci taşındı; gece 22:00'den sonra çalışan makineler, kimyasal koku ve titreşim müvekkilin uyku düzenini bozdu. Yönetime ve esnafın kendisine yapılan yazılı uyarılar sonuç vermedi.",
  facts: [
    "Müvekkil, apartmanın 1. katında 2014'ten beri ikamet ediyor.",
    "Yan daire 8 ay önce kuru temizleme dükkânına dönüştürüldü.",
    "Buhar makineleri 06:00–24:00 arası çalışıyor, gece de titreşim sürüyor.",
    "Müvekkil 3 yazılı uyarı + 2 noter ihtarı gönderdi, sonuç alamadı.",
    "Apartman yönetim planında zemin ve 1. katların 'mesken' olarak kayıtlı olduğu görülüyor.",
    "Belediyedeki ruhsat 'işyeri' olarak verilmiş; yönetim planına aykırılık var.",
  ],
  documents: [
    { label: "Noter ihtarnameleri", ref: "2 adet · 03.2026 ve 06.2026" },
    { label: "Apartman yönetim planı", ref: "Tapu Sicil — 2010 onaylı" },
    { label: "Belediye işyeri ruhsatı", ref: "08.2025 · komşu daire" },
  ],
  startNode: "n1",
  nodes: [
    {
      id: "n1",
      kind: "decision",
      prompt: "Müvekkilin önündeki uyuşmazlığın hukuki çerçevesi nedir?",
      rubricTargets: ["mesele", "maddi"],
      options: [
        {
          id: "a",
          label:
            "TMK m. 737 komşuluk hukuku + yönetim planına aykırı kullanım (KMK m. 24) çift dayanak. El atmanın önlenmesi + tazminat (TMK m. 730) talep edilebilir.",
          scores: { mesele: 4, maddi: 4 },
          feedback:
            "Doğru çerçeveleme. Hem maddi komşuluk hukuku hem kat mülkiyeti yönetim planı ihlali eş zamanlı dayanak.",
          next: "n2",
          verdict: "good",
          sources: ["tmk_m730", "tmk_m737"],
        },
        {
          id: "b",
          label: "Sadece haksız fiil (TBK m. 49) — gürültü sorumlu kişinin kusurudur.",
          scores: { mesele: 1, maddi: 1 },
          feedback:
            "Eksik. Haksız fiil teorisi uygulanabilir ama özel hüküm (TMK m. 730/737) varken genel hükme gidilmez. Ayrıca KMK boyutu kaçırılıyor.",
          next: "n2",
          verdict: "partial",
        },
        {
          id: "c",
          label:
            "Hukuki dayanak yok — esnaf belediye ruhsatına sahip, müvekkil katlanmalı.",
          scores: { mesele: 0, maddi: 0 },
          feedback:
            "Yanlış. Belediye ruhsatı özel hukuk komşuluk haklarını ortadan kaldırmaz. Yönetim planına aykırılık ruhsat varlığına rağmen geçerlidir.",
          next: "n2",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n2",
      kind: "decision",
      prompt: "Hangi talep + hangi mahkeme yolu öncelikli olmalı?",
      rubricTargets: ["usul", "gerekce"],
      options: [
        {
          id: "a",
          label:
            "Sulh Hukuk Mahkemesi'nde KMK m. 33 — yönetim planı aykırılığı + el atmanın önlenmesi davası; ihtiyati tedbir talepli.",
          scores: { usul: 4, gerekce: 3 },
          feedback:
            "Doğru. Kat mülkiyetinden doğan davalarda görevli mahkeme Sulh Hukuk (KMK m. 33). İhtiyati tedbir ile faaliyet durdurma talebi makulen istenebilir.",
          next: "n3",
          verdict: "good",
        },
        {
          id: "b",
          label:
            "Asliye Hukuk Mahkemesi'nde tazminat + el atmanın önlenmesi; ihtiyati tedbire gerek yok.",
          scores: { usul: 1, gerekce: 1 },
          feedback:
            "Eksik. Kat mülkiyeti uyuşmazlıklarında Sulh Hukuk görevli. Süregelen rahatsızlıkta ihtiyati tedbir kritik araç.",
          next: "n3",
          verdict: "partial",
        },
        {
          id: "c",
          label: "İdare Mahkemesi'nde belediye ruhsatının iptali davası.",
          scores: { usul: 0, gerekce: 0 },
          feedback:
            "Yanlış. Komşular arası özel hukuk uyuşmazlığı idari yargı konusu değildir. Ruhsat varlığı özel hukuk taleplerini engellemez.",
          next: "n3",
          verdict: "bad",
        },
      ],
    },
    {
      id: "n3",
      kind: "decision",
      prompt: "İspat ve risk yönetiminde öncelikli hamlen ne olur?",
      rubricTargets: ["risk", "ifade"],
      options: [
        {
          id: "a",
          label:
            "Bilirkişi raporu (ses-titreşim ölçümü) + tanık beyanı + noter ihtar dökümleri ile delil zinciri kur; talepleri 'eski hâle getirme + tazminat' olarak ikili kalemle yaz.",
          scores: { risk: 3, ifade: 3 },
          feedback:
            "Doğru. TMK m. 730 'eski hâle getirme' + 'zararın giderilmesi' iki ayrı taleptir. İspat zinciri objektif ölçümle güçlenir.",
          next: "n4",
          verdict: "good",
          sources: ["tmk_m730"],
        },
        {
          id: "b",
          label:
            "Sadece müvekkilin beyanı + komşu tanıklar yeterli, bilirkişiye gerek yok.",
          scores: { risk: 1, ifade: 1 },
          feedback:
            "Eksik. Subjektif rahatsızlık iddiası objektif ölçüm olmadan ispatı zayıf kalır; davalı 'yerel âdet sınırı içinde' savunması yapabilir.",
          next: "n4",
          verdict: "partial",
        },
      ],
    },
    {
      id: "n4",
      kind: "outcome",
      prompt: "Strateji notu hazır.",
      summary:
        "Sulh Hukuk Mahkemesi'nde el atmanın önlenmesi + tazminat + ihtiyati tedbir.",
      idealAnswer:
        "Birinci adım: Sulh Hukuk Mahkemesi'nde, davalı kuru temizlemeci işletmesi ve apartman yönetimi aleyhine TMK m. 730 + m. 737 ve KMK m. 24/33 dayanaklı el atmanın önlenmesi davası aç. Talepler: (a) faaliyetin yönetim planına aykırılığının tespiti, (b) gürültü/titreşim/koku kaynağı tesisatların kaldırılması veya gece çalışma yasağı, (c) çekilen rahatsızlık nedeniyle manevi tazminat. İhtiyati tedbir talep et: 22:00 sonrası makinaların durdurulması. İspat: bağımsız bilirkişiden ses + titreşim + kimyasal koku ölçüm raporu, tanık beyanı, noter ihtarları ve apartman yönetim planının onaylı sureti. Risk: 'yerel âdete uygun kaçınılmaz taşkınlık' savunmasına karşı, dairenin mesken olarak kayıtlı olduğu + ruhsatın yönetim planı incelenmeden verildiği vurgulanır. KMK m. 33 görevli mahkeme; yetki taşınmazın bulunduğu yer.",
    },
  ],
};
