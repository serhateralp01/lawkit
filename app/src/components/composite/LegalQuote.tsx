import { cn } from "@/lib/utils";

/**
 * Hukuki alıntı bileşeni — kanun, içtihat veya doktrin pasajını
 * arayüz metninden tipografik olarak ayırır (Source Serif italic).
 */
export function LegalQuote({
  children,
  cite,
  className,
}: {
  children: React.ReactNode;
  cite?: string;
  className?: string;
}) {
  return (
    <figure className={cn("space-y-2", className)}>
      <blockquote className="legal-quote text-base">{children}</blockquote>
      {cite ? (
        <figcaption className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3">
          — {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}
