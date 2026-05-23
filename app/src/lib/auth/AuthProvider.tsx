import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser, hasSupabaseConfig } from "@/lib/supabase/client";

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

    async function fetchProfile(userId: string | undefined, email: string | undefined) {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      // Hardcoded admin fallback
      if (email === "serhateralp01@gmail.com") {
        if (mounted) setIsAdmin(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116" || error.code === "42P01") {
            // Profil yok → manuel oluşturmayı dene
            const displayName = email?.split("@")[0] ?? "Kullanıcı";
            await supabase.from("profiles").insert({
              id: userId,
              display_name: displayName,
              is_admin: false,
            });
          }
          if (mounted) setIsAdmin(false);
          return;
        }

        if (mounted) setIsAdmin(data?.is_admin === true);
      } catch {
        if (mounted) setIsAdmin(false);
      }
    }

    // İlk session kontrolü
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      fetchProfile(data.session?.user?.id, data.session?.user?.email).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    // Auth state değişikliklerini dinle
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      fetchProfile(s?.user?.id, s?.user?.email);
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
