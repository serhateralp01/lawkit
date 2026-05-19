import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { PageHero, CTAFooter } from "@/components/site/PageHero";
import { LegalQuote } from "@/components/composite/LegalQuote";

export const Route = createFileRoute("/metodoloji")({
  head: () => ({
    meta: [
      { title: "Metodoloji — LawKit'in pedagojik temeli" },
      {
        name: "description",
        content:
          "LawKit'in vaka-temelli öğrenme, retrieval practice, rubric değerlendirme ve scaffolding üzerine kurulu bilimsel çerçevesi.",
      },
      { property: "og:title", content: "Metodoloji — LawKit" },
    ],
  }),
  component: MetodolojiPage,
});

function MetodolojiPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pedagojik temel · v0.1"
        title={
          <>
            Vakada uygulanan <span className="italic text-amber">hukuk</span>, kalıcı olur.
          </>
        }
        lead="LawKit, 100 yıllık vaka yöntemi ile bilişsel bilimin son 50 yıllık bulgularını Türk hukuk eğitimine uyarlar. Her tasarım kararı bir kaynağa bağlıdır."
      />

      <article className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <Section
          eyebrow="01"
          title="Vaka-temelli öğrenme (CBL)"
          body="Harvard Business School'un 1920'lerde başlattığı (Garvin, 2003) ve McMaster Tıp Fakültesi'nin 1969'da kurumsallaştırdığı Problem-Based Learning çerçevesi (Barrows & Tamblyn, 1980), pasif okumaya kıyasla muhakeme ve transferi anlamlı biçimde artırır (Thistlethwaite et al., 2012 — BEME Guide No. 23). LawKit bu geleneği üç ek mekanizmayla genişletir: retrieval practice, branching simulation ve rubric tabanlı formatif değerlendirme."
        />
        <Section
          eyebrow="02"
          title="Bilişsel yük yönetimi"
          body="Sweller (1988) üç yük tipini ayırır: intrinsic, extraneous, germane. LawKit'in tasarım kararları extraneous yükü minimize eder — dekoratif animasyon, çoklu CTA, gereksiz renk kaldırılır. Worked example etkisi (Sweller & Cooper, 1985), öğrencinin kendi cevabını verdikten sonra ideal cevabı görmesi sırasını gerekçelendirir."
          quote={{
            text: "Öğrenmek için bilişsel kaynağa ihtiyaç var; arayüz gürültüsü bu kaynağı tüketir.",
            cite: "Sweller, Cognitive Load Theory (1988)",
          }}
        />
        <Section
          eyebrow="03"
          title="Retrieval practice ve aralıklı tekrar"
          body="Ebbinghaus'un (1885) unutma eğrisi ile Roediger & Karpicke'nin (2006) test etkisi çalışmaları, kalıcı öğrenmenin pasif tekrar değil aktif geri çağırma ile inşa edildiğini gösterir. Cepeda et al. (2008) optimal aralık aralıklarını ampirik haritalar. HMGS Arena'nın 'zayıf konu' mekanizması bu literatürün uygulamasıdır."
        />
        <Section
          eyebrow="04"
          title="Mastery learning ve formatif değerlendirme"
          body="Bloom'un (1968) mastery learning modeli ve Black & Wiliam'ın (1998) formatif değerlendirme meta-analizi, ilerlemenin tek kerelik özetsel sınavla değil küçük-sık-düzeltilebilir geri bildirim döngüleriyle sağlandığını gösterir. LawKit'te yüzde göstergesi yoktur — yerine 3 kademeli mastery etiketi (henüz başlamadı / pratiği derinleştir / kavradın)."
        />
        <Section
          eyebrow="05"
          title="Rubric: AAC&U VALUE çerçevesi"
          body="Rubrik boyutları Bloom'un revize edilmiş bilişsel taksonomisi (Anderson & Krathwohl, 2001) ve AAC&U VALUE rubric ailesinin yapısına dayanır. Her seviye davranışsal olarak tanımlanır (Brookhart, 2013). Yedi boyut: olay, mesele, usul, maddi hukuk, gerekçe, risk, ifade."
        />
        <Section
          eyebrow="06"
          title="Branching scenarios — Action Mapping"
          body="Cathy Moore'un (2017) Action Mapping çerçevesi, eğitim simülasyonlarının doğru tasarım birimini 'öğrencinin yapacağı karar' olarak tanımlar — bilgi parçası değil. Her karar dalı bir öğrenme hedefine bağlanır; her dal sonucu hedefe ne kadar yakın taşıdığına göre puanlanır."
        />
        <Section
          eyebrow="07"
          title="Cognitive apprenticeship ve scaffolding"
          body="Collins, Brown & Newman'ın (1989) modeli — modeling, coaching, scaffolding, articulation, reflection — uzman avukatın bilişsel sürecinin nasıl görünür kılınacağını tarif eder. İpucu merdiveni (Vygotsky ZPD; Pea 2004 — scaffolding fading) üç kademedir; her açılış rubric tavanını düşürür ama kararı öğrenci verir (SDT autonomy)."
        />
        <Section
          eyebrow="08"
          title="Kalibreli gamification"
          body="Hamari et al. (2014) gamification etkisinin pozitif ama bağlama duyarlı olduğunu, yanlış uygulamanın içsel motivasyonu zayıflatabileceğini (overjustification — Deci, 1971) gösterir. Self-Determination Theory (Deci & Ryan, 2000) üç ihtiyacı tanımlar: autonomy, competence, relatedness. LawKit'te leaderboard yok; puan-rozet enflasyonu yok. Her mekanizma bu üç ihtiyaca bağlanır."
        />

        <div className="mt-16 rounded-xl border border-line bg-surface-sunken/40 p-6">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-3">
            Atıflar
          </h4>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-ink-2">
            <li>Garvin, D. (2003). Making the Case. Harvard Magazine.</li>
            <li>Barrows, H. S. & Tamblyn, R. M. (1980). Problem-Based Learning. Springer.</li>
            <li>Sweller, J. (1988). Cognitive Load During Problem Solving. Cognitive Science 12(2).</li>
            <li>Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science 17(3).</li>
            <li>Cepeda, N. J. et al. (2008). Spacing effects in learning. Psychological Science 19(11).</li>
            <li>Bloom, B. S. (1968). Learning for Mastery. UCLA CSEIP.</li>
            <li>Black, P. & Wiliam, D. (1998). Inside the Black Box. Phi Delta Kappan.</li>
            <li>Brookhart, S. (2013). How to Create and Use Rubrics. ASCD.</li>
            <li>Moore, C. (2017). Map It: The Hands-on Guide to Strategic Training Design.</li>
            <li>Collins, A., Brown, J. S. & Newman, S. (1989). Cognitive Apprenticeship.</li>
            <li>Deci, E. L. & Ryan, R. M. (2000). Self-Determination Theory. Psychological Inquiry.</li>
            <li>Hamari, J., Koivisto, J. & Sarsa, H. (2014). Does Gamification Work? HICSS.</li>
            <li>Vygotsky, L. S. (1978). Mind in Society. Harvard UP.</li>
            <li>Pea, R. D. (2004). The Social and Technological Dimensions of Scaffolding.</li>
            <li>Thistlethwaite, J. E. et al. (2012). BEME Guide No. 23 — Case-based learning.</li>
            <li>MacCrate Report (1992); Carnegie Report — Sullivan et al. (2007).</li>
          </ul>
        </div>
      </article>

      <CTAFooter title="Pedagojiyi okudun. Şimdi vakayı dene." />
    </PageShell>
  );
}

function Section({
  eyebrow,
  title,
  body,
  quote,
}: {
  eyebrow: string;
  title: string;
  body: string;
  quote?: { text: string; cite: string };
}) {
  return (
    <section className="border-t border-line py-10 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink-1 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-ink-2">{body}</p>
      {quote ? (
        <div className="mt-5">
          <LegalQuote cite={quote.cite}>{quote.text}</LegalQuote>
        </div>
      ) : null}
    </section>
  );
}
