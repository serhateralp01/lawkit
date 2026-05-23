import { Link } from "@tanstack/react-router";
import { Lock, Loader2, Mail, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  feature?: string;
}

export function BetaGate({ children, feature }: Props) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center text-ink-3">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (user && isAdmin) {
    return <>{children}</>;
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-5 inline-flex size-14 items-center justify-center rounded-full bg-amber-soft/40 ring-2 ring-amber/30">
          <Lock className="size-6 text-amber-foreground" />
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-foreground">
          Erken erişim · Kapalı beta
        </p>
        <h1 className="font-display text-3xl font-extrabold text-ink-1 lg:text-4xl">
          {user
            ? "Bu özellik henüz herkese açık değil"
            : "Önce giriş yapmalısınız"}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-2">
          {user ? (
            <>
              LawKit şu anda kapalı beta döneminde. {feature ? <strong>{feature}</strong> : "Bu özellik"} için
              davet aldıktan sonra hesabınız aktif edilecek. Sıralı olarak davetiye gönderiyoruz.
            </>
          ) : (
            <>
              {feature ? <strong>{feature}</strong> : "Bu içerik"} yalnızca giriş yapan beta kullanıcılarına
              açık. Davet aldıysanız giriş yapın; almadıysanız bekleme listesine katılın.
            </>
          )}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <Link
                to="/iletisim"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink-1 px-6 py-3 text-sm font-bold text-surface-raised hover:bg-ink-1/90"
              >
                <Mail className="size-4" /> Erken erişim talep et
              </Link>
              <Link
                to="/"
                className="rounded-xl border border-line bg-surface-raised px-6 py-3 text-sm font-semibold text-ink-1 hover:bg-surface-sunken"
              >
                Ana sayfaya dön
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/giris"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink-1 px-6 py-3 text-sm font-bold text-surface-raised hover:bg-ink-1/90"
              >
                Giriş yap
              </Link>
              <Link
                to="/kayit"
                className="rounded-xl border border-line bg-surface-raised px-6 py-3 text-sm font-semibold text-ink-1 hover:bg-surface-sunken"
              >
                Kayıt ol
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 rounded-2xl border border-line bg-surface-raised p-5 text-left">
          <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo">
            <Sparkles className="size-3" /> Açılınca neler göreceksiniz
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-ink-2">
            <li>• 3 hukuk dalında 6 derin vaka</li>
            <li>• AI Tutor — her sahnede canlı dilekçe değerlendirmesi</li>
            <li>• Karne ve radar — beceri haritanız, mastery rozetleri</li>
            <li>• Dilekçe Lab — parça parça yazım ve AI puanlama</li>
            <li>• HMGS Arena tanı testi — zayıf alanınıza göre vaka önerisi</li>
          </ul>
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-widest text-ink-3">
          Eğitim amaçlı simülasyon · LawKit hukuki tavsiye vermez
        </p>
      </section>
    </PageShell>
  );
}
