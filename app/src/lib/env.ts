/**
 * Env okuyucu — Cloudflare Workers + Node + Vite dev üçü için.
 *
 * LLM_* generic; sağlayıcı değişince URL+KEY+MODEL editlersin, kod aynı kalır.
 * Geriye uyumluluk: eski OPENROUTER_* değişkenleri hala okunur.
 */

export interface ServerEnv {
  LLM_API_KEY: string;
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  LLM_SITE_URL: string;
  LLM_APP_NAME: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const DEFAULTS = {
  LLM_BASE_URL: "https://api.deepseek.com",
  LLM_MODEL: "deepseek-v4-pro",
  LLM_SITE_URL: "https://lawkit.app",
  LLM_APP_NAME: "LawKit",
} as const;

type EnvSource = Record<string, string | undefined>;

function pick(source: EnvSource, keys: string[], fallback?: string): string | undefined {
  for (const k of keys) {
    const v = source[k];
    if (v && v.trim().length > 0) return v;
  }
  return fallback;
}

export function readServerEnv(workerEnv?: EnvSource): ServerEnv {
  const source: EnvSource =
    workerEnv ?? (typeof process !== "undefined" ? (process.env as EnvSource) : {});

  // Yeni LLM_* öncelikli; eski OPENROUTER_* fallback.
  const apiKey = pick(source, ["LLM_API_KEY", "OPENROUTER_API_KEY"]);
  if (!apiKey) {
    console.warn("[env] LLM_API_KEY tanımsız — AI uçları 503 dönecek.");
  }

  return {
    LLM_API_KEY: apiKey ?? "",
    LLM_BASE_URL: pick(source, ["LLM_BASE_URL"], DEFAULTS.LLM_BASE_URL)!,
    LLM_MODEL: pick(source, ["LLM_MODEL", "OPENROUTER_MODEL"], DEFAULTS.LLM_MODEL)!,
    LLM_SITE_URL: pick(source, ["LLM_SITE_URL", "OPENROUTER_SITE_URL"], DEFAULTS.LLM_SITE_URL)!,
    LLM_APP_NAME: pick(source, ["LLM_APP_NAME", "OPENROUTER_APP_NAME"], DEFAULTS.LLM_APP_NAME)!,
    SUPABASE_URL: pick(source, ["SUPABASE_URL"]),
    SUPABASE_ANON_KEY: pick(source, ["SUPABASE_ANON_KEY"]),
    SUPABASE_SERVICE_ROLE_KEY: pick(source, ["SUPABASE_SERVICE_ROLE_KEY"]),
  };
}

export function hasAiCredentials(env: ServerEnv): boolean {
  return env.LLM_API_KEY.length > 0;
}
