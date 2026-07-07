export const MODULE_TITLE = "Tetes Minyak Millikan";

export const REFLECTION_QUESTIONS = [
  { key: "q1", q: "Amati nilai muatan q dari semua trialmu. Apakah nilainya tersebar bebas (seperti 1.3, 2.7, 5.9), atau mengelompok di nilai-nilai tertentu?" },
  { key: "q2", q: "Nilai-nilai q berkumpul di sekitar 4.8, 6.4, dan 8.0 ×10⁻¹⁹ C. Apa bilangan pembagi terkecil yang menghasilkan sisa paling mendekati nol?" },
  { key: "q3", q: "Bilangan pembagi terkecil itu ≈ 1.6 ×10⁻¹⁹ C — muatan satu elektron. Mengapa tidak pernah ada muatan bernilai 0.5e atau 1.5e di alam?" },
];

export const CONSTANTS = {
  ETA: 1.81e-5,
  RHO_OIL: 886,
  RHO_AIR: 1.20,
  G: 9.80665,
  E_CHARGE: 1.602e-19,
  PLATE_D: 0.005,
  STOKES_6PI: 6 * Math.PI,
  C_A: 1.257,
  C_LAMBDA: 0.068,
  E_REF: 1.6022
};

export function cunninghamFactor(r_um: number): number { 
  return 1 + CONSTANTS.C_A * CONSTANTS.C_LAMBDA / (r_um * 1e-6); 
}
