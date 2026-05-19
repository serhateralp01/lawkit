import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";
import { GitBranch, MessageSquare, Scale, Target } from "lucide-react";

export const Route = createFileRoute("/urun/case-studio")({
  head: () => ({
    meta: [
      { title: "Case Studio — Dallanan vaka simülasyonu | LawKit" },
      {
        name: "description",
        content:
          "Gerçek dava dosyalarından kurgulanan, her kararınızın sonraki adımı değiştirdiği dallanan hukuk vakaları. Müvekkil görüşmesi, strateji, dilekçe ve rubrik geri bildirim.",
      },
      { property: "og:title", content: "Case Studio | LawKit" },
      {
        property: "og:description",
        content: "Karar verdikçe ilerleyen, dallanan vaka motoru.",
      },
    ],
  }),
  component: CaseStudioPage,
});

function CaseStudioPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Modül 01 · Çekirdek"
        title={
          <>
            Vakayı oku, karar ver,{" "}
            <span className="italic text-gold">sonucunu yaşa.</span>
          </>
        }
        lead="Case Studio, klasik soru-cevap mantığını terk eder. Müvekkilin anlattığı olay üzerinden ilerlersiniz; sorduğunuz her soru, verdiğiniz her karar senaryonun bundan sonrasını şekillendirir. Sistem doğru/yanlış demez — seçtiğiniz yolun hukuki sonucunu gösterir."
      />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              icon: MessageSquare,
              t: "Müvekkil görüşmesi",
              d: "Eksik bilgileri sorma pratiği. Sistem sorduğunuz ve sormadığınız tüm olguları kaydeder.",
            },
            {
              icon: GitBranch,
              t: "Dallanan senaryo",
              d: "Her karar yeni bir alt-akış açar. Aynı vakanın 6 farklı sonu olabilir.",
            },
            {
              icon: Scale,
              t: "Usul önce",
              d: "Görev, yetki, dava şartı, zamanaşımı — esasa girmeden önce filtrelenir.",
            },
            {
              icon: Target,
              t: "Rubrik puanlama",
              d: "Eksik unsur, kaçırılan delil, hatalı strateji — her biri ayrı puan kalemi.",
            },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.t}
                className="rounded-2xl border border-line bg-white p-7 shadow-sm"
              >
                <div className="mb-5 grid size-10 place-items-center rounded-lg bg-gold/10 text-gold">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/55">{c.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-paper-warm/40">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            İlk Yayın Vakası
          </p>
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            "Haksız fesih ve işe iade stratejisi"
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink/60">
            7 yıl çalışmış işçinin sözlü fesih iddiası. Arabuluculuk şartı, fesih bildirimi
            ispatı, ihbar-kıdem hesabı, işe iade vs alacak davası tercihi — tek senaryoda iş
            hukuku, borçlar ve medeni usul bilginizi sahaya sürer.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { t: "Karar noktası", v: "23" },
              { t: "Olası senaryo sonu", v: "6" },
              { t: "Ortalama süre", v: "42 dk" },
            ].map((s) => (
              <div key={s.t} className="border-l-2 border-gold pl-4">
                <dd className="font-display text-3xl font-extrabold text-ink">{s.v}</dd>
                <dt className="mt-1 text-[11px] font-bold uppercase tracking-widest text-ink/50">
                  {s.t}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CTAFooter title="İlk vakayı ücretsiz dene." />
    </PageShell>
  );
}
