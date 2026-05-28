import { logger } from "@/lib/logging";

type SecurityHeader = [string, string];

// Content Security Policy
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.sentry.io wss://*.supabase.co",
  "frame-src https://challenges.cloudflare.com",
  "base-uri 'self'",
  "form-action 'self'",
] as const;

export function getSecurityHeaders(): SecurityHeader[] {
  return [
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["X-XSS-Protection", "1; mode=block"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
    ["Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"],
    ["Content-Security-Policy", CSP.join("; ")],
  ];
}

export function setSecureHeaders(headers: Headers): void {
  for (const [key, value] of getSecurityHeaders()) {
    headers.set(key, value);
  }
}

export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = ["password", "secret", "token", "key", "authorization", "credit_card", "cvv", "ssn", "pan", "aadhar"];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeForLogging(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 },
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    logger.warn(`Rate limit exceeded for ${key}`, { count: entry.count });
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Periodic cleanup of rate limit store
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}
