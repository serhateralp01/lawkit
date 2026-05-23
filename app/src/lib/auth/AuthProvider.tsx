/**
 * AuthProvider — Supabase session'ını React context'e koyar.
 *
 * SSR güvenli:
 *   - İlk render'da session=null, loading=true
 *   - Tarayıcı mount'unda supabase.auth.getSession() çağrılır
 *   - onAuthStateChange ile login/logout güncellemeleri
 *
 * Kullanım:
 *   const { user, session, loading, signOut } = useAuth();
 *   if (loading) return <Spinner />
 *   if (!user) return <LoginPrompt />
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Beta gating için: profiles.is_admin = true ise true. */
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // SSR'da window yok; sadece client'ta çalışsın
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    if (!hasSupabaseConfig()) {
      console.warn("[auth] Supabase config yok — anonim modda çalışıyor.");
      setLoading(false);
      return;
    }

    const supabase = supabaseBrowser();
    let mounted = true;

    const fetchAdminFlag = async (userId: string | undefined) => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();
      if (mounted) {
        setIsAdmin(!error && !!data?.is_admin);
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await fetchAdminFlag(data.session?.user?.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s);
      await fetchAdminFlag(s?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!hasSupabaseConfig()) return;
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, isAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
