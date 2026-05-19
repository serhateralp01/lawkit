import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";

export const Route = createFileRoute("/neden-lawkit")({
  head: () => ({
    meta: [
      { title: "Neden LawKit — Türk hukuk eğitiminin teori-pratik açığı" },
      {
        name: "description",
        content:
          "HMGS başarı oranı %30. Her yıl 20.000 hukuk mezunu, 90 fakülte, 199.000 avukat. Yapısal eğitim boşluğunu vaka-temelli öğrenme ile kapatıyoruz.",
      },
      { property: "og:title", content: "Neden LawKit" },
      {
        property: "og:description",
        content: "Türk hukuk eğitiminin yapısal krizi ve LawKit'in cevabı.",
      },
    ],
  }),
  component: WhyPage,
});

function WhyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Manifesto"
        title={
          <>
            Hukuk fakültesi öğretiyor.{" "}
            <span className="italic text-gold">Pratik öğretmiyor.</span>
          </>
        }
        lead="LawKit, Türkiye'de hukuk eğitiminin tarihsel bir kırılma noktasında doğdu. HMGS adı altında konulan yeni filtre, fakülte mezuniyeti ile mesleğe giriş arasındaki uçurumu ölçülebilir hale getirdi."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            { v: "31.489", l: "HMGS toplam aday (Eyl '24–Eyl '25)" },
            { v: "22.004", l: "Baraj altı kalan aday sayısı" },
            { v: "%30,13", l: "Üç oturum kümülatif başarı" },
            { v: "~90", l: "Türkiye'de hukuk fakültesi sayısı" },
            { v: "~20.000", l: "Yıllık yeni hukuk mezunu" },
            { v: "199.000+", l: "Kayıtlı avukat sayısı (2024)" },
          ].map((s) => (
            <div key={s.l} className="border-t border-line pt-6">
              <p className="font-display text-4xl font-extrabold text-ink">{s.v}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Sorun bir "sınava hazırlık" sorunu değil.
          </h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/70">
            <p>
              Soru zorluğu oturum oturum artıyor; ancak 70 puan barajı sabit. Eylül 2024'te %42
              olan başarı, Nisan 2025'te %24'e geriledi. Mevcut hazırlık platformları yüzlerce
              saat konu anlatım videosu üretiyor — ama sorun ezberlenen kanun maddesi değil.
            </p>
            <p>
              <span className="font-bold text-ink">
                Sorun, dogmatik bilginin somut uyuşmazlığa tahvil edilememesi.
              </span>{" "}
              Akademik çalışmalar bunu uzun yıllardır söylüyor: teori merkezli, pasif dinleyici
              üreten yapı, gerçek dava çözme becerisini beslemiyor.
            </p>
            <p>
              LawKit'in cevabı basit: daha çok PDF ve video değil, daha çok uygulama ve geri
              bildirim. Müvekkili dinleten, kararı sorgulatan, dilekçeyi yazdırıp rubrik
              üzerinden puanlayan bir uçuş simülatörü.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <h3 className="font-display text-2xl font-extrabold text-ink">Yöntem</h3>
        <ul className="mt-8 space-y-6 border-l-2 border-gold/40 pl-6">
          {[
            {
              t: "Agentic RAG mimarisi",
              d: "Tek bir 'her şeyi bilen' model yerine, birlikte çalışan mikro-ajanlar: mevzuat tarayıcı, strateji denetleyici, karşı taraf simülatörü.",
            },
            {
              t: "Grounded AI",
              d: "AI sadece doğruladığımız mevzuat ve içtihat üzerinden konuşur. Halüsinasyon koruması için JSON şema zorunluluğu.",
            },
            {
              t: "Aralıklı tekrarlama",
              d: "Bilimsel olarak en etkili bilgi tutma yöntemi. Unutmaya başladığınız konu, doğru anda karşınıza çıkar.",
            },
            {
              t: "Branching scenarios",
              d: "Tek doğru cevap mantığı yerine, kararınızın hukuki sonucunu yaşatan dallanan akışlar.",
            },
          ].map((m) => (
            <li key={m.t}>
              <p className="font-display text-lg font-bold text-ink">{m.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">{m.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <CTAFooter title="Yöntemi denemenin maliyeti yok." />
    </PageShell>
  );
}
