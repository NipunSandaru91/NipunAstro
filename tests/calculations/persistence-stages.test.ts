import {
  PERSISTENCE_STAGES,
  isPersistenceStage,
  persistenceFailureRecord,
} from "../../supabase/functions/jyotisha-calculator/orchestration.ts";

Deno.test("persistence stage registry covers deterministic materialization pipeline", () => {
  const required = [
    "persist_calculation_temporal_inputs",
    "clear_previous_position_rows",
    "insert_graha_positions",
    "insert_lagna_position",
    "insert_varga_positions",
    "insert_calculation_bhavas",
    "insert_drishti_data",
    "evaluate_yoga_rules",
    "materialize_vimshottari_dasha",
    "materialize_shadbala",
    "insert_varga_lagna_positions",
    "finalize_calculation_run",
    "clear_transit_snapshot",
    "insert_transit_positions",
  ];
  for (const stage of required) {
    if (!PERSISTENCE_STAGES.includes(stage as never)) throw new Error("missing stage: " + stage);
    if (!isPersistenceStage(stage)) throw new Error("stage guard rejected: " + stage);
  }
  if (isPersistenceStage("planet_calculation")) throw new Error("calculation stage is not persistence");
});

Deno.test("persistence failure record preserves exact materialization stage", () => {
  const record = persistenceFailureRecord(
    "materialize_shadbala",
    new Error("rpc failed"),
  );
  if (record.status !== "FAILED") throw new Error("failure status missing");
  if (record.calculation_metadata.last_failed_stage !== "materialize_shadbala") {
    throw new Error("materialization stage lost");
  }
  const parsed = JSON.parse(record.error_message);
  if (parsed.error.message !== "rpc failed") throw new Error("failure evidence lost");
});

Deno.test("persistence failure record rejects non-persistence stages", () => {
  let failed = false;
  try {
    persistenceFailureRecord("planet_calculation", new Error("boom"));
  } catch (error) {
    failed = error instanceof Error && error.message === "UNKNOWN_PERSISTENCE_STAGE";
  }
  if (!failed) throw new Error("non-persistence stage must be rejected");
});
