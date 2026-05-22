/**
 * Server-side Supabase client — service_role key ile RLS bypass eder.
 *
 * UYARI: Bu client'ı asla tarayıcıya bundle etme. Sadece /api/* uçları
 * gibi Worker tarafında kullan. Her endpoint kendisi auth.uid() denetimini
 * manuel yapar.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ServerEnv } from "@/lib/env";

export function supabaseAdmin(env: ServerEnv): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımsız.");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Kullanıcı session'ından gelen access token ile RLS uygulayan client.
 * Bu client kullanıcının auth.uid()'iyle çalışır, yani RLS kuralları geçerli.
 */
export function supabaseForUser(env: ServerEnv, accessToken: string): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL veya SUPABASE_ANON_KEY tanımsız.");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
