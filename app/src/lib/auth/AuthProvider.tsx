import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";

/**
 * Admin email allow-list. Yalnız bu adres(ler) admin yetkisi alır.
 * DB profile.is_admin ALANINA GÜVENİLMEZ — hard-coded liste önceliklidir.
 * Yeni admin eklenecekse buraya yazılır.
 */
const ADMIN_EMAILS = new Set<string>(["serhateralp01@gmail.com"]);

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
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
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    const supabase = supabaseBrowser();
    let mounted = true;

    function applyAdminFromEmail(email: string | undefined) {
      if (!mounted) return;
      const normalized = email?.trim().toLowerCase() ?? "";
      setIsAdmin(ADMIN_EMAILS.has(normalized));
    }

    async function ensureProfile(userId: string | undefined, email: string | undefined) {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        if (!error && !data) {
          const displayName = email?.split("@")[0] ?? "Kullanıcı";
          await supabase.from("profiles").insert({
            id: userId,
            display_name: displayName,
            is_admin: false,
          });
        }
      } catch {
        /* profiles tablosu yoksa sessizce geç — admin email allow-list yine geçerli */
      }
    }

    // İlk session kontrolü
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const u = data.session?.user;
      applyAdminFromEmail(u?.email);
      void ensureProfile(u?.id, u?.email).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    // Auth state değişikliklerini dinle
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      const u = s?.user;
      applyAdminFromEmail(u?.email);
      void ensureProfile(u?.id, u?.email);
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
