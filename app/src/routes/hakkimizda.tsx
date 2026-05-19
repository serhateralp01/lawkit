import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda | LawKit" },
      {
        name: "description",
        content:
          "LawKit, Türk hukuk eğitimindeki teori-pratik açığını kapatmak için kurulmuş bir legaltech şirketidir.",
      },
      { property: "og:title", content: "Hakkımızda | LawKit" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Hikaye"
        title={
          <>
            Bir avukat, bir mühendis,{" "}
            <span className="italic text-gold">bir sorun.</span>
          </>
        }
        lead="LawKit, HMGS sonrası %70'lik 'baraj altı' rakamına bakıp soruyu farklı soran küçük bir ekip tarafından kuruldu. 'Daha çok PDF mi gerekiyor, yoksa farklı bir pratik mi?'"
      />

      <section className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-base leading-relaxed text-ink/70 lg:px-8">
        <p>
          Türkiye'de her yıl yaklaşık 20.000 hukuk mezunu sahaya çıkıyor. 2024'te HMGS fiilen
          zorunlu hale geldi ve bu mezunların önemli bir kısmı için sahaya çıkmak ertelendi.
          Sorunun fakültelerdeki teori yükü ile pratik eksikliği arasındaki uçurum olduğu
          uzun yıllardır söylenen bir şey.
        </p>
        <p>
          LawKit, bu uçuruma teknolojik bir köprü atmaya çalışıyor. Yapay zeka ve vaka-temelli
          tasarım, doğru çerçevelendiğinde, hukuk eğitiminde yeni bir disiplin yaratma
          potansiyeli taşıyor. Bunu hipotez olarak kabul ediyoruz, ürünümüzü de hipoteze göre
          inşa ediyoruz.
        </p>
        <p>
          İlk MVP'mizi iş hukuku ve HMGS kapsamında dar tutuyoruz. Çalıştığını gördüğümüz her
          parçayı genişletiyoruz. Hipotezimiz çürürse de açık konuşacağız.
        </p>
      </section>
    </PageShell>
  );
}
