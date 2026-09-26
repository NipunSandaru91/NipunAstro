export type PredictionTopic =
  | "CAREER"
  | "EDUCATION"
  | "RELATIONSHIP"
  | "FINANCE"
  | "HEALTH"
  | "SPIRITUALITY";

export type EvidencePolarity = "SUPPORTING" | "CONTRADICTING";

export type PredictionEvidence = {
  id: string;
  topic: PredictionTopic;
  polarity: EvidencePolarity;
  placement: {
    graha_id: number;
    rasi_id: number;
    bhava: number;
  };
  rule: {
    code: string;
    text_si: string;
  };
  source: {
    kind: "NATAL_D1" | "DASHA" | "TRANSIT";
    engine_version: string;
  };
};

type PlacementEvidenceInput = {
  id: string;
  topic: PredictionTopic;
  polarity: EvidencePolarity;
  grahaId: number;
  rasiId: number;
  bhava: number;
  ruleCode: string;
  ruleTextSi: string;
  source: {
    kind: PredictionEvidence["source"]["kind"];
    engineVersion: string;
  };
};

function assertIntegerRange(value: number, min: number, max: number, field: string) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer from ${min} to ${max}`);
  }
}

export function createPlacementEvidence(input: PlacementEvidenceInput): PredictionEvidence {
  assertIntegerRange(input.grahaId, 1, 9, "graha_id");
  assertIntegerRange(input.rasiId, 1, 12, "rasi_id");
  assertIntegerRange(input.bhava, 1, 12, "bhava");

  return {
    id: input.id,
    topic: input.topic,
    polarity: input.polarity,
    placement: {
      graha_id: input.grahaId,
      rasi_id: input.rasiId,
      bhava: input.bhava,
    },
    rule: {
      code: input.ruleCode,
      text_si: input.ruleTextSi,
    },
    source: {
      kind: input.source.kind,
      engine_version: input.source.engineVersion,
    },
  };
}
