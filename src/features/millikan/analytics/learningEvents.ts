// ============================================================
// FISIKASERU — LEARNING ANALYTICS EVENT ARCHITECTURE
// SPRINT E: Privacy-Preserving Learning Event Dispatcher
// ============================================================

export type LearningEventType =
  | "prediction_submitted"
  | "trial_recorded"
  | "candidate_tested"
  | "candidate_compared"
  | "pattern_observed"
  | "discovery_articulated"
  | "reflection_submitted"
  | "transfer_attempted"
  | "transfer_explained"
  | "confidence_revisited";

export interface LearningEvent<T = Record<string, unknown>> {
  module: "millikan" | "bandul";
  event: LearningEventType;
  timestamp: number;
  metadata: T;
}

const STORAGE_KEY = "fisikaseru:analytics:events";
const MAX_EVENTS_STORED = 100;

type EventListener = (event: LearningEvent) => void;
const listeners: Set<EventListener> = new Set();

/**
 * Dispatches a privacy-preserving learning event.
 * Stores lightweight metadata locally without logging sensitive student free-text.
 */
export function trackLearningEvent<T extends Record<string, unknown>>(
  module: "millikan" | "bandul",
  event: LearningEventType,
  metadata: T
): void {
  const learningEvent: LearningEvent<T> = {
    module,
    event,
    timestamp: Date.now(),
    metadata,
  };

  // 1. Notify runtime listeners
  listeners.forEach((listener) => {
    try {
      listener(learningEvent as LearningEvent);
    } catch (_) {}
  });

  // 2. Persist to local queue (max 100 events)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: LearningEvent[] = raw ? JSON.parse(raw) : [];
      const updated = [...existing, learningEvent].slice(-MAX_EVENTS_STORED);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
}

/**
 * Register a listener for learning events (e.g. for adaptive hint triggers or debugging).
 */
export function subscribeToLearningEvents(listener: EventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get cached local learning events.
 */
export function getStoredLearningEvents(): LearningEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}
