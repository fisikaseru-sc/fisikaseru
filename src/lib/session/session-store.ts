"use client";

import { getGuestItem, setGuestItem } from "@/lib/storage/guestStorage";
import { DEFAULT_MILIKAN_APPARATUS } from "@/lib/session/defaults";
import {
  AttemptIndexItem,
  EMPTY_ANALYSIS,
  EMPTY_CER,
  EMPTY_PRELAB,
  LabAttemptSession,
} from "@/lib/session/types";

const ATTEMPT_KEY_PREFIX = "fisikaseru:attempt:";
const ATTEMPT_INDEX_KEY = "fisikaseru:attempt:index";

function attemptKey(attemptId: string) {
  return `${ATTEMPT_KEY_PREFIX}${attemptId}`;
}

function nowISO() {
  return new Date().toISOString();
}

function upsertIndex(item: AttemptIndexItem) {
  const current = getGuestItem<AttemptIndexItem[]>(ATTEMPT_INDEX_KEY) ?? [];
  const filtered = current.filter((entry) => entry.attemptId !== item.attemptId);
  filtered.unshift(item);
  setGuestItem(ATTEMPT_INDEX_KEY, filtered.slice(0, 50));
}

export function createAttemptSession(attemptId: string, labId = "milikan", slug = "milikan"): LabAttemptSession {
  const now = nowISO();
  const session: LabAttemptSession = {
    attemptId,
    labId,
    slug,
    createdAtISO: now,
    updatedAtISO: now,
    currentStep: 1,
    apparatus: { ...DEFAULT_MILIKAN_APPARATUS },
    prelab: { ...EMPTY_PRELAB },
    trials: [],
    analysis: { ...EMPTY_ANALYSIS },
    cer: { ...EMPTY_CER },
    reportReady: false,
  };
  saveAttemptSession(session);
  return session;
}

export function loadAttemptSession(attemptId: string): LabAttemptSession | null {
  return getGuestItem<LabAttemptSession>(attemptKey(attemptId));
}

export function saveAttemptSession(session: LabAttemptSession) {
  const next: LabAttemptSession = { ...session, updatedAtISO: nowISO() };
  setGuestItem(attemptKey(next.attemptId), next);
  upsertIndex({
    attemptId: next.attemptId,
    labId: next.labId,
    slug: next.slug,
    updatedAtISO: next.updatedAtISO,
  });
}

export function loadAttemptIndex() {
  return getGuestItem<AttemptIndexItem[]>(ATTEMPT_INDEX_KEY) ?? [];
}

export function createAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
