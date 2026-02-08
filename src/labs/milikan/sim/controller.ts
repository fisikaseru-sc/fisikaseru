import { computeMilikanTrial, computeTerminalVelocityUp } from "@/labs/milikan/sim/sim-core";
import { MilikanComputationInput, MilikanDroplet, MilikanMethod, MilikanTrialRow, Polarity } from "@/labs/milikan/sim/types";

const ELEMENTARY_CHARGE = 1.602176634e-19;

export type SequencePhase =
  | "idle"
  | "measuring_t2"
  | "measuring_t1"
  | "floating_t2"
  | "done";

export interface MilikanRuntimeParams {
  method: MilikanMethod;
  U_V: number;
  polarity: Polarity;
  d_mm: number;
  V_obj: number;
  g_m_s2: number;
  scaleDivision_mm_per_line: number;
  topMark_lines: number;
  bottomMark_lines: number;
  T_C: number;
  P_hPa: number;
  eta0_Pa_s: number;
  rho_air_kg_m3: number;
  rho_oil_kg_m3_at_15C: number;
  rho_oil_kg_m3_at_25C: number;
  cunningham_enabled: boolean;
  cunningham_b: number;
}

export interface MilikanControllerState {
  droplets: MilikanDroplet[];
  selectedDropletId: string | null;
  position_lines: number;
  velocity_up_m_s: number;
  voltageOn: boolean;
  timerOn: boolean;
  focus: number;
  lightIntensity: number;
  t1_s: number | null;
  t2_s: number | null;
  phaseElapsed_s: number;
  sequencePhase: SequencePhase;
  stableDuration_s: number;
  isStable: boolean;
  hints: string[];
  saveEnabled: boolean;
}

function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) {
    s += 2147483646;
  }
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function sprayDroplets(count = 8, seed = Date.now()): MilikanDroplet[] {
  const random = seeded(seed);
  const droplets: MilikanDroplet[] = [];
  for (let i = 0; i < count; i += 1) {
    const radius_m = 0.6e-6 + random() * 0.7e-6;
    const n = Math.floor(1 + random() * 9);
    const sign = random() < 0.75 ? -1 : 1;
    const noise = 1 + (random() - 0.5) * 0.12;
    const charge_C = sign * n * ELEMENTARY_CHARGE * noise;
    droplets.push({ id: `drop-${i + 1}`, radius_m, charge_C });
  }
  return droplets;
}

export function createInitialControllerState(
  params: MilikanRuntimeParams,
  options?: { seed?: number; droplets?: MilikanDroplet[] },
): MilikanControllerState {
  const droplets = options?.droplets ?? sprayDroplets(8, options?.seed ?? Date.now());
  return {
    droplets,
    selectedDropletId: droplets[0]?.id ?? null,
    position_lines: params.topMark_lines,
    velocity_up_m_s: 0,
    voltageOn: params.method === "floating",
    timerOn: false,
    focus: 75,
    lightIntensity: 65,
    t1_s: null,
    t2_s: null,
    phaseElapsed_s: 0,
    sequencePhase: "idle",
    stableDuration_s: 0,
    isStable: false,
    hints: [],
    saveEnabled: false,
  };
}

