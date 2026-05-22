/**
 * ReportContentButton — vakanın veya dilekçe şablonunun içinde
 * yanlış/eksik bir bilgi gördüysen rapor et.
 *
 * Hafif popover form: kategori + serbest metin → Supabase content_reports.
 * Auth varsa user_id ile, yoksa anonim.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface Props {
  contentType: "case" | "petition" | "source" | "other";
  contentId: string;
  className?: string;
}

const CATEGORIES = [
  { key: "legal_error", label: "Hukuki yanlışlık" },
  { key: "outdated", label: "Eski mevzuat / değişmiş madde" },
  { key: "typo", label: "Yazım / dilbilgisi hatası" },
  { key: "inappropriate", label: "Uygunsuz / hassas içerik" },
  { key: "other", label: "Diğer" },
] as const;

export function ReportContentButton({ contentType, contentId, className }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]["key"]>("legal_error");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (description.trim().length < 10) {
      setError("Lütfen biraz daha açıklayıcı yaz (en az 10 karakter).");
      return;
    }
    if (!hasSupabaseConfig()) {
      setError("Sunucu yapılandırması eksik.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = supabaseBrowser();
      const { error: err } = await supabase.from("content_reports").insert({
        user_id: user?.id ?? null,
        content_type: contentType,
        content_id: contentId,
        category,
        description: description.trim(),
      });
      if (err) throw err;
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setDescription("");
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-2.5 py-1 text-[10px] font-semibold text-ink-3 hover:bg-surface-sunken hover:text-ink-1"
        title="Bu içerikte hata gördüm"
      >
        <Flag className="size-3" /> Hata bildir
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface-raised p-6 shadow-2xl"
            >
              <header className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo">
                    İçerik Hatası Bildir
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink-1">
                    Ne fark ettin?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-ink-3 hover:bg-surface-sunken"
                >
                  <X className="size-4" />
                </button>
              </header>

              {done ? (
                <div className="rounded-md border border-signal-positive/40 bg-signal-positive/5 p-4 text-center">
                  <CheckCircle2 className="mx-auto size-6 text-signal-positive" />
                  <p className="mt-2 font-display text-base font-bold text-ink-1">
                    Bildirimin alındı.
                  </p>
                  <p className="mt-0.5 text-xs text-ink-2">
                    En kısa sürede inceleyeceğiz, teşekkürler.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-3">
                      Kategori
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setCategory(c.key)}
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-left text-[11px] font-semibold transition-colors",
                            category === c.key
                              ? "border-indigo bg-indigo-soft/40 text-indigo"
                              : "border-line bg-surface-raised text-ink-2 hover:bg-surface-sunken",
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-ink-3">
                      Açıklama
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Hangi bilgi yanlış / eksik? Mümkünse mevzuat referansı ile yaz."
                      className="w-full resize-y rounded-md border border-line bg-surface-sunken/30 p-2.5 text-xs leading-relaxed text-ink-1 outline-none focus:border-indigo focus:bg-surface-raised"
                    />
                  </div>

                  {error ? (
                    <div className="flex items-start gap-2 rounded-md border border-signal-critical/40 bg-signal-critical/5 p-2.5 text-xs text-signal-critical">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-sunken"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={busy || description.trim().length < 10}
                      className="inline-flex items-center gap-1.5 rounded-md bg-indigo px-4 py-1.5 text-xs font-bold text-surface-raised hover:opacity-90 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="size-3 animate-spin" /> : null}
                      Bildir
                    </button>
                  </div>

                  <p className="text-[10px] text-ink-3">
                    {user
                      ? "Bildirimi senin hesabınla gönderiyoruz; gerekirse seninle iletişime geçeriz."
                      : "Anonim olarak gönderiyorsun. Giriş yaparsan takip edebilirsin."}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
