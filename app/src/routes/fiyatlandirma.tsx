import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fiyatlandirma")({
  head: () => ({
    meta: [
      { title: "Fiyatlandırma | LawKit" },
      {
        name: "description",
        content: "Ücretsiz başlayın, ihtiyacınıza göre yükseltin. Sprint 50 TL, Core 250 TL/ay, Pro 400 TL/ay.",
      },
      { property: "og:title", content: "Fiyatlandırma | LawKit" },
    ],
  }),
  component: PricingPage,
});

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  yearly?: { price: string; saving: string };
  includes?: string;
  features: string[];
  badge?: string;
  cta: string;
  ctaHref: "/kayit" | "/karne" | "/iletisim";
  variant: "free" | "sprint" | "core" | "pro";
}

const PLANS: Plan[] = [
  {
    name: "Free",
    description: "Platformu tanıyın, ilk vakanızı çözün.",
    price: "0",
    period: "—",
    features: [
      "Ayda 3 AI destekli vaka",
      "Sınırsız temel vaka",
      "Karne ve temel istatistikler",
      "1 dilekçe şablonu",
    ],
    cta: "Ücretsiz başla",
    ctaHref: "/kayit",
    variant: "free",
  },
  {
    name: "Sprint",
    description: "Sınav öncesi yoğun hazırlık.",
    price: "50",
    period: "7 gün",
    includes: "Free'deki her şey +",
    features: [
      "7 gün boyunca günlük 10 AI vaka",
      "Tüm dilekçe şablonları",
      "AI Tutor sınırsız",
      "Tek seferlik — otomatik yenilenmez",
    ],
    badge: "Sınav haftası",
    cta: "Sprint başlat",
    ctaHref: "/kayit",
    variant: "sprint",
  },
  {
    name: "Core",
    description: "Düzenli çalışma için ana plan.",
    price: "250",
    period: "ay",
    yearly: { price: "2.490", saving: "%17" },
    includes: "Sprint'teki her şey +",
    features: [
      "Günlük 10 AI vaka",
      "Karne, radar ve mastery rozetleri",
      "Yeni vakalar otomatik açılır",
    ],
    badge: "Popüler",
    cta: "Core'a geç",
    ctaHref: "/kayit",
    variant: "core",
  },
  {
    name: "Pro",
    description: "Daha fazla AI ve detaylı analiz.",
    price: "400",
    period: "ay",
    yearly: { price: "3.990", saving: "%17" },
    includes: "Core'daki her şey +",
    features: [
      "Günlük 20 AI vaka",
      "Detaylı performans analizi",
      "Boyut bazlı ilerleme raporları",
      "Erken erişim özellikler",
    ],
    cta: "Pro'ya geç",
    ctaHref: "/kayit",
    variant: "pro",
  },
];

