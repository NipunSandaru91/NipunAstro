import {
  ownedFailureTarget,
  calculationFailureRecord,
  persistenceFailureRecord,
  errorInfo,
  assertTransitReady,
} from "../../supabase/functions/jyotisha-calculator/orchestration.ts";

Deno.test("failure target requires the authenticated owner and a retryable run", () => {
  const run = {
    id: "calculation-1",
    owner_user_id: "owner-1",
    status: "PENDING",
    calculation_metadata: { standard_code: "VEDIC_LAHIRI", source: "birth-form" },
  };
  const target = ownedFailureTarget(run, "owner-1");
  if (target.id !== run.id || target.owner_user_id !== "owner-1") {
    throw new Error("wrong authorized failure target");
  }
  for (const [invalid, actor] of [
    [null, "owner-1"],
    [run, "another-user"],
    [{ ...run, status: "CALCULATED" }, "owner-1"],
  ] as const) {
    let rejected = false;
    try { ownedFailureTarget(invalid, actor); } catch { rejected = true; }
    if (!rejected) throw new Error("unowned or completed run accepted");
  }
});

Deno.test("transit requires a calculated owned chart", () => {
  assertTransitReady({ id: "calculation-1", owner_user_id: "owner-1", status: "CALCULATED" });
  for (const run of [null, { id: "calculation-1", status: "FAILED" }]) {
    let rejected = false;
    try { assertTransitReady(run); } catch { rejected = true; }
    if (!rejected) throw new Error("transit accepted a missing or unfinished chart");
  }
});

Deno.test("failure records preserve original calculation audit metadata", () => {
  const original = { standard_code: "VEDIC_LAHIRI", source: "birth-form" };
  const info = errorInfo(new Error("ephemeris failed"));
  const failure = calculationFailureRecord("planet_calculation", info, original);
  const partial = persistenceFailureRecord("insert_graha_positions", new Error("insert failed"), original);
  if (failure.status !== "FAILED" || partial.status !== "FAILED" ||
      failure.calculation_metadata.standard_code !== "VEDIC_LAHIRI" ||
      partial.calculation_metadata.source !== "birth-form" ||
      failure.calculation_metadata.last_failed_stage !== "planet_calculation" ||
      partial.calculation_metadata.last_failed_stage !== "insert_graha_positions" ||
      Object.hasOwn(original, "last_failed_stage")) {
    throw new Error("failure metadata was lost or source metadata was mutated");
  }
});
