// Sentry integration for monitoring & observability
// Safe to import in both client and server code

import { logger } from "@/lib/logging";

type SentryEvent = {
  level: "error" | "warning" | "info";
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  user?: { id: string; email?: string };
  tags?: Record<string, string>;
};

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized) return;
  if (typeof window === "undefined") return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    logger.debug("Sentry DSN not configured — skipping initialization");
    return;
  }

  sentryInitialized = true;
  logger.info("Sentry initialized");

  // Capture global errors
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      captureError(event.error ?? new Error(event.message), {
        level: "error",
        tags: { source: "global" },
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      captureError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        level: "error",
        tags: { source: "unhandled_promise" },
      });
    });
  }
}

export function captureError(
  error: Error,
  options?: { level?: SentryEvent["level"]; context?: Record<string, unknown>; tags?: Record<string, string> },
) {
  const event: SentryEvent = {
    level: options?.level ?? "error",
    message: error.message,
    error,
    context: options?.context,
    tags: options?.tags,
  };

  logger.error(event.message, error, event.context);

  if (sentryInitialized) {
    // Sentry SDK call would go here
    // captureException(error, { extra: event.context, tags: event.tags });
  }
}

export function captureMessage(
  message: string,
  options?: { level?: SentryEvent["level"]; context?: Record<string, unknown>; tags?: Record<string, string> },
) {
  const event: SentryEvent = {
    level: options?.level ?? "info",
    message,
    context: options?.context,
    tags: options?.tags,
  };

  logger.info(event.message, event.context);

  if (sentryInitialized) {
    // captureMessage(message, { extra: event.context, tags: event.tags, level: event.level });
  }
}

export function setSentryUser(_user: { id: string; email?: string }) {
  if (sentryInitialized) {
    // setUser({ id: user.id, email: user.email });
  }
}

const perfMarkers = new Map<string, number>();

export function startPerfMarker(name: string) {
  perfMarkers.set(name, performance.now());
}

export function endPerfMarker(name: string, _tags?: Record<string, string>) {
  const start = perfMarkers.get(name);
  if (start) {
    const duration = performance.now() - start;
    perfMarkers.delete(name);

    if (duration > 1000) {
      logger.warn(`Slow operation: ${name}`, { duration_ms: Math.round(duration) });
    }

    if (sentryInitialized) {
      // transaction?.setMeasurement(name, duration, 'millisecond');
    }
  }
}
