// ============================================================
// FISIKASERU — MILLIKAN SCIENTIFIC DATA GENERATOR
// Menghasilkan data eksperimen realistis dengan variasi noise fisik terkontrol
// ============================================================

import { DropletSpec, MillikanTrial } from "../types";
import { 
  MILLIKAN_CONSTANTS, 
  calculateMillikanKinematics, 
  calculateRawCharge, 
  calculateCunninghamFactor, 
  estimateTimingUncertainty 
} from "./physics";

/**
 * Generator pseudo-random berbasis Linear Congruential Generator (LCG)
 * Memastikan reproducibility jika menggunakan seed
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  gaussian(mean: number, std: number): number {
    const u1 = this.next() || 1e-10;
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  }
}

const defaultRng = new SeededRandom(Date.now() % 100000);

/**
 * Membuat droplet baru dengan identitas realistis
 */
export function generateDropletIdentity(dropIndex: number, rng: SeededRandom = defaultRng): DropletSpec {
  const padIndex = String(dropIndex).padStart(2, "0");
  
  // Radius realistis tetesan minyak Millikan teramati (0.80 µm hingga 1.15 µm)
  // Menjamin kesetimbangan Fe > Fg pada rentang tegangan lab (300V - 500V)
  const baseRadius = 0.80 + rng.next() * 0.35; 
  const radiusUm = parseFloat(baseRadius.toFixed(2));
  
  // Jumlah muatan elementer (2e sampai 6e)
  // Distribusi probabilitas menyerupai ionisasi udara nyata
  const chargeDistribution = [2, 2, 3, 3, 3, 4, 4, 5, 5, 6];
  const trueN = chargeDistribution[Math.floor(rng.next() * chargeDistribution.length)];

  return {
    id: dropIndex,
    label: `Drop #${padIndex}`,
    radiusUm,
    trueN,
  };
}

/**
 * Menghasilkan hasil pengukuran eksperimen untuk satu droplet
 */
export function recordDropletMeasurement(params: {
  trialId: number;
  droplet: DropletSpec;
  voltage: number;
  voltageOn: boolean;
  rng?: SeededRandom;
}): MillikanTrial {
  const { trialId, droplet, voltage, voltageOn } = params;
  const rng = params.rng || defaultRng;

  const { vf, vr } = calculateMillikanKinematics(
    droplet.radiusUm,
    voltage,
    droplet.trueN,
    voltageOn
  );

  const d = MILLIKAN_CONSTANTS.RETICLE_DISTANCE; // 1.0 mm

  // Waktu teoritis jatuh dan naik melintasi 1.0 mm
  const tfTrue = vf > 0 ? d / vf : 999;
  const trTrue = vr > 1e-7 ? d / vr : 999;

  // Terapkan noise realistis (standar deviasi ~1.5% karena waktu reaksi stopwatch & fluktuasi Brownian)
  const tfObs = parseFloat(rng.gaussian(tfTrue, tfTrue * 0.015).toFixed(2));
  const trObs = trTrue < 200 
    ? parseFloat(rng.gaussian(trTrue, trTrue * 0.018).toFixed(2))
    : 999;

  const vfObs = d / tfObs;
  const vrObs = trObs < 200 ? d / trObs : 0;

  // Hitung muatan teramati (Stokes raw)
  const rawQ = calculateRawCharge(droplet.radiusUm, voltage, vfObs, vrObs);
  const cf = calculateCunninghamFactor(droplet.radiusUm);
  const qCorr = rawQ * cf;
  const uncRel = estimateTimingUncertainty(tfObs, trObs);

  return {
    id: trialId,
    dropletLabel: droplet.label,
    r: droplet.radiusUm,
    V: voltage,
    tf: tfObs,
    tr: trObs,
    vf: vfObs,
    vr: vrObs,
    q: parseFloat(rawQ.toFixed(3)),
    cf: parseFloat(cf.toFixed(4)),
    qCorr: parseFloat(qCorr.toFixed(3)),
    uncRel: parseFloat(uncRel.toFixed(3)),
    hiddenN: droplet.trueN,
    createdAt: Date.now(),
  };
}
