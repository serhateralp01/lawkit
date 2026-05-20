/**
 * Env okuyucu — Cloudflare Workers + Node + Vite dev üçü için.
 *
 * Worker prod'da `env` parametresi runtime'a fetch'in 2. arg'ı olarak gelir.
 * Vite dev'de process.env kullanılır.
 * TanStack Start server functions h3 event context'inden cloudflare env'e ulaşır
 * ama burada ufak bir helper yeterli; gerektiğinde caller bağlamı verir.
 */

export interface ServerEnv {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  OPENROUTER_SITE_URL: string;
  OPENROUTER_APP_NAME: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const DEFAULTS = {
  OPENROUTER_MODEL: "deepseek/deepseek-chat-v3-0324:free",
  OPENROUTER_SITE_URL: "https://lawkit.app",
  OPENROUTER_APP_NAME: "LawKit",
} as const;

type EnvSource = Record<string, string | undefined>;

function pick(source: EnvSource, key: string, fallback?: string): string | undefined {
  const value = source[key];
  return value && value.trim().length > 0 ? value : fallback;
}

/**
 * Cloudflare Worker fetch handler'ının 2. parametresinden gelen env veya
 * Node/Vite ortamında process.env'i kabul eder. Birini geç — uygun olanı seçer.
 */
export function readServerEnv(workerEnv?: EnvSource): ServerEnv {
  const source: EnvSource =
    workerEnv ??
    // Node/Vite dev fallback
    (typeof process !== "undefined" ? (process.env as EnvSource) : {});

  const apiKey = pick(source, "OPENROUTER_API_KEY");
  if (!apiKey) {
    // Çağıran yer (örn. /api/ai route'u) yumuşak hata döndürmeli — burada
    // throw etmiyoruz ki uygulama AI olmadan da render edilebilsin.
    console.warn("[env] OPENROUTER_API_KEY tanımsız — AI uçları 503 dönecek.");
  }

  return {
    OPENROUTER_API_KEY: apiKey ?? "",
    OPENROUTER_MODEL: pick(source, "OPENROUTER_MODEL", DEFAULTS.OPENROUTER_MODEL)!,
    OPENROUTER_SITE_URL: pick(source, "OPENROUTER_SITE_URL", DEFAULTS.OPENROUTER_SITE_URL)!,
    OPENROUTER_APP_NAME: pick(source, "OPENROUTER_APP_NAME", DEFAULTS.OPENROUTER_APP_NAME)!,
    SUPABASE_URL: pick(source, "SUPABASE_URL"),
    SUPABASE_ANON_KEY: pick(source, "SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: pick(source, "SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasAiCredentials(env: ServerEnv): boolean {
  return env.OPENROUTER_API_KEY.length > 0;
}
