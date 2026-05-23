import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="font-display text-2xl font-extrabold text-ink">
              LawKit
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-ink/55">
              HMGS hazırlığından staj sürecine kadar vaka temelli hukuk pratiği. AI destekli
              hukuk eğitim platformu.
            </p>
            <p className="max-w-sm rounded-lg border border-line-soft bg-paper-warm px-4 py-3 text-[11px] leading-relaxed text-ink/60">
              <span className="font-bold uppercase tracking-widest text-gold">Yasal uyarı.</span>{" "}
              LawKit bir eğitim amaçlı simülasyon platformudur. Üretilen vaka çözümleri ve AI
              geri bildirimleri hukuki tavsiye niteliği taşımaz. Gerçek davalarınız için bir
              avukata danışın.
            </p>
          </div>
          <FooterCol
            title="Ürün"
            links={[
              { to: "/case-studio", label: "Vaka Studio" },
              { to: "/vaka-studio", label: "AI Vaka Üretici" },
              { to: "/dilekce-lab", label: "Dilekçe Lab" },
              { to: "/hmgs-arena", label: "HMGS Arena" },
              { to: "/fiyatlandirma", label: "Fiyatlandırma" },
            ]}
          />
          <FooterCol
            title="Kurumsal"
            links={[
              { to: "/metodoloji", label: "Metodoloji" },
              { to: "/yol-haritasi", label: "Yol haritası" },
              { to: "/guvenlik-kvkk", label: "Güvenlik ve KVKK" },
              { to: "/neden-lawkit", label: "Neden LawKit" },
              { to: "/hakkimizda", label: "Hakkımızda" },
              { to: "/iletisim", label: "İletişim" },
            ]}
          />
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-[11px] font-bold uppercase tracking-widest text-ink/40 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} LawKit Eğitim Teknolojileri</span>
          <span>KVKK uyarınca verileriniz Türkiye'deki sunucularda korunur.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ to: string; label: string }>;
}) {
  return (
    <div>
      <h5 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-ink">
        {title}
      </h5>
      <ul className="space-y-3 text-sm text-ink/55">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="transition-colors hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
