import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gauge,
  Scale,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { MiniCaseRunner } from "@/components/composite/MiniCaseRunner";
import heroDesk from "@/assets/hero-desk.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LawKit — Hukuku ezberleme. Vakada uygula." },
      {
        name: "description",
        content:
          "HMGS hazırlığından staj sürecine kadar vaka-temelli, AI destekli Türk hukuk eğitimi. Case Studio, HMGS Arena ve Dilekçe Lab tek platformda.",
      },
      { property: "og:title", content: "LawKit — Hukuku ezberleme. Vakada uygula." },
      {
        property: "og:description",
        content:
          "Türkiye'nin ilk vaka-temelli hukuk eğitim platformu. HMGS adayları ve stajyer avukatlar için.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell>
      <Hero />
      <PainStat />
      <ScienceStrip />
      <Modules />
      <HowItWorks />
      <CaseDemo />
      <Testimonials />
      <Pricing />
      <FAQ />
      <ClosingCTA />
    </PageShell>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="lk-reveal">
            <div className="mb-7 inline-flex items-center gap-2 rounded-md bg-gold/10 px-3 py-1.5">
              <Sparkles className="size-3.5 text-gold" />
              <span className="text-[10px] font-black uppercase italic tracking-[0.18em] text-gold">
                Vaka-Temelli Öğrenme · 2026
              </span>
            </div>
            <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.02] text-ink sm:text-6xl lg:text-[4.5rem]">
              Hukuku{" "}
              <span className="italic text-gold">ezberleme.</span>
              <br />
              Vakada uygula.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/60">
              HMGS hazırlığını bir yükten, stratejik bir oyuna dönüştürün. Gerçek dava
              dosyaları, dallanan vaka simülasyonları ve AI destekli dilekçe geri bildirimi —
              tek platformda.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                to="/kayit"
                className="group inline-flex items-center gap-2 rounded-xl bg-ink px-8 py-4 text-base font-bold text-paper transition-transform hover:scale-[1.02]"
              >
                Ücretsiz vakayı dene
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-ink">+140 XP</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
                  Günlük Ortalama Kazanım
                </span>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["#0F172A", "#B45309", "#1E293B", "#92400E"].map((c, i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-paper"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-ink/55">
                <span className="font-bold text-ink">1.200+ aday</span> aktif olarak çalışıyor
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -rotate-2 rounded-[2.5rem] bg-gold/8" />
            <div className="absolute -inset-3 rotate-1 rounded-[2rem] bg-ink/5" />
            <img
              src={heroDesk}
              alt="Hukuk dosyası, dolma kalem ve adalet terazisi"
              width={1280}
              height={1024}
              className="relative w-full rounded-2xl object-cover shadow-2xl shadow-ink/15 ring-1 ring-ink/5"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-white p-4 shadow-xl ring-1 ring-line sm:block">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-gold/10">
                  <Trophy className="size-5 text-gold" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold leading-none text-ink">%87</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Kullanıcı tamamlama oranı
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PAIN STAT ─────────────────────── */

function PainStat() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              HMGS Gerçeği · 2024–2025
            </p>
            <p className="font-display text-[5rem] font-black leading-none text-ink sm:text-[7rem]">
              %30,13
            </p>
            <p className="mt-4 font-display text-xl font-bold text-ink sm:text-2xl">
              Üç oturumda toplam başarı oranı
            </p>
          </div>
          <div className="space-y-6 border-t border-line pt-8 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <p className="text-2xl font-medium leading-snug text-ink sm:text-3xl">
              31.489 adaydan <span className="text-gold">22.004'ü</span> baraj altı kaldı.
            </p>
            <p className="max-w-xl text-base leading-relaxed text-ink/55">
              HMGS, soru zorluğu oturum oturum arttığı halde barajı sabit tutuyor. Eylül 2024'te
              %42 olan başarı, Nisan 2025'te %24'e geriledi. Sorun ezberlenen kanun maddesi
              değil — uygulamaya geçirilemeyen muhakeme.
            </p>
            <dl className="grid grid-cols-3 gap-6 border-t border-line pt-8 sm:gap-10">
              <Stat label="Eyl 2024" value="%42,67" sub="9.142 aday" />
              <Stat label="Nis 2025" value="%23,81" sub="5.912 aday" />
              <Stat label="Eyl 2025" value="%25,86" sub="16.240 aday" />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-ink/45">{label}</dt>
      <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{value}</dd>
      <p className="mt-1 text-xs text-ink/50">{sub}</p>
    </div>
  );
}

