"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createAttemptSession,
  loadAttemptSession,
  saveAttemptSession,
} from "@/lib/session/session-store";
import { LabAttemptSession } from "@/lib/session/types";

export function useAttemptSession(attemptId: string, labId = "milikan", slug = "milikan") {
  const [session, setSession] = useState<LabAttemptSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadAttemptSession(attemptId);
      const initial = loaded ?? createAttemptSession(attemptId, labId, slug);
      setSession(initial);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [attemptId, labId, slug]);

  useEffect(() => {
    if (!ready || !session) {
      return;
    }
    saveAttemptSession(session);
  }, [ready, session]);

  const api = useMemo(
    () => ({
      ready,
      session,
      setSession,
    }),
    [ready, session],
  );

  return api;
}
