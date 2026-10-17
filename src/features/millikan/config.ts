import { MILLIKAN_CONSTANTS, calculateCunninghamFactor } from "./simulation/physics";

export const MODULE_TITLE = "Tetes Minyak Millikan";

export const REFLECTION_QUESTIONS = [
  { key: "q1", q: "Amati nilai muatan dari data tetesan minyak yang kamu teliti. Apakah nilainya tersebar bebas tanpa aturan, atau tampak memiliki pola kelipatan tertentu?" },
  { key: "q2", q: "Ketika kamu membagi nilai-nilai muatan tersebut dengan kandidat satuan dasar yang kamu uji, mengapa hasil baginya berkali-kali mendekati bilangan bulat?" },
  { key: "q3", q: "Mengapa di alam semesta kita tidak pernah menemukan tetesan minyak dengan muatan bernilai pecahan dari satuan dasar tersebut (misal 0.5 atau 1.5 kali)?" },
];

export const CONSTANTS = MILLIKAN_CONSTANTS;

export const cunninghamFactor = calculateCunninghamFactor;
