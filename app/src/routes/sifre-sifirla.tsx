import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export const Route = createFileRoute("/sifre-sifirla")({
  head: () => ({
    meta: [{ title: "Şifre sıfırla | LawKit" }],
  }),
  component: ResetPasswordPage,
});

/**
 * Şifre sıfırlama akışı, iki mod:
 *   1) "request"  → form: email gir, Supabase mail gönderir
 *   2) "reset"    → kullanıcı Supabase mailindeki linkten gelir;
 *                   onAuthStateChange "PASSWORD_RECOVERY" event'i tetikler;
 *                   yeni şifre formu açılır, updateUser ile değiştirir.
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase mail linkinden gelinince PASSWORD_RECOVERY event'i atılır.
  useEffect(() => {
    if (typeof window === "undefined" || !hasSupabaseConfig()) return;
    const supabase = supabaseBrowser();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // URL'deki hash içinde access_token + type=recovery varsa direkt reset modu.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token=")) {
      setMode("reset");
    }
  }, []);

  // Kullanıcı zaten oturum açmışsa (recovery dışı) → karneye
  useEffect(() => {
    if (user && mode === "request") {
      // Recovery flow'unda da user var; ama PASSWORD_RECOVERY event'i mode'u
      // "reset"e çevirdi. Burada sadece request modunda navigate ediyoruz.
      void navigate({ to: "/karne" });
    }
  }, [user, mode, navigate]);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("Sunucu yapılandırması eksik.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/sifre-sifirla",
      });
      if (err) throw err;
      setEmailSent(true);
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  const applyNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("İki şifre alanı uyuşmuyor.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => void navigate({ to: "/karne" }), 2000);
    } catch (e) {
      setError(translateError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        {mode === "request" ? (
          <>
            <h1 className="font-display text-4xl font-extrabold text-ink-1">
              Şifremi unuttum
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              E-posta adresini yaz, sıfırlama bağlantısını gönderelim.
            </p>

            {emailSent ? (
              <div className="mt-10 rounded-2xl border border-signal-positive/40 bg-signal-positive/5 p-6 text-center">
                <Mail className="mx-auto size-8 text-signal-positive" />
                <p className="mt-3 font-display text-lg font-bold text-ink-1">
                  Mailini kontrol et
                </p>
                <p className="mt-1 text-sm text-ink-2">
                  <strong>{email}</strong> adresine sıfırlama bağlantısı yolladık.
                  Bağlantıya tıklayınca buraya geri döner, yeni şifreni belirlersin.
                </p>
              </div>
            ) : (
              <form
                onSubmit={requestReset}
                className="mt-10 space-y-4 rounded-2xl border border-line bg-surface-raised p-8 shadow-sm"
              >
                <Field
                  label="E-posta"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                {error ? <ErrorBox text={error} /> : null}
                <button
                  type="submit"
                  disabled={busy || !email}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-1 py-3.5 text-sm font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Sıfırlama bağlantısı gönder
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-ink-2">
              <Link to="/giris" className="font-bold text-ink-1 underline hover:text-indigo">
                Giriş sayfasına dön
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-extrabold text-ink-1">
              Yeni şifren
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              En az 8 karakter, kolay tahmin edilmesin.
            </p>

            {done ? (
              <div className="mt-10 rounded-2xl border border-signal-positive/40 bg-signal-positive/5 p-6 text-center">
                <CheckCircle2 className="mx-auto size-8 text-signal-positive" />
                <p className="mt-3 font-display text-lg font-bold text-ink-1">
                  Şifre değiştirildi
                </p>
                <p className="mt-1 text-sm text-ink-2">Karneye yönlendiriliyorsun…</p>
              </div>
            ) : (
              <form
                onSubmit={applyNewPassword}
                className="mt-10 space-y-4 rounded-2xl border border-line bg-surface-raised p-8 shadow-sm"
              >
                <Field
                  label="Yeni şifre"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <Field
                  label="Tekrar yeni şifre"
                  type="password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
                {error ? <ErrorBox text={error} /> : null}
                <button
                  type="submit"
                  disabled={busy || !password || !confirm}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink-1 py-3.5 text-sm font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Şifreyi değiştir
                </button>
              </form>
            )}
          </>
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

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-signal-critical/40 bg-signal-critical/5 p-2.5 text-xs text-signal-critical">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function translateError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("User not found")) return "Bu e-posta ile kayıtlı kullanıcı yok.";
  if (msg.includes("rate limit")) return "Çok fazla deneme. Birkaç dakika sonra tekrar dene.";
  if (msg.includes("Password should be")) return "Şifre çok kısa. En az 8 karakter girmelisin.";
  if (msg.includes("session_not_found")) return "Sıfırlama linki geçersiz veya süresi geçmiş.";
  return msg;
}
