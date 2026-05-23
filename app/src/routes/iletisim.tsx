import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PageHero } from "@/components/site/PageHero";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim | LawKit" },
      {
        name: "description",
        content: "LawKit ile iletişime geçin. Kurumsal teklifler, pilot başvurular ve genel sorularınız için.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("Sunucu bağlantısı yok. Daha sonra tekrar deneyin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject: subject || null,
        message,
      });
      if (err) throw err;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gönderim başarısız. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="İletişim"
        title={<>Konuşalım.</>}
        lead="Kurumsal teklif, pilot başvuru ya da bir sorunuz varsa yazın. Bir iş günü içinde dönüş yapıyoruz."
      />

      <section className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        {sent ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <p className="font-display text-2xl font-bold text-ink">Teşekkürler.</p>
            <p className="mt-2 text-sm text-ink/60">
              Mesajınız ulaştı. Bir iş günü içinde dönüş yapacağız.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-white p-8 shadow-sm">
            <Field label="Ad Soyad" value={name} onChange={setName} />
            <Field label="E-posta" type="email" value={email} onChange={setEmail} />
            <Field label="Konu" value={subject} onChange={setSubject} required={false} />
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Mesaj
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper-warm/30 px-4 py-3 text-sm outline-none transition-colors focus:border-gold focus:bg-white"
              />
            </div>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy || !name || !email || !message}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-bold text-paper hover:bg-ink/90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
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
  type = "text",
  value,
  onChange,
  required = true,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-line bg-paper-warm/30 px-4 py-3 text-sm outline-none transition-colors focus:border-gold focus:bg-white"
      />
    </div>
  );
}
