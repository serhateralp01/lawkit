import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim | LawKit" },
      {
        name: "description",
        content:
          "LawKit ile iletişime geçin. Kurumsal teklifler, pilot başvurular ve genel sorular için.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <PageHero
        eyebrow="İletişim"
        title={
          <>
            Konuşalım.{" "}
            <span className="italic text-gold">Kısa tutalım.</span>
          </>
        }
        lead="Kurumsal teklif, pilot başvuru, içerik önerisi veya basit bir merak — formu doldurun, 1 iş günü içinde dönüş yapıyoruz."
      />

      <section className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        {sent ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <p className="font-display text-2xl font-bold text-ink">Teşekkürler.</p>
            <p className="mt-2 text-sm text-ink/60">
              Mesajınız bize ulaştı. 1 iş günü içinde döneceğiz.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-5 rounded-2xl border border-line bg-white p-8 shadow-sm"
          >
            <Field label="Ad Soyad" name="name" />
            <Field label="E-posta" name="email" type="email" />
            <Field label="Konu" name="subject" />
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Mesaj
              </label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl border border-line bg-paper-warm/30 px-4 py-3 text-sm outline-none transition-colors focus:border-gold focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-ink py-3.5 text-sm font-bold text-paper hover:bg-ink/90"
            >
              Gönder
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/60"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full rounded-xl border border-line bg-paper-warm/30 px-4 py-3 text-sm outline-none transition-colors focus:border-gold focus:bg-white"
      />
    </div>
  );
}
