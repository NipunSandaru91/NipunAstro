export type ErrorInfo = {
  name: string;
  message: string;
  code: unknown;
  details: unknown;
  hint: unknown;
};

export function authorizationToken(header: string | null): string {
  if (!header?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("AUTH_REQUIRED");
  return token;
}

export function isCalculationUuid(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

export function errorInfo(error: unknown): ErrorInfo {
  const value = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    details?: unknown;
    hint?: unknown;
  } | null;

  return {
    name: typeof value?.name === "string" ? value.name : typeof error,
    message: typeof value?.message === "string" ? value.message : String(error),
    code: value?.code ?? null,
    details: value?.details ?? null,
    hint: value?.hint ?? null,
  };
}

export function calculationFailureRecord(stage: string, error: ErrorInfo) {
  return {
    status: "FAILED" as const,
    error_message: JSON.stringify({ stage, error }),
    calculation_metadata: {
      last_failed_stage: stage,
      last_error: error,
    },
  };
}


export type OwnedCalculation = {
  id: string;
  status: string;
  owner_user_id?: string | null;
  calculation_metadata?: Record<string, unknown> | null;
};

export function assertOwnedCalculation<T extends OwnedCalculation>(run: T | null): T {
  if (!run) throw new Error("calculation_id not found or not owned by current user");
  return run;
}

export function assertCalculableState(status: string): void {
  if (!["PENDING", "FAILED"].includes(status)) {
    throw new Error("calculation is not in a calculable state");
  }
}

export function calculatedRunRecord(input: {
  existingMetadata?: Record<string, unknown> | null;
  ayanamsaValue: number;
  utcTimestamp: string;
  julianDay: number;
  nodeMethod: "MEAN" | "TRUE";
  calculationTimestamp: string;
}) {
  return {
    ephemeris_version: "2.10.03",
    ayanamsa_value: input.ayanamsaValue,
    calculation_timestamp: input.calculationTimestamp,
    engine_version: "jyotisha-calculator/44; swisseph-wasm/0.1.5 browser-inline",
    status: "CALCULATED" as const,
    error_message: null,
    utc_timestamp: input.utcTimestamp,
    julian_day: input.julianDay,
    ephemeris_engine: "SWISS_EPHEMERIS",
    ayanamsa: "LAHIRI",
    zodiac_type: "SIDEREAL",
    house_system: "WHOLE_SIGN",
    node_method: input.nodeMethod,
    calculation_metadata: {
      ...(input.existingMetadata ?? {}),
      calculation_state: "CALCULATED",
      calculation_contract: "USER_CALCULATION_V1",
      engine_handoff: "jyotisha-calculator/44",
    },
  };
}


export const PERSISTENCE_STAGES = [
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
] as const;

export type PersistenceStage = typeof PERSISTENCE_STAGES[number];

export function isPersistenceStage(stage: string): stage is PersistenceStage {
  return (PERSISTENCE_STAGES as readonly string[]).includes(stage);
}

export function persistenceFailureRecord(stage: string, error: unknown) {
  if (!isPersistenceStage(stage)) throw new Error("UNKNOWN_PERSISTENCE_STAGE");
  return calculationFailureRecord(stage, errorInfo(error));
}
