// ============================================================
// FISIKASERU — MILLIKAN PHYSICS DOMAIN ENGINE
// Presisi Fisika Standar NIST & Lab Ilmiah
// ============================================================

export const MILLIKAN_CONSTANTS = {
  ETA: 1.81e-5,          // Viskositas dinamik udara (kg/(m·s)) pada 20°C
  RHO_OIL: 886,          // Massa jenis minyak parafin (kg/m³)
  RHO_AIR: 1.20,         // Massa jenis udara ruangan (kg/m³)
  G: 9.80665,            // Percepatan gravitasi standar (m/s²)
  E_CHARGE: 1.602176634e-19, // Muatan elementer elektron (C) — NIST 2018
  E_REF: 1.6022,         // Nilai referensi dalam unit ×10⁻¹⁹ C
  PLATE_D: 0.005,        // Jarak antar pelat kapasitor (m) = 5.0 mm
  STOKES_6PI: 6 * Math.PI,
  C_A: 1.257,            // Koefisien empiris Cunningham
  C_LAMBDA: 65e-9,       // Jarak bebas rata-rata molekul udara (m) = 65 nm
  RETICLE_DISTANCE: 1.0e-3, // Jarak skala mikroskop (m) = 1.0 mm
  HUMAN_REACTION_TIME: 0.15, // Ketidakpastian stopwatch mata manusia (s)
} as const;

/**
 * Faktor Koreksi Cunningham untuk droplet sub-mikron
 * Ketika ukuran tetes minyak mendekati jarak bebas rata-rata molekul udara,
 * udara tidak lagi berlaku seperti fluida kontinu penuh.
 * @param r_um Radius droplet dalam mikron (µm)
 */
export function calculateCunninghamFactor(r_um: number): number {
  if (r_um <= 0) return 1.0;
  const r_m = r_um * 1e-6;
  return 1 + (MILLIKAN_CONSTANTS.C_A * MILLIKAN_CONSTANTS.C_LAMBDA) / r_m;
}

/**
 * Menghitung gaya-gaya fisis dan kecepatan terminal droplet
 */
export function calculateMillikanKinematics(
  r_um: number,
  V: number,
  trueN: number,
  voltageOn: boolean
) {
  const r_m = r_um * 1e-6;
  const dRho = MILLIKAN_CONSTANTS.RHO_OIL - MILLIKAN_CONSTANTS.RHO_AIR;
  
  // Gaya gravitasi efektif (Berat dikurangi gaya apung Archimedes)
  const Fg = (4 / 3) * Math.PI * Math.pow(r_m, 3) * dRho * MILLIKAN_CONSTANTS.G;
  
  // Kecepatan terminal jatuh bebas (Stokes)
  const vf = Fg / (MILLIKAN_CONSTANTS.STOKES_6PI * MILLIKAN_CONSTANTS.ETA * r_m);

  // Gaya elektrostatik pelat: Fe = q * E = (n * e) * (V / d)
  const Fe = voltageOn && V > 0
    ? (trueN * MILLIKAN_CONSTANTS.E_CHARGE * V) / MILLIKAN_CONSTANTS.PLATE_D
    : 0;

  // Kecepatan terminal naik melawan gravitasi saat medan aktif
  const netUpwardForce = Fe - Fg;
  const vr = voltageOn && netUpwardForce > 0
    ? netUpwardForce / (MILLIKAN_CONSTANTS.STOKES_6PI * MILLIKAN_CONSTANTS.ETA * r_m)
    : 0;

  return {
    Fg,
    Fe,
    vf,
    vr,
    netUpwardForce,
    isSuspended: voltageOn && Math.abs(netUpwardForce) < 1e-16,
  };
}

/**
 * Menghitung muatan listrik droplet dari data observasi eksperimen (Stokes murni)
 * Rumus Dinamis: q = [6πηr(vf + vr)d] / V
 * @returns Nilai muatan dalam unit ×10⁻¹⁹ Coulomb
 */
export function calculateRawCharge(
  r_um: number,
  V: number,
  vf: number,
  vr: number
): number {
  if (V <= 0 || r_um <= 0) return 0;
  const r_m = r_um * 1e-6;
  const qCoulomb = 
    (MILLIKAN_CONSTANTS.STOKES_6PI * MILLIKAN_CONSTANTS.ETA * r_m * (vf + vr) * MILLIKAN_CONSTANTS.PLATE_D) / V;
  return qCoulomb * 1e19; // dikembalikan dalam orde 10^-19 C
}

