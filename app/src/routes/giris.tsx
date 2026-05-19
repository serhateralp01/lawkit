import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [{ title: "Giriş | LawKit" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <h1 className="font-display text-4xl font-extrabold text-ink">Tekrar hoş geldin.</h1>
        <p className="mt-2 text-sm text-ink/55">
          E-posta ve şifrenle giriş yap, kaldığın yerden devam et.
        </p>
        <form className="mt-10 space-y-4 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <Field label="E-posta" type="email" />
          <Field label="Şifre" type="password" />
          <button
            type="button"
            className="w-full rounded-xl bg-ink py-3.5 text-sm font-bold text-paper"
          >
            Giriş yap
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/55">
          Hesabın yok mu?{" "}
          <Link to="/kayit" className="font-bold text-ink underline hover:text-gold">
            Ücretsiz oluştur
          </Link>
        </p>
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
