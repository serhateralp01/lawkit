# Tur 1.7 — Derin vaka + AI branching

Bu doküman LawKit'in **gerçek katma değer** katmanını tarif eder. Tur 1 ve 1.5 altyapıyı kurdu (engine, gamification, sahne); Tur 1.7 ürünü "scripted demo"dan **uçuş simülatörü**ne çevirir.

## Problem

Mevcut vakalar 3-4 node, her seçenek aynı sonraki node'a gidiyor. "Branching" sadece skoru etkiliyor — hikayeyi değil. AI yardımı gerek olmadan oynanabilir. Bu, AristoHocam soru bankasından farklı değil.

**Hedef:** öğrencinin verdiği cevaba göre vaka **gerçekten** sapar. Yanlış usul = duruşmada kaybedersin. Eksik soru = müvekkilin gerçeği saklar. Hızlı zafer ile pahalı zafer arasında 5 farklı hikaye sonu var.

## Yapısal değişiklikler

### 1. Yeni node tipleri

| kind | Anlam | UI | Engine olayı |
|---|---|---|---|
| `decision` (mevcut) | Kapalı uçlu çoktan seçmeli | OptionRow listesi | `pick` |
| `info` (mevcut) | Anlatım sahnesi, karar yok | DialogueBubble + Devam | `advance` |
| `outcome` (mevcut) | Vaka sonu | FeedbackPanel | — |
| **`open_text`** (yeni) | Öğrenci serbest yazar; AI rubric'le puanlar | Textarea + "AI değerlendir" | `submit_text` |
| **`ai_branch`** (yeni) | Öğrencinin cevabına göre **AI** sonraki node'u seçer | Textarea + "AI yönlendiriyor…" | `ai_branch_decided` |
| **`client_chat`** (yeni) | Müvekkille N tur sohbet; AI persona | Chat panel + kalan tur sayacı | `chat_turn` |
| **`checkpoint`** (yeni) | Ledger durumuna göre dal seçer (AI yok) | Görünmez — engine route eder | otomatik |

Hepsi geriye uyumlu: eski tek-outcome'lu vakalar bozulmadan çalışır.

### 2. Çoklu sonuç (`LegalCase.outcomes`)

Her vaka N tane outcome tanımlar. Vaka bittiğinde engine ledger + history özetini alır, **outcomes** listesindeki ilk eşleşen `condition`'u uygulayan outcome'a route eder.

```ts
outcomes: [
  {
    id: "zafer",
    title: "İşe iade kazanıldı + tüm tazminatlar tahsil",
    condition: { minLedgerAvg: 3.5, maxHints: 1, requireDimGte: { usul: 4 } },
    mood: "triumph",
    narrative: "Hâkim Yıldız kararını verdi: işe iade. ...",
    idealAnswer: "...",
  },
  {
    id: "ihtiyatli_zafer",
    title: "İşe iade kazanıldı, ihbar tazminatı reddedildi",
    condition: { minLedgerAvg: 3.0, maxHints: 2 },
    ...
  },
  {
    id: "uzlasma",
    title: "Arabuluculukta uzlaşma — kazanım sınırlı",
    condition: { minLedgerAvg: 2.0 },
    ...
  },
  {
    id: "kismi_kayip",
    title: "Dava reddedildi ama temyiz hakkı korundu",
    condition: { minLedgerAvg: 1.0 },
    ...
  },
  {
    id: "tam_kayip",
    title: "Süre kaçırıldı — işe iade hakkı düştü",
    condition: { criticalMiss: ["surekacir", "yanlis_usul"] },
    ...
  },
]
```

Engine route etme sırası: listede üstten alta ilk eşleşen kazanır. Bu yüzden zorlu koşullar önce yazılır.

### 3. AI branching prompt sözleşmesi

`/api/ai/branch` çağrısı:

```
input:
  case context (özet + olgular + mevcut sahne)
  öğrencinin serbest cevabı
  yetkili sonraki node id listesi (3-4 alternatif)
  her node id için kısa açıklama ("doğru hamle", "olası şüphe", "yanlış usul")

output (zorunlu JSON):
{
  "chosenNodeId": "n7b",
  "reason": "Öğrenci 'arabuluculuk' kelimesini hiç kullanmadı; usul tarafında tehlikede.",
  "scoreHint": { "usul": 1, "mesele": 3 },
  "verdict": "partial"
}
```

Auditor: dönen `chosenNodeId` mutlaka verilen listeden olmalı. Değilse default fallback node'una düş.

### 4. Vaka mimarisi — 3 perde sistemi

Her derin vaka 3 perdede şekillenir:

**Perde I — Olgu toplama (3-4 sahne)**
Müvekkil görüşmesi. Çoğunlukla `client_chat` veya `open_text` (sormaya başla, sormadığın sorunun bedeli ileride çıkar). En az 1 AI etkileşimi.