/* ─────────────────────── SCIENCE STRIP ─────────────────────── */

function ScienceStrip() {
  const items = [
    {
      v: "CBL",
      title: "Vaka-temelli öğrenme",
      d: "Harvard / McMaster geleneği. Pasif okumaya kıyasla muhakeme ve transferi anlamlı artırır (Thistlethwaite, 2012).",
    },
    {
      v: "Retrieval",
      title: "Aktif geri çağırma",
      d: "Okumak değil hatırlamak öğretir. Roediger & Karpicke (2006) test effect, Cepeda (2008) aralıklı tekrar.",
    },
    {
      v: "Rubric",
      title: "Formatif değerlendirme",
      d: "Bloom mastery + AAC&U VALUE. Yüzde yarışı yerine boyut bazlı dürüst geri bildirim.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <p className="mb-10 text-[11px] font-bold uppercase tracking-[0.2em] text-amber">
        Bilimsel temel · 100 yıllık vaka yöntemi + 50 yıllık bilişsel bilim
      </p>
      <div className="grid gap-12 md:grid-cols-3">
        {items.map((i) => (
          <div key={i.title} className="space-y-3 border-t border-line pt-6">
            <p className="font-display text-4xl font-semibold text-indigo">{i.v}</p>
            <h3 className="text-lg font-semibold text-ink-1">{i.title}</h3>
            <p className="text-sm leading-relaxed text-ink-2">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ─────────────────────── MODULES ─────────────────────── */

function Modules() {
  const cards = [
    {
      no: "01",
      level: "Çekirdek",
      title: "Case Studio",
      d: "Gerçek dosyalardan kurgulanmış dallanan vakalar. Her kararınız sonraki adımı değiştirir.",
      to: "/urun/case-studio" as const,
      icon: Scale,
      progress: 26,
      meta: "12 / 45 vaka",
    },
    {
      no: "02",
      level: "Sınav",
      title: "HMGS Arena",
      d: "Zaman ayarlı denemeler, zayıf konu haritası ve gerçekçi sınav atmosferi.",
      to: "/urun/hmgs-arena" as const,
      icon: Gauge,
      progress: 0,
      meta: "0 / 30 oturum",
    },
    {
      no: "03",
      level: "Pratik",
      title: "Dilekçe Lab",
      d: "AI rubrik geri bildirimi: usul hatalarını, eksik unsurları ve gerekçe boşluklarını anında raporlar.",
      to: "/urun/dilekce-lab" as const,
      icon: FileText,
      progress: 0,
      meta: "0 / 15 proje",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Üç Modül · Tek Çatı
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Öğrenme Parkurları
          </h2>
          <p className="mt-4 text-base text-ink/55">
            Her modül bir seviye. Her seviye yeni bir yetkinlik.
          </p>
        </div>
        <Link
          to="/fiyatlandirma"
          className="hidden items-center gap-1 text-xs font-bold uppercase tracking-widest text-ink/60 hover:text-gold md:inline-flex"
        >
          Tüm modüller <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.to}
              className="group rounded-3xl border border-line bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-ink/10"
            >
              <div className="rounded-[1.25rem] bg-paper-warm/60 p-8">
                <div className="mb-12 flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-ink text-paper">
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                    {c.level}
                  </span>
                </div>
                <p className="font-display text-[11px] font-bold uppercase tracking-widest text-ink/40">
                  Modül {c.no}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-ink transition-colors group-hover:text-gold">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/55">{c.d}</p>
                <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-widest text-ink/40">
                  <span>{c.meta}</span>
                  <span>{c.progress > 0 ? `%${c.progress} tamamlandı` : "Kilitli"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────── HOW IT WORKS ─────────────────────── */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Müvekkili dinle", d: "Olay anlatımını oku, eksik bilgileri sor." },
    { n: "02", t: "Stratejini kur", d: "Dava türü, görev-yetki, zamanaşımı kararlarını ver." },
    { n: "03", t: "Dilekçeni yaz", d: "Editörde gerekçe ve talep sonucunu inşa et." },
    { n: "04", t: "Rubrikten oku", d: "AI puanı, kaçırılan unsur, doğru düşünme sırası." },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Süreç
          </p>
          <h2 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
            Bir vakanın anatomisi
          </h2>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="bg-white p-8">
              <p className="font-display text-5xl font-black text-gold/80">{s.n}</p>
              <h3 className="mt-6 font-display text-xl font-bold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────────────── CASE DEMO WIDGET ─────────────────────── */

function CaseDemo() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-amber">
          Mini vaka · canlı demo
        </p>
        <h2 className="font-display text-4xl font-extrabold text-ink-1 sm:text-5xl">
          Karar senin. Sonuç ölçülür.
        </h2>
        <p className="mt-4 max-w-xl text-base text-ink-2">
          Aşağıdaki demo, gerçek case-engine'in basitleştirilmiş arayüzü. Olguyu oku, ipucu
          merdivenini kullan, kararını ver — rubrik canlı dolar.
        </p>
      </div>
      <MiniCaseRunner />
      <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-widest text-ink-3">
        Eğitim amaçlı simülasyon · Gerçek hukuki tavsiye değildir
      </p>
    </section>
  );
}


/* ─────────────────────── TESTIMONIALS ─────────────────────── */

function Testimonials() {
  const quotes = [
    {
      q: "Üçüncü oturumda baraj geçtim. Fark, soru çözmek değil — vakayı dallandırıp her ihtimali yazmaktı.",
      a: "Z. Demir",
      r: "HMGS · Eylül 2025",
    },
    {
      q: "Dilekçe Lab'in rubrik geri bildirimi, fakültede dört yıl boyunca alamadığım türden somut bir denetim.",
      a: "M. Kaya",
      r: "Stajyer Avukat · İstanbul Barosu",
    },
    {
      q: "İş hukuku case'inde sorduğum eksik soruyu sistem bana gösterdi. Müvekkil görüşmesinde aynı hatayı yapmadım.",
      a: "E. Aslan",
      r: "Son sınıf · Ankara Hukuk",
    },
  ];
  return (
    <section className="border-y border-line bg-paper-warm/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Saha
          </p>
          <h2 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
            Hazırlıktan davaya
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <figure
              key={q.a}
              className="rounded-2xl border border-line bg-white p-8 shadow-sm"
            >
              <blockquote className="font-display text-xl font-medium leading-snug text-ink">
                "{q.q}"
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <p className="font-bold text-ink">{q.a}</p>
                <p className="text-xs text-ink/55">{q.r}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PRICING ─────────────────────── */

function Pricing() {
  return (
    <section id="fiyat" className="mx-auto max-w-5xl px-6 py-24 lg:px-8 lg:py-32">
      <div className="mb-14 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          Fiyatlandırma
        </p>
        <h2 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
          Hazırlık stratejini seç
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-ink/55">
          İster son 8 haftalık kampa katıl, ister yıl boyu temelini sağlamla.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PriceCard
          name="Sprint"
          desc="8 haftalık sınav kampı"
          price="₺2.490"
          period="tek seferlik"
          features={[
            "Haftalık 2 deneme sınavı",
            "500+ odaklanmış vaka sorusu",
            "Zayıf konu haritası",
            "Hızlı tekrar notları (PDF)",
            "Topluluk forumu erişimi",
          ]}
          cta="Kampa katıl"
          variant="primary"
          badge="Popüler"
        />
        <PriceCard
          name="Core"
          desc="Yıllık akademik üyelik"
          price="₺5.990"
          period="yıllık"
          features={[
            "Tüm modüllere sınırsız erişim",
            "AI dilekçe analizi (sınırsız)",
            "Tüm Case Studio vakaları",
            "Mentor desteği (aylık 2 görüşme)",
            "Staj portalı erişimi",
          ]}
          cta="Core'a geç"
          variant="dark"
        />
      </div>
      <p className="mt-8 text-center text-xs text-ink/45">
        KDV dahildir. İlk 7 gün ücretsiz iade. Fakülte ve baro lisansı için{" "}
        <Link to="/iletisim" className="underline hover:text-gold">
          iletişime geçin
        </Link>
        .
      </p>
    </section>
  );
}

function PriceCard({
  name,
  desc,
  price,
  period,
  features,
  cta,
  variant,
  badge,
}: {
  name: string;
  desc: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  variant: "primary" | "dark";
  badge?: string;
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={`relative rounded-3xl p-10 ${
        isDark
          ? "bg-ink text-paper ring-1 ring-ink"
          : "border-2 border-gold bg-white text-ink"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {badge}
        </span>
      )}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold">{name}</h3>
          <p className={`mt-1 text-xs ${isDark ? "text-paper/50" : "text-ink/50"}`}>{desc}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-extrabold">{price}</p>
          <p className={`text-[11px] uppercase tracking-widest ${isDark ? "text-paper/40" : "text-ink/40"}`}>
            {period}
          </p>
        </div>
      </div>
      <ul className="mb-10 space-y-3.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <CheckCircle2
              className={`mt-0.5 size-4 shrink-0 ${isDark ? "text-gold" : "text-gold"}`}
            />
            <span className={isDark ? "text-paper/85" : "text-ink/75"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/kayit"
        className={`block rounded-xl px-6 py-3.5 text-center text-sm font-bold transition-colors ${
          isDark
            ? "bg-paper text-ink hover:bg-paper/90"
            : "bg-ink text-paper hover:bg-ink/90"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ─────────────────────── FAQ ─────────────────────── */

function FAQ() {
  const items = [
    {
      q: "LawKit, HMGS'nin tamamını kapsıyor mu?",
      a: "MVP sürümünde İş Hukuku, Borçlar Genel, Medeni Usul ve Anayasa temel konularına derinlik veriyoruz. 2026 Eylül oturumuna kadar 25 disiplinin tamamını kapsayacak şekilde genişliyoruz.",
    },
    {
      q: "AI cevapları güvenilir mi? Halüsinasyon riski nedir?",
      a: "Tüm AI çıktıları sadece doğruladığımız mevzuat ve içtihat veritabanı üzerinden çalışır (grounded RAG). Serbest metin değil, katı JSON şeması ile üretilir. Her ekranda 'eğitim amaçlı simülasyon' uyarısı bulunur.",
    },
    {
      q: "Avukatlık stajına başladım, hâlâ işime yarar mı?",
      a: "Evet. Dilekçe Lab ve Case Studio özellikle stajyer avukatlar için tasarlandı. Müvekkil görüşmesi, dava şartı denetimi, dilekçe rubrik puanlaması — fakültede yapılmayan pratik.",
    },
    {
      q: "Verilerim nerede saklanıyor?",
      a: "KVKK uyarınca Türkiye'deki sunucularda. Üçüncü taraf modellerle çalışırken kişisel veri maskelenir, eğitim datası olarak kullanılmaz.",
    },
    {
      q: "Para iade garantisi var mı?",
      a: "İlk 7 gün koşulsuz iade. Sonrasında oranlı iade için müşteri hizmetlerimize başvurabilirsiniz.",
    },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            SSS
          </p>
          <h2 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
            Sıkça sorulanlar
          </h2>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line">
          {items.map((i, idx) => (
            <FaqRow key={idx} {...i} defaultOpen={idx === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group p-6"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-display text-lg font-bold text-ink">{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{a}</p>
    </details>
  );
}

/* ─────────────────────── CLOSING CTA ─────────────────────── */

function ClosingCTA() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-center sm:px-16 sm:py-24">
        <div className="absolute -right-20 top-0 size-72 rounded-full bg-gold/15 blur-[100px]" />
        <div className="absolute -left-10 bottom-0 size-60 rounded-full bg-gold/10 blur-[80px]" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1">
            <BookOpen className="size-3.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-paper/70">
              İlk vaka ücretsiz
            </span>
          </div>
          <h2 className="font-display text-4xl font-extrabold text-paper sm:text-5xl">
            Kariyerinin ilk{" "}
            <span className="italic text-gold">'win'</span>ini al.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-paper/60">
            Akademik bilgini profesyonel bir muhakeme aracına dönüştürmek 4 dakika sürer.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/kayit"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-4 text-base font-bold text-white transition-transform hover:scale-[1.02]"
            >
              Hemen başla <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/neden-lawkit"
              className="inline-flex items-center gap-2 rounded-xl bg-paper/10 px-8 py-4 text-base font-bold text-paper transition-colors hover:bg-paper/15"
            >
              Metodolojiyi incele
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
