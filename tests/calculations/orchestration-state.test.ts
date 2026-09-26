import {
  assertOwnedCalculation,
  assertCalculableState,
  calculatedRunRecord,
} from "../../supabase/functions/jyotisha-calculator/orchestration.ts";

Deno.test("owned calculation guard returns the run", () => {
  const run = { id: "calc-1", status: "PENDING", owner_user_id: "user-1" };
  if (assertOwnedCalculation(run).id !== "calc-1") throw new Error("owned run not returned");
});

Deno.test("owned calculation guard rejects missing rows", () => {
  let failed = false;
  try { assertOwnedCalculation(null); } catch (error) {
    failed = error instanceof Error &&
      error.message === "calculation_id not found or not owned by current user";
  }
  if (!failed) throw new Error("missing owned calculation must fail");
});

Deno.test("calculable state accepts PENDING and FAILED only", () => {
  assertCalculableState("PENDING");
  assertCalculableState("FAILED");
  for (const state of ["CALCULATED", "RUNNING", "UNKNOWN"]) {
    let failed = false;
    try { assertCalculableState(state); } catch (error) {
      failed = error instanceof Error &&
        error.message === "calculation is not in a calculable state";
    }
    if (!failed) throw new Error(state + " must not be calculable");
  }
});

Deno.test("calculated run record preserves engine audit and existing metadata", () => {
  const record = calculatedRunRecord({
    existingMetadata: { source: "user" },
    ayanamsaValue: 24.1,
    utcTimestamp: "2026-09-26T00:00:00.000Z",
    julianDay: 2460000.5,
    nodeMethod: "MEAN",
    calculationTimestamp: "2026-09-26T00:00:01.000Z",
  });
  if (record.status !== "CALCULATED" || record.error_message !== null) {
    throw new Error("success state contract failed");
  }
  if (record.calculation_metadata.source !== "user" ||
      record.calculation_metadata.calculation_state !== "CALCULATED") {
    throw new Error("metadata was not preserved");
  }
  if (record.ayanamsa !== "LAHIRI" || record.zodiac_type !== "SIDEREAL" ||
      record.house_system !== "WHOLE_SIGN") {
    throw new Error("calculation audit contract changed");
  }
});
