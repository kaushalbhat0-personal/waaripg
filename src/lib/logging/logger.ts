// Structured operational logging
// Safe for production: never logs secrets

type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
};

const SENSITIVE_KEYS = [
  "password", "secret", "token", "key", "authorization",
  "api_key", "apiKey", "supabase_key", "service_role",
  "credit_card", "cvv", "ssn", "pan", "aadhar",
];

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

let requestCounter = 0;

function getRequestId(): string {
  return `req_${++requestCounter}_${Date.now().toString(36)}`;
}

function formatLog(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.requestId ? `[${entry.requestId}]` : "",
    entry.message,
  ];

  if (entry.context && Object.keys(entry.context).length > 0) {
    parts.push(JSON.stringify(sanitize(entry.context)));
  }

  if (entry.error) {
    parts.push(entry.error.stack ?? entry.error.message);
  }

  return parts.filter(Boolean).join(" ");
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? sanitize(context) : undefined,
    error,
    requestId: getRequestId(),
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(formatted);
      }
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) => log("error", message, context, error),
};

export function withLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  const start = Date.now();
  logger.info(`Starting: ${operation}`, context);

  return fn()
    .then((result) => {
      const duration = Date.now() - start;
      logger.info(`Completed: ${operation}`, { ...context, duration_ms: duration });
      return result;
    })
    .catch((error: Error) => {
      const duration = Date.now() - start;
      logger.error(`Failed: ${operation}`, error, { ...context, duration_ms: duration });
      throw error;
    });
}
