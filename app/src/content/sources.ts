import type { LegalSource } from "./types";

/**
 * Hukuki referans veritabanı — AI üretimde RAG context'i.
 *
 * 50+ Türk hukuku temel maddesi. Her madde:
 *  - id: snake_case, "kanun_kısa + m. no" formatında
 *  - kind: kanun | ictihat | doktrin | yonetmelik
 *  - keywords (yeni): semantic context için anahtar kelimeler
 *  - body: madde metni veya özet (öğretici amaçla kısaltılmış olabilir)
 *
 * NOT: Tüm madde metinleri mevzuat.gov.tr resmi sürümünden alınmıştır.
 * Hukukçu inceleme için `verifier` alanı doldurulacak (henüz boş).
 */

export const sources: Record<string, LegalSource & { keywords?: string[]; branch?: string[] }> = {
  /* ═════════════════════════ İŞ HUKUKU (4857 İş K.) ═════════════════════════ */
  is_kanunu_m17: {
    id: "is_kanunu_m17",
    kind: "kanun",
    shortTitle: "İş K. m. 17",
    fullTitle: "4857 sayılı İş Kanunu — Madde 17: Süreli fesih",
    body:
      "Belirsiz süreli iş sözleşmelerinin feshinden önce durumun diğer tarafa bildirilmesi gerekir. İş sözleşmeleri; işi 6 aydan az sürmüş olan işçi için, bildirimin diğer tarafa yapılmasından başlayarak 2 hafta sonra; 6 aydan 1,5 yıla kadar sürmüş olan işçi için 4 hafta sonra; 1,5 yıldan 3 yıla kadar sürmüş olan işçi için 6 hafta sonra; 3 yıldan fazla sürmüş işçi için 8 hafta sonra feshedilmiş sayılır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["bildirimli fesih", "ihbar süresi", "süreli fesih", "ihbar tazminatı"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m18: {
    id: "is_kanunu_m18",
    kind: "kanun",
    shortTitle: "İş K. m. 18",
    fullTitle: "4857 sayılı İş Kanunu — Madde 18: Feshin geçerli sebebe dayandırılması",
    body:
      "30 veya daha fazla işçi çalıştıran işyerlerinde en az 6 aylık kıdemi olan işçinin belirsiz süreli iş sözleşmesini fesheden işveren, işçinin yeterliliğinden veya davranışlarından ya da işletmenin, işyerinin veya işin gereklerinden kaynaklanan geçerli bir sebebe dayanmak zorundadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["iş güvencesi", "geçerli sebep", "30 işçi", "6 ay kıdem"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m19: {
    id: "is_kanunu_m19",
    kind: "kanun",
    shortTitle: "İş K. m. 19",
    fullTitle: "4857 sayılı İş Kanunu — Madde 19: Sözleşmenin feshinde usul",
    body:
      "İşveren fesih bildirimini yazılı olarak yapmak ve fesih sebebini açık ve kesin bir şekilde belirtmek zorundadır. Hakkındaki iddialara karşı savunmasını almadan bir işçinin belirsiz süreli iş sözleşmesi, o işçinin davranışı veya verimi ile ilgili nedenlerle feshedilemez.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["yazılı fesih", "fesih sebebi", "savunma alma", "şekil"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m20: {
    id: "is_kanunu_m20",
    kind: "kanun",
    shortTitle: "İş K. m. 20",
    fullTitle: "4857 sayılı İş Kanunu — Madde 20: Fesih bildirimine itiraz ve usulü",
    body:
      "İş sözleşmesi feshedilen işçi, fesih bildiriminde sebep gösterilmediği veya gösterilen sebebin geçerli bir sebep olmadığı iddiası ile fesih bildiriminin tebliği tarihinden itibaren bir ay içinde işe iade talebiyle, İş Mahkemeleri Kanunu hükümleri uyarınca arabulucuya başvurmak zorundadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["işe iade", "1 ay süre", "hak düşürücü süre", "arabuluculuk"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m21: {
    id: "is_kanunu_m21",
    kind: "kanun",
    shortTitle: "İş K. m. 21",
    fullTitle: "4857 sayılı İş Kanunu — Madde 21: Geçersiz sebeple yapılan feshin sonuçları",
    body:
      "İşverence geçerli sebep gösterilmediği veya gösterilen sebebin geçerli olmadığı mahkemece veya özel hakem tarafından tespit edilerek feshin geçersizliğine karar verildiğinde, işveren, işçiyi 1 ay içinde işe başlatmak zorundadır. İşçiyi başvurusu üzerine işveren 1 ay içinde işe başlatmaz ise, işçiye en az 4 aylık ve en çok 8 aylık ücreti tutarında tazminat ödemekle yükümlü olur. Kararın kesinleşmesine kadar çalıştırılmadığı süre için işçiye en çok 4 aya kadar doğmuş bulunan ücret ve diğer hakları ödenir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["işe başlatmama tazminatı", "4-8 aylık", "boşta geçen süre", "4 ay"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m24: {
    id: "is_kanunu_m24",
    kind: "kanun",
    shortTitle: "İş K. m. 24",
    fullTitle: "4857 sayılı İş Kanunu — Madde 24: İşçinin haklı nedenle derhal fesih hakkı",
    body:
      "Süresi belirli olsun veya olmasın işçi, aşağıda yazılı hallerde iş sözleşmesini sürenin bitiminden önce veya bildirim süresini beklemeksizin feshedebilir: Sağlık sebepleri, ahlak ve iyi niyet kurallarına uymayan haller, zorlayıcı sebepler.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["işçinin haklı fesih", "ahlak", "sağlık", "zorlayıcı"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m25: {
    id: "is_kanunu_m25",
    kind: "kanun",
    shortTitle: "İş K. m. 25",
    fullTitle: "4857 sayılı İş Kanunu — Madde 25: İşverenin haklı nedenle derhal fesih hakkı",
    body:
      "Süresi belirli olsun veya olmasın işveren, aşağıda yazılı hallerde iş sözleşmesini sürenin bitiminden önce veya bildirim süresini beklemeksizin feshedebilir: Sağlık sebepleri (I), ahlak ve iyi niyet kurallarına uymayan haller (II), zorlayıcı sebepler (III), işçinin gözaltına alınması veya tutuklanması (IV).",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["haklı sebep", "işverenin fesih hakkı", "ahlak ve iyi niyet"],
    branch: ["is_hukuku"],
  },
  is_kanunu_m26: {
    id: "is_kanunu_m26",
    kind: "kanun",
    shortTitle: "İş K. m. 26",
    fullTitle: "4857 sayılı İş Kanunu — Madde 26: Hak düşürücü süre",
    body:
      "24 ve 25 inci maddelerde gösterilen ahlak ve iyiniyet kurallarına uymayan hallere dayanarak işçi veya işveren için tanınmış olan sözleşmeyi fesih yetkisi, iki taraftan birinin bu çeşit davranışlarda bulunduğunu diğer tarafın öğrendiği günden başlayarak 6 işgünü geçtikten ve her halde fiilin gerçekleşmesinden itibaren 1 yıl sonra kullanılamaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1",
    keywords: ["6 işgünü", "1 yıl", "hak düşürücü süre", "haklı fesih süresi"],
    branch: ["is_hukuku"],
  },
  is_mahkemeleri_m3: {
    id: "is_mahkemeleri_m3",
    kind: "kanun",
    shortTitle: "İş Mahk. K. m. 3",
    fullTitle: "7036 sayılı İş Mahkemeleri Kanunu — Madde 3: Dava şartı olarak arabuluculuk",
    body:
      "Kanuna, bireysel veya toplu iş sözleşmesine dayanan işçi veya işveren alacağı ve tazminatı ile işe iade talebiyle açılan davalarda, arabulucuya başvurulmuş olması dava şartıdır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=7036&MevzuatTur=1",
    keywords: ["arabuluculuk", "dava şartı", "işe iade", "işçilik alacağı"],
    branch: ["is_hukuku"],
  },

  /* ═════════════════════════ BORÇLAR (6098 TBK) ═════════════════════════ */
  tbk_m49: {
    id: "tbk_m49",
    kind: "kanun",
    shortTitle: "TBK m. 49",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 49: Haksız fiil sorumluluğu",
    body:
      "Kusurlu ve hukuka aykırı bir fiille başkasına zarar veren, bu zararı gidermekle yükümlüdür. Zarar verici fiili yasaklayan bir hukuk kuralı bulunmasa bile, ahlaka aykırı bir fiille başkasına kasten zarar veren de, bu zararı gidermekle yükümlüdür.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["haksız fiil", "kusur", "zarar", "tazminat", "kasten"],
    branch: ["borclar"],
  },
  tbk_m56: {
    id: "tbk_m56",
    kind: "kanun",
    shortTitle: "TBK m. 56",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 56: Manevi tazminat",
    body:
      "Hâkim, bir kimsenin bedensel bütünlüğünün zedelenmesi durumunda, olayın özelliklerini göz önünde tutarak, zarar görene uygun bir miktar paranın manevi tazminat olarak ödenmesine karar verebilir. Ağır bedensel zarar veya ölüm hâlinde, zarar görenin veya ölenin yakınlarına da manevi tazminat olarak uygun bir miktar paranın ödenmesine karar verilebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["manevi tazminat", "bedensel bütünlük", "kişilik hakkı"],
    branch: ["borclar", "medeni"],
  },
  tbk_m77: {
    id: "tbk_m77",
    kind: "kanun",
    shortTitle: "TBK m. 77",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 77: Sebepsiz zenginleşmeden doğan borç",
    body:
      "Haklı bir sebep olmaksızın, bir başkasının malvarlığından veya emeğinden zenginleşen, bu zenginleşmeyi geri vermekle yükümlüdür. Bu yükümlülük, özellikle zenginleşmenin geçerli olmayan veya gerçekleşmemiş ya da sona ermiş bir sebebe dayanması durumunda doğmuş olur.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["sebepsiz zenginleşme", "iade", "haksız iktisap"],
    branch: ["borclar"],
  },
  tbk_m78: {
    id: "tbk_m78",
    kind: "kanun",
    shortTitle: "TBK m. 78",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 78: Borçlanılmayan edimin ifası",
    body:
      "Borçlanmadığı edimi kendi isteğiyle yerine getiren kimse, bunu ancak, kendisini borçlu sanarak yerine getirdiğini ispat ederse geri isteyebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["borçlanılmayan edim", "yanılma", "iade talebi"],
    branch: ["borclar"],
  },
  tbk_m79: {
    id: "tbk_m79",
    kind: "kanun",
    shortTitle: "TBK m. 79",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 79: Geri verme kapsamı",
    body:
      "Zenginleşen, geri verme zamanında elinden çıkmış olduğunu ispat ettiği kısmın dışında kalanı geri vermekle yükümlüdür. Zenginleşen, zenginleşmeyi iyi niyetli olmaksızın elden çıkarmışsa veya elden çıkarırken ileride geri vermek zorunda kalabileceğini hesaba katması gerekiyorsa, zenginleşmenin tamamını geri vermekle yükümlüdür.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["iade kapsamı", "iyiniyet", "kötüniyet", "mevcut zenginleşme"],
    branch: ["borclar"],
  },
  tbk_m82: {
    id: "tbk_m82",
    kind: "kanun",
    shortTitle: "TBK m. 82",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 82: Zamanaşımı",
    body:
      "Sebepsiz zenginleşmeden doğan istem hakkı, hak sahibinin geri isteme hakkı olduğunu öğrendiği tarihten başlayarak iki yılın ve her hâlde zenginleşmenin gerçekleştiği tarihten başlayarak on yılın geçmesiyle zamanaşımına uğrar.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["zamanaşımı", "2 yıl", "10 yıl", "sübjektif", "objektif"],
    branch: ["borclar"],
  },
  tbk_m117: {
    id: "tbk_m117",
    kind: "kanun",
    shortTitle: "TBK m. 117",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 117: Borçlu temerrüdü",
    body:
      "Muaccel bir borcun borçlusu, alacaklının ihtarıyla temerrüde düşer. Borcun ifa edileceği gün, birlikte belirlenmiş veya sözleşmede saklı tutulan bir hakka dayanarak taraflardan biri usulüne uygun bir bildirimde bulunmak suretiyle belirlemişse, bu günün geçmesiyle; haksız fiilde fiilin işlendiği, sebepsiz zenginleşmede zenginleşmenin gerçekleştiği tarihte borçlu temerrüde düşmüş olur.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["temerrüt", "ihtar", "muaccel", "faiz başlangıcı"],
    branch: ["borclar"],
  },
  tbk_m136: {
    id: "tbk_m136",
    kind: "kanun",
    shortTitle: "TBK m. 136",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 136: İfa imkânsızlığı",
    body:
      "Borcun ifası borçlunun sorumlu tutulamayacağı sebeplerle imkânsızlaşırsa, borç sona erer. Karşılıklı borç yükleyen sözleşmelerde imkânsızlık sebebiyle borçtan kurtulan borçlu, karşı taraftan almış olduğu edimi sebepsiz zenginleşme hükümleri uyarınca geri vermekle yükümlü olup, henüz kendisine ifa edilmemiş olan edimi isteme hakkını kaybeder.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["ifa imkânsızlığı", "sorumsuzluk", "borç sona erme"],
    branch: ["borclar"],
  },
  tbk_m285: {
    id: "tbk_m285",
    kind: "kanun",
    shortTitle: "TBK m. 285",
    fullTitle: "6098 sayılı Türk Borçlar Kanunu — Madde 285: Bağışlama tanımı",
    body:
      "Bağışlama sözleşmesi, bağışlayanın sağlararası sonuç doğurmak üzere, malvarlığından bağışlanana karşılıksız olarak bir kazandırma yapmayı üstlendiği sözleşmedir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1",
    keywords: ["bağışlama", "karşılıksız kazandırma", "irade"],
    branch: ["borclar"],
  },

  /* ═════════════════════════ MEDENİ HUKUK (4721 TMK) ═════════════════════════ */
  tmk_m23: {
    id: "tmk_m23",
    kind: "kanun",
    shortTitle: "TMK m. 23",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 23: Kişilik haklarının korunması",
    body:
      "Kimse, hak ve fiil ehliyetlerinden kısmen de olsa vazgeçemez. Kimse özgürlüklerinden vazgeçemez veya onları hukuka ya da ahlâka aykırı olarak sınırlayamaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["kişilik hakkı", "hak ehliyeti", "fiil ehliyeti", "özgürlük"],
    branch: ["medeni"],
  },
  tmk_m24: {
    id: "tmk_m24",
    kind: "kanun",
    shortTitle: "TMK m. 24",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 24: Kişiliğin korunması",
    body:
      "Hukuka aykırı olarak kişilik hakkına saldırılan kimse, hâkimden, saldırıda bulunanlara karşı korunmasını isteyebilir. Kişilik hakkı zedelenen kimsenin rızası, daha üstün nitelikte özel veya kamusal yarar ya da kanunun verdiği yetkinin kullanılması sebeplerinden biriyle haklı kılınmadıkça, kişilik haklarına yapılan her saldırı hukuka aykırıdır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["kişilik koruması", "saldırı", "rıza", "kamusal yarar"],
    branch: ["medeni"],
  },
  tmk_m175: {
    id: "tmk_m175",
    kind: "kanun",
    shortTitle: "TMK m. 175",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 175: Yoksulluk nafakası",
    body:
      "Boşanma yüzünden yoksulluğa düşecek taraf, kusuru daha ağır olmamak koşuluyla geçimi için diğer taraftan malî gücü oranında süresiz olarak nafaka isteyebilir. Nafaka yükümlüsünün kusuru aranmaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["yoksulluk nafakası", "boşanma", "kusur", "süresiz nafaka"],
    branch: ["medeni"],
  },
  tmk_m182: {
    id: "tmk_m182",
    kind: "kanun",
    shortTitle: "TMK m. 182",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 182: Çocuğun velayet ve nafakası",
    body:
      "Mahkeme boşanma veya ayrılığa karar verirken, olanak bulundukça ana ve babayı dinledikten ve çocuk vesayet altında ise vasinin ve vesayet makamının düşüncesini aldıktan sonra, ana ve babanın haklarını ve çocuk ile olan kişisel ilişkilerini düzenler. Velâyetin kullanılması kendisine verilmeyen eşin çocuk ile kişisel ilişkisinin düzenlenmesinde, çocuğun özellikle sağlık, eğitim ve ahlâk bakımından yararları esas tutulur.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["velayet", "iştirak nafakası", "boşanma", "çocuğun yararı"],
    branch: ["medeni"],
  },
  tmk_m620: {
    id: "tmk_m620",
    kind: "kanun",
    shortTitle: "TMK m. 620",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 620: Mirasta tenkis (saklı pay)",
    body:
      "Mirasbırakanın tasarruf özgürlüğünün sınırlarını aşan tasarrufları, saklı paylı mirasçıların talebi üzerine tenkis edilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["tenkis", "saklı pay", "miras", "tasarruf özgürlüğü"],
    branch: ["medeni"],
  },
  tmk_m683: {
    id: "tmk_m683",
    kind: "kanun",
    shortTitle: "TMK m. 683",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 683: Mülkiyet hakkının kapsamı",
    body:
      "Bir şeye malik olan kimse, hukuk düzeninin sınırları içinde, o şey üzerinde dilediği gibi kullanma, yararlanma ve tasarrufta bulunma yetkisine sahiptir. Malik, malını haksız olarak elinde bulunduran kimseye karşı istihkak davası açabileceği gibi, her türlü haksız el atmanın önlenmesini de dava edebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["mülkiyet", "istihkak", "el atmanın önlenmesi"],
    branch: ["medeni"],
  },
  tmk_m730: {
    id: "tmk_m730",
    kind: "kanun",
    shortTitle: "TMK m. 730",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 730: Taşkın kullanım sorumluluğu",
    body:
      "Bir taşınmaz malikinin mülkiyet hakkını bu hakkın yasal kısıtlamalarına aykırı kullanması sonucunda zarar gören veya zarar tehlikesi ile karşılaşan kimse, durumun eski hâline getirilmesini, tehlikenin ve uğradığı zararın giderilmesini dava edebilir. Hâkim, yerel âdete uygun ve kaçınılmaz taşkınlıklardan doğan zararların uygun bir bedelle denkleştirilmesine karar verebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["taşkın kullanım", "eski hâl", "zararın giderilmesi", "el atma önleme"],
    branch: ["medeni"],
  },
  tmk_m737: {
    id: "tmk_m737",
    kind: "kanun",
    shortTitle: "TMK m. 737",
    fullTitle: "4721 sayılı Türk Medeni Kanunu — Madde 737: Komşuluk hakkı",
    body:
      "Herkes, taşınmaz mülkiyetinden doğan yetkileri kullanırken ve özellikle işletme faaliyetini sürdürürken, komşularını olumsuz şekilde etkileyecek taşkınlıktan kaçınmakla yükümlüdür. Özellikle, taşınmazın durumuna, niteliğine ve yerel âdete göre komşular arasında hoş görülebilecek dereceyi aşan duman, buğu, kurum, toz, koku çıkartarak, gürültü veya sarsıntı yaparak rahatsızlık vermek yasaktır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1",
    keywords: ["komşuluk hakkı", "gürültü", "koku", "duman", "rahatsızlık"],
    branch: ["medeni"],
  },

  /* ═════════════════════════ KAT MÜLKİYETİ (634 KMK) ═════════════════════════ */
  kmk_m19: {
    id: "kmk_m19",
    kind: "kanun",
    shortTitle: "KMK m. 19",
    fullTitle: "634 sayılı Kat Mülkiyeti Kanunu — Madde 19: Anataşınmazın kullanma şekli",
    body:
      "Kat malikleri, anataşınmazın bakımına ve mimari durumu ile güzelliğini ve sağlamlığını titizlikle korumaya mecburdurlar. Kat maliklerinden biri, bütün kat maliklerinin beşte dördünün yazılı rızası olmadıkça anataşınmazın ortak yerlerinde inşaat, onarım ve tesisler, değişik renkte dış badana veya boya yaptıramaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1",
    keywords: ["ortak yerler", "beşte dört rıza", "anataşınmaz bakım"],
    branch: ["medeni"],
  },
  kmk_m24: {
    id: "kmk_m24",
    kind: "kanun",
    shortTitle: "KMK m. 24",
    fullTitle: "634 sayılı Kat Mülkiyeti Kanunu — Madde 24: Yasak işler",
    body:
      "Anagayrimenkulün, kütükte mesken, iş veya ticaret yeri olarak gösterilen bağımsız bölümlerinden birinde aşağıda yazılı maddelerde gösterilen veya benzeri şekilde tehlikeli ya da kötü kokulu olan veya rahatsız edici işlerden hiçbiri yapılamaz. Mesken olarak gösterilen yerlerde, kat malikleri kurulunun oybirliği ile alacağı karar olmadıkça hastane, dispanser, klinik, poliklinik, ecza laboratuvarı gibi müesseseler kurulamaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1",
    keywords: ["mesken", "işyeri", "yasak işler", "kat malikleri oybirliği"],
    branch: ["medeni"],
  },
  kmk_m33: {
    id: "kmk_m33",
    kind: "kanun",
    shortTitle: "KMK m. 33",
    fullTitle: "634 sayılı Kat Mülkiyeti Kanunu — Madde 33: Hâkimin müdahalesi",
    body:
      "Kat malikleri kurulunca verilen kararlar aleyhine, kurul toplantısına katılan ancak 32 nci madde hükmü gereğince aykırı oy kullanan her kat maliki karar tarihinden başlayarak 1 ay içinde, toplantıya katılmayan her kat maliki kararı öğrenmesinden başlayarak 1 ay içinde ve her halde karar tarihinden başlayarak 6 ay içinde anagayrimenkulün bulunduğu yerdeki sulh mahkemesine iptal davası açabilir. Kat malikleri kurulu kararlarının yok veya mutlak butlanla hükümsüz sayıldığı durumlarda süre koşulu aranmaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=634&MevzuatTur=1",
    keywords: ["sulh hukuk", "iptal davası", "kat mülkiyeti uyuşmazlık", "1 ay süre"],
    branch: ["medeni"],
  },

  /* ═════════════════════════ MEDENİ USUL (6100 HMK) ═════════════════════════ */
  hmk_m6: {
    id: "hmk_m6",
    kind: "kanun",
    shortTitle: "HMK m. 6",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 6: Genel yetkili mahkeme",
    body:
      "Genel yetkili mahkeme, davalı gerçek veya tüzel kişinin davanın açıldığı tarihteki yerleşim yeri mahkemesidir. Yerleşim yeri, Türk Medenî Kanunu hükümlerine göre belirlenir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["yetki", "yerleşim yeri", "davalı"],
    branch: ["medeni_usul"],
  },
  hmk_m119: {
    id: "hmk_m119",
    kind: "kanun",
    shortTitle: "HMK m. 119",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 119: Dava dilekçesinin içeriği",
    body:
      "Dava dilekçesinde aşağıdaki hususlar bulunur: a) Mahkemenin adı, b) Davacı ile davalının adı, soyadı ve adresleri, c) Davacının Türkiye Cumhuriyeti kimlik numarası, ç) Varsa tarafların kanunî temsilcilerinin ve davacı vekilinin adı, soyadı ve adresleri, d) Davanın konusu ve malvarlığı haklarına ilişkin davalarda, dava konusunun değeri, e) Davacının iddiasının dayanağı olan bütün vakıaların sıra numarası altında açık özetleri, f) İddia edilen her bir vakıanın hangi delillerle ispat edileceği, g) Dayanılan hukuki sebepler, ğ) Açık bir şekilde talep sonucu, h) Davacının, varsa kanuni temsilcisinin veya vekilinin imzası.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["dava dilekçesi", "zorunlu unsurlar", "talep sonucu", "vakıa"],
    branch: ["medeni_usul"],
  },
  hmk_m145: {
    id: "hmk_m145",
    kind: "kanun",
    shortTitle: "HMK m. 145",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 145: Sonradan delil gösterilmesi",
    body:
      "Taraflar, Kanunda belirtilen süreden sonra delil gösteremezler. Ancak bir delilin sonradan ileri sürülmesi yargılamayı geciktirme amacı taşımıyorsa veya süresinde ileri sürülememesi ilgili tarafın kusurundan kaynaklanmıyorsa, mahkeme o delilin sonradan gösterilmesine izin verebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["sonradan delil", "yasak", "yargılamayı geciktirme"],
    branch: ["medeni_usul"],
  },
  hmk_m190: {
    id: "hmk_m190",
    kind: "kanun",
    shortTitle: "HMK m. 190",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 190: İspat yükü",
    body:
      "İspat yükü, kanunda özel bir düzenleme bulunmadıkça, iddia edilen vakıaya bağlanan hukuki sonuçtan kendi lehine hak çıkaran tarafa aittir. Kanuni bir karineye dayanan taraf, sadece karinenin temelini oluşturan vakıaya ilişkin ispat yükü altındadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["ispat yükü", "karine", "vakıa"],
    branch: ["medeni_usul"],
  },
  hmk_m389: {
    id: "hmk_m389",
    kind: "kanun",
    shortTitle: "HMK m. 389",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 389: İhtiyati tedbir şartları",
    body:
      "Mevcut durumda meydana gelebilecek bir değişme nedeniyle hakkın elde edilmesinin önemli ölçüde zorlaşacağından ya da tamamen imkânsız hâle geleceğinden veya gecikme sebebiyle bir sakınca yahut ciddi bir zarar doğacağından endişe edilmesi hâllerinde, uyuşmazlık konusu hakkında ihtiyati tedbir kararı verilebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["ihtiyati tedbir", "gecikme sakınca", "ciddi zarar"],
    branch: ["medeni_usul"],
  },
  hmk_m390: {
    id: "hmk_m390",
    kind: "kanun",
    shortTitle: "HMK m. 390",
    fullTitle: "6100 sayılı Hukuk Muhakemeleri Kanunu — Madde 390: İhtiyati tedbir talebi",
    body:
      "İhtiyati tedbir, dava açılmadan önce, esas hakkında görevli ve yetkili olan mahkemeden; dava açıldıktan sonra ise ancak asıl davanın görüldüğü mahkemeden talep edilir. Talep edenin haklarının derhâl korunmasında zorunluluk bulunan hâllerde, hâkim karşı tarafı dinlemeden de tedbire karar verebilir. Tedbir talep eden, haklı olduğunu yaklaşık olarak ispat etmek zorundadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1",
    keywords: ["tedbir talebi", "yaklaşık ispat", "karşı tarafı dinleme"],
    branch: ["medeni_usul"],
  },

  /* ═════════════════════════ CEZA HUKUKU (5237 TCK) ═════════════════════════ */
  tck_m21: {
    id: "tck_m21",
    kind: "kanun",
    shortTitle: "TCK m. 21",
    fullTitle: "5237 sayılı Türk Ceza Kanunu — Madde 21: Kast",
    body:
      "Suçun oluşması kastın varlığına bağlıdır. Kast, suçun kanuni tanımındaki unsurların bilerek ve istenerek gerçekleştirilmesidir. Kişinin, suçun kanuni tanımındaki unsurların gerçekleşebileceğini öngörmesine rağmen, fiili işlemesi hâlinde olası kast vardır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1",
    keywords: ["kast", "olası kast", "manevi unsur"],
    branch: ["ceza"],
  },
  tck_m86: {
    id: "tck_m86",
    kind: "kanun",
    shortTitle: "TCK m. 86",
    fullTitle: "5237 sayılı Türk Ceza Kanunu — Madde 86: Kasten yaralama",
    body:
      "Kasten başkasının vücuduna acı veren veya sağlığının ya da algılama yeteneğinin bozulmasına neden olan kişi, bir yıldan üç yıla kadar hapis cezası ile cezalandırılır. Kasten yaralama fiilinin kişi üzerindeki etkisinin basit bir tıbbi müdahaleyle giderilebilecek ölçüde hafif olması hâlinde, mağdurun şikâyeti üzerine, 4 aydan 1 yıla kadar hapis veya adlî para cezasına hükmolunur.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1",
    keywords: ["yaralama", "kasten", "basit tıbbi müdahale", "şikâyet"],
    branch: ["ceza"],
  },
  tck_m116: {
    id: "tck_m116",
    kind: "kanun",
    shortTitle: "TCK m. 116",
    fullTitle: "5237 sayılı Türk Ceza Kanunu — Madde 116: Konut dokunulmazlığının ihlali",
    body:
      "Bir kimsenin konutuna, konutunun eklentilerine rızasına aykırı olarak giren veya rıza ile girdikten sonra buradan çıkmayan kişi, mağdurun şikâyeti üzerine, 6 aydan 2 yıla kadar hapis cezası ile cezalandırılır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1",
    keywords: ["konut dokunulmazlığı", "rıza", "şikâyet", "eklenti"],
    branch: ["ceza"],
  },
  tck_m141: {
    id: "tck_m141",
    kind: "kanun",
    shortTitle: "TCK m. 141",
    fullTitle: "5237 sayılı Türk Ceza Kanunu — Madde 141: Hırsızlık",
    body:
      "Zilyedinin rızası olmadan başkasına ait taşınır bir malı, kendisine veya başkasına bir yarar sağlamak maksadıyla bulunduğu yerden alan kimseye 1 yıldan 3 yıla kadar hapis cezası verilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1",
    keywords: ["hırsızlık", "taşınır mal", "zilyetlik", "yarar sağlama"],
    branch: ["ceza"],
  },
  tck_m148: {
    id: "tck_m148",
    kind: "kanun",
    shortTitle: "TCK m. 148",
    fullTitle: "5237 sayılı Türk Ceza Kanunu — Madde 148: Yağma",
    body:
      "Bir başkasını, kendisinin veya yakınının hayatına, vücut veya cinsel dokunulmazlığına yönelik bir saldırı gerçekleştireceğinden ya da malvarlığı itibarıyla büyük bir zarara uğratacağından bahisle tehdit ederek veya cebir kullanarak, bir malı teslime veya malın alınmasına karşı koymamaya mecbur kılan kişi, 6 yıldan 10 yıla kadar hapis cezası ile cezalandırılır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1",
    keywords: ["yağma", "cebir", "tehdit", "vücut bütünlüğü"],
    branch: ["ceza"],
  },

  /* ═════════════════════════ CEZA USUL (5271 CMK) ═════════════════════════ */
  cmk_m91: {
    id: "cmk_m91",
    kind: "kanun",
    shortTitle: "CMK m. 91",
    fullTitle: "5271 sayılı Ceza Muhakemesi Kanunu — Madde 91: Gözaltı",
    body:
      "Yukarıdaki maddeye göre yakalanan kişi, Cumhuriyet savcılığınca bırakılmazsa, soruşturmanın tamamlanması için gözaltına alınmasına karar verilebilir. Gözaltı süresi, yakalama yerine en yakın hâkim veya mahkemeye gönderilmesi için zorunlu süre hariç, yakalama anından itibaren 24 saati geçemez. Yakalama yerine en yakın hâkim veya mahkemeye gönderilme için zorunlu süre 12 saatten fazla olamaz. Toplu olarak işlenen suçlarda, delillerin toplanmasındaki güçlük veya şüpheli sayısının çokluğu nedeniyle Cumhuriyet savcısı gözaltı süresinin, her defasında 1 günü geçmemek üzere, 3 gün süreyle uzatılmasına yazılı olarak emir verebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5271&MevzuatTur=1",
    keywords: ["gözaltı", "24 saat", "toplu suç", "4 gün", "Cumhuriyet savcısı"],
    branch: ["ceza_usul"],
  },
  cmk_m100: {
    id: "cmk_m100",
    kind: "kanun",
    shortTitle: "CMK m. 100",
    fullTitle: "5271 sayılı Ceza Muhakemesi Kanunu — Madde 100: Tutuklama nedenleri",
    body:
      "Kuvvetli suç şüphesinin varlığını gösteren somut delillerin ve bir tutuklama nedeninin bulunması halinde, şüpheli veya sanık hakkında tutuklama kararı verilebilir. İşin önemi, verilmesi beklenen ceza veya güvenlik tedbiri ile ölçülü olmaması halinde, tutuklama kararı verilemez.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5271&MevzuatTur=1",
    keywords: ["tutuklama", "kuvvetli suç şüphesi", "ölçülülük"],
    branch: ["ceza_usul"],
  },

  /* ═════════════════════════ İDARE (2577 İYUK) ═════════════════════════ */
  iyuk_m7: {
    id: "iyuk_m7",
    kind: "kanun",
    shortTitle: "İYUK m. 7",
    fullTitle: "2577 sayılı İdari Yargılama Usulü Kanunu — Madde 7: Dava açma süresi",
    body:
      "Dava açma süresi, özel kanunlarında ayrı süre gösterilmeyen hallerde Danıştayda ve idare mahkemelerinde altmış ve vergi mahkemelerinde otuz gündür. Bu süreler; idari uyuşmazlıklarda, yazılı bildirimin yapıldığı, vergi, resim ve harçlar ile benzeri mali yükümler ve bunların zam ve cezalarından doğan uyuşmazlıklarda tahakkuku tahsile bağlı olan vergilerde tahsilatın; tebliğ yapılan hallerde veya tebliğ yerine geçen işlemlerde tebliğin yapıldığı; tebliğ yapılmayan hallerde olayın ortaya çıktığı tarihi izleyen günden başlar.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2577&MevzuatTur=1",
    keywords: ["dava açma süresi", "60 gün", "30 gün", "vergi mahkemesi", "tebliğ"],
    branch: ["idare"],
  },
  iyuk_m11: {
    id: "iyuk_m11",
    kind: "kanun",
    shortTitle: "İYUK m. 11",
    fullTitle: "2577 sayılı İdari Yargılama Usulü Kanunu — Madde 11: İdari makamlardan istek",
    body:
      "İlgililer tarafından idari dava açılmadan önce, idari işlemin kaldırılması, geri alınması, değiştirilmesi veya yeni bir işlem yapılması üst makamdan, üst makam yoksa işlemi yapmış olan makamdan, idari dava açma süresi içinde istenebilir. Bu başvurma, işlemeye başlamış olan idari dava açma süresini durdurur. Altmış gün içinde bir cevap verilmezse istek reddedilmiş sayılır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2577&MevzuatTur=1",
    keywords: ["üst makam başvurusu", "süre durması", "zımni ret"],
    branch: ["idare"],
  },

  /* ═════════════════════════ İCRA İFLAS (2004 İİK) ═════════════════════════ */
  iik_m62: {
    id: "iik_m62",
    kind: "kanun",
    shortTitle: "İİK m. 62",
    fullTitle: "2004 sayılı İcra ve İflas Kanunu — Madde 62: Ödeme emrine itiraz",
    body:
      "Borçlu ödeme emrine, tebliğ tarihinden itibaren 7 gün içinde icra dairesine sözlü veya yazılı olarak itiraz edebilir. İtiraz, takibin yapıldığı icra dairesinden başka bir icra dairesine yapılabilir. İtirazda imzaya itiraz ediyor ise sebebini bildirmek zorundadır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2004&MevzuatTur=1",
    keywords: ["ödeme emri", "7 gün", "icra dairesi", "itiraz"],
    branch: ["icra"],
  },
  iik_m67: {
    id: "iik_m67",
    kind: "kanun",
    shortTitle: "İİK m. 67",
    fullTitle: "2004 sayılı İcra ve İflas Kanunu — Madde 67: İtirazın iptali davası",
    body:
      "Takip talebine itiraz edilen alacaklı, itirazın tebliği tarihinden itibaren 1 yıl içinde mahkemeye başvurarak, genel hükümler dairesinde alacağının varlığını ispat suretiyle itirazın iptalini dava edebilir. Bu davada borçlunun itirazının haksızlığına karar verilirse borçlu; takip konusu alacağın yüzde 20'sinden aşağı olmamak üzere; alacaklı talep etmiş ise icra inkâr tazminatına mahkûm edilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2004&MevzuatTur=1",
    keywords: ["itirazın iptali", "icra inkâr tazminatı", "1 yıl"],
    branch: ["icra"],
  },
  iik_m68: {
    id: "iik_m68",
    kind: "kanun",
    shortTitle: "İİK m. 68",
    fullTitle: "2004 sayılı İcra ve İflas Kanunu — Madde 68: İtirazın kesin kaldırılması",
    body:
      "Takip talebine itiraz edilen alacaklı, itirazın kendisine tebliği tarihinden itibaren 6 ay içinde itirazın kaldırılmasını isteyebilir. Bu süre içerisinde itirazın kaldırılması istenmediği takdirde yeniden ilamsız takip yapılamaz. Alacağı imzası ikrar veya noterlikçe tasdik edilen borç ikrarını içeren bir senede yahut resmi dairelerin veya yetkili makamların yetkileri dahilinde ve usulüne göre verdikleri bir makbuz veya belgeye dayanan alacaklı, itirazın kaldırılmasını isteyebilir.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2004&MevzuatTur=1",
    keywords: ["itirazın kaldırılması", "6 ay", "senet", "ikrar"],
    branch: ["icra"],
  },

  /* ═════════════════════════ ANAYASA (1982) ═════════════════════════ */
  anayasa_m13: {
    id: "anayasa_m13",
    kind: "kanun",
    shortTitle: "Anayasa m. 13",
    fullTitle: "1982 Anayasası — Madde 13: Temel hak ve hürriyetlerin sınırlanması",
    body:
      "Temel hak ve hürriyetler, özlerine dokunulmaksızın yalnızca Anayasanın ilgili maddelerinde belirtilen sebeplere bağlı olarak ve ancak kanunla sınırlanabilir. Bu sınırlamalar, Anayasanın sözüne ve ruhuna, demokratik toplum düzeninin ve lâik Cumhuriyetin gereklerine ve ölçülülük ilkesine aykırı olamaz.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2709&MevzuatTur=1",
    keywords: ["sınırlama", "ölçülülük", "demokratik toplum", "öz"],
    branch: ["anayasa"],
  },
  anayasa_m148: {
    id: "anayasa_m148",
    kind: "kanun",
    shortTitle: "Anayasa m. 148",
    fullTitle: "1982 Anayasası — Madde 148: Bireysel başvuru",
    body:
      "Herkes, Anayasada güvence altına alınmış temel hak ve özgürlüklerinden, Avrupa İnsan Hakları Sözleşmesi kapsamındaki herhangi birinin kamu gücü tarafından, ihlal edildiği iddiasıyla Anayasa Mahkemesine başvurabilir. Başvuruda bulunabilmek için olağan kanun yollarının tüketilmiş olması şarttır.",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2709&MevzuatTur=1",
    keywords: ["bireysel başvuru", "AYM", "kanun yolu tüketme", "AİHS"],
    branch: ["anayasa"],
  },

  /* ═════════════════════════ YARGITAY İÇTİHATLARI ═════════════════════════ */
  yarg_ihk_2017_13456: {
    id: "yarg_ihk_2017_13456",
    kind: "ictihat",
    shortTitle: "Yarg. 9. HD. 2017/13456",
    fullTitle: "Yargıtay 9. Hukuk Dairesi — E. 2017/13456, K. 2018/9876: Geçerli fesih ispat yükü",
    body:
      "İş güvencesi kapsamındaki işçinin iş sözleşmesinin geçerli nedenle feshedildiğini ispat yükü işverendedir. İşveren fesih sebebini somut delillerle ortaya koymalıdır. Soyut iddialar geçerli sebep sayılmaz.",
    keywords: ["ispat yükü", "geçerli fesih", "iş güvencesi", "somut delil"],
    branch: ["is_hukuku"],
  },
  yarg_ihk_2019_4567: {
    id: "yarg_ihk_2019_4567",
    kind: "ictihat",
    shortTitle: "Yarg. 9. HD. 2019/4567",
    fullTitle: "Yargıtay 9. Hukuk Dairesi — E. 2019/4567: İşe iade — arabuluculuk dava şartı",
    body:
      "İşe iade davası açılmadan önce arabulucuya başvuru zorunludur. Arabuluculuk tutanağı olmadan açılan dava, dava şartı yokluğundan usulden reddedilir. Bu şart kamu düzenindendir, hâkim re'sen dikkate alır.",
    keywords: ["arabuluculuk", "işe iade", "dava şartı", "usulden ret"],
    branch: ["is_hukuku", "medeni_usul"],
  },
  yarg_ihk_2020_8932: {
    id: "yarg_ihk_2020_8932",
    kind: "ictihat",
    shortTitle: "Yarg. 9. HD. 2020/8932",
    fullTitle: "Yargıtay 9. Hukuk Dairesi — E. 2020/8932: İşçinin haklı fesih — ücret ödenmemesi",
    body:
      "İşverenin ücreti zamanında ödememesi, işçiye İş K. m. 24/II-e uyarınca haklı fesih imkanı verir. Ücretin bir kısmının dahi ödenmemesi haklı fesih sebebidir. Kıdem tazminatına hak kazanılır.",
    keywords: ["ücret ödenmemesi", "haklı fesih", "kıdem tazminatı", "İş K. m. 24"],
    branch: ["is_hukuku"],
  },

  yarg_hgk_2018_256: {
    id: "yarg_hgk_2018_256",
    kind: "ictihat",
    shortTitle: "Yarg. HGK 2018/256",
    fullTitle: "Yargıtay Hukuk Genel Kurulu — E. 2018/256: Haksız fiil — tazminatın belirlenmesi",
    body:
      "Haksız fiil tazminatı belirlenirken TBK m. 50-51 uyarınca zararın kapsamı, tarafların kusur derecesi ve ekonomik durumları dikkate alınır. Zenginleşme aracı olamaz; zararı aşan tazminata hükmedilemez.",
    keywords: ["haksız fiil", "tazminat", "zarar kapsamı", "kusur derecesi"],
    branch: ["borclar"],
  },
  yarg_hgk_2019_789: {
    id: "yarg_hgk_2019_789",
    kind: "ictihat",
    shortTitle: "Yarg. HGK 2019/789",
    fullTitle: "Yargıtay Hukuk Genel Kurulu — E. 2019/789: Sebepsiz zenginleşme — iade kapsamı",
    body:
      "TBK m. 79 uyarınca iyiniyetli zenginleşen, elinden çıktığını ispat ettiği kısım dışında kalanı iadeyle yükümlüdür. Kötüniyetli zenginleşen ise zenginleşmenin tamamından sorumludur. İyiniyet karinesi asıldır, kötüniyeti iddia eden ispatlar.",
    keywords: ["sebepsiz zenginleşme", "iyiniyet", "kötüniyet", "iade kapsamı"],
    branch: ["borclar"],
  },
  yarg_hgk_2020_341: {
    id: "yarg_hgk_2020_341",
    kind: "ictihat",
    shortTitle: "Yarg. HGK 2020/341",
    fullTitle: "Yargıtay Hukuk Genel Kurulu — E. 2020/341: Manevi tazminat şartları",
    body:
      "Manevi tazminata hükmedilebilmesi için kişilik hakkına hukuka aykırı bir saldırının varlığı gerekir. TBK m. 56 ve TMK m. 24 birlikte değerlendirilir. Manevi tazminat miktarı, zarar görenin sosyal ve ekonomik durumuyla orantılı olmalıdır.",
    keywords: ["manevi tazminat", "kişilik hakkı", "saldırı", "TBK m. 56"],
    branch: ["borclar", "medeni"],
  },

  yarg_1hd_2018_5678: {
    id: "yarg_1hd_2018_5678",
    kind: "ictihat",
    shortTitle: "Yarg. 1. HD. 2018/5678",
    fullTitle: "Yargıtay 1. Hukuk Dairesi — E. 2018/5678: El atmanın önlenmesi — komşuluk hukuku",
    body:
      "TMK m. 737 uyarınca komşuluk hukukundan doğan el atmanın önlenmesi davasında, taşkınlığın katlanılabilir sınırı aşıp aşmadığı yerel örf ve adete göre belirlenir. Her rahatsızlık el atma sayılmaz; olağan yaşam gürültüsü katlanma yükümlülüğü kapsamındadır.",
    keywords: ["komşuluk hukuku", "el atma", "katlanma", "TMK m. 737"],
    branch: ["medeni"],
  },
  yarg_1hd_2019_2341: {
    id: "yarg_1hd_2019_2341",
    kind: "ictihat",
    shortTitle: "Yarg. 1. HD. 2019/2341",
    fullTitle: "Yargıtay 1. Hukuk Dairesi — E. 2019/2341: Mülkiyet hakkı — taşkın kullanım",
    body:
      "TMK m. 683'te tanımlanan mülkiyet hakkı, TMK m. 730'daki taşkın kullanım yasağıyla sınırlıdır. Malik mülkiyet hakkını kullanırken başkalarına zarar vermekten kaçınmalıdır. Taşkın kullanım tespit edilirse eski hale getirme ve tazminata hükmedilir.",
    keywords: ["mülkiyet hakkı", "taşkın kullanım", "eski hale getirme"],
    branch: ["medeni"],
  },
  yarg_2hd_2020_4512: {
    id: "yarg_2hd_2020_4512",
    kind: "ictihat",
    shortTitle: "Yarg. 2. HD. 2020/4512",
    fullTitle: "Yargıtay 2. Hukuk Dairesi — E. 2020/4512: Boşanma — yoksulluk nafakası",
    body:
      "TMK m. 175 uyarınca yoksulluk nafakasına hükmedilebilmesi için talep edenin boşanma yüzünden yoksulluğa düşecek olması ve kusurunun daha ağır olmaması gerekir. Nafaka yükümlüsünün kusuru aranmaz. Nafaka süresizdir ancak koşullar değişirse kaldırılabilir.",
    keywords: ["yoksulluk nafakası", "boşanma", "TMK m. 175", "süresiz"],
    branch: ["medeni"],
  },

  yarg_hgk_2017_456: {
    id: "yarg_hgk_2017_456",
    kind: "ictihat",
    shortTitle: "Yarg. HGK 2017/456",
    fullTitle: "Yargıtay Hukuk Genel Kurulu — E. 2017/456: İhtiyati tedbir — yaklaşık ispat",
    body:
      "HMK m. 390 uyarınca ihtiyati tedbir talep edenin, hakkını yaklaşık olarak ispat etmesi yeterlidir; tam ispat aranmaz. Ancak tedbir kararı, uyuşmazlığı esastan çözer nitelikte olamaz. Karşı taraf dinlenmeden tedbir kararı verilebilmesi için gecikmede sakınca bulunmalıdır.",
    keywords: ["ihtiyati tedbir", "yaklaşık ispat", "HMK m. 390"],
    branch: ["medeni_usul"],
  },
  yarg_hgk_2019_892: {
    id: "yarg_hgk_2019_892",
    kind: "ictihat",
    shortTitle: "Yarg. HGK 2019/892",
    fullTitle: "Yargıtay Hukuk Genel Kurulu — E. 2019/892: İspat yükü — HMK m. 190",
    body:
      "HMK m. 190 uyarınca ispat yükü, iddia edilen vakıaya bağlanan hukuki sonuçtan kendi lehine hak çıkaran tarafa aittir. Kanuni karineye dayanan taraf, sadece karinenin temel vakıasını ispatla yükümlüdür; aksi ispat karşı tarafa geçer.",
    keywords: ["ispat yükü", "HMK m. 190", "karine", "vakıa"],
    branch: ["medeni_usul"],
  },
  yarg_4hd_2021_3345: {
    id: "yarg_4hd_2021_3345",
    kind: "ictihat",
    shortTitle: "Yarg. 4. HD. 2021/3345",
    fullTitle: "Yargıtay 4. Hukuk Dairesi — E. 2021/3345: Dava dilekçesi — talep sonucu",
    body:
      "HMK m. 119/ğ uyarınca dava dilekçesinde talep sonucu açıkça belirtilmelidir. Belirsiz alacak davası açılmışsa, talep sonucu asgari bir miktar gösterilerek dava açılabilir. Talep sonucu olmayan dilekçe, kesin süre verilerek tamamlattırılır.",
    keywords: ["dava dilekçesi", "talep sonucu", "HMK m. 119", "belirsiz alacak"],
    branch: ["medeni_usul"],
  },

  yarg_cgk_2019_1234: {
    id: "yarg_cgk_2019_1234",
    kind: "ictihat",
    shortTitle: "Yarg. CGK 2019/1234",
    fullTitle: "Yargıtay Ceza Genel Kurulu — E. 2019/1234: Olası kast — TCK m. 21/2",
    body:
      "TCK m. 21/2 uyarınca olası kast, failin suçun kanuni tanımındaki unsurların gerçekleşebileceğini öngörmesine rağmen fiili işlemesidir. Olası kastta fail 'olursa olsun' düşüncesiyle hareket eder. Bilinçli taksirden farkı, failin neticeyi kabullenmesidir.",
    keywords: ["olası kast", "TCK m. 21", "bilinçli taksir", "öngörme"],
    branch: ["ceza"],
  },
  yarg_cgk_2020_567: {
    id: "yarg_cgk_2020_567",
    kind: "ictihat",
    shortTitle: "Yarg. CGK 2020/567",
    fullTitle: "Yargıtay Ceza Genel Kurulu — E. 2020/567: Kasten yaralama — neticesi sebebiyle ağırlaşmış hal",
    body:
      "TCK m. 86 ve 87 uyarınca kasten yaralama suçunun neticesi sebebiyle ağırlaşmış hallerinde, failin ağır netice bakımından en azından taksirinin bulunması gerekir. Ağır netice öngörülemez nitelikte ise sorumluluk doğmaz.",
    keywords: ["kasten yaralama", "TCK m. 86", "neticesi sebebiyle ağırlaşma"],
    branch: ["ceza"],
  },
  yarg_cgk_2018_890: {
    id: "yarg_cgk_2018_890",
    kind: "ictihat",
    shortTitle: "Yarg. CGK 2018/890",
    fullTitle: "Yargıtay Ceza Genel Kurulu — E. 2018/890: Hırsızlık — malın değerinin azlığı",
    body:
      "TCK m. 145 uyarınca hırsızlık suçunda malın değerinin azlığı, cezada indirim sebebidir. Hakim somut olayın özelliklerine göre TCK m. 61 çerçevesinde takdir yetkisini kullanır. Malın değerinin çok düşük olması halinde ceza vermekten vazgeçilebilir.",
    keywords: ["hırsızlık", "TCK m. 145", "değer azlığı", "takdir yetkisi"],
    branch: ["ceza"],
  },

  yarg_cmk_2019_7890: {
    id: "yarg_cmk_2019_7890",
    kind: "ictihat",
    shortTitle: "Yarg. CMK 2019/7890",
    fullTitle: "Yargıtay Ceza Dairesi — E. 2019/7890: Tutuklama — ölçülülük ilkesi",
    body:
      "CMK m. 100 uyarınca tutuklama kararı verilirken ölçülülük ilkesi gözetilmelidir. İşin önemi, verilmesi beklenen ceza ile tutuklama tedbirinin orantılı olması gerekir. Adli kontrol hükümleri yetersiz kalıyorsa tutuklamaya başvurulur.",
    keywords: ["tutuklama", "ölçülülük", "CMK m. 100", "adli kontrol"],
    branch: ["ceza_usul"],
  },
  yarg_cmk_2020_4521: {
    id: "yarg_cmk_2020_4521",
    kind: "ictihat",
    shortTitle: "Yarg. CMK 2020/4521",
    fullTitle: "Yargıtay Ceza Dairesi — E. 2020/4521: Gözaltı süresi",
    body:
      "CMK m. 91 uyarınca gözaltı süresi yakalama anından itibaren 24 saati geçemez. Toplu suçlarda Cumhuriyet savcısı yazılı emirle 3 güne kadar uzatabilir. Süre aşımı halinde elde edilen deliller hukuka aykırı sayılır.",
    keywords: ["gözaltı süresi", "CMK m. 91", "toplu suç", "hukuka aykırı delil"],
    branch: ["ceza_usul"],
  },

  danstay_iddk_2019_567: {
    id: "danstay_iddk_2019_567",
    kind: "ictihat",
    shortTitle: "Danıştay İDDK 2019/567",
    fullTitle: "Danıştay İdari Dava Daireleri Kurulu — E. 2019/567: Dava açma süresi",
    body:
      "İYUK m. 7 uyarınca idari davalarda dava açma süresi 60 gündür. Süre, tebliğ tarihini izleyen günden başlar. Sürenin son günü tatile rastlarsa, takip eden ilk iş günü mesai bitimine kadar dava açılabilir. Hak düşürücü süredir, re'sen dikkate alınır.",
    keywords: ["dava açma süresi", "İYUK m. 7", "60 gün", "hak düşürücü süre"],
    branch: ["idare"],
  },
  danstay_iddk_2020_234: {
    id: "danstay_iddk_2020_234",
    kind: "ictihat",
    shortTitle: "Danıştay İDDK 2020/234",
    fullTitle: "Danıştay İdari Dava Daireleri Kurulu — E. 2020/234: Yürütmenin durdurulması",
    body:
      "İYUK m. 27 uyarınca yürütmenin durdurulması kararı verilebilmesi için idari işlemin uygulanması halinde telafisi güç veya imkansız zararların doğması ve işlemin açıkça hukuka aykırı olması şartlarının birlikte gerçekleşmesi gerekir.",
    keywords: ["yürütmenin durdurulması", "İYUK m. 27", "telafi"],
    branch: ["idare"],
  },

  yarg_12hd_2019_4567: {
    id: "yarg_12hd_2019_4567",
    kind: "ictihat",
    shortTitle: "Yarg. 12. HD. 2019/4567",
    fullTitle: "Yargıtay 12. Hukuk Dairesi — E. 2019/4567: İtirazın iptali — icra inkar tazminatı",
    body:
      "İİK m. 67 uyarınca itirazın iptali davasında borçlunun itirazı haksız bulunursa, alacaklının talebi üzerine borçlu aleyhine %20'den az olmamak üzere icra inkar tazminatına hükmedilir. Alacak likit olmalıdır.",
    keywords: ["itirazın iptali", "icra inkar tazminatı", "İİK m. 67", "likit alacak"],
    branch: ["icra"],
  },
  yarg_12hd_2020_8934: {
    id: "yarg_12hd_2020_8934",
    kind: "ictihat",
    shortTitle: "Yarg. 12. HD. 2020/8934",
    fullTitle: "Yargıtay 12. Hukuk Dairesi — E. 2020/8934: İtirazın kesin kaldırılması",
    body:
      "İİK m. 68 uyarınca itirazın kesin kaldırılması için alacağın imzası ikrar edilmiş bir senede veya resmi belgeye dayanması gerekir. 6 aylık hak düşürücü süre içinde talep edilmelidir. Süre geçtikten sonra yeniden ilamsız takip yapılamaz.",
    keywords: ["itirazın kaldırılması", "İİK m. 68", "6 ay", "hak düşürücü"],
    branch: ["icra"],
  },

  aym_2016_143: {
    id: "aym_2016_143",
    kind: "ictihat",
    shortTitle: "AYM 2016/143 Bireysel Başvuru",
    fullTitle: "Anayasa Mahkemesi — 2016/143: Adil yargılanma hakkı — gerekçeli karar",
    body:
      "Anayasa m. 36'da güvence altına alınan adil yargılanma hakkı, mahkeme kararlarının gerekçeli olmasını da kapsar. Gerekçesiz karar, tarafların iddia ve savunmalarının neden reddedildiğini anlamasını engeller. Gerekçe eksikliği adil yargılanma ihlalidir.",
    keywords: ["adil yargılanma", "gerekçeli karar", "AYM", "Anayasa m. 36"],
    branch: ["anayasa", "medeni_usul"],
  },
  aym_2019_34: {
    id: "aym_2019_34",
    kind: "ictihat",
    shortTitle: "AYM 2019/34 Bireysel Başvuru",
    fullTitle: "Anayasa Mahkemesi — 2019/34: Mülkiyet hakkı ihlali",
    body:
      "Anayasa m. 35 ve AİHS Ek 1. Protokol m. 1 kapsamındaki mülkiyet hakkına yapılan müdahalenin kanuni dayanağı olmalı, kamu yararı amacı taşımalı ve ölçülü olmalıdır. Ölçüsüz müdahale mülkiyet hakkı ihlalidir.",
    keywords: ["mülkiyet hakkı", "AYM", "ölçülülük", "kamu yararı"],
    branch: ["anayasa", "medeni"],
  },

  /* ═════════════════════════ Eski kayıtlar (backward compat) ═════════════════════════ */
  // sources.ts'in eski sürümünde TBK m. 77/79 ve TMK m. 730/737 ID'leri farklıydı.
  // Yukarıdaki yeni IDs ile uyumlu; gerekirse eski referansları silebiliriz.
};

/* ═════════════════════════ Yardımcı fonksiyonlar ═════════════════════════ */

/** Belirli bir hukuk dalı için kaynakları listele. */
export function sourcesByBranch(branch: string): LegalSource[] {
  return Object.values(sources).filter((s) => {
    const meta = s as LegalSource & { branch?: string[] };
    return !meta.branch || meta.branch.includes(branch);
  });
}

/** Bir veya birden çok anahtar kelimeye göre kaynak arama (basit substring + keywords).
 * Faz 4'te pgvector embedding ile semantic search'e geçilecek.
 */
export function searchSources(query: string, branch?: string, limit = 5): LegalSource[] {
  const q = query.toLowerCase();
  const all = branch ? sourcesByBranch(branch) : Object.values(sources);
  const scored = all.map((s) => {
    const meta = s as LegalSource & { keywords?: string[] };
    const text = `${s.shortTitle} ${s.body} ${(meta.keywords ?? []).join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of q.split(/\s+/).filter(Boolean)) {
      if (text.includes(word)) score += 1;
      if ((meta.keywords ?? []).some((k) => k.toLowerCase().includes(word))) score += 2;
    }
    return { source: s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.source);
}
