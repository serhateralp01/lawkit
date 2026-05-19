import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/fiyatlandirma")({
  head: () => ({
    meta: [
      { title: "Fiyatlandırma — Sprint ve Core paketleri | LawKit" },
      {
        name: "description",
        content:
          "Sprint: 8 haftalık sınav kampı ₺2.490. Core: yıllık tüm modüllere erişim ₺5.990. Fakülte ve baro lisansı için iletişime geçin.",
      },
      { property: "og:title", content: "Fiyatlandırma | LawKit" },
    ],
  }),
  component: PricingPage,
});

const SPRINT = [
  "Haftalık 2 deneme sınavı",
  "500+ odaklanmış vaka sorusu",
  "Zayıf konu haritası",
  "Hızlı tekrar notları (PDF)",
  "Topluluk forumu erişimi",
];

const CORE = [
  "Tüm modüllere sınırsız erişim",
  "AI dilekçe analizi (sınırsız)",
  "Tüm Case Studio vakaları",
  "Mentor desteği (aylık 2 görüşme)",
  "Staj portalı erişimi",
  "Yeni içerikler otomatik açılır",
];

function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Fiyatlandırma"
        title={
          <>
            Sade fiyat,{" "}
            <span className="italic text-gold">net değer.</span>
          </>
        }
        lead="Sprint sınav öncesi 8 haftalık yoğun kamp; Core yıl boyu tüm modüllere erişim. İlk 7 gün koşulsuz iade."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            name="Sprint"
            desc="8 haftalık sınav kampı"
            price="₺2.490"
            period="tek seferlik"
            features={SPRINT}
            badge="Popüler"
            variant="primary"
          />
          <Card
            name="Core"
            desc="Yıllık akademik üyelik"
            price="₺5.990"
            period="yıllık"
            features={CORE}
            variant="dark"
          />
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-white p-8">
          <h2 className="font-display text-2xl font-bold text-ink">
            Fakülte / Baro / Kurum
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
            10+ kullanıcılı kurumlar için özel fiyatlandırma, toplu raporlama paneli ve özel
            içerik eklemeleri sağlıyoruz. Pilot programlar için açık başvuru alıyoruz.
          </p>
          <Link
            to="/iletisim"
            className="mt-5 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-ink/90"
          >
            Kurumsal teklif al
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function Card({
  name,
  desc,
  price,
  period,
  features,
  badge,
  variant,
}: {
  name: string;
  desc: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  variant: "primary" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={`relative rounded-3xl p-10 ${
        isDark ? "bg-ink text-paper" : "border-2 border-gold bg-white text-ink"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {badge}
        </span>
      )}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold">{name}</h3>
          <p className={`mt-1 text-xs ${isDark ? "text-paper/50" : "text-ink/50"}`}>{desc}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-extrabold">{price}</p>
          <p
            className={`text-[11px] uppercase tracking-widest ${
              isDark ? "text-paper/40" : "text-ink/40"
            }`}
          >
            {period}
          </p>
        </div>
      </div>
      <ul className="mb-10 space-y-3.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
            <span className={isDark ? "text-paper/85" : "text-ink/75"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/kayit"
        className={`block rounded-xl px-6 py-3.5 text-center text-sm font-bold ${
          isDark
            ? "bg-paper text-ink hover:bg-paper/90"
            : "bg-ink text-paper hover:bg-ink/90"
        }`}
      >
        {name === "Sprint" ? "Kampa katıl" : "Core'a geç"}
      </Link>
    </div>
  );
}
