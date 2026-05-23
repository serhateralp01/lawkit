import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

const navLinks = [
  { to: "/urun/case-studio", label: "Case Studio" },
  { to: "/hmgs-arena", label: "HMGS Arena" },
  { to: "/dilekce-lab", label: "Dilekçe Lab" },
  { to: "/vaka-studio", label: "Vaka Studio" },
  { to: "/karne", label: "Karne" },
  { to: "/metodoloji", label: "Metodoloji" },
  { to: "/fiyatlandirma", label: "Fiyat" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut, loading } = useAuth();
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Kullanıcı";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-ink">
            LawKit
          </Link>
          <nav className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/60 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="transition-colors hover:text-gold"
                activeProps={{ className: "text-ink" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              {isAdmin ? (
                <span
                  className="hidden items-center gap-1 rounded-full bg-amber/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-foreground sm:inline-flex"
                  title="Beta erişim — yönetici hesabı"
                >
                  ⚡ Beta
                </span>
              ) : null}
              <Link
                to="/profil"
                className="hidden items-center gap-2 rounded-full bg-paper-warm px-3 py-1.5 text-xs font-semibold text-ink/80 hover:text-ink sm:inline-flex"
                title="Profilim"
              >
                <UserIcon className="size-3.5" />
                {displayName}
              </Link>
              <button
                onClick={() => void signOut()}
                className="hidden items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink sm:inline-flex"
                aria-label="Çıkış yap"
              >
                <LogOut className="size-4" />
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link
                to="/giris"
                className="hidden text-sm font-semibold text-ink/80 hover:text-ink sm:inline"
              >
                Giriş
              </Link>
              <Link
                to="/kayit"
                className="rounded-lg bg-ink px-5 py-2 text-sm font-bold text-paper transition-all hover:shadow-lg hover:shadow-ink/20"
              >
                Ücretsiz Dene
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 lg:hidden"
            aria-label="Menü"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-3 text-sm font-semibold text-ink/80">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/giris" onClick={() => setOpen(false)}>
                Giriş
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
