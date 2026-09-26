export type TransitNodeMethod = "MEAN" | "TRUE";

export type TransitInput = {
  calculationId: string;
  transitDate: string;
  transitTime: string;
  timezone: string;
};

export type TransitEngineInput = TransitInput & {
  nodeMethod: string;
};

export function normalizeTransitNodeMethod(value: string): TransitNodeMethod {
  return value.trim().toUpperCase() === "TRUE" ? "TRUE" : "MEAN";
}

export function validateTransitInput(input: TransitInput):
  | { ok: true }
  | { ok: false; error: "missing_input" } {
  if (
    !input.calculationId ||
    !input.transitDate ||
    !input.transitTime ||
    !input.timezone
  ) {
    return { ok: false, error: "missing_input" };
  }

  return { ok: true };
}

export function buildNatalEngineRequest(calculationId: string) {
  return {
    mode: "natal" as const,
    calculation_id: calculationId,
  };
}

export function buildTransitEngineRequest(input: TransitEngineInput) {
  return {
    mode: "transit" as const,
    calculation_id: input.calculationId,
    transit_date: input.transitDate,
    transit_time: input.transitTime,
    timezone: input.timezone,
    node_method: normalizeTransitNodeMethod(input.nodeMethod),
  };
}
