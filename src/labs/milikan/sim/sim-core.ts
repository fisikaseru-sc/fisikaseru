import {
  ElementaryChargeEstimate,
  MilikanComputationInput,
  MilikanComputationResult,
  MilikanMethod,
  Polarity,
  QFitRow,
} from "@/labs/milikan/sim/types";

const PI = Math.PI;
const EPS = 1e-30;

export function pressureHpaToPa(P_hPa: number) {
  return P_hPa * 100;
}

export function rhoOilAtTemperature(T_C: number, rho15: number, rho25: number) {
  return rho15 + ((T_C - 15) * (rho25 - rho15)) / 10;
}

export function computeObservationDistanceMeters(
  topMark_lines: number,
  bottomMark_lines: number,
  scaleDivision_mm_per_line: number,
  V_obj: number,
) {
  const S_lines = Math.abs(topMark_lines - bottomMark_lines);
  const S_mm = S_lines * scaleDivision_mm_per_line;
  const x_m = V_obj > 0 ? (S_mm / 1000) / V_obj : 0;
  return { S_lines, S_mm, x_m };
}

export function computeVelocities(x_m: number, t1_s: number | null, t2_s: number) {
  const v2_m_s = t2_s > 0 ? x_m / t2_s : Number.NaN;
  const v1_m_s = t1_s && t1_s > 0 ? x_m / t1_s : null;
  return { v1_m_s, v2_m_s };
}

export function computeRadius(rho_oil_kg_m3: number, rho_air_kg_m3: number, eta_Pa_s: number, v2_m_s: number, g_m_s2: number) {
  const rhoDiff = rho_oil_kg_m3 - rho_air_kg_m3;
  const inside = (9 * eta_Pa_s * v2_m_s) / (2 * rhoDiff * g_m_s2);
  return inside > 0 ? Math.sqrt(inside) : Number.NaN;
}

export function computeQFloating(
  d_mm: number,
  U_V: number,
  eta_used_Pa_s: number,
  v2_m_s: number,
  rho_oil_kg_m3: number,
  rho_air_kg_m3: number,
  g_m_s2: number,
) {
  if (U_V <= 0) {
    return null;
  }
  const rhoDiff = rho_oil_kg_m3 - rho_air_kg_m3;
  const d_m = d_mm / 1000;
  const inner = (2 * eta_used_Pa_s ** 3 * v2_m_s) / (3 * rhoDiff * g_m_s2);
  if (inner <= 0 || d_m <= 0) {
    return null;
  }
  return 9 * PI * (d_m / U_V) * Math.sqrt(inner);
}

export function computeQRisingFalling(
  d_mm: number,
  U_V: number,
  eta_used_Pa_s: number,
  v1_m_s: number | null,
  v2_m_s: number,
  rho_oil_kg_m3: number,
  rho_air_kg_m3: number,
  g_m_s2: number,
) {
  if (U_V <= 0 || v1_m_s === null) {
    return null;
  }
  const rhoDiff = rho_oil_kg_m3 - rho_air_kg_m3;
  const d_m = d_mm / 1000;
  const inner = (2 * eta_used_Pa_s ** 3 * v2_m_s) / (3 * rhoDiff * g_m_s2);
  if (inner <= 0 || d_m <= 0) {
    return null;
  }
  return 9 * PI * (d_m / U_V) * (v1_m_s + v2_m_s) * Math.sqrt(inner);
}

export function computeElectricField(U_V: number, d_mm: number, polarity: Polarity) {
  const d_m = d_mm / 1000;
  if (d_m <= 0) {
    return 0;
  }
  const E_unsigned = U_V / d_m;
  return polarity === "above" ? -E_unsigned : E_unsigned;
}

function correctionFactor(b: number, r_m: number, P_Pa: number) {
  const denom = Math.max(r_m * P_Pa, EPS);
  return 1 + b / denom;
}

function computeChargeByMethod(
  method: MilikanMethod,
  args: {
    d_mm: number;
    U_V: number;
    eta_used_Pa_s: number;
    v1_m_s: number | null;
    v2_m_s: number;
    rho_oil_kg_m3: number;
    rho_air_kg_m3: number;
    g_m_s2: number;
  },
) {
  if (method === "floating") {
    return computeQFloating(
      args.d_mm,
      args.U_V,
      args.eta_used_Pa_s,
      args.v2_m_s,
      args.rho_oil_kg_m3,
      args.rho_air_kg_m3,
      args.g_m_s2,
    );
  }
  return computeQRisingFalling(
    args.d_mm,
    args.U_V,
    args.eta_used_Pa_s,
    args.v1_m_s,
    args.v2_m_s,
    args.rho_oil_kg_m3,
    args.rho_air_kg_m3,
    args.g_m_s2,
  );
}

