import {
  scenarioFloatingStability,
  scenarioPolarityHint,
  scenarioRisingFallingTimerSequence,
} from "@/labs/milikan/qc/scenarios";

describe("Milikan controller scenarios", () => {
  it("shows polarity hint when direction is wrong and improves after fix", () => {
    const result = scenarioPolarityHint();
    expect(result.wrongPolarityShowsHint).toBe(true);
    expect(result.velocityAfterFix_m_s).toBeGreaterThan(-1e-4);
  });

  it("executes rising/falling timer sequence and enables save", () => {
    const result = scenarioRisingFallingTimerSequence();
    expect(result.phase).toBe("done");
    expect((result.t2_s ?? 0) > 0).toBe(true);
    expect((result.t1_s ?? 0) > 0).toBe(true);
    expect(result.saveEnabled).toBe(true);
  });

  it("detects floating stability before capture", () => {
    const result = scenarioFloatingStability();
    expect(result.stableBeforeCapture).toBe(true);
    expect(result.done).toBe(true);
    expect((result.t2_s ?? 0) > 0).toBe(true);
  });
});
