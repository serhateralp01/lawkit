import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/kayit")({
  head: () => ({
    meta: [{ title: "Ücretsiz Kayıt | LawKit" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            İlk vakanı{" "}
            <span className="italic text-gold">ücretsiz</span> oyna.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink/60">
            Kredi kartı istemiyoruz. Hesabını aç, iş hukuku haksız fesih vakasını sonuna kadar oyna.
            Beğenirsen Sprint veya Core'a geçersin.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink/75">
            {[
              "İlk vakaya tam erişim",
              "HMGS tanı testi (30 dk)",
              "Dilekçe Lab demo",
              "İstediğinde silme hakkı",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-gold" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <form className="space-y-4 self-start rounded-2xl border border-line bg-white p-8 shadow-sm">
          <Field label="Ad Soyad" />
          <Field label="E-posta" type="email" />
          <Field label="Şifre" type="password" />
          <button
            type="button"
            className="w-full rounded-xl bg-ink py-3.5 text-sm font-bold text-paper"
          >
            Hesabımı oluştur
          </button>
          <p className="text-center text-xs text-ink/45">
            Devam ederek{" "}
            <Link to="/iletisim" className="underline">
              Kullanım Şartları
            </Link>
            'nı kabul etmiş olursun.
          </p>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink/60">
        {label}
      </label>
      <input
        type={type}
        className="w-full rounded-xl border border-line bg-paper-warm/30 px-4 py-3 text-sm outline-none focus:border-gold focus:bg-white"
      />
    </div>
  );
}
