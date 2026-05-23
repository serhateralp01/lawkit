import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle, CheckCircle2, LogOut, User as UserIcon } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { BetaGate } from "@/components/site/BetaGate";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useGamificationStore } from "@/lib/gamification";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [{ title: "Profilim | LawKit" }],
  }),
  component: ProfilePageGated,
});

function ProfilePageGated() {
  return (
    <BetaGate feature="Profil ayarları">
      <ProfilePage />
    </BetaGate>
  );
}

interface ProfileRow {
  display_name: string | null;
  school: string | null;
  exam_target_date: string | null;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const xp = useGamificationStore((s) => s.xp);
  const streak = useGamificationStore((s) => s.streak);
  const attemptsCount = useGamificationStore((s) => s.attempts.length);

  // Login zorunlu — değilse /giris'e
  useEffect(() => {
    if (!authLoading && !user) {
      void navigate({ to: "/giris" });
    }
  }, [authLoading, user, navigate]);

  // Profili çek
  useEffect(() => {
    if (!user || !hasSupabaseConfig()) {
      setLoading(false);
      return;
    }
    const supabase = supabaseBrowser();
    let mounted = true;
    supabase
      .from("profiles")
      .select("display_name, school, exam_target_date")
      .eq("id", user.id)
      .single()
      .then(({ data, error: err }) => {
        if (!mounted) return;
        if (err) {
          setError("Profil yüklenemedi: " + err.message);
        } else {
          setProfile(data as ProfileRow);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !hasSupabaseConfig()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name?.trim() || null,
          school: profile.school?.trim() || null,
          exam_target_date: profile.exam_target_date || null,
        })
        .eq("id", user.id);
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  if (authLoading || loading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center text-ink-3">
          <Loader2 className="size-5 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!user || !profile) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-20 text-center text-ink-3">
          Profil bilgisi yok.{" "}
          <Link to="/giris" className="text-indigo underline">
            Giriş yap
          </Link>
          .
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-6 py-16">
        <header className="mb-8 flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-indigo-soft/60 ring-1 ring-indigo/20">
            <UserIcon className="size-6 text-indigo" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo">
              Profilim
            </p>
            <h1 className="font-display text-3xl font-extrabold text-ink-1">
              {profile.display_name ?? user.email?.split("@")[0]}
            </h1>
            <p className="mt-0.5 text-xs text-ink-3">{user.email}</p>
          </div>
        </header>

        {/* İstatistik şeridi */}
        <div className="mb-8 grid grid-cols-3 gap-3 rounded-2xl border border-line bg-surface-raised p-4">
          <Stat label="Toplam XP" value={xp.toString()} />
          <Stat label="Ardışık gün" value={`${streak} gün`} />
          <Stat label="Vaka" value={attemptsCount.toString()} />
        </div>

        {/* Düzenleme formu */}
        <form
          onSubmit={save}
          className="space-y-4 rounded-2xl border border-line bg-surface-raised p-6 shadow-sm"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-3">
            Bilgilerini düzenle
          </h2>

          <Field
            label="Görünen ad"
            value={profile.display_name ?? ""}
            onChange={(v) => setProfile({ ...profile, display_name: v })}
            placeholder="Örn. Selin"
          />

          <Field
            label="Okul / Fakülte"
            value={profile.school ?? ""}
            onChange={(v) => setProfile({ ...profile, school: v })}
            placeholder="Örn. İstanbul Üniversitesi Hukuk"
          />

          <Field
            label="Hedef sınav tarihi (opsiyonel)"
            type="date"
            value={profile.exam_target_date ?? ""}
            onChange={(v) => setProfile({ ...profile, exam_target_date: v })}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-signal-critical/40 bg-signal-critical/5 p-2.5 text-xs text-signal-critical">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {saved ? (
            <div className="flex items-center gap-2 rounded-md border border-signal-positive/40 bg-signal-positive/5 p-2.5 text-xs text-signal-positive">
              <CheckCircle2 className="size-3.5" />
              Bilgilerin kaydedildi.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-ink-1 px-6 py-3 text-sm font-bold text-surface-raised hover:bg-ink-1/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Kaydet
            </button>
            <Link
              to="/sifre-sifirla"
              className="text-xs font-semibold text-ink-3 underline-offset-2 hover:text-ink-1 hover:underline"
            >
              Şifreyi değiştir
            </Link>
          </div>
        </form>

        {/* Hesap aksiyonları */}
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-surface-sunken/30 p-4">
          <div>
            <p className="text-sm font-semibold text-ink-1">Hesabı kapat</p>
            <p className="text-[11px] text-ink-3">Tarayıcıdan çıkış yapar.</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-sunken"
          >
            <LogOut className="size-3.5" /> Çıkış yap
          </button>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl font-bold text-ink-1 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">{label}</p>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-sunken/30 px-4 py-3 text-sm text-ink-1 outline-none focus:border-indigo focus:bg-surface-raised"
      />
    </div>
  );
}
