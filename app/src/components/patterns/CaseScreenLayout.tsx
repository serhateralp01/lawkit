import type { LegalCase } from "@/content/types";
import { Clock, FileText, Layers } from "lucide-react";

interface Props {
  case: LegalCase;
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

/**
 * CaseScreenLayout — desktop-first 3 kolon vaka ekranı.
 *
 * Sol (280px): olgu defteri — kompakt, statik
 * Orta (esnek): aktif sahne — tek mikro-görev, geniş
 * Sağ (300px): beceriler + ipuçları + ilerleme
 *
 * Mobile breakpoint yok; yatay tablet 1024px+ optimum, desktop 1440px+ ideal.
 */
export function CaseScreenLayout({ case: c, left, center, right }: Props) {
  return (
    <div className="mx-auto max-w-[1560px] px-6 pb-16 pt-8 xl:px-10">
      {/* Künye */}
      <header className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            Dosya · {c.id.toUpperCase()} · {branchLabel(c.branch)}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-bold text-ink-1 lg:text-3xl">
            {c.title}
          </h1>
        </div>
        <dl className="flex items-center gap-6 text-sm text-ink-2">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-ink-3" />
            <dt className="sr-only">Süre</dt>
            <dd>~{c.estimatedMinutes} dk</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="size-4 text-ink-3" />
            <dt className="sr-only">Zorluk</dt>
            <dd>Seviye {c.difficulty}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="size-4 text-ink-3" />
            <dt className="sr-only">Düğüm sayısı</dt>
            <dd>{c.nodes.length} adım</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-6 grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-6 rounded-2xl border border-line bg-surface-raised p-5">
          {left}
        </aside>
        <main className="rounded-2xl border border-line bg-surface-raised p-7 shadow-[var(--shadow-card)]">
          {center}
        </main>
        <aside className="space-y-5 rounded-2xl border border-line bg-surface-raised p-5">
          {right}
        </aside>
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-ink-3">
        Eğitim amaçlı simülasyon · LawKit gerçek hukuki tavsiye vermez
      </p>
    </div>
  );
}

function branchLabel(b: LegalCase["branch"]): string {
  switch (b) {
    case "is_hukuku":
      return "İş Hukuku";
    case "borclar":
      return "Borçlar";
    case "medeni_usul":
      return "Medeni Usul";
    case "ceza":
      return "Ceza";
    case "idare":
      return "İdare";
    case "ticaret":
      return "Ticaret";
    default:
      return b;
  }
}
