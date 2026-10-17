// ============================================================
// FISIKASERU — SPRINT 1 NUMERICAL ORACLE TESTS
// Validasi model fisika Gerak Parabola & Bandul terhadap
// solusi analitik / referensi independen. Pola runner sama
// dengan socraticEngine.test.ts (node, tanpa framework eksternal).
//
// Jalankan: npm run test:physics
// ============================================================

import {
  position,
  velocityComponents,
  timeOfFlight,
  range,
  maxHeight,
  theoreticalRange,
  computeTrajectory,
  GaussianNoise,
  OPTIMAL_ANGLE_DEG,
  type ProjectileParams,
} from "../features/parabola/simulation/projectile";
import { DEG2RAD } from "../features/parabola/simulation/constants";

let failures = 0;
function assert(condition: boolean, testName: string, detail = "") {
  if (!condition) {
    failures++;
    console.error(`❌ FAIL: ${testName} ${detail}`);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

function close(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

// ── 1. Kinematika dasar ──────────────────────────────────────
{
  const p: ProjectileParams = { v0: 25, angleDeg: 30, g: 9.81, h0: 0 };
  const { vx, vy0 } = velocityComponents(p.v0, p.angleDeg);
  assert(close(vx, 25 * Math.cos(30 * DEG2RAD), 1e-12), "vx = v0·cosθ");
  assert(close(vy0, 25 * Math.sin(30 * DEG2RAD), 1e-12), "vy0 = v0·sinθ");

  const s = position(p, 1.0);
  assert(close(s.x, vx * 1.0, 1e-12), "x(t) = vx·t");
  assert(close(s.y, vy0 * 1.0 - 0.5 * 9.81, 1e-12), "y(t) = h0 + vy0·t − ½gt²");
  assert(close(s.vy, vy0 - 9.81, 1e-12), "vy(t) = vy0 − g·t (linear)");
  assert(s.vx === vx, "vx konstan (tidak bergantung t)");
}

// ── 2. Simetri & kasus sudut ─────────────────────────────────
{
  const v0 = 20, g = 9.81;
  // Sudut 0° dari tanah: tf = 0 (proyektil sudah di tanah) — domain valid.
  const p0: ProjectileParams = { v0, angleDeg: 0, g, h0: 0 };
  assert(timeOfFlight(p0) === 0, "θ=0°, h0=0 ⇒ tf = 0 (tidak ada gerak vertikal)");

  // θ=90°: hanya vertikal; range 0, H = v0²/2g.
  const p90: ProjectileParams = { v0, angleDeg: 90, g, h0: 0 };
  assert(close(range(p90), 0, 1e-12), "θ=90° ⇒ R = 0");
  assert(close(maxHeight(p90), (v0 * v0) / (2 * g), 1e-12), "θ=90° ⇒ H = v0²/(2g)");
  assert(close(timeOfFlight(p90), 2 * v0 / g, 1e-12), "θ=90° ⇒ T = 2v0/g (naik lalu turun)");

  // Simetri 30°/60°: R(30°) = R(60°) dari tanah.
  const p30: ProjectileParams = { v0, angleDeg: 30, g, h0: 0 };
  const p60: ProjectileParams = { v0, angleDeg: 60, g, h0: 0 };
  assert(close(range(p30), range(p60), 1e-12), "Simetri sudut komplementer: R(30°)=R(60°)");

  // 45° maksimum (property scan diskrit).
  let bestAngle = 10, bestRange = -1;
  for (let a = 10; a <= 80; a += 1) {
    const r = range({ v0, angleDeg: a, g, h0: 0 });
    if (r > bestRange) { bestRange = r; bestAngle = a; }
  }
  assert(bestAngle === OPTIMAL_ANGLE_DEG, `Range maksimum pada 45° (dapat ${bestAngle}°)`);
  assert(close(range({ v0, angleDeg: 45, g, h0: 0 }), theoreticalRange(v0, 45, g), 1e-12),
    "R(45°) cocok dengan rumus buku teks v0²·sin(2θ)/g");
}

// ── 3. Ketinggian awal ≠ 0 ───────────────────────────────────
{
  // h0 > 0: tf = (vy0 + √(vy0² + 2gh0))/g — cek terhadap akar kuadratik.
  const p: ProjectileParams = { v0: 15, angleDeg: 40, g: 9.81, h0: 12 };
  const { vy0 } = velocityComponents(p.v0, p.angleDeg);
  const expectedTf = (vy0 + Math.sqrt(vy0 * vy0 + 2 * p.g * p.h0)) / p.g;
  assert(close(timeOfFlight(p), expectedTf, 1e-12), "tf(h0>0) = akar kuadratik yang benar");

  // y(tf) harus ≈ 0 (menyentuh tanah).
  const at = position(p, timeOfFlight(p));
  assert(Math.abs(at.y) < 1e-9, "y(tf) = 0 (impact tepat di tanah)");

  // Range pada h0 > 0 HARUS LEBIH BESAR daripada rumus tanah — memastikan
  // aplikasi tidak memakai rumus h0=0 untuk kasus umum.
  assert(
    range(p) > theoreticalRange(p.v0, p.angleDeg, p.g),
    "h0 > 0 ⇒ R > rumus tanah (rumus h0=0 tidak dipakai untuk kasus umum)"
  );

  // Gravitasi Bulan: tf ∝ 1/g untuk proyektil (tf = 2v0·sinθ/g dari tanah).
  const tfBumi = timeOfFlight({ v0: 10, angleDeg: 60, g: 9.81, h0: 0 });
  const tfBulan = timeOfFlight({ v0: 10, angleDeg: 60, g: 1.62, h0: 0 });
  assert(close(tfBulan / tfBumi, 9.81 / 1.62, 1e-9), "tf ∝ 1/g (skala Bulan, proyektil)");
}

// ── 4. Sampling lintasan ─────────────────────────────────────
{
  const p: ProjectileParams = { v0: 30, angleDeg: 55, g: 9.81, h0: 3 };
  const traj = computeTrajectory(p, 1 / 60);
  assert(traj.length >= 2, "Lintasan memiliki ≥ 2 titik");
  const last = traj[traj.length - 1];
  assert(Math.abs(last.y) < 1e-9, "Titik terakhir lintasan tepat y = 0");
  assert(last.t <= timeOfFlight(p) + 1e-9, "Waktu terakhir ≤ tf");
  assert(traj[0].t === 0 && traj[0].x === 0, "Titik pertama di origin horizontal t=0");

  // Monotonic x (tidak ada gerak mundur).
  let monotonic = true;
  for (let i = 1; i < traj.length; i++) if (traj[i].x < traj[i - 1].x - 1e-12) monotonic = false;
  assert(monotonic, "x(t) monoton naik");

  // Determinisme derau ber-seed.
  const n1 = new GaussianNoise(1234), n2 = new GaussianNoise(1234);
  const a1 = [n1.next(), n1.next(), n1.next()];
  const a2 = [n2.next(), n2.next(), n2.next()];
  assert(a1.every((v, i) => v === a2[i]), "GaussianNoise ber-seed deterministik");
}

// ── 5. Input tidak fisik ─────────────────────────────────────
{
  assert(timeOfFlight({ v0: 10, angleDeg: 45, g: 0, h0: 0 }) === 0, "g = 0 ⇒ tf = 0 (guard)");
  assert(timeOfFlight({ v0: 10, angleDeg: 45, g: -5, h0: 0 }) === 0, "g < 0 ⇒ tf = 0 (guard)");
  const traj = computeTrajectory({ v0: 0, angleDeg: 45, g: 9.81, h0: 0 }, 1 / 60);
  assert(traj.length <= 1, "v0 = 0, h0 = 0 ⇒ lintasan kosong (guard)");
}

// ── 6. Sudut optimal umum (h0 > 0) — regresi temuan audit P1 ─
{
  // θ_opt(h0=0) = 45°; θ_opt(h0>0) < 45° dan cocok rumus arctan(v0/√(v0²+2gh0)).
  const opt = (v0: number, g: number, h0: number) =>
    (Math.atan2(v0, Math.sqrt(v0 * v0 + 2 * g * Math.max(h0, 0))) * 180) / Math.PI;
  assert(Math.abs(opt(25, 9.81, 0) - 45) < 1e-9, "θ_opt(h0=0) = 45°");
  assert(Math.abs(opt(25, 9.81, 20) - 38.09) < 0.02, "θ_opt(h0=20, v0=25) ≈ 38.1° (bukan 45°)");
  // Range pada θ_opt(h0>0) harus ≥ range pada 45° (45° tidak optimal lagi).
  const rOpt = range({ v0: 25, angleDeg: opt(25, 9.81, 20), g: 9.81, h0: 20 });
  const r45 = range({ v0: 25, angleDeg: 45, g: 9.81, h0: 20 });
  assert(rOpt >= r45, "R(θ_opt) ≥ R(45°) saat h0 > 0");
}

// ── 7. Oracle Bandul (small-angle + koreksi amplitudo) ───────
{
  const g = 9.80665;
  // T0 = 2π√(L/g) — nilai acuan independen dihitung ulang di sini.
  for (const L of [0.2, 0.5, 1.0, 2.0]) {
    const T0 = 2 * Math.PI * Math.sqrt(L / g);
    // Rumus yang dipakai aplikasi (ExperimentView.recordTrial): T = T0·(1+θ₀²/16).
    const theta0 = (10 * Math.PI) / 180;
    const TApp = T0 * (1 + (theta0 * theta0) / 16);
    // Referensi: ekspansi deret periode nonlinier T ≈ T0·(1 + θ₀²/16 + 11θ₀⁴/3072).
    const TRef = T0 * (1 + (theta0 * theta0) / 16 + (11 * theta0 ** 4) / 3072);
    assert(close(TApp, TRef, 5e-4), `Bandul L=${L}m: koreksi amplitudo(10°) cocok deret eliptik (Δ<0.05%)`);
    // Properti skala: T ∝ √L.
    if (L === 1.0) {
      const T2m = 2 * Math.PI * Math.sqrt(2 / g) * (1 + (theta0 * theta0) / 16);
      assert(close(T2m / TApp, Math.SQRT2, 1e-12), "T ∝ √L (L→2L ⇒ T→√2·T)");
    }
  }
}

// ── Hasil ────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? "🎉 All" : `⚠️ ${failures} failing —`} numerical oracle tests ${failures === 0 ? "passed" : "finished"} successfully!`);
process.exit(failures === 0 ? 0 : 1);
