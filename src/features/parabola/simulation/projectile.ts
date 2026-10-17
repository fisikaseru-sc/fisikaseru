/**
 * projectile.ts — fisika gerak parabola murni (tanpa rendering), testable.
 *
 * Model: proyektil diluncurkan dari ketinggian h0 dengan kecepatan awal v0
 * pada sudut θ terhadap horizontal, medan gravitasi seragam g turun.
 *
 *   x(t) = v0·cosθ · t
 *   y(t) = h0 + v0·sinθ · t − ½ g t²
 *
 * Semua fungsi pure sehingga bisa diuji langsung tanpa DOM/R3F.
 * Rendering 3D (ProjectileScene3D) hanya membaca hasil fungsi-fungsi ini.
 */

import { DEG2RAD } from "./constants";

// ── Tipe ─────────────────────────────────────────────────────

/** Parameter peluncuran proyektil. */
export interface ProjectileParams {
  /** Kecepatan awal (m/s). */
  v0: number;
  /** Sudut elevasi terhadap horizontal (derajat). */
  angleDeg: number;
  /** Percepatan gravitasi (m/s²), arah turun. */
  g: number;
  /** Ketinggian titik lepas (m) relatif tanah (y = 0). */
  h0: number;
}

/** Satu sampel lintasan pada waktu t. */
export interface ProjectileSample {
  /** Waktu (s). */
  t: number;
  /** Posisi horizontal (m). */
  x: number;
  /** Posisi vertikal (m). */
  y: number;
  /** Komponen kecepatan horizontal (m/s) — konstan. */
  vx: number;
  /** Komponen kecepatan vertikal (m/s). */
  vy: number;
}

// ── Kinematika dasar ─────────────────────────────────────────

/** Komponen kecepatan awal: vx = v0·cosθ, vy0 = v0·sinθ. */
export function velocityComponents(v0: number, angleDeg: number): { vx: number; vy0: number } {
  const rad = angleDeg * DEG2RAD;
  return { vx: v0 * Math.cos(rad), vy0: v0 * Math.sin(rad) };
}

/** Keadaan lengkap proyektil pada waktu t (bentuk tertutup — eksak). */
export function position(params: ProjectileParams, t: number): ProjectileSample {
  const { vx, vy0 } = velocityComponents(params.v0, params.angleDeg);
  return {
    t,
    x: vx * t,
    y: params.h0 + vy0 * t - 0.5 * params.g * t * t,
    vx,
    vy: vy0 - params.g * t,
  };
}

/**
 * Waktu total sampai menyentuh tanah (y = 0):
 *   t = (vy0 + √(vy0² + 2 g h0)) / g
 * Mengembalikan 0 bila g ≤ 0 (tak fisik) atau proyektil sudah di tanah.
 */
export function timeOfFlight(params: ProjectileParams): number {
  const { vy0 } = velocityComponents(params.v0, params.angleDeg);
  if (params.g <= 0) return 0;
  const disc = vy0 * vy0 + 2 * params.g * params.h0;
  if (disc < 0) return 0;
  return (vy0 + Math.sqrt(disc)) / params.g;
}

/**
 * Jarak horizontal tempuh (range) saat menyentuh tanah: R = vx · t_flight.
 */
export function range(params: ProjectileParams): number {
  const { vx } = velocityComponents(params.v0, params.angleDeg);
  return vx * timeOfFlight(params);
}

/**
 * Ketinggian maksimum di atas tanah:
 *   H = h0 + vy0² / (2g)
 */
export function maxHeight(params: ProjectileParams): number {
  const { vy0 } = velocityComponents(params.v0, params.angleDeg);
  if (params.g <= 0) return params.h0;
  return params.h0 + (vy0 * vy0) / (2 * params.g);
}

/**
 * Rumus teoretis di buku pelajaran untuk peluncuran dari tanah (h0 = 0):
 *   R(θ) = v0² · sin(2θ) / g
 * Dipakai sebagai kurva overlay pada analisis.
 */
export function theoreticalRange(v0: number, angleDeg: number, g: number): number {
  if (g <= 0) return 0;
  return (v0 * v0 * Math.sin(2 * angleDeg * DEG2RAD)) / g;
}

/** Sudut peluncuran yang memaksimalkan range dari tanah: 45°. */
export const OPTIMAL_ANGLE_DEG = 45;

// ── Sampling lintasan ────────────────────────────────────────

/**
 * Menghitung seluruh lintasan dari t = 0 sampai menyentuh tanah
 * (termasuk 1 titik impact di y = 0) dengan langkah waktu tetap.
 *
 * @param dt langkah sampling (s, default 1/60).
 * @param maxSamples batas atas jumlah titik (pengaman, default 4096).
 */
export function computeTrajectory(params: ProjectileParams, dt = 1 / 60, maxSamples = 4096): ProjectileSample[] {
  const tf = timeOfFlight(params);
  const points: ProjectileSample[] = [];
  if (tf <= 0) return points;

  const steps = Math.min(Math.ceil(tf / dt) + 1, maxSamples);
  for (let i = 0; i < steps; i++) {
    const t = Math.min(i * dt, tf);
    points.push(position(params, t));
    if (t >= tf) break;
  }
  // Pastikan titik terakhir tepat di tanah (bukan sedikit sebelum/sesudah).
  const last = points[points.length - 1];
  if (last.t < tf) points.push(position(params, tf));
  return points;
}

// ── Derau pengukuran (gaussian, dapat di-seed) ────────────────

/**
 * Generator pseudo-random LCG (Lehmer) + Box–Muller — pola sama dengan
 * `SeededRandom` Millikan. Bila seed diberikan, deret angka reproducible.
 */
export class GaussianNoise {
  private state: number;

  constructor(seed?: number) {
    this.state = seed === undefined ? (Date.now() % 2147483647) : seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
    if (this.state === 0) this.state = 1; // Lehmer LCG stuck-at-zero guard
  }

  /** Uniform (0, 1). */
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  /** Sampel gaussian: mean ± σ. */
  gaussian(mean = 0, sigma = 1): number {
    const u1 = this.next() || 1e-10;
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * sigma;
  }
}

/**
 * Helper derau range terukur: hasil pengukuran siswa memiliki ketidakpastian
 * relatif σ_rel dari keterbatasan membaca titik jatuh.
 *
 * @param params parameter peluncuran (range teoretis dihitung internal).
 * @param sigmaRel ketidakpastian relatif (0.01 = 1%).
 * @param rng sumber gaussian (opsional untuk reproducibility).
 * @returns range terukur = R_sejati + N(0, σ_rel · R_sejati).
 */
export function noisyRange(params: ProjectileParams, sigmaRel: number, rng?: GaussianNoise): number {
  const trueRange = range(params);
  if (sigmaRel <= 0) return trueRange;
  const noise = rng?.gaussian(0, sigmaRel * trueRange) ?? 0;
  return Math.max(0, trueRange + noise);
}
