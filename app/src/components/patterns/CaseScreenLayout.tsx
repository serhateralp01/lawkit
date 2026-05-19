import type { LegalCase } from "@/content/types";
import { Clock, FileText, Layers } from "lucide-react";

interface Props {
  case: LegalCase;
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

/**
 * CaseScreenLayout — çerçeve §5'teki "üçlü kolon" örüntüsü.
 *
 * Sol (28%): olay dosyası — statik referans, her an dönülür
 * Orta (44%): aktif karar veya geri bildirim — tek mikro-görev
 * Sağ (28%): rubrik göstergesi, ipucu merdiveni, görev listesi
 *
 * Bilim:
 *   - Sweller (CLT): extraneous load minimize, tek aktif görev
 *   - Vygotsky ZPD: scaffolding kullanıcı kontrolünde (sağ kolon)
 */
export function CaseScreenLayout({ case: c, left, center, right }: Props) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 lg:px-8 lg:pt-10">
      {/* Künye */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-3">
            Dosya · {c.id.toUpperCase()} · {branchLabel(c.branch)}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-ink-1 sm:text-2xl">
            {c.title}
          </h1>
        </div>
        <dl className="flex items-center gap-5 text-xs text-ink-2">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-ink-3" />
            <dt className="sr-only">Süre</dt>
            <dd>~{c.estimatedMinutes} dk</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-ink-3" />
            <dt className="sr-only">Zorluk</dt>
            <dd>Seviye {c.difficulty}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-ink-3" />
            <dt className="sr-only">Düğüm sayısı</dt>
            <dd>{c.nodes.length} adım</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,1fr)_minmax(0,1.55fr)_minmax(260px,1fr)]">
        <aside className="space-y-5 rounded-lg border border-line bg-surface-raised p-5">
          {left}
        </aside>
        <main className="rounded-lg border border-line bg-surface-raised p-6 shadow-[var(--shadow-card)]">
          {center}
        </main>
        <aside className="space-y-6 rounded-lg border border-line bg-surface-raised p-5">
          {right}
        </aside>
      </div>

      <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-ink-3">
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
