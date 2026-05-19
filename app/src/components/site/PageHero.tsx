import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
}) {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/60">{lead}</p>
      </div>
    </section>
  );
}

export function CTAFooter({
  title,
  href = "/kayit",
  cta = "Ücretsiz başla",
}: {
  title: string;
  href?: "/kayit" | "/iletisim" | "/fiyatlandirma";
  cta?: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-paper-warm/50 p-10 sm:flex-row sm:items-center">
        <p className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</p>
        <Link
          to={href}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-bold text-paper hover:bg-ink/90"
        >
          {cta} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