function selectedDroplet(state: MilikanControllerState) {
  return state.droplets.find((droplet) => droplet.id === state.selectedDropletId) ?? null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function updateHints(
  state: MilikanControllerState,
  params: MilikanRuntimeParams,
  velocity_up_m_s: number,
): string[] {
  const hints: string[] = [];

  if (params.U_V > 0 && state.voltageOn && velocity_up_m_s < 0) {
    hints.push("Tetes tetap turun saat U ON. Coba balik polarity (Above ↔ Below).");
  }

  if (!state.voltageOn && Math.abs(velocity_up_m_s) > 1e-3) {
    hints.push("Tetes terlalu cepat. Pilih droplet lain agar timing lebih akurat.");
  }

  if (Math.abs(params.topMark_lines - params.bottomMark_lines) < 5) {
    hints.push("Pisahkan topMark dan bottomMark minimal 5 garis.");
  }

  return hints;
}

function updateSaveEnabled(state: MilikanControllerState, params: MilikanRuntimeParams) {
  const separation = Math.abs(params.topMark_lines - params.bottomMark_lines);
  if (params.U_V <= 0 || separation <= 0) {
    return false;
  }
  if (params.method === "floating") {
    return state.sequencePhase === "done" && state.t2_s !== null && state.t2_s > 0;
  }
  return (
    state.sequencePhase === "done" &&
    state.t1_s !== null &&
    state.t1_s > 0 &&
    state.t2_s !== null &&
    state.t2_s > 0
  );
}

export function resetTimerState(state: MilikanControllerState, params: MilikanRuntimeParams): MilikanControllerState {
  return {
    ...state,
    timerOn: false,
    t1_s: null,
    t2_s: null,
    phaseElapsed_s: 0,
    sequencePhase: "idle",
    saveEnabled: false,
    position_lines: params.method === "rising_falling" ? params.topMark_lines : state.position_lines,
  };
}

export function startRisingFallingSequence(
  state: MilikanControllerState,
  params: MilikanRuntimeParams,
): MilikanControllerState {
  if (params.method !== "rising_falling") {
    return state;
  }
  return {
    ...state,
    voltageOn: false,
    timerOn: true,
    sequencePhase: "measuring_t2",
    t1_s: null,
    t2_s: null,
    phaseElapsed_s: 0,
    position_lines: params.topMark_lines,
    saveEnabled: false,
  };
}

export function startFloatingSequence(
  state: MilikanControllerState,
  params: MilikanRuntimeParams,
): MilikanControllerState {
  if (params.method !== "floating" || !state.isStable) {
    return state;
  }
  return {
    ...state,
    voltageOn: false,
    timerOn: true,
    sequencePhase: "floating_t2",
    t1_s: null,
    t2_s: null,
    phaseElapsed_s: 0,
    saveEnabled: false,
  };
}

export function tickController(
  prevState: MilikanControllerState,
  params: MilikanRuntimeParams,
  dt_s: number,
): MilikanControllerState {
  const droplet = selectedDroplet(prevState);
  if (!droplet) {
    return prevState;
  }

  const velocity_up_m_s = computeTerminalVelocityUp({
    rho_oil_kg_m3: params.rho_oil_kg_m3_at_25C,
    rho_air_kg_m3: params.rho_air_kg_m3,
    g_m_s2: params.g_m_s2,
    eta_Pa_s: params.eta0_Pa_s,
    radius_m: droplet.radius_m,
    charge_C: droplet.charge_C,
    U_V: params.U_V,
    d_mm: params.d_mm,
    polarity: params.polarity,
    voltageOn: prevState.voltageOn,
  });

  const linesPerMeter = (params.V_obj * 1000) / Math.max(params.scaleDivision_mm_per_line, 1e-6);
  const dy_lines = -velocity_up_m_s * linesPerMeter * dt_s;
  const prevPos = prevState.position_lines;
  let nextPos = clamp(prevPos + dy_lines, -20, 120);

  const nextState: MilikanControllerState = {
    ...prevState,
    velocity_up_m_s,
    position_lines: nextPos,
    phaseElapsed_s: prevState.phaseElapsed_s + dt_s,
  };

  if (nextState.voltageOn && Math.abs(velocity_up_m_s) < 4e-6) {
    nextState.stableDuration_s += dt_s;
  } else {
    nextState.stableDuration_s = 0;
  }
  nextState.isStable = nextState.stableDuration_s >= 1.5;

  const top = Math.min(params.topMark_lines, params.bottomMark_lines);
  const bottom = Math.max(params.topMark_lines, params.bottomMark_lines);

  if (nextState.sequencePhase === "measuring_t2") {
    const crossedBottom = prevPos < bottom && nextPos >= bottom;
    if (crossedBottom) {
      nextState.t2_s = nextState.phaseElapsed_s;
      nextState.sequencePhase = "measuring_t1";
      nextState.phaseElapsed_s = 0;
      nextState.position_lines = bottom;
      nextState.voltageOn = true;
      nextPos = bottom;
    }
  } else if (nextState.sequencePhase === "measuring_t1") {
    const crossedTop = prevPos > top && nextPos <= top;
    if (crossedTop) {
      nextState.t1_s = nextState.phaseElapsed_s;
      nextState.sequencePhase = "done";
      nextState.timerOn = false;
      nextState.phaseElapsed_s = 0;
      nextState.position_lines = top;
      nextState.voltageOn = false;
      nextPos = top;
    }
  } else if (nextState.sequencePhase === "floating_t2") {
    const crossedBottom = prevPos < bottom && nextPos >= bottom;
    if (crossedBottom) {
      nextState.t2_s = nextState.phaseElapsed_s;
      nextState.sequencePhase = "done";
      nextState.timerOn = false;
      nextState.phaseElapsed_s = 0;
      nextState.position_lines = bottom;
    }
  }

  nextState.hints = updateHints(nextState, params, velocity_up_m_s);
  nextState.saveEnabled = updateSaveEnabled(nextState, params);

  return nextState;
}

export function buildTrialRowFromController(
  state: MilikanControllerState,
  params: MilikanRuntimeParams,
): MilikanTrialRow | null {
  const droplet = selectedDroplet(state);
  if (!droplet || !state.saveEnabled || state.t2_s === null) {
    return null;
  }

  const trialInput: MilikanComputationInput = {
    method: params.method,
    U_V: params.U_V,
    polarity: params.polarity,
    d_mm: params.d_mm,
    V_obj: params.V_obj,
    g_m_s2: params.g_m_s2,
    topMark_lines: params.topMark_lines,
    bottomMark_lines: params.bottomMark_lines,
    scaleDivision_mm_per_line: params.scaleDivision_mm_per_line,
    t1_s: params.method === "rising_falling" ? state.t1_s : null,
    t2_s: state.t2_s,
    T_C: params.T_C,
    P_hPa: params.P_hPa,
    eta0_Pa_s: params.eta0_Pa_s,
    rho_air_kg_m3: params.rho_air_kg_m3,
    rho_oil_kg_m3_at_15C: params.rho_oil_kg_m3_at_15C,
    rho_oil_kg_m3_at_25C: params.rho_oil_kg_m3_at_25C,
    cunningham_enabled: params.cunningham_enabled,
    cunningham_b: params.cunningham_b,
  };

  const computed = computeMilikanTrial(trialInput);
  if (computed.q0_C === null) {
    return null;
  }

  return {
    trialId: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestampISO: new Date().toISOString(),
    method: params.method,
    dropletId: droplet.id,
    U_V: params.U_V,
    polarity: params.polarity,
    topMark_lines: params.topMark_lines,
    bottomMark_lines: params.bottomMark_lines,
    S_lines: computed.S_lines,
    scaleDivision_mm_per_line: params.scaleDivision_mm_per_line,
    V_obj: params.V_obj,
    x_m: computed.x_m,
    t1_s: params.method === "rising_falling" ? state.t1_s : null,
    t2_s: state.t2_s,
    T_C: params.T_C,
    P_Pa: computed.P_Pa,
    eta0_Pa_s: params.eta0_Pa_s,
    eta_used_Pa_s: computed.eta_used_Pa_s,
    rho_oil_kg_m3: computed.rho_oil_kg_m3,
    rho_air_kg_m3: params.rho_air_kg_m3,
    v1_m_s: computed.v1_m_s,
    v2_m_s: computed.v2_m_s,
    r0_m: computed.r0_m,
    q0_C: computed.q0_C,
    cunningham_enabled: params.cunningham_enabled,
    cunningham_b: params.cunningham_b,
    eta_c_Pa_s: computed.eta_c_Pa_s,
    q_c_C: computed.q_c_C,
    notes: null,
  };
}
