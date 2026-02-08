import {
  createInitialControllerState,
  MilikanRuntimeParams,
  startFloatingSequence,
  startRisingFallingSequence,
  tickController,
} from "@/labs/milikan/sim/controller";

export const DEFAULT_QC_PARAMS: MilikanRuntimeParams = {
  method: "rising_falling",
  U_V: 250,
  polarity: "above",
  d_mm: 3,
  V_obj: 2,
  g_m_s2: 9.81,
  scaleDivision_mm_per_line: 0.1,
  topMark_lines: 0,
  bottomMark_lines: 20,
  T_C: 25,
  P_hPa: 1013.23,
  eta0_Pa_s: 1.85e-5,
  rho_air_kg_m3: 1.293,
  rho_oil_kg_m3_at_15C: 877,
  rho_oil_kg_m3_at_25C: 871,
  cunningham_enabled: true,
  cunningham_b: 6.17e-4,
};

export function scenarioPolarityHint() {
  let state = createInitialControllerState(DEFAULT_QC_PARAMS, {
    droplets: [{ id: "qc-drop", radius_m: 0.8e-6, charge_C: -8.0e-19 }],
  });
  state = {
    ...state,
    selectedDropletId: "qc-drop",
    voltageOn: true,
  };
  for (let i = 0; i < 60; i += 1) {
    state = tickController(state, { ...DEFAULT_QC_PARAMS, polarity: "below" }, 0.05);
  }

  const wrongPolarityShowsHint = state.hints.some((hint) => hint.includes("balik polarity"));

  let correctedState = state;
  for (let i = 0; i < 60; i += 1) {
    correctedState = tickController(correctedState, { ...DEFAULT_QC_PARAMS, polarity: "above" }, 0.05);
  }

  return {
    wrongPolarityShowsHint,
    velocityAfterFix_m_s: correctedState.velocity_up_m_s,
  };
}

export function scenarioRisingFallingTimerSequence() {
  const params: MilikanRuntimeParams = {
    ...DEFAULT_QC_PARAMS,
    U_V: 420,
    polarity: "above",
  };
  let state = createInitialControllerState(params, {
    droplets: [{ id: "qc-drop", radius_m: 0.85e-6, charge_C: -9.0e-19 }],
  });
  state = {
    ...state,
    selectedDropletId: "qc-drop",
  };
  state = startRisingFallingSequence(state, params);
  for (let i = 0; i < 1200; i += 1) {
    state = tickController(state, params, 0.05);
    if (state.sequencePhase === "done") {
      break;
    }
  }
  return {
    phase: state.sequencePhase,
    t1_s: state.t1_s,
    t2_s: state.t2_s,
    saveEnabled: state.saveEnabled,
  };
}

export function scenarioFloatingStability() {
  const floatingParams: MilikanRuntimeParams = {
    ...DEFAULT_QC_PARAMS,
    method: "floating",
    U_V: 120,
    polarity: "above",
  };
  let state = createInitialControllerState(floatingParams, {
    droplets: [{ id: "qc-drop", radius_m: 0.9e-6, charge_C: -6.2e-19 }],
  });
  state = { ...state, selectedDropletId: "qc-drop", voltageOn: true };

  for (let i = 0; i < 180; i += 1) {
    state = tickController(state, floatingParams, 0.05);
  }

  const stableBeforeCapture = state.isStable;
  state = startFloatingSequence(state, floatingParams);

  for (let i = 0; i < 600; i += 1) {
    state = tickController(state, floatingParams, 0.05);
    if (state.sequencePhase === "done") {
      break;
    }
  }

  return {
    stableBeforeCapture,
    t2_s: state.t2_s,
    done: state.sequencePhase === "done",
  };
}
