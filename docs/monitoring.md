# Monitoring & Observability Guide

## Overview

WaaRi PG uses three layers of observability:
- **Structured Logging** — Operational events, request tracing
- **Sentry** — Error tracking, performance monitoring (optional)
- **Health Checks** — Uptime monitoring, dependency verification

## 1. Structured Logging

The logger at `src/lib/logging/logger.ts` provides:
- 4 log levels: `debug`, `info`, `warn`, `error`
- Automatic request ID generation (`req_1_a1b2c3`)
- Sensitive data redaction (passwords, tokens, keys)
- Environment-aware output (debug logs only in development)
- `withLogging()` wrapper for operation-level tracing

### Usage
```typescript
import { logger, withLogging } from "@/lib/logging";

// Simple log
logger.info("Processing payment", { invoice_id: "inv_123" });

// Error log
logger.error("Payment failed", error, { invoice_id: "inv_123" });

// Operation wrapper (auto logs start/complete/fail with duration)
const result = await withLogging("processPayment", () => processPayment(data));
```

### Log Levels
| Level | Production | Development | Use Case |
|---|---|---|---|
| `debug` | Suppressed | Printed | Development debugging |
| `info` | Printed | Printed | Normal operations |
| `warn` | Printed | Printed | Warnings, rate limiting |
| `error` | Printed | Printed | Errors, exceptions |

## 2. Sentry Error Tracking

Sentry integration at `src/lib/monitoring/sentry.ts` provides:
- Global error handler (window.onerror + unhandledrejection)
- `captureError()` — Log errors with context
- `captureMessage()` — Log informational events
- Performance markers for slow operations
- User context injection

### Setup
1. Create a Sentry account and project
2. Set `NEXT_PUBLIC_SENTRY_DSN` in your environment variables
3. The SDK auto-initializes when DSN is present

### Usage
```typescript
import { captureError, captureMessage, setSentryUser } from "@/lib/monitoring";

try {
  // risky operation
} catch (err) {
  captureError(err as Error, {
    level: "error",
    context: { userId: "123", action: "payment" },
    tags: { feature: "payments" },
  });
}

// Track perf
import { startPerfMarker, endPerfMarker } from "@/lib/monitoring";
startPerfMarker("dashboard.load");
// ... load data
endPerfMarker("dashboard.load");
```

## 3. Health Checks

The `/api/health` endpoint provides:
- Overall system health (`healthy` / `degraded` / `unhealthy`)
- Individual check status per component
- Latency measurements
- Version + uptime info

### Checks Performed
1. **Environment**: Verifies env vars are configured
2. **Database**: Tests Supabase connectivity (simple query)
3. **Auth**: Tests Supabase Auth service
4. **Schema**: Verifies key tables exist (in DB function)

### Monitoring Setup
Configure external uptime monitors to hit `/api/health`:
- **Check interval**: Every 5 minutes
- **Expected status**: 200
- **Expected body**: `{"status":"healthy"}`

### Recommended Providers
- **Better Uptime** — Simple, includes status page
- **UptimeRobot** — Free tier available
- **Pingdom** — Enterprise features

## 4. Performance Monitoring

- **React Strict Mode**: Enabled in `next.config.ts`
- **Bundle optimization**: Package imports optimized via `optimizePackageImports`
- **Image optimization**: AVIF/WebP formats, remote patterns configured
- **Console removal**: `removeConsole` enabled in production build

## 5. Alerting

### When to alert
- Health check returns `unhealthy` → P1 incident
- Database latency > 1s → P2 incident
- Error rate > 5% in 5 minutes → P2 incident
- Rate limiting threshold hit → P3 incident

### Alert Channels
- **Sentry Alerts**: For error rate spikes
- **External Uptime Monitor**: For full site down
- **Vercel Webhooks**: For deployment failures
