import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Circle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getCase } from "@/content/cases";
import { sources } from "@/content/sources";
import { useCaseSession } from "@/lib/case-engine/useCaseSession";
import { resolveFacts, discoveryProgress } from "@/lib/case-engine";
import { useGamificationStore } from "@/lib/gamification";
import { CaseScreenLayout } from "@/components/patterns/CaseScreenLayout";
import { RubricMeter } from "@/components/composite/RubricMeter";
import { HintLadder } from "@/components/composite/HintLadder";
import { SourceCallout } from "@/components/composite/SourceCallout";
import { FeedbackPanel } from "@/components/composite/FeedbackPanel";
import { CaseIntro, hasSeenIntro, markIntroSeen } from "@/components/composite/CaseIntro";
import { DialogueBubble, SceneCaption } from "@/components/composite/DialogueBubble";
// CharacterPortrait / roleLabel artık vaka route'unda doğrudan kullanılmıyor —
// StageView içeride çağırıyor. Type için ihtiyaç da yok.
import { FloatingScore } from "@/components/composite/FloatingScore";
import { OpenTextStage } from "@/components/composite/OpenTextStage";
import { AiBranchStage } from "@/components/composite/AiBranchStage";
import { ClientChatStage } from "@/components/composite/ClientChatStage";
import { StageView } from "@/components/composite/StageView";
import { CaseClosing } from "@/components/composite/CaseClosing";
import type { CaseOption, CharacterDef, LegalCase } from "@/content/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vaka/$caseId")({
  loader: ({ params }) => {
    const c = getCase(params.caseId);
    if (!c) throw notFound();
    return { case: c };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.case.title} · LawKit Vaka` },
      {
        name: "description",
        content: `${loaderData?.case.summary} — eğitim amaçlı vaka simülasyonu.`,
      },
    ],
  }),
  component: CasePage,
});

function CasePage() {
  const { case: legalCase } = Route.useLoaderData();

  // Intro durumu — sadece client'ta okunur (SSR safe).
  const [introDone, setIntroDone] = useState<boolean | null>(null);
  useEffect(() => {
    setIntroDone(hasSeenIntro(legalCase.id) || !legalCase.intro);
  }, [legalCase]);

  if (introDone === null) {
    return <div className="p-12 text-center text-ink-3">Vaka yükleniyor…</div>;
  }

  if (!introDone) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <CaseIntro
          case={legalCase}
          onStart={() => {
            markIntroSeen(legalCase.id);
            setIntroDone(true);
          }}
        />
      </div>
    );
  }

  return <CaseRunner legalCase={legalCase} />;
}

function CaseRunner({ legalCase }: { legalCase: LegalCase }) {
  const {
    session,
    node,
    currentStep,
    chosenOption,
    hintLevel,
    pick,
    openHint,
    advance,
    reset,
    submitText,
    aiBranchDecided,
    chatTurn,
    chatFinish,
  } = useCaseSession(legalCase);

  // Karakter lookup'ı
  const castById = useMemo(() => {
    const m = new Map<string, CharacterDef>();
    legalCase.cast?.forEach((c) => m.set(c.id, c));
    return m;
  }, [legalCase]);

  // Gamification
  const recordedRef = useRef<string | null>(null);
  const recordAttempt = useGamificationStore((s) => s.recordAttempt);
  useEffect(() => {
    if (session.done && recordedRef.current !== session.startedAt + ":" + session.caseId) {
      recordedRef.current = session.startedAt + ":" + session.caseId;
      recordAttempt(session);
    }
  }, [session.done, session, recordAttempt]);

  // Floating score signal — her yeni pick'te değişsin
  const floatingSignal = chosenOption
    ? `${node?.id}-${chosenOption.id}-${currentStep?.at}`
    : "idle";

  if (!node) {
    return (
      <div className="p-12 text-center text-ink-2">
        Vaka düğümü bulunamadı.{" "}
        <button onClick={reset} className="underline">
          Sıfırla
        </button>
      </div>
    );
  }

  if (node.kind === "outcome") {
    return (
      <OutcomeScreen
        legalCase={legalCase}
        session={session}
        outcomeNode={node}
        onReset={reset}
      />
    );
  }

  // Konuşan ve sahnedeki diğer karakterler
  const speakerId = node.speakerId;
  const speaker = speakerId ? castById.get(speakerId) : undefined;
  // sceneCharacters belirtilmediyse veya boşsa, tüm cast'i (speaker hariç) sahnede tut.
  // Vaka tasarımcısı node'da spesifik bir liste verirse o önceliklidir.
  const sceneOthers = (
    node.sceneCharacters && node.sceneCharacters.length > 0
      ? node.sceneCharacters
      : (legalCase.cast?.map((c) => c.id) ?? [])
  )
    .map((id) => castById.get(id))
    .filter((c): c is CharacterDef => !!c && c.id !== speakerId);

  // Speaker'ın mood'u verdict'e göre değişsin (sadece kararı verdikten sonra)
  const speakerMood = chosenOption
    ? chosenOption.verdict === "good"
      ? "happy"
      : chosenOption.verdict === "partial"
        ? "tense"
        : "sad"
    : "thinking";

  return (
    <CaseScreenLayout
      case={legalCase}
      left={<CaseSidePanel legalCase={legalCase} session={session} />}
      center={
        <div className="relative">
          <FloatingScore
            awarded={currentStep?.awarded}
            verdict={chosenOption?.verdict}
            signal={floatingSignal}
          />

          {/* Act şeridi */}
          {legalCase.acts && node.act ? (
            <ActStrip acts={legalCase.acts} currentAct={node.act} />
          ) : null}

          {/* Sahne görünümü — karakter pozisyon koreografisi */}
          {(speaker || sceneOthers.length > 0) ? (
            <div className="mb-5">
              <StageView
                act={node.act ?? 1}
                speaker={speaker}
                others={sceneOthers}
                speakerMood={speakerMood}
                caption={node.scene}
              />
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={`scene-${node.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-5"
            >
              {/* scene caption artık StageView içinde, burada yedek olarak gizli */}

              {/* Sahne yapısı — node tipine göre */}
              {node.kind === "open_text" ? (
                <OpenTextStage
                  caseId={legalCase.id}
                  node={node}
                  session={session}
                  speaker={speaker}
                  onSubmit={(data) => {
                    submitText({
                      freeText: data.freeText,
                      awarded: data.awarded,
                      verdict: data.verdict,
                    });
                    advance();
                  }}
                />
              ) : node.kind === "ai_branch" ? (
                <AiBranchStage
                  caseId={legalCase.id}
                  node={node}
                  session={session}
                  speaker={speaker}
                  onSubmit={(data) =>
                    aiBranchDecided({
                      freeText: data.freeText,
                      chosenNodeId: data.chosenNodeId,
                      reason: data.reason,
                      awarded: data.awarded,
                      verdict: data.verdict,
                    })
                  }
                />
              ) : node.kind === "client_chat" ? (
                <ClientChatStage
                  caseId={legalCase.id}
                  node={node}
                  session={session}
                  speaker={speaker}
                  onTurn={chatTurn}
                  onFinish={(awarded) => {
                    chatFinish(awarded);
                    advance();
                  }}
                />
              ) : (
                <>
                  {/* decision veya info: bubble + sahnedekiler + seçenekler */}
                  {speaker && node.prompt ? (
                    <DialogueBubble
                      character={speaker}
                      text={node.prompt}
                      mood={speakerMood}
                      emphasis
                    />
                  ) : node.prompt ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo">
                        Sıra sende
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold text-ink-1">
                        {node.prompt}
                      </h2>
                    </div>
                  ) : null}

                  <ul className="space-y-2 pt-1">
                    {node.options?.map((o) => (
                      <OptionRow
                        key={o.id}
                        option={o}
                        picked={chosenOption?.id === o.id}
                        disabled={!!currentStep?.chosenOptionId && chosenOption?.id !== o.id}
                        onPick={() => pick(o)}
                      />
                    ))}
                  </ul>

                  <AnimatePresence>
                    {chosenOption?.feedback ? (
                      <motion.div
                        key={`fb-${node.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="space-y-3 overflow-hidden rounded-md border border-line bg-surface-sunken/40 p-4"
                      >
                        <p className="text-sm leading-relaxed text-ink-1">
                          <span className="font-semibold">Geri bildirim. </span>
                          {chosenOption.feedback}
                        </p>
                        {chosenOption.sources?.map((sid) =>
                          sources[sid] ? <SourceCallout key={sid} sourceId={sid} /> : null,
                        )}
                        <motion.button
                          type="button"
                          onClick={advance}
                          whileHover={{ x: 2 }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-ink-1 px-4 py-2 text-xs font-bold text-surface-raised hover:bg-ink-1/90"
                        >
                          Devam et <ArrowRight className="size-3.5" />
                        </motion.button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      }
      right={
        <>
          <RubricMeter scores={session.ledger} />

          {hintAvailable(node, currentStep) ? (
            <HintLadder
              hint={hintForNode(node.id, legalCase.branch)}
              ceilingLabel={primaryRubricLabel(node.rubricTargets)}
              controlledLevel={hintLevel}
              onOpen={(rung) => openHint(rung)}
            />
          ) : (
            <div className="rounded-md border border-line bg-surface-sunken/40 p-3 text-xs text-ink-3">
              İpuçları bu adımda kilitli — kararını verdin.
            </div>
          )}

          <div className="rounded-md border border-line bg-surface-sunken/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">Nerede kaldın</p>
            <p className="mt-1 text-xs text-ink-2">
              Adım {session.history.length} /{" "}
              {legalCase.nodes.filter((n) => n.kind !== "outcome").length}
              {hintLevel > 0 ? ` · ${hintLevel} ipucu açıldı` : null}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 text-[10px] font-medium uppercase tracking-widest text-ink-3 underline-offset-2 hover:underline"
            >
              Baştan başla
            </button>
          </div>
        </>
      }
    />
  );
}

function OutcomeScreen({
  legalCase,
  session,
  outcomeNode,
  onReset,
}: {
  legalCase: LegalCase;
  session: ReturnType<typeof useCaseSession>["session"];
  outcomeNode: ReturnType<typeof useCaseSession>["node"];
  onReset: () => void;
}) {
  const outcome = session.outcomeId
    ? legalCase.outcomes?.find((o) => o.id === session.outcomeId)
    : undefined;
  const hasClosing = outcome?.closingBeats && outcome.closingBeats.length > 0;
  const [showFeedback, setShowFeedback] = useState(!hasClosing);

  if (!outcomeNode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-5xl px-4 pb-16 pt-6 lg:px-8 lg:pt-10"
    >
      {showFeedback || !outcome ? (
        <FeedbackPanel
          case={legalCase}
          outcomeNode={outcomeNode}
          session={session}
          onReset={onReset}
        />
      ) : (
        <CaseClosing
          case={legalCase}
          outcome={outcome}
          onContinue={() => setShowFeedback(true)}
        />
      )}
    </motion.div>
  );
}

function ActStrip({
  acts,
  currentAct,
}: {
  acts: { number: 1 | 2 | 3; title: string }[];
  currentAct: 1 | 2 | 3;
}) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-lg border border-line bg-surface-sunken/40 p-2.5">
      {acts.map((a, i) => {
        const active = a.number === currentAct;
        const past = a.number < currentAct;
        return (
          <div key={a.number} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                active && "bg-indigo text-surface-raised",
                past && "text-ink-3",
                !active && !past && "text-ink-3",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[9px]",
                  active ? "bg-surface-raised text-indigo" : "bg-line text-ink-3",
                )}
              >
                {a.number}
              </span>
              <span>{a.title}</span>
            </div>
            {i < acts.length - 1 ? (
              <span className={cn("h-px flex-1", past ? "bg-indigo" : "bg-line")} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CaseSidePanel({
  legalCase,
  session,
}: {
  legalCase: LegalCase;
  session: ReturnType<typeof useCaseSession>["session"];
}) {
  return (
    <div className="space-y-5">
      {/* Dosya özeti — her zaman görünür, kısa */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
          Dosya özeti
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-2">{legalCase.summary}</p>
      </div>

      {/* Olgu defteri — vakanın ana bilgi panosu, varsayılan açık */}
      <FactsList legalCase={legalCase} session={session} />

      {/* Belgeler — accordion */}
      {legalCase.documents && legalCase.documents.length > 0 ? (
        <details className="group rounded-md border border-line bg-surface-sunken/30 px-3 py-2 open:bg-surface-sunken/50">
          <summary className="flex cursor-pointer items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink-3 outline-none [&::-webkit-details-marker]:hidden">
            <span>Dosyadaki Belgeler ({legalCase.documents.length})</span>
            <span className="text-ink-3 transition-transform group-open:rotate-180">▾</span>
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-ink-2">
            {legalCase.documents.map((d) => (
              <li key={d.label} className="flex justify-between gap-2">
                <span className="font-medium">{d.label}</span>
                {d.ref ? <span className="text-ink-3">{d.ref}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function FactsList({
  legalCase,
  session,
}: {
  legalCase: LegalCase;
  session: ReturnType<typeof useCaseSession>["session"];
}) {
  const facts = resolveFacts(legalCase, session);
  const progress = discoveryProgress(legalCase, session);
  const hasHidden = legalCase.facts.some(
    (f) => typeof f !== "string" && f.hidden,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
          Olgu defterin
        </p>
        {hasHidden ? (
          <span className="text-[9px] font-semibold text-ink-3">
            %{Math.round(progress * 100)} keşfedildi
          </span>
        ) : null}
      </div>
      <ul className="mt-2 space-y-1.5 text-xs">
        {facts.map((f, i) => (
          <li
            key={`${f.text}-${i}`}
            className={cn(
              "flex gap-2 transition-opacity",
              f.discovered ? "text-ink-2" : "text-ink-3/50",
            )}
          >
            <span
              className={cn(
                "mt-1.5 size-1 shrink-0 rounded-full",
                f.discovered ? "bg-signal-positive" : "bg-line",
              )}
            />
            <span className="flex-1">
              {f.discovered ? (
                <>
                  {f.category ? (
                    <span className="mr-1 text-[9px] font-bold uppercase tracking-wider text-ink-3">
                      {f.category}:
                    </span>
                  ) : null}
                  {f.text}
                </>
              ) : (
                <span className="italic tracking-wider">
                  ▢▢▢▢▢▢ · sormadın
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {hasHidden && progress < 1 ? (
        <p className="mt-3 rounded-md bg-amber-soft/40 px-2.5 py-1.5 text-[10px] leading-relaxed text-ink-2">
          💡 Müvekkile doğru soruları sorarak yeni olgular öğreneceksin.
        </p>
      ) : null}
    </div>
  );
}

function OptionRow({
  option,
  picked,
  disabled,
  onPick,
}: {
  option: CaseOption;
  picked: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  const Icon =
    option.verdict === "good"
      ? CheckCircle2
      : option.verdict === "partial"
        ? AlertCircle
        : XCircle;
  const verdictColor =
    option.verdict === "good"
      ? "text-signal-positive border-signal-positive/40 bg-signal-positive/5"
      : option.verdict === "partial"
        ? "text-signal-warning border-signal-warning/40 bg-signal-warning/5"
        : "text-signal-critical border-signal-critical/40 bg-signal-critical/5";

  return (
    <motion.li
      whileHover={!disabled && !picked ? { x: 2 } : undefined}
      animate={
        picked
          ? option.verdict === "bad"
            ? { x: [0, -4, 4, -2, 2, 0] }
            : { scale: [1, 1.02, 1] }
          : { scale: 1, x: 0 }
      }
      transition={{ duration: 0.35 }}
    >
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border p-3.5 text-left text-sm transition-colors",
          !picked && !disabled && "border-line bg-surface-raised hover:border-indigo/40 hover:bg-indigo-soft/30",
          picked && verdictColor,
          disabled && "border-line bg-surface-sunken/40 text-ink-3 opacity-60",
        )}
      >
        <div className="flex items-start gap-2.5">
          {picked ? (
            <Icon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-ink-3" />
          )}
          <span className="leading-snug">{option.label}</span>
        </div>
      </button>
    </motion.li>
  );
}

/** İpuçları sahnenin hangi safhasında açıkta — node tipine göre. */
function hintAvailable(
  node: { kind: string },
  currentStep: { chosenOptionId?: string; freeText?: string } | undefined,
): boolean {
  if (node.kind === "decision") return !currentStep?.chosenOptionId;
  if (node.kind === "open_text" || node.kind === "ai_branch") {
    // Cevap sunulup AI değerlendirme dönmeden önce hint açık.
    return !currentStep?.freeText;
  }
  if (node.kind === "client_chat") return true; // sohbet boyunca hep açık
  return false; // info / outcome / checkpoint
}

function hintForNode(_nodeId: string, branch: string) {
  if (branch === "is_hukuku") {
    return {
      nudge: "İşveren 30+ işçi çalıştırıyor — iş güvencesi kapsamı uygulanır.",
      specific: "Önce arabuluculuk dava şartı (İş Mahk. K. m. 3) — sonra mahkeme yolu.",
      worked: "Doğru sıralama: olgu tespiti → arabuluculuk (1 ay) → işe iade davası (2 hafta).",
    };
  }
  if (branch === "borclar") {
    return {
      nudge: "Müvekkilin tanımadığı bir kaynaktan gelen para — irade unsurunu sorgula.",
      specific: "TBK sebepsiz zenginleşme hükümleri devreye girer (m. 77 vd.).",
      worked: "İade kapsamı iyiniyet/kötüniyet ayrımına göre m. 79 üzerinden tartışılır.",
    };
  }
  if (branch === "medeni") {
    return {
      nudge: "Komşuluk hukukunda taşkın kullanım sınırı objektif değerlendirilir.",
      specific: "TMK m. 737 — taşkın olmayan zorunlu kullanım katlanılmak zorundadır.",
      worked: "Önleme + tazminat ayrı taleplerdir; tek dilekçede ileri sürülebilir (TMK m. 730).",
    };
  }
  return {
    nudge: "Aktif olguları yeniden tara — zaman, taraf, irade unsurları.",
    specific: "İlgili kanun maddelerine geç ve uygulama koşullarını test et.",
    worked: "İdeal cevap, sonuç ekranında worked example olarak verilecek.",
  };
}

function primaryRubricLabel(targets: readonly string[] | undefined): string {
  if (!targets || targets.length === 0) return "Mesele Tespiti";
  const map: Record<string, string> = {
    mesele: "Mesele Tespiti",
    usul: "Usul Hukuku",
    maddi: "Maddi Hukuk",
    gerekce: "Gerekçelendirme",
    risk: "Risk Farkındalığı",
    olay: "Olayı Anlama",
    ifade: "Hukuki İfade",
  };
  return map[targets[0]] ?? "Mesele Tespiti";
}
