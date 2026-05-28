// Environment variable validation
// Throws at build time if critical env vars are missing in production

type EnvVar = {
  key: string;
  required: boolean;
  description: string;
  public: boolean;
};

const envVars: EnvVar[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "Supabase project URL", public: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, description: "Supabase anonymous key", public: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: false, description: "Supabase service role key (admin only)", public: false },
  { key: "NEXT_PUBLIC_APP_URL", required: false, description: "Public app URL", public: true },
  { key: "NEXT_PUBLIC_APP_NAME", required: false, description: "Application display name", public: true },
  { key: "NEXT_PUBLIC_SENTRY_DSN", required: false, description: "Sentry DSN for error tracking", public: true },
  { key: "SENTRY_AUTH_TOKEN", required: false, description: "Sentry auth token for source maps", public: false },
];

type EnvValidationResult = {
  valid: boolean;
  missing: { key: string; description: string }[];
  warnings: { key: string; description: string }[];
};

export function validateEnv(): EnvValidationResult {
  const missing: EnvValidationResult["missing"] = [];
  const warnings: EnvValidationResult["warnings"] = [];
  const isProduction = process.env.NODE_ENV === "production";

  for (const envVar of envVars) {
    const value = process.env[envVar.key];
    const isMissing = !value || value === "your-project-url" || value === "your-anon-key" || value === "your-service-role-key" || value === "placeholder-key";

    if (isMissing) {
      if (envVar.required) {
        if (isProduction) {
          missing.push({ key: envVar.key, description: envVar.description });
        } else {
          warnings.push({ key: envVar.key, description: envVar.description });
        }
      } else {
        warnings.push({ key: envVar.key, description: envVar.description });
      }
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getPublicEnv(key: string): string | undefined {
  if (typeof window === "undefined") {
    return process.env[key];
  }
  return undefined;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
