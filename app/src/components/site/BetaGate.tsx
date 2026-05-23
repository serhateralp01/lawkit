import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Eskiden gating mesajı için kullanılıyordu; artık no-op. */
  feature?: string;
}

/**
 * BetaGate — açık erişim modu.
 *
 * Eskiden yalnızca admin'lere açıktı; artık tüm ziyaretçilere açık ve
 * içerik her durumda render ediliyor. Bu wrapper, çağrı yerlerini
 * değiştirmemek için korundu — ileride yeniden gating gerekirse logic
 * burada toplanır.
 */
export function BetaGate({ children }: Props) {
  return <>{children}</>;
}
