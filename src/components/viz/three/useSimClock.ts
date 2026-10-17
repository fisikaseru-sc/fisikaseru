"use client";

/**
 * useSimClock — jam simulasi dengan akumulator fixed-timestep.
 *
 * Fisika maju dengan langkah tetap (default 1/240 s) yang terpisah dari
 * FPS render: setiap frame rAF, delta waktu nyata dikali speed lalu
 * "dihabiskan" dalam step-step tetap melalui callback `onStep`.
 * Callback dipanggil sekali per step fisika, sehingga integrator numerik
 * (RK4 / Euler simpliktik) selalu stabil berapa pun FPS perangkat.
 *
 * `time` adalah snapshot state yang diterbitkan ~10 Hz (hemat re-render)
 * untuk keperluan readout UI. Gunakan `getTime()` untuk nilai hidup.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSimClockOptions {
  /** Langkah fisika tetap dalam detik (default 1/240). */
  timestep?: number;
  /** Batas step per frame agar tidak spiral-of-death (default 16). */
  maxStepsPerFrame?: number;
  /** State running awal (default false). */
  running?: boolean;
  /** Pengali kecepatan awal (default 1). */
  speed?: number;
  /** Cadence penerbitan state `time` dalam ms (default 100). */
  publishIntervalMs?: number;
  /** Dipanggil sekali per step fisika tetap: (dt, waktuSimulasi). */
  onStep?: (dt: number, time: number) => void;
  /** Dipanggil saat reset (waktu kembali ke 0). */
  onReset?: () => void;
}

export interface SimClockApi {
  /** Snapshot waktu simulasi (detik), diperbarui ±10 Hz — aman untuk UI. */
  time: number;
  /** Waktu simulasi live (detik) — baca di dalam loop render/useFrame. */
  getTime: () => number;
  running: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  speed: number;
  setSpeed: (value: number) => void;
}

export function useSimClock(options: UseSimClockOptions = {}): SimClockApi {
  const {
    timestep = 1 / 240,
    maxStepsPerFrame = 16,
    publishIntervalMs = 100,
  } = options;

  const [running, setRunning] = useState(options.running ?? false);
  const [speed, setSpeedState] = useState(options.speed ?? 1);
  const [time, setTime] = useState(0);

  const timeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const speedRef = useRef(options.speed ?? 1);
  const onStepRef = useRef(options.onStep);
  const onResetRef = useRef(options.onReset);

  useEffect(() => {
    onStepRef.current = options.onStep;
    onResetRef.current = options.onReset;
  }, [options.onStep, options.onReset]);

  useEffect(() => {
    if (!running) return;

    let raf = 0;
    let lastWall = performance.now();
    let lastPublish = lastWall;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const wallDt = Math.min((now - lastWall) / 1000, 0.1); // clamp saat tab idle
      lastWall = now;
      if (wallDt <= 0) return;

      accumulatorRef.current += wallDt * speedRef.current;

      let steps = 0;
      while (accumulatorRef.current >= timestep && steps < maxStepsPerFrame) {
        timeRef.current += timestep;
        onStepRef.current?.(timestep, timeRef.current);
        accumulatorRef.current -= timestep;
        steps += 1;
      }
      // Buang backlog bila frame sebelumnya berat (hindari spiral of death).
      if (steps >= maxStepsPerFrame) accumulatorRef.current = 0;

      if (now - lastPublish >= publishIntervalMs) {
        lastPublish = now;
        setTime(timeRef.current);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, timestep, maxStepsPerFrame, publishIntervalMs]);

  const play = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    timeRef.current = 0;
    accumulatorRef.current = 0;
    setTime(0);
    onResetRef.current?.();
  }, []);

  const setSpeed = useCallback((value: number) => {
    const clamped = value > 0 ? value : 0;
    speedRef.current = clamped;
    setSpeedState(clamped);
  }, []);

  return {
    time,
    getTime: () => timeRef.current,
    running,
    play,
    pause,
    reset,
    speed,
    setSpeed,
  };
}

export default useSimClock;