export function computeMilikanTrial(input: MilikanComputationInput): MilikanComputationResult {
  const P_Pa = pressureHpaToPa(input.P_hPa);
  const rho_oil_kg_m3 = rhoOilAtTemperature(
    input.T_C,
    input.rho_oil_kg_m3_at_15C,
    input.rho_oil_kg_m3_at_25C,
  );
  const distance = computeObservationDistanceMeters(
    input.topMark_lines,
    input.bottomMark_lines,
    input.scaleDivision_mm_per_line,
    input.V_obj,
  );
  const velocity = computeVelocities(distance.x_m, input.t1_s, input.t2_s);

  let eta_used_Pa_s = input.eta0_Pa_s;
  let r0_m = computeRadius(
    rho_oil_kg_m3,
    input.rho_air_kg_m3,
    eta_used_Pa_s,
    velocity.v2_m_s,
    input.g_m_s2,
  );
  let eta_c_Pa_s: number | null = null;

  if (input.cunningham_enabled && Number.isFinite(r0_m) && r0_m > 0) {
    for (let i = 0; i < 3; i += 1) {
      const factor = correctionFactor(input.cunningham_b, r0_m, P_Pa);
      eta_used_Pa_s = input.eta0_Pa_s * Math.pow(factor, -1);
      r0_m = computeRadius(
        rho_oil_kg_m3,
        input.rho_air_kg_m3,
        eta_used_Pa_s,
        velocity.v2_m_s,
        input.g_m_s2,
      );
    }
    eta_c_Pa_s = eta_used_Pa_s;
  }

  const q0_C = computeChargeByMethod(input.method, {
    d_mm: input.d_mm,
    U_V: input.U_V,
    eta_used_Pa_s,
    v1_m_s: velocity.v1_m_s,
    v2_m_s: velocity.v2_m_s,
    rho_oil_kg_m3,
    rho_air_kg_m3: input.rho_air_kg_m3,
    g_m_s2: input.g_m_s2,
  });

  let q_c_C: number | null = null;
  if (input.cunningham_enabled && q0_C !== null && Number.isFinite(r0_m) && r0_m > 0) {
    const factor = correctionFactor(input.cunningham_b, r0_m, P_Pa);
    q_c_C = q0_C * Math.pow(factor, -1.5);
  }

  return {
    P_Pa,
    rho_oil_kg_m3,
    S_lines: distance.S_lines,
    x_m: distance.x_m,
    v1_m_s: velocity.v1_m_s,
    v2_m_s: velocity.v2_m_s,
    r0_m,
    q0_C,
    eta_used_Pa_s,
    eta_c_Pa_s,
    q_c_C,
    q_display_C: q_c_C ?? q0_C,
  };
}

export function computeTerminalVelocityUp(args: {
  rho_oil_kg_m3: number;
  rho_air_kg_m3: number;
  g_m_s2: number;
  eta_Pa_s: number;
  radius_m: number;
  charge_C: number;
  U_V: number;
  d_mm: number;
  polarity: Polarity;
  voltageOn: boolean;
}) {
  const { radius_m } = args;
  const volume = (4 / 3) * PI * radius_m ** 3;
  const effectiveWeight_N = (args.rho_oil_kg_m3 - args.rho_air_kg_m3) * volume * args.g_m_s2;
  const drag = 6 * PI * args.eta_Pa_s * radius_m;

  let forceUp_N = -effectiveWeight_N;
  if (args.voltageOn && args.U_V > 0) {
    const E_up = computeElectricField(args.U_V, args.d_mm, args.polarity);
    forceUp_N += args.charge_C * E_up;
  }

  return forceUp_N / Math.max(drag, EPS);
}

export function estimateElementaryCharge(values: number[]): ElementaryChargeEstimate | null {
  const cleaned = values.filter((value) => Number.isFinite(value) && Math.abs(value) > 0);
  if (cleaned.length < 2) {
    return null;
  }

  const sorted = [...cleaned].sort((a, b) => Math.abs(a) - Math.abs(b));
  const abs = sorted.map((value) => Math.abs(value));
  const medianAbs = abs[Math.floor(abs.length / 2)] ?? 0;
  let e = medianAbs / 3;
  if (e <= 0) {
    return null;
  }

  const iterations = 3;
  let nVals = sorted.map((q) => {
    const n = Math.round(q / e);
    if (n === 0 && Math.abs(q) > 0) {
      return q > 0 ? 1 : -1;
    }
    return n;
  });

  for (let i = 0; i < iterations; i += 1) {
    const num = sorted.reduce((sum, q, index) => sum + nVals[index] * q, 0);
    const den = nVals.reduce((sum, n) => sum + n ** 2, 0);
    if (den === 0) {
      return null;
    }
    e = num / den;
    nVals = sorted.map((q) => {
      const n = Math.round(q / e);
      if (n === 0 && Math.abs(q) > 0) {
        return q > 0 ? 1 : -1;
      }
      return n;
    });
  }

  const rows: QFitRow[] = sorted.map((q, index) => {
    const residual_C = q - nVals[index] * e;
    return { q_C: q, n: nVals[index], residual_C };
  });

  const rmsResidual_C = Math.sqrt(
    rows.reduce((sum, row) => sum + row.residual_C ** 2, 0) / Math.max(rows.length, 1),
  );

  return {
    e_est_C: e,
    rows,
    rmsResidual_C,
  };
}
