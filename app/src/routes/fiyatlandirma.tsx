import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fiyatlandirma")({
  head: () => ({
    meta: [
      { title: "Fiyatlandırma | LawKit" },
      {
        name: "description",
        content:
          "Free: aylık 3 AI vaka. Sprint: 50 TL / 7 gün sınav öncesi yoğun. Core: 250 TL/ay sınırsız. Pro: 400 TL/ay premium. Fakülte/baro için kurumsal.",
      },
      { property: "og:title", content: "Fiyatlandırma | LawKit" },
    ],
  }),
  component: PricingPage,
});

interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  yearly?: { price: string; saving: string };
  features: string[];
  notIncluded?: string[];
  badge?: string;
  cta: string;
  ctaHref: "/kayit" | "/karne" | "/iletisim";
  variant: "free" | "sprint" | "core" | "pro";
}

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Tat almak için",
    price: "0",
    period: "—",
    features: [
      "Aylık 3 AI'lı vaka",
      "Sınırsız tat vakaları (engine-only)",
      "Karne + temel istatistikler",
      "Dilekçe Lab — 1 şablon erişimi",
    ],
    notIncluded: ["AI Tutor", "Çoklu dilekçe şablonu", "Mastery rozetleri"],
    cta: "Ücretsiz başla",
    ctaHref: "/kayit",
    variant: "free",
  },
  {
    name: "Sprint",
    tagline: "HMGS öncesi yoğun",
    price: "50",
    period: "7 gün",
    features: [
      "7 gün sınırsız AI vakası",
      "Tüm dilekçe şablonları",
      "AI Tutor sınırsız",
      "Otomatik yenilenmez — tek seferlik",
      "Sınav haftası için ideal",
    ],
    badge: "Sınav haftası",
    cta: "Sprint başlat",
    ctaHref: "/kayit",
    variant: "sprint",
  },
  {
    name: "Core",
    tagline: "Ana plan",
    price: "250",
    period: "ay",
    yearly: { price: "2.490", saving: "%17" },
    features: [
      "Sınırsız vaka (fair-use 10/gün)",
      "Tüm dilekçe şablonları",
      "AI Tutor sınırsız",
      "Karne + radar + mastery",
      "Yeni vakalar otomatik açılır",
      "Topluluk forum erişimi",
    ],
    badge: "Popüler",
    cta: "Core'a geç",
    ctaHref: "/kayit",
    variant: "core",
  },
  {
    name: "Pro",
    tagline: "Yoğun + premium AI",
    price: "400",
    period: "ay",
    yearly: { price: "3.990", saving: "%17" },
    features: [
      "Core'un tamamı",
      "Claude 3.5 Sonnet AI opsiyonu",
      "Öncelikli AI yanıtları",
      "Detaylı performans analizi",
      "Erken erişim yeni özellikler",
      "Çift hukukçu onaylı vakalar",
    ],
    cta: "Pro'ya geç",
    ctaHref: "/kayit",
    variant: "pro",
  },
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
        lead="Bütçene uygun başla, ihtiyacın artınca yükselt. İlk 7 gün koşulsuz iade. KDV dahil."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* 4 plan grid */}
        <div className="grid gap-5 lg:grid-cols-4">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        {/* Kurumsal şerit */}
        <div className="mt-16 rounded-2xl border border-line bg-white p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
                Kurumsal
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink">
                Fakülte · Baro · Hukuk Bürosu
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
                Min 50 lisans. Öğrenci başına 80-120 TL band. Toplu raporlama paneli,
                kuruma özel vaka eklemeleri, fatura kesimi. HMGS dönemi pilot programı açık.
              </p>
            </div>
            <Link
              to="/iletisim"
              className="inline-flex w-fit rounded-xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-ink/90"
            >
              Kurumsal teklif al
            </Link>
          </div>
        </div>

        {/* Sıkça sorulan */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <FaqItem
            q="Free tier'da ne yapabilirim?"
            a="Ayda 3 AI'lı vaka çözebilir, sınırsız tat vakalarını oynayabilir, karneni takip edebilirsin. AI Tutor kapalı."
          />
          <FaqItem
            q="Sprint nedir, ne zaman kullanılır?"
            a="HMGS sınavına 7-14 gün kala sınırsız AI vakası ve dilekçe çalışması yapacağın yoğun pakettir. Otomatik yenilenmez."
          />
          <FaqItem
            q="Pro'daki Claude ne fark eder?"
            a="DeepSeek varsayılan; Pro plan kullanıcılarına Claude 3.5 Sonnet seçeneği açılır — daha derin Türkçe + uzun bağlam."
          />
          <FaqItem
            q="İade koşulu?"
            a="İlk 7 gün koşulsuz iade. Sprint için sadece kullanmadıysan; Core/Pro için hesap kapatılır."
          />
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-ink/40">
          Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez · KDV dahil fiyatlar
        </p>
      </section>
    </PageShell>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const isCore = plan.variant === "core";

  const bg =
    plan.variant === "free"
      ? "bg-white text-ink"
      : plan.variant === "sprint"
        ? "bg-white text-ink"
        : plan.variant === "core"
          ? "bg-ink text-paper"
          : "bg-gradient-to-br from-ink via-ink to-ink/80 text-paper";

  const border =
    plan.variant === "free"
      ? "border border-line"
      : plan.variant === "sprint"
        ? "border-2 border-gold"
        : "border-2 border-gold/30";

  return (
    <div className={cn("relative flex flex-col rounded-2xl p-7", bg, border)}>
      {plan.badge ? (
        <span
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest",
            isCore ? "bg-gold text-ink" : "bg-gold text-white",
          )}
        >
          {plan.badge}
        </span>
      ) : null}

      <header className="mb-5">
        <h3 className="font-display text-xl font-extrabold">{plan.name}</h3>
        <p
          className={cn(
            "text-[11px] uppercase tracking-widest",
            plan.variant === "core" || plan.variant === "pro"
              ? "text-paper/50"
              : "text-ink/50",
          )}
        >
          {plan.tagline}
        </p>
      </header>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-extrabold">₺{plan.price}</span>
          <span
            className={cn(
              "text-xs",
              plan.variant === "core" || plan.variant === "pro"
                ? "text-paper/55"
                : "text-ink/55",
            )}
          >
            / {plan.period}
          </span>
        </div>
        {plan.yearly ? (
          <p
            className={cn(
              "mt-1 text-[10px]",
              plan.variant === "core" || plan.variant === "pro"
                ? "text-paper/50"
                : "text-ink/50",
            )}
          >
            Yıllık ₺{plan.yearly.price} ({plan.yearly.saving} indirim)
          </p>
        ) : null}
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs">
            <CheckCircle2
              className={cn(
                "mt-0.5 size-3.5 shrink-0",
                plan.variant === "free" ? "text-ink/60" : "text-gold",
              )}
            />
            <span
              className={cn(
                plan.variant === "core" || plan.variant === "pro"
                  ? "text-paper/85"
                  : "text-ink/80",
              )}
            >
              {f}
            </span>
          </li>
        ))}
        {plan.notIncluded?.map((f) => (
          <li
            key={f}
            className={cn(
              "flex items-start gap-2 text-xs opacity-50",
              plan.variant === "core" || plan.variant === "pro"
                ? "text-paper/60"
                : "text-ink/60",
            )}
          >
            <span className="mt-0.5 size-3.5 shrink-0 text-center text-[14px]">·</span>
            <span className="line-through">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to={plan.ctaHref}
        className={cn(
          "block rounded-xl px-4 py-3 text-center text-xs font-bold",
          plan.variant === "free"
            ? "border border-ink bg-white text-ink hover:bg-ink/5"
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
      <p className="mt-2 pl-5 text-xs leading-relaxed text-ink/65">{a}</p>
    </div>
  );
}