**Perde II — Strateji + dilekçe (3-4 sahne)**
Dava şartları, görevli/yetkili mahkeme, talep sonucu. `decision` ağırlıklı + 1 `open_text` (dilekçe parçası). `checkpoint` ile Perde I'den gelen skora göre dallanma.

**Perde III — Duruşma (3-4 sahne)**
Hâkim soruları + karşı vekil itirazı + son söz. 1 `ai_branch` (en kritik yer — karşı vekilin sorusu yöneltilir, sen serbest cevap verirsin, AI duruşmanın gidişatını değiştirir).

**Sonuç:** outcomes listesindeki kurallara göre 5'ten biri.

## isHukuku001 derinleştirme planı

12 node + 5 outcome:

| ID | Perde | Kind | Speaker | Özet |
|---|---|---|---|---|
| n1 | I | client_chat | Ayşe Hanım | "Bana ne soracaksın?" 3 turlu sohbet, eksik sorular ileride out yaratır |
| n2 | I | decision | patron | Fesih sebebi: haklı / geçerli / usulsüz teşhisi |
| n3 | I | open_text | patron | "Ayşe Hanım için ilk önemli 3 hak nedir?" — AI puanlar |
| n4 | II | decision | patron | Arabuluculuk dava şartı / doğrudan dava / iş müfettişi |
| n5 | II | decision | patron | 1 ay süre / 2 hafta süre / 60 gün süre |
| n6 | II | checkpoint | — | usul < 2 ise n7a (geri dönüş), ≥ 2 ise n7b (devam) |
| n7a | II | info | patron | "Süreyi tekrar gözden geçir" — penalty path |
| n7b | II | open_text | patron | Dilekçenin talep sonucu kısmını yaz — AI puanlar |
| n8 | III | decision | hakim | "Süre tutum istiyor musun?" (usul tuzağı) |
| n9 | III | ai_branch | karşı vekil | "Müvekkilim haklı sebeple feshetti, kanıtı var" — sen ne dersin? AI yönlendirir |
| n10 | III | decision | hakim | Son söz — risk argümanı |
| n11 | III | info | hakim | Karar veriliyor → outcome route |
| **outcome_zafer** | sonuç | outcome |  | Tam zafer |
| **outcome_ihtiyatli** | sonuç | outcome |  | İhtiyatlı zafer (ihbar tazminatı yok) |
| **outcome_uzlasma** | sonuç | outcome |  | Arabuluculukta uzlaşma |
| **outcome_kismi_kayip** | sonuç | outcome |  | Dava reddi + temyiz |
| **outcome_kayip** | sonuç | outcome |  | Süre kaçırma → hak düşürücü |

## AI maliyet tahmini

Vaka başına 3 AI çağrısı (1 chat + 1 assess + 1 branch). OpenRouter `openrouter/owl-alpha` ya da `deepseek/deepseek-chat-v3-0324:free`:
- Free tier: ~20 req/dakika, ~200 req/gün. Tek kullanıcı için bol.
- Pro tier'a geçiş tetiği: paralel 50+ kullanıcı saatte oyun başlatınca.

## Geriye uyumluluk

- borclar001 ve medeni001 mevcut hâlleriyle çalışmaya devam eder.
- Mevcut MiniCaseRunner (hero) etkilenmez — isHukuku001'in **eski** halini koruyabilmek için pilot olarak `isHukuku001_deep` adıyla **paralel** vaka açıyoruz, eski isHukuku001 backward-compat için 6 ay tutulur.

Karar: pilot adı `is_hukuku_002` olur. Eski `is_hukuku_001` MiniCaseRunner için kalır; karne kütüphanesinde yeni vaka öne çıkar.

## Outcome çağrı şartları (DSL)

`Condition` saf JSON — engine çalıştırır:

```ts
type Condition = {
  minLedgerAvg?: number;          // 5 boyutun ortalaması ≥
  maxHints?: number;              // toplam ipucu aşılmadı
  requireDimGte?: Partial<Record<RubricKey, number>>; // her boyut ≥
  criticalMiss?: string[];        // history'de bu node-option çiftlerinden biri var mı
  forbidVerdictBad?: number;      // en fazla bu kadar 'bad' karar
};
```

Engine her outcome'u sırayla dener; ilk eşleşen seçilir. Son outcome `default: true` olmalı (her zaman eşleşir) — fallback.

## İş paketi sırası (bu oturum)

1. Şema (types.ts) ✓
2. Engine (events + outcome routing) ✓
3. AI branching adapter + endpoint ✓
4. UI stage componentleri (OpenText + AiBranch + ClientChat) ✓
5. `is_hukuku_002` derin vaka içeriği ✓
6. FeedbackPanel çoklu outcome'a uyarlandı ✓
7. Build + smoke test + push ✓

## Doğrulama metrikleri

- Build temiz, smoke test geçer.
- Yeni vaka DAG validator'dan geçer (validateCase).
- 5 outcome'un da en az 1 yolu mevcuttur (eval test seti).
- Canlı OpenRouter ile `/api/ai/branch` çağrısı 30 sn altında dönüyor.
