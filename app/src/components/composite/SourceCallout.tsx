import { ExternalLink, BookMarked } from "lucide-react";
import { sources } from "@/content/sources";
import { cn } from "@/lib/utils";

interface Props {
  sourceId: keyof typeof sources;
  className?: string;
}

/**
 * Hukuki kaynak alıntısı — grounded explanation katmanının görsel kontratı.
 * Halüsinasyon kontrolü: yalnız doğrulanmış kaynak id'si üzerinden render eder.
 */
export function SourceCallout({ sourceId, className }: Props) {
  const s = sources[sourceId];
  if (!s) return null;
  return (
    <figure
      className={cn(
        "rounded-md border border-line bg-surface-sunken/60 p-4",
        className,
      )}
    >
      <figcaption className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo">
          <BookMarked className="size-3" />
          Doğrulanmış kaynak
        </span>
        {s.url ? (
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-3 hover:text-indigo"
          >
            mevzuat.gov.tr <ExternalLink className="size-3" />
          </a>
        ) : null}
      </figcaption>
      <p className="text-[11px] font-bold uppercase tracking-widest text-ink-2">
        {s.shortTitle}
      </p>
      <blockquote className="legal-quote mt-2 text-sm">
        {s.body}
      </blockquote>
      {s.verifiedAt ? (
        <p className="mt-2 text-[10px] text-ink-3">
          Hukukçu doğrulaması: {s.verifiedAt} · {s.verifier}
        </p>
      ) : null}
    </figure>
  );
}
