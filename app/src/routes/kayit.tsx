import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, AlertCircle, Mail } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/kayit")({
  head: () => ({
    meta: [{ title: "Ücretsiz Kayıt | LawKit" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  // Zaten giriş yapmışsa karneye yönlendir — render sırasında değil, effect içinde.
  useEffect(() => {
    if (!authLoading && user) {
      void navigate({ to: "/karne" });
    }
  }, [authLoading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("Sunucu yapılandırması eksik. Geliştiriciye haber verin.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name || email.split("@")[0] },
          emailRedirectTo: window.location.origin + "/karne",
        },
      });
      if (err) throw err;
      if (data.session) {
        void navigate({ to: "/karne" });
      } else {
        setConfirmSent(true);
      }
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink-1 sm:text-5xl">
            İlk vakanızı <span className="italic text-amber-foreground">ücretsiz</span> çözün.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-2">
            Kredi kartı istemiyoruz. Hesabınızı açın, iş hukuku haksız fesih vakasını sonuna
            kadar oynayın. Beğenirseniz Sprint ya da Core plana geçersiniz.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-1">
            {[
              "İlk vakaya tam erişim",
              "HMGS tanı testi (30 dk)",
              "Dilekçe Lab demo",
              "İstediğiniz zaman silme hakkı",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-indigo" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {confirmSent ? (
          <div className="self-start rounded-2xl border border-signal-positive/40 bg-signal-positive/5 p-8 text-center">
            <Mail className="mx-auto size-10 text-signal-positive" />
            <p className="mt-4 font-display text-xl font-bold text-ink-1">
              E-postanızı kontrol edin
            </p>
            <p className="mt-2 text-sm text-ink-2">
              <strong>{email}</strong> adresine doğrulama bağlantısı gönderdik. Bağlantıya
              tıkladığınızda hesabınız aktif olur ve karneniz açılır.
            </p>
            <p className="mt-4 text-xs text-ink-3">
              E-posta gelmediyse spam klasörünü kontrol edin ya da birkaç dakika bekleyin.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 self-start rounded-2xl border border-line bg-surface-raised p-8 shadow-sm"
          >
            <Field label="Ad Soyad" value={name} onChange={setName} autoComplete="name" />
            <Field
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              label="Şifre (en az 6 karakter)"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
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
              Hesap oluştur
            </button>
            <p className="text-center text-xs text-ink-3">
              Devam ederek{" "}
              <Link to="/iletisim" className="underline">
                Kullanım Şartları
              </Link>
              'nı kabul etmiş olursunuz.
            </p>
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
  if (msg.includes("already registered") || msg.includes("User already")) {
    return "Bu e-posta zaten kayıtlı. Giriş yapın ya da şifre sıfırlama isteyin.";
  }
  if (msg.includes("Password should be at least")) return "Şifre en az 6 karakter olmalı.";
  if (msg.includes("rate limit")) return "Çok fazla deneme yaptınız. Birkaç dakika sonra tekrar deneyin.";
  if (msg.includes("invalid email") || msg.includes("Email")) return "Geçerli bir e-posta adresi yazın.";
  return msg;
}
