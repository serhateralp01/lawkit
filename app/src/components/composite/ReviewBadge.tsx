/**
 * ReviewBadge — vakanın bağımsız hukukçu onay durumu.
 *
 * Onaylı: yeşil rozet + hukukçu adı
 * Onaysız: amber uyarı + "henüz inceleniyor"
 */

import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { ReviewMeta } from "@/content/types";
import { cn } from "@/lib/utils";

interface Props {
  review?: ReviewMeta;
  variant?: "chip" | "block";
  className?: string;
}

export function ReviewBadge({ review, variant = "chip", className }: Props) {
  if (variant === "chip") {
    if (review) {
      return (
        <span
          title={`Son inceleme: ${review.reviewedAt}${review.notes ? ` — ${review.notes}` : ""}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-signal-positive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-signal-positive ring-1 ring-signal-positive/30",
            className,
          )}
        >
          <ShieldCheck className="size-3" />
          Hukukçu onaylı
        </span>
      );
    }
    return (
      <span
        title="Bu vaka henüz bağımsız hukukçu incelemesinde değil — eğitim amaçlı simülasyon"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-amber-soft/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-foreground ring-1 ring-amber/30",
          className,
        )}
      >
        <ShieldAlert className="size-3" />
        İnceleme bekliyor
      </span>
    );
  }

  // Block — vaka içinde küçük açıklayıcı kart
  if (review) {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-md border border-signal-positive/30 bg-signal-positive/5 p-3",
          className,
        )}
      >
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-signal-positive" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-ink-1">
            {review.reviewerName}
            {review.reviewerCredential ? (
              <span className="text-ink-3"> · {review.reviewerCredential}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-ink-2">
            {review.notes ?? "Bu vakanın hukuki içeriğini inceledim, kabul ettim."}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-ink-3">
            Son inceleme: {review.reviewedAt}
            {review.version ? ` · v${review.version}` : null}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-md border border-amber/40 bg-amber-soft/30 p-3 text-xs",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-foreground" />
      <div className="leading-relaxed text-ink-2">
        <p className="font-bold text-ink-1">Henüz bağımsız hukukçu incelemesinde değil</p>
        <p className="mt-0.5">
          Bu vaka eğitim amaçlı bir simülasyondur. Yargı süreçlerinde uygulamadan önce
          uzman hukukçuya danışın.
        </p>
      </div>
    </div>
  );
}
