import {
  assertTransitReady,
  assertOwnedCalculation,
  assertCalculableState,
  calculatedRunRecord,
  ownedFailureTarget,
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

Deno.test("failure target requires the current owner and a retryable run", () => {
  const run = {
    id: "calc-1",
    status: "FAILED",
    owner_user_id: "user-1",
    calculation_metadata: { creation_contract: "USER_CALCULATION_V2" },
  };
  const target = ownedFailureTarget(run, "user-1");
  if (target.id !== run.id || target.owner_user_id !== "user-1") {
    throw new Error("authorized failure target changed");
  }
  if (target.calculation_metadata?.creation_contract !== "USER_CALCULATION_V2") {
    throw new Error("failure target did not preserve calculation metadata");
  }
  const targetWithoutMetadata = ownedFailureTarget(
    { ...run, status: "PENDING", calculation_metadata: null },
    "user-1",
  );
  if (targetWithoutMetadata.calculation_metadata !== null) {
    throw new Error("missing calculation metadata must remain explicitly null");
  }

  for (const [candidate, userId] of [
    [{ ...run, owner_user_id: "user-2" }, "user-1"],
    [{ ...run, status: "CALCULATED" }, "user-1"],
  ] as const) {
    let failed = false;
    try {
      ownedFailureTarget(candidate, userId);
    } catch {
      failed = true;
    }
    if (!failed) throw new Error("failure target accepted an unauthorized or non-retryable run");
  }
});

Deno.test("transit requires a completed natal calculation", () => {
  assertTransitReady({ id: "calc-1", status: "CALCULATED" });
  for (const status of ["PENDING", "FAILED", "PROCESSING"]) {
    let failed = false;
    try {
      assertTransitReady({ id: "calc-1", status });
    } catch {
      failed = true;
    }
    if (!failed) throw new Error(`${status} calculation must not accept transit`);
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


Deno.test("calculated run record defaults missing metadata without changing audit fields", () => {
  const record = calculatedRunRecord({
    ayanamsaValue: 24.1,
    utcTimestamp: "2026-09-26T00:00:00.000Z",
    julianDay: 2460000.5,
    nodeMethod: "TRUE",
    calculationTimestamp: "2026-09-26T00:00:01.000Z",
  });
  if (record.node_method !== "TRUE") throw new Error("node method changed");
  if (record.calculation_metadata.calculation_state !== "CALCULATED") {
    throw new Error("default metadata contract failed");
  }
});
