import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, FileCheck2, AlertTriangle, EyeOff, BookCheck } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";

export const Route = createFileRoute("/guvenlik-kvkk")({
  head: () => ({
    meta: [
      { title: "Güvenlik & KVKK — Halüsinasyon ve veri kontrolü | LawKit" },
      {
        name: "description",
        content:
          "Kaynak topraklaması, PII maskeleme, hukukçu onayı, KVKK Üretken YZ Rehberi uyumu — LawKit'in kalite ve veri katmanı.",
      },
    ],
  }),
  component: GuvenlikPage,
});

const cards = [
  {
    icon: BookCheck,
    title: "Kaynak topraklaması",
    body: "AI çıktıları yalnız veritabanında kayıtlı, hukukçu onaylı kaynak parçalarını kullanır. Kaynak yoksa cevap 'doğrulanmış kaynak bulunamadı' der; uydurma yapmaz.",
  },
  {
    icon: ShieldCheck,
    title: "Auditor ajanı",
    body: "Uydurulmuş kanun maddesi veya içtihat tespit edilirse, çıktı kullanıcıya gösterilmeden geri çevrilir. Agentic RAG mimarisinde Librarian / Auditor / Strategist / Red Team rolleri ayrıdır.",
  },
  {
    icon: FileCheck2,
    title: "Structured outputs",
    body: "Her AI çıktısı JSON şemaya zorlanır. Şema dışı çıktı reddedilir. Serbest metin yalnız yapılandırılmış zarfın açıklayıcı alanlarında bulunur.",
  },
  {
    icon: EyeOff,
    title: "PII maskeleme",
    body: "Yüklediğin dosyada isim, TC kimlik, telefon, adres, e-posta sunucu tarafında maskelenmeden modele gitmez. KVKK Üretken YZ Rehberi (2024) doğrultusunda.",
  },
  {
    icon: Lock,
    title: "Yurt içi veri",
    body: "Veriler Türkiye sunucularında saklanır. Yurtdışı veri aktarımı şartı varsa açık metinle bildirilir; onayın olmadan aktarım yapılmaz.",
  },
  {
    icon: AlertTriangle,
    title: "Eğitim amaçlı simülasyon",
    body: "Her AI çıktısının altında uyarı: 'Eğitim amaçlı simülasyon. Gerçek hukuki tavsiye değildir.' Bu görünürlük sorumluluk gerekçesidir, pazarlama değil.",
  },
];

function GuvenlikPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Güvenlik · KVKK · Kalite"
        title={
          <>
            Hukukta AI hatası <span className="italic text-amber">opsiyonel değil</span>, omurga.
          </>
        }
        lead="Yanlış kanun maddesi, uydurulmuş içtihat, sızdırılan müvekkil verisi — hukukta her birinin maliyeti ağır. LawKit'in kalite katmanı bunları varsayım yerine kural haline getirir."
      />

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="space-y-3 rounded-xl border border-line bg-surface-raised p-6"
            >
              <div className="grid size-10 place-items-center rounded-lg bg-indigo-soft/60 text-indigo">
                <Icon className="size-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-1">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <div className="rounded-xl border border-line bg-surface-sunken/40 p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            İçerik onay zinciri
          </h3>
          <ol className="mt-4 space-y-3 text-sm text-ink-2">
            <li><span className="font-semibold text-ink-1">(a)</span> Yazar uzman — vakayı kurar.</li>
            <li><span className="font-semibold text-ink-1">(b)</span> Hukukçu inceleyici — ayrı kişi, mevzuat + içtihat denetimi.</li>
            <li><span className="font-semibold text-ink-1">(c)</span> Eval test seti — 8-12 senaryo, AI çıktısının kabul aralığında kalıp kalmadığını otomatik denetler.</li>
            <li><span className="font-semibold text-ink-1">(d)</span> Yayın — versiyonlu, geri alınabilir.</li>
          </ol>
        </div>
      </section>

      <CTAFooter title="Sorularını gönder, ekibimiz cevaplasın." href="/iletisim" cta="İletişime geç" />
    </PageShell>
  );
}