/**
 * Tahap 1: Menghitung Jari-Jari (r) Tetesan Minyak dari Kecepatan Jatuh Bebas (v1)
 * Berdasarkan keseimbangan Stokes: m·g = 6πη·r·v1
 * r = sqrt((9·η·v1) / (2·(ρ_oil - ρ_air)·g))
 * @param vf_ms Kecepatan jatuh bebas terminal dalam m/s
 * @returns Radius dalam mikrometer (µm)
 */
export function calculateRadiusFromFallVelocity(vf_ms: number): number {
  if (vf_ms <= 0) return 0;
  const dRho = MILLIKAN_CONSTANTS.RHO_OIL - MILLIKAN_CONSTANTS.RHO_AIR;
  const r_m = Math.sqrt((9 * MILLIKAN_CONSTANTS.ETA * vf_ms) / (2 * dRho * MILLIKAN_CONSTANTS.G));
  return r_m * 1e6; // dalam µm
}

/**
 * Menghitung Massa (m) Tetesan Minyak dari Radius
 * m = ρ_oil · (4/3)·π·r³
 * @param r_um Radius dalam µm
 * @returns Massa dalam kg
 */
export function calculateMassFromRadius(r_um: number): number {
  if (r_um <= 0) return 0;
  const r_m = r_um * 1e-6;
  return MILLIKAN_CONSTANTS.RHO_OIL * (4 / 3) * Math.PI * Math.pow(r_m, 3);
}

/**
 * Kuat Medan Listrik Homogen di antara Dua Pelat Sejajar
 * E = V / d
 */
export function calculateElectricField(V: number, d = MILLIKAN_CONSTANTS.PLATE_D): number {
  if (d <= 0) return 0;
  return V / d;
}

/**
 * Tahap 2 (Metode Melayang/Seimbang): Menghitung Muatan (q) saat Minyak Diam (v2 = 0)
 * Gaya Listrik = Gaya Berat: q·E = m·g  ==>  q = (m·g·d) / V
 * @param r_um Radius droplet dalam µm
 * @param V Tegangan penyeimbang (Volt)
 * @returns Nilai muatan dalam unit ×10⁻¹⁹ Coulomb
 */
export function calculateBalancedCharge(
  r_um: number,
  V: number,
  d = MILLIKAN_CONSTANTS.PLATE_D
): number {
  if (V <= 0 || r_um <= 0) return 0;
  const r_m = r_um * 1e-6;
  const dRho = MILLIKAN_CONSTANTS.RHO_OIL - MILLIKAN_CONSTANTS.RHO_AIR;
  const Fg = (4 / 3) * Math.PI * Math.pow(r_m, 3) * dRho * MILLIKAN_CONSTANTS.G;
  const qCoulomb = (Fg * d) / V;
  return qCoulomb * 1e19;
}

/**
 * Menghitung Tegangan Penyeimbang Teoritis (Suspension Voltage)
 * Tegangan di mana tetesan tepat melayang diam (Fe = Fg)
 * V_balance = (Fg · d) / (n · e)
 */
export function calculateSuspensionVoltage(
  r_um: number,
  trueN: number,
  d = MILLIKAN_CONSTANTS.PLATE_D
): number {
  if (r_um <= 0 || trueN <= 0) return 0;
  const r_m = r_um * 1e-6;
  const dRho = MILLIKAN_CONSTANTS.RHO_OIL - MILLIKAN_CONSTANTS.RHO_AIR;
  const Fg = (4 / 3) * Math.PI * Math.pow(r_m, 3) * dRho * MILLIKAN_CONSTANTS.G;
  const q = trueN * MILLIKAN_CONSTANTS.E_CHARGE;
  return (Fg * d) / q;
}

/**
 * Estimasi ketidakpastian pengukuran relatif berdasarkan waktu reaksi stopwatch
 */
export function estimateTimingUncertainty(tf: number, tr: number): number {
  const dt = MILLIKAN_CONSTANTS.HUMAN_REACTION_TIME;
  const relTf = tf > 0 ? (2 * dt) / tf : 0.05;
  const relTr = tr > 0 && tr < 60 ? (2 * dt) / tr : 0.05;
  return Math.sqrt(Math.pow(relTf, 2) + Math.pow(relTr, 2));
}

export interface MillikanAnalysisResult {
  sufficientData: boolean;
  trialCount: number;
  sortedTrials: Array<any>;
  calculatedE_stokes: number | null;
  calculatedE_corr: number | null;
  stdDev: number;
  sem: number;
  errorPct_stokes: number | null;
  errorPct_corr: number | null;
  minQ: number;
  maxQ: number;
  evidenceSummary: string;
}

