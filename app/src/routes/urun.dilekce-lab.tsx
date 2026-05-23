import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";

export const Route = createFileRoute("/urun/dilekce-lab")({
  head: () => ({
    meta: [
      { title: "Dilekçe Lab — AI rubrik geri bildirimi | LawKit" },
      {
        name: "description",
        content:
          "Dilekçenizi yazın, AI rubrik üzerinden saniyeler içinde geri bildirim alın. Usul hataları, eksik unsurlar, gerekçe boşlukları işaretlenir.",
      },
      { property: "og:title", content: "Dilekçe Lab | LawKit" },
      {
        property: "og:description",
        content: "Hukuki yazımda gerçek geri bildirim — fakültede alamadığınız türden.",
      },
    ],
  }),
  component: DilekcePage,
});

function DilekcePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Modül 03 · Pratik"
        title={
          <>
            Dilekçenizi yazın,{" "}
            <span className="italic text-gold">rubrikten okuyun.</span>
          </>
        }
        lead="Dilekçe Lab, hukuki yazım pratiği için bir editör ve AI denetleyicidir. Şablondan kopyalama değil; konu, taraflar, dava şartı, vakıa, hukuki sebep, talep sonucu — her unsur ayrı ayrı puanlanır."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="border-b border-line bg-paper-warm/60 px-6 py-3">
            <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/60">
              Rubrik · İşe iade davası dilekçesi
            </span>
          </div>
          <div className="divide-y divide-line">
            {[
              { t: "Görevli mahkeme tespiti", s: "8/10", note: "Doğru. İş mahkemesi." },
              { t: "Dava şartı (arabuluculuk) belirtimi", s: "6/10", note: "Eksik. Son tutanak tarihi yazılmamış." },
              { t: "Vakıaların kronolojik dizilimi", s: "9/10", note: "İyi. Tarihler net." },
              { t: "Hukuki sebep (m. 4857/21)", s: "4/10", note: "Eksik. Geçerli sebep yokluğu somut delillendirilmemiş." },
              { t: "Talep sonucunun açıklığı", s: "7/10", note: "Boşta geçen süre alacağı miktarlandırılmalı." },
            ].map((r) => (
              <div key={r.t} className="grid grid-cols-[1fr_auto] items-start gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{r.t}</p>
                  <p className="mt-0.5 text-xs text-ink/55">{r.note}</p>
                </div>
                <span className="font-display text-lg font-bold text-gold">{r.s}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line bg-paper-warm/30 px-6 py-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink/55">
              Toplam rubrik
            </span>
            <span className="font-display text-2xl font-extrabold text-ink">34 / 50</span>
          </div>
        </div>
      </section>

      <CTAFooter title="İlk dilekçenizi ücretsiz analiz ettirin." />
    </PageShell>
  );
}
