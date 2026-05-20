import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/urun/case-studio", label: "Case Studio" },
  { to: "/urun/hmgs-arena", label: "HMGS Arena" },
  { to: "/urun/dilekce-lab", label: "Dilekçe Lab" },
  { to: "/karne", label: "Karne" },
  { to: "/metodoloji", label: "Metodoloji" },
  { to: "/fiyatlandirma", label: "Fiyat" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

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
          <div className="hidden items-center gap-2 rounded-full bg-paper-warm px-3 py-1 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/70">482 aktif</span>
          </div>
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
