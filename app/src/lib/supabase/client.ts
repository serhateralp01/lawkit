/**
 * Browser-side Supabase client — anon key ile.
 *
 * RLS aktif olduğundan bu client sadece kullanıcının kendi verisini görür.
 * Session localStorage'da tutulur, sayfa yeniden yüklenince devam eder.
 *
 * SSR güvenli: ilk render sırasında window yoksa client yine yaratılır ama
 * session getOrSet'i tarayıcı side'da yapılır.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_RAW = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_RAW = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let cached: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!URL_RAW || !ANON_RAW) {
    throw new Error(
      "VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY tanımsız. .env kontrol et.",
    );
  }
  if (cached) return cached;
  cached = createClient(URL_RAW, ANON_RAW, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}

export function hasSupabaseConfig(): boolean {
  return Boolean(URL_RAW && ANON_RAW);
}
