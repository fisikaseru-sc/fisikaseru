import {
  computeMilikanTrial,
  computeObservationDistanceMeters,
  computeQRisingFalling,
  computeVelocities,
  estimateElementaryCharge,
  pressureHpaToPa,
  rhoOilAtTemperature,
} from "@/labs/milikan/sim/sim-core";

describe("Milikan core calculations", () => {
  it("converts pressure hPa to Pa", () => {
    expect(pressureHpaToPa(1013.23)).toBeCloseTo(101323, 6);
  });

  it("interpolates rho_oil linearly", () => {
    const rho = rhoOilAtTemperature(20, 877, 871);
    expect(rho).toBeCloseTo(874, 6);
  });

  it("computes observation distance and velocities", () => {
    const dist = computeObservationDistanceMeters(0, 20, 0.1, 2);
    expect(dist.S_lines).toBe(20);
    expect(dist.x_m).toBeCloseTo(0.001, 8);

    const v = computeVelocities(dist.x_m, 8, 10);
    expect(v.v1_m_s).toBeCloseTo(0.000125, 10);
    expect(v.v2_m_s).toBeCloseTo(0.0001, 10);
  });

  it("computes q rising/falling", () => {
    const q = computeQRisingFalling(3, 250, 1.85e-5, 0.00013, 0.0001, 871, 1.293, 9.81);
    expect(q).not.toBeNull();
    expect(Math.abs(q ?? 0)).toBeGreaterThan(1e-21);
  });

  it("applies cunningham and returns null q when U=0", () => {
    const result = computeMilikanTrial({
      method: "floating",
      U_V: 0,
      polarity: "above",
      d_mm: 3,
      V_obj: 2,
      g_m_s2: 9.81,
      topMark_lines: 0,
      bottomMark_lines: 20,
      scaleDivision_mm_per_line: 0.1,
      t1_s: null,
      t2_s: 8,
      T_C: 25,
      P_hPa: 1013.23,
      eta0_Pa_s: 1.85e-5,
      rho_air_kg_m3: 1.293,
      rho_oil_kg_m3_at_15C: 877,
      rho_oil_kg_m3_at_25C: 871,
      cunningham_enabled: true,
      cunningham_b: 6.17e-4,
    });

    expect(result.q0_C).toBeNull();
    expect(result.q_display_C).toBeNull();
    expect(result.eta_c_Pa_s).not.toBeNull();
  });

  it("estimates e from quantized charges", () => {
    const e = 1.6e-19;
    const values = [1, 2, 3, 4, 5, 6].map((n) => n * e * (1 + (n % 2 === 0 ? 0.02 : -0.01)));

    const estimate = estimateElementaryCharge(values);
    expect(estimate).not.toBeNull();
    expect(Math.abs((estimate?.e_est_C ?? 0) - e)).toBeLessThan(0.5e-19);
    expect((estimate?.rows.length ?? 0) > 0).toBe(true);
  });
});
