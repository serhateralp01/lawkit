import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [{ title: "Giriş | LawKit" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  if (!authLoading && user) {
    void navigate({ to: "/karne" });
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("Sunucu yapılandırması eksik. Geliştiriciye haber verin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      void navigate({ to: "/karne" });
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  const onMagicLink = async () => {
    if (!email) {
      setError("Önce e-posta adresinizi yazın.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/karne" },
      });
      if (err) throw err;
      setMagicSent(true);
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <h1 className="font-display text-4xl font-extrabold text-ink-1">Tekrar hoş geldiniz.</h1>
        <p className="mt-2 text-sm text-ink-2">
          E-posta ve şifrenizle giriş yapın, kaldığınız yerden devam edin.
        </p>

        {magicSent ? (
          <div className="mt-10 rounded-2xl border border-signal-positive/40 bg-signal-positive/5 p-6 text-center">
            <Mail className="mx-auto size-8 text-signal-positive" />
            <p className="mt-3 font-display text-lg font-bold text-ink-1">E-postanızı kontrol edin</p>
            <p className="mt-1 text-sm text-ink-2">
              <strong>{email}</strong> adresine giriş bağlantısı gönderdik. Bağlantıya tıkladığınızda
              otomatik olarak giriş yapmış olacaksınız.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-4 rounded-2xl border border-line bg-surface-raised p-8 shadow-sm"
          >
            <Field
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-signal-critical/40 bg-signal-critical/5 p-2.5 text-xs text-signal-critical">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy || !email || !password}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-1 py-3.5 text-sm font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Giriş yap
            </button>

            <div className="text-right">
              <Link
                to="/sifre-sifirla"
                className="text-[11px] font-semibold text-ink-3 underline-offset-2 hover:text-ink-1 hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>

            <div className="relative py-2 text-center">
              <span className="absolute left-0 top-1/2 h-px w-full bg-line" />
              <span className="relative bg-surface-raised px-2 text-[10px] uppercase tracking-widest text-ink-3">
                veya
              </span>
            </div>

            <button
              type="button"
              onClick={onMagicLink}
              disabled={busy || !email}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-raised py-3 text-sm font-semibold text-ink-1 hover:bg-surface-sunken disabled:opacity-50"
            >
              <Mail className="size-4" />
              Şifresiz giriş bağlantısı gönder
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-2">
          Hesabınız yok mu?{" "}
          <Link to="/kayit" className="font-bold text-ink-1 underline hover:text-indigo">
            Ücretsiz hesap oluşturun
          </Link>
        </p>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-ink-3">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-line bg-surface-sunken/30 px-4 py-3 text-sm text-ink-1 outline-none focus:border-indigo focus:bg-surface-raised"
      />
    </div>
  );
}

function translateError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (msg.includes("Email not confirmed")) return "E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.";
  if (msg.includes("rate limit")) return "Çok fazla deneme yaptınız. Birkaç dakika sonra tekrar deneyin.";
  return msg;
}