function PricingPage() {
  return (
    <PageShell>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8 lg:py-28">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Fiyatlandırma
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            İhtiyacınıza uygun{" "}
            <span className="italic text-gold">plan.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
            Ücretsiz başlayın, ilerledikçe yükseltin. Bütün planlarda ilk 7 gün koşulsuz iade. KDV dahil.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-white p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                Kurumsal
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">
                Fakülte, baro ve hukuk büroları
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
                Toplu kullanıcı yönetimi, kuruma özel vaka havuzu ve merkezi raporlama
                paneli için iletişime geçin. Mevcut içerik ve özellikler üzerinden
                ihtiyacınıza uygun bir yapılandırma sunuyoruz.
              </p>
            </div>
            <Link
              to="/iletisim"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-paper transition hover:bg-ink/90"
            >
              İletişime geç
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <FaqItem
            q="Free planda neler yapabilirim?"
            a="Ayda 3 AI destekli vaka çözebilir, sınırsız temel vakayla pratik yapabilir ve karnenizi takip edebilirsiniz. AI Tutor ve çoklu dilekçe şablonları bu planda kapalıdır."
          />
          <FaqItem
            q="Sprint ne zaman kullanılır?"
            a="Sprint, HMGS sınavından önceki 1-2 haftada yoğun çalışma için tasarlanmıştır. 7 gün boyunca tüm AI özelliklerine sınırsız erişim sağlar. Süre dolduğunda otomatik yenilenmez."
          />
          <FaqItem
            q="Pro'daki performans analizi ne içerir?"
            a="Pro kullanıcıları boyut bazlı (olay, mesele, usul, maddi, gerekçe, risk, ifade) ilerleme grafiklerine, haftalık gelişim raporlarına ve zayıf alan kırılımına erişir. Ayrıca günlük AI vaka hakkı 20'ye çıkar."
          />
          <FaqItem
            q="İade koşulları nedir?"
            a="Tüm planlarda ilk 7 gün koşulsuz iade hakkınız vardır. Sprint için yalnızca kullanılmamış paketlerde; Core ve Pro için hesabınız kapatılır, ücret iade edilir."
          />
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink/40">
          Eğitim amaçlı simülasyon · LawKit hukuki tavsiye vermez · KDV dahil
        </p>
      </section>
    </PageShell>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isDark = plan.variant === "core" || plan.variant === "pro";
  const isFeatured = plan.variant === "core";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-7 transition-all duration-300",
        isFeatured
          ? "bg-ink text-paper shadow-2xl shadow-ink/20 ring-2 ring-gold scale-[1.02] hover:scale-[1.03]"
          : plan.variant === "sprint"
            ? "border-2 border-gold bg-white text-ink shadow-sm hover:shadow-lg"
            : plan.variant === "pro"
              ? "bg-gradient-to-b from-ink to-ink/90 text-paper shadow-lg shadow-ink/10 hover:shadow-xl"
              : "border border-line bg-white text-ink shadow-sm hover:shadow-md",
      )}
    >
      {plan.badge ? (
        <span
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest",
            isDark ? "bg-gold text-ink" : "bg-gold text-white",
          )}
        >
          {plan.badge}
        </span>
      ) : null}

      <header className="mb-5">
        <h3 className="font-display text-xl font-extrabold">{plan.name}</h3>
        <p
          className={cn(
            "mt-1 text-xs leading-relaxed",
            isDark ? "text-paper/55" : "text-ink/55",
          )}
        >
          {plan.description}
        </p>
      </header>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-extrabold">
            {plan.price === "0" ? "Ücretsiz" : `₺${plan.price}`}
          </span>
          {plan.period !== "—" && (
            <span className={cn("text-xs", isDark ? "text-paper/55" : "text-ink/55")}>
              / {plan.period}
            </span>
          )}
        </div>
        {plan.yearly ? (
          <p className={cn("mt-1 text-[10px]", isDark ? "text-paper/45" : "text-ink/45")}>
            Yıllık ₺{plan.yearly.price} ({plan.yearly.saving} indirim)
          </p>
        ) : null}
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.includes && (
          <li
            className={cn(
              "border-b pb-2 text-[10px] font-bold uppercase tracking-wider",
              isDark ? "border-paper/10 text-paper/40" : "border-line text-ink/35",
            )}
          >
            {plan.includes}
          </li>
        )}
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <CheckCircle2
              className={cn(
                "mt-0.5 size-3.5 shrink-0",
                plan.variant === "free" ? "text-ink/50" : "text-gold",
              )}
            />
            <span className={isDark ? "text-paper/80" : "text-ink/75"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to={plan.ctaHref}
        className={cn(
          "block rounded-xl px-4 py-3 text-center text-xs font-bold transition",
          plan.variant === "free"
            ? "border border-line bg-white text-ink hover:bg-ink/5"
            : plan.variant === "sprint"
              ? "bg-gold text-ink hover:bg-gold/90"
              : plan.variant === "core"
                ? "bg-paper text-ink hover:bg-paper/90"
                : "bg-gold text-ink hover:bg-gold/90",
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="flex items-start gap-2 font-display text-sm font-bold text-ink">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
        {q}
      </p>
      <p className="mt-2 pl-5 text-xs leading-relaxed text-ink/60">{a}</p>
    </div>
  );
}
