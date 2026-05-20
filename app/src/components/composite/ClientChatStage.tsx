/**
 * ClientChatStage — müvekkille N tur sohbet.
 *
 * AI persona = node.speaker (genellikle "muvekkil"). Öğrenci sorular sorar,
 * müvekkil rolündeki AI gerçek hayattaki bir müvekkil gibi yanıt verir.
 *
 * Akış:
 *   1. Müvekkilin intro repliği DialogueBubble olarak gösterilir
 *   2. Öğrenci textarea'ya soru yazar → /api/ai/roleplay
 *   3. Müvekkilin cevabı bubble olarak eklenir
 *   4. maxTurns dolunca veya "Görüşmeyi bitir" butonuyla kapanır
 *   5. Kapatınca requiredFacts'i karşılayan sorular kontrol edilip skor verilir
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Send, AlertTriangle, MessageSquare } from "lucide-react";
import { aiRolePlay } from "@/lib/api/aiClient";
import type { CaseNode, CharacterDef, Persona, RubricKey, Verdict } from "@/content/types";
import type { CaseSession } from "@/lib/case-engine";
import { DialogueBubble, SceneCaption } from "./DialogueBubble";
import { cn } from "@/lib/utils";

interface Props {
  caseId: string;
  node: CaseNode;
  session: CaseSession;
  speaker?: CharacterDef;
  /** Her tur engine'e yazılsın diye. */
  onTurn: (userText: string, aiText: string) => void;
  /** Sohbet bitince final skoru ile engine'e geç. */
  onFinish: (awarded: Partial<Record<RubricKey, number>>, verdict: Verdict) => void;
}

interface ChatMsg {
  speaker: "user" | "ai";
  text: string;
}

export function ClientChatStage({ caseId, node, session, speaker, onTurn, onFinish }: Props) {
  const cfg = node.clientChat!;
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Müvekkilin açılış repliği — node.prompt
  useEffect(() => {
    if (history.length === 0 && node.prompt) {
      setHistory([{ speaker: "ai", text: node.prompt }]);
    }
  }, [history.length, node.prompt]);

  const turnsUsed = Math.floor(
    history.filter((m) => m.speaker === "user").length,
  );
  const turnsLeft = Math.max(0, cfg.maxTurns - turnsUsed);
  const atLimit = turnsLeft === 0;

  const send = async () => {
    if (!input.trim() || atLimit) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);
    setError(null);
    setHistory((h) => [...h, { speaker: "user", text: userText }]);

    try {
      const personaName: Persona =
        speaker?.role === "muvekkil" ? "muvekkil" : "muvekkil";
      const transcript = history.map((h) => ({ speaker: h.speaker, text: h.text }));
      const res = await aiRolePlay({
        caseId,
        session,
        persona: personaName,
        transcript,
        userTurn: userText,
      });
      setHistory((h) => [...h, { speaker: "ai", text: res.reply }]);
      onTurn(userText, res.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // Hata olunca son user mesajını geri al
      setHistory((h) => h.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const finish = () => {
    // Skorlama: required fact'lerin kaçı kullanıcı mesajlarında geçtiğini say
    const required = cfg.requiredFacts ?? [];
    const userMessages = history
      .filter((m) => m.speaker === "user")
      .map((m) => m.text.toLowerCase())
      .join(" ");
    const hits = required.filter((f) =>
      userMessages.includes(f.toLowerCase()),
    ).length;
    const ratio = required.length > 0 ? hits / required.length : 0.5;
    const score =
      ratio >= 0.8 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.4 ? 2 : ratio >= 0.2 ? 1 : 0;
    const verdict: Verdict =
      ratio >= 0.6 ? "good" : ratio >= 0.3 ? "partial" : "bad";

    const awarded: Partial<Record<RubricKey, number>> = {};
    // Müvekkil görüşmesi öncelikle 'olay' boyutu — sonra 'mesele'
    awarded.olay = score as 0 | 1 | 2 | 3 | 4;
    if (ratio >= 0.5) awarded.mesele = Math.min(4, score - 1) as 0 | 1 | 2 | 3 | 4;

    onFinish(awarded, verdict);
  };

  return (
    <div className="space-y-4">
      <SceneCaption text={`Müvekkilinle görüşüyorsun · ${turnsLeft} tur kaldı`} />

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-line bg-surface-sunken/20 p-4">
        <AnimatePresence initial={false}>
          {history.map((m, i) => {
            if (m.speaker === "ai" && speaker) {
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogueBubble character={speaker} text={m.text} animate={false} />
                </motion.div>
              );
            }
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-12 flex justify-end"
              >
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo px-4 py-2.5 text-sm text-surface-raised">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Sen · Avukat
                  </p>
                  <p className="mt-1 leading-relaxed">{m.text}</p>
                </div>
              </motion.div>
            );
          })}
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-ink-3"
            >
              <Loader2 className="mr-1 inline size-3 animate-spin" />
              {speaker?.name ?? "Müvekkil"} yanıt yazıyor…
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {error ? (
        <div className="rounded-md border border-signal-critical/40 bg-signal-critical/5 p-2.5 text-xs text-signal-critical">
          <AlertTriangle className="mr-1 inline size-3" /> {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={atLimit || loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            rows={2}
            placeholder={
              atLimit
                ? "Tur hakkın bitti — görüşmeyi sonlandır."
                : "Müvekkile soru sor / yanıt ver…"
            }
            className="flex-1 resize-none rounded-md border border-line bg-surface-raised p-2.5 text-sm text-ink-1 focus:border-indigo/60 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={send}
            disabled={atLimit || loading || !input.trim()}
            className="inline-flex h-10 items-center gap-1 rounded-md bg-indigo px-3 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
            title="Cmd/Ctrl + Enter"
          >
            <Send className="size-3.5" /> Gönder
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-ink-3">
          <span className={cn(turnsLeft <= 1 && "text-signal-warning")}>
            <MessageSquare className="mr-1 inline size-3" />
            {turnsUsed} / {cfg.maxTurns} tur kullanıldı
          </span>
          <button
            type="button"
            onClick={finish}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Görüşmeyi bitir → <ArrowRight className="ml-0.5 inline size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
