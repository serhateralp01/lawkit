import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";

export const Route = createFileRoute("/urun/hmgs-arena")({
  head: () => ({
    meta: [
      { title: "HMGS Arena — Akıllı deneme sınavı | LawKit" },
      {
        name: "description",
        content:
          "Süreli HMGS denemeleri, zayıf konu haritası, soru bazlı açıklama ve aralıklı tekrarlama. 25 hukuk disiplini için akıllı çalışma planı.",
      },
      { property: "og:title", content: "HMGS Arena | LawKit" },
      { property: "og:description", content: "Sınav atmosferi, akıllı tekrar, net geri bildirim." },
    ],
  }),
  component: ArenaPage,
});

function ArenaPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Modül 02 · Sınav"
        title={
          <>
            Sınav günü{" "}
            <span className="italic text-gold">simülatörü.</span>
          </>
        }
        lead="HMGS Arena, gerçek sınav formatında — 120 soru, 155 dakika, çapraz disiplin — denemeler sunar. Her oturumun ardından zayıf konu haritanız güncellenir; sistem bir sonraki çalışmanızı bu haritaya göre planlar."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
          {[
            { n: "01", t: "Tanı testi", d: "30 dakikada güçlü ve zayıf konularınız haritalanır." },
            { n: "02", t: "Konu mini testleri", d: "Her disiplin için 15-20 soruluk odaklanmış oturumlar." },
            { n: "03", t: "Tam deneme", d: "Gerçek sınav formatında 120 soru, 155 dakika." },
            { n: "04", t: "Yanlış cevap raporu", d: "Hangi konu, hangi kavram, hangi içtihat — net raporlama." },
            { n: "05", t: "Aralıklı tekrar", d: "Unutmaya başladığınız soruları tam vaktinde tekrar getirir." },
            { n: "06", t: "Çalışma planı", d: "Sınava kalan süreye göre günlük çalışma takvimi önerir." },
          ].map((s) => (
            <div key={s.n} className="bg-white p-7">
              <p className="font-display text-3xl font-black text-gold/80">{s.n}</p>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CTAFooter title="HMGS hazırlığınıza ücretsiz tanı testiyle başlayın." />
    </PageShell>
  );
}
