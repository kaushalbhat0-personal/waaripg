// Privacy-safe analytics tracking
// Uses localStorage batching, no external services

import type { AnalyticEvent, AnalyticEventName, AnalyticsSummary } from "@/features/analytics/types";

const STORAGE_KEY = "waaripg_analytics";
const BATCH_SIZE = 20;
const FLUSH_INTERVAL = 30000;

let eventQueue: AnalyticEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function loadEvents(): AnalyticEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500)));
  } catch {
    // localStorage full — discard oldest
  }
}

export function trackEvent(
  name: AnalyticEventName,
  properties?: Record<string, string | number | boolean>,
  options?: { feature?: string; duration_ms?: number },
) {
  const event: AnalyticEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    page_url: typeof window !== "undefined" ? window.location.pathname : undefined,
    feature: options?.feature,
    duration_ms: options?.duration_ms,
  };

  eventQueue.push(event);

  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents();
  }

  if (!flushTimer) {
    flushTimer = setInterval(flushEvents, FLUSH_INTERVAL);
  }
}

export function flushEvents() {
  if (eventQueue.length === 0) return;

  const existing = loadEvents();
  const all = [...existing, ...eventQueue];
  saveEvents(all);
  eventQueue = [];
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = loadEvents();

  const features = new Set<string>();
  let onboardingCompleted = false;
  let toursCompleted = 0;
  let feedbackCount = 0;
  let errorCount = 0;

  for (const e of events) {
    if (e.feature) features.add(e.feature);
    if (e.name === "onboarding_step" && e.properties?.step === "complete") onboardingCompleted = true;
    if (e.name === "tour_completed") toursCompleted++;
    if (e.name === "feedback_submitted") feedbackCount++;
    if (e.name === "error_encountered") errorCount++;
  }

  return {
    total_events: events.length,
    unique_pages: new Set(events.map((e) => e.page_url).filter(Boolean)).size,
    features_used: Array.from(features),
    onboarding_completed: onboardingCompleted,
    tours_completed: toursCompleted,
    feedback_count: feedbackCount,
    error_count: errorCount,
  };
}

export function clearAnalytics() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function startTracking() {
  trackEvent("session_start");
  return () => {
    flushEvents();
    if (flushTimer) clearInterval(flushTimer);
  };
}