/**
 * SINGLE SOURCE OF TRUTH: Penurunan statistik dan bukti ilmiah Millikan
 * Menghindari duplikasi kalkulasi antara AnalysisView dan ReflectionPage.
 * Tidak pernah menggunakan fallback palsu 1.602 jika data belum cukup.
 */
export function deriveMillikanAnalysisResult(trials: any[]): MillikanAnalysisResult {
  if (!Array.isArray(trials) || trials.length === 0) {
    return {
      sufficientData: false,
      trialCount: 0,
      sortedTrials: [],
      calculatedE_stokes: null,
      calculatedE_corr: null,
      stdDev: 0,
      sem: 0,
      errorPct_stokes: null,
      errorPct_corr: null,
      minQ: 0,
      maxQ: 0,
      evidenceSummary: "Belum ada data observasi yang tercatat.",
    };
  }

  const sortedTrials = [...trials]
    .filter((t) => t && typeof t.q === "number" && !isNaN(t.q) && t.q > 0)
    .sort((a, b) => a.q - b.q)
    .map((t) => {
      const cf = t.cf || calculateCunninghamFactor(t.r || 1.5);
      const qCorr = t.qCorr || t.q * cf;
      const uncRel = t.uncRel || estimateTimingUncertainty(t.tf || 5, t.tr || 15);
      const n = t.hiddenN || t.n || Math.max(1, Math.round(t.q / MILLIKAN_CONSTANTS.E_REF));
      return {
        ...t,
        cf,
        qCorr,
        uncRel,
        n,
      };
    });

  const trialCount = sortedTrials.length;
  const sufficientData = trialCount >= 5;

  if (trialCount === 0) {
    return {
      sufficientData: false,
      trialCount: 0,
      sortedTrials: [],
      calculatedE_stokes: null,
      calculatedE_corr: null,
      stdDev: 0,
      sem: 0,
      errorPct_stokes: null,
      errorPct_corr: null,
      minQ: 0,
      maxQ: 0,
      evidenceSummary: "Data pengamatan tidak memiliki nilai muatan yang valid.",
    };
  }

  const validStokes = sortedTrials.filter((t) => t.n > 0 && t.q > 0);
  const calculatedE_stokes = validStokes.length > 0
    ? validStokes.reduce((sum, t) => sum + t.q / t.n, 0) / validStokes.length
    : null;

  const validCorr = sortedTrials.filter((t) => t.n > 0 && t.qCorr > 0);
  const calculatedE_corr = validCorr.length > 0
    ? validCorr.reduce((sum, t) => sum + t.qCorr / t.n, 0) / validCorr.length
    : null;

  let stdDev = 0;
  if (validCorr.length >= 2 && calculatedE_corr !== null) {
    const variance = validCorr.reduce((acc, t) => acc + Math.pow(t.qCorr / t.n - calculatedE_corr, 2), 0) / (validCorr.length - 1);
    stdDev = Math.sqrt(variance);
  }
  const sem = trialCount > 0 ? stdDev / Math.sqrt(trialCount) : 0;

  const errorPct_stokes = calculatedE_stokes !== null
    ? Math.abs((calculatedE_stokes - MILLIKAN_CONSTANTS.E_REF) / MILLIKAN_CONSTANTS.E_REF) * 100
    : null;

  const errorPct_corr = calculatedE_corr !== null
    ? Math.abs((calculatedE_corr - MILLIKAN_CONSTANTS.E_REF) / MILLIKAN_CONSTANTS.E_REF) * 100
    : null;

  const qValues = sortedTrials.map((t) => t.qCorr);
  const minQ = Math.min(...qValues);
  const maxQ = Math.max(...qValues);

  const evidenceSummary = `Terekam ${trialCount} tetes minyak dengan muatan terkoreksi berkisar antara ${minQ.toFixed(2)} hingga ${maxQ.toFixed(2)} × 10⁻¹⁹ C. Rata-rata estimasi satuan dasar terukur adalah ${calculatedE_corr !== null ? calculatedE_corr.toFixed(3) : "—"} × 10⁻¹⁹ C.`;

  return {
    sufficientData,
    trialCount,
    sortedTrials,
    calculatedE_stokes,
    calculatedE_corr,
    stdDev,
    sem,
    errorPct_stokes,
    errorPct_corr,
    minQ,
    maxQ,
    evidenceSummary,
  };
}

