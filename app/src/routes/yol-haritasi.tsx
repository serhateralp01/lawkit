import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, GitBranch } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/yol-haritasi")({
  head: () => ({
    meta: [
      { title: "Yol haritası — Aşama 0'dan 7'ye | LawKit" },
      {
        name: "description",
        content:
          "Her aşamada test edilebilir bir çıktı. Her aşamanın sonunda go / iterate / kill kapısı. LawKit'in inşa planı.",
      },
    ],
  }),
  component: RoadmapPage,
});

type Status = "done" | "active" | "queued";

const stages: { n: string; title: string; output: string; status: Status }[] = [
  {
    n: "0",
    title: "Temel",
    output: "Repo, marka, alan adı, ödeme sağlayıcı evrakları, KVKK aydınlatma, mesafeli satış sözleşmesi, içerik stil rehberi, çerçeve dokümanı v0.1.",
    status: "done",
  },
  {
    n: "1",
    title: "Şema ve engine",
    output: "Case JSON şeması, rubric şeması, source şeması; case-engine paketi (state machine + transition validator); tek oyuncak vaka ile end-to-end test.",
    status: "active",
  },
  {
    n: "2",
    title: "Tasarım sistemi sürümü",
    output: "Token dondurulur, primitive + composite bileşenler kurulur, kontrast ve klavye erişilebilirliği denetlenir. 25-30 stabil bileşen.",
    status: "active",
  },
  {
    n: "3",
    title: "Dikey MVP",
    output: "Tek hukuk dalı (İş Hukuku), üç vaka, HMGS Arena iş hukuku alt küme, dilekçe lab temel sürümü, karne ekranı, ödeme. AI orchestration canlı. 20-30 öğrenciyle kapalı beta.",
    status: "queued",
  },
  {
    n: "4",
    title: "Geri bildirim ve iyileştirme",
    output: "Beta verisinden: hangi adımda kayıp, hangi rubric boyutu düşük. Engine threshold ve case zorluk yeniden ayarlanır. Eval test seti büyür.",
    status: "queued",
  },
  {
    n: "5",
    title: "Genişleme — dikey",
    output: "Borçlar genel hükümler, medeni usul, arabuluculuk daha derin işlenir. Vaka sayısı 10-15'e çıkar.",
    status: "queued",
  },
  {
    n: "6",
    title: "Dilekçe lab tam sürümü",
    output: "Yapılandırılmış parça-parça dilekçe → her parça için rubric → kümülatif kalite skoru. Karneye dilekçe portföyü.",
    status: "queued",
  },
  {
    n: "7",
    title: "Ölçek",
    output: "HMGS geniş içerik kapsama planı, branş akademisi modülü, B2B fakülte/baro lisans değerlendirmesi. Geçiş kararı kullanıcı verisiyle alınır.",
    status: "queued",
  },
];

const styles: Record<Status, { dot: string; chip: string; label: string }> = {
  done:   { dot: "bg-signal-positive", chip: "bg-signal-positive/10 text-signal-positive", label: "Tamamlandı" },
  active: { dot: "bg-amber",           chip: "bg-amber-soft text-amber",                   label: "Aktif" },
  queued: { dot: "bg-ink-3",           chip: "bg-surface-sunken text-ink-3",               label: "Sırada" },
};

function RoadmapPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Yol haritası · v0.1"
        title={
          <>
            Her aşama, <span className="italic text-amber">test edilebilir</span> bir çıktı.
          </>
        }
        lead="Pazarlama metni değil mühendislik planı. Her aşamanın sonunda go / iterate / kill kapısı; uydurma metrikle ileri gidilmez."
      />

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-8">
        <ol className="relative space-y-6 border-l border-line pl-8">
          {stages.map((s) => {
            const st = styles[s.status];
            return (
              <li key={s.n} className="relative">
                <span
                  className={cn(
                    "absolute -left-[2.15rem] top-1.5 grid size-5 place-items-center rounded-full ring-4 ring-surface",
                    st.dot,
                  )}
                >
                  {s.status === "done" ? (
                    <CheckCircle2 className="size-3 text-surface-raised" />
                  ) : s.status === "active" ? (
                    <GitBranch className="size-2.5 text-surface-raised" />
                  ) : (
                    <Circle className="size-2.5 text-surface-raised" />
                  )}
                </span>
                <div className="rounded-xl border border-line bg-surface-raised p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
                      Aşama {s.n}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                        st.chip,
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink-1">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.output}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <CTAFooter title="Yola dahil ol — erken erişim listesinde yerini ayır." />
    </PageShell>
  );
}
